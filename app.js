"use strict";

const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
const lessons = window.EGG_LESSONS || [];
const practices = window.EGG_TUTORIALS || [];
const buildGuides = window.EGG_BUILD_GUIDES || {};
const manual = window.EGG_MANUAL;
const baseLessonCount = Number(document.body.dataset.foundationCount);
const totalLessonCount = Number(document.body.dataset.lessonCount);
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
const mascots = ["yellow", "pink", "black"];
const courseSummaries = ["打开蛋码，用一条欢迎提示完成第一次创作。", "认识事件、条件和动作，让地图听懂你的指令。", "用变量记录分数，理解数据的作用范围。", "学会判断与重复，把简单动作排出节奏。", "认识列表和自定义积木，让重复步骤变简单。", "阅读一段纯 Lua 示例，向文本编程迈出一小步。"];
const topics = ["你好，蛋码！", "什么时候，做什么？", "给灵感一点记忆", "再来一次！", "小积木，大能力", "下一站，Lua"];

if (page === "home") {
  const legacy = { "#courses": "courses.html", "#practice": "practice.html", "#manual": "manual.html", "#roadmap": "courses.html" };
  if (legacy[location.hash]) location.replace(legacy[location.hash]);
}
if (page === "courses" || page === "practice") {
  const items = page === "courses" ? lessons : practices;
  const renderCard = (item, index) => `<a class="course-card tone-${index % 3}" href="lesson.html?id=${index + (page === "practice" ? baseLessonCount : 0)}">
    <div class="course-visual"><span class="course-number">${page === "practice" ? "P" : "LESSON "}${String(index + 1).padStart(2, "0")}</span><strong>${escapeHTML(page === "courses" ? topics[index] : item.motif)}</strong><img src="assets/eggy-${mascots[index % 3]}.png" width="120" height="130" alt="" loading="lazy"></div>
    <div class="course-info"><span class="course-category">${escapeHTML(page === "practice" ? item.category : item.category.split(" / ")[1])}</span><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(page === "courses" ? courseSummaries[index] : item.summary)}</p><div class="card-bottom"><span>${page === "courses" ? "入门课程 · 含动手练习" : buildGuides[index + baseLessonCount].sections.length + " 个搭建步骤 · 参数与连接图"}</span><span class="round-arrow" aria-hidden="true">↗</span></div></div></a>`;
  document.getElementById(page === "courses" ? "courses-grid" : "practice-grid").innerHTML = page === "courses" ? items.map(renderCard).join("") : [
    ["match3", "消消乐", "消消乐 · 从棋盘到完整关卡", "6 篇连续课程 / 建议按顺序学习"],
    ["gameplay", "玩法拓展", "把逻辑变成可玩的挑战", "4 个独立玩法 / 在场景中组合验证"],
    ["basics", "积木练习", "先练好每一块积木", "6 个基础案例 / 从提示到机关"]
  ].map(([id, series, title, description]) => `<section class="practice-group" id="${id}"><div class="section-title"><div><p class="eyebrow">${escapeHTML(description)}</p><h2>${escapeHTML(title)}</h2></div></div><div class="course-grid">${items.map((item,index) => (item.series || "积木练习") === series ? renderCard(item,index) : "").join("")}</div></section>`).join("");
}

