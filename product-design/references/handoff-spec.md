# Handoff spec template

One file per screen or flow in `design/handoff/`. An engineer should be able to build it
without asking a question. If you'd expect a question, answer it here.

```md
# <Screen or flow>

Artboards: <manifest ids>   Prototype: <manifest id or none>   Status: <status>

## Job
One sentence: who is doing what, and what they can do afterwards.

## Layout
Per size (desktop, tablet, phone): regions, their order, what collapses or moves, and the
breakpoints in px. Name grid columns and gutters with tokens.

## Components
| Region | Component | Variant | Tokens that differ from the component default |
|---|---|---|---|

## Content and data
Every field shown, its source, format (units, rounding, date format) and max length
behaviour. Sort order. What "empty" means for this data.

## Interactions
| Trigger | Result | Notes (animation token, focus moves to…) |
|---|---|---|
Include keyboard: tab order, shortcuts, Escape.

## States
Each state, what triggers it and its artboard id. Include how long loading lasts before a
skeleton shows (don't flash one for fast loads).

## Accessibility
Landmarks and headings, accessible names for icon buttons, live regions for status changes,
focus management for sheets and dialogs.

## Acceptance criteria
Checkable statements. "Library shows 'No drives connected' with an Insert drive hint when
no library source is mounted." Not "Library looks good."

## Open questions
Anything unresolved, with who decides.
```
