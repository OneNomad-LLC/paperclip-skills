# Verification

Run in this order and stop at the first failure. Do it once per logical change, not after
every edit.

```bash
pnpm typecheck && pnpm lint && pnpm test --run && pnpm build
node <skill>/scripts/bundle-budget.mjs dist --budget-kb 250
```

Then render against the running app (use `pnpm preview` for a production-like build):

```bash
node <skill>/scripts/shoot.mjs \
  "http://127.0.0.1:4173/#/library" "http://127.0.0.1:4173/#/library?state=empty" \
  --themes light,dark,high-contrast \
  --viewports desktop=1440x900,tablet=1024x600,small=800x480,phone=390x844 \
  --sheet --out renders/library
```

- Exit code 1 means lint errors. Fix them.
- Open each contact sheet and look at it next to the matching artboard render. Note
  differences in spacing, alignment, type, color and icon size. That list, with what you did
  about each item, goes in your handoff comment.
- For flows, record a walkthrough with `--video steps.json --video-viewport 1024x600`.

## What to upload

- Contact sheets for every screen touched.
- The walkthrough `.webm` for flows.
- `report.md` from `shoot.mjs` if it has warnings you're leaving on purpose, with reasons.

## Handoff comment shape

- What was built (manifest ids covered).
- How to see it: live URL, static build path, control panel shortcut.
- Verification: the commands run and their result, bundle size, and the lint error count
  (should be 0).
- Differences from the design you know about and why.
- What you need from the designer.
