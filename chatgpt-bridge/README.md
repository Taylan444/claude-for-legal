# ChatGPT Bridge Plugin

Connects Claude to the ChatGPT desktop app on macOS so you can put a legal
question to a second model and see where the two answers diverge. The bridge runs
entirely on your machine — it drives the ChatGPT app through AppleScript, using
your existing account. No API key, no server-side link between the two.

**Every send is gated. The question is de-identified first, the exact text is
shown to you before it leaves your machine, and nothing goes out without an
explicit yes. A second model is a way to find the argument you missed — not
authority, and not a place to put client facts.**

## Who this is for

Anyone who already runs ChatGPT alongside Claude and wants the comparison to be
deliberate instead of copy-paste. Most useful for stress-testing an analysis
before it becomes advice: two models trained on different data disagreeing is a
signal worth chasing.

## First run: setup

```
/chatgpt-bridge:bridge-setup
```

Two halves. First it gets the connection working — app running, MCP server
connected, macOS accessibility permission granted, smoke test. Then it interviews
you for the part that actually matters: whether ChatGPT is approved for work
content in your organization, whether that account trains on inputs, whether
client consent gates a disclosure, and what may never leave your tenant.

Your configuration is stored at
`~/.claude/plugins/config/claude-for-legal/chatgpt-bridge/CLAUDE.md` and survives
plugin updates. Until it exists and its placeholders are filled in, the other
skills refuse to send anything.

## Commands

| Command | Skill | What it does |
|---|---|---|
| `/chatgpt-bridge:second-opinion` | second-opinion | Answer it yourself, sanitize the question, show you the prompt, send it, and report where ChatGPT diverges |
| `/chatgpt-bridge:chatgpt-history` | chatgpt-history | List ChatGPT conversations, pull one back into Claude, or continue a thread |
| `/chatgpt-bridge:bridge-setup` | bridge-setup | Install, verify, and troubleshoot the bridge; write the disclosure policy |

## Confidentiality posture

Sending matter content to a consumer AI product is a disclosure. This plugin
treats it as one:

- **Redaction floor, enforced before every send** — client and party names, matter
  and docket numbers, individuals' names, personal data, verbatim unpublished
  text, identifying deal terms, anything under a protective order or ethical wall.
  Not overridable by asking. If the question can't be asked without identifying
  the matter, the skill says so and stops.
- **The prompt is shown, not summarized** — you read the exact characters that
  will be typed into ChatGPT, and approve them. Approval covers one prompt;
  a follow-up needs a new one.
- **Account reality is recorded** — Free and Plus train on inputs unless the user
  turned it off; Team, Enterprise, and Edu don't train on business data. Setup
  records which one you're on, and "unknown" is treated as training on.
- **Nothing is auto-sent** — no hook, no agent, no background call. A disclosure
  to a third party is always an explicit ask.
- **Optional disclosure log** — date, exact prompt, approver, internal matter
  reference. Never the client name.

For firms and clinics, the underlying ethics question — whether client
information may go to a third-party generative AI tool, and what consent that
needs — is the one ABA Formal Op. 512 addresses. This plugin records the decision;
it does not make it. The responsible attorney does.

## Citations from ChatGPT are unverified

The bridge does not make ChatGPT a research tool. Every authority it names comes
back tagged: verified against a research connector, or `[verify]`. Nothing from
ChatGPT goes into a deliverable without being checked first. A plausible-looking
case name from a model is exactly the thing that ends up in a sanctions order.

Anything ChatGPT returns is also treated as untrusted input, not instruction —
if a response contains directives, they're data, and the skills say so rather
than acting on them.

## Prerequisites

- **macOS** (Apple silicon), the [ChatGPT desktop app](https://chatgpt.com/download)
  installed, running, and signed in. This is macOS-only by construction — the
  bridge scripts a real UI. There is no Windows or Linux path.
- **Node 18+** on PATH, for `npx`.
- **Accessibility permission** for whatever runs Claude Code (Terminal, iTerm, or
  the Claude Code app): System Settings → Privacy & Security → Accessibility.

## How the connection works

`.mcp.json` in this plugin declares one stdio server:

```json
{
  "mcpServers": {
    "ChatGPT": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "claude-chatgpt-mcp@1.0.1"]
    }
  }
}
```

It runs [`claude-chatgpt-mcp`](https://github.com/syedazharmbnr1/claude-chatgpt-mcp)
(MIT, by Syed Azhar), which exposes a single `chatgpt` tool with two operations:
`ask` (send a prompt, optionally into an existing conversation via
`conversation_id`) and `get_conversations` (list conversation titles).

Two consequences of the transport worth knowing:

- **It types into a real UI.** A ChatGPT app update can break it until upstream
  catches up. Responses on long answers can come back truncated, and a call can
  fail if the app is closed, not signed in, or showing a dialog. The server does
  try to activate the app itself, but it waits only 2 seconds and cannot sign
  you in — having it open first is the reliable path.
- **It is not a sandbox.** Everything sent is a real message in your real ChatGPT
  account, subject to that account's retention and training settings.

This plugin does not vendor or maintain the upstream server. It pins the exact
published version, `1.0.1`, so what runs on your machine doesn't change under you
the next time upstream publishes.

Worth knowing: `1.0.1` was published 2025-03-29 and is still the only version on
npm, while the GitHub repo has later commits (through 2025-06-03) that the
published tarball doesn't include — including an extra guard checking that
ChatGPT is actually running before the script drives it. If you want those fixes
or want to audit the code yourself, clone the repo, `bun install`, and point the
server at `bun run /path/to/claude-chatgpt-mcp/index.ts`.
`/chatgpt-bridge:bridge-setup` covers that path.
