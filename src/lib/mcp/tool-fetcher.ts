import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

/**
 * Connects to a remote MCP server using an OAuth access token and retrieves all exposed tools
 */
export async function fetchMCPTools(
  mcpUrl: string,
  accessToken: string
): Promise<{ count: number; tools: string[] }> {
  const token = accessToken.trim();

  // 1. Try StreamableHTTPClientTransport (standard HTTP POST MCP transport)
  try {
    const client = new Client(
      { name: "wekraft-agent-probe", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
      requestInit: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    await Promise.race([
      client.connect(transport),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000)),
    ]);

    const result = await client.listTools();
    const toolNames = result.tools.map((t) => t.name);
    await client.close();

    return { count: toolNames.length, tools: toolNames };
  } catch (httpErr) {
    // 2. Fallback to SSEClientTransport
    try {
      const client = new Client(
        { name: "wekraft-agent-probe", version: "1.0.0" },
        { capabilities: { tools: {} } }
      );

      const transport = new SSEClientTransport(new URL(mcpUrl), {
        eventSourceInit: {
          fetch: (url, init) =>
            fetch(url, {
              ...init,
              headers: {
                ...init?.headers,
                Authorization: `Bearer ${token}`,
              },
            }),
        },
        requestInit: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      await Promise.race([
        client.connect(transport),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000)),
      ]);

      const result = await client.listTools();
      const toolNames = result.tools.map((t) => t.name);
      await client.close();

      return { count: toolNames.length, tools: toolNames };
    } catch (sseErr) {
      console.warn(`[fetchMCPTools] Could not query tools from ${mcpUrl}:`, sseErr);
      return { count: 0, tools: [] };
    }
  }
}
