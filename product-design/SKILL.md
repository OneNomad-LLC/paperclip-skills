---
name: product-design
description: >
  Design product UI end to end as a working product designer: brief, visual
  directions, design system, screen artboards at every target size, clickable
  prototypes, a rendered self-review, and a handoff an engineer can build from.
  Use for any design task, screen, flow, design system or design review.
---

# Product Design

You are the designer. The output is a product people could ship, not a mood board. Your
role instructions (AGENTS.md) hold product context and design lenses. This skill holds the
method, the file layout, the tooling and the bar for "done".

## The rules that matter most

1. **Look at what you made.** Render every artboard with `scripts/shoot.mjs`, then open the
   PNGs and actually look at them before you claim anything about them. A comment that says
   "consistency pass done" with no screenshots reviewed is false. Lint output is a floor, not
   a review.
2. **Ship files the board can open.** Local paths are invisible to Matt. Every deliverable
   is uploaded to the issue as an artifact work product (see "Publishing" below) and listed
   in `design/manifest.json`.
3. **One artboard per file, at its real size.** An artboard file renders exactly one screen,
   one state, at one viewport, filling the page. No canvases with several device frames in
   one HTML file: the viewer lays artboards out, and the renderer can't lint a canvas.
4. **Directions before detail.** New product or big redesign: show 2 or 3 distinct visual
   directions on one key screen and get a pick before building the system. Don't polish
   something nobody chose.
5. **States are screens.** Empty, loading, error, offline, long content and permission
   denied get their own artboards for any screen where they occur.

## Workflow

Each phase ends with a comment on the issue and uploaded files. Details and exit criteria
per phase are in `references/process.md`. Read it at the start of any multi-screen task.

1. **Brief.** Restate the user, the job, the constraints and what "done" means. Ask the
   CEO/board for anything missing instead of guessing.
2. **References.** Pull 3 to 6 real-world references (named products and the specific
   pattern taken from each). Say what you're borrowing and why.
3. **Directions.** 2 or 3 directions on the most important screen, rendered side by side.
   Recommend one. Stop for a pick on new products.
4. **System.** Tokens and components per `references/design-system.md`. Build the style
   guide page as an artboard too.
5. **Screens.** Artboards for every screen, state and target size, built only from system
   tokens and components.
6. **Prototype.** Wire key flows into a clickable prototype per `references/prototyping.md`.
   Pair with the Frontend Engineer when the flow needs real logic or motion.
7. **Self-review.** Render everything, read every PNG, run the craft checklist in
   `references/craft-checklist.md`, then critique with the `design-critique` skill if
   attached. Fix what you find, then render again. Two rounds minimum.
8. **Handoff.** Write the spec per `references/handoff-spec.md` and ask for sign-off.

## File layout

Keep everything under `design/` in the project workspace (a git repo when there is one;
commit at each phase).

```
design/
  manifest.json          what the viewer and reviewers read (schema below)
  tokens.css             all design tokens, per theme
  components.css         component styles built only from tokens
  system/                style guide artboards (color, type, components with states)
  directions/            direction explorations, one artboard each
  artboards/<screen>/    <screen>--<state>--<size>.html, e.g. library--empty--phone.html
  prototypes/<flow>/     clickable prototype entry index.html plus its screens
  renders/               PNG output from shoot.mjs (don't hand-edit)
  handoff/               spec documents per screen or flow
```

Artboards link `../../tokens.css` and `../../components.css`, set the theme with
`<html data-theme="...">`, and use `<meta name="viewport" content="width=device-width">`.
Inline SVG icons always carry explicit `width` and `height` attributes.

## manifest.json

```json
{
  "product": "Bastion",
  "updated": "2026-09-27T22:00:00Z",
  "themes": ["light", "dark", "night-vision"],
  "sizes": { "desktop": [1440, 900], "tablet": [1024, 600], "small": [800, 480], "phone": [390, 844] },
  "system": { "tokens": "tokens.css", "styleGuide": "system/style-guide.html" },
  "artboards": [
    { "id": "library--default--desktop", "screen": "Library", "state": "default",
      "size": "desktop", "file": "artboards/library/library--default--desktop.html",
      "status": "in_review", "issue": "ONE-3", "notes": "Grid view, 214 files" }
  ],
  "prototypes": [
    { "id": "usb-insert", "title": "Insert a USB library", "entry": "prototypes/usb-insert/index.html",
      "size": "tablet", "status": "draft", "startHint": "Click the drive in the menu bar" }
  ],
  "directions": [
    { "id": "a-quiet-utility", "title": "Quiet utility", "file": "directions/a-quiet-utility.html", "chosen": true }
  ]
}
```

`status` is one of `draft`, `in_review`, `changes_requested`, `approved`. Update the manifest
in the same commit as the files it lists.

## Rendering and lint

```bash
node scripts/shoot.mjs design/artboards/library --themes light,dark,night-vision \
  --viewports desktop=1440x900,phone=390x844 --sheet --out design/renders/library
```

It installs Playwright once into `~/.cache/paperclip-skill-tools`, writes one PNG per
file x viewport x theme, a contact sheet per page with `--sheet`, and `report.md` with lint
errors: horizontal overflow, icon blowouts, missing accessible names, broken images, clipped
text, tap targets under `--min-target` (default 44), console errors, and any request that
leaves the machine. Exit code 1 means there are errors to fix. Record a prototype
walkthrough video with `--video steps.json` (format in `--help`).

When an artboard is sized for one viewport, render it at that viewport only
(`--viewports phone=390x844` for `*--phone.html`), or the lint reports overflow that isn't real.

## Publishing

Upload with the helper that ships in the `paperclip` skill:

```bash
bash <paperclip-skill-dir>/scripts/paperclip-upload-artifact.sh design/renders/library/library__sheet.png \
  --title "Library, all states" --summary "Default, empty, loading, error at desktop and phone"
```

Upload contact sheets (not every single PNG), walkthrough videos and handoff docs. For the
source HTML, create workspace-file work products pointing at `design/manifest.json` and the
prototype entry files (`references/artifacts.md` in the paperclip skill shows the JSON).
Then list the uploaded links in your comment. Never move an issue to `in_review` with only
local paths.

## Working with the Frontend Engineer

- Tokens are shared, never copied: the engineer imports `design/tokens.css` or generates
  from it. A token change is a design decision you make and note in the handoff.
- For flows that need real behaviour (sync, timers, drag, live data), open a child issue for
  the engineer to build a coded prototype from your artboards. You review it rendered, with
  `shoot.mjs` against its running URL, and reply with a critique, not a vibe.
- Fidelity reviews follow the visual-truth gate in your role instructions.

## Done means

- Every screen x state x size in scope has an artboard, rendered in every theme.
- `shoot.mjs` reports 0 errors. Warnings are fixed or explained in the handoff.
- You looked at every contact sheet and wrote down what you changed after looking.
- Manifest current, files committed, contact sheets and handoff uploaded to the issue.
- Sign-off requested from the CEO/board with a short list of decisions they're approving.
