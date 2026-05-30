import {
  AgentEvent,
  RunAgentInputInternal,
  ResumeAgentInputInternal,
  ReplayAgentInputInternal,
  ForkAgentInputInternal,
} from "./types";

export async function* callAgentRoute<
  TAgentState,
  TInterruptValue,
  TResumeValue,
>(
  body:
    | RunAgentInputInternal<TAgentState>
    | ResumeAgentInputInternal<TResumeValue>
    | ForkAgentInputInternal<TAgentState>
    | ReplayAgentInputInternal,
): AsyncGenerator<AgentEvent<TAgentState, TInterruptValue>, void, unknown> {
  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || error.detail || "Failed to call agent route",
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let buffer = "";
    let currentEvent: string | null = null;
    let currentDataString = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let lineEnd;
      while ((lineEnd = buffer.indexOf("\n")) !== -1) {
        const line = buffer.substring(0, lineEnd);
        buffer = buffer.substring(lineEnd + 1);

        if (line.trim() === "") {
          // Empty line signals end of event block
          if (currentEvent || currentDataString) {
            try {
              const data = currentDataString
                ? JSON.parse(currentDataString)
                : undefined;
              yield {
                event: currentEvent || "message",
                data,
              } as AgentEvent<TAgentState, TInterruptValue>;
            } catch (e) {
              console.error("Failed to parse SSE data:", currentDataString, e);
            }
            currentEvent = null;
            currentDataString = "";
          }
        } else {
          const colonIndex = line.indexOf(":");
          if (colonIndex !== -1) {
            const field = line.substring(0, colonIndex).trim();
            let val = line.substring(colonIndex + 1);
            // SSE spec: remove leading space if present
            if (val.startsWith(" ")) val = val.substring(1);

            if (field === "event") {
              currentEvent = val.trim();
            } else if (field === "data") {
              currentDataString += val;
            }
          }
        }
      }
    }

    // Final cleanup for any remaining data in the buffer
    if (currentEvent || currentDataString) {
      try {
        const data = currentDataString ? JSON.parse(currentDataString) : undefined;
        yield { event: currentEvent || "message", data } as AgentEvent<TAgentState, TInterruptValue>;
      } catch (e) {
        // Silently fail on cleanup if incomplete
      }
    }
  } catch (error) {
    console.error("Error in callAgentRoute.", error);
    throw error;
  }
}
