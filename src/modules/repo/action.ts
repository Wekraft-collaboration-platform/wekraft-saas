"use server";
import { inngest } from "@/inngest/client";
import { auth } from "@clerk/nextjs/server";
import { Id } from "../../../convex/_generated/dataModel";

// INNGEST INDEXING CALL
export const ConnectRepo = async (details: {
  owner: string;
  repo: string;
  githubId: BigInt;
  name: string;
  fullName: string;
  url: string;
  repoType: string; // org or other ?
  projectId: Id<"projects">;
}) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  console.log("Triggering Inngest indexing...");
  await inngest.send({
    name: "repo-connector",
    data: {
      projectId: details.projectId,
      owner: details.owner,
      repo: details.repo,
      githubId: details.githubId.toString(), // Stringify for JSON
      name: details.name,
      fullName: details.fullName,
      url: details.url,
      repoType: details.repoType,
      userId,
    },
  });

  return {
    success: true,
  };
};
