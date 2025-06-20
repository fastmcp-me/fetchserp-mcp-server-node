# Simple Claude + FetchSERP MCP Example

Get up and running with Claude + FetchSERP MCP in under 2 minutes!

## Quick Start (3 Steps)

### Step 1: Start the MCP Server
```bash
npm run start:http
```

### Step 2: Start ngrok tunnel
```bash
ngrok http 8000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Step 3: Run Claude Example
```bash
CLAUDE_API_KEY=your_claude_api_key \
FETCHSERP_API_TOKEN=your_fetchserp_token \
MCP_SERVER_URL=https://guinea-dominant-jolly.ngrok-free.app/sse \
node simple-claude-mcp-example.js
```

**That's it!** Claude will now use your MCP server to get real search data.

## What This Does

1. **MCP Server**: Exposes FetchSERP API tools via Model Context Protocol
2. **ngrok**: Creates secure HTTPS tunnel for Claude to access your local server
3. **Claude Example**: Demonstrates Claude using real search tools to answer questions

## Example Output

```
🚀 Simple Claude API + MCP Server Example (HTTPS)
=======================================================

🔗 MCP Server: https://abc123.ngrok-free.app/sse

🏥 Testing server health: https://abc123.ngrok-free.app/health
   ✅ Server Status: ok
   ✅ Server: fetchserp-mcp-server v1.0.0
   ✅ Protocol: http
   ✅ Transport: StreamableHTTP

🤖 Asking Claude: "Who is ranking 3rd on Google for the keyword 'serp api'?"

📋 Claude's Response:

💬 I'll search for the keyword 'serp api' on Google to find out who is ranking 3rd.

🔧 Used MCP Tool: get_serp_results
   Server: fetchserp
   Input: {"query":"serp api","search_engine":"google","country":"us","pages_number":1}

📊 Tool Result: Success

💬 Based on the current Google search results for "serp api", **Scrapfly** is ranking 3rd.

✅ Example completed successfully!
```

## Requirements

- Node.js 18+
- Claude API key ([get one here](https://console.anthropic.com/))
- FetchSERP API token ([get 250 free credits](https://www.fetchserp.com))
- ngrok ([download here](https://ngrok.com/download))

## Troubleshooting

**Server not starting?**
- Make sure you have Node.js 18+ installed
- Check that port 8000 is available

**ngrok not working?**
- Install ngrok: `brew install ngrok` (macOS) or download from ngrok.com
- Make sure ngrok is in your PATH

**Claude API errors?**
- Verify your Claude API key is correct
- Check you have sufficient API credits

**No search results?**
- Verify your FetchSERP API token is correct
- Check you have API credits remaining at fetchserp.com

## What's Next?

- Explore all 21 available FetchSERP tools
- Deploy to production with proper HTTPS
- Integrate with your own applications
- Build custom MCP tools for your needs 