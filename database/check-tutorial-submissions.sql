-- 最小真实数据库自检，当前未执行。先执行 schema.sql、tutorial-submissions.sql。
-- 在 SQL Editor 替换 A/B UUID：必须是两个无投稿数据的新测试 Auth 用户。
-- 完整运行后回滚所有测试行；不写 storage.objects，不模拟真实文件上传成功。
begin;
select set_config('eggcode.tutorial_test_a','待填真实A用户UUID',true);
select set_config('eggcode.tutorial_test_b','待填真实B用户UUID',true);
select set_config('eggcode.tutorial_test_id',gen_random_uuid()::text,true);
select set_config('eggcode.tutorial_test_content',jsonb_build_object(
  'title','测试教程标题', 'category','puzzle', 'difficulty','beginner',
  'summary',repeat('测',20), 'preparation',repeat('备',10),
  'steps',jsonb_build_array(
    jsonb_build_object('title','第一步','body',repeat('步',20)),
    jsonb_build_object('title','第二步','body',repeat('步',20))),
  'validation',repeat('验',20), 'tips','', 'testStatus','not-tested')::text,true);

do $$
declare
  a uuid := current_setting('eggcode.tutorial_test_a')::uuid;
  b uuid := current_setting('eggcode.tutorial_test_b')::uuid;
  c jsonb := current_setting('eggcode.tutorial_test_content')::jsonb;
begin
  if a = b or (select count(*) from auth.users where id in (a,b)) <> 2
    or exists (select 1 from public.tutorial_submissions where user_id in (a,b)) then
    raise exception '需要两个不同且无投稿数据的新测试 Auth 用户';
  end if;
  if has_any_column_privilege('anon','public.tutorial_submissions','SELECT')
    or has_any_column_privilege('anon','public.community_tutorials','SELECT')
    or has_column_privilege('authenticated','public.tutorial_submissions','status','UPDATE')
    or has_column_privilege('authenticated','public.tutorial_submissions','review_note','UPDATE')
    or has_any_column_privilege('authenticated','public.community_tutorials','INSERT')
    or has_any_column_privilege('authenticated','public.community_tutorials','UPDATE')
    or has_table_privilege('authenticated','public.community_tutorials','DELETE')
    or has_function_privilege('anon','public.submit_tutorial(uuid,timestamptz)','EXECUTE') then
    raise exception '投稿或发布权限过大';
  end if;
  if not has_table_privilege('authenticated','public.community_tutorials','SELECT')
    or (select count(*) from storage.buckets where id in ('tutorial-drafts','tutorial-public') and public = false) <> 2 then
    raise exception '登录读取权限或私有图片桶配置不正确';
  end if;
  if not exists (select 1 from pg_catalog.pg_policies where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'eggcode_tutorial_images_read_published' and cmd = 'SELECT' and roles = array['authenticated']::name[]) then
    raise exception '缺少仅登录角色可用的审核配图读取策略';
  end if;
  if not public.eggcode_tutorial_content_valid(c,true,a::text || '/稿件/')
    or public.eggcode_tutorial_content_valid(c - 'summary',false,a::text || '/稿件/')
    or public.eggcode_tutorial_content_valid(jsonb_set(c,'{steps}', '[]'),true,a::text || '/稿件/')
    or public.eggcode_tutorial_content_valid(jsonb_set(c,'{title}',to_jsonb(repeat('字',61))),false,a::text || '/稿件/')
    or public.eggcode_tutorial_content_valid(jsonb_set(c,'{testStatus}','"official-tested"'),true,a::text || '/稿件/')
    or public.eggcode_tutorial_content_valid(jsonb_set(c,'{steps,0,imagePath}','"https://example.com/x.png"'),false,a::text || '/稿件/') then
    raise exception '内容验证失效';
  end if;
end;
$$;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('eggcode.tutorial_test_a'),'role','authenticated')::text,true);
set local role authenticated;
do $$
declare
  v_id uuid;
  v_time timestamptz;
  n bigint;
