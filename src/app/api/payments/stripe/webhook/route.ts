import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret missing" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Stripe Webhook] Error verifying signature: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const backendSecret = process.env.BACKEND_SECRET;

  if (!convexUrl || !backendSecret) {
    console.error("[Stripe Webhook] Missing CONVEX_URL or BACKEND_SECRET");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const convex = new ConvexHttpClient(convexUrl);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Ensure this is a subscription checkout
        if (session.mode === "subscription") {
          const userId = session.client_reference_id;
          const plan = session.metadata?.planType as "plus" | "pro";
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;

          if (!userId || !plan) {
            console.error("[Stripe Webhook] Missing userId or plan in session metadata");
            break;
          }

          // Fetch the subscription to get the current period end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          const periodEndSec = subscription.items?.data?.[0]?.current_period_end || 
            (subscription as any).current_period_end || 
            (subscription as any).currentPeriodEnd ||
            (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);

          // Update Convex
          // @ts-ignore
          await convex.mutation(api.stripe.updatePlanServerSide, {
            backendSecret,
            userId,
            plan,
            subscriptionId,
            customerId,
            status: subscription.status,
            currentPeriodEnd: periodEndSec * 1000,
          });

          console.log(`[Stripe Webhook] Successfully upgraded user ${userId} to ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // To find the user, we'd ideally search by subscriptionId or customerId in Convex.
        // Wait, the API doesn't currently expose a way to query by subscriptionId via a public unauthenticated route.
        // But since this is a server-to-server webhook, we can create an internal query to get user by customerId.
        // Let's implement that if needed. For now, since `updatePlanServerSide` takes `userId`, we need a way to look it up.
        // I will add a convex internal query to find user by customerId, and then call updatePlanServerSide.
        
        // Actually, let's create a new mutation `handleSubscriptionUpdate` in `convex/stripe.ts` 
        // to handle finding the user by customerId or subscriptionId and updating their status.
        
        const periodEndSec = subscription.items?.data?.[0]?.current_period_end || 
          (subscription as any).current_period_end || 
          (subscription as any).currentPeriodEnd ||
          (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);

        const cancelAtPeriodEnd = !!(
          subscription.cancel_at_period_end || 
          subscription.cancel_at || 
          (subscription as any).cancelAtPeriodEnd
        );

        // @ts-ignore
        await convex.mutation(api.stripe.handleSubscriptionUpdate, {
          backendSecret,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          status: subscription.status,
          currentPeriodEnd: periodEndSec * 1000,
          cancelAtPeriodEnd,
        });

        console.log(`[Stripe Webhook] Handled subscription update for ${subscription.id}`);
        break;
      }
      
      default:
        console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error handling event:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
