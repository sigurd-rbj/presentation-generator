# Project templates

`example-project/` is a neutral public demonstration. Other `templates/<project-id>/` directories are ignored by Git by default so authorized workgroup or customer templates stay local. Add a real project with a PowerPoint `.pptx` and `config.json`. Inspect it with:

```powershell
npm run inspect:template -- --project <project-id>
```

The command writes `template-info.json`; use its actual slide and shape identifiers in the config. The `.pptx` is the visual authority, including masters, layouts, and branding.
