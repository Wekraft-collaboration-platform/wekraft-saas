import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email, subject, description } = await req.json();

    if (!email || !subject || !description) {
      return NextResponse.json(
        { error: "Missing required fields (email, subject, description)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("----------------------------------------");
      console.log("MOCK EMAIL SENT (RESEND_API_KEY not set):");
      console.log(`From: ${email}`);
      console.log(`To: support@wekraft.xyz`);
      console.log(`Subject: [Contact Form] ${subject}`);
      console.log(`Description: ${description}`);
      console.log("----------------------------------------");
      
      return NextResponse.json({
        success: true,
        mock: true,
        message: "Email simulated successfully (development mode)."
      });
    }

    const resend = new Resend(apiKey);
    
    // We use invite@wekraft.xyz as the sender since it is verified on Resend
    const sender = "WeKraft Contact Form <invite@wekraft.xyz>";

    const { data, error } = await resend.emails.send({
      from: sender,
      to: ["support@wekraft.xyz"],
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; rounded-lg;">
          <h2 style="border-bottom: 1px solid #eaeaea; padding-bottom: 10px; color: #111;">New Support Inquiry</h2>
          <p><strong>From:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px; white-space: pre-wrap;">
            ${description}
          </div>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 20px;" />
          <p style="font-size: 12px; color: #666;">This email was sent from the WeKraft Contact Form.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
