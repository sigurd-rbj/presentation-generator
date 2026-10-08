const { loadPresentation } = require('../src/presentations');

const args = process.argv.slice(2);
const inline = args.find((arg) => arg.startsWith('--presentation='));
const index = args.indexOf('--presentation');
const id = inline ? inline.slice('--presentation='.length) : index >= 0 ? args[index + 1] : args[0];
if (!id) {
  console.error('Usage: npm run outline:summary -- --presentation <id>');
  process.exitCode = 1;
} else {
  try {
    const presentation = loadPresentation(id);
    console.log('| Slide | Message/title | Purpose | Visual | Archetype |');
    console.log('| --- | --- | --- | --- | --- |');
    for (const slide of presentation.outline.slides) {
      const cells = [slide.number, slide.title, slide.purpose, slide.visual, slide.archetype]
        .map((value) => String(value).replace(/\|/g, '\\|').replace(/\s+/g, ' '));
      console.log(`| ${cells.join(' | ')} |`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
