# Simple Claude API + MCP Server Example (HTTPS)

This example demonstrates the simplest possible integration between Claude API and the FetchSERP MCP server using HTTPS with SSL certificates.

## Features

- ✅ **HTTPS Support**: Both Let's Encrypt and self-signed certificates
- ✅ **Claude API Integration**: Uses official MCP connector
- ✅ **Real FetchSERP Data**: Live search results and SEO data
- ✅ **Local Development**: Self-signed certificates for testing
- ✅ **Production Ready**: Let's Encrypt automatic SSL certificates
- ✅ **Health Monitoring**: Built-in health check endpoint
- ✅ **Color Output**: Easy-to-read colored console output

## Quick Start

### 1. Set Environment Variables

```bash
# Required
export CLAUDE_API_KEY="your-claude-api-key"
export FETCHSERP_API_TOKEN="your-fetchserp-token"

# Optional - for custom server URL
export MCP_SERVER_URL="https://mcp.fetchserp.com:8000/sse"
```

### 2. Start HTTPS MCP Server

#### For Local Development (Self-signed certificates):
```bash
USE_SELF_SIGNED=true MCP_HTTPS_MODE=true node index.js
```

#### For Production with Subdomain (Let's Encrypt):
```bash
DOMAIN="mcp.fetchserp.com" LE_EMAIL="your-email@fetchserp.com" MCP_HTTPS_MODE=true node index.js
```

#### For Let's Encrypt Staging (Testing):
```bash
DOMAIN="mcp.fetchserp.com" LE_EMAIL="admin@fetchserp.com" LE_STAGING=true MCP_HTTPS_MODE=true node index.js
```

### 3. Run the Example

```bash
node simple-claude-mcp-example.js
```

## Environment Variables

### Required
- `CLAUDE_API_KEY`: Your Claude API key from Anthropic
- `FETCHSERP_API_TOKEN`: Your FetchSERP API token

### Optional
- `MCP_SERVER_URL`: MCP server endpoint (default: `https://mcp.fetchserp.com:8000/sse`)

### HTTPS Server Configuration
- `MCP_HTTPS_MODE`: Set to `true` to enable HTTPS mode
- `USE_SELF_SIGNED`: Set to `true` to use self-signed certificates for local development
- `DOMAIN`: Domain name for Let's Encrypt certificates (default: `mcp.fetchserp.com`)
- `HTTPS_PORT`: HTTPS port (default: `8000`)
- `LE_EMAIL`: Email for Let's Encrypt notifications
- `LE_STAGING`: Set to `true` to use Let's Encrypt staging environment for testing

## SSL Certificate Options

### Using a Subdomain (Recommended)

This example uses `mcp.fetchserp.com` as the subdomain for the MCP server. Benefits include:

- ✅ **Clean Separation**: Dedicated subdomain for MCP API
- ✅ **Existing SSL Infrastructure**: Leverage existing fetchserp.com certificates
- ✅ **Easy DNS Management**: Simple A record pointing to your server
- ✅ **Professional Setup**: Standard practice for API endpoints
- ✅ **Scalability**: Easy to move to different servers or load balancers

**DNS Setup:**
```
mcp.fetchserp.com.  300  IN  A  YOUR_SERVER_IP
```

### Self-signed Certificates (Local Development)
Perfect for local testing and development:

```bash
USE_SELF_SIGNED=true MCP_HTTPS_MODE=true node index.js
```

- ✅ Works immediately on localhost
- ✅ No domain setup required
- ✅ Automatic certificate generation
- ⚠️ Browser security warnings (expected)

### Let's Encrypt Certificates (Production)
For production deployments with real domains:

```bash
DOMAIN="mcp.fetchserp.com" LE_EMAIL="your-email@fetchserp.com" MCP_HTTPS_MODE=true node index.js
```

Requirements:
- Domain must point to your server's IP address
- Ports 80 and 443 must be open for Let's Encrypt validation
- Server must be publicly accessible

### Let's Encrypt Staging (Testing)
For testing Let's Encrypt setup without rate limits:

```bash
DOMAIN="mcp.fetchserp.com" LE_EMAIL="admin@fetchserp.com" LE_STAGING=true MCP_HTTPS_MODE=true node index.js
```

## Example Output

