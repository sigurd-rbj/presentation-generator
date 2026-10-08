const { buildTemplateTest } = require('../src/template-presentation');

function readProjectArgument(args) {
  const inline = args.find((argument) => argument.startsWith('--project='));
  if (inline) return inline.slice('--project='.length);
  const index = args.indexOf('--project');
  return index >= 0 ? args[index + 1] : args[0];
}

const projectId = readProjectArgument(process.argv.slice(2));
if (!projectId) {
  console.error('Specify a local project template: npm run test:template -- --project <project-id>');
  process.exitCode = 1;
} else {
  buildTemplateTest({ projectId }).catch((error) => {
    console.error(`Template test failed: ${error.message}`);
    process.exitCode = 1;
  });
}