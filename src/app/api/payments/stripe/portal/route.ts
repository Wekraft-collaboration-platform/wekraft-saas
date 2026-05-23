import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  // ─── Step 1: Require authenticated user ─────────────────────────────────────
  // The middleware marks /api/payments/* as public so Stripe webhooks can reach
  // it unauthenticated. We enforce auth here manually for user-facing portal calls.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing customerId" },
        { status: 400 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[Stripe Portal] Missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // ─── Step 2: Verify ownership ──────────────────────────────────────────────
    // Ensure the customerId in the request belongs to the authenticated caller.
    // Without this, any authenticated user could open the billing portal for any
    // other user simply by guessing or obtaining their Stripe customerId.
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (!convexUrl || !backendSecret) {
      console.error("[Stripe Portal] Missing CONVEX_URL or BACKEND_SECRET");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const convex = new ConvexHttpClient(convexUrl);

    // @ts-ignore — ConvexHttpClient types don't perfectly match generated api types
    const isOwner = await convex.query(api.stripe.verifyCustomerOwner, {
      backendSecret,
      customerId,
      clerkUserId: userId,
    });

    if (!isOwner) {
      console.warn(
        `[Stripe Portal] Ownership check failed: userId=${userId} tried to access customerId=${customerId}`,
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ─── Step 3: Create Stripe Billing Portal session ──────────────────────────
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/web/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Portal Error]", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
