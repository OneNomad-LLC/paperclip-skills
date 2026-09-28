# Design process, phase by phase

Each phase has an output, an exit check and a comment. Skip a phase only when the issue
says it's already done, and say which one you skipped.

## 1. Brief

Output: a short brief in your first comment.

- Who uses it, in what situation (tired, cold, one-handed, on a 7" screen, in a hurry).
- The top 3 jobs, in the user's words. Each job is one sentence.
- Hard constraints: target sizes, themes, input (touch, mouse, keyboard, gloves), offline,
  performance, platform conventions.
- Scope: screens and flows in and out. Anything ambiguous becomes a question to the CEO.
- Definition of done for this issue.

Exit: no open question that changes layout. If one exists, ask and keep working on what
it doesn't touch.

## 2. References

Output: `design/references.md` with 3 to 6 entries.

Each entry names a real product, the specific pattern (e.g. "Apple Maps' collapsed
bottom sheet with a grabber and three detents"), and what we take from it. Avoid "clean and
modern" style notes. A reference that doesn't change a decision doesn't belong here.

## 3. Directions

Output: 2 or 3 artboards of the single most important screen in `design/directions/`,
a side-by-side contact sheet, and a recommendation.

Directions differ in substance: density, navigation model, type personality, how color is
used. Not three shades of the same layout. Each gets a 2-word name and 2 sentences on who
it serves best and what it gives up.

Exit: a pick from the CEO or board on new products. For work inside an existing system,
pick yourself and say why.

## 4. System

Output: `tokens.css`, `components.css`, `system/style-guide.html` and component
artboards. Rules in `design-system.md`.

Exit: every component used on the key screen exists with all its states, in every theme,
and `shoot.mjs` is clean on the style guide.

## 5. Screens

Output: artboards for every screen x state x size.

Work screen by screen, not size by size. Finish the desktop and phone versions of one
screen before starting the next, so layout decisions carry forward. Use realistic synthetic
data: real-looking names, awkward lengths, numbers with units, one item, zero items and
too many items.

For each screen, cover the states that apply:
default, empty, loading, error, offline, long content, permission denied, destructive
confirm, success.

Exit: the checklist in `craft-checklist.md` passes for the screen.

## 6. Prototype

Output: clickable prototypes for the flows named in the brief. See `prototyping.md`.

## 7. Self-review

1. Render all artboards in every theme with `--sheet`.
2. Open every contact sheet with your image-reading tool and look at it. Write down what's
   wrong: alignment, rhythm, weight, contrast, anything that looks unfinished.
3. Run `design-critique` (if attached) on the two most important screens.
4. Fix, render again, look again.

Your comment names the specific things you changed after looking. "Reviewed, all good" on
a first pass means you didn't look hard enough.

## 8. Handoff

Output: `design/handoff/<screen-or-flow>.md` per `handoff-spec.md`, uploaded, and a
sign-off request to the CEO listing the decisions being approved (direction, navigation
model, anything that changes scope or cost).

Keep the issue `in_review` until sign-off. After changes are requested, set the manifest
entries to `changes_requested`, fix them, then go back to step 7.
