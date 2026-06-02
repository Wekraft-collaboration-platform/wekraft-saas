import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

function getRazorpayKeySecret(): string {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    // SECURITY: Never fall back to an empty string — an empty HMAC key allows
    // anyone to forge a valid signature by computing HMAC-SHA256("", payload).
    throw new Error("RAZORPAY_KEY_SECRET is not configured on the server");
  }
  return secret;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let {
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_signature || !razorpay_subscription_id) {
      return NextResponse.json(
        { error: "subscription_id, payment_id and signature are required" },
        { status: 400 },
      );
    }

    if (!plan) {
      return NextResponse.json(
        { error: "plan is required for fulfillment" },
        { status: 400 },
      );
    }

    // Resolve HMAC key — returns 500 if env var is missing (never falls back to "")
    let keySecret: string;
    try {
      keySecret = getRazorpayKeySecret();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server configuration error";
      console.error("[Razorpay Verify]", msg);
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    }

    const body = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    // SECURITY: Use timingSafeEqual directly — wrapping in try/catch handles
    // the case where lengths differ (timingSafeEqual throws a TypeError).
    // A pre-check on length before this call re-introduces a timing side channel.
    let isValid: boolean;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature),
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 },
      );
    }

    // SERVER-SIDE FULFILLMENT
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (!convexUrl || !backendSecret) {
      console.error("[Razorpay Verify] Missing CONVEX_URL or BACKEND_SECRET");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    }

    let currentPeriodEnd: number | undefined;
    try {
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (razorpayKeyId) {
        const razorpay = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: keySecret,
        });
        const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);

        // SECURITY: Prevent payment verification replay for different users
        if (subscription && subscription.notes && subscription.notes.userId !== userId) {
          console.error(`[Razorpay Verify] userId mismatch. Expected ${subscription.notes.userId}, got ${userId}`);
          return NextResponse.json({ success: false, error: "Unauthorized userId for this payment" }, { status: 403 });
        }

        if (subscription && subscription.current_end) {
          currentPeriodEnd = subscription.current_end * 1000;
        }

        // SECURITY: Override the client-provided plan with the actual plan from Razorpay
        if (subscription && subscription.plan_id) {
          if (subscription.plan_id === process.env.RAZORPAY_PRO_PLAN_ID) {
            plan = "pro";
          } else if (subscription.plan_id === process.env.RAZORPAY_PLUS_PLAN_ID) {
            plan = "plus";
          } else {
            console.error(`[Razorpay Verify] Unknown plan_id ${subscription.plan_id}`);
            return NextResponse.json({ success: false, error: "Unknown subscription plan" }, { status: 400 });
          }
        }
      }
    } catch (err) {
      console.error("[Razorpay Verify] Failed to fetch subscription details:", err);
      currentPeriodEnd = Date.now() + 30 * 24 * 60 * 60 * 1000; // Fallback to 30 days
    }

    const convex = new ConvexHttpClient(convexUrl);
    
    const userObj = await convex.query(api.user.getUserByClerkToken, { clerkToken: userId });
    if (!userObj) {
      return NextResponse.json({ success: false, error: "User not found in database" }, { status: 404 });
    }

    await convex.action(api.razorpay.updatePlanServerSide, {
      backendSecret,
      userId: userObj._id,
      plan,
      subscriptionId: razorpay_subscription_id,
      status: "active",
      currentPeriodEnd,
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and plan updated successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Razorpay Verify Error]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
