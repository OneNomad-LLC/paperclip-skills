---
name: frontend-engineering
description: >
  Build production-quality frontend code and coded interactive prototypes from a
  designer's artboards and tokens: project setup, component and token discipline,
  mock-data seams, accessibility, performance budgets, rendered verification and
  a review loop with the Product Designer. Use for any UI build, prototype, frontend
  bug or fidelity fix.
---

# Frontend Engineering

You turn approved designs into software that feels finished. Your role instructions
(AGENTS.md) set the product, stack and git rules. This skill holds the method, the standards
and the verification bar.

## The rules that matter most

1. **The design is the spec.** Build from `design/manifest.json`, the artboards and
   `design/handoff/*.md`. When the spec is silent or wrong, ask the designer in a comment and
   build the most conservative reading meanwhile. Never invent visual design.
2. **Tokens, never values.** Colors, spacing, type, radius, shadow and motion come from
   `design/tokens.css` (imported or generated). A raw hex or px value in a component is a
   bug unless it's a 1px hairline.
3. **Look at what you built.** Every handoff includes renders from `scripts/shoot.mjs`
   against the running app at every target size and theme, and you opened and looked at
   them. Typecheck passing isn't a UI review.
4. **Ship something the board can open.** A prototype has a static build that opens
   offline, plus a live URL while it's running. Both go in the manifest and on the issue.
5. **Small, verified steps.** One screen or one component family per commit, each one
   typechecked, built and rendered.

## Workflow

1. **Read the spec.** Manifest entries for your issue, their artboards (render them with
   `shoot.mjs` so you see what the designer saw) and the handoff doc. List gaps as
   questions in your first comment, along with your success condition.
2. **Scaffold or orient.** New project: follow `references/build-standards.md`. Existing
   project: read its structure and match it.
3. **Build primitives first.** Tokens wired in, then the components the screen needs with
   all their states, then the screen.
4. **Wire mock data** behind typed service interfaces (see build standards). Include the
   awkward cases: empty, huge, slow, failing and offline.
5. **Verify** per `references/verification.md`: typecheck, lint, tests, build, bundle
   budget, renders, a walkthrough for flows.
6. **Hand off** to the Product Designer for fidelity review with the live URL, static build
   path, contact sheets and walkthrough uploaded. Then fix, re-render and reply. See
   `references/prototype-with-design.md` for the loop.

## Prototype delivery

- Use hash routing (`#/library`) so every screen deep-links, including from a static file.
- `pnpm build` with `base: "./"` must produce a `dist/` that works when opened straight from
  disk or served from any subpath. That's what the design viewer embeds.
- Include a dev-only control panel (toggled with a keyboard shortcut and hidden in
  screenshots) to switch theme, jump to states (empty, error, offline) and fire simulated
  events (USB insert, low battery). Reviewers use it to see every state without editing
  code. Support the same via query params (`?theme=dark&state=empty`) so `shoot.mjs` can
  reach them.
- Register it in `design/manifest.json` under `prototypes` with `"kind": "coded"`, the
  `dist/index.html` path as `entry` and the live URL as `url`.

## Design viewer tools

The approved design lives in Paperclip's Design viewer. `bash scripts/design-tool.sh design_status`
lists every artboard, its status and open feedback. When you get a "Feedback: …" issue about the built
prototype, run `bash scripts/design-tool.sh design_feedback '{"issue":"ONE-14"}'` and open both
images it prints. They show the artboard and the exact spot the board pointed at. Build to the
artboards marked `approved`, and ask the designer about anything still `in_review`.

## Tooling

- `scripts/shoot.mjs` renders URLs or files at several viewports and themes, lints the
  result (overflow, icon blowouts, accessible names, tap targets, console errors, external
  requests) and records walkthrough videos. Run it with `--help`.
- `scripts/bundle-budget.mjs dist --budget-kb 250` reports gzipped JS and CSS per file and
  fails over budget.
- Upload deliverables with the `paperclip` skill's `scripts/paperclip-upload-artifact.sh`.

## Done means

- Typecheck, lint, tests and build pass. Bundle within budget.
- `shoot.mjs` reports 0 errors at every target size and theme for the screens you touched.
- Every state in the handoff is reachable through the control panel or query params, and
  rendered.
- Designer fidelity review requested with uploaded renders. Their must-fix items are closed.
- Committed on the feature branch with short, lowercase, imperative messages.
