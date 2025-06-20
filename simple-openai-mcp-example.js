import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Ensure the two required environment variables are present
  if (!process.env.OPENAI_API_KEY || !process.env.FETCHSERP_API_TOKEN || !process.env.MCP_SERVER_URL) {
    console.error("Please set OPENAI_API_KEY, FETCHSERP_API_TOKEN, and MCP_SERVER_URL inside a .env file or your shell environment.");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const keyword = "serp api";
  const question = `Fetch the Google search results for the keyword \"${keyword}\".`;

  try {
    let response = await openai.responses.create({
      model: "gpt-4.1",
      tools: [
        {
          type: "mcp",
          server_label: "fetchserp",
          server_url: process.env.MCP_SERVER_URL,
          headers: {
            Authorization: `Bearer ${process.env.FETCHSERP_API_TOKEN}`
          }
        }
      ],
      input: question
    });

    // Loop to handle approval flow and wait for tool completion
    while (true) {
      // Look for an approval request in the output
      const approvalReq = response.output?.find((item) => item.type === "mcp_approval_request");
      if (approvalReq) {
        console.log("Approving tool request from the model...");
        response = await openai.responses.create({
          model: "gpt-4.1",
          previous_response_id: response.id,
          tools: [
            {
              type: "mcp",
              server_label: "fetchserp",
              server_url: process.env.MCP_SERVER_URL,
              headers: {
                Authorization: `Bearer ${process.env.FETCHSERP_API_TOKEN}`
              }
            }
          ],
          input: [
            {
              type: "mcp_approval_response",
              approval_request_id: approvalReq.id,
              approve: true
            }
          ]
        });
        // continue loop to check for final output
        continue;
      }

      // Look for completed tool call
      const toolCall = response.output?.find(
        (item) => item.type === "mcp_call" && item.name === "get_serp_results" && item.output
      );
      if (toolCall) {
        console.log("SERP results received!\n");
        try {
          const parsedOutput = JSON.parse(toolCall.output);
          console.dir(parsedOutput, { depth: null, colors: true });
        } catch (_) {
          console.log(toolCall.output);
        }
        break;
      }

      // If we reach here, the tool call hasn\'t finished yet. Poll the response.
      console.log("Waiting for tool execution to finish...");
      await new Promise((r) => setTimeout(r, 2000));
      response = await openai.responses.retrieve(response.id);
    }
  } catch (err) {
    console.error("Error while calling OpenAI:", err);
  }
}

main(); 