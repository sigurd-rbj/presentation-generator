---
name: powerpoint-authoring
description: Create, edit, or visually review PowerPoint presentations in this repository. Use for .pptx work, template inspection, slide layout, content planning, or rendering QA.
---

# PowerPoint Authoring

Use this workflow whenever creating or editing a deck in this repository.

## 1. Read and plan

1. Read the selected presentation's `brief.md` and all relevant readable files in `sources/` before drafting slide copy.
2. Inspect optional files under `assets/`; do not assume every asset is relevant or must be used.
3. Synthesize evidence across sources. Never make one slide per source, invent unsupported claims, or silently resolve conflicts/unknowns.
4. Create/update `outline.md` before generating slides. For every planned slide record its number, message/title, purpose, supporting content, intended visual, selected template archetype, and configured fields.

## 2. Select and inspect the template

1. `templates/<project>/` controls visual identity. A project `.pptx` is authoritative for masters, layouts, slide size, typography, colors, logos, backgrounds, footers, spacing, and decorative elements.
2. Never approximate an available project template using `src/theme.js` or hand-selected similar styling. Preserve original branding and master/layout relationships.
3. Inspect before selecting: `npm.cmd run inspect:template -- --project <project-id>`. Use `templates/<project>/template-info.json` and `config.json` for actual slide IDs, shape IDs, archetypes, and geometry. Do not guess selectors.
4. Use `pptx-automizer` with the real project deck as both root and source, `autoImportSlideMasters: true`, and `removeExistingSlides: true`; modify only intended content fields.
5. `pptxgenjs` is the editable-content bridge for diagrams/charts/cards that have no suitable native template element. Derive its palette and typography from the selected template.

## 3. Layout and visual hierarchy

- Give each slide one dominant message. Titles lead; supporting copy, labels, and numbers remain subordinate.
- Respect archetype safe zones for titles, subtitles, metadata, main content, logos, partner marks, slide numbers, and footer bands. Generated content belongs only in the configured main-content region.
- Inspect source-template placeholder geometry. Do not normalize intentional indentation or spacing merely to make elements look conventionally aligned.
- Stack text vertically: estimate/fit a title, then place its subtitle after the title's occupied height, then metadata, then the visual. Do not position dependent blocks with unrelated fixed Y values.
- Use the shared `src/text-layout.js` estimates and `fit: 'shrink'` constraints; preserve readable minimum sizes, expected wrapping, and avoid orphaned one-word lines. Keep generous vertical gaps when PowerPoint's exact font metrics are not known before rendering.
- For repeated rows/columns, calculate positions from one shared region, count, item size, and gap. Assert aligned top/bottom edges, equal dimensions, common left edges, and equal spacing.
- Derive connectors from the actual source/destination boxes. Center them on a visually meaningful anchor, leave clear gaps before both borders, and keep shafts/arrowheads in the whitespace between cards rather than on decorative edges or through text.
- Reuse consistent card padding, label baselines, contrast, and spacing. Use available space deliberately without crowding or leaving accidental dead zones. Do not force every slide into identical geometry.
- For paired or comparison cards, choose body typography for the group: use one readable font size, matching margins, line spacing, paragraph spacing, and aligned starting positions. Reconsider content or spacing before shrinking only one card.
- Give independent statements distinct editable paragraphs with comfortable spacing or subtle bullets when space permits; avoid dense newline blocks.
- Match a container's visual weight to the information it carries. Short category labels belong in compact tags or horizontal eyebrows. When reducing a low-information element, extend the primary visual into the recovered region where useful.
- Prefer editable native PowerPoint text, shapes, and charts. Do not use raster screenshots for diagrams/data that PowerPoint can represent natively.

## 4. Build and QA

Typical Windows commands (use `npm.cmd` if `npm.ps1` is blocked):

```powershell
npm.cmd run inspect:template -- --project <project-id>
npm.cmd run build -- --project <project-id> --presentation <presentation-id>
npm.cmd run validate:presentation -- --project <project-id> --presentation <presentation-id>
npm.cmd run render -- --presentation <presentation-id>
```

Structural validation checks slide count, dimensions, archetype/layout retention, text, editable objects, content regions, and bounds. This is necessary but not sufficient: an element can be inside bounds and still overlap text, artwork, or another object.

When PowerPoint COM is available, render every slide to `output/rendered/<presentation-id>/`, inspect every PNG, fix visible problems, rebuild, and render again. Check wrapping/clipping, title/logo clearance, title/subtitle alignment, vertical flow, connector/card clearance, equal gaps, card/text sizing, baseline alignment, footer obstruction, confusing layering, and whitespace balance. Some Office installations require PowerPoint's window to remain visible during COM rendering.

Do not call a deck complete until both structural checks and a fresh PowerPoint render have been reviewed. Keep QA outputs under `output/`; never alter the original project template during rendering.

## Adapted practice

This skill adapts useful PptxGenJS practices from the referenced Anthropic PPTX skill: native editable elements, explicit margins/padding, coherent hierarchy, safe text sizing, repeated spacing rules, and required rendered-slide review. It follows this repository's `pptx-automizer` template-first architecture and Microsoft PowerPoint COM renderer; it does not substitute LibreOffice or raw-OOXML editing.
