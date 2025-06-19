#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import express from 'express';

const API_BASE_URL = 'https://www.fetchserp.com';

class FetchSERPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'fetchserp-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_backlinks',
            description: 'Get backlinks for a given domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain to search for backlinks',
                },
                search_engine: {
                  type: 'string',
                  description: 'The search engine to use (google, bing, yahoo, duckduckgo). Default: google',
                  default: 'google',
                },
                country: {
                  type: 'string',
                  description: 'The country to search from. Default: us',
                  default: 'us',
                },
                pages_number: {
                  type: 'integer',
                  description: 'The number of pages to search (1-30). Default: 15',
                  default: 15,
                  minimum: 1,
                  maximum: 30,
                },
              },
              required: ['domain'],
            },
          },
          {
            name: 'get_domain_emails',
            description: 'Retrieve emails from a given domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain to search emails from',
                },
                search_engine: {
                  type: 'string',
                  description: 'The search engine to use (google, bing, yahoo, duckduckgo). Default: google',
                  default: 'google',
                },
                country: {
                  type: 'string',
                  description: 'The country to search from. Default: us',
                  default: 'us',
                },
                pages_number: {
                  type: 'integer',
                  description: 'The number of pages to search (1-30). Default: 1',
                  default: 1,
                  minimum: 1,
                  maximum: 30,
                },
              },
              required: ['domain'],
            },
          },
          {
            name: 'get_domain_info',
            description: 'Get domain info including DNS records, WHOIS data, SSL certificates, and technology stack',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain to check',
                },
              },
              required: ['domain'],
            },
          },
          {
            name: 'get_keywords_search_volume',
            description: 'Get search volume for given keywords',
            inputSchema: {
              type: 'object',
              properties: {
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'The keywords to search',
                },
                country: {
                  type: 'string',
                  description: 'The country code to search for',
                },
              },
              required: ['keywords'],
            },
          },
          {
            name: 'get_keywords_suggestions',
            description: 'Get keyword suggestions based on a url or a list of keywords',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The url to search (optional if keywords provided)',
                },
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'The keywords to search (optional if url provided)',
                },
                country: {
                  type: 'string',
                  description: 'The country code to search for',
                },
              },
            },
          },
          {
            name: 'get_long_tail_keywords',
            description: 'Generate long-tail keywords for a given keyword',
            inputSchema: {
              type: 'object',
              properties: {
                keyword: {
                  type: 'string',
                  description: 'The seed keyword to generate long-tail keywords from',
                },
                search_intent: {
                  type: 'string',
                  description: 'The search intent (informational, commercial, transactional, navigational). Default: informational',
                  default: 'informational',
                },
                count: {
                  type: 'integer',
                  description: 'The number of long-tail keywords to generate (1-500). Default: 10',
                  default: 10,
                  minimum: 1,
                  maximum: 500,
                },
              },
              required: ['keyword'],
            },
          },
          {
            name: 'get_moz_analysis',
            description: 'Get Moz domain analysis data',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain to analyze',
                },
              },
              required: ['domain'],
            },
          },
          {
            name: 'check_page_indexation',
            description: 'Check if a domain is indexed for a given keyword',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain to check',
                },
                keyword: {
                  type: 'string',
                  description: 'The keyword to check',
                },
              },
              required: ['domain', 'keyword'],
            },
          },
          {
            name: 'get_domain_ranking',
            description: 'Get domain ranking for a given keyword',
            inputSchema: {
              type: 'object',
              properties: {
                keyword: {
                  type: 'string',
                  description: 'The keyword to search',
                },
                domain: {
                  type: 'string',
                  description: 'The domain to search',
                },
                search_engine: {
                  type: 'string',
                  description: 'The search engine to use (google, bing, yahoo, duckduckgo). Default: google',
                  default: 'google',
                },
                country: {
                  type: 'string',
                  description: 'The country to search from. Default: us',
                  default: 'us',
                },
                pages_number: {
                  type: 'integer',
                  description: 'The number of pages to search (1-30). Default: 10',
                  default: 10,
                  minimum: 1,
                  maximum: 30,
                },
              },
              required: ['keyword', 'domain'],
            },
          },
          {
            name: 'scrape_webpage',
            description: 'Scrape a web page without JS',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The url to scrape',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'scrape_domain',
            description: 'Scrape a domain',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'The domain to scrape',
                },
                max_pages: {
                  type: 'integer',
                  description: 'The maximum number of pages to scrape (up to 200). Default: 10',
                  default: 10,
                  maximum: 200,
                },
              },
              required: ['domain'],
            },
          },
          {
            name: 'scrape_webpage_js',
            description: 'Scrape a web page with custom JS',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The url to scrape',
                },
                js_script: {
                  type: 'string',
                  description: 'The javascript code to execute on the page',
                },
              },
              required: ['url', 'js_script'],
            },
          },
          {
            name: 'scrape_webpage_js_proxy',
            description: 'Scrape a web page with JS and proxy',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The url to scrape',
                },
                country: {
                  type: 'string',
                  description: 'The country to use for the proxy',
                },
                js_script: {
                  type: 'string',
                  description: 'The javascript code to execute on the page',
                },
              },
              required: ['url', 'country', 'js_script'],
            },
          },
          {
            name: 'get_serp_results',
            description: 'Get search engine results',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The query to search',
                },
                search_engine: {
                  type: 'string',
                  description: 'The search engine to use (google, bing, yahoo, duckduckgo). Default: google',
                  default: 'google',
                },
                country: {
                  type: 'string',
                  description: 'The country to search from. Default: us',
                  default: 'us',
                },
                pages_number: {
                  type: 'integer',
                  description: 'The number of pages to search (1-30). Default: 1',
                  default: 1,
                  minimum: 1,
                  maximum: 30,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_serp_html',
            description: 'Get search engine results with HTML content',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The query to search',
                },
                search_engine: {
                  type: 'string',
                  description: 'The search engine to use (google, bing, yahoo, duckduckgo). Default: google',
                  default: 'google',
                },
                country: {
                  type: 'string',
                  description: 'The country to search from. Default: us',
                  default: 'us',
                },
                pages_number: {
                  type: 'integer',
                  description: 'The number of pages to search (1-30). Default: 1',
                  default: 1,
                  minimum: 1,
                  maximum: 30,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_serp_js_start',
            description: 'Start SERP with AI Overview job (step 1) - returns UUID for polling',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The query to search',
                },
                country: {
                  type: 'string',
                  description: 'The country to search from. Default: us',
                  default: 'us',
                },
                pages_number: {
                  type: 'integer',
                  description: 'The number of pages to search (1-10). Default: 1',
                  default: 1,
                  minimum: 1,
                  maximum: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_serp_js_result',
            description: 'Get SERP with AI Overview results (step 2) using UUID from step 1',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: {
                  type: 'string',
                  description: 'The UUID returned by the SERP JS start endpoint',
                },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'get_serp_text',
            description: 'Get search engine results with text content',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The query to search',
                },
                search_engine: {
                  type: 'string',
                  description: 'The search engine to use (google, bing, yahoo, duckduckgo). Default: google',
                  default: 'google',
                },
                country: {
                  type: 'string',
                  description: 'The country to search from. Default: us',
                  default: 'us',
                },
                pages_number: {
                  type: 'integer',
                  description: 'The number of pages to search (1-30). Default: 1',
                  default: 1,
                  minimum: 1,
                  maximum: 30,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_user_info',
            description: 'Get user information including API credit',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_webpage_ai_analysis',
            description: 'Analyze a web page with AI',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The url to analyze',
                },
                prompt: {
                  type: 'string',
                  description: 'The prompt to use for the analysis',
                },
              },
              required: ['url', 'prompt'],
            },
          },
          {
            name: 'get_webpage_seo_analysis',
            description: 'Get SEO analysis for a given url',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The url to analyze',
                },
              },
              required: ['url'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.handleToolCall(name, args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async makeRequest(endpoint, method = 'GET', params = {}, body = null) {
    const token = process.env.FETCHSERP_API_TOKEN;
    if (!token) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'FETCHSERP_API_TOKEN environment variable is required'
      );
    }

    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    // Add query parameters for GET requests
    if (method === 'GET' && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(`${key}[]`, v));
          } else {
            url.searchParams.append(key, value.toString());
          }
        }
      });
    }

    const fetchOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), fetchOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new McpError(
        ErrorCode.InternalError,
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  async handleToolCall(name, args) {
    switch (name) {
      case 'get_backlinks':
        return await this.makeRequest('/api/v1/backlinks', 'GET', args);

      case 'get_domain_emails':
        return await this.makeRequest('/api/v1/domain_emails', 'GET', args);

      case 'get_domain_info':
        return await this.makeRequest('/api/v1/domain_infos', 'GET', args);

      case 'get_keywords_search_volume':
        return await this.makeRequest('/api/v1/keywords_search_volume', 'GET', args);

      case 'get_keywords_suggestions':
        return await this.makeRequest('/api/v1/keywords_suggestions', 'GET', args);

      case 'get_long_tail_keywords':
        return await this.makeRequest('/api/v1/long_tail_keywords_generator', 'GET', args);

      case 'get_moz_analysis':
        return await this.makeRequest('/api/v1/moz', 'GET', args);

      case 'check_page_indexation':
        return await this.makeRequest('/api/v1/page_indexation', 'GET', args);

      case 'get_domain_ranking':
        return await this.makeRequest('/api/v1/ranking', 'GET', args);

      case 'scrape_webpage':
        return await this.makeRequest('/api/v1/scrape', 'GET', args);

      case 'scrape_domain':
        return await this.makeRequest('/api/v1/scrape_domain', 'GET', args);

      case 'scrape_webpage_js':
        const { url, js_script, ...jsParams } = args;
        return await this.makeRequest('/api/v1/scrape_js', 'POST', { url, ...jsParams }, { url, js_script });

      case 'scrape_webpage_js_proxy':
        const { url: proxyUrl, country, js_script: proxyScript, ...proxyParams } = args;
        return await this.makeRequest('/api/v1/scrape_js_with_proxy', 'POST', { url: proxyUrl, country, ...proxyParams }, { url: proxyUrl, js_script: proxyScript });

      case 'get_serp_results':
        return await this.makeRequest('/api/v1/serp', 'GET', args);

      case 'get_serp_html':
        return await this.makeRequest('/api/v1/serp_html', 'GET', args);

      case 'get_serp_js_start':
        return await this.makeRequest('/api/v1/serp_js', 'GET', args);

      case 'get_serp_js_result':
        return await this.makeRequest(`/api/v1/serp_js/${args.uuid}`, 'GET', {});

      case 'get_serp_text':
        return await this.makeRequest('/api/v1/serp_text', 'GET', args);

      case 'get_user_info':
        return await this.makeRequest('/api/v1/user', 'GET', {});

      case 'get_webpage_ai_analysis':
        return await this.makeRequest('/api/v1/web_page_ai_analysis', 'GET', args);

      case 'get_webpage_seo_analysis':
        return await this.makeRequest('/api/v1/web_page_seo_analysis', 'GET', args);

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  }

  async run() {
    // Check if we should run as HTTP server or stdio
    const useHttp = process.env.MCP_HTTP_MODE === 'true';
    
    if (useHttp) {
      // HTTP mode with Express
      const app = express();
      const port = process.env.PORT || 8000;
      const fetchserpToken = process.env.FETCHSERP_API_TOKEN;

      if (!fetchserpToken) {
        throw new Error('FETCHSERP_API_TOKEN environment variable is required');
      }

      app.use(express.json());

      // Auth middleware - use FETCHSERP_API_TOKEN for authentication
      app.use('/mcp', (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== `Bearer ${fetchserpToken}`) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
      });

      // Route for handling MCP requests
      app.post('/mcp', async (req, res) => {
        try {
          const transport = new StreamableHTTPServerTransport({
            request: req,
            response: res,
          });
          await this.server.connect(transport);
        } catch (error) {
          console.error('Error handling MCP request:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
          }
        }
      });

      app.listen(port, () => {
        console.log(`FetchSERP MCP server listening on http://localhost:${port}`);
      });
    } else {
      // Stdio mode (default)
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('FetchSERP MCP server running on stdio');
    }
  }
}

const server = new FetchSERPServer();
server.run().catch(console.error); 