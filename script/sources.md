# Sources and verification (every claim in the slides/notes)

Status: ✅ matches a primary/credible source found · ⚠️ source found but figures differ or are disputed · ❌ not verified (do not say it) · 👤 yours to confirm.
Researched 2026-11-17 via web search; open the link before quoting.

## Framing
- Voss talk, "AI Writes the Code. So What's Left for Engineers?" (AI Engineer, Oct 2026): https://www.youtube.com/watch?v=kspZP5BgkEU · page https://ai.engineer/talks/kspZP5BgkEU-ai-writes-code-so-whats-left-engineers · ✅ thesis (bottleneck moves, "product engineer"). Everything below tagged "Voss" is his claim unless a second source is listed.

## Slide 2: no supervision
- Dex Horthy walked back "don't read the code" after ~6 months: ⚠️ in podcasts, not an on-stage AIE talk as Voss says. https://www.heavybit.com/library/podcasts/high-leverage/ep-12-the-limits-of-lights-out-coding-with-dexter-horthy · https://www.lastweekinaws.com/podcast/screaming-in-the-cloud/coding-agents-chaos-and-the-future-of-dev-work-with-dexter-horthy/
- OpenAI: humans may review PRs but not required: ❌ Voss only.
- Fig 2 numbers (1 drift unit per lap, limit 6): illustrative, ours.

## Slide 3: review bottleneck
- 741% more code / ~30% shipped: ⚠️ NBER WP 35275 "Writing Code vs. Shipping Code" (May 2026). Summaries disagree on which tool/metric. https://qz.com/ai-coding-tools-code-volume-releases-gap-nber-study-061126 · https://the-agent-report.com/2026/10/coding-agents-741-percent-more-code-study/
- Review speed: ⚠️ SmartBear/Cisco 2006: best under ~300 LOC/h, reviews <200-400 LOC; "450 LOC/h" is Voss's/secondary figure. https://static0.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf · https://mikeconley.ca/blog/2009/09/14/smart-bear-cisco-and-the-largest-study-on-code-review-ever/. 10,000/450 ≈ 22 h is our arithmetic.
- Copilot code review >1 in 5 reviews on GitHub: ✅ https://github.blog/ai-and-ml/github-copilot/60-million-copilot-code-reviews-and-counting/
- Four AI reviewers, no shared bugs: ❌ Voss only.
- Goldratt, The Goal (1984): ✅ well known.

## Slide 4: security
- Comment and Control: ✅ https://venturebeat.com/security/ai-agent-runtime-security-system-card-audit-comment-and-control-2026 (Anthropic CVSS 9.4, $100 bounty; "not hardened against prompt injection" per its system card).
- /security-review, /code-review: ✅ skills in this Claude Code install.

## Slide 5: tests
- FrontierCode: ✅ https://cognition.com/blog/frontier-code (2026-06-08). Opus 4.8: Diamond 13.4%, Main 34.3%, Extended 51.8%; scores, not pass rates.
- "87% → 54%" and "Claude Fable 5 80%": ❌ not found, not used.

## Slide 6: context / OKF
- OKF = Google Cloud Open Knowledge Format v0.1: ✅ https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md · https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing · https://okf.md/spec/ . 👤 confirm this is the OKF you use in the workflows app.
- BugBot 44,000 learned rules: ✅ https://cursor.com/blog/bugbot-learning (2026-04-08)

## Slide 7: tools
- ponytail, caveman, spec/build/check, /code-review, /security-review: ✅ installed on this machine.

## Slide 8: accountability
- Amazon senior sign-off: ⚠️ FT report Mar 2026, Amazon disputes parts. https://www.techradar.com/pro/amazon-is-making-even-senior-engineers-get-code-signed-off-following-multiple-recent-outages · https://officechai.com/ai/amazon-requires-senior-engineers-to-sign-off-on-ai-assisted-changes-made-by-junior-and-mid-level-engineers-after-ai-related-outage/
- Stanford Canaries: ✅ https://siepr.stanford.edu/publications/working-paper/canaries-coal-mine-six-facts-about-recent-employment-effects-artificial (software devs 22-25, ~20% below late-2022 peak at Jul 2025; authors say not fully AI).
- Voss: FDE postings +800%, $240k, IBM redesign, Google APM numbers: ❌ not checked, not used.

## Slide 11: claude doctor
- Local run 2026-11-17: claude 2.1.327 native, "No installation issues found". ✅
- `/doctor` bundled skill since ~2.1.203, `prompt-audit` 2.1.283: ⚠️ community posts, verify on stage. https://claudelog.com/faqs/what-is-claude-code-doctor/ · https://flaviocopes.com/claude-code-prompt-audit/

## Slide 12: injection + nono
- Mozilla 0DIN PoC: ✅ https://www.helpnetsecurity.com/2026/06/29/mozilla-warns-of-indirect-prompt-injection-risk-in-ai-coding-agents/
- nono: ✅ https://www.helpnetsecurity.com/2026/07/27/nono-open-source-ai-agent-sandboxing/ · https://nono.sh · https://github.com/nolabs-ai/nono · `brew info nono`: stable 0.82.0, Apache-2.0, not installed (T10). `nono run --profile claude-code -- claude` is from a blog post: ⚠️ verify after install.
- More 2026 injection items (not in slides): Orca/Copilot token theft, Context7 poisoning (Mar 2026), arXiv GitInject 2606.09935: ⚠️ aggregator-sourced, verify before use.
