# Context is also for humans

Bilingual (ES/EN) conference deck built with [reveal.js](https://revealjs.com) + Vite. Plain JS, no framework, runs offline.

## Run

```bash
npm install
npm run dev      # http://localhost:5173/?lang=en  (or ?lang=es)
npm run build    # static output in dist/
npm test         # checks every EN text has an ES twin (deck + fig) and no external URLs
node figs/model.test.mjs   # delivery-pipeline model invariants
node figs/build.mjs        # rebuild public/figs/pipeline.html (needs the anatomy skill at ~/.claude/skills/anatomy)
```

## Language

`?lang=es|en` sets `<html lang>`; CSS hides the other language. Default is `en`.
Every visible string and every speaker note needs both: `<span lang="en">…</span><span lang="es">…</span>`.

## Presenting

- Slides are 16:9 (1920x1080). Press `S` for the speaker view (notes) and drag it to display 2.
- Slide 3 embeds Fig 1 (`public/figs/pipeline.html`): isometric delivery bench, 5 stations (Define → Code → Review [internal test + human valve] → Test → Deliver). Four sliders (Code 1-4, Review 1-5, Test 1-4, Deliver 1-4; click the figure once for focus) upgrade one station each; the first station whose capacity is below its incoming flow turns red and its queue fills. `?lv=c,r,t,d` presets levels, `?lang=` follows the deck. Illustrative relative units only (not measurements).
- Slide 2 embeds Fig 2 (`public/figs/loop.html`): a cart (the agent) circles 4 stations around a drift gauge; the slider sets how often a human gate stops it (never / every 3 laps / every lap). Illustrative units, not measurements. `?lang=` follows the deck.
- Draft v1: every slide has a body and ES+EN speaker notes (press `S`). Notes tag what is Voss's claim vs. checked against a source; `script/sources.md` lists every claim, link and status. Slides 9 and 10 (tejo, OKF) are still `TODO(user)`.
- Slide bodies marked `TODO(user)` are gaps to fill in, nothing is invented.

## Layout

| Path | What |
|---|---|
| `index.html` | one `<section>` per slide |
| `src/main.js`, `src/style.css` | reveal init, lang toggle, typography |
| `check.mjs` | the `npm test` check |
| `figs/model.mjs`, `figs/build.mjs` | Fig 1 model (pure, capacities per level) and anatomy build script → `public/figs/pipeline.html` |
| slides 4-8, 11, 12 | drafted bodies + notes; 9, 10 (tejo, OKF demos) pending your input |
| `script/sources.md` | every claim → source link → verified/disputed/unverified |
| `figs/loop-model.mjs`, `figs/build-loop.mjs` | Fig 2 model (pure) and build → `public/figs/loop.html` |
| `demos/1-tejo.md` … `4-nono.md` | demo runbooks (cmd, expected out, risk); doctor is real, tejo/OKF/nono cmds still `TODO(user)` |
| not yet | fig for T9 (context layers); nono install (T10) |
| `SPEC.md` | goals, constraints, invariants, task list |
