import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const { to, projectName, inviteLink } = await req.json();

    if (!to || !inviteLink) {
      return NextResponse.json(
        { error: "Missing email address or invite link" },
        { status: 400 }
      );
    }

    // Uses your verified custom domain on Resend
    const sender = "WeKraft <invite@wekraft.xyz>";

    const templateId = process.env.RESEND_INVITE_TEMPLATE_ID;
    if (!templateId) {
      return NextResponse.json(
        { error: "RESEND_INVITE_TEMPLATE_ID is not configured in your environment variables. Please create a template on the Resend dashboard and add its ID to your .env.local file." },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: sender,
      to: [to],
      subject: `Invitation to collaborate on ${projectName || "a project"} - WeKraft`,
      template: {
        id: templateId,
        variables: {
          projectName: projectName || "WeKraft Project",
          inviteLink: inviteLink,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
