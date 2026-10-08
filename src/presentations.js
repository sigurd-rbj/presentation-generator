const fs = require('node:fs');
const path = require('node:path');
const { projectRoot } = require('./templates');

const presentationsRoot = path.join(projectRoot, 'presentations');
const supportedSourceExtensions = new Set(['.md', '.txt']);

function listFiles(directory, root = directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? listFiles(fullPath, root)
      : [{ fullPath, relativePath: path.relative(root, fullPath) }];
  }).sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function readOutline(outlinePath) {
  const markdown = fs.readFileSync(outlinePath, 'utf8');
  if (/^\s*\|[^\n]*\|\s*$/m.test(markdown.replace(/```[\s\S]*?```/g, ''))) {
    throw new Error(`${outlinePath}: remove the independently edited slide table. The fenced JSON is the sole slide list; run npm run outline:summary -- --presentation <id> for a readable table.`);
  }
  const jsonBlock = markdown.match(/```json\s*([\s\S]*?)```/i);
  if (!jsonBlock) throw new Error(`${outlinePath} must contain a fenced JSON slide plan`);
  const outline = JSON.parse(jsonBlock[1]);
  if (!Array.isArray(outline.slides) || outline.slides.length === 0) {
    throw new Error(`${outlinePath} must define a non-empty slides array`);
  }
  outline.slides.forEach((slide, index) => {
    if (slide.number !== index + 1) throw new Error(`${outlinePath}: slide numbers must be sequential starting at 1`);
    for (const field of ['title', 'purpose', 'supportingContent', 'visual', 'archetype']) {
      if (!slide[field]) throw new Error(`${outlinePath}: slide ${index + 1} is missing ${field}`);
    }
    if (!slide.content || typeof slide.content !== 'object') {
      throw new Error(`${outlinePath}: slide ${index + 1} needs a content object for configured template fields`);
    }
  });
  return { markdown, slides: outline.slides };
}

function loadPresentation(presentationId, root = presentationsRoot) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(presentationId || '')) {
    throw new Error(`Invalid presentation id "${presentationId}". Use lowercase letters, numbers, and hyphens.`);
  }
  const directory = path.join(root, presentationId);
  const briefPath = path.join(directory, 'brief.md');
  const outlinePath = path.join(directory, 'outline.md');
  if (!fs.existsSync(briefPath)) throw new Error(`Presentation brief not found: ${briefPath}`);
  if (!fs.existsSync(outlinePath)) throw new Error(`Presentation outline not found: ${outlinePath}`);

  const brief = fs.readFileSync(briefPath, 'utf8');
  const sourceFiles = listFiles(path.join(directory, 'sources'));
  const sources = sourceFiles
    .filter((source) => supportedSourceExtensions.has(path.extname(source.fullPath).toLowerCase()))
    .map((source) => ({ ...source, content: fs.readFileSync(source.fullPath, 'utf8') }));
  const unsupportedSources = sourceFiles.filter((source) => !supportedSourceExtensions.has(path.extname(source.fullPath).toLowerCase()));

  return {
    id: presentationId,
    directory,
    briefPath,
    brief,
    outlinePath,
    outline: readOutline(outlinePath),
    sources,
    unsupportedSources,
    assets: listFiles(path.join(directory, 'assets')),
  };
}

module.exports = { listFiles, loadPresentation, readOutline, presentationsRoot, supportedSourceExtensions };
