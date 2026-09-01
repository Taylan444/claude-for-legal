<!--
CONFIGURATION LOCATION

User-specific configuration for this plugin lives at a version-independent path that survives plugin updates:

  ~/.claude/plugins/config/claude-for-legal/chatgpt-bridge/CLAUDE.md

Rules for every skill, command, and agent in this plugin:
1. READ configuration from that path. Not from this file.
2. If that file does not exist or still contains [PLACEHOLDER] markers, STOP before sending anything to ChatGPT. Say: "This plugin needs setup before anything leaves your environment. Run /chatgpt-bridge:bridge-setup — it takes about 5 minutes and it is what defines your disclosure rules. Without it there is no approved redaction policy, and this plugin will not send a prompt to a third-party model on guesswork." Do NOT proceed with placeholder or default configuration. The only skill that runs without setup is /chatgpt-bridge:bridge-setup itself.
3. Setup WRITES to that path, creating parent directories as needed.
4. On first run after a plugin update, if a populated CLAUDE.md exists at the old cache path
   (~/.claude/plugins/cache/claude-for-legal/chatgpt-bridge/<version>/CLAUDE.md for any version)
   but not at the config path, copy it forward to the config path before proceeding.
5. This file (the one you are reading) is the TEMPLATE. It ships with the plugin and shows the
   structure the config should have. It is replaced on every plugin update. Never write user data here.

**Shared company profile.** Company-level facts (who you are, what you do, where you operate, your risk posture, key people) live in `~/.claude/plugins/config/claude-for-legal/company-profile.md` — one level above this file, shared by all plugins. Read it before this plugin's profile. If it doesn't exist, this plugin's setup will create it.
-->

# ChatGPT Bridge Profile

*Written by /chatgpt-bridge:bridge-setup on [DATE].*

---

## Who's using this

**Role:** [PLACEHOLDER — Lawyer / legal professional | Non-lawyer with attorney access | Non-lawyer without attorney access]
**Attorney contact:** [PLACEHOLDER — Name / team / outside firm / N/A]

---

## Disclosure authority

The question this plugin exists to answer: *is this organization allowed to put
this text into a third-party consumer AI product?* Nothing here is a legal
conclusion — it records the decision someone with authority already made.

**Who approved using ChatGPT for work content:** [PLACEHOLDER — name / role, or "not approved"]
**Date of approval:** [PLACEHOLDER]
**Governing policy:** [PLACEHOLDER — link or name of the AI-use policy, or "none"]
**ChatGPT account type:** [PLACEHOLDER — Free | Plus | Team | Enterprise | Edu]
**Training on inputs:** [PLACEHOLDER — off (Team/Enterprise default or setting disabled) | on | unknown]
**Client consent required before matter content leaves the tenant:** [PLACEHOLDER — yes / no / per-matter]

*If approval is "not approved" or training is "on", the redaction floor below is
not optional — every prompt must be a de-identified hypothetical, no exceptions.*

---

## Redaction floor

Never send, under any setting:

- Client, party, counterparty, and matter names; matter numbers; docket numbers
- Names of individuals — employees, witnesses, custodians, claimants, signatories
- Personal data of any kind (contact details, ID numbers, health, HR records)
- Verbatim text from an unpublished agreement, filing, memo, or board material
- Deal terms specific enough to identify the deal (price, close date, target)
- Anything covered by a protective order, NDA, or ethical wall
- Anything privileged, or anything whose disclosure would waive privilege

[PLACEHOLDER — add your own never-send list: business units, code names, jurisdictions that would identify a matter]

Allowed by default:

- Abstract legal questions with invented facts
- Published law — statutes, regulations, decided cases, public guidance
- Public filings and publicly released policies
- [PLACEHOLDER — anything else your policy clears]

---

## How the second opinion is used

**Purpose:** [PLACEHOLDER — stress-testing Claude's analysis | checking for a missed argument | comparing framings | other]
**Never used for:** deciding the answer. A second model is a prompt for more
thinking, not authority. Nothing from ChatGPT goes into work product uncited or
unverified.

**Verification rule:** [PLACEHOLDER — default: every authority ChatGPT names is
checked against a research connector before it is repeated anywhere.]

---

## Logging

**Keep a disclosure log:** [PLACEHOLDER — yes / no]
**Log path:** [PLACEHOLDER — e.g. ~/legal/ai-disclosure-log.md]

The log records, per send: date, the exact prompt text sent, who approved it, and
the matter it relates to (by internal reference, not by client name).

---

## Available integrations

| Integration | Status | Fallback if unavailable |
|---|---|---|
| ChatGPT desktop app (macOS) | [✓ / ✗] | Skills stop and say so — there is no remote fallback by design |
| Research connector (CourtListener, Descrybe, CoCounsel, …) | [✓ / ✗] | Authorities ChatGPT names are returned tagged `[verify]` and flagged as unchecked |

*Re-check: `/chatgpt-bridge:bridge-setup --check-integrations`*
