import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { api } from "../../../../../convex/_generated/api";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken({ template: "convex" });
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    if (token) {
      client.setAuth(token);
    }

    // Verify admin access
    const adminCheck = await client.query(api.admin.checkIsAdmin);
    if (!adminCheck || !adminCheck.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const { to, subject, htmlContent } = await req.json();
    if (!to || !subject || !htmlContent) {
      return NextResponse.json(
        { error: "Missing required fields (to, subject, htmlContent)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("----------------------------------------");
      console.log("MOCK ADMIN EMAIL SENT (RESEND_API_KEY not set):");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${htmlContent}`);
      console.log("----------------------------------------");

      return NextResponse.json({
        success: true,
        mock: true,
        message: "Email simulated successfully (RESEND_API_KEY not configured)."
      });
    }

    const resend = new Resend(apiKey);
    const sender = "WeKraft Support <support@wekraft.xyz>";

    const { data, error } = await resend.emails.send({
      from: sender,
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
