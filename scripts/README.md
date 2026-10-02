# Validation

This repository is a static site. Run the dependency-free content checks from its root:

```sh
node scripts/check.cjs
node scripts/check-renderer.cjs
```

For DOM/interaction coverage, make `jsdom` available through Node's normal module resolution (or `NODE_PATH`), then run:

```sh
NODE_PATH=/path/to/qa/node_modules node --expose-gc scripts/check-dom.cjs
```

The DOM checks were developed with jsdom 30.1.1. They load the real page script order without requesting external resources. Clipboard, media queries, intersection observers, scrolling, dialogs, and animation are deliberately stubbed so supported event flows can be tested without a graphical browser.

Coverage:
- Exactly 145 lesson routes: 6 foundations, 34 original practices, and 105 added lessons across 30 new series
- Original IDs 0–39, full records, detailed guides, and manual data preserved against SHA-256 fixtures captured directly from git commit `8688c199796d3d371386b565084cfbe333975859`
- Required lesson/guide fields, variable/sample tables, exact series counts, and native mobile block references
- Renderer parser regressions: chained comparisons, conditional calls, grouping, signed numbers, quoted punctuation, and semicolon-separated statements
- Every lesson's rendered title, searchable/grouped TOC, within-series previous/next links, preparation/acceptance sections, block backlinks, and SVG diagrams
- SVG XML validity, positive finite dimensions, matching viewBoxes, and no `undefined`, `NaN`, or `Infinity` output
- Static local assets, script load order (including loading all guide variables before the renderer), counts, and JavaScript syntax
- Practice family/series/hash views, old hashes, Back/Forward, deep URL reloads, normalized search, empty state, and reset
- Manual platform/category/group/query filters, pagination, empty/reset, filter-preserving return links, and new lesson backlinks
- Repeated lesson copy, clipboard fallback, zoom bounds, repeated dialog open/close, deep anchors, and mobile disclosure changes
- Home demo repeated play/reset and interrupted-animation recovery

These checks do not prove pixel layout, browser image export/download, or execution inside the Eggcode editor. Those need separate real-browser/editor verification. Tutorial diagrams are teaching representations, not executable code.


Detailed revision checks:

```sh
node scripts/build-details.cjs --check
node scripts/check-details.cjs
node scripts/check-renderer.cjs
```

The detailed-guide checker covers all 145 lesson mappings, structured scene/trigger/custom-action instructions and tests, and renders location/slot/wiring explanations for all 3,871 manual records. These structural checks complement independent content review; neither proves real editor execution. Renderer tests cover list-literal expansion, separate custom definition bodies, typed list/math operands, parameter labeling, nested branches and unsupported-text fallback.
