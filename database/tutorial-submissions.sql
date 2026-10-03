-- 教程投稿扩展准备稿：先执行 schema.sql；未在真实 Supabase 项目执行。
-- 仅适用于新结构/本版本重复执行。已有同名表、桶或其他 Storage 策略必须先审查。
begin;

-- 内容只接受纯文本和受控对象路径，不存 HTML、外部 URL 或 base64 图片。
-- 草稿可未填完整；提交和审核快照必须满足最小长度与 2..12 步。
create or replace function public.eggcode_tutorial_content_valid(
  p_content jsonb, p_complete boolean, p_image_prefix text
) returns boolean
language plpgsql immutable security invoker set search_path = ''
as $$
declare
  k text;
  s jsonb;
  n integer;
  image_path text;
begin
  if p_content is null or p_complete is null or p_image_prefix is null
    or pg_catalog.jsonb_typeof(p_content) <> 'object'
    or pg_catalog.octet_length(p_content::text) > 200000 then return false; end if;
  if exists (select 1 from pg_catalog.jsonb_object_keys(p_content) as key(k)
    where key.k not in ('title','category','difficulty','summary','preparation','steps','validation','tips','testStatus'))
    then return false; end if;
  foreach k in array array['title','category','difficulty','summary','preparation','validation','tips','testStatus'] loop
    if pg_catalog.jsonb_typeof(p_content -> k) is distinct from 'string' then return false; end if;
  end loop;
  if (p_content ->> 'category') not in ('match3','progression','inventory','parkour','racing','survival','puzzle','simulation','other')
    or (p_content ->> 'difficulty') not in ('beginner','intermediate','advanced')
    or (p_content ->> 'testStatus') not in ('not-tested','author-tested')
    or pg_catalog.char_length(p_content ->> 'title') > 60
    or pg_catalog.char_length(p_content ->> 'summary') > 300
    or pg_catalog.char_length(p_content ->> 'preparation') > 1000
    or pg_catalog.char_length(p_content ->> 'validation') > 1500
    or pg_catalog.char_length(p_content ->> 'tips') > 1000 then return false; end if;
  if p_complete and (
    pg_catalog.char_length(pg_catalog.btrim(p_content ->> 'title')) < 5
    or pg_catalog.char_length(pg_catalog.btrim(p_content ->> 'summary')) < 20
    or pg_catalog.char_length(pg_catalog.btrim(p_content ->> 'preparation')) < 10
    or pg_catalog.char_length(pg_catalog.btrim(p_content ->> 'validation')) < 20
  ) then return false; end if;
  if pg_catalog.jsonb_typeof(p_content -> 'steps') is distinct from 'array' then return false; end if;
  n := pg_catalog.jsonb_array_length(p_content -> 'steps');
  if n > 12 or (p_complete and n < 2) then return false; end if;
  for s in select value from pg_catalog.jsonb_array_elements(p_content -> 'steps') loop
    if pg_catalog.jsonb_typeof(s) <> 'object' then return false; end if;
    if exists (select 1 from pg_catalog.jsonb_object_keys(s) as key(k)
      where key.k not in ('title','body','imagePath')) then return false; end if;
    if pg_catalog.jsonb_typeof(s -> 'title') is distinct from 'string'
      or pg_catalog.jsonb_typeof(s -> 'body') is distinct from 'string'
      or pg_catalog.char_length(s ->> 'title') > 80
      or pg_catalog.char_length(s ->> 'body') > 3000 then return false; end if;
    if p_complete and (pg_catalog.char_length(pg_catalog.btrim(s ->> 'title')) < 2
      or pg_catalog.char_length(pg_catalog.btrim(s ->> 'body')) < 20) then return false; end if;
    if s ? 'imagePath' and s -> 'imagePath' <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(s -> 'imagePath') <> 'string' then return false; end if;
      image_path := s ->> 'imagePath';
      if pg_catalog.left(image_path, pg_catalog.char_length(p_image_prefix)) <> p_image_prefix
        or pg_catalog.substr(image_path, pg_catalog.char_length(p_image_prefix) + 1)
          !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|webp)$'
        then return false; end if;
    end if;
  end loop;
  return true;
