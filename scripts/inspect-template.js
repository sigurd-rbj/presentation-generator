const fs = require('node:fs');
const path = require('node:path');
const { Automizer } = require('pptx-automizer');
const { getProjectTemplate } = require('../src/templates');

function readProjectArgument(args) {
  const inline = args.find((argument) => argument.startsWith('--project='));
  if (inline) return inline.slice('--project='.length);
  const index = args.indexOf('--project');
  return index >= 0 ? args[index + 1] : args[0];
}

const projectId = readProjectArgument(process.argv.slice(2));
if (!projectId) {
  console.error('Specify a local project template: npm run inspect:template -- --project <project-id>');
  process.exitCode = 1;
}

function readSlideSize(document) {
  const size = document.getElementsByTagName('p:sldSz').item(0);
  if (!size) return null;
  const cx = Number(size.getAttribute('cx'));
  const cy = Number(size.getAttribute('cy'));
  const emusPerInch = 914400;
  return {
    widthEmu: cx,
    heightEmu: cy,
    widthInches: Number((cx / emusPerInch).toFixed(3)),
    heightInches: Number((cy / emusPerInch).toFixed(3)),
  };
}

function serializeElement(element) {
  let placeholder = null;
  try {
    placeholder = element.getPlaceholderInfo();
  } catch {
    placeholder = null;
  }
  return {
    name: element.name,
    type: element.type,
    visualType: element.visualType,
    id: element.id,
    creationId: element.creationId,
    nameIdx: element.nameIdx,
    position: element.position,
    hasTextBody: element.hasTextBody,
    text: element.hasTextBody ? element.getText() : [],
    paragraphs: element.hasTextBody ? element.getParagraphs() : [],
    altText: element.getAltText(),
    placeholder,
  };
}

async function inspectTemplate() {
  const project = getProjectTemplate(projectId);
  const automizer = new Automizer({
    templateDir: project.templateDirectory,
    outputDir: path.join(project.templateDirectory, 'inspection-output'),
    autoImportSlideMasters: true,
    removeExistingSlides: true,
    verbosity: 0,
  });
  const presentation = automizer
    .loadRoot(project.templateFile)
    .load(project.templateFile, project.id);
  const info = await presentation.getInfo();
  const slideSize = readSlideSize(await presentation.rootTemplate.archive.readXml('ppt/presentation.xml'));
  const slides = info.slidesByTemplate(project.id).map((slide) => ({
    number: slide.number,
    id: slide.id,
    name: slide.info.name,
    layoutName: slide.info.layoutName,
    placeholders: slide.info.layoutPlaceholders,
    elements: slide.elements.map(serializeElement),
  }));

  const report = {
    projectId: project.id,
    displayName: project.displayName,
    templateFile: path.relative(projectRoot(project), project.templatePath),
    slideSize,
    slideCount: slides.length,
    slides,
  };
  const jsonPath = path.join(project.templateDirectory, 'template-info.json');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`${project.displayName} template (${project.id}): ${slides.length} slides`);
  console.log(`Slide dimensions: ${slideSize ? `${slideSize.widthInches} x ${slideSize.heightInches} in` : 'not found'}`);
  for (const slide of slides) {
    console.log(`\nSlide ${slide.number}: ${slide.name || '(unnamed)'} [layout: ${slide.layoutName || '(unknown)'}]`);
    for (const element of slide.elements) {
      const position = element.position
        ? `x=${element.position.x} y=${element.position.y} w=${element.position.cx} h=${element.position.cy}`
        : 'position unavailable';
      const text = element.text.length ? ` | text: ${element.text.join(' / ').replace(/\s+/g, ' ').slice(0, 180)}` : '';
      const paragraphCount = element.paragraphs.length ? ` | ${element.paragraphs.length} paragraphs` : '';
      console.log(`  ${element.name} | ${element.type}/${element.visualType} | ${position}${paragraphCount}${text}`);
    }
  }
  console.log(`\nMachine-readable inspection: ${jsonPath}`);
}

function projectRoot(project) {
  return path.resolve(project.templateDirectory, '..', '..');
}

if (projectId) {
  inspectTemplate().catch((error) => {
    console.error(`Template inspection failed: ${error.message}`);
    process.exitCode = 1;
  });
}