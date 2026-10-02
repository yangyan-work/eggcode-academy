"use strict";
window.EGG_VERIFICATION = (() => {
  function panel(id) {
    if (!Number.isInteger(id)||id<0||id>=145) return '';
    const statuses=[
      ['文档级逻辑检查','已完成审查','已核对步骤、变量类型、分支及边界用例。未运行原生蛋码，不代表引擎执行已通过。','review'],
      ['网页阅读与图示','自动化检查通过','本课网页渲染、积木图结构及相关链接已检查；交互回归覆盖导航、搜索、复制与放大。','passed'],
      ['本课独立玩法演示','未提供','彩色图是教学示意，本课没有对应的浏览器可玩游戏。首页消消乐小演示不代替本课验收。','pending'],
      ['蛋仔编辑器实机','尚未验证','需按本课清单，在实际编辑器中记录操作、结果与截图/录屏。未实测的内容不会标为通过。','pending']
    ];
    return '<section class="course-verification" aria-label="本课验证状态"><div class="verification-heading"><h2>本课检查到哪一步？</h2><a href="verification.html#course-'+id+'">查看本课检查证据 →</a></div><div class="verification-grid">'+statuses.map(([title,state,description,kind])=>'<article data-check-status="'+kind+'"><h3>'+title+'</h3><strong class="check-state">'+state+'</strong><p>'+description+'</p></article>').join('')+'<p class="verification-scope">“学完了”是你自己的学习记录，不会改变以上测试状态；“尚未验证”也不等于确认失败。</p></section>';
  }
  return {panel};
})();
