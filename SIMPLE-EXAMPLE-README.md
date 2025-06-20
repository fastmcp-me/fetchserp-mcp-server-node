# Simple FetchSERP MCP Examples

Get up and running with FetchSERP MCP in under 2 minutes! Choose your AI provider:

## Quick Start Options

### Option 1: Claude + MCP Server 

Run a local MCP server with Claude:

```bash
# Create .env file first:
echo "CLAUDE_API_KEY=your_claude_api_key" > .env
echo "FETCHSERP_API_TOKEN=your_fetchserp_token" > .env
echo "MCP_SERVER_URL=https://mcp.fetchserp.com/sse" > .env

# Run the example:
node simple-claude-mcp-example.js
```

### Option 2: OpenAI + Hosted MCP 

Use OpenAI's hosted MCP integration:

```bash
# Create .env file first:
echo "OPENAI_API_KEY=your_openai_api_key" > .env
echo "FETCHSERP_API_TOKEN=your_fetchserp_token" >> .env
echo "MCP_SERVER_URL=https://mcp.fetchserp.com/sse" >> .env

# Run the example:
node simple-openai-mcp-example.js
```

**That's it!** Your AI will now use FetchSERP tools to get real search data.

## What These Examples Do

### Claude Example (`simple-claude-mcp-example.js`)
1. **Local MCP Server**: Runs FetchSERP MCP server locally
2. **Claude Integration**: Demonstrates Claude using real search tools via MCP

### OpenAI Example (`simple-openai-mcp-example.js`)
1. **Hosted MCP**: Uses OpenAI's hosted MCP integration with FetchSERP
2. **Approval Flow**: Handles the approval workflow for tool execution
3. **Polling Loop**: Waits for tool completion and displays results

## Example Output

### Claude Example
```
🚀 Simple Claude API + MCP Server Example (HTTPS)
=======================================================

🤖 Asking Claude: "Who is ranking 3rd on Google for the keyword 'serp api'?"

📋 Claude's Response:
💬 I'll search for the keyword 'serp api' on Google to find out who is ranking 3rd.

🔧 Used MCP Tool: get_serp_results
📊 Tool Result: Success

💬 Based on the current Google search results for "serp api", **Bright Data** is ranking 3rd.
```

### OpenAI Example
```
Approving tool request from the model...
SERP results received!

{
  data: {
    query: 'serp api',
    search_engine: 'google',
    country: 'us',
    results_count: 10,
    results: [
      {
        site_name: 'serpapi.com',
        url: 'https://serpapi.com/',
        title: 'SerpApi: Google Search API',
        description: 'SerpApi is a real-time API to access Google search results...',
        ranking: 2
      },
      // ... more results
    ]
  }
}
```

## Requirements

### For Claude Example
- Node.js 18+
- Claude API key ([get one here](https://console.anthropic.com/))
- FetchSERP API token ([get 250 free credits](https://www.fetchserp.com))

### For OpenAI Example
- Node.js 18+
- OpenAI API key ([get one here](https://platform.openai.com/))
- FetchSERP API token ([get 250 free credits](https://www.fetchserp.com))

## Setup Instructions

### Claude Example Setup
No additional setup needed - just run the command above.

### OpenAI Example Setup
1. Create a `.env` file:
   ```bash
   OPENAI_API_KEY=sk-your-openai-api-key-here
   FETCHSERP_API_TOKEN=fs_your-fetchserp-token-here
   MCP_SERVER_URL=https://mcp.fetchserp.com/sse
   ```

2. Run the example:
   ```bash
   node simple-openai-mcp-example.js
   ```

## Understanding the OpenAI MCP Flow

The OpenAI example demonstrates the complete MCP approval workflow:

1. **Initial Request**: Model requests to use a tool
2. **Approval Required**: FetchSERP MCP returns an `mcp_approval_request`
3. **Auto-Approval**: Script automatically approves the request
4. **Tool Execution**: Tool runs and returns results
5. **Result Display**: Script parses and displays the search results

This pattern can be adapted for any MCP tool that requires approval.

## Troubleshooting

### Claude Example Issues
**Server not starting?**
- Make sure you have Node.js 18+ installed
- Check that port 8000 is available

### OpenAI Example Issues
**Approval request errors?**
- Make sure the `tools` array is included in both the initial and approval requests
- Verify the `mcp_approval_response` format matches the expected structure

### General Issues
**API errors?**
- Verify your API keys are correct
- Check you have sufficient API credits

**No search results?**
- Verify your FetchSERP API token is correct
- Check you have API credits remaining at fetchserp.com

## What's Next?

- Explore all 21+ available FetchSERP tools
- Deploy to production with hosted MCP
- Integrate with your own applications
- Build custom MCP tools for your needs 