end;
$$;
revoke all on function public.eggcode_tutorial_content_valid(jsonb, boolean, text) from public, anon, authenticated;
grant execute on function public.eggcode_tutorial_content_valid(jsonb, boolean, text) to authenticated, service_role;

create table if not exists public.tutorial_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft','pending','published','rejected')),
  review_note text not null default '' check (char_length(review_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (public.eggcode_tutorial_content_valid(content, status in ('pending','published'), user_id::text || '/' || id::text || '/'))
);
create index if not exists tutorial_submissions_user_id_idx on public.tutorial_submissions(user_id);
drop trigger if exists eggcode_tutorial_updated_at on public.tutorial_submissions;
create trigger eggcode_tutorial_updated_at before insert or update on public.tutorial_submissions
  for each row execute function public.eggcode_set_updated_at();

-- 登录后可读的共享模型只含经审核快照，无私有 user_id、审核备注或草稿。
create table if not exists public.community_tutorials (
  id uuid primary key references public.tutorial_submissions(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 20),
  content jsonb not null,
  status text not null default 'published' check (status in ('published','withdrawn')),
  published_at timestamptz not null default now(),
  check (public.eggcode_tutorial_content_valid(content, true, id::text || '/'))
);
alter table public.tutorial_submissions enable row level security;
alter table public.community_tutorials enable row level security;
revoke all on table public.tutorial_submissions, public.community_tutorials from public, anon, authenticated;
revoke all (id,user_id,content,status,review_note,created_at,updated_at) on public.tutorial_submissions from public, anon, authenticated;
revoke all (id,author_name,content,status,published_at) on public.community_tutorials from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.tutorial_submissions to authenticated;
grant insert (user_id,content), update (content) on public.tutorial_submissions to authenticated;
grant delete on public.tutorial_submissions to authenticated;
grant select on public.community_tutorials to authenticated;
grant select, insert, update, delete on public.tutorial_submissions, public.community_tutorials to service_role;

drop policy if exists eggcode_tutorial_select_own on public.tutorial_submissions;
create policy eggcode_tutorial_select_own on public.tutorial_submissions for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists eggcode_tutorial_insert_own on public.tutorial_submissions;
create policy eggcode_tutorial_insert_own on public.tutorial_submissions for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'draft' and review_note = '');
drop policy if exists eggcode_tutorial_update_own_draft on public.tutorial_submissions;
create policy eggcode_tutorial_update_own_draft on public.tutorial_submissions for update to authenticated
  using ((select auth.uid()) = user_id and status in ('draft','rejected'))
  with check ((select auth.uid()) = user_id and status in ('draft','rejected'));
drop policy if exists eggcode_tutorial_delete_own_draft on public.tutorial_submissions;
create policy eggcode_tutorial_delete_own_draft on public.tutorial_submissions for delete to authenticated
  using ((select auth.uid()) = user_id and status in ('draft','rejected'));
drop policy if exists eggcode_community_read_published on public.community_tutorials;
create policy eggcode_community_read_published on public.community_tutorials for select to authenticated
  using ((select auth.uid()) is not null and status = 'published');

-- 浏览器只能提交自己的完整稿件；绝无可调用的发布或管理员 RPC。
create or replace function public.submit_tutorial(p_id uuid, p_expected_updated_at timestamptz)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  draft public.tutorial_submissions%rowtype;
  s jsonb;
begin
  if auth.uid() is null then raise exception '请先登录' using errcode = '42501'; end if;
  select * into draft from public.tutorial_submissions
    where id = p_id and user_id = auth.uid() for update;
  if not found or draft.status not in ('draft','rejected') then
    raise exception '稿件不存在或不可提交' using errcode = '42501';
  end if;
  if p_expected_updated_at is null or draft.updated_at <> p_expected_updated_at then
    raise exception '稿件已变更，请重新读取后确认' using errcode = '40001';
  end if;
  if not public.eggcode_tutorial_content_valid(draft.content, true, draft.user_id::text || '/' || draft.id::text || '/') then
    raise exception '请补齐标题、简介、准备说明、步骤和验证方法' using errcode = '22023';
  end if;
  for s in select value from pg_catalog.jsonb_array_elements(draft.content -> 'steps') loop
    if s ->> 'imagePath' is not null and not exists (select 1 from storage.objects
      where bucket_id = 'tutorial-drafts' and name = (s ->> 'imagePath')) then
      raise exception '步骤图片尚未上传' using errcode = '22023';
    end if;
  end loop;
  update public.tutorial_submissions set status = 'pending', review_note = '' where id = draft.id;