begin
  insert into public.tutorial_submissions (user_id,content)
    values (auth.uid(),current_setting('eggcode.tutorial_test_content')::jsonb)
    returning id,updated_at into v_id,v_time;
  perform set_config('eggcode.tutorial_test_id',v_id::text,true);
  begin
    insert into public.tutorial_submissions (user_id,content)
      values (current_setting('eggcode.tutorial_test_b')::uuid,current_setting('eggcode.tutorial_test_content')::jsonb);
    raise exception '伪造作者应拒绝';
  exception when insufficient_privilege then null; end;
  begin
    update public.tutorial_submissions set status = 'published' where id = v_id;
    raise exception '作者自行发布应拒绝';
  exception when insufficient_privilege then null; end;
  begin
    perform public.submit_tutorial(v_id,v_time - interval '1 second');
    raise exception '旧稿件时间应拒绝';
  exception when serialization_failure then null; end;
  perform public.submit_tutorial(v_id,v_time);
  if not exists (select 1 from public.tutorial_submissions where id = v_id and status = 'pending') then
    raise exception '有效投稿没有进入 pending';
  end if;
  update public.tutorial_submissions set content = jsonb_set(content,'{title}','"绕过审核改内容"') where id = v_id;
  get diagnostics n = row_count;
  if n <> 0 then raise exception '待审核内容被作者修改'; end if;
  delete from public.tutorial_submissions where id = v_id;
  get diagnostics n = row_count;
  if n <> 0 then raise exception '待审核稿件被作者删除'; end if;
  begin
    insert into public.community_tutorials (id,author_name,content)
      values (v_id,'测试作者',current_setting('eggcode.tutorial_test_content')::jsonb);
    raise exception '作者绕过审核新建公开快照应拒绝';
  exception when insufficient_privilege then null; end;
end;
$$;

reset role;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('eggcode.tutorial_test_b'),'role','authenticated')::text,true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.tutorial_submissions where id = current_setting('eggcode.tutorial_test_id')::uuid) then
    raise exception 'B 读取了 A 的投稿';
  end if;
  begin
    perform public.submit_tutorial(current_setting('eggcode.tutorial_test_id')::uuid,now());
    raise exception 'B 提交了 A 的稿件';
  exception when insufficient_privilege then null; end;
end;
$$;

-- 以下由 SQL Editor 可信测试身份模拟无图片的审核快照，不是上线审核实现。
-- 不写 Storage 元数据；配图的真实下载/签名和拒绝行为另用 Storage API 验收。
reset role;
insert into public.community_tutorials (id,author_name,content)
  select id,'测试作者',content from public.tutorial_submissions
  where id = current_setting('eggcode.tutorial_test_id')::uuid;
update public.tutorial_submissions set status = 'published' where id = current_setting('eggcode.tutorial_test_id')::uuid;
set local role authenticated;
do $$
declare
  actor text;
begin
  foreach actor in array array[current_setting('eggcode.tutorial_test_a'),current_setting('eggcode.tutorial_test_b')] loop
    perform set_config('request.jwt.claims',json_build_object('sub',actor,'role','authenticated')::text,true);
    if not exists (select 1 from public.community_tutorials where id = current_setting('eggcode.tutorial_test_id')::uuid) then
      raise exception '已登录 A/B 无法读取 published 快照：%',actor;
    end if;
  end loop;
end;
$$;
reset role;
select set_config('request.jwt.claims','{"role":"anon"}',true);
set local role anon;
do $$
begin
  begin
    perform 1 from public.community_tutorials where id = current_setting('eggcode.tutorial_test_id')::uuid;
    raise exception '匿名访客应无法读取 published 快照';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.tutorial_submissions;
    raise exception '匿名访客应无法读取私有稿件';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;
update public.community_tutorials set status = 'withdrawn' where id = current_setting('eggcode.tutorial_test_id')::uuid;
set local role authenticated;
do $$
declare
  actor text;
begin
  foreach actor in array array[current_setting('eggcode.tutorial_test_a'),current_setting('eggcode.tutorial_test_b')] loop
    perform set_config('request.jwt.claims',json_build_object('sub',actor,'role','authenticated')::text,true);
    if exists (select 1 from public.community_tutorials where id = current_setting('eggcode.tutorial_test_id')::uuid) then
      raise exception '已登录 A/B 读取了 withdrawn 快照：%',actor;
    end if;
  end loop;
end;
$$;
reset role;
rollback;
