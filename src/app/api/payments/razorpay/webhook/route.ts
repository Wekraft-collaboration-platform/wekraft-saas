import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 },
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Razorpay Webhook] Missing RAZORPAY_WEBHOOK_SECRET");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyText)
      .digest("hex");

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 },
      );
    }

    const event = JSON.parse(bodyText);
    
    // We only care about subscription events
    const supportedEvents = [
      "subscription.charged",
      "subscription.cancelled",
      "subscription.halted",
      "subscription.paused",
      "subscription.resumed"
    ];

    if (!supportedEvents.includes(event.event)) {
      return NextResponse.json({ received: true });
    }

    const subscription = event.payload.subscription.entity;
    
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (!convexUrl || !backendSecret) {
      console.error("[Razorpay Webhook] Missing CONVEX_URL or BACKEND_SECRET");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const convex = new ConvexHttpClient(convexUrl);

    // Call convex to handle the subscription update
    // @ts-ignore
    await convex.action(api.razorpay.handleSubscriptionUpdate, {
      backendSecret,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_end ? subscription.current_end * 1000 : undefined,
    });

    console.log(`[Razorpay Webhook] Handled ${event.event} for subscription ${subscription.id}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Razorpay Webhook Error]", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
