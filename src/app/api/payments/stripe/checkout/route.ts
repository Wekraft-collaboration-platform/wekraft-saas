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

    // Step 1: Search for an existing product with this exact name
    let product: Stripe.Product;
    const existingProducts = await stripe.products.search({
      query: `name:'${planName}' AND active:'true'`,
      limit: 1,
    });

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
    } else {
      // Create a new product dynamically
      product = await stripe.products.create({
        name: planName,
        description: `Subscription to Wekraft ${planName} plan`,
      });
    }

    // Step 2: Find or create a price for this product
    // We search active prices for this product that match the exact unit_amount (in cents)
    const unitAmountCents = Math.round(priceUSD * 100);

    let price: Stripe.Price;
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      currency: "usd",
      type: "recurring",
    });

    const matchingPrice = existingPrices.data.find(
      (p) => p.unit_amount === unitAmountCents && p.recurring?.interval === "month"
    );

    if (matchingPrice) {
      price = matchingPrice;
    } else {
      // Create a new price dynamically
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: unitAmountCents,
        currency: "usd",
        recurring: { interval: "month" },
      });
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
          price: price.id,
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
