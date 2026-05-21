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
    const { amount, planName, currency = "INR" } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "amount is required and must be a positive number" },
        { status: 400 },
      );
    }

    const amountInPaise = Math.round(amount * 100);

    const plans = await razorpay.plans.all({ count: 100 });
    const existingPlan = (plans.items as RazorpayPlan[]).find(
      (p) => Number(p.item.amount) === amountInPaise && p.period === "monthly",
    );

    const targetPlan =
      existingPlan ??
      (await razorpay.plans.create({
        period: "monthly",
        interval: 1,
        item: {
          name: planName || "Wekraft Plan",
          amount: amountInPaise,
          currency,
          description: `Monthly subscription for ${planName || "Wekraft Plan"}`,
        },
      }));

    const subscription = await razorpay.subscriptions.create({
      plan_id: targetPlan.id,
      total_count: 120, // 10 years
      quantity: 1,
      customer_notify: 1,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      amount,
      currency,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Razorpay Subscription]", message);
    return NextResponse.json(
      { error: message || "Failed to create subscription" },
      { status: 500 },
    );
  }
}
