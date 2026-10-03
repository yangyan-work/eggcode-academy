# 自由树梦想空间 · 蛋码学习站

这是 yangyan-work/eggcode-academy 的静态网站源文件，采用全站水晶玻璃风格，保留自由树标志、145课、3,871条手册记录和454个课程积木图。网站地址：https://yangyan-work.github.io/eggcode-academy/ 。当前使用昵称体验登录，记录保存在访问者自己的浏览器；真实数据库与云端账号未启用。

## 课程结构

- 原有 40 课的链接、内容与 ID 保持不变：入门课程 `0–5`、积木练习 `6–11`、消消乐 `12–17`、玩法拓展 `18–21`、数值图 `22–39`
- 新增 105 课，追加为 ID `40–144`；全站共 145 课、139 篇实战、34 个实战专题
- 12 个成长专题各 3 课；8 个经营与解谜专题各 4 课；10 个派对与进阶专题共 37 课
- 实战目录支持关键词、创作方向和具体专题组合筛选；筛选状态保存在 URL 中，旧的 `#progression`、`#match3`、`#gameplay`、`#basics` 链接继续有效
- 课程目录按专题折叠，可搜索；课程上下篇在当前专题中连续导航，并可返回专题目录

原有 18 篇数值图课程已经存在，不重复生成。背包、宠物、装备等新课为其拓展专题。

## 逐步详解版

每课增加独立的场景准备、触发器区域与预设入口、变量创建、自定义动作内部步骤、逐槽操作和分场景验收。原有课名、ID 与基础指南继续保留；玩法仍明确区分数值练习、单人操作原型和需要额外验证的多人/引擎接入。

- `editor-guide.html`：九类触发器区域、预设/运行实例/事件参与者、官方新版入口及排错
- `detail-source/`：全部课程的可维护详解来源
- `detailed-guides-*.js`：生成后的分片数据
- `learning-detail.js`：逐步阅读、查找路径和参数槽说明
- 积木详情页根据其真实平台、类别、分组和参数类型逐项展示定位与接法；原文缺项保留核对提示
- SVG 展开列表初始化、嵌套输入、多个独立自定义定义、分支与循环连线。灰色说明不是原生积木，也不是可导入程序

修改详解 JSON 后运行 `node scripts/build-details.cjs`，再执行 `node scripts/build-details.cjs --check` 和 `node scripts/check-details.cjs`。详解中重复介绍同一动作只用于核对，一套定义只创建一次。

## 文件与维护

原始课程保留在 `lessons-data.js`、`tutorials.js`、`build-guides.js` 和 `progression-guides.js`。手册及现有图示数据保留原样。

新增课程的可编辑来源在 `curriculum-source/` 的六个 JSON 文件中。每条记录包含 `tutorial` 和 `guide`；所有参考积木必须指向现有手册 ID。更新源文件后运行：

```sh
node scripts/integrate-curriculum.cjs
node scripts/integrate-curriculum.cjs --check
node scripts/check.cjs
```

生成器不会写入原有课程、手册或素材，只输出以下追加文件：

- `curriculum-expansion.js`：专题、方向、稳定 ID 和数量元数据
- `curriculum-lessons-01.js`、`curriculum-lessons-02.js`：新增课程介绍
- `curriculum-guides-01.js` 至 `curriculum-guides-04.js`：新增搭建步骤、变量、积木引用及验收清单

新增源文件和生成文件均分片到 200 KB 以下，方便静态传输和仓库更新。若以后改变分片数量，要同步修改 HTML 的脚本引用。不要直接编辑生成文件。

课程页加载顺序：原有课程和手册 → 原有搭建指南 → 数值图指南 → 新专题元数据 → 新课程介绍 → 新搭建指南 → 积木数据/图示渲染器 → `app.js`。所有指南必须在图示渲染器之前加载，因为渲染器会收集指南中的变量名称。

## 本地预览与检查

站点无需构建或安装运行时依赖。在仓库根目录启动静态服务：

```sh
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/`。课程必须从根目录 HTML 访问，无需另建应用，也不需要复制到 `dist/`。

内容与 DOM 回归检查说明见 [`scripts/README.md`](scripts/README.md)。检查涵盖旧内容保留、145 个课程路由、课程筛选、相关导航、SVG 图示、手册引用及交互。

