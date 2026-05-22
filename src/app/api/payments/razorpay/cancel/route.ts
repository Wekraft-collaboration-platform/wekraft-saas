import { type NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

if (
  !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {
  console.warn("[Razorpay] Missing NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in env");
}

export async function POST(req: NextRequest) {
  try {
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required" },
        { status: 400 },
      );
    }

    // By passing 'true', Razorpay schedules the cancellation for the end of the current billing cycle
    await razorpay.subscriptions.cancel(subscriptionId, true);

    // SERVER-SIDE FULFILLMENT: Instantly update cancelAtPeriodEnd in Convex so the UI updates
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (convexUrl && backendSecret) {
      const { ConvexHttpClient } = await import("convex/browser");
      const { api } = await import("../../../../../../convex/_generated/api");
      const convex = new ConvexHttpClient(convexUrl);
      
      // @ts-ignore
      await convex.mutation(api.razorpay.handleSubscriptionUpdate, {
        backendSecret,
        subscriptionId,
        status: "active", // Plan stays active until period ends
        cancelAtPeriodEnd: true,
      });
    }

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
