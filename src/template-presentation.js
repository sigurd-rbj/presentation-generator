const fs = require('node:fs');
const path = require('node:path');
const { Automizer, ModifyShapeHelper, modify } = require('pptx-automizer');
const { getProjectTemplate, projectRoot } = require('./templates');
const { loadPresentation } = require('./presentations');
const { addTemplateVisual } = require('./template-visuals');
const { computeTextFlow } = require('./text-layout');
const { getVisualSpec, loadTemplateReport, validatePresentationPlan, validateTemplateSelectors } = require('./input-validation');

const EMU_PER_INCH = 914400;

function lighten(hex, amount) {
  const channels = hex.match(/.{2}/g).map((channel) => parseInt(channel, 16));
  return channels.map((channel) => Math.round(channel + (255 - channel) * amount).toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function readTemplatePalette(archive) {
  const theme = await archive.readXml('ppt/theme/theme1.xml');
  const scheme = theme.getElementsByTagName('a:clrScheme').item(0);
  const rawColors = {};
  for (const color of Array.from(scheme.childNodes).filter((node) => node.nodeType === 1)) {
    const value = color.firstChild?.getAttribute('lastClr') || color.firstChild?.getAttribute('val');
    if (value && /^[0-9A-F]{6}$/i.test(value)) rawColors[color.nodeName.replace('a:', '')] = value.toUpperCase();
  }
  const fontScheme = theme.getElementsByTagName('a:fontScheme').item(0);
  const majorFont = fontScheme.getElementsByTagName('a:majorFont').item(0)?.getElementsByTagName('a:latin').item(0)?.getAttribute('typeface');
  const minorFont = fontScheme.getElementsByTagName('a:minorFont').item(0)?.getElementsByTagName('a:latin').item(0)?.getAttribute('typeface');
  const ink = rawColors.dk2 || '1F497D';
  const blue = rawColors.accent1 || '4F81BD';
  const red = rawColors.accent2 || 'C0504D';
  const green = rawColors.accent3 || '9BBB59';
  const purple = rawColors.accent4 || '8064A2';
  const cyan = rawColors.accent5 || '4BACC6';
  const orange = rawColors.accent6 || 'F79646';
  return {
    font: majorFont || minorFont || 'Calibri',
    ink,
    muted: lighten(ink, 0.42),
    rule: lighten(ink, 0.78),
    white: 'FFFFFF',
    blue,
    blueTint: lighten(blue, 0.84),
    red,
    redTint: lighten(red, 0.84),
    green,
    greenTint: lighten(green, 0.84),
    purple,
    cyan,
    orange,
    orangeTint: lighten(orange, 0.84),
  };
}

function setParagraphText(element, content, selector, region = {}) {
  const body = element.getElementsByTagName('p:txBody').item(0);
  const existing = Array.from(body?.childNodes || []).filter((node) => node.nodeName === 'a:p');
  const textParagraphs = existing.filter((paragraph) => paragraph.getElementsByTagName('a:t').length > 0);
  if (!textParagraphs.length) throw new Error(`${selector.name}: template field has no text-bearing paragraph to copy`);

  const paragraphs = content.map((value, index) => {
    const paragraph = (textParagraphs[index] || textParagraphs.at(-1)).cloneNode(true);
    const textNodes = paragraph.getElementsByTagName('a:t');
    textNodes.item(0).textContent = value;
    for (let runIndex = 1; runIndex < textNodes.length; runIndex++) textNodes.item(runIndex).textContent = '';

    let properties = paragraph.getElementsByTagName('a:pPr').item(0);
    if (!properties) {
      properties = element.ownerDocument.createElement('a:pPr');
      paragraph.insertBefore(properties, paragraph.firstChild);
    }
    for (const tag of ['a:lnSpc', 'a:spcAft', 'a:buNone', 'a:buChar']) {
      for (const child of Array.from(properties.getElementsByTagName(tag))) child.parentNode.removeChild(child);
    }
    if (region.lineSpacingPercent) {
      const lineSpacing = element.ownerDocument.createElement('a:lnSpc');
      const percentage = element.ownerDocument.createElement('a:spcPct');
      percentage.setAttribute('val', String(Math.round(region.lineSpacingPercent * 1000)));
      lineSpacing.appendChild(percentage);
      properties.appendChild(lineSpacing);
    }
    if (region.paragraphGapInches && index < content.length - 1) {
      const after = element.ownerDocument.createElement('a:spcAft');
      const points = element.ownerDocument.createElement('a:spcPts');
      points.setAttribute('val', String(Math.round(region.paragraphGapInches * 72 * 100)));
      after.appendChild(points);
      properties.appendChild(after);
    }
    if (region.bullet) {
      properties.setAttribute('marL', String(Math.round(region.bullet.indentInches * EMU_PER_INCH)));
      properties.setAttribute('indent', String(-Math.round(region.bullet.hangingInches * EMU_PER_INCH)));
      const bullet = element.ownerDocument.createElement('a:buChar');
      bullet.setAttribute('char', '•');
      properties.appendChild(bullet);
    }
    return paragraph;
  });
  for (const paragraph of existing) paragraph.parentNode.removeChild(paragraph);
  for (const paragraph of paragraphs) body.appendChild(paragraph);
}

function applyTemplateTextFit(element, region) {
  const bodyProperties = element.getElementsByTagName('a:bodyPr').item(0);
  if (!bodyProperties) return;
  for (const tag of ['a:noAutofit', 'a:spAutoFit', 'a:normAutofit']) {
    for (const autofit of Array.from(bodyProperties.getElementsByTagName(tag))) {
      autofit.parentNode.removeChild(autofit);
    }
  }
  const normalAutofit = element.ownerDocument.createElement('a:normAutofit');
  normalAutofit.setAttribute('fontScale', '100000');
  bodyProperties.appendChild(normalAutofit);
  const size = Math.round(region.fontSize * 100);
  for (const tag of ['a:rPr', 'a:defRPr', 'a:endParaRPr']) {
    for (const properties of Array.from(element.getElementsByTagName(tag))) {
      properties.setAttribute('sz', String(size));
    }
  }
}

function applyTemplateRegion(element, region) {
  ModifyShapeHelper.setPosition({
    x: Math.round(region.x * EMU_PER_INCH),
    y: Math.round(region.y * EMU_PER_INCH),
    w: Math.round(region.w * EMU_PER_INCH),
    h: Math.round(region.h * EMU_PER_INCH),
  })(element);
  applyTemplateTextFit(element, region);
}

function queueFieldChanges(slide, archetype, content, layout) {
  for (const [fieldName, value] of Object.entries(content)) {
    const field = archetype.fields?.[fieldName];
    if (!field) throw new Error(`No configured field "${fieldName}" for archetype "${archetype.name}"`);

    if (field.kind === 'paragraphs' && !Array.isArray(value)) throw new Error(`${fieldName} must be an array of paragraph strings`);
    if (field.kind !== 'paragraphs' && typeof value !== 'string') throw new Error(`${fieldName} must be a string`);
    slide.modifyElement(field.selector, (element) => {
      const regionName = archetype.layoutContract?.fieldRegions?.[fieldName];
      const region = regionName ? layout.regions[regionName] : null;
      if (field.kind === 'paragraphs') setParagraphText(element, value, field.selector, region);
      else modify.setText(value)(element);
      if (region) applyTemplateRegion(element, region);
    });
  }
}

async function writeTemplateDeck({ project, slides, outputPath }) {
  const automizer = new Automizer({
    templateDir: project.templateDirectory,
    outputDir: path.dirname(outputPath),
    autoImportSlideMasters: true,
    removeExistingSlides: true,
    useCreationIds: project.useCreationIds !== false,
    verbosity: 1,
  });
  const presentation = automizer
    .loadRoot(project.templateFile)
    .load(project.templateFile, project.id);
  await automizer.setCreationIds();
  const currentSlides = (await presentation.getInfo()).slidesByTemplate(project.id);
  validateTemplateSelectors(project, { slideSize: loadTemplateReport(project).slideSize, slides: currentSlides });
  const palette = await readTemplatePalette(presentation.rootTemplate.archive);

  for (const plannedSlide of slides) {
    const archetype = project.archetypes[plannedSlide.archetype];
    if (!archetype) throw new Error(`Unknown archetype "${plannedSlide.archetype}" in project "${project.id}"`);
    const { visualSpec: unusedVisual, ...contentFields } = plannedSlide.content || {};
    const layout = computeTextFlow(archetype.layoutContract, contentFields, `Presentation ${project.id}, slide ${plannedSlide.number}, archetype ${plannedSlide.archetype}`);
    presentation.addSlide(project.id, archetype.slideId ?? archetype.slideNumber, (slide) => {
      queueFieldChanges(slide, { ...archetype, name: plannedSlide.archetype }, contentFields, layout);
      const visualSpec = getVisualSpec(plannedSlide, `Slide ${plannedSlide.number}`);
      if (visualSpec) {
        slide.generate((pptxSlide) => addTemplateVisual(pptxSlide, visualSpec, palette, layout, `Presentation ${project.id}, slide ${plannedSlide.number}, visualSpec`), `visual-${plannedSlide.number}`);
      }
    });
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const summary = await presentation.write(path.basename(outputPath));
  console.log(`Created ${outputPath}`);
  return summary;
}

async function buildTemplatePresentation({ projectId, presentationId } = {}) {
  if (!projectId || !presentationId) throw new Error('Template builds require a project id and presentation id.');
  const project = getProjectTemplate(projectId);
  const content = loadPresentation(presentationId);
  loadTemplateReport(project);
  validatePresentationPlan(project, content);
  const outputPath = path.join(projectRoot, 'output', `${content.id}.pptx`);

  console.log(`Presentation: ${content.id}`);
  console.log(`Brief: ${path.relative(projectRoot, content.briefPath)}`);
  console.log(`Loaded ${content.sources.length} Markdown/plain-text source file(s): ${content.sources.map((source) => source.relativePath).join(', ') || 'none'}`);
  if (content.unsupportedSources.length) {
    console.warn(`Not parsed (unsupported format): ${content.unsupportedSources.map((source) => source.relativePath).join(', ')}`);
  }
  console.log(`Discovered ${content.assets.length} optional asset file(s).`);
  console.log(`Outline: ${content.outline.slides.length} planned slide(s); template: ${project.displayName}`);
  await writeTemplateDeck({ project, slides: content.outline.slides, outputPath });
}

async function buildTemplateTest({ projectId } = {}) {
  if (!projectId) throw new Error('A local project id is required for template testing.');
  const project = getProjectTemplate(projectId);
  loadTemplateReport(project);
  const slides = project.templateTestSlides || [];
  if (!slides.length) throw new Error(`No template-test slides configured for project "${projectId}"`);
  validatePresentationPlan(project, { id: `${projectId}-template-test`, outline: { slides: slides.map((slide, index) => ({ ...slide, number: index + 1 })) } });
  const outputPath = path.join(projectRoot, 'output', 'template-tests', `${project.id}-test.pptx`);
  await writeTemplateDeck({ project, slides, outputPath });
}

module.exports = { buildTemplatePresentation, buildTemplateTest };
