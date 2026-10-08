# Public example project

`example-template.pptx` is an original, fictional Northstar Manufacturing Lab design made for this repository. It was created with editable PowerPoint shapes and text, then saved through Microsoft PowerPoint for Office compatibility. It contains nine reusable slides: cover, section divider, standard content, two-column, large visual, KPI results, process architecture, roadmap, and closing. These are template archetypes, not a finished pilot presentation.

`config.json` records the archetypes, named editable fields, usage notes, content regions, and reserved brand/footer zones. `template-info.json` is the inspection output. After changing the template, run `npm.cmd run inspect:template -- --project example-project`, then review selectors against the new report. The `Field_*` shape names are intentional and unique within each slide.

The associated [`presentations/example/`](../../presentations/example/) folder contains a fictional brief, source packet, original visual assets, and an authored 11-slide outline. The deck can be rebuilt with `npm.cmd run build:example` and reviewed through the normal validation and render commands.

Real templates belong in a different `templates/<project-id>/` directory; those directories are ignored by Git by default.
