# Post templates

Starting points for the "Template" menu in the new-post composer. Picking a
template sets the post category, replaces the body with its skeleton, and
highlights the suggested tags.

```
templates/
├── catalogue.ts     every template: id, menu label, post category, suggested tags
├── index.ts         joins the catalogue with the bodies (no edits needed)
└── bodies/
    └── <id>.md      the Markdown skeleton for that template
```

## Adding a template

1. Find its entry in `catalogue.ts`. Add one if it's a new topic, using tag
   names spelled exactly as in `data/tags.ts`.
2. Create `bodies/<id>.md`. The entry turns on in the menu automatically.
   Until then it's shown greyed out as "soon".

When one template serves several menu entries (e.g. "Martial arts" and
"Running & trail running"), give those entries the same `bodyId` and name the
file `bodies/<bodyId>.md`. Each entry keeps its own label and highlighted tags.

## Writing a body

- Write a **complete Markdown post skeleton**: the real headings, tables, code
  blocks and lists the finished post will have. Don't use HTML comments; the blog
  renders them as visible text.
- Put everything the author must replace in **`[square brackets]`**, phrased as a
  prompt or an example (`[e.g. Ease of change]`, `[What I saw.]`). Before
  publishing, searching for `[` finds anything left unfilled.
- Write the surrounding prose in the author's voice, so a filled-in template
  reads as a finished post without rewriting.
