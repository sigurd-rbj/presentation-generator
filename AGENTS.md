# Presentation authoring rules

For any PowerPoint creation, editing, template, layout, or rendering task, use the repo-scoped `.codex/skills/powerpoint-authoring/SKILL.md` workflow.

## Separate the inputs

- `templates/` controls project/workgroup visual identity: masters, layouts, dimensions, fonts, colors, logos, backgrounds, footers, spacing, and decorative elements.
- `presentations/` controls the subject, audience, purpose, content, and narrative for one specific deck.
- A presentation folder contains `brief.md`, `sources/`, `assets/`, and an authored `outline.md`.
- Read the relevant presentation brief and source files before drafting or revising slide content.
- `sources/` provides factual/contextual evidence. Synthesize relevant material across files; never create one slide per source. Do not invent unsupported claims. Preserve conflicts, gaps, and uncertainty instead of silently resolving them.
- `assets/` contains optional visual resources. Inspect/select assets for relevance; do not assume every asset should be used.
- `brief.md` defines presentation intent and constraints. Not every possible brief field is required.
- `outline.md` is the intermediate narrative/slide plan. Before generation, create or update it with slide number, message/title, purpose, supporting content, intended visual, chosen template archetype, and template content fields.

## Templates and generation

- A project-specific `.pptx` template is the authoritative visual source. Never approximate an available template by manually choosing similar fonts, colors, or layouts in `src/theme.js`.
- Prefer copying and modifying actual template slides. Preserve masters, layouts, logos, branding, backgrounds, footer styles, and permanent elements.
- Inspect the actual template with `npm.cmd run inspect:template -- --project <project-id>` before choosing slide or shape selectors. Use its `template-info.json`; never guess slide numbers, names, creation IDs, or dimensions.
- Store project IDs, archetypes, selectors, intended usage, and template-test content in `templates/<project>/config.json`. If selectors rely on generic/duplicate names, document exact shapes and recommend Selection Pane renames; do not silently modify the supplied template.
- Use `pptx-automizer` for project templates with the project deck as root and source, `autoImportSlideMasters: true`, and `removeExistingSlides: true` for selected-slide output. Await `write()`.
- Modify only presentation-specific text/data fields. Preserve original text formatting, paragraphs, layouts, masters, and permanent branding.
- Use PptxGenJS for genuinely dynamic diagrams/charts when needed, keeping them editable and deriving style from the selected project where practical.
- `src/theme.js` and the existing PptxGenJS generator are the fallback when no project template is selected. Do not remove that generic path.
- Normal template builds select both inputs, for example `npm.cmd run build -- --project <project-id> --presentation <presentation-id>`. Template QA is separate: `npm.cmd run test:template -- --project <project-id>`.

## Source-format limits

- The current presentation loader reads UTF-8 Markdown (`.md`) and text (`.txt`) files only.
- It does not parse PDF, DOCX, XLSX, CSV, or PPTX sources. Report this limitation; do not claim their contents were read. Assets are inventoried but not automatically inserted.
- Source reading and synthesis happen before the authored outline is used to generate PowerPoint. The generator is not a document-understanding or claim-verification model.

## Slide craft and validation

- Give every slide one main message and make it clear in the title.
- Avoid walls of text. Prefer concise labels, diagrams, charts, and other visual communication.
- Keep text large and readable when projected; remove detail that does not support the slide's message.
- Keep every element within slide bounds and preserve the active template's spacing and styling.
- Prefer native PowerPoint text, shapes, and charts so the deck remains editable.
- Staying inside slide bounds is not sufficient for visual correctness. Respect archetype-specific safe zones, including title/logo areas, footer bands, partner marks, and page numbers.
- Place generated content only inside the active archetype's configured main-content region. Do not overlap template-owned placeholders, artwork, or reserved regions.
- Stack titles, subtitles, metadata, and main visuals in vertical flow. Estimate the rendered text height conservatively; the next block's position must account for wrapping in the previous block.
- Use the shared text-fit constraints: allow expected wrapping, reduce font size to its sensible minimum before placing adjacent content, and avoid orphaned one-word lines where practical.
- When PowerPoint is available, render every slide with `npm.cmd run render -- --presentation <presentation-id>` and visually review the PNGs. Structural XML/bounds checks are one QA layer, not a replacement for rendered-slide review.
- Correct visible overlaps, clipping, logo collisions, poor spacing, inconsistent alignment, footer obstruction, and unbalanced unused regions, then rebuild and render again.
- Verify claims against source material and record attribution in `content/sources.md` when applicable.
- Generate into `output/`. Validate the actual `.pptx`, including slide count, intended template archetypes/layouts, editable replacements, and master/branding retention, before considering presentation work complete.
- When changing shared generation paths, test both the project-template build and the generic fallback. On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked.