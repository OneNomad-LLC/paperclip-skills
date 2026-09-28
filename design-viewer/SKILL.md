---
name: design-viewer
description: >
  Read and act on the project's Design viewer from inside a run: design status, feedback pins with
  images of the pinned spot, re-rendering, and artboard status. Use when triaging or working a
  "Feedback: …" issue, or when you need to know which screens are approved.
---

# Design viewer

The board reviews designs in Paperclip's Design viewer and leaves feedback by pinning a comment on an
artboard. Each pin becomes a "Feedback: …" issue. These tools read the same data the board sees.

```bash
bash scripts/design-tool.sh design_status                          # artboards, statuses, lint, open feedback
bash scripts/design-tool.sh design_feedback '{"issue":"PRJ-14"}'   # the comment plus two images of the pinned spot
bash scripts/design-tool.sh design_render                          # re-render changed files, return lint
bash scripts/design-tool.sh design_set_status '{"screen":"dashboard","status":"in_review"}'
bash scripts/design-tool.sh design_add_size '{"artboardId":"settings--default--desktop","width":1440,"height":"auto"}'
```

- Before routing or working a feedback issue, run `design_feedback` and open both image paths it
  prints. The red ring marks the spot the board pointed at.
- Mention what the images show when you route it, so the next agent doesn't have to guess.
- Only the board marks artboards `approved`.
