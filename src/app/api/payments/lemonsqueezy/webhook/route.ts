import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-signature") as string;
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Lemon Squeezy Webhook] Missing LEMONSQUEEZY_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret missing" },
      { status: 500 },
    );
  }

  if (!signature) {
    console.error("[Lemon Squeezy Webhook] Missing x-signature header");
    return NextResponse.json(
      { error: "Signature missing" },
      { status: 400 },
    );
  }

  // ─── Step 1: Secure Signature Verification ─────────────────────────────────
  try {
    const hmac = crypto.createHmac("sha256", webhookSecret);
    const digest = hmac.update(body).digest("hex");

    const digestBuffer = Buffer.from(digest, "utf-8");
    const signatureBuffer = Buffer.from(signature, "utf-8");

    if (digestBuffer.length !== signatureBuffer.length) {
      console.error("[Lemon Squeezy Webhook] Signature length mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (!crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
      console.error("[Lemon Squeezy Webhook] Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (err) {
    console.error("[Lemon Squeezy Webhook] Webhook signature verification error:", err);
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  // ─── Step 2: Process Webhook Payload ───────────────────────────────────────
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const backendSecret = process.env.BACKEND_SECRET;

  if (!convexUrl || !backendSecret) {
    console.error("[Lemon Squeezy Webhook] Missing CONVEX_URL or BACKEND_SECRET");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const convex = new ConvexHttpClient(convexUrl);
  const payload = JSON.parse(body);
  const eventName = payload.meta?.event_name;
  const customData = payload.meta?.custom_data;
  const dataObject = payload.data;

  if (!eventName || !dataObject) {
    console.error("[Lemon Squeezy Webhook] Missing event name or data object");
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  try {
    const subscriptionId = dataObject.id?.toString();
    const customerId = dataObject.attributes?.customer_id?.toString();
    const status = dataObject.attributes?.status;
    
    // Parse times
    const renewsAtStr = dataObject.attributes?.renews_at;
    const endsAtStr = dataObject.attributes?.ends_at;
    
    const renewsAt = renewsAtStr ? Date.parse(renewsAtStr) : null;
    const endsAt = endsAtStr ? Date.parse(endsAtStr) : null;
    
    // Default fallback period end: 30 days from now
    const fallbackPeriodEnd = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const currentPeriodEnd = renewsAt || endsAt || fallbackPeriodEnd;

    // Check if subscription has been cancelled (scheduled to end at period end)
    const cancelAtPeriodEnd = !!(
      dataObject.attributes?.cancelled ||
      endsAtStr
    );

    switch (eventName) {
      case "subscription_created": {
        const userId = customData?.userId;
        const plan = customData?.planType as "plus" | "pro";

        if (!userId || !plan) {
          console.error("[Lemon Squeezy Webhook] Missing userId or plan in custom metadata");
          break;
        }

        // @ts-ignore
        await convex.action(api.lemonsqueezy.updatePlanServerSide, {
          backendSecret,
          userId,
          plan,
          subscriptionId,
          customerId,
          status,
          currentPeriodEnd,
        });

        console.log(`[Lemon Squeezy Webhook] Successfully created/upgraded user ${userId} to plan ${plan}`);
        break;
      }

      case "subscription_updated":
      case "subscription_cancelled":
      case "subscription_expired": {
        // @ts-ignore
        await convex.action(api.lemonsqueezy.handleSubscriptionUpdate, {
          backendSecret,
          subscriptionId,
          customerId,
          status,
          currentPeriodEnd,
          cancelAtPeriodEnd,
        });

        console.log(`[Lemon Squeezy Webhook] Processed subscription state update for sub ID: ${subscriptionId} (Status: ${status})`);
        break;
      }

      default:
        console.log(`[Lemon Squeezy Webhook] Unhandled event type: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Lemon Squeezy Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
