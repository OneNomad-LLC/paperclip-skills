# Craft checklist

Run it against the rendered PNGs, not the source. Each item is a yes/no.

## Layout and rhythm

- [ ] Everything sits on the spacing scale. Gaps between related items are smaller than gaps
      between groups.
- [ ] Left edges line up. Within a card, content shares one inner margin.
- [ ] One clear primary action per view, and it's the most prominent thing you can press.
- [ ] Nothing important sits in the bottom 20% of a landscape small screen without a reason.
- [ ] At the smallest size, nothing overflows, overlaps or needs horizontal scrolling.
- [ ] Phone layouts put frequent actions in the thumb zone (bottom half).

## Type

- [ ] 3 text sizes or fewer per view. Hierarchy comes from weight and color as well as size.
- [ ] Line length stays between 45 and 90 characters for body text.
- [ ] Numbers that change use tabular figures. Units are smaller and quieter than values.
- [ ] No widows in headings and no orphaned single word on buttons.

## Color and theme

- [ ] Checked in every theme. Special themes (night vision, low power) have no leftover
      color from another theme.
- [ ] Status is readable without color.
- [ ] Accent color is rare enough to mean something. If everything is blue, nothing is.

## Icons and imagery

- [ ] Every icon has an explicit size and a consistent stroke weight.
- [ ] Icons that stand alone have a text label or an accessible name, and core actions have
      visible labels.
- [ ] Optical alignment: icons sit centered on the text's x-height, not its box.

## Content

- [ ] Realistic synthetic data with awkward lengths. No lorem ipsum and no "John Doe".
- [ ] Buttons name the outcome ("Format drive", not "OK").
- [ ] Errors say what happened and what to do next.
- [ ] Destructive actions state what will be lost, with numbers, before the confirm.

## States

- [ ] Empty, loading, error and offline states exist wherever they can happen, and each one
      offers a next step.
- [ ] Focus-visible is clearly drawn on every interactive element.
- [ ] Disabled controls explain why nearby.

## Finish

- [ ] No leftover debug borders, placeholder boxes or TODO text.
- [ ] Would this pass as a screenshot in the App Store listing? If it looks like a template,
      it isn't done.
