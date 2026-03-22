import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { connectRepo } from "@/inngest/functions/connect";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [connectRepo],
});
