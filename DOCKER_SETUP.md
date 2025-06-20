# Docker Setup for FetchSERP MCP Server

This guide explains how to set up your FetchSERP MCP Server to work with Docker and GitHub Container Registry (ghcr.io), similar to the todoist example.

## Prerequisites

1. GitHub repository with the code pushed
2. GitHub Actions enabled (free for public repositories)
3. Docker installed locally (for testing)

## Setup Steps

### 1. Enable GitHub Packages

1. Go to your GitHub repository
2. Navigate to **Settings** → **Actions** → **General**
3. Under "Workflow permissions", ensure **Read and write permissions** is selected
4. Click **Save**

### 2. Push Your Code

Make sure all the files are committed and pushed to your repository:

```bash
git add .
git commit -m "Add Docker and GitHub Actions setup"
git push origin main
```

### 3. Trigger the Build

The GitHub Actions workflow will automatically trigger when you:

- Push code to the `main` branch
- Create a new tag/release
- Open a pull request

You can also manually trigger it from the **Actions** tab in your GitHub repository.

### 4. Verify the Build

1. Go to your repository's **Actions** tab
2. Click on the latest workflow run
3. Verify all steps completed successfully
4. Go to your repository's main page
5. Look for the **Packages** section on the right side

### 5. Test the Docker Image

Once published, you can test the Docker image:

```bash
# Pull the image
docker pull ghcr.io/fetchserp/fetchserp-mcp-server-node:latest

# Test run
docker run -it --rm \
  -e FETCHSERP_API_TOKEN="your_api_token_here" \
  ghcr.io/fetchserp/fetchserp-mcp-server-node:latest
```

## MCP Configuration

### Claude Desktop Configuration

Add this to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "fetchserp": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "FETCHSERP_API_TOKEN",
        "ghcr.io/fetchserp/fetchserp-mcp-server-node:latest"
      ],
      "env": {
        "FETCHSERP_API_TOKEN": "your_fetchserp_api_token_here"
      }
    }
  }
}
```

### HTTP Mode Configuration

For HTTP mode (useful for web deployments):

```bash
docker run -p 8000:8000 \
  -e FETCHSERP_API_TOKEN="your_token_here" \
  -e MCP_HTTP_MODE=true \
  ghcr.io/fetchserp/fetchserp-mcp-server-node:latest
```

## Docker Image Features

- **Multi-architecture**: Supports both AMD64 and ARM64
- **Lightweight**: Based on Node.js Alpine Linux
- **Security**: Runs as non-root user
- **Health checks**: Built-in health monitoring
- **Environment variables**: Configurable via environment
- **Auto-cleanup**: Uses `--rm` flag for automatic cleanup

## Versioning

The workflow creates multiple tags:
- `latest`: Always points to the latest main branch build
- `vX.Y.Z`: Specific version tags when you create releases
- `vX.Y`: Major.minor tags
- `vX`: Major version tags

## Troubleshooting

### Build Fails
- Check the Actions tab for detailed error logs
- Ensure your Dockerfile is correct
- Verify all dependencies are properly installed

### Image Not Found
- Make sure the GitHub Actions workflow completed successfully
- Check that the package is public (or you have access)
- Verify the image name matches your repository name

### Permission Issues
- Ensure GitHub Actions has read/write permissions
- For private repositories, you may need to configure access tokens

### Docker Pull Fails
- Try `docker login ghcr.io` first
- Use a personal access token if needed
- Check if the repository/package is public

## Next Steps

1. **Create a Release**: Go to your repository and create a new release to generate versioned tags
2. **Update Documentation**: Add the Docker configuration to your main README
3. **Test Integration**: Test with Claude Desktop or your MCP client
4. **Monitor Usage**: Check the package download statistics in GitHub

Your FetchSERP MCP Server is now ready to be used just like the todoist example! 