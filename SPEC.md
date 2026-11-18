# SPEC

## §G
Conference deck. Title "Context is also for humans" (alt "The agent is a coworker"). Reveal.js, bilingual ES/EN, fullscreen on MacBook display 2 while user live-codes on display 1. Content = guide+tips work w/ agents+humans w/o losing control. Topics: agents w/o supervision, code-review bottleneck, accountability + next bottlenecks, claude code demo on tejo (tools/memory/skills/no-cache/skills-only), OKF in workflows app, `claude doctor`, `nono` + prompt-injection news.

## §C
- stack: vite + reveal.js, plain JS, no TS, no framework, no i18n lib
- one `index.html`, `<section>` per slide
- lang toggle `?lang=es|en` → `<html lang>`; CSS hides other lang
- speaker script = `<aside class="notes">` in index.html, ES+EN (speaker view `S`); `script/sources.md` = claim → source → verified?
- figs = anatomy-skill SVG, inline/`figs/`
- user feeds content+ideas; Claude adds only on request; unknown → `TODO(user)`
- demos live only, no recorded fallback
- 16:9, big fonts (room readable), runs offline (no CDN)

## §I
- tejo backend path: TODO(user)
- OKF (workflows app): TODO(user) what/where
- `claude` 2.1.327, `claude doctor` (ran ok 2026-11-17)
- `nono` CLI: not installed; `brew info nono` = 0.82.0 Apache-2.0; install T10
- anatomy skill: `~/.claude/skills/anatomy`
- recent injection attack news: drafted from VentureBeat Apr 2026 + Help Net Security Jun 2026, user approval pending (T11); list in script/sources.md
- conference name/date/duration: TODO(user)

## §V
V1. every slide text has ES+EN
V2. `npm run build` ok, deck runs offline
V3. no invented content; gaps = `TODO(user)`
V4. every demo has runbook `demos/<n>.md`: cmd, expected out, risk
V5. figs standalone SVG, one theme, readable at distance
V6. speaker notes ES+EN every slide
V7. README.md updated every §T done; reflects real state (cmds, layout, what exists vs not yet). Stale README = task ⊥ `x`
V8. bottleneck station renders red; exactly one red = first station whose cap < incoming flow, none if none; red derived from model(), ⊥ hand-set

## §T
id|status|task|cites
|---|---|---|---
T1|x|scaffold vite+reveal+notes plugin|V2
T2|x|lang toggle css/js|V1
T3|x|theme+typography|V5
T4|x|slide skeleton from outline|V1,V3
T5|x|draft notes ES+EN in index.html every slide (Voss talk + checked sources; gaps TODO(user)); script/sources.md|V6
T6|x|demo runbooks demos/*.md (skeletons; tejo/okf/nono cmds TODO(user))|V4,I.tejo,I.okf
T7|x|anatomy fig 2: agent loop cart + drift gauge + human gate, slider none/3 laps/every lap; model figs/loop-model.mjs (drift 1/lap, illustrative)|V1,V5,V6
T8|x|anatomy fig: bottleneck graph gen→review→accountability→next (superseded by T13)|V5
T9|.|anatomy fig: context layers memory/skills/tools/cache|V5
T10|.|install nono + verify, claude doctor check|I.nono
T11|.|research recent injection attacks: drafted (slide 12, sources.md), waiting user approval|V3
T12|.|rehearse: speaker view display 2, PDF export|V2
T13|x|anatomy fig v2: 4 indep sliders Code 1-4, Review 1-5 (review = internal-test substation [agent selfcheck/tests/security skills] → human review valve), Test 1-4, Deliver 1-4; Define fixed; RED bottleneck; caps Code 1,2,4,8 / Review 1,2,4,6,10 / Test,Deliver 1,2,4,8 (illustrative relative); flow=min along chain; queue behind red|V1,V2,V3,V5,V6,V7,V8
T14|x|skeleton slides after slide 3 (ES+EN titles, bodies TODO(user), notes both langs): review focus = security via running skills; tests; why humans need non-code context (OKF); skill/tool recs like ponytail|V1,V3,V6

## §B
id|date|cause|fix
|---|---|---|---