import { type NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

if (
  !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {
  console.warn("[Razorpay] Missing NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in env");
}

export async function POST(req: NextRequest) {
  // ─── Step 1: Require authenticated user ─────────────────────────────────────
  // The middleware marks /api/payments/* as public so Razorpay webhooks can reach
  // it unauthenticated. We enforce auth here manually for user-facing cancel calls.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured" },
        { status: 500 },
      );
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required" },
        { status: 400 },
      );
    }

    // ─── Step 2: Verify ownership ──────────────────────────────────────────────
    // Ensure the subscriptionId in the request actually belongs to the caller.
    // Without this check, any authenticated user could cancel someone else's
    // subscription simply by sending a known subscriptionId.
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (!convexUrl || !backendSecret) {
      console.error("[Razorpay Cancel] Missing CONVEX_URL or BACKEND_SECRET");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const convex = new ConvexHttpClient(convexUrl);

    // @ts-ignore — ConvexHttpClient types don't perfectly match generated api types
    const isOwner = await convex.query(api.razorpay.verifySubscriptionOwner, {
      backendSecret,
      subscriptionId,
      clerkUserId: userId,
    });

    if (!isOwner) {
      console.warn(
        `[Razorpay Cancel] Ownership check failed: userId=${userId} tried to cancel subscriptionId=${subscriptionId}`,
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ─── Step 3: Cancel subscription at period end ─────────────────────────────
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Passing `true` schedules the cancellation at end of current billing cycle
    // (not immediately), preserving the user's access until they've paid for.
    await razorpay.subscriptions.cancel(subscriptionId, true);

    // ─── Step 4: Sync DB immediately ──────────────────────────────────────────
    // Update Convex so the UI reflects the cancellation right away,
    // instead of waiting for the Razorpay webhook to arrive.
    // @ts-ignore
    await convex.action(api.razorpay.handleSubscriptionUpdate, {
      backendSecret,
      subscriptionId,
      status: "active", // Plan stays active until period ends
      cancelAtPeriodEnd: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Razorpay Cancel]", message);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}
