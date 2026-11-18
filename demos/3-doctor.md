# Demo 3: `claude doctor` (slide 11)
Live only, no recorded fallback.

- **cmd:** `claude doctor`, then (optional) `/doctor` inside a session
- **expected out** (run 2026-11-17, claude 2.1.327, native install): prints version, commit, platform, install path, "Search: OK (bundled)", "Auto-updates: enabled", last update attempt, then "No installation issues found." and the hint "run /doctor in a Claude Code session".
- **what to say:** `claude doctor` = read-only install/settings check, no session. `/doctor` = full checkup that can propose fixes (unused skills/plugins, bloated CLAUDE.md, MCP/hook problems). `/doctor` details come from community posts: verify on stage.
- **risk:** output shows local paths (`/Users/sumapaz/.local/share/claude/...`) and, with a custom `ANTHROPIC_BASE_URL`, a "Not connected to the Anthropic API" block. Run once before, check what the projector shows, or run in a clean shell. Never `/doctor` in an untrusted dir (community note: it may spawn MCP servers).
