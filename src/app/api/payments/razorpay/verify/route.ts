import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

function getRazorpayKeySecret() {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.warn("[Razorpay] Missing RAZORPAY_KEY_SECRET in env");
    return "";
  }
  return secret;
}

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_signature || !razorpay_subscription_id) {
      return NextResponse.json(
        { error: "subscription_id, payment_id and signature are required" },
        { status: 400 },
      );
    }

    if (!userId || !plan) {
      return NextResponse.json(
        { error: "userId and plan are required for fulfillment" },
        { status: 400 },
      );
    }

    const body = `${razorpay_payment_id}|${razorpay_subscription_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", getRazorpayKeySecret())
      .update(body)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature),
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 },
      );
    }

    // SERVER-SIDE FULFILLMENT
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (!convexUrl || !backendSecret) {
      console.error("[Razorpay Verify] Missing CONVEX_URL or BACKEND_SECRET");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const convex = new ConvexHttpClient(convexUrl);
    
    await convex.mutation(api.razorpay.updatePlanServerSide, {
      backendSecret,
      userId,
      plan,
      subscriptionId: razorpay_subscription_id,
      status: "active",
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and plan updated successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Razorpay Verify]", message);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
