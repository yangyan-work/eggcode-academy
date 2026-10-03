# 正式云端接入模块

当前只完成可配置代码与本机检查，没有创建或连接真实项目；真实 Auth、邮件、SQL/RLS、图片存储、跨设备同步均未验收。`site/cloud-config.js` 保持空配置，本机预览不加载第三方 SDK、不发送邮箱或密码。半填、错误 URL、secret/service_role 密钥会明确报错，不会降级成“登录成功”的演示账号。

## 配置与邮件

1. 在自己的 Supabase 项目执行本目录 `schema.sql` 与 `tutorial-submissions.sql`。已有结构需先审核迁移，不能直接覆盖。
2. 在 `site/cloud-config.js` 填写 HTTPS Project URL 与 `sb_publishable_*` 公开浏览器 key（兼容角色为 anon 的旧公开 JWT）。仅接受标准 `https://<项目>.supabase.co` 项目地址，密钥不授予绕过 RLS 的权限。禁止放入 secret、service_role 或数据库密码。
3. 在 Auth URL Configuration 设置本站实际 HTTPS Site URL；添加精确的 `https://<域名>/<仓库路径>/login.html` 回跳，并分别验证确认及 recovery。查询参数包含 `mode=confirm/recovery` 与经白名单核对的 `next`。本机测试仅临时配置精确的 localhost 回跳，正式部署前替换。
4. 配置自有 SMTP 并开启邮箱确认；测试注册、确认邮件、登录、找回邮件、新密码更新和退出。SDK 使用官方 `@supabase/supabase-js` 固定版本 **2.57.4**，按需从官方文档推荐的 jsDelivr 加载，无额外打包依赖；该版本不会自动跟随最新版本变化。

登录页使用官方 Auth 方法，密码仅随用户提交进入 SDK，操作后清空输入；不写本机明文密码。会话的保存与更新由 SDK 管理，退出仅退出当前浏览器会话。注册接口无会话时只提示检查邮箱，不宣称已注册或已登录。邮箱链接回跳由 SDK 的客户端 implicit 流程处理；恢复会话后才能更新密码。所有业务页面现在需要登录后使用。

真实登录和体验登录默认进入 `index.html`；由业务页面跳转而来时返回原页。回跳白名单覆盖全部 18 个业务页面，保留查询参数和锚点，拒绝 login 自循环、外部地址、跨目录及越界课程编号。云端和本机记录仍分开，本机记录不会自动上传。登录本身不授予正式管理员权限；本机审核工作台仍只体验本机数据。

