# Prototyping with the Product Designer

The designer owns how it looks and behaves. You own how it's built and how it feels to
use on real hardware. A prototype is where those meet, so keep the loop short.

## Kickoff

The designer opens a child issue with the flow, manifest ids, the interactions that matter
and acceptance criteria. In your first comment, reply with:

- your reading of the flow as numbered steps,
- the questions that block you (keep it to what changes the build),
- what you'll fake and how (data, timing, hardware events),
- when the first clickable build will be up (in heartbeats, not hours).

## First build fast, then fidelity

1. **Skeleton pass**: every step of the flow reachable and clickable, with real layout and
   placeholder styling. Post the live URL and a walkthrough video. The designer checks flow
   and order before anyone polishes.
2. **Fidelity pass**: tokens, components, every state, motion. Render and compare against
   the artboards yourself before asking for review.
3. **Feel pass**: timing, transitions, touch response and performance on the slowest target.
   These are the things artboards can't show, so propose values and let the designer adjust
   them.

## Running it where people can see it

- If the project workspace has a Paperclip runtime service configured, start it through the
  runtime-services endpoints (paperclip skill, `references/issue-workspaces.md`) and post
  its URL.
- Otherwise start `pnpm preview --host 127.0.0.1 --port <free port>` in the background and
  post that URL. Say that it only works on this machine and while the process runs.
- Either way, also commit the static build path to the manifest so the design viewer can
  show it after the server stops.

## Review etiquette

- The designer replies with must, should and nice-to-fix items. Must-fix items block
  handoff. Should-fix items get fixed or an explanation. Nice-to-fix items get logged.
- Disagree with evidence (a render, a measurement, a device constraint), not taste.
- When a fix changes a design decision (a new token, a changed layout), the designer
  updates the artboard and the handoff so code and design don't drift.
