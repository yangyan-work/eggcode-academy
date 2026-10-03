-- 蛋码学习站：GitHub Pages 静态教程 + Supabase Auth / Postgres。
-- 准备稿，尚未在真实数据库执行。适用于新项目或本文件创建的同版本结构。
-- 重复执行不删除用户数据；不为陌生账号自动创建资料，不建立 auth.users 触发器。
begin;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '' check (char_length(nickname) <= 20),
  last_lesson_id integer not null default 0 check (last_lesson_id between 0 and 144),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer not null check (lesson_id between 0 and 144),
  completed boolean not null default false,
  revision integer not null default 1 check (revision >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer not null check (lesson_id between 0 and 144),
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ponytail: 笔记暂按最后写入保存；需要多设备同时编辑时增加版本检查和冲突交互。
create table if not exists public.lesson_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer not null check (lesson_id between 0 and 144),
  content text not null default '' check (char_length(content) <= 2000),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id integer check (lesson_id between 0 and 144),
  kind text not null check (kind in ('content', 'diagram', 'other')),
  content text not null check (char_length(content) <= 1000 and char_length(btrim(content)) >= 10),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists feedback_user_id_idx on public.feedback(user_id);

-- 服务端生成修改时间，浏览器不控制更新时间。
create or replace function public.eggcode_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.eggcode_set_updated_at() from public, anon, authenticated;

drop trigger if exists eggcode_profiles_updated_at on public.profiles;
create trigger eggcode_profiles_updated_at before insert or update on public.profiles
  for each row execute function public.eggcode_set_updated_at();
drop trigger if exists eggcode_progress_updated_at on public.lesson_progress;
create trigger eggcode_progress_updated_at before insert or update on public.lesson_progress
  for each row execute function public.eggcode_set_updated_at();
drop trigger if exists eggcode_notes_updated_at on public.lesson_notes;
create trigger eggcode_notes_updated_at before insert or update on public.lesson_notes
  for each row execute function public.eggcode_set_updated_at();

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.favorites enable row level security;
alter table public.lesson_notes enable row level security;
alter table public.feedback enable row level security;

-- 撤销表权限及列权限；没有登录的 anon 不获得任何读写权限。
revoke all on table public.profiles, public.lesson_progress, public.favorites,
  public.lesson_notes, public.feedback from public, anon, authenticated;
revoke all (user_id, nickname, last_lesson_id, updated_at) on public.profiles from public, anon, authenticated;
revoke all (user_id, lesson_id, completed, revision, updated_at) on public.lesson_progress from public, anon, authenticated;
revoke all (user_id, lesson_id, created_at) on public.favorites from public, anon, authenticated;
revoke all (user_id, lesson_id, content, updated_at) on public.lesson_notes from public, anon, authenticated;
revoke all (id, user_id, lesson_id, kind, content, status, created_at) on public.feedback from public, anon, authenticated;

grant usage on schema public to authenticated, service_role;
grant select on table public.profiles, public.lesson_progress, public.favorites,
  public.lesson_notes, public.feedback to authenticated;
grant insert (user_id, nickname, last_lesson_id), update (nickname, last_lesson_id)
  on public.profiles to authenticated;
grant insert (user_id, lesson_id), delete on public.favorites to authenticated;
grant insert (user_id, lesson_id, content), update (content), delete on public.lesson_notes to authenticated;
grant insert (user_id, lesson_id, kind, content) on public.feedback to authenticated;
grant select, insert, update, delete on table public.profiles, public.lesson_progress,
  public.favorites, public.lesson_notes, public.feedback to service_role;

drop policy if exists eggcode_profiles_select_own on public.profiles;
create policy eggcode_profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists eggcode_profiles_insert_own on public.profiles;
create policy eggcode_profiles_insert_own on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists eggcode_profiles_update_own on public.profiles;
create policy eggcode_profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists eggcode_progress_select_own on public.lesson_progress;
create policy eggcode_progress_select_own on public.lesson_progress for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists eggcode_favorites_select_own on public.favorites;
create policy eggcode_favorites_select_own on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists eggcode_favorites_insert_own on public.favorites;
create policy eggcode_favorites_insert_own on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists eggcode_favorites_delete_own on public.favorites;
create policy eggcode_favorites_delete_own on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists eggcode_notes_select_own on public.lesson_notes;
create policy eggcode_notes_select_own on public.lesson_notes for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists eggcode_notes_insert_own on public.lesson_notes;
create policy eggcode_notes_insert_own on public.lesson_notes for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists eggcode_notes_update_own on public.lesson_notes;
create policy eggcode_notes_update_own on public.lesson_notes for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists eggcode_notes_delete_own on public.lesson_notes;
create policy eggcode_notes_delete_own on public.lesson_notes for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists eggcode_feedback_select_own on public.feedback;
create policy eggcode_feedback_select_own on public.feedback for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists eggcode_feedback_insert_own on public.feedback;
create policy eggcode_feedback_insert_own on public.feedback for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

-- 唯一的浏览器进度写入口；函数只操作当前登录用户，参数中没有 user_id。
-- SECURITY DEFINER 是为禁止直接表写入而使用；所有表名限定 schema，search_path 固定为空。
create or replace function public.save_lesson_progress(
  p_lesson_id integer,
  p_completed boolean,
  p_expected_revision integer
)
returns table (
  applied boolean,
  current_revision integer,
  current_completed boolean,
  current_updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_revision integer;
  v_completed boolean;
  v_updated_at timestamptz;
begin
  if v_user_id is null then
    raise exception '请先登录' using errcode = '42501';
  end if;
  if p_lesson_id is null or p_lesson_id < 0 or p_lesson_id > 144
     or p_completed is null or p_expected_revision is null
     or p_expected_revision < 0 or p_expected_revision >= 2147483647 then
    raise exception '课程编号、完成状态或预期版本无效' using errcode = '22023';
  end if;

  if p_expected_revision = 0 then
    insert into public.lesson_progress (user_id, lesson_id, completed, revision)
    values (v_user_id, p_lesson_id, p_completed, 1)
    on conflict (user_id, lesson_id) do nothing
    returning revision, completed, updated_at into v_revision, v_completed, v_updated_at;
  else
    update public.lesson_progress as progress
    set completed = p_completed, revision = progress.revision + 1
    where progress.user_id = v_user_id and progress.lesson_id = p_lesson_id
      and progress.revision = p_expected_revision
    returning progress.revision, progress.completed, progress.updated_at
      into v_revision, v_completed, v_updated_at;
  end if;

  if found then
    return query select true, v_revision, v_completed, v_updated_at;
    return;
  end if;

  select progress.revision, progress.completed, progress.updated_at
    into v_revision, v_completed, v_updated_at
    from public.lesson_progress as progress
    where progress.user_id = v_user_id and progress.lesson_id = p_lesson_id;
  return query select false, v_revision, v_completed, v_updated_at;
end;
$$;

revoke all on function public.save_lesson_progress(integer, boolean, integer)
  from public, anon, authenticated;
grant execute on function public.save_lesson_progress(integer, boolean, integer) to authenticated;

commit;
