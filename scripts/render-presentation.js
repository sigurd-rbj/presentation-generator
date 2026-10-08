const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { projectRoot } = require('../src/templates');

function readPresentationId(args) {
  const inline = args.find((argument) => argument.startsWith('--presentation='));
  if (inline) return inline.slice('--presentation='.length);
  const index = args.indexOf('--presentation');
  return index >= 0 ? args[index + 1] : args[0];
}

const presentationId = readPresentationId(process.argv.slice(2));
if (!presentationId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(presentationId)) {
  console.error('Usage: npm run render -- --presentation <presentation-id>');
  process.exitCode = 1;
} else {
  const presentationPath = path.join(projectRoot, 'output', `${presentationId}.pptx`);
  const renderDirectory = path.join(projectRoot, 'output', 'rendered', presentationId);
  const rendererPath = path.join(projectRoot, 'scripts', 'render-presentation.ps1');
  const result = spawnSync('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    rendererPath,
    '-PresentationPath',
    presentationPath,
    '-OutputDirectory',
    renderDirectory,
  ], { stdio: 'inherit', windowsHide: true });

  if (result.error) {
    console.error(`Could not start PowerPoint renderer: ${result.error.message}`);
    process.exitCode = 1;
  } else if (result.status !== 0) {
    process.exitCode = result.status || 1;
  }
}