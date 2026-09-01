---
name: second-opinion
description: >
  Put a legal question to ChatGPT as a de-identified hypothetical, then compare
  its answer against Claude's and report where the two diverge. Sanitizes the
  prompt first, shows you the exact text before anything leaves your machine, and
  never sends client-identifying content. Use when the user says "what would
  ChatGPT say", "get a second opinion", "check this against another model",
  "does GPT agree", or wants a cross-model sanity check on an analysis.
argument-hint: "[the question, or a reference to an analysis already in this conversation] [--no-redact to skip sanitization for a purely public-law question]"
---

# /second-opinion

A second model is a way to find the argument you missed. It is not authority, it
is not a tiebreaker, and it does not get to see your client's facts.

Runs in five steps. Do not skip step 2 or step 3.

## 0. Preconditions

1. Read `~/.claude/plugins/config/claude-for-legal/chatgpt-bridge/CLAUDE.md`. If it
   is missing or still has `[PLACEHOLDER]` markers, stop and tell the user to run
   `/chatgpt-bridge:bridge-setup` first. Do not send anything.
2. Read `~/.claude/plugins/config/claude-for-legal/company-profile.md` if present.
3. Confirm the `ChatGPT` MCP server is connected. If it isn't, say so and stop —
   point at `/chatgpt-bridge:bridge-setup`. There is no remote fallback.
4. If **Disclosure authority → Who approved** is "not approved", say that plainly
   and continue only in the strictest mode: invented facts, no verbatim text.

## 1. Answer it yourself first

Write your own analysis before asking ChatGPT. Two reasons: a comparison needs
something to compare against, and an answer you formed after reading someone
else's is not independent.

If the analysis already exists earlier in this conversation, use that. Say which
you're using.

## 2. Sanitize — the gate

Rewrite the question into a hypothetical that could be published. Work down the
**Redaction floor** in the profile and strip:

| In the real question | In the prompt that goes out |
|---|---|
| Client / party / counterparty names | "a SaaS vendor", "the buyer" |
| Individual names | "the employee", "the signatory" |
| Matter, docket, deal identifiers | dropped entirely |
| Verbatim clause or filing text | a paraphrase of the mechanism |
| Identifying deal specifics (price, dates, target) | order-of-magnitude or dropped |
| Jurisdiction, where it identifies the matter | kept only if generic to the question |

Rules:

- Paraphrase, never quote, anything unpublished. A distinctive sentence is an
  identifier.
- Keep the legal mechanics — the question is worthless if you sanitize away the
  thing being asked. If you cannot ask it without identifying the matter, say
  so and stop. That is a real outcome, not a failure.
- Published law is not confidential. A question purely about a statute or a
  decided case needs no de-identification; `--no-redact` skips this step for
  exactly that case, and only that case.

## 3. Show the user, then ask

Print the exact prompt text you intend to send, in a fenced block, and ask for
explicit approval:

> This is what would leave your machine and go into ChatGPT. Send it? (yes / edit / no)

Do not paraphrase what you're about to send — show it. If the user edits, show
the edited version again. No approval, no send.

Approval covers one prompt. A follow-up question is a new approval.

## 4. Send

Call the `chatgpt` tool with `operation: "ask"` and the approved prompt.

- Frame the prompt as a standalone question. ChatGPT has no access to this
  conversation, your files, or your connectors.
- Ask it to state its reasoning and name any authority it relies on — you need
  something checkable back.
- To continue an earlier ChatGPT thread, pass its `conversation_id`
  (`/chatgpt-bridge:chatgpt-history` finds it). Only do this when the user asked
  for continuity: an existing thread may carry context they've forgotten is there.

The tool drives the desktop app through the UI. It is slow (tens of seconds on a
long answer), it can return a truncated response, and it fails if the app is
closed or the window is busy. On failure, report the error as-is and do not retry
more than once — a second automated attempt on a UI-driving tool is how you end
up with two half-sent prompts.

## 5. Compare

Present the comparison, not two essays. Structure:

**Where we agree** — one or two lines. Agreement is weak evidence; two models
trained on overlapping data agreeing is not corroboration. Say that once, plainly.

**Where we diverge** — the point of the exercise. For each divergence:
- What ChatGPT says
- What you said, and why
- What would settle it — the authority to check, the fact you'd need

**What ChatGPT raised that you didn't** — the genuinely useful output. Treat each
as a lead to run down, not as a correction.

**Authorities it cited** — every one tagged. Verified against a research
connector → tag with the source. Not verified → tag `[verify]`. If no research
connector is available, say so above the list. Do not repeat a citation from
ChatGPT into any deliverable without checking it first; a plausible-looking case
name from a model is exactly the thing that ends up in a sanctions order.

**Bottom line** — your position, held or changed, and why. You did the analysis;
you keep the pen.

## After

If the profile sets **Logging → yes**, append to the disclosure log: date, exact
prompt sent, approver, internal matter reference. Never the client name.

## Never

- Send anything from the redaction floor, even if the user asks. Say what you
  can send instead.
- Send file contents, MCP results, or connector output directly. Those are matter
  data by default.
- Treat ChatGPT's answer as authority, or let it override your analysis without a
  source you checked.
- Auto-run this skill. A disclosure to a third party is always an explicit ask.