end;
$$;
revoke all on function public.submit_tutorial(uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.submit_tutorial(uuid, timestamptz) to authenticated;

-- 桶只新建、不覆盖陌生配置。单图 2 MiB；单篇 8 MiB/配额/实际图片解码须后端追加校验。
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values
  ('tutorial-drafts','tutorial-drafts',false,2097152,array['image/png','image/jpeg','image/webp']),
  ('tutorial-public','tutorial-public',false,2097152,array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
do $$
begin
  if (select count(*) from storage.buckets where id in ('tutorial-drafts','tutorial-public')
    and public = false and file_size_limit = 2097152
    and allowed_mime_types @> array['image/png','image/jpeg','image/webp']
    and allowed_mime_types <@ array['image/png','image/jpeg','image/webp']) <> 2 then
    raise exception '投稿图片桶已有不兼容配置；两桶都必须私有。请先按 README 人工审查并迁移旧公开桶，脚本不会覆盖已有配置';
  end if;
end;
$$;
-- 不修改 Storage 全局 grants；tutorial-public 只是沿用桶名，实际为私有审核副本桶。
-- 配图只有被 published 快照准确引用才能新读取；下架或孤立副本不放行。
drop policy if exists eggcode_tutorial_images_read_published on storage.objects;
create policy eggcode_tutorial_images_read_published on storage.objects for select to authenticated
  using (bucket_id = 'tutorial-public' and (select auth.uid()) is not null
    and pg_catalog.array_length(storage.foldername(name),1) = 1
    and storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|webp)$'
    and exists (select 1 from public.community_tutorials as tutorial
      where tutorial.status = 'published' and tutorial.id::text = (storage.foldername(name))[1]
        and exists (select 1 from pg_catalog.jsonb_array_elements(tutorial.content -> 'steps') as step(value)
          where step.value ->> 'imagePath' = storage.objects.name)));
drop policy if exists eggcode_tutorial_images_read_own on storage.objects;
create policy eggcode_tutorial_images_read_own on storage.objects for select to authenticated
  using (bucket_id = 'tutorial-drafts' and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (select 1 from public.tutorial_submissions as draft
      where draft.user_id = (select auth.uid()) and draft.id::text = (storage.foldername(name))[2]));
drop policy if exists eggcode_tutorial_images_insert_draft on storage.objects;
create policy eggcode_tutorial_images_insert_draft on storage.objects for insert to authenticated
  with check (bucket_id = 'tutorial-drafts' and (storage.foldername(name))[1] = (select auth.uid()::text)
    and pg_catalog.array_length(storage.foldername(name),1) = 2
    and storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|webp)$'
    and exists (select 1 from public.tutorial_submissions as draft where draft.user_id = (select auth.uid())
      and draft.id::text = (storage.foldername(name))[2] and draft.status in ('draft','rejected')));
drop policy if exists eggcode_tutorial_images_delete_draft on storage.objects;
create policy eggcode_tutorial_images_delete_draft on storage.objects for delete to authenticated
  using (bucket_id = 'tutorial-drafts' and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (select 1 from public.tutorial_submissions as draft where draft.user_id = (select auth.uid())
      and draft.id::text = (storage.foldername(name))[2] and draft.status in ('draft','rejected')));
-- 没有 UPDATE 策略：每次替换图片使用新 UUID，禁止覆盖待审核图片。
-- 其他 permissive 策略会与本策略 OR 合并，部署前必须审查已有 Storage 策略。
commit;
