const fs = require('node:fs');
const path = require('node:path');
const { Automizer } = require('pptx-automizer');
const { getProjectTemplate, projectRoot } = require('../src/templates');
const { loadPresentation } = require('../src/presentations');
const { computeTextFlow } = require('../src/text-layout');
const { getVisualSpec, loadTemplateReport, validatePresentationPlan } = require('../src/input-validation');
const { assertGeneratedGeometry } = require('../src/output-validation');

function readArgs(args) {
  const result = {};
  for (let index = 0; index < args.length; index++) {
    const [key, inlineValue] = args[index].split('=', 2);
    if (key === '--project') result.project = inlineValue || args[++index];
    if (key === '--presentation') result.presentation = inlineValue || args[++index];
  }
  return result;
}

function slideText(slide) {
  return slide.elements.flatMap((element) => element.hasTextBody ? element.getText() : []).join(' ');
}

async function validatePresentation({ projectId, presentationId }) {
  if (!projectId || !presentationId) throw new Error('Use --project <id> and --presentation <id>.');
  const project = getProjectTemplate(projectId);
  const content = loadPresentation(presentationId);
  validatePresentationPlan(project, content);
  const report = loadTemplateReport(project);
  const outputPath = path.join(projectRoot, 'output', `${presentationId}.pptx`);
  if (!fs.existsSync(outputPath)) throw new Error(`Presentation output not found: ${outputPath}`);

  const inspector = new Automizer({ templateDir: path.dirname(outputPath), outputDir: path.dirname(outputPath), verbosity: 0 });
  const output = inspector.loadRoot(path.basename(outputPath)).load(path.basename(outputPath), 'result');
  const info = await output.getInfo();
  const slides = info.slidesByTemplate('result');
  if (slides.length !== content.outline.slides.length) {
    throw new Error(`Expected ${content.outline.slides.length} slides, found ${slides.length}.`);
  }

  const dimensions = await output.rootTemplate.archive.readXml('ppt/presentation.xml');
  const slideSize = dimensions.getElementsByTagName('p:sldSz').item(0);
  const expectedDimensions = report.slideSize;
  if (Number(slideSize.getAttribute('cx')) !== expectedDimensions.widthEmu || Number(slideSize.getAttribute('cy')) !== expectedDimensions.heightEmu) {
    throw new Error('Output slide dimensions do not match the selected template.');
  }

  const outputMaster = await output.rootTemplate.archive.readXml('ppt/slideMasters/slideMaster1.xml');
  if (!outputMaster?.getElementsByTagName('p:sldMaster').length) throw new Error('Output has no readable PowerPoint slide master.');
  let generatedEditableElements = 0;
  for (const [index, planned] of content.outline.slides.entries()) {
    const archetype = project.archetypes[planned.archetype];
    if (!archetype) throw new Error(`Slide ${index + 1} selects unknown archetype "${planned.archetype}".`);
    const source = report.slides.find((slide) => slide.number === archetype.slideNumber);
    if (!source || (archetype.slideId !== undefined && source.id !== archetype.slideId) || slides[index].info.layoutName !== source.layoutName) {
      throw new Error(`Slide ${index + 1} did not retain the "${planned.archetype}" template layout.`);
    }
    const presentIds = new Set(slides[index].elements.map((element) => element.creationId).filter(Boolean));
    for (const original of source.elements.filter((element) => element.creationId)) {
      if (!presentIds.has(original.creationId)) throw new Error(`Slide ${index + 1} lost template element ${JSON.stringify(original.name)} (${original.creationId}).`);
    }
    for (const original of source.elements.filter((element) => !element.creationId)) {
      if (!slides[index].elements.some((element) => element.name === original.name)) throw new Error(`Slide ${index + 1} lost template element ${JSON.stringify(original.name)}.`);
    }

    const text = slideText(slides[index]);
    const { visualSpec: unusedVisual, ...fields } = planned.content || {};
    for (const value of Object.values(fields)) {
      for (const phrase of Array.isArray(value) ? value : [value]) {
        if (typeof phrase === 'string' && !text.includes(phrase)) {
          throw new Error(`Slide ${index + 1} is missing expected text: ${phrase}`);
        }
      }
    }

    const visualSpec = getVisualSpec(planned, `Slide ${index + 1}`);
    if (visualSpec) {
      const generated = slides[index].elements.filter((element) => element.name?.startsWith(`visual-${planned.number}-`));
      if (generated.length === 0) throw new Error(`Slide ${index + 1} has no generated visual elements.`);
      if (!generated.some((element) => element.hasTextBody || ['rectangle', 'textBox', 'vectorLine'].includes(element.visualType))) throw new Error(`Slide ${index + 1} has no editable generated diagram content.`);
      const layout = computeTextFlow(archetype.layoutContract, fields, `Presentation ${presentationId}, slide ${index + 1}`);
      assertGeneratedGeometry(generated, layout.mainContent, layout.reserved, expectedDimensions, `Slide ${index + 1}`);
      generatedEditableElements += generated.length;
      console.log(`Slide ${index + 1}: region and reserved-zone bounds checked; ${generated.length} generated element(s).`);
    } else {
      for (const element of slides[index].elements) {
        const { x, y, cx, cy } = element.position;
        if (cx === 0 || cy === 0) continue;
        if (x < 0 || y < 0 || x + cx > expectedDimensions.widthEmu || y + cy > expectedDimensions.heightEmu) {
          throw new Error(`Slide ${index + 1} template element "${element.name}" is outside slide bounds.`);
        }
      }
      console.log(`Slide ${index + 1}: ${planned.archetype}; template layout retained.`);
    }
  }

  console.log(`Validated ${slides.length} slides, ${expectedDimensions.widthInches} x ${expectedDimensions.heightInches} in, ${generatedEditableElements} generated editable elements: ${outputPath}`);
}

const args = readArgs(process.argv.slice(2));
validatePresentation({ projectId: args.project, presentationId: args.presentation }).catch((error) => {
  console.error(`Presentation validation failed: ${error.message}`);
  process.exitCode = 1;
});
