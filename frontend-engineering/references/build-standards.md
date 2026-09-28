# Build standards

Defaults for a new OneNomad frontend. In an existing project, match what's there and raise
disagreements as comments instead of rewriting.

## Stack

React + TypeScript (strict) + Vite, pnpm. Plain CSS with custom properties, or CSS modules
for scoping. No CSS-in-JS runtime and no UI kit that brings its own design language.
Add a dependency only when writing it yourself would take more than an hour, and say why
in the commit.

## Layout

```
src/
  app/          shell, router, providers, error boundary
  design/       tokens.css (imported from design/, not edited here), global.css, icons
  components/   presentational building blocks, one folder each: Button/Button.tsx, Button.css
  screens/      one folder per screen, composed from components
  services/     typed interfaces + mock implementations (+ real ones later)
  state/        app state stores, small and per domain
  lib/          pure helpers (format, time, units)
  devtools/     prototype control panel, excluded from production builds
```

## Tokens

- Import `design/tokens.css` directly, or generate `src/design/tokens.css` from it with a
  script. Never hand-copy values.
- Theme switching sets `data-theme` on `<html>`, matching the artboards.
- If you need a value the tokens lack, ask the designer for a token. Don't add a one-off.

## Components

- Mirror the designer's component inventory names so artboards and code map one to one.
- Every component supports every state in the design system state matrix. Build a
  `#/dev/components` route that renders each component in each state. It doubles as the
  fidelity check against `system/style-guide.html`.
- Semantic elements first: `button` for actions, `a` for navigation, real `input`s with
  `label`s. ARIA only where no element exists.
- Icons: one `Icon` component with a required `size` prop that maps to icon tokens, and
  `aria-hidden` unless it's the only content of a control.
- Hit areas are at least 44x44 (the design tokens may say more), padded if the visual is
  smaller.

## Services and mock data

```ts
export interface PowerService {
  current(): Promise<PowerReading>;
  subscribe(cb: (r: PowerReading) => void): () => void;
}
```

- Screens depend on interfaces from a provider, never on mock modules directly.
- Mocks run on a seeded clock so renders are reproducible (`?seed=4&time=2026-09-27T21:00`).
- Mocks can be switched into states: empty, loading forever, slow (2s), error, offline.
  These are the states the control panel and query params reach.
- Synthetic data only, with realistic awkward values.

## State and data flow

Local state first. Lift it when two siblings need it. A small store per domain when
several screens do. Derive instead of syncing copies. Every async call has loading, error
and empty handling in the UI.

## Accessibility

- Landmarks (`nav`, `main`, `aside`), one `h1` per screen, headings in order.
- Visible focus on everything interactive, using the focus token. Never `outline: none`
  without a replacement.
- Dialogs and sheets trap focus, restore it on close and close on Escape.
- Live regions for status that changes without user action (alerts, sync state).
- `prefers-reduced-motion` removes movement.

## Performance

- Budget: initial JS 250 KB gzipped or less unless the issue sets another number. Lazy-load
  screens past the first.
- No runtime network assets when the product is offline-first: fonts, icons, map tiles and
  images ship in the bundle or in local storage.
- Animate only `transform` and `opacity`. Virtualize lists longer than about 200 rows.
- Test on the slowest target. If that's a Pi or an old phone, use Chromium CPU throttling
  (4x) when there's no device.
