# Design system rules

## Tokens

Two layers. Components only ever use the semantic layer.

1. **Primitives**: raw values, named by what they are. `--gray-50 … --gray-950`,
   `--red-500`, `--space-1 … --space-12`, `--radius-sm/md/lg/full`, `--font-sans`,
   `--font-mono`.
2. **Semantic**: named by job, redefined per theme. `--surface-base`, `--surface-raised`,
   `--surface-sunken`, `--text-primary/secondary/tertiary/on-accent`, `--border-subtle/strong`,
   `--accent`, `--accent-hover`, `--status-ok/warn/critical/info` (each with `-bg`, `-fg`,
   `-border`), `--focus-ring`, `--shadow-1/2/3`.

Themes are `[data-theme="..."]` blocks that only reassign semantic tokens. If a theme needs
a component-level override, the token set is missing something. Add the token.

Required scales:

- **Spacing**: a 4px base. Use steps 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. No odd values.
- **Type**: 7 or 8 steps at most, each with size, line height, weight and letter spacing
  (`--t-display`, `--t-title1..3`, `--t-headline`, `--t-body`, `--t-callout`, `--t-caption`).
  Body text is 15 to 17px on desktop and never under 14px anywhere.
- **Radius**: 3 or 4 values. Nested radius = outer radius minus padding.
- **Elevation**: 3 shadow levels max, plus borders for themes where shadows vanish.
- **Motion**: 2 or 3 durations and one or two easings, with a `prefers-reduced-motion`
  override that removes movement and keeps opacity changes.
- **Icon sizes**: `--icon-sm/md/lg` (16/20/24 is typical), with a base
  `.icon, svg.icon { width: var(--icon-md); height: var(--icon-md); flex: none }` rule so an
  icon can never grow to fill its container.

## Contrast

- Text on its surface: 4.5:1 minimum, 3:1 for text 24px and up or 19px bold.
- Controls and focus rings against adjacent colors: 3:1.
- Check every theme separately, including special ones (night vision, low power, high
  contrast). Status never relies on hue alone: pair it with an icon, a label or weight.

## Components

Every component gets an inventory row and a state matrix artboard.

| State | Required when |
|---|---|
| default | always |
| hover | pointer platforms |
| pressed | always |
| focus-visible | always, keyboard reachable |
| disabled | if it can be disabled; say why it's disabled nearby |
| loading | if it triggers async work |
| error / invalid | inputs and anything that can fail |
| selected / on | toggles, tabs, list rows |

Minimum inventory for an app: button (primary, secondary, tertiary, destructive, icon-only),
text input, select, checkbox, radio, switch, segmented control, tabs, list row, card,
banner (info, ok, warn, critical), toast, dialog/sheet, popover/menu, empty state, skeleton,
badge/pill, avatar, navigation (sidebar, tab bar), progress.

Component CSS rules:

- Built only from semantic tokens. A raw hex, px size or font stack inside a component is
  a bug.
- Touch targets are at least 44x44 (48 or larger for gloved or outdoor use), even when the
  visible element is smaller. Pad the hit area instead.
- Icons inside a component get an explicit size from the icon tokens.
- Long text: every text slot defines what happens at 2x the expected length (wrap, clamp
  with an ellipsis, or truncate the middle for file names).

## Style guide artboard

`system/style-guide.html` shows color swatches with contrast ratios, the type scale with a
sample, spacing, radius, elevation, icon sizes and every component's state matrix. Render
it in every theme. It's the first thing a reviewer opens.