function renderBuildGuide(guide, index) {
  const code = value => '<div class="lesson-code-wrap"><pre><code>' + escapeHTML(value) + '</code></pre><button class="copy-code" type="button">复制连接图</button></div>';
  const related = index >= 12 && index <= 17 ? '<nav class="recipe-series" aria-label="消消乐六课"><span>这六课组成同一套作品</span>' + practices.slice(6,12).map((item, offset) => '<a href="lesson.html?id=' + (offset+12) + '"' + (index===offset+12?' aria-current="page"':'') + '>' + escapeHTML(item.title.split(' · ')[0]) + '</a>').join('') + '</nav>' : '';
  const refs = guide.refs.map(id => manual.entries.find(entry => entry.id === id)).filter(Boolean).map(entry => '<a class="block-reference" href="manual.html?block=' + encodeURIComponent(entry.id) + '&lesson=' + index + '">' + escapeHTML(entry.title) + ' <small>' + escapeHTML(entry.group) + '</small> ↗</a>').join('');
  return '<div class="build-guide">' + related +
    '<h3>先准备好这些</h3><ul>' + guide.setup.map(item=>'<li>'+escapeHTML(item)+'</li>').join('') + '</ul>' +
    '<details class="recipe-notation"><summary>第一次照图搭建？先看符号与操作说明</summary><ol>' + window.EGG_GUIDE_NOTATION.map(item=>'<li>'+escapeHTML(item)+'</li>').join('') + '</ol></details>' +
    (guide.variables.length ? '<h3 id="variables">变量清单</h3><p>列表类型与普通变量类型分开选择，名称保持一致。</p><div class="table-wrap"><table><thead><tr><th scope="col">名称</th><th scope="col">类型</th><th scope="col">初值 / 用途</th></tr></thead><tbody>' + guide.variables.map(row=>'<tr>'+row.map(cell=>'<td>'+escapeHTML(cell)+'</td>').join('')+'</tr>').join('') + '</tbody></table></div>' : '<p class="recipe-check">本课不需要创建变量。</p>') +
    '<h3>本课积木 · 点开核对参数</h3><div class="block-references">' + refs + '</div>' +
    '<nav class="recipe-nav" aria-label="本课搭建步骤"><strong>搭建步骤</strong><ol>' + guide.sections.map((section,i)=>'<li><a href="#step-'+(i+1)+'">'+escapeHTML(section.title)+'</a></li>').join('') + '</ol><a href="#acceptance">跳到试玩验收 ↓</a></nav>' +
    guide.sections.map((section,i)=>'<section class="recipe-step" id="step-'+(i+1)+'"><p class="recipe-number">STEP '+String(i+1).padStart(2,'0')+'</p><h3>'+escapeHTML(section.title)+'</h3><ol>'+section.steps.map(item=>'<li>'+escapeHTML(item)+'</li>').join('')+'</ol>'+code(section.tree)+'<p class="recipe-check"><strong>这一步检查：</strong>'+escapeHTML(section.verify)+'</p></section>').join('') +
    '<section id="acceptance" class="recipe-step"><h3>搭完后逐项试玩</h3><ol>'+guide.tests.map(item=>'<li>'+escapeHTML(item)+'</li>').join('')+'</ol></section>' +
    '<p class="lesson-source">教程解读 · 对照2026-09-03原点版移动端手册编写。连接图需在蛋码画布逐块搭建，不能直接粘贴执行。积木链接为手册原文；案例尚未在编辑器内实机验证。自定义动作含异步积木时的执行顺序未在手册中明确，本教程核心动作不放等待或计时器；涉及调用后读取结果的地方，应先按步骤验收，也可把动作定义中的整串积木直接展开到调用处。</p></div>';
}

function renderPractice(tutorial, index) {
  return '<p class="lesson-callout">目标：' + escapeHTML(tutorial.goal) + '</p>' + renderBuildGuide(buildGuides[index], index);
}

