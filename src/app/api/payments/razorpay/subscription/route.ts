import { type NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

if (
  !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {
  console.warn("[Razorpay] Missing NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in env");
}

type RazorpayPlan = {
  id: string;
  period: string;
  item: {
    amount: number | string;
  };
};

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
    const { amount, planName, planType, currency = "INR" } = await req.json();

    if (!planType || (planType !== "plus" && planType !== "pro")) {
      return NextResponse.json(
        { error: "Invalid planType" },
        { status: 400 },
      );
    }

    let targetPlanId = "";
    if (planType === "plus") {
      targetPlanId = process.env.RAZORPAY_PLUS_PLAN_ID || "";
    } else if (planType === "pro") {
      targetPlanId = process.env.RAZORPAY_PRO_PLAN_ID || "";
    }

    if (!targetPlanId) {
      return NextResponse.json(
        { error: `Server missing configuration for ${planType} plan` },
        { status: 500 },
      );
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: targetPlanId,
      total_count: 120, // 10 years
      quantity: 1,
      customer_notify: 1,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      amount,
      currency,
    });
  } catch (error: any) {
    console.error("[Razorpay Subscription Error]:", error);
    let message = "Failed to create subscription";
    
    if (error instanceof Error) {
      message = error.message;
    } else if (error?.error?.description) {
      message = error.error.description;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object") {
      try {
        message = JSON.stringify(error);
      } catch (e) {
        message = String(error);
      }
    }
    
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
