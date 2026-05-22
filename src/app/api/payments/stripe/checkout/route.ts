import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { planName, planType, priceUSD, userId, userEmail } = await req.json();

    if (!planName || !planType || priceUSD === undefined || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[Stripe] Missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    let targetPriceId = "";
    if (planType === "plus") {
      targetPriceId = process.env.STRIPE_PLUS_PRICE_ID || "";
    } else if (planType === "pro") {
      targetPriceId = process.env.STRIPE_PRO_PRICE_ID || "";
    }

    if (!targetPriceId) {
      console.error(`[Stripe] Missing configuration for ${planType} plan`);
      return NextResponse.json(
        { error: `Server missing configuration for ${planType} plan` },
        { status: 500 },
      );
    }

    // Step 3: Create the Checkout Session
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: userEmail,
      client_reference_id: userId, // extremely important for webhook
      metadata: {
        planType, // e.g. "plus" or "pro"
      },
      line_items: [
        {
          price: targetPriceId,
          quantity: 1,
        },
      ],
      success_url: process.env.STRIPE_SUCCESS_URL 
        ? `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&success=true` 
        : `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL 
        ? `${process.env.STRIPE_CANCEL_URL}?canceled=true` 
        : `${origin}/web/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Checkout Error]", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