if (page === "lesson") {
  const allLessons = [...lessons, ...practices];
  const rawId = params.get("id") ?? "0";
  const index = /^\d+$/.test(rawId) ? Number(rawId) : -1;
  const groupOf = (item, i) => i < baseLessonCount ? "入门课程" : item.series || "积木练习";
  document.getElementById("lesson-toc").innerHTML = allLessons.map((item, i) => `${i === 0 || groupOf(item,i) !== groupOf(allLessons[i-1],i-1) ? `<p class="toc-group">${escapeHTML(groupOf(item,i))}</p>` : ""}<a href="lesson.html?id=${i}"${i === index ? ' aria-current="page"' : ""}><span>${String(i < baseLessonCount ? i + 1 : i - baseLessonCount + 1).padStart(2, "0")}</span>${escapeHTML(item.title)}</a>`).join("");
  const lesson = allLessons[index];
  if (!lesson) {
    document.getElementById("lesson-title").textContent = "这堂课暂时不存在";
    document.getElementById("lesson-body").innerHTML = '<p>课程链接可能有误，回到课程目录重新选择吧。</p><a class="button button-blue" href="courses.html">查看全部课程 →</a>';
    document.querySelector(".lesson-navigation").hidden = true;
  } else {
    const isPractice = index >= lessons.length;
    const parent = document.getElementById("lesson-parent");
    parent.href = isPractice ? "practice.html" : "courses.html";
    parent.textContent = isPractice ? "玩法实战" : "入门课程";
    document.title = lesson.title + " · 蛋码自习室";
    document.getElementById("lesson-breadcrumb").textContent = lesson.title;
    const chapterNumber = isPractice ? practices.slice(0, index - baseLessonCount + 1).filter(item => (item.series || "积木练习") === (lesson.series || "积木练习")).length : index + 1;
    document.getElementById("lesson-counter").textContent = `${isPractice ? lesson.series || "积木练习" : "入门"} / ${String(chapterNumber).padStart(2, "0")}`;
    document.getElementById("lesson-kicker").textContent = lesson.category;
    document.getElementById("lesson-title").textContent = lesson.title;
    document.getElementById("lesson-body").innerHTML = isPractice ? renderPractice(lesson, index) : renderBuildGuide(buildGuides[index], index) + '<details class="concept-review"><summary>概念与原示例回顾' + (index===5?' · 含Lua语法示例':'') + '</summary>' + lesson.content + '</details>';
    document.getElementById("lesson-position").textContent = `${index + 1} / ${allLessons.length}`;
    const previous = document.getElementById("previous-lesson");
    previous.href = index === 0 ? "courses.html" : `lesson.html?id=${index - 1}`;
    previous.textContent = index === 0 ? "← 课程目录" : "← 上一课";
    const next = document.getElementById("next-lesson");
    next.href = index === allLessons.length - 1 ? "practice.html" : `lesson.html?id=${index + 1}`;
    next.textContent = index === allLessons.length - 1 ? "完成阅读 ✓" : "下一课 →";
  }
}

let toastTimer;
document.addEventListener("click", async event => {
  const button = event.target.closest(".copy-code");
  if (!button) return;
  const code = button.parentElement.querySelector("code");
  try {
    await navigator.clipboard.writeText(code.textContent);
    const toast = document.getElementById("toast");
    toast.textContent = "内容已复制，去试试看吧！";
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2300);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    button.textContent = "已选中，请手动复制";
  }
});

// 只渲染手册实际使用的格式；原文不作为 HTML 执行。
function renderManualBody(body) {
  return body.replace(/^(#{3,6} .+)$/gm, "\n\n$1\n\n").split(/\n\s*\n/).filter(Boolean).map(block => {
    const heading = /^(#{3,6})\s+([^\n]+)$/.exec(block.trim());
    if (heading) return `<h3>${escapeHTML(heading[2])}</h3>`;
    const text = block.split(/(!\[[^\]]*\]\(https:\/\/[^\s)]+\))/g).map(part => {
      const image = /^!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)$/.exec(part);
      if (image && new URL(image[2]).hostname === "u5-creator.s3.game.163.com") return `<a class="manual-image-link" href="${escapeHTML(image[2])}" target="_blank" rel="noopener noreferrer">查看官方配图${image[1] ? "：" + escapeHTML(image[1]) : ""} ↗</a>`;
      return escapeHTML(part).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
    }).join("");
    return block.length > 700 ? `<details class="long-parameter"><summary>展开完整类型或参数说明（${block.length} 字符）</summary><p>${text}</p></details>` : `<p>${text}</p>`;
  }).join("");
}

