# paperclip-skills

OneNomad's own Paperclip company skills.

- `product-design`: design method, file layout, `design/manifest.json`, render and lint tooling, handoff.
- `frontend-engineering`: build standards, coded prototypes, verification, the review loop with design.

`scripts/shoot.mjs` is the same file in both skills because each skill is materialized on its own. Edit it in `product-design` and copy it across.

Install into a company and attach:

```
paperclipai skills import /home/matt/development/onenomad/paperclip-skills/product-design -C <companyId>
paperclipai skills import /home/matt/development/onenomad/paperclip-skills/frontend-engineering -C <companyId>
paperclipai skills agent sync <agent> ...
```

Paperclip reads local-path skills from this folder, so edits here show up on the next run.
