import { inngest } from "@/inngest/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

// INNGEST V4
export const connectRepo = inngest.createFunction(
  { id: "connect-repo", name: "Connect Repo", triggers: [{ event: "repo-connector" }] },
  async ({ event, step }: { event: any; step: any }) => {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const {
      projectId,
      githubId,
      name,
      owner,
      fullName,
      url,
      repoType,
      userId,
    } = event.data;


    //  step : send email ( future part)
    await step.run("send-connection-notification", async () => {
      console.log("Future: Send email to user", userId);
    });

    return { success: true };
  },
);