if (page === "manual") {
  const dialog = document.getElementById("manual-dialog");
  function openManual(id) {
    const entry = manual.entries.find(item => item.id === id);
    if (!entry) return false;
    const source = manual.sources.find(item => item.id === entry.source);
    const lessonId = params.get("lesson");
    const back = /^\d+$/.test(lessonId || "") && Number(lessonId) < totalLessonCount ? `<a class="manual-back" href="lesson.html?id=${Number(lessonId)}">← 返回刚才的教程</a>` : "";
    document.getElementById("manual-detail-meta").textContent = `${entry.platform} / ${entry.category} / ${entry.group}`;
    document.getElementById("manual-detail-title").textContent = entry.title;
    document.getElementById("manual-detail-body").innerHTML = back + renderManualBody(entry.body) + `<p class="lesson-source">官方手册原文 · 出处：${escapeHTML(source.filename)} · 第 ${entry.sourceLine} 行起<br>资料快照：${manual.snapshot}。同名积木可能有不同参数形式，请以条目描述为准。</p>`;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    dialog.scrollTop = 0;
    document.getElementById("close-manual").focus({ preventScroll: true });
    return true;
  }
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-manual]");
    if (button) openManual(button.dataset.manual);
  });
  document.getElementById("close-manual").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { document.body.style.overflow = ""; });
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  const queryInput = document.getElementById("manual-query");
  const platformInput = document.getElementById("manual-platform");
  const categoryInput = document.getElementById("manual-category");
  const pageSize = 12;
  let manualPage = 0;
  let matchedEntries = [];
  const searchableEntries = manual.entries.map(entry => ({ entry, text: `${entry.title} ${entry.category} ${entry.group} ${entry.body}`.normalize("NFKC").toLocaleLowerCase() }));
  function filterManual() {
    const keywords = queryInput.value.normalize("NFKC").trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    matchedEntries = searchableEntries.filter(({ entry, text }) => (entry.platform === platformInput.value || entry.platform === "通用") && (!categoryInput.value || entry.category === categoryInput.value) && keywords.every(word => text.includes(word))).map(({ entry }) => entry);
    manualPage = 0;
    renderManualResults();
  }
  function renderManualResults() {
    const count = matchedEntries.length;
    const pages = Math.max(1, Math.ceil(count / pageSize));
    manualPage = Math.max(0, Math.min(manualPage, pages - 1));
    document.getElementById("manual-result-count").textContent = `${platformInput.value} · 找到 ${count.toLocaleString("zh-CN")} 个条目`;
    document.getElementById("manual-results").innerHTML = matchedEntries.slice(manualPage * pageSize, (manualPage + 1) * pageSize).map(entry => {
      const description = entry.body.match(/#### 描述\s+([^#\n][^\n]*)/)?.[1] || entry.body.replace(/^#{3,6} .*$/gm, "").trim().split("\n")[0];
      return `<button class="manual-result" data-manual="${entry.id}"><span class="manual-result-meta"><span class="block-kind" data-kind="${entry.category}">${entry.category}</span><span>${escapeHTML(entry.group)}</span></span><strong>${escapeHTML(entry.title)}</strong><span class="manual-excerpt">${escapeHTML(description || "查看参数与完整说明")}</span><span class="manual-read">查看原文 <span aria-hidden="true">↗</span></span></button>`;
    }).join("");
    document.getElementById("manual-empty").hidden = count > 0;
    document.getElementById("manual-page").textContent = count ? `${manualPage + 1} / ${pages} 页` : "0 个结果";
    document.getElementById("manual-prev").disabled = manualPage === 0;
    document.getElementById("manual-next").disabled = !count || manualPage >= pages - 1;
  }
  const form = document.getElementById("manual-search-form");
  form.addEventListener("submit", event => { event.preventDefault(); filterManual(); });
  form.addEventListener("reset", () => setTimeout(filterManual, 0));
  queryInput.addEventListener("input", filterManual);
  platformInput.addEventListener("change", filterManual);
  categoryInput.addEventListener("change", filterManual);
  document.getElementById("manual-clear-empty").addEventListener("click", () => form.reset());
  for (const [id, direction] of [["manual-prev", -1], ["manual-next", 1]]) {
    document.getElementById(id).addEventListener("click", () => {
      manualPage += direction;
      renderManualResults();
      document.getElementById("manual-result-count").scrollIntoView({ block: "start" });
    });
  }
  filterManual();
  if (params.has("block") && !openManual(params.get("block"))) document.getElementById("manual-result-count").textContent = "这个条目链接暂时找不到，请使用关键词重新查找。";
}
