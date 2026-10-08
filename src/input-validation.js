const fs = require('node:fs');
const path = require('node:path');

const VISUAL_FIELDS = {
  productionLine: { strings: ['kicker', 'note', 'footnote'], arrays: { stations: 2 }, items: { stations: ['name', 'detail', 'sensors'] } },
  architecture: { strings: ['kicker', 'guardrail'], arrays: { nodes: 2 }, items: { nodes: ['label', 'title', 'detail'] } },
  kpiCards: { strings: ['kicker', 'footnote'], arrays: { items: 1 }, items: { items: ['value', 'label', 'detail'] } },
  comparison: { strings: ['kicker', 'callout'], arrays: { measures: 2 }, items: { measures: ['label', 'baseline', 'pilot', 'maximum', 'unit', 'change'] } },
  decisionPanels: { strings: ['kicker', 'decision', 'supported', 'openQuestions'] },
  timeline: { strings: ['kicker', 'guardrail'], arrays: { phases: 2 }, items: { phases: ['period', 'title', 'detail'] } },
};

function fail(where, message) { throw new Error(`${where}: ${message}`); }
function nonempty(value) { return typeof value === 'string' && value.trim().length > 0; }
function finite(value) { return typeof value === 'number' && Number.isFinite(value); }

function validateBox(box, where, options = {}) {
  if (!box || typeof box !== 'object') fail(where, 'must be an object');
  for (const key of ['x', 'w']) if (!finite(box[key])) fail(where, `${key} must be a finite number`);
  if (!finite(box.y) && !nonempty(box.flowAfter)) fail(where, 'requires finite y or flowAfter');
  if (!finite(box.h) && !finite(box.bottom) && !finite(box.minHeight) && !options.allowHeightless) fail(where, 'requires h, bottom, or minHeight');
  if (box.x < 0 || (finite(box.y) && box.y < 0) || box.w <= 0) fail(where, 'position and width must be positive and inside the slide');
  for (const key of ['h', 'minHeight', 'maxHeight']) if (box[key] !== undefined && (!finite(box[key]) || box[key] <= 0)) fail(where, `${key} must be positive and finite`);
  if (box.bottom !== undefined && (!finite(box.bottom) || box.bottom <= 0)) fail(where, 'bottom must be positive and finite');
  if (box.gap !== undefined && (!finite(box.gap) || box.gap < 0)) fail(where, 'gap must be nonnegative and finite');
  if (box.fontSize !== undefined && (!finite(box.fontSize) || box.fontSize <= 0)) fail(where, 'fontSize must be positive and finite');
  if (box.minFontSize !== undefined && (!finite(box.minFontSize) || box.minFontSize <= 0 || box.minFontSize > box.fontSize)) fail(where, 'minFontSize must be positive and no larger than fontSize');
  if (box.maxLines !== undefined && (!Number.isInteger(box.maxLines) || box.maxLines < 1)) fail(where, 'maxLines must be a positive integer');
  if (box.paragraphGapInches !== undefined && (!finite(box.paragraphGapInches) || box.paragraphGapInches < 0)) fail(where, 'paragraphGapInches must be nonnegative and finite');
  if (box.lineSpacingPercent !== undefined && (!finite(box.lineSpacingPercent) || box.lineSpacingPercent <= 0)) fail(where, 'lineSpacingPercent must be positive and finite');
  if (box.bullet && (!finite(box.bullet.indentInches) || !finite(box.bullet.hangingInches) || box.bullet.indentInches <= 0 || box.bullet.hangingInches <= 0 || box.bullet.hangingInches >= box.bullet.indentInches)) fail(where, 'bullet needs positive indent and a smaller hanging indent');
}

