import { serve } from "inngest/next";
import { connectRepo } from "@/inngest/functions/connect";
import { inngest } from "../../../inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [connectRepo],
});
