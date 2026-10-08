const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { getProjectTemplate, loadProjectTemplates } = require('../src/templates');
const { loadPresentation } = require('../src/presentations');
const { computeTextFlow, fitText } = require('../src/text-layout');
const { connectAdjacentBoxes, layoutEqualRow, assertEqualRow } = require('../src/diagram-layout');
const { assertGeneratedGeometry } = require('../src/output-validation');
const { getVisualSpec, loadTemplateReport, validatePresentationPlan, validateProjectConfig, validateTemplateSelectors, validateVisualSpec } = require('../src/input-validation');

test('public project loads from the registry and selectors match inspection', () => {
  const projects = loadProjectTemplates();
  assert.ok(projects.has('example-project'));
  const project = getProjectTemplate('example-project');
  const report = loadTemplateReport(project);
  assert.equal(report.slideCount, 9);
  assert.equal(Object.keys(project.archetypes).length, 9);
  assert.doesNotThrow(() => validateTemplateSelectors(project, report));
});

test('project config errors identify missing structure and invalid geometry', () => {
  assert.throws(() => validateProjectConfig({ id: 'bad', displayName: 'Bad', templateFile: '../outside.pptx', archetypes: {} }), /templateFile/);
  const project = structuredClone(getProjectTemplate('example-project'));
  project.archetypes.standardContent.layoutContract.regions.title.w = -1;
  assert.throws(() => validateProjectConfig(project), /region title.*positive/);
});

test('public example has independent sources and an authored, valid slide plan', () => {
  const directory = path.join(__dirname, '..', 'presentations', 'example');
  const sources = fs.readdirSync(path.join(directory, 'sources'));
  const assets = fs.readdirSync(path.join(directory, 'assets'));
  assert.equal(sources.length, 6);
  assert.ok(sources.every((name) => /\.(md|txt)$/.test(name)));
  assert.equal(assets.length, 4);
  assert.ok(assets.every((name) => name.endsWith('.svg')));
  assert.match(fs.readFileSync(path.join(directory, 'fixture-notes.md'), 'utf8'), /16,800 completed cycles/);
  const presentation = loadPresentation('example');
  assert.equal(presentation.sources.length, 6);
  assert.equal(presentation.assets.length, 4);
  assert.equal(presentation.outline.slides.length, 11);
  assert.ok(presentation.outline.slides.every((slide) => Array.isArray(slide.sourceRefs) && slide.sourceRefs.length > 0));
  assert.doesNotThrow(() => validatePresentationPlan(getProjectTemplate('example-project'), presentation));
});

test('source discovery supports nested md/txt and reports other formats', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ppt-source-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const job = path.join(root, 'sample');
  fs.mkdirSync(path.join(job, 'sources', 'nested'), { recursive: true });
  fs.writeFileSync(path.join(job, 'brief.md'), '# Brief\n');
  fs.writeFileSync(path.join(job, 'outline.md'), '# Plan\n```json\n{"slides":[{"number":1,"title":"Title","purpose":"Show","supportingContent":"Note","visual":"None","archetype":"cover","content":{}}]}\n```\n');
  fs.writeFileSync(path.join(job, 'sources', 'nested', 'note.md'), '# Note\n');
  fs.writeFileSync(path.join(job, 'sources', 'terms.txt'), 'terms\n');
  fs.writeFileSync(path.join(job, 'sources', 'report.pdf'), '%PDF placeholder');
  fs.writeFileSync(path.join(job, 'sources', '.hidden.txt'), 'ignored');
  const result = loadPresentation('sample', root);
  assert.deepEqual(result.sources.map((source) => source.relativePath).sort(), [path.join('nested', 'note.md'), 'terms.txt']);
  assert.deepEqual(result.unsupportedSources.map((source) => source.relativePath), ['report.pdf']);
});

test('an independently edited slide table is rejected', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ppt-outline-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const job = path.join(root, 'sample');
  fs.mkdirSync(job);
  fs.writeFileSync(path.join(job, 'brief.md'), 'Brief');
  fs.writeFileSync(path.join(job, 'outline.md'), '| Slide | Message/title |\n| --- | --- |\n| 1 | Old |\n```json\n{"slides":[{"number":1,"title":"New","purpose":"Show","supportingContent":"Note","visual":"None","archetype":"cover","content":{}}]}\n```\n');
  assert.throws(() => loadPresentation('sample', root), /independently edited slide table/);
});

