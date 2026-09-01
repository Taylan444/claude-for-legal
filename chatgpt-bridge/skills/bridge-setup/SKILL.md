---
name: bridge-setup
description: >
  Set up the ChatGPT bridge — install and verify the local MCP server, grant the
  macOS permissions it needs, and write the disclosure policy that governs what
  may leave your tenant. Use on first use of the plugin, when
  `~/.claude/plugins/config/claude-for-legal/chatgpt-bridge/CLAUDE.md` is missing
  or still has placeholders, when the ChatGPT tool errors out, or when the user
  says "set up the ChatGPT bridge", "connect ChatGPT", or "why isn't ChatGPT
  working". This is the only skill that runs on a fresh install.
argument-hint: "[--check-integrations to re-probe the connection only] [--redo to rewrite an existing profile]"
---

# /bridge-setup

Two halves, in this order: get the connection working, then decide what is
allowed through it. The second half is the one that matters — a working bridge
with no disclosure policy is a confidentiality incident waiting for a Tuesday.

With `--check-integrations`, run part 1 only and report.

---

## Part 1 — Connection

### Requirements

This bridge is macOS-only by construction. It drives the ChatGPT desktop app
through AppleScript and the accessibility API; there is no API key and no server
side. If the user is on Windows or Linux, say so now and stop — nothing in this
plugin will work, and there is no workaround short of a different connector.

- macOS (Apple silicon; the upstream project targets M-series)
- The [ChatGPT desktop app](https://chatgpt.com/download), installed, running, and signed in
- Node 18+ (`npx` on PATH). Bun works too if running from a clone.
- The `ChatGPT` MCP server from this plugin's `.mcp.json`, which runs
  `npx -y claude-chatgpt-mcp@1.0.1` — the upstream project is
  [syedazharmbnr1/claude-chatgpt-mcp](https://github.com/syedazharmbnr1/claude-chatgpt-mcp) (MIT).

**The published build lags the repo.** npm `1.0.1` was published 2025-03-29 and is
still the only published version; the GitHub repo has commits after it (through
2025-06-03) that the tarball does not contain — among them an extra "is ChatGPT
actually running" guard inside the AppleScript that drives the ask. The pinned
`npx` path is the reproducible one and is what this plugin ships. If a user hits
flakiness that the newer commits address, the fix is to clone the repo, run
`bun install`, and point the server at `bun run /path/to/claude-chatgpt-mcp/index.ts`
instead — same tool, same operations, just a build they control. Tell them that
trade-off rather than silently switching them to unpinned `latest`.

### Steps

1. **Have the app open and signed in.** The server does try to activate ChatGPT
   itself (`tell application "ChatGPT" to activate`, then a 2-second delay), but
   that only helps if the app is installed and the user is already signed in — it
   cannot log in, dismiss an update dialog, or wait longer than those 2 seconds.
   Ask the user to open it first anyway; a cold activate is the flakiest path.
2. **Check the server is connected.** Look for the `ChatGPT` MCP server. If it
   isn't listed, the plugin's `.mcp.json` hasn't been picked up — have the user
   run `/mcp` to inspect, and restart Claude Code if it was just installed.
3. **Grant accessibility permission.** System Settings → Privacy & Security →
   Accessibility, and enable the app running Claude Code (Terminal, iTerm, or the
   Claude Code app). AppleScript UI scripting fails silently-ish without it —
   the symptom is an "error retrieving conversations" or an empty response.
   The first call also triggers a one-time macOS consent prompt; the user has to
   click it.
4. **Smoke-test.** Call the `chatgpt` tool with `operation: "get_conversations"`.
   A list — or a clean "no conversations found" — means the bridge works.

### When it fails

| Symptom | Cause | Fix |
|---|---|---|
| "Could not activate ChatGPT app. Please start it manually." | Not installed, or activation blocked | Install the app, open it, sign in |
| First call after a cold start returns nothing useful | The 2-second activate delay was too short | Open the app yourself, then re-ask |
| Errors mentioning permissions, or an empty result every time | Accessibility not granted | Grant it to the terminal/app running Claude Code, then restart that app |
| `npx` not found / server won't start | Node missing or not on PATH | Install Node 18+, or clone the repo and point the server at `bun run index.ts` |
| Response comes back cut off | The app was still typing | Re-ask; the tool waits for text to stabilize but long answers can still truncate |
| Tool hangs | The ChatGPT window is busy or a dialog is open | Bring the app to front, clear the dialog |

Two properties of this transport worth stating to the user once, because they
shape how much to trust it: it types into a real UI, so a ChatGPT app update can
break it until upstream catches up; and anything it sends is a real message in
the user's real ChatGPT account, subject to that account's retention and training
settings. It is not a sandbox.

---

## Part 2 — Disclosure policy

Copy this plugin's `CLAUDE.md` template to
`~/.claude/plugins/config/claude-for-legal/chatgpt-bridge/CLAUDE.md` (create the
directories), then fill it in by interview. Read
`~/.claude/plugins/config/claude-for-legal/company-profile.md` first if it exists,
and don't re-ask what it already answers.

Ask, in this order:

1. **Role and attorney contact** — unless the company profile already has them.
2. **Is ChatGPT approved for work content here?** Who approved it, when, under
   what policy. If the answer is "nobody", record that: it sets the strictest
   mode and it is worth the user seeing it written down.
3. **Account type**, and **whether training on inputs is off.** Free and Plus
   default to training on unless the user turned it off; Team, Enterprise, and Edu
   don't train on business data. If they don't know, record "unknown" and treat it
   as on.
4. **Does client consent gate this?** Sending client information to a third-party
   model can be a disclosure the client has a say in — flag that this is a
   judgment call for the responsible attorney, not for you, and record what they
   decide. (For firms and clinics: this sits in the same territory as ABA Formal
   Op. 512 on generative AI, which the `legal-clinic` plugin covers in depth.)
5. **Additions to the redaction floor** — code names, business units, anything
   else that would identify a matter in their context.
6. **Logging** — whether to keep a disclosure log, and where.

Write the answers into the profile, replacing every `[PLACEHOLDER]`. Show the
user the finished redaction floor and confirm it reads right before you finish.

### Close out

Tell the user what they now have:

- `/chatgpt-bridge:second-opinion` — sanitized cross-model check, approval gate before every send
- `/chatgpt-bridge:chatgpt-history` — list, retrieve, and continue ChatGPT threads
- `/chatgpt-bridge:bridge-setup --check-integrations` — re-test the connection
- `/chatgpt-bridge:bridge-setup --redo` — revisit the policy

And what they don't: this bridge does not make ChatGPT a research tool. Citations
it produces are unverified until checked against a research connector.
