# Gemini Notebook MCP Setup

description: Install and configure Gemini Notebook integration with Claude Code

---

# Install Gemini Notebook MCP

This skill automates the setup of **Gemini Notebook** (an AI research and note-taking tool) with Claude Code. Once configured, Claude can create notebooks, manage research sources, generate podcasts and videos, and more—all through natural language.

## What This Does

Running this skill:
1. Guides you through installation of `notebooklm-mcp-cli`
2. Handles authentication with Google
3. Configures the MCP server for Claude Code
4. Verifies everything is working

## Quick Setup

```
/gemini-notebook-setup
```

Then follow the prompts.

## Manual Steps (if you prefer)

### 1. Install the CLI

```bash
# Using uv (recommended)
uv tool install notebooklm-mcp-cli

# Or pip
pip install notebooklm-mcp-cli
```

### 2. Authenticate

```bash
nlm login
```

Your browser opens. Log in to your Google account. Credentials are stored locally.

### 3. Connect to Claude Code

```bash
nlm setup add claude-code
```

Or manually add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "gemini-notebook-mcp": {
      "command": "notebooklm-mcp"
    }
  }
}
```

Restart Claude Code (or run `claude mcp reconnect`).

### 4. Test the Connection

Try this in Claude Code:

```
@gemini-notebook-mcp

List my notebooks
```

If you see your Gemini Notebook notebooks, you're connected!

## What You Can Do Now

With Gemini Notebook connected:

- **Create notebooks**: "Create a notebook called 'Patent Research'"
- **Add sources**: "Add this URL to the notebook: [link]"
- **Query notebooks**: "What are the key points from the contract notebook?"
- **Generate content**: "Create a podcast summary of the IP Law notebook"
- **Manage sharing**: "Make the Client Updates notebook public"
- **Download artifacts**: "Download the video from the Marketing notebook"

## Troubleshooting

### Command not found: `notebooklm-mcp`

Check your installation:
```bash
nlm --version
```

If that fails, reinstall:
```bash
uv tool install --force notebooklm-mcp-cli
```

### Authentication error

Re-authenticate:
```bash
nlm login
```

Or check your current status:
```bash
nlm login --check
```

### MCP server won't connect

1. Verify the MCP is installed: `notebooklm-mcp --help`
2. Check your Claude Code config: `~/.claude/mcp.json`
3. Restart Claude Code
4. Try: `claude mcp reconnect`

### "Not authenticated"

Run `nlm login` again. Your session may have expired.

## Rate Limits

- **Free Gemini Notebook**: ~50 queries/day
- **Pro**: Higher limits

Upgrade on [notebooklm.google.com](https://notebooklm.google.com)

## More Help

- Full setup guide: [GEMINI_NOTEBOOK_SETUP.md](../GEMINI_NOTEBOOK_SETUP.md)
- GitHub repo: https://github.com/jacob-bd/gemini-notebook-mcp-cli
- MCP docs: https://github.com/jacob-bd/gemini-notebook-mcp-cli/blob/main/docs/MCP_GUIDE.md

## Next Steps

1. ✅ Install the CLI
2. ✅ Authenticate
3. ✅ Configure Claude Code
4. → **Start using it in Claude Code**

Try: `@gemini-notebook-mcp create a notebook for legal research`