function validateProjectConfig(project) {
  const where = `Template config ${project.configPath || project.id || '(unknown)'}`;
  if (!nonempty(project.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id)) fail(where, 'id must be a lowercase hyphenated identifier');
  if (!nonempty(project.displayName)) fail(where, 'displayName is required');
  if (!nonempty(project.templateFile) || path.basename(project.templateFile) !== project.templateFile || !/\.pptx$/i.test(project.templateFile)) fail(where, 'templateFile must be a .pptx filename in this project folder');
  if (!project.archetypes || typeof project.archetypes !== 'object' || !Object.keys(project.archetypes).length) fail(where, 'archetypes must be a nonempty object');
  for (const [name, archetype] of Object.entries(project.archetypes)) {
    const at = `${where}, archetype ${name}`;
    if (!archetype || typeof archetype !== 'object') fail(at, 'must be an object');
    if (!Number.isInteger(archetype.slideNumber) || archetype.slideNumber < 1 || (archetype.slideId !== undefined && !Number.isInteger(archetype.slideId))) fail(at, 'slideNumber must be a positive integer; optional slideId must be an integer');
    for (const [fieldName, field] of Object.entries(archetype.fields || {})) {
      if (!['text', 'paragraphs'].includes(field.kind)) fail(at, `field ${fieldName} needs kind text or paragraphs`);
      if (!field.selector || (!nonempty(field.selector.name) && !nonempty(field.selector.creationId))) fail(at, `field ${fieldName} needs a shape selector`);
    }
    const contract = archetype.layoutContract;
    if (!contract) continue;
    for (const [regionName, region] of Object.entries(contract.regions || {})) validateBox(region, `${at}, region ${regionName}`);
    for (const [fieldName, regionName] of Object.entries(contract.fieldRegions || {})) {
      if (!archetype.fields?.[fieldName] || !contract.regions?.[regionName]) fail(at, `fieldRegions.${fieldName} must name an existing field and region`);
    }
    for (const group of contract.sharedTextGroups || []) {
      if (!Array.isArray(group) || group.length < 2 || group.some((fieldName) => !contract.fieldRegions?.[fieldName])) fail(at, 'sharedTextGroups must contain at least two configured fields');
    }
    const main = contract.mainContent || contract.regions?.visuals;
    if (main) validateBox(main, `${at}, main content`);
    for (const reserved of contract.reserved || []) {
      validateBox(reserved, `${at}, reserved ${reserved.name || '(unnamed)'}`);
      if (!finite(reserved.y) || !finite(reserved.h)) fail(at, 'reserved zones need fixed y and h');
    }
  }
  return project;
}

function validateVisualSpec(visual, where) {
  if (!visual || typeof visual !== 'object') fail(where, 'visualSpec must be an object');
  const schema = VISUAL_FIELDS[visual.type];
  if (!schema) fail(where, `unsupported visualSpec.type ${JSON.stringify(visual.type)}`);
  if (visual.assetPath) fail(where, 'assetPath is not supported by the current editable visual renderers');
  for (const key of schema.strings || []) {
    if (['supported', 'openQuestions'].includes(key)) {
      if (!nonempty(visual[key]?.title) || !Array.isArray(visual[key]?.items) || !visual[key].items.length || visual[key].items.some((item) => !nonempty(item))) fail(where, `${key} needs title and nonempty string items`);
    } else if (!nonempty(visual[key])) fail(where, `${key} must be a nonempty string`);
  }
  for (const [key, minimum] of Object.entries(schema.arrays || {})) {
    if (!Array.isArray(visual[key]) || visual[key].length < minimum) fail(where, `${key} needs at least ${minimum} items`);
    for (const [index, item] of visual[key].entries()) {
      if (!item || typeof item !== 'object') fail(where, `${key}[${index}] must be an object`);
      for (const field of schema.items[key]) {
        if (typeof item[field] === 'number') {
          if (!finite(item[field])) fail(where, `${key}[${index}].${field} must be finite`);
        } else if (!nonempty(item[field])) fail(where, `${key}[${index}].${field} is required`);
      }
    }
  }
  if (visual.type === 'comparison') {
    if (visual.measures.length !== 2) fail(where, 'comparison requires exactly two measures');
    for (const [i, measure] of visual.measures.entries()) {
      if (![measure.baseline, measure.pilot, measure.maximum].every(finite) || measure.maximum <= 0 || measure.baseline < 0 || measure.pilot < 0 || Math.max(measure.baseline, measure.pilot) > measure.maximum) fail(where, `measures[${i}] needs values from 0 through a positive maximum`);
    }
  }
  return visual;
}

