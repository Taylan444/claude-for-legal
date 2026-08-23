# Connect Claude Code with Gemini Notebook

This guide shows how to integrate **Gemini Notebook** (powered by `notebooklm-mcp-cli`) with Claude Code for legal research, content generation, and document management.

## What You Get

With this integration, Claude can:
- Create and manage Gemini Notebook notebooks
- Add research sources (URLs, PDFs, YouTube videos, Google Drive docs)
- Query notebooks and get AI-powered summaries
- Generate audio podcasts, video explainers, slide decks
- Create study materials (flashcards, quizzes, mind maps)
- Manage notebook sharing and collaboration

Perfect for legal research, case summaries, contract analysis, and knowledge base building.

## Installation

### Step 1: Install `notebooklm-mcp-cli`

Choose your preferred package manager:

```bash
# Using uv (recommended)
uv tool install notebooklm-mcp-cli

# Using pip
pip install notebooklm-mcp-cli

# Using pipx
pipx install notebooklm-mcp-cli
```

### Step 2: Authenticate with Google

```bash
nlm login
```

This launches your browser to authenticate with Google. Your credentials are stored locally.

### Step 3: Connect to Claude Code

**Option A: Automatic Setup (Easiest)**

```bash
nlm setup add claude-code
```

This automatically configures the MCP server in Claude Code.

**Option B: Manual Configuration**

Edit your Claude Code MCP configuration:

**macOS/Linux:** `~/.claude/mcp.json`
**Windows:** `%APPDATA%\.claude\mcp.json`

Add this entry:

```json
{
  "mcpServers": {
    "gemini-notebook-mcp": {
      "command": "notebooklm-mcp"
    }
  }
}
```

Then restart Claude Code or run:

```bash
claude mcp add --scope user gemini-notebook-mcp notebooklm-mcp
```

## Quick Start

Once configured, try these commands in Claude Code:

```
@gemini-notebook-mcp

Create a notebook called "Contract Analysis" and add https://example.com/contract as a source
```

```
List all my notebooks and show me which ones were updated today
```

```
Generate a podcast from the "IP Law" notebook
```

## Use Cases for Legal Practice

### Contract Management
- Create a notebook for each major contract
- Add the contract PDF + related documents
- Have Claude summarize key terms, obligations, and risks
- Generate a podcast summary for quick review

### Case Law Research
- Create a notebook for case research
- Add court decisions, legal briefs, law review articles
- Get AI-powered summaries of holdings and reasoning
- Generate flashcards for exam prep

### Legal Knowledge Base
- Build institutional knowledge notebooks
- Add practice-area-specific guides and precedents
- Generate study materials for onboarding
- Share notebooks with team members

### Client Communications
- Create client-facing notebooks with case updates
- Generate slide decks for client presentations
- Create video explainers for complex concepts
- Share via public links or invite-only access

## Available Tools

Claude can use 43 tools in the Gemini Notebook MCP. Key ones:

| Tool | Purpose |
|------|---------|
| `notebook_create` | Create a new notebook |
| `notebook_list` | List all notebooks |
| `source_add` | Add research sources (URL, file, Google Drive) |
| `notebook_query` | Query a notebook and get AI responses |
| `studio_create` | Generate audio, video, slides, reports |
| `download_artifact` | Download generated content |
| `notebook_share_*` | Share notebooks (public link or invite) |
| `chat_list`/`chat_get` | Access chat history and responses |
| `research_start` | Start web or Drive research |

See the [full MCP guide](https://github.com/jacob-bd/gemini-notebook-mcp-cli/blob/main/docs/MCP_GUIDE.md) for complete documentation.

## Troubleshooting

### "MCP server not found"
- Verify installation: `nlm --help` should work
- Verify configuration: check your `.claude/mcp.json` file
- Restart Claude Code after installation

### "Authentication failed"
```bash
nlm login --check
```

If stale, re-authenticate:
```bash
nlm login
```

### "Command not found: notebooklm-mcp"
- Check installation path: `which notebooklm-mcp`
- If using `uv tool install`, ensure `~/.local/bin` (Linux/macOS) or `%LOCALAPPDATA%\Python\Scripts` (Windows) is in your PATH

### Rate limits
Free Gemini Notebook tier has ~50 queries/day. Upgrade to Pro for higher limits.

## Disabling the MCP

To preserve context window when not using Gemini Notebook:

```bash
# Remove from Claude Code
nlm setup remove claude-code

# Or in Claude Code, run:
@gemini-notebook-mcp toggle
```

## Next Steps

- Read the [full MCP documentation](https://github.com/jacob-bd/gemini-notebook-mcp-cli/blob/main/docs/MCP_GUIDE.md)
- Check out the [Getting Started guide](https://github.com/jacob-bd/gemini-notebook-mcp-cli/blob/main/docs/GETTING_STARTED.md)
- Install skills for your AI tool: `nlm skill install claude-code`

---

**Note:** This integration uses internal Gemini Notebook APIs that may change. Not affiliated with Google. Use for personal/experimental purposes.
