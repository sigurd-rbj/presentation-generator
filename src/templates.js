const fs = require('node:fs');
const path = require('node:path');
const { validateProjectConfig } = require('./input-validation');

const projectRoot = path.resolve(__dirname, '..');
const templatesRoot = path.join(projectRoot, 'templates');

function loadProjectTemplates(root = templatesRoot) {
  if (!fs.existsSync(root)) return new Map();

  const projects = new Map();
  for (const directoryName of fs.readdirSync(root)) {
    const directory = path.join(root, directoryName);
    const configPath = path.join(directory, 'config.json');
    if (!fs.statSync(directory).isDirectory() || !fs.existsSync(configPath)) continue;

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    for (const archetype of Object.values(config.archetypes || {})) {
      for (const field of Object.values(archetype.fields || {})) {
        const creationId = field.selector?.creationId;
        if (creationId && !creationId.startsWith('{')) {
          field.selector.creationId = `{${creationId}}`;
        }
      }
    }
    config.configPath = configPath;
    config.templateDirectory = directory;
    validateProjectConfig(config);
    config.templatePath = path.resolve(directory, config.templateFile);
    if (config.id !== directoryName) throw new Error(`${configPath}: id must match its directory name`);
    if (projects.has(config.id)) throw new Error(`Duplicate presentation project id: ${config.id}`);
    projects.set(config.id, config);
  }
  return projects;
}

function getProjectTemplate(projectId) {
  const project = loadProjectTemplates().get(projectId);
  if (!project) {
    const available = [...loadProjectTemplates().keys()];
    throw new Error(`Unknown project template "${projectId}". Available: ${available.join(', ') || 'none'}`);
  }
  if (!fs.existsSync(project.templatePath)) {
    throw new Error(`PowerPoint template not found: ${project.templatePath}`);
  }
  return project;
}

module.exports = { getProjectTemplate, loadProjectTemplates, projectRoot };