function getVisualSpec(slide, where) {
  if (slide.visualSpec && slide.content?.visualSpec) fail(where, 'visualSpec is defined in both slide and content');
  return slide.visualSpec || slide.content?.visualSpec || null;
}

function validatePresentationPlan(project, presentation) {
  for (const slide of presentation.outline.slides) {
    const where = `Presentation ${presentation.id}, slide ${slide.number}`;
    const archetype = project.archetypes[slide.archetype];
    if (!archetype) fail(where, `unknown archetype ${JSON.stringify(slide.archetype)}`);
    const content = slide.content || {};
    for (const [fieldName, field] of Object.entries(archetype.fields || {})) {
      const value = content[fieldName];
      if (field.kind === 'paragraphs' ? !Array.isArray(value) || !value.length || value.some((v) => !nonempty(v)) : !nonempty(value)) fail(where, `content.${fieldName} is required as ${field.kind}`);
    }
    for (const key of Object.keys(content)) if (key !== 'visualSpec' && !archetype.fields?.[key]) fail(where, `content.${key} is not configured for ${slide.archetype}`);
    const visual = getVisualSpec(slide, where);
    if (visual) {
      validateVisualSpec(visual, `${where}, visualSpec`);
      if (!archetype.layoutContract?.mainContent && !archetype.layoutContract?.regions?.visuals) fail(where, 'visualSpec requires an archetype main-content region');
    }
  }
  return presentation;
}

function validateTemplateSelectors(project, report) {
  if (!report || !Array.isArray(report.slides) || !report.slideSize) fail(`Template ${project.id}`, 'run inspect:template to create template-info.json');
  const size = report.slideSize;
  if (![size.widthInches, size.heightInches].every(finite) || size.widthInches <= 0 || size.heightInches <= 0) fail(`Template ${project.id}`, 'inspection report has invalid slide dimensions');
  for (const [name, archetype] of Object.entries(project.archetypes)) {
    const where = `Template ${project.id}, archetype ${name}`;
    const slide = report.slides.find((candidate) => candidate.number === archetype.slideNumber && (archetype.slideId === undefined || candidate.id === archetype.slideId));
    if (!slide) fail(where, 'configured slideNumber/slideId was not found in template-info.json; rerun inspection');
    const contract = archetype.layoutContract;
    for (const [regionName, region] of Object.entries(contract?.regions || {})) {
      if (region.x + region.w > size.widthInches + 0.01 || (finite(region.y) && finite(region.h) && region.y + region.h > size.heightInches + 0.01)) fail(where, `region ${regionName} exceeds the slide dimensions`);
    }
    for (const zone of contract?.reserved || []) if (zone.x + zone.w > size.widthInches + 0.01 || zone.y + zone.h > size.heightInches + 0.01) fail(where, `reserved zone ${zone.name || '(unnamed)'} exceeds the slide dimensions`);
    for (const [fieldName, field] of Object.entries(archetype.fields || {})) {
      const matches = slide.elements.filter((element) =>
        (!field.selector.name || element.name === field.selector.name) &&
        (!field.selector.creationId || String(element.creationId || '').replace(/[{}]/g, '').toUpperCase() === String(field.selector.creationId).replace(/[{}]/g, '').toUpperCase()) &&
        (field.selector.creationId || field.selector.nameIdx === undefined || element.nameIdx === field.selector.nameIdx));
      if (matches.length !== 1) fail(where, `field ${fieldName} selector matched ${matches.length} shapes in template-info.json`);
    }
  }
  return report;
}

function loadTemplateReport(project) {
  const reportPath = path.join(project.templateDirectory, 'template-info.json');
  if (!fs.existsSync(reportPath)) fail(`Template ${project.id}`, 'run inspect:template before building');
  return validateTemplateSelectors(project, JSON.parse(fs.readFileSync(reportPath, 'utf8')));
}

module.exports = { getVisualSpec, loadTemplateReport, validateBox, validatePresentationPlan, validateProjectConfig, validateTemplateSelectors, validateVisualSpec };
