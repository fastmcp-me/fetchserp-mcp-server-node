# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies (all dependencies to ensure MCP SDK works properly)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R mcp:nodejs /app

# Switch to non-root user
USER mcp

# Expose port 8000
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV MCP_HTTP_MODE=true
ENV PORT=8000

# Start the MCP server
CMD ["node", "index.js"] 