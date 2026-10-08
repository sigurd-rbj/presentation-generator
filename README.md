# Editable PowerPoint generator

This is an early-stage Node.js framework for creating editable widescreen PowerPoint decks. It has two paths: a standalone PptxGenJS demonstration and project-template builds that copy real PowerPoint slides with `pptx-automizer`. The project template supplies visual identity; a separate presentation job supplies the narrative and content. The framework still needs an authored outline and a rendered-slide review for production work.

## Requirements and setup

- Node.js 20 or newer and npm.
- Microsoft PowerPoint on Windows only for the optional COM rendering workflow. Builds, structural validation, and automated tests do not need PowerPoint.

```powershell
npm install
npm test
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

## Quick start

The generic PptxGenJS path needs no template or presentation folder. It creates an eight-slide interactive demonstration at `output/presentation.pptx`:

```powershell
npm run build
```

The repository also includes a fictional public worked example: a nine-archetype PowerPoint template and an industrial pilot brief with six source files, four original SVG assets, and an authored 11-slide outline. It exercises the project-template build path without private files:

```powershell
npm.cmd run inspect:template -- --project example-project
npm.cmd run build:example
npm.cmd run validate:presentation -- --project example-project --presentation example
npm.cmd run render -- --presentation example
```

The build writes `output/example.pptx`. See [`templates/example-project/`](templates/example-project/) and [`presentations/example/`](presentations/example/). All pilot facts are fictional and internally documented in `presentations/example/fixture-notes.md`; they are not empirical claims about a real site.

## Template and presentation inputs

The two inputs are independent:

```text
templates/<project-id>/
  <template>.pptx       # actual PowerPoint visual source
  config.json            # archetypes, slide selectors, fields, safe regions
  template-info.json     # generated inspection report

presentations/<presentation-id>/
  brief.md               # audience, purpose, length, constraints
  sources/               # factual or contextual material
  assets/                # optional visuals for author review
  outline.md             # authored slide plan
```

Real project directories under `templates/` and presentation jobs under `presentations/` are **ignored by Git by default**. Only the explicitly allowlisted public examples are eligible for commit. Keep confidential material in a new local project/job directory; do not place it in the public example folders.

To add a local project, put an authorized `.pptx` under `templates/<project-id>/`, create `config.json`, then inspect the actual slide and shape IDs before choosing selectors:

```powershell
npm run inspect:template -- --project <project-id>
npm run test:template -- --project <project-id>
```

The inspection command writes `template-info.json` in that local project directory. Template QA writes a separate deck under `output/template-tests/`. A template is not shipped for a new private project by this repository; the project owner must supply it. The original PowerPoint remains the authority for masters, layouts, dimensions, theme, branding, and permanent elements. Dynamic diagrams use editable PowerPoint shapes and text within configured content regions.

To add a presentation, write its brief, review its sources and optional assets, then author `outline.md`. The fenced JSON `slides` array in the outline is the **sole build-time slide list**. Each slide records its number, title, purpose, supporting content, intended visual, archetype, and configured content fields. `outline:summary` derives a readable table from that JSON; a second manually edited slide table is rejected so it cannot disagree with the build data. Sources should be synthesized across files, not mapped one-to-one to slides.

The loader reads UTF-8 **`.md` and `.txt`** source files. PDF, DOCX, XLSX, CSV, and PPTX sources are reported but **not parsed**. Assets are inventoried but not automatically inserted. Source interpretation, claim checking, and outline authoring are human/agent workflow steps, not functions of the generator.

Build a deck using a compatible installed template and presentation job:

```powershell
npm run build -- --project <project-id> --presentation <presentation-id>
npm run validate:presentation -- --project <project-id> --presentation <presentation-id>
```

## Validation and visual QA

Input checks cover project configuration, slide plans, visual types, required fields, shape selectors, and layout geometry. Structural validation checks output slide count and size, selected layouts, retained template elements, required text, editable generated content, and generated bounds and reserved zones. These checks do not establish visual quality or factual accuracy.

On a Windows computer with PowerPoint installed, render through Microsoft PowerPoint and inspect **every** PNG for wrapping, clipping, overlaps, footer/logo clearance, spacing, and visual balance:

```powershell
npm run render -- --presentation <presentation-id>
```

The renderer writes `output/rendered/<presentation-id>/Slide*.PNG`. It opens PowerPoint through COM, exports images, and does not edit the input deck. COM rendering is a local Windows workflow; ordinary Linux CI should run the automated tests and structural checks without assuming PowerPoint is available.

## Current limits

- The generic deck is a fixed demonstration, not a brief-driven generator.
- Template builds require a supplied PowerPoint file, a matching config, an inspection report, and an authored JSON slide plan.
- Only the built-in editable visual types are supported; arbitrary image assets are not inserted automatically.
- Text-fit estimates and structural geometry checks cannot replace PowerPoint-rendered visual review.
- The repository has no explicit open-source LICENSE file. Public visibility alone does not grant rights to reuse or redistribute the code; licensing needs a separate decision by the rights holder.