test('visual schemas and content fields fail early with context', () => {
  const project = getProjectTemplate('example-project');
  const timeline = { type: 'timeline', kicker: 'Next phase', guardrail: 'Human review remains required', phases: [
    { period: 'Weeks 1–4', title: 'Prepare', detail: 'Confirm inputs' },
    { period: 'Weeks 5–8', title: 'Assess', detail: 'Review outcomes' },
  ] };
  const slide = { number: 2, archetype: 'standardContent', content: { title: 'Sample title', body: 'Sample subtitle', page: '02', visualSpec: timeline } };
  const presentation = { id: 'sample', outline: { slides: [slide] } };
  assert.doesNotThrow(() => validatePresentationPlan(project, presentation));
  presentation.outline.slides[0].content.visualSpec.type = 'unknown';
  assert.throws(() => validatePresentationPlan(project, presentation), /slide 2, visualSpec.*unsupported/);
  presentation.outline.slides[0].content.visualSpec.type = 'timeline';
  delete presentation.outline.slides[0].content.body;
  assert.throws(() => validatePresentationPlan(project, presentation), /slide 2.*content.body/);
  assert.throws(() => validateVisualSpec({ type: 'timeline', kicker: 'K', phases: [], guardrail: 'G' }, 'slide 7'), /slide 7.*phases/);
  assert.throws(() => getVisualSpec({ visualSpec: {}, content: { visualSpec: {} } }, 'slide 2'), /both slide and content/);
  const alternate = { id: 'sample', outline: { slides: [{ ...slide, content: { ...slide.content, body: 'Sample subtitle' }, visualSpec: timeline }] } };
  delete alternate.outline.slides[0].content.visualSpec;
  assert.equal(getVisualSpec(alternate.outline.slides[0], 'slide 2').type, 'timeline');
  assert.doesNotThrow(() => validatePresentationPlan(project, alternate));
});

test('text fitting reports success and unresolved overflow', () => {
  assert.equal(fitText('Short title', { w: 8, h: 0.6, fontSize: 22, minFontSize: 18, maxLines: 1 }).fits, true);
  assert.equal(fitText('A very long sentence that cannot possibly fit inside such a narrow single-line box', { w: 0.8, h: 0.3, fontSize: 20, minFontSize: 18, maxLines: 1 }).fits, false);
  assert.throws(() => computeTextFlow({ regions: { title: { x: 0, y: 0, w: 0.8, h: 0.3, fontSize: 20, minFontSize: 18, maxLines: 1 } }, fieldRegions: { title: 'title' }, mainContent: { x: 0, y: 0.5, w: 5, h: 2 } }, { title: 'A very long sentence that cannot fit' }, 'Presentation sample, slide 4'), /slide 4, field title, region title/);
});

test('flow regions stack after measured text and avoid reserved space', () => {
  const contract = getProjectTemplate('example-project').archetypes.standardContent.layoutContract;
  const layout = computeTextFlow(contract, { title: 'Short title', body: 'A short subtitle' });
  assert.equal(layout.regions.subtitle.y, layout.regions.title.y + layout.regions.title.h + contract.regions.subtitle.gap);
  assert.ok(layout.mainContent.y > layout.regions.subtitle.y + layout.regions.subtitle.h);
  assert.ok(layout.mainContent.y + layout.mainContent.h < contract.reserved[2].y);
});

test('paired card bodies use one shared fitted font size', () => {
  const contract = structuredClone(getProjectTemplate('example-project').archetypes.twoColumn.layoutContract);
  contract.regions.leftBody.fontSize = 18;
  const layout = computeTextFlow(contract, {
    title: 'Operator feedback', leftHeading: 'What helped', rightHeading: 'What to refine',
    leftBody: ['Cross-station context helped.', 'Event history aided review.'],
    rightBody: ['Make advisories clear.', 'Show the signal and time.'],
  });
  assert.equal(layout.regions.leftBody.fontSize, layout.regions.rightBody.fontSize);
  assert.equal(layout.regions.leftBody.fontSize, 17);
  assert.equal(layout.regions.leftBody.paragraphGapInches, layout.regions.rightBody.paragraphGapInches);
});

test('equal rows and connectors use clear box geometry', () => {
  const boxes = layoutEqualRow({ x: 1, y: 2, w: 5, h: 1 }, 2, 0.4);
  assert.doesNotThrow(() => assertEqualRow(boxes));
  const shapes = [];
  connectAdjacentBoxes({ addShape: (kind, options) => shapes.push({ kind, options }) }, boxes[0], boxes[1], { blue: '0000FF' }, { clearance: 0.08 });
  assert.equal(shapes.length, 1);
  assert.ok(shapes[0].options.x > boxes[0].x + boxes[0].w);
  assert.ok(shapes[0].options.x + shapes[0].options.w < boxes[1].x);
  assert.throws(() => connectAdjacentBoxes({ addShape() {} }, boxes[0], { ...boxes[1], x: boxes[0].x + boxes[0].w + 0.1 }, { blue: '0000FF' }), /too close/);
});

test('generated geometry rejects slide overflow and reserved-zone overlap', () => {
  const slide = { widthInches: 13.333, heightInches: 7.5 };
  const region = { x: 1, y: 2, w: 10, h: 4 };
  const reserved = [{ name: 'footer', x: 0, y: 6.5, w: 13.333, h: 1 }];
  const element = (x, y, w, h) => ({ name: 'visual-1-test', visualType: 'rectangle', position: { x: x * 914400, y: y * 914400, cx: w * 914400, cy: h * 914400 } });
  assert.doesNotThrow(() => assertGeneratedGeometry([element(2, 3, 1, 1)], region, reserved, slide, 'slide 1'));
  assert.throws(() => assertGeneratedGeometry([element(12.9, 3, 1, 1)], null, reserved, slide, 'slide 1'), /outside/);
  assert.throws(() => assertGeneratedGeometry([element(2, 6.45, 1, 0.3)], null, reserved, slide, 'slide 1'), /reserved zone footer/);
});
