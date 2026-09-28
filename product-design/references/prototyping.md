# Clickable prototypes

Two kinds. Pick the lighter one that answers the question.

## Designer prototype (HTML, you build it)

For navigation, flow order, sheet and dialog behaviour, and copy. No build step.

```
design/prototypes/<flow>/
  index.html     the shell: loads tokens.css and components.css, holds every step
  flow.js        tiny state machine, under 150 lines
  steps.json     walkthrough script for shoot.mjs --video
```

Rules:

- One `index.html` with each step as a `<section data-step="...">`. `flow.js` shows one step
  at a time and moves on `data-go="<step>"` clicks. Deep-link with `#<step>` so a reviewer can
  open any step directly.
- Reuse artboard markup. Don't redesign inside the prototype. If the prototype changes a
  screen, change the artboard too.
- Fake time and data with plain JS (a `setTimeout` for "scanning drive…"), and keep a
  visible "Restart" control in a corner outside the product UI.
- Keyboard works: Tab reaches everything, Enter and Space activate, Escape closes sheets.
- Honour `prefers-reduced-motion`.

Record it:

```bash
node scripts/shoot.mjs design/prototypes/usb-insert/index.html --no-lint \
  --video design/prototypes/usb-insert/steps.json --video-viewport 1024x600 \
  --out design/renders/usb-insert
```

Upload the `.webm` and add the prototype to `manifest.json` with a `startHint`.

## Coded prototype (the Frontend Engineer builds it, you direct)

For anything with real logic: live data, sync, drag and drop, timers, animation you need to
feel, and performance on the target device.

1. Open a child issue assigned to the Frontend Engineer. Include the flow, the artboards it
   covers (manifest ids), the interactions that matter and your acceptance criteria.
2. The engineer runs it as a Paperclip runtime service and posts the URL, plus screenshots
   and a walkthrough.
3. Review against the running URL:
   `node scripts/shoot.mjs http://127.0.0.1:<port>/#/library --themes light,dark --sheet`.
   Look at the renders and use the prototype yourself. Reply with a must/should/nice list.
4. Two review rounds is normal. If a third one is needed, the artboards were probably
   underspecified. Fix the handoff spec, not only the build.

Add the coded prototype to `manifest.json` with `"entry": "<url>"` and `"kind": "coded"`.
