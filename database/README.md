# 蛋码学习站数据库准备稿

这份准备稿保留 GitHub Pages 托管网站，未来由 Supabase Auth 管理登录，Postgres 保存个人资料、课程进度、收藏、笔记和反馈。第一版教程正文、示例与图解继续作为静态文件发布，课程编号固定为 `0..144`，不要用展示顺序重新编号。

当前没有创建 Supabase 项目、真实账号或线上数据库，没有执行本目录 SQL，也没有将预览网站接入真实服务。已补可配置的官方 SDK 登录、学习记录及图文上传模块，`site/cloud-config.js` 保持留空，本机体验不会联网或冒充云端成功。正式接入方法和接口见 [CLOUD-INTEGRATION.md](CLOUD-INTEGRATION.md)。只有完成真实接入及两设备实测后，才能宣称支持跨设备同步。

## 准备文件

| 文件 | 用途 |
| --- | --- |
| `schema.sql` | 五张表、外键、范围/长度约束、RLS、最小权限与进度版本检查 RPC |
| `config.example.js` | 浏览器配置模板；项目 URL 和 publishable key 均留空 |
| `README.md` | 后续执行步骤、写入约定、权限验收与备份说明 |
| `tutorial-submissions.sql` | 可选教程投稿扩展：私有稿件、登录后可读的审核快照、投稿 RPC 与私有图片桶策略 |
| `check-tutorial-submissions.sql` | 投稿扩展的两账号/匿名访问最小 SQL 自检，当前未执行 |

## 后续实际接入步骤