### Starting the Server
```bash
$ USE_SELF_SIGNED=true MCP_HTTPS_MODE=true node index.js

Starting HTTPS server...
Domain: mcp.fetchserp.com
Port: 8000
SSL Mode: Self-signed certificates
Creating self-signed certificates for local development...
✅ Self-signed certificates created successfully

✅ HTTPS server listening on port 8000
SSE endpoint: https://mcp.fetchserp.com:8000/sse
Health check: https://mcp.fetchserp.com:8000/health
Ready for Claude MCP Connector integration

⚠️  Using self-signed certificates - you may need to accept security warnings in your browser
```

### Running the Example
```bash
$ node simple-claude-mcp-example.js

🚀 Simple Claude API + MCP Server Example (HTTPS)
=======================================================

🔗 MCP Server: https://mcp.fetchserp.com:8000/sse

🏥 Testing server health: https://mcp.fetchserp.com:8000/health
   ✅ Server Status: ok
   ✅ Server: fetchserp-mcp-server v1.0.0
   ✅ Protocol: https
   ✅ Domain: mcp.fetchserp.com:8000
   ✅ Transport: SSE

🤖 Asking Claude: "Who is ranking 3rd on Google for the keyword 'serp api'?"

🤖 Making Claude API request with MCP connector...

📋 Claude's Response:

🔧 Used MCP Tool: get_serp_results
   Server: fetchserp
   Input: {"query":"serp api","pages_number":1}

📊 Tool Result: Success

💬 Based on the current Google search results for "serp api", the website ranking 3rd is **Scrapfly.io** with their page titled "SERP API - Google Search Results API".

✅ Example completed successfully!
```

## Health Check

The server provides a health check endpoint at `/health`:

```bash
curl -k https://mcp.fetchserp.com:8000/health
```

Response:
```json
{
  "status": "ok",
  "server": "fetchserp-mcp-server",
  "version": "1.0.0",
  "transport": "SSE",
  "protocol": "https",
  "domain": "mcp.fetchserp.com",
  "port": 8000,
  "ssl": "Self-signed certificates",
  "endpoint": "/sse (GET) - SSE transport for Claude MCP Connector"
}
```

## Troubleshooting

### Certificate Issues

**Self-signed certificate warnings:**
- Expected behavior for localhost development
- Use `-k` flag with curl: `curl -k https://mcp.fetchserp.com:8000/health`
- Browsers will show security warnings - click "Advanced" → "Proceed"

**Let's Encrypt failures:**
- Ensure domain DNS points to your server
- Check ports 80 and 443 are open
- Verify server is publicly accessible
- Try staging mode first: `LE_STAGING=true`

### Connection Issues

**Claude API MCP connector errors:**
- Verify `CLAUDE_API_KEY` is set correctly
- Check `FETCHSERP_API_TOKEN` is valid
- Ensure MCP server is running and accessible
- Try health check first: `curl -k https://mcp.fetchserp.com:8000/health`

**Server startup failures:**
- Check if port 8000 is already in use: `lsof -i :8000`
- For Let's Encrypt: verify domain and email settings
- For self-signed: ensure OpenSSL is installed

### OpenSSL Installation

**macOS:**
```bash
brew install openssl
```

**Ubuntu/Debian:**
```bash
sudo apt-get install openssl
```

**Windows:**
- Install Git for Windows (includes OpenSSL)
- Or download from: https://slproweb.com/products/Win32OpenSSL.html

## How It Works

1. **HTTPS Server**: Starts with SSL certificates (Let's Encrypt or self-signed)
2. **MCP Protocol**: Implements Server-Sent Events (SSE) transport for Claude
3. **Authentication**: Uses Bearer token authentication with FetchSERP API token
4. **Tool Execution**: Claude calls MCP tools → Server calls FetchSERP API → Returns results
5. **Response**: Claude analyzes data and provides human-readable answers

## File Structure

```
├── index.js                    # Main MCP server with HTTPS support
├── simple-claude-mcp-example.js # Simple example demonstrating integration
├── SIMPLE-EXAMPLE-README.md    # This documentation
├── certs/                      # Auto-generated self-signed certificates
│   ├── key.pem
│   └── cert.pem
└── greenlock.d/               # Let's Encrypt certificates (production)
```

## Next Steps

- Deploy to a server with a real domain for Let's Encrypt
- Integrate into your own applications
- Explore other FetchSERP MCP tools (backlinks, keyword research, etc.)
- Set up monitoring and logging for production use

## Support

- FetchSERP API: https://fetchserp.com/
- Claude API: https://docs.anthropic.com/
- MCP Protocol: https://modelcontextprotocol.io/ 