人工复查建议：

1. 桌面及 390px 移动端查看首页、实战目录和新增课程；检查标题换行、筛选控件、侧栏及横向图示滚动
2. 实战页组合关键词和方向/专题，测试无结果、重置、刷新、前进和后退
3. 打开旧链接 `lesson.html?id=22`、新增首课 `lesson.html?id=40` 与末课 `lesson.html?id=144`，检查同专题上下篇及积木详情返回链接
4. 放大、缩小、反复开关大图，检查文字连接顺序、复制与变量锚点

## 发布方式

继续使用 GitHub Pages 的根目录静态发布方式，保留 `.nojekyll`，不切换站点或替换部署架构。发布前执行检查；发布后核对线上版本、缓存版本号和代表性新旧课程。仓库文件修改本身不等同于已发布。

## 教学范围与资料

本站为非官方教学站，手册快照日期为 2026-09-03，包含 3,871 条积木记录。彩色图是帮助搭建的连接示意，不是可导入工程，也不是编辑器实拍。

新增课程保留有关网络运行域、计时精度、存档故障与防重复结算的限制说明。网页及数据验证不等于游戏编辑器内的实测；涉及多人、持久化和计时的玩法，必须按每课验收清单在实际项目中测试后再发布。


## 学习路线、记录与验证补全

- `learning-path.html`：八条建议路线与全部145课目录；大数i1/s1/f1作为独立方案展示
- `learning-progress.js`：本浏览器自报完成记录、继续阅读、跨标签更新和明确确认后清除；不联网同步，不代表编辑器测试通过。坏数据/未来版本不静默覆盖
- `verification.html` 与 `verification-report.json`：列明文档审查、DOM网页检查、独立玩法演示和原生编辑器测试的不同范围，保留逐课证据索引
- `big-number-lab.html`：额外的精确字符串加减乘除实验，不改变原有145个课程ID；60位输入、完整乘法和商/余数长除法、逐步轨迹。原生搭建仍需实机验收
- 变量表增加作用范围的原文依据与设置理由；大图弹窗增加缩放和恢复100%

新增检查：`node scripts/check-progress.cjs`、`node scripts/check-big-number.cjs`、`node scripts/check-quality.cjs`。这三个检查及原有DOM测试均需要jsdom。设置好NODE_PATH后，运行 `node scripts/build-verification.cjs` 可重跑全部检查并生成证据页；失败时不会生成通过记录。`--build-only`只生成待检查页，不是验收通过。

## 案例、挑战解法与按课加载

- 积木案例在 `block-curated.js` 中精确绑定原文ID；新增22个独立场景覆盖44条移动端／电脑端记录，包含具体参数、预期、反例和原文疑点。未知时序或枚举不会补成已确认的行为。
- `challenge-solutions.js` 保存有挑战题课程的参考解法；原题保留，参考思路、连接顺序、验收例与误区折叠展示。这些是教学参考，不代表编辑器试玩已通过。
- `scripts/build-details.cjs` 生成原有24份详解及 `detail-chunks.json` 映射。课程页由 `lesson-loader.js` 先读取小索引，再加载本课对应分片，最后执行页面渲染；目录、旧ID和前置课保留。分片使用内容哈希缓存，索引重新验证；加载失败显示重试，不静默展示缺失详解的课程。
- 修改 `detail-source` 后运行 `node scripts/build-details.cjs`，提交详解分片和索引。部署须保留完整目录，并通过 HTTP/HTTPS 访问课程页。
- 新增检查见 `scripts/README.md`。证据页生成现在也需要单独QA环境中的 Playwright，真实浏览器检查仍不执行原生蛋码。

## 2026.10.04 运营补全

lesson-feedback.js 为每条真实搭建步骤生成带原文、课程和直达链接的纠错报告，支持文字/JSON下载和复制，未配置真实收件接口。service-info.html 说明来源、举报/下架、账号数据边界和五人试用任务；database/OPERATIONS.md 提供上线、备份恢复、权限和费用控制清单。

本轮可复查的16个检查脚本摘要在 release-checks.json。145课纠错入口、454图保护、19业务页五种宽度、登录门禁和真实浏览器下载已检查；蛋码实机和真实Supabase仍未验收。