1. 在用户决定正式接入后，创建目标 Supabase 项目并保存项目归属、区域和恢复资料；当前步骤没有创建项目或启用付费功能。
2. 在该项目的 SQL Editor 中完整执行 `schema.sql`，确认事务成功。脚本针对新项目或本文件已创建的同版本结构，可重复执行，不删除已有行。`IF NOT EXISTS` 不会升级不兼容旧表；已有同名表或其他策略的项目必须先审查，不能直接当作通用升级脚本。
3. 在 Authentication 的 URL Configuration 中填写真实 GitHub Pages HTTPS 地址：`Site URL = 待填真实网站地址`，`Redirect URLs = 待填实际登录/邮箱确认/重置密码回跳地址`。生产环境用精确地址，包含 GitHub Pages 仓库路径和实际存在的页面；前端还需处理回跳会话与错误。参见 [官方回跳说明](https://supabase.com/docs/guides/auth/redirect-urls)。
4. 面向普通用户开放邮箱注册、确认邮件或密码重置前，配置自有 SMTP 并验证邮件送达。内置邮件服务只适合受限测试，不是正式邮件服务。参见 [官方 SMTP 说明](https://supabase.com/docs/guides/auth/auth-smtp)。第一版不用匿名 Auth 账号；不要把匿名访问和已登录用户混为一谈。
5. 从目标项目的 Connect / API Keys 页面取得真实 Project URL 和浏览器可用的 publishable key，填写 `site/cloud-config.js` 中的 `url`、`publishableKey`（`config.example.js` 仅为模板）。正式客户端按需加载官方 SDK；只填配置不代表 SQL、邮件和权限已经验收。浏览器、GitHub 仓库和静态网页都不能放数据库密码、secret key 或 `service_role` key。参见 [官方 API key 说明](https://supabase.com/docs/guides/getting-started/api-keys)。
6. 完成真正的登录、退出、回跳、加载和保存；退出与切换账号时清空账号相关缓存。未登录的本地学习数据不能未经用户选择便上传到新账号。按下文执行数据库自检，再用两个真实账号和两台设备验证。

## 表与权限约定

| 表 | 登录用户可用操作 | 限制 |
| --- | --- | --- |
| `profiles` | 读取、新建、修改自己的昵称和上次课程 | 昵称最多 20 字；上次课程 `0..144`；注册后由客户端显式新建自己的资料 |
| `lesson_progress` | 读取自己的记录；通过 RPC 保存 | 课程 `0..144`；直接表写入被撤销；完成/取消完成都保留版本 |
| `favorites` | 读取、新建、删除自己的收藏 | 每人每课只有一条；课程 `0..144` |
| `lesson_notes` | 读取、新建、修改、删除自己的笔记 | 每人每课只有一条；正文最多 2000 字；课程 `0..144` |
| `feedback` | 读取自己的反馈、提交新反馈 | 正文最多 1000 字，去两端空格后至少 10 字；类型仅 `content/diagram/other`；课程可空或 `0..144` |

五张表均开启 RLS；`anon` 没有表/列读写权限，`authenticated` 只能访问 `auth.uid()` 对应的数据。资料、笔记、收藏和反馈的 `user_id` 来自当前会话。`updated_at` 由数据库触发器生成；收藏和反馈的时间、反馈 ID/状态由默认值生成。

前端提交反馈时只能提供 `user_id`、`lesson_id`、`kind`、`content`；默认状态为 `pending`，没有修改或删除反馈的客户端权限。未来由可信后端使用 `service_role` 处理 `reviewed/resolved` 状态，并单独验证管理员身份。不能把管理员身份放进用户可修改的 `user_metadata`，也不能只靠前端判断管理员。参见 [官方 RLS 文档](https://supabase.com/docs/guides/database/postgres/row-level-security)及[数据安全文档](https://supabase.com/docs/guides/database/secure-data)。

资料和笔记的新建使用 `insert`，已有记录只 `update` 可编辑列；不要使用会同时更新 `user_id/lesson_id` 的默认 `upsert`。这些身份与键列没有客户端更新权限。

这里不建立注册自动触发器、不公开个人资料、不接收费功能。删除真实 Auth 账号会由外键级联删除该账号的五类业务数据，应由未来受保护的账号删除流程处理。

## 学习进度保存与冲突

正式客户端调用 `save_lesson_progress`，不能对 `lesson_progress` 使用直接 `insert/update/upsert/delete`。函数从 `auth.uid()` 取身份，没有可伪造的用户参数；所用 `SECURITY DEFINER` 只为提供受限写入口，搜索路径固定为空，并限制为登录角色执行。参见 [官方数据库函数说明](https://supabase.com/docs/guides/database/functions)。

```js
// 正式接入后的调用示例；本准备稿没有实例化真实 supabase 客户端。
const { data, error } = await supabase.rpc("save_lesson_progress", {
  p_lesson_id: 12,
  p_completed: true,
  p_expected_revision: 0 // 首次没有服务端记录时为 0；之后使用上次读取的 revision。
});
if (error) throw error;
const result = data[0];
// applied=false：冲突；展示 current_*，保留本地修改并让用户选择，再重新读取。
// 不能把 expected_revision 换成最新值后无提示重试旧离线修改。
```

- 首次 `expected=0` 只插入缺失记录，成功后 `revision=1`；已有记录返回 `applied=false`。
- 后续写入仅在现有 `revision=expected` 时成功，版本加一；同一版本的并发写最多一条成功。
- 返回一行：`applied`、`current_revision`、`current_completed`、`current_updated_at`。冲突不改数据；没有记录且传了非零版本时返回 `false` 和空当前值。
- 客户端根据返回值确认保存成功。HTTP 请求成功不等于变更成功；网络失败或超时后也应重新读取，不能猜测。
- 取消完成应保存 `completed=false`，不删除进度行。整数版本接近 `2147483647` 时需要受控迁移到更大类型，函数会拒绝溢出。

笔记与上次浏览课程目前采用最后一次写入的值；进度 RPC 的版本保护只覆盖完成状态。若要支持多设备同时编辑同一篇笔记且保留双方修改，应为笔记增加版本检查和冲突交互。当前准备稿不宣称已经实现该行为。

## 可运行的数据库自检（尚未执行）

下列脚本是本稿留下的最小数据库检查。以后执行完 `schema.sql`，创建两个全新测试 Auth 账号 A/B，在 SQL Editor 里把两处占位值替换成它们的真实 UUID，完整运行。它通过事务模拟 JWT 身份，最后回滚所有测试业务数据；不能在账号已有业务记录时运行。所有断言通过才是数据库检查通过，当前没有运行结果。

```sql
begin;
select set_config('eggcode.test_a', '待填真实A用户UUID', true);
select set_config('eggcode.test_b', '待填真实B用户UUID', true);

do $$
declare
  a uuid := current_setting('eggcode.test_a')::uuid;
  b uuid := current_setting('eggcode.test_b')::uuid;
  t text;
  n bigint;
begin
  if a = b or (select count(*) from auth.users where id in (a, b)) <> 2 then
    raise exception '需要两个不同的真实测试 Auth 用户';
  end if;
  foreach t in array array['profiles', 'lesson_progress', 'favorites', 'lesson_notes', 'feedback'] loop
    execute format('select count(*) from public.%I where user_id in ($1, $2)', t) into n using a, b;
    if n <> 0 then raise exception '请使用没有业务数据的新测试账号：%', t; end if;
    if has_table_privilege('anon', 'public.' || t, 'SELECT')
      or has_any_column_privilege('anon', 'public.' || t, 'SELECT')
      or has_any_column_privilege('anon', 'public.' || t, 'INSERT')
      or has_any_column_privilege('anon', 'public.' || t, 'UPDATE')
      or has_table_privilege('anon', 'public.' || t, 'DELETE') then
      raise exception 'anon 权限过大：%', t;
    end if;
  end loop;
  if has_function_privilege('anon', 'public.save_lesson_progress(integer,boolean,integer)', 'EXECUTE') then
    raise exception 'anon 不能执行进度 RPC';
  end if;
end;
$$;

select set_config('request.jwt.claims', json_build_object('sub', current_setting('eggcode.test_a'), 'role', 'authenticated')::text, true);
set local role authenticated;
insert into public.profiles (user_id, nickname, last_lesson_id) values (auth.uid(), '测试A', 144);
insert into public.favorites (user_id, lesson_id) values (auth.uid(), 144);
insert into public.lesson_notes (user_id, lesson_id, content) values (auth.uid(), 144, '测试A笔记');
insert into public.feedback (user_id, lesson_id, kind, content) values (auth.uid(), null, 'other', '数据库权限检查反馈内容');

do $$
declare
  r record;
begin
  select * into r from public.save_lesson_progress(144, true, 0);
  if r.applied is distinct from true or r.current_revision is distinct from 1 or r.current_completed is distinct from true then raise exception '首次保存失败'; end if;
  select * into r from public.save_lesson_progress(144, false, 0);
  if r.applied is distinct from false or r.current_revision is distinct from 1 or r.current_completed is distinct from true then raise exception '首次并发冲突保护失败'; end if;
  select * into r from public.save_lesson_progress(144, false, 1);
  if r.applied is distinct from true or r.current_revision is distinct from 2 or r.current_completed is distinct from false then raise exception '取消完成失败'; end if;
  select * into r from public.save_lesson_progress(144, true, 1);
  if r.applied is distinct from false or r.current_revision is distinct from 2 or r.current_completed is distinct from false then raise exception '旧离线版本覆盖了新记录'; end if;
  begin
    insert into public.lesson_progress (user_id, lesson_id, completed) values (auth.uid(), 143, true);
    raise exception '直接写进度应拒绝';
  exception when insufficient_privilege then null; end;
  begin
    update public.feedback set status = 'resolved' where user_id = auth.uid();
    raise exception '前端修改反馈状态应拒绝';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.lesson_notes (user_id, lesson_id, content) values (current_setting('eggcode.test_b')::uuid, 144, '越权写入');
    raise exception '伪造他人 user_id 应拒绝';
  exception when insufficient_privilege then null; end;
  begin
    perform public.save_lesson_progress(145, true, 0);
    raise exception '课程 145 应拒绝';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.save_lesson_progress(-1, true, 0);
    raise exception '负课程编号应拒绝';
  exception when invalid_parameter_value then null; end;
  begin
    update public.lesson_notes set content = repeat('字', 2001) where user_id = auth.uid();
    raise exception '超过 2000 字笔记应拒绝';
  exception when check_violation then null; end;
end;
$$;

reset role;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('eggcode.test_b'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare
  t text;
  n bigint;
  r record;
begin
  foreach t in array array['profiles', 'lesson_progress', 'favorites', 'lesson_notes', 'feedback'] loop
    execute format('select count(*) from public.%I where user_id = $1', t) into n using current_setting('eggcode.test_a')::uuid;
    if n <> 0 then raise exception 'B 能读取 A 的数据：%', t; end if;
  end loop;
  update public.lesson_notes set content = 'B修改A' where user_id = current_setting('eggcode.test_a')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'B 修改了 A 的笔记'; end if;
  delete from public.favorites where user_id = current_setting('eggcode.test_a')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'B 删除了 A 的收藏'; end if;
  select * into r from public.save_lesson_progress(144, true, 0);
  if r.applied is distinct from true or r.current_revision is distinct from 1 then raise exception 'B 的进度不独立'; end if;
end;
$$;

reset role;
do $$
begin
  if not exists (select 1 from public.lesson_progress where user_id = current_setting('eggcode.test_a')::uuid and lesson_id = 144 and revision = 2 and not completed)
    or not exists (select 1 from public.lesson_notes where user_id = current_setting('eggcode.test_a')::uuid and content = '测试A笔记')
    or not exists (select 1 from public.favorites where user_id = current_setting('eggcode.test_a')::uuid and lesson_id = 144)
    or not exists (select 1 from public.feedback where user_id = current_setting('eggcode.test_a')::uuid and status = 'pending') then
    raise exception 'A 的数据被越权或错误写入';
  end if;
end;
$$;
rollback;
```

SQL Editor 自检模拟数据库身份，不代替真实浏览器访问测试。正式接入后逐项记录结果：

- [ ] 同一脚本重复执行两次，已有数据与权限均正确。
- [ ] 未登录时用 publishable key 请求五张表和进度 RPC，被拒绝且没有数据泄露。
- [ ] A 可读写自己的资料/进度/收藏/笔记并提交反馈；B 对应操作独立。
- [ ] A 的浏览器尝试伪造 B 的 `user_id`，逐表验证读取为空、写入拒绝、修改/删除不影响 B。
- [ ] 前端不能直接改进度、版本、更新时间；不能自选反馈状态，不能修改/删除反馈。
- [ ] 昵称 21 字、笔记 2001 字、反馈不足 10 字/超过 1000 字、非法类型/课程编号被数据库拒绝。
- [ ] 同账号两设备读取同版本并保存，只有一次成功；断网旧版本恢复后收到冲突，服务端新状态保留。
- [ ] 设备 1 保存后，设备 2 重新加载取得服务端值；退出与切换账号不会混入旧账号数据。
- [ ] 注册、邮件确认、登录、重置密码、会话过期与 GitHub Pages 路径回跳正常。
- [ ] 可信后端处理反馈状态，前端仍不能绕过；用测试备份恢复并确认权限。

## 免费计划、备份与恢复

正式建项目前再次核验 [Supabase 官方计费说明](https://supabase.com/docs/guides/platform/billing-on-supabase)、[数据库容量说明](https://supabase.com/docs/guides/platform/database-size)和[上线说明](https://supabase.com/docs/guides/deployment/going-into-prod)，确认项目数、数据库容量、流量、Auth/邮件限额、闲置暂停及备份条件。套餐与配额会变化，本稿不把免费服务承诺为无限或永久在线，也不启用订阅。

正式保存用户数据后，按恢复需求定期导出结构与数据、保存到受保护的异地位置并演练恢复。官方建议免费项目使用 CLI `db dump` 做独立备份；不能把含个人笔记、邮箱或反馈的备份放在公开 GitHub Pages 仓库。导出范围需核对 Auth、角色、策略及其他项目设置，不能把本文件当作数据备份。参见 [官方备份文档](https://supabase.com/docs/guides/platform/backups)和[备份/恢复步骤](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)。

本次只检查了本地准备文件及官方资料；SQL 语法执行、RLS 行为、Auth 回跳、SMTP 送达、并发、跨设备和恢复均等待真实测试环境验证。

## 用户教程投稿：本次预览与未来接入

本机 `contribute.html` 在当前浏览器保存图文草稿、预览与导出；“本机提交演示”仍未发送到真实网站或审核人员。IndexedDB 内容属于当前浏览器的体验数据，不具备真实多用户身份隔离。已补可配置的云上传客户端，默认配置仍留空。下面 SQL 是正式登录和数据库接入后的准备结构，尚未执行；真实云上传、后端图片检查与审核发布流程尚未完成验收，不能将本机演示当作真实管理员发布。

先在目标测试项目执行 `schema.sql`，再执行可选的 `tutorial-submissions.sql`。它不会改变原来 145 课的静态课程编号，也不会自动公开用户稿件。已有同名表、Storage 桶或其他策略的项目，必须先审查；多个 permissive RLS 策略按 OR 合并，原来的宽松策略可能放宽本稿限制。[官方 RLS 文档](https://supabase.com/docs/guides/database/postgres/row-level-security)

| 结构 | 正式客户端权限 | 读取范围 |
| --- | --- | --- |
| `tutorial_submissions` | 作者读取自己的稿件；新建 `draft`；仅修改/删除自己的 `draft/rejected` 内容 | 私有，访客与其他作者不能读取 |
| `submit_tutorial(id, expected_updated_at)` | 仅当前作者将完整的 `draft/rejected` 提交为 `pending` | 仍私有；正文与图片引用完整校验，旧更新时间拒绝 |
| `community_tutorials` | 已登录用户只有读取权限；匿名角色无表/列读取权限 | 只有 `published` 审核快照；不含 Auth UUID 或审核备注；`withdrawn` 对已登录用户同样不可读 |

“登录后才能用”在数据库层也生效：前端门禁不能代替 RLS。`anon` 不获私有稿件或审核快照的读取权限；快照的 SELECT 策略只面向 `authenticated`，且要求有效 `auth.uid()`。浏览器持有公开 publishable key 并不等于已登录。下面名为 `tutorial-public` 的桶也为私有桶，桶名保留用于兼容，不能据此使用永久公开下载 URL。

浏览器对身份、状态、审核备注和系统时间均没有更新权限，不能自选 `published`。`pending/published` 的正文也不能由作者修改；已发布后要修改内容，应复制为新稿并重新审核。数据库暂不提供作者撤回待审稿的接口，避免把尚未实现的服务端流程冒充已完成。

共享表是审核通过时的内容快照，与作者草稿分离。未来可信后端在服务端核验审核人员身份，锁定待审行并复核版本，校验所有文字、步骤和图片，复制审核图片成功后，在一个数据库事务里写入共享快照并更新私有状态。退回只更新私有 `status/review_note`。普通作者的 `user_metadata`、昵称或前端开关均不能用来授予管理员权限；`service_role` key 只可由可信服务端持有。真实审核发布尚未上线或验证，执行 SQL 不等于完成发布功能。

### 内容字段与图片引用

`content` 是 JSONB 纯文本对象，固定包含 `title/category/difficulty/summary/preparation/steps/validation/tips/testStatus`。草稿允许空标题/说明和少于两步，仍检查类型与上限。正式提交时：标题 5–60 字、简介 20–300 字、准备说明 10–1000 字、步骤 2–12 个、每步标题 2–80 字/正文 20–3000 字、验证方法 20–1500 字、补充提示最多 1000 字。`testStatus` 仅 `not-tested/author-tested`，后者始终是作者自述，不能显示成官方或编辑器已经验证。

玩法分类仅 `match3/progression/inventory/parkour/racing/survival/puzzle/simulation/other`，难度仅 `beginner/intermediate/advanced`。客户端显示时按普通文本转义，不能把用户文字插入 `innerHTML`。本稿不接受用户 HTML、脚本、SVG、外部图片 URL 或 base64 入库。

云端每步的图片字段为可选 `imagePath`（字符串或 null），不要把本机导出文件内的图片对象直接写进 JSONB。正式客户端先新建稿件取得服务端 UUID，再将真实图片上传为 `tutorial-drafts/<当前Auth用户UUID>/<稿件UUID>/<新随机UUID>.png|jpg|jpeg|webp`，确认 Storage API 成功后将对象路径保存到对应步骤。更新草稿只能写 `content`，不要用会更新 `id/user_id/status` 的默认 `upsert`。保存失败时保留本机副本；提交 RPC 使用最近读取的 `updated_at`，冲突时重新读取并让作者确认，不自动覆盖。草稿文本目前采用最后一次写入；同时编辑完整草稿的版本保护仍需以后补充。

### 草稿图片与审核配图分开

扩展创建两个桶，单图上限均为 2 MiB，仅 PNG/JPEG/WebP：

- `tutorial-drafts` 是私有桶。作者只能读取自己稿件目录的图片；仅在自己的 `draft/rejected` 稿件中上传和删除。没有作者 UPDATE 权限，替换图片使用新 UUID 和 `upsert:false`，再更新稿件引用。删除草稿前先清理其图片，失败时保留清理任务供后端重试。
- `tutorial-public` 是私有审核配图桶，仅可信后端可写入，普通作者没有写入、覆盖或删除策略。审核后的副本路径为 `<稿件UUID>/<新随机UUID>.<扩展名>`。已登录用户只有在 `published` 快照某一步的 `imagePath` 与对象完整路径相同、目录和 UUID 文件名合法时才能读取；只知道对象名、同目录的未引用对象或 `withdrawn` 快照均不能取得新的读取授权。共享快照只保存对象路径，不保存外部 URL 或签名 URL。

两个桶都需要授权下载或短期签名 URL；未登录访客不能通过公开桶 URL 读取。签名 URL 持有人在有效期内仍可读取，下架时 RLS 会拒绝新的授权，但不能立即收回之前已签发的 URL 或已下载图片。正式阅读客户端应优先使用授权下载；如需签名预览，应使用短有效期，并在下架流程删除对象及核验缓存处理。[官方 Storage 桶说明](https://supabase.com/docs/guides/storage/buckets/fundamentals)

脚本仅新建缺失的桶，遇到已有桶使用 `ON CONFLICT DO NOTHING`，不会自动把旧公开桶改成私有。`public=true`、单图大小或 MIME 配置不符都会报错并回滚整份扩展，避免静默覆盖已有配置。迁移时先备份对象与引用、审查现有表权限和所有 Storage 策略，再由可信管理员通过 Dashboard/Storage 管理 API 将两桶设置为私有，校正单图 2 MiB 与 PNG/JPEG/WebP 限制；移除放宽本稿约束的旧匿名读取/作者写审核桶策略后，重新完整执行扩展。原来已对外发布的对象还需核验旧 URL 与 CDN 缓存；必要时通过 Storage API 移除旧对象，用新随机 UUID 重建私有副本并更新快照引用。不能把改桶配置当作已经收回旧下载或缓存。

桶配置检查单图大小和声明的 MIME，扩展名/路径策略限制写入位置；它们不能代替可信服务端检查实际文件。正式开放上传前，还必须在后端解码真实图片，拒绝伪造 MIME、无效图片和异常尺寸，移除敏感元数据，检查单篇总图不超过 8 MiB，并执行作者容量/上传频率限制及未引用文件清理。当前 SQL 只校验路径和引用存在，不把这几项称为已经实现。[官方上传限制](https://supabase.com/docs/guides/storage/buckets/creating-buckets)、[官方 Storage 权限说明](https://supabase.com/docs/guides/storage/security/access-control)

正式下架应先把共享正文改为 `withdrawn`，阻止新的正文及审核配图授权，再通过 Storage API 删除对应审核副本并确认签名有效期与缓存处理；已下载的图片无法远程收回。账号/草稿 SQL 级联删除不会删除文件内容，禁止直接 DELETE `storage.objects`。后端应先记录需要清理的路径，再调用 Storage `remove` 并重试失败项，最后删除行或 Auth 账号；定期检查孤立对象。备份应包括草稿与审核文件及其对象映射，数据库导出不包含图片文件。[官方文件删除说明](https://supabase.com/docs/guides/storage/management/delete-objects)

### 最小验收（尚未执行）

`check-tutorial-submissions.sql` 是可运行的最小 SQL 检查：替换为两个无投稿记录的真实测试 Auth UUID，完整运行；最后回滚测试行。检查内容类型/长度、作者隔离、禁止自行发布、投稿校验、待审锁定、匿名读取拒绝、A/B 已登录读取 `published` 与下架隐藏，以及两桶私有配置和读取策略角色。它不向 Storage 写假对象，不代替真实图片 API 测试，也不证明审核后端已完成。当前只做了静态结构检查，尚未执行此 SQL。

正式开放投稿前还需在真实环境逐项验证：

- [ ] 作者 A 的稿件及私有图片不能由 B 或未登录访客读取、编辑、删除或提交；篡改路径和作者 UUID 被拒绝。
- [ ] A 只能在自己的可编辑稿件目录上传，不能覆盖原图片、写审核配图桶或修改已提交稿件的图片；其他 Storage 策略没有放宽限制。
- [ ] 真 PNG/JPEG/WebP 上传和授权预览成功；SVG、伪造 MIME、超 2 MiB 单图、超 8 MiB 单篇与容量/频率超限被可信服务拒绝。
- [ ] 作者只能提交 `pending`，不能写状态/审核备注/公开快照；重复提交、旧更新时间和缺失图片均得到可解释错误。
- [ ] 审核管理员由服务端可信身份验证；审核复制/数据库事务失败不产生可读的半成品，未引用副本随后清理。
- [ ] 未登录不能读取审核正文或配图；A/B 登录后能读同一 `published` 快照与准确引用的图片，同目录未引用对象拒绝；`withdrawn` 后 A/B 都不能读正文或新下载/签名配图。
- [ ] 修改稿要重新审核；正文下架、审核图片删除、既有签名 URL 的有效期、缓存、孤立文件与账号删除清理均实际验证。
- [ ] 登录/退出/切换账号不混入前一账号草稿，上传中断不丢本机编辑；恢复备份后正文和图片对应正确。

当前仅完成结构准备和本机体验；真实数据库执行、RLS、Storage API、图片解码/限额、审核发布、邮件与跨设备行为均未验证。
