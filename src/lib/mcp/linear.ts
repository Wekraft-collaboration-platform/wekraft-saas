import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export interface LinearVerificationResult {
  success: boolean;
  error?: string;
  workspaceName?: string;
  viewerName?: string;
  viewerEmail?: string;
  toolsCount?: number;
  availableTools?: string[];
}

/**
 * Validates a Linear API Key against Linear GraphQL & MCP Remote Endpoint
 */
export async function verifyLinearConnection(apiKey: string): Promise<LinearVerificationResult> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    return { success: false, error: "API key is required" };
  }

  // 1. Verify credentials with Linear GraphQL API
  try {
    const gqlRes = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: trimmedKey.startsWith("lin_api_") || trimmedKey.startsWith("Bearer ")
          ? (trimmedKey.startsWith("Bearer ") ? trimmedKey : `Bearer ${trimmedKey}`)
          : trimmedKey,
      },
      body: JSON.stringify({
        query: `
          query {
            viewer {
              id
              name
              email
              organization {
                id
                name
                urlKey
              }
            }
          }
        `,
      }),
    });

    if (!gqlRes.ok) {
      return {
        success: false,
        error: `Linear API error (Status ${gqlRes.status}): ${gqlRes.statusText}`,
      };
    }

    const data = await gqlRes.json();
    if (data.errors && data.errors.length > 0) {
      return {
        success: false,
        error: data.errors[0]?.message || "Invalid Linear API Key",
      };
    }

    const viewer = data.data?.viewer;
    const workspaceName = viewer?.organization?.name || "Linear Workspace";
    const viewerName = viewer?.name || "Linear User";
    const viewerEmail = viewer?.email || "";

    // 2. Optionally test MCP connection
    let availableTools: string[] = [];
    try {
      const client = new Client(
        { name: "wekraft-linear-verifier", version: "1.0.0" },
        { capabilities: { tools: {} } }
      );

      const transport = new SSEClientTransport(new URL("https://mcp.linear.app/mcp"), {
        eventSourceInit: {
          fetch: (url, init) =>
            fetch(url, {
              ...init,
              headers: {
                ...init?.headers,
                Authorization: `Bearer ${trimmedKey}`,
              },
            }),
        },
        requestInit: {
          headers: {
            Authorization: `Bearer ${trimmedKey}`,
          },
        },
      });

      // Connect with 5-second timeout safeguard
      await Promise.race([
        client.connect(transport),
        new Promise((_, reject) => setTimeout(() => reject(new Error("MCP timeout")), 5000)),
      ]);

      const toolsResult = await client.listTools();
      availableTools = toolsResult.tools.map((t) => t.name);
      await client.close();
    } catch (mcpErr) {
      // If remote MCP SSE server is temporarily unreachable or requires specific gateway, GraphQL verification guarantees valid key
      console.warn("MCP SSE probe warning:", mcpErr);
    }

    return {
      success: true,
      workspaceName,
      viewerName,
      viewerEmail,
      toolsCount: availableTools.length || undefined,
      availableTools: availableTools.length > 0 ? availableTools : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to reach Linear servers",
    };
  }
}
