# Demo 4: `nono` and prompt injection (slide 12)
Live only, no recorded fallback.

- **precondition:** nono NOT installed (checked 2026-11-17). `brew info nono`: stable 0.82.0, Apache-2.0. Install + verify is T10: `brew install nono && nono --version`.
- **cmd (from a blog, verify after install):** `nono run --profile claude-code -- claude`. Generic form: `nono run --allow-cwd -- <agent cmd>`. Docs: https://docs.nono.dev
- **expected out:** TODO(user) after T10: agent starts; a read outside the allowed paths is denied by the kernel (Seatbelt on macOS).
- **talk track:** news first (slide 12: Comment and Control Apr 2026, Mozilla 0DIN Jun 2026), then "even a hijacked agent only reaches what you allowed". Sources and status: `script/sources.md`.
- **risk:** wrong profile name or flags (unverified); sandbox blocks something the demo needs (network, keychain); sources unapproved (T11), cite only what you approve.
