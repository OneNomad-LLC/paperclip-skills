# Paperclip skills

Skills for Paperclip agents that design and build product UI.

| Skill | For | What it covers |
|---|---|---|
| `product-design` | Designer agents | Brief, visual directions, design system rules, artboards at every size, clickable prototypes, a rendered self-review and a handoff spec. Ships `shoot.mjs` (render and lint HTML at many viewports and themes, record walkthrough videos). |
| `frontend-engineering` | Frontend agents | Build standards, tokens instead of hard-coded values, mock-data seams, verification order, the prototype loop with the designer. Ships `shoot.mjs` and `bundle-budget.mjs`. |
| `design-viewer` | Anyone who routes or works design feedback | Calls the [Design plugin](https://github.com/OneNomad-LLC/paperclip-plugin-design)'s agent tools: design status, feedback pins with images, re-rendering, artboard status. |

`product-design` and `frontend-engineering` also document the Design plugin's tools, and they work without it. The viewer sections simply won't apply.

## Install

Paperclip won't import skills that contain scripts from GitHub or skills.sh, and these do. Copy them into your company's managed skills folder and import them from there:

```sh
git clone https://github.com/OneNomad-LLC/paperclip-skills.git
COMPANY=<your company id>
DEST=~/.paperclip/instances/default/skills/$COMPANY
for skill in product-design frontend-engineering design-viewer; do
  rsync -a --delete paperclip-skills/$skill/ $DEST/$skill/
  paperclipai skills import $DEST/$skill -C $COMPANY
done
paperclipai skills list -C $COMPANY   # refreshes the file list
```

Then attach them to agents:

```sh
paperclipai skills agent sync <designer-agent-id> --skill product-design --mode add -C $COMPANY
paperclipai skills agent sync <frontend-agent-id> --skill frontend-engineering --mode add -C $COMPANY
```

To update later, pull and run the `rsync` again. Paperclip reads local skills from that folder, so the next run picks up the change.

## Requirements

- `shoot.mjs` installs Playwright into `~/.cache/paperclip-skill-tools` on first use and downloads Chromium.
- `design-tool.sh` needs `curl` and `node`, and uses the `PAPERCLIP_*` variables Paperclip sets in every run.

## Pairs well with

The catalog skill `design-critique` (`paperclipai skills install paperclipai/optional/product/design-critique`), which the `product-design` self-review step uses when it's attached.

## License

Apache 2.0