参考：[官方安装](https://supabase.com/docs/reference/javascript/installing)、[密码认证](https://supabase.com/docs/guides/auth/passwords)、[注册](https://supabase.com/docs/reference/javascript/auth-signup)、[回跳配置](https://supabase.com/docs/guides/auth/redirect-urls)、[找回密码](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)、[更新密码](https://supabase.com/docs/reference/javascript/auth-updateuser)、[API key](https://supabase.com/docs/guides/getting-started/api-keys)。

## `window.EGG_CLOUD` 接口

相关页面先按顺序加载 `cloud-config.js`、`cloud-client.js`。模块不会自动加载 SDK；已配置页面调用 `init()` / `client()` / 业务方法时才开始连接。未配置调用会抛 `NOT_CONFIGURED`，配置错误抛 `CONFIG_INVALID`。

| 方法 | 参数与返回 |
| --- | --- |
| `status()` | `{configured, mode: local/cloud/error, message, user:{id,email}\|null, recovery}`，不返回密钥或 token |
| `safeNext(value, defaultFile)` | 返回经过白名单核对的同目录完整 URL；默认 index，可指定 personal-space/cloud-account |
| `init()` / `client()` | Promise 返回唯一官方 Supabase 客户端；供社区、作品等模块复用 |
| `getSession()` / `requireUser()` | SDK 当前会话 / 向 Auth 核验后的用户；业务写入身份来自该用户 |
| `signUp(email,password,next)` | 官方注册结果；`session=null` 不代表已登录 |
| `signIn(email,password)` | 只有实际返回会话才完成登录 |
| `requestPasswordReset(email,next)` | 服务已接受找回请求；不保证送达，不暴露账号是否存在 |
| `updatePassword(password)` / `signOut()` | 登录会话更新密码 / 当前浏览器退出 |
| `subscribe(callback)` | 异步通知无密钥的状态及 Auth event；返回取消订阅函数 |
| `loadStudyState()` | `{userId,profile,progress,favorites,notes}`，各数组使用 SQL 原字段名 |
| `saveProfile(nickname,lastLessonId)` | 插入自己的资料或仅更新昵称/上次课程；昵称≤20，课程0..144 |
| `saveProgress(id,completed,expectedRevision)` | 只调用 `save_lesson_progress`，返回其单行结果；`applied=false` 是冲突，保留本机修改让用户选择，禁止自动换版本重试 |
| `saveFavorite(id,boolean)` | 新建/取消自己的收藏，不使用无权限的默认 upsert |
| `saveNote(id,content)` / `deleteNote(id)` | 笔记≤2000字；仅更新 content，沿用数据库最后写入规则，无多设备笔记合并保证 |
| `listSubmissions()` / `getSubmission(id)` | 只读取当前用户私有稿件及审核结果 |
| `privateImageUrl(path)` | 为当前用户合法稿件图片取300秒签名地址，不写入公开正文 |

`loadStudyState()` 的 profile 为 `{nickname,last_lesson_id,updated_at}` 或 null；progress 为 `[{lesson_id,completed,revision,updated_at}]`；favorites 为 `[{lesson_id,created_at}]`；notes 为 `[{lesson_id,content,updated_at}]`。退出/切换用户后，界面清空前一账号的缓存，不将其内容混进新账号；模块本身不缓存学习正文。仅个人完成标记允许同步，不改编辑器验证状态。

## 图文上传与断点

```js
// 先用原投稿编辑器保存本机稿件。record 保持现有 schemaVersion/steps[].image 数据。
// checkpoint 单独保存：不得把整张 base64 图或密码塞入 localStorage。
const result = await EGG_CLOUD.uploadTutorial(record, {
  cloudDraft: previousCheckpoint || null,
  expectedUserId: userAtUploadStart.id, // 图片解码后再次核对，不能把A的稿发给B
  onCheckpoint: async checkpoint => persistSmallCheckpoint(checkpoint),
  onProgress: state => showUploadStage(state),
  submit: true // false 只保存云端草稿，true 还调用提交审核 RPC
});
// result.submitted 仅在 submit_tutorial RPC 成功后为 true。
```

`onProgress` 返回 `{phase,completed,total,message}`，表示图片完成数量与阶段，不冒充实时字节进度。函数不修改或删除本机稿件。校验纯文本长度、2..12步、真实 PNG/JPEG/WebP 文件头及解码、单图≤2MiB/最长边≤8000/≤1600万像素、单篇总图≤8MiB，再请求云端。

服务端生成稿件 ID 后保存小断点 `{userId,id,updatedAt,images:{步骤序号:{digest,path}}}`。图片路径严格为 `<Auth UUID>/<稿件 UUID>/<新 UUID>.png|jpg|webp`，上传私有 `tutorial-drafts` 桶，使用 `upsert:false`；同内容已确认的图片重试复用原路径。正文只保存文本和 imagePath，不保存本机 base64、外部 URL 或图片展示名称。不直接写 pending/published/status；最终提交使用 `submit_tutorial(p_id,p_expected_updated_at)`。

保存正文使用读取到的 updated_at 条件，未匹配时报冲突；提交 RPC 错误不报成功。异常附带 `error.cloudDraft`，调用方保留断点与本机稿。网络丢失后的创建/保存/提交结果可能未知，应先打开“我的云端稿件”重读核对，不盲目新建、覆盖或反复提交。若服务器已 pending/published，不能继续覆盖，需查看该稿或复制为新稿。客户端断点不是权限依据，RLS、稿件状态及 Storage 策略仍是最后门禁。

浏览器图片校验不能代替可信后端解码、配额、审核和滥用控制；未完成服务器验收前保持预览用途。替换图片留下的未引用文件由可信后台按说明清理，不能直接删除 storage.objects。参考：[官方上传](https://supabase.com/docs/reference/javascript/storage-from-upload)、[私有桶](https://supabase.com/docs/guides/storage/buckets/fundamentals)。

## 复跑与真实验收

在 site 目录执行 `node scripts/check-cloud-client.cjs`，验证空/错误配置零第三方请求、安全回跳、输入范围、纯文本格式和进度 RPC 调用契约。它使用本地 Auth/RPC 接口替身检查代码分派，**不是**真实云端通过证据。本版全站流程运行 `check-access-gate.cjs` 和 `check-login-gate-client.cjs`；旧免登录界面的检查预期已被替代。

正式配置后必须实测邮箱送达、确认及找回回跳、无会话注册、错误密码、退出、A/B 隔离、匿名拒写、跨设备进度冲突、笔记最后写入、正确/错误图片、稿件重试、旧更新时间拒绝、待审核不可覆盖和公开快照。SQL自检与真实 Storage测试都通过后才能标注“云端已启用”。当前全部真实云端项目保持 **未验证**。

## 登录门禁与资源保护

access-gate 在页面展示前核验：空配置仅接受明确体验会话；有效云端配置要求 requireUser 返回真实用户；错误配置保持关闭。退出和后退会重新检查。配置云端时体验入口禁用。前端跳转不能让已发布的静态源文件保密；若所有正文和配图都必须私密，部署时需要认证网关或后端返回受保护资源，并执行已更新的登录用户读取策略。本轮未部署这些服务，不能宣称静态内容已获得服务端保护。
