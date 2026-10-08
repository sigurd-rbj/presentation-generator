# Presentations

`example/` is a synthetic public job. Other `presentations/<presentation-id>/` directories are ignored by Git by default so briefs, sources, and assets stay local. Create one directory per deck:

```text
presentations/<presentation-id>/
  brief.md
  outline.md
  sources/
  assets/
```

Read the brief and relevant sources, synthesize their evidence, and author the outline before building. Its fenced JSON slide list is the only build-time list; `npm run outline:summary -- --presentation <presentation-id>` derives a readable table. The loader reads UTF-8 `.md` and `.txt` source files only; it reports other formats without parsing them. Assets are optional and are not automatically inserted.
