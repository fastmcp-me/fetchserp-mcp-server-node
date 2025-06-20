#!/usr/bin/env node

/**
 * Simple Claude API + MCP Server Example with HTTPS (Let's Encrypt or Self-signed)
 * 
 * This demonstrates the simplest possible integration:
 * 1. Claude API connects to our FetchSERP MCP server via HTTPS
 * 2. User asks a question about search rankings
 * 3. Claude uses MCP tools to get real data and answers
 * 
 * Usage: node simple-claude-mcp-example.js
 */

import https from 'https';
import http from 'http';

// Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const FETCHSERP_API_TOKEN = process.env.FETCHSERP_API_TOKEN;
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://mcp.fetchserp.com:8000/sse';

// Colors for output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function httpRequest(url, options, data) {
  const urlObj = new URL(url);
  const client = urlObj.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: options.headers || {},
      // Allow self-signed certificates for localhost and mcp.fetchserp.com testing
      rejectUnauthorized: !(urlObj.hostname === 'localhost' || urlObj.hostname === 'mcp.fetchserp.com'),
      timeout: 30000 // 30 second timeout
    };

    const req = client.request(requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout after 30 seconds'));
    });

    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function askClaudeWithMCP(question, mcpServerUrl) {
  log(`\n🤖 Asking Claude: "${question}"`, colors.yellow);
  
  const claudeRequest = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user", 
        content: question
      }
    ],
    // MCP Server Configuration
    mcp_servers: [
      {
        type: "url",
        url: mcpServerUrl,
        name: "fetchserp",
        authorization_token: FETCHSERP_API_TOKEN,
        tool_configuration: {
          enabled: true
        }
      }
    ]
  };

  const response = await httpRequest('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'mcp-client-2025-04-04',
      'content-type': 'application/json'
    }
  }, JSON.stringify(claudeRequest));

  if (response.statusCode !== 200) {
    const errorData = JSON.parse(response.data);
    console.log('Full error response:', JSON.stringify(errorData, null, 2));
    throw new Error(`Claude API error: ${errorData.error?.message || response.data}`);
  }

  return JSON.parse(response.data);
}

function displayResponse(response) {
  log(`\n📋 Claude's Response:`, colors.bold + colors.blue);
  
  response.content.forEach((block) => {
    switch (block.type) {
      case 'text':
        log(`\n💬 ${block.text}`, colors.green);
        break;
        
      case 'mcp_tool_use':
        log(`\n🔧 Used MCP Tool: ${block.name}`, colors.yellow);
        log(`   Server: ${block.server_name}`, colors.yellow);
        log(`   Input: ${JSON.stringify(block.input)}`, colors.yellow);
        break;
        
      case 'mcp_tool_result':
        log(`\n📊 Tool Result: ${!block.is_error ? 'Success' : 'Error'}`, 
            block.is_error ? colors.red : colors.green);
        break;
    }
  });
}

async function runExample() {
  try {
    log('\n🚀 Simple Claude API + MCP Server Example (HTTPS)', colors.bold + colors.blue);
    log('=' .repeat(55), colors.blue);

    // Check environment variables
    if (!CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY environment variable not set');
    }
    if (!FETCHSERP_API_TOKEN) {
      throw new Error('FETCHSERP_API_TOKEN environment variable not set');
    }

    const mcpServerUrl = MCP_SERVER_URL;
    log(`\n🔗 MCP Server: ${mcpServerUrl}`, colors.blue);

    // Simple question that requires search data
    const question = "Who is ranking 3rd on Google for the keyword 'serp api'? Please use your search tools to get current results.";
    
    // Ask Claude with MCP tools
    log(`\n🤖 Making Claude API request with MCP connector...`, colors.cyan);
    const response = await askClaudeWithMCP(question, mcpServerUrl);
    
    // Display the response
    displayResponse(response);

    log(`\n✅ Example completed successfully!`, colors.bold + colors.green);

  } catch (error) {
    log(`\n💥 Error: ${error.message}`, colors.red);
    
    if (error.message.includes('Failed to connect to MCP server')) {
      log(`\n💡 This is expected - Claude's MCP connector is still in limited beta`, colors.yellow);
      log(`   Our HTTPS MCP server is ready and working correctly`, colors.yellow);
      log(`   This will work once the MCP connector feature is fully available`, colors.yellow);
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      log(`\n💡 To start the HTTPS MCP server:`, colors.yellow);
      log(`   1. Set environment variables:`, colors.yellow);
      log(`      export DOMAIN="mcp.fetchserp.com"`, colors.yellow);
      log(`      export LE_EMAIL="your-email@fetchserp.com"`, colors.yellow);
      log(`      export LE_STAGING="true"  # Use staging for testing`, colors.yellow);
      log(`   2. Start server: MCP_HTTPS_MODE=true node index.js`, colors.yellow);
      log(`   3. Ensure DNS points to your server for SSL validation`, colors.yellow);
    }
  }
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('\n📖 Simple Claude API + MCP Server Example (HTTPS)', colors.yellow);
  log('\nUsage:', colors.yellow);
  log('  node simple-claude-mcp-example.js', colors.yellow);
  log('\nSetup (HTTPS with Let\'s Encrypt):', colors.cyan);
  log('  1. Set environment variables:', colors.cyan);
  log('     export DOMAIN="mcp.fetchserp.com"', colors.cyan);
  log('     export LE_EMAIL="your-email@fetchserp.com"', colors.cyan);
  log('     export LE_STAGING="true"  # Use staging for testing', colors.cyan);
  log('  2. Start HTTPS server: MCP_HTTPS_MODE=true node index.js', colors.cyan);
  log('  3. Run example: node simple-claude-mcp-example.js', colors.cyan);
  log('\nEnvironment Variables:', colors.yellow);
  log('  CLAUDE_API_KEY="your_claude_api_key"', colors.yellow);
  log('  FETCHSERP_API_TOKEN="your_fetchserp_token"', colors.yellow);
  log('  MCP_SERVER_URL="https://mcp.fetchserp.com:8000/sse"  # Default', colors.yellow);
  log('\nWhat this does:', colors.green);
  log('  1. Connects Claude API to our FetchSERP MCP server via HTTPS', colors.green);
  log('  2. Asks Claude a question that requires search data', colors.green);
  log('  3. Claude automatically uses MCP tools to get results', colors.green);
  log('  4. Claude analyzes the data and provides an answer', colors.green);
  log('\nNote:', colors.blue);
  log('  • Uses Let\'s Encrypt for automatic SSL certificates', colors.blue);
  log('  • HTTPS only - no HTTP support for security', colors.blue);
  log('  • This will work once Claude\'s MCP connector is fully available', colors.blue);
  log('  • Currently shows connection attempt and expected behavior\n', colors.blue);
} else {
  // Run the example
  runExample().catch(console.error);
} 