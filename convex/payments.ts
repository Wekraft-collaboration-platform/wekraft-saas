"use node";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import Stripe from "stripe";

// Razorpay does not ship ESM types — require() is the safe pattern in "use node" context
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require("razorpay");

// ==========================================
// 1. Types & Interfaces
// ==========================================
export type CheckoutResponse =
  | { type: "redirect"; url: string }
  | {
      type: "modal";
      provider: "razorpay";
      subscriptionId: string;
      key: string;
    };

export interface WebhookResult {
  success: boolean;
  userId?: string;
  plan?: "free" | "plus" | "pro";
  subscriptionId?: string;
  customerId?: string;
  status?: string;
  currentPeriodEnd?: number;
}

export interface PaymentProvider {
  createSubscriptionCheckout(args: {
    userId: string;
    email: string;
    name: string;
    plan: "plus" | "pro";
  }): Promise<CheckoutResponse>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  verifyAndProcessWebhook(args: {
    signature: string;
    payload: string;
  }): Promise<WebhookResult>;
}

// ==========================================
// 2. Providers
// ==========================================

// ──────────── Razorpay (India) ────────────
class RazorpayProvider implements PaymentProvider {
  private instance: any;
  private keyId: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    if (this.keyId && keySecret) {
      this.instance = new Razorpay({
        key_id: this.keyId,
        key_secret: keySecret,
      });
    }
  }

  async createSubscriptionCheckout(args: {
    userId: string;
    email: string;
    name: string;
    plan: "plus" | "pro";
  }): Promise<CheckoutResponse> {
    if (!this.instance)
      throw new Error(
        "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your Convex environment."
      );

    const planId =
      args.plan === "plus"
        ? process.env.RAZORPAY_PLAN_ID_PLUS
        : process.env.RAZORPAY_PLAN_ID_PRO;

    if (!planId)
      throw new Error(
        `Razorpay Plan ID for "${args.plan}" is not set. Add RAZORPAY_PLAN_ID_${args.plan.toUpperCase()} to your Convex environment.`
      );

    try {
      const subscription = await this.instance.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 1200, // ~100 years — cancellation-driven lifecycle
        notes: { userId: args.userId, plan: args.plan },
      });

      return {
        type: "modal",
        provider: "razorpay",
        subscriptionId: subscription.id,
        key: this.keyId,
      };
    } catch (error: any) {
      console.error("[Razorpay] createSubscriptionCheckout failed:", error);
      throw new Error(
        error?.error?.description || "Failed to create Razorpay subscription."
      );
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.instance) return false;
    try {
      await this.instance.subscriptions.cancel(subscriptionId);
      return true;
    } catch (error: any) {
      console.error("[Razorpay] cancelSubscription failed:", error);
      return false;
    }
  }

  async verifyAndProcessWebhook(args: {
    signature: string;
    payload: string;
  }): Promise<WebhookResult> {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[Razorpay] RAZORPAY_WEBHOOK_SECRET is not set.");
      return { success: false };
    }

    // Validate signature — Razorpay.validateWebhookSignature is a static method
    let isValid = false;
    try {
      isValid = Razorpay.validateWebhookSignature(
        args.payload,
        args.signature,
        secret
      );
    } catch (err: any) {
      console.error("[Razorpay] Signature validation threw:", err);
      return { success: false };
    }

    if (!isValid) {
      console.warn("[Razorpay] Webhook signature is invalid.");
      return { success: false };
    }

    let body: any;
    try {
      body = JSON.parse(args.payload);
    } catch {
      console.error("[Razorpay] Failed to parse webhook payload.");
      return { success: false };
    }

    const event: string = body.event ?? "";

    try {
      if (
        event === "subscription.charged" ||
        event === "subscription.activated" ||
        event === "subscription.completed"
      ) {
        const sub = body.payload?.subscription?.entity;
        if (sub?.notes?.userId && sub?.notes?.plan) {
          return {
            success: true,
            userId: sub.notes.userId,
            plan: sub.notes.plan,
            subscriptionId: sub.id,
            customerId: sub.customer_id,
            status: "active",
            currentPeriodEnd: sub.current_end
              ? sub.current_end * 1000
              : undefined,
          };
        }
      } else if (
        event === "subscription.cancelled" ||
        event === "subscription.halted"
      ) {
        const sub = body.payload?.subscription?.entity;
        if (sub?.notes?.userId) {
          return {
            success: true,
            userId: sub.notes.userId,
            subscriptionId: sub.id,
            customerId: sub.customer_id,
            status: "cancelled",
            plan: "free",
          };
        }
      } else if (
        event === "order.paid" ||
        event === "payment.captured"
      ) {
        // Fallback for one-time payment flows
        const entity =
          body.payload?.order?.entity || body.payload?.payment?.entity;
        if (entity?.notes?.userId && entity?.notes?.plan) {
          return {
            success: true,
            userId: entity.notes.userId,
            plan: entity.notes.plan,
            status: "active",
          };
        }
      } else {
        console.log(`[Razorpay] Unhandled webhook event skipped: ${event}`);
      }

      // Payload parsed & verified but no matching data — still acknowledge
      return { success: true };
    } catch (error: any) {
      console.error("[Razorpay] Webhook processing error:", error);
      return { success: false };
    }
  }
}

// ──────────── Stripe (International) ────────────
class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey)
      throw new Error(
        "STRIPE_SECRET_KEY is not set in your Convex environment."
      );
    this.stripe = new Stripe(secretKey, {
      // Pinned to the version required by stripe@22.x — update deliberately after testing
      apiVersion: "2026-04-22.dahlia",
    });
  }

  private getPriceId(plan: "plus" | "pro"): string {
    const priceId =
      plan === "plus"
        ? process.env.STRIPE_PRICE_ID_PLUS
        : process.env.STRIPE_PRICE_ID_PRO;
    if (!priceId)
      throw new Error(
        `Stripe Price ID for "${plan}" is not set. Add STRIPE_PRICE_ID_${plan.toUpperCase()} to your Convex environment.`
      );
    return priceId;
  }

  async createSubscriptionCheckout(args: {
    userId: string;
    email: string;
    name: string;
    plan: "plus" | "pro";
  }): Promise<CheckoutResponse> {
    const successUrl = process.env.STRIPE_SUCCESS_URL;
    const cancelUrl = process.env.STRIPE_CANCEL_URL;

    if (!successUrl || !cancelUrl)
      throw new Error(
        "STRIPE_SUCCESS_URL and STRIPE_CANCEL_URL must be set in your Convex environment."
      );

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: "subscription",
        // Don't hard-code payment_method_types — let Stripe auto-select based on customer region
        customer_email: args.email,
        line_items: [
          {
            price: this.getPriceId(args.plan),
            quantity: 1,
          },
        ],
        // Metadata on the session is available in checkout.session.completed
        metadata: {
          userId: args.userId,
          plan: args.plan,
        },
        // Metadata on the subscription is available in all subscription events
        subscription_data: {
          metadata: {
            userId: args.userId,
            plan: args.plan,
          },
        },
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
      });

      if (!session.url)
        throw new Error(
          "Stripe did not return a checkout URL. Check your Stripe configuration."
        );

      return { type: "redirect", url: session.url };
    } catch (error: any) {
      console.error("[Stripe] createSubscriptionCheckout failed:", error);
      throw new Error(error.message || "Failed to create Stripe checkout.");
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      // cancel() ends the subscription immediately at period end by default
      await this.stripe.subscriptions.cancel(subscriptionId);
      return true;
    } catch (error: any) {
      console.error("[Stripe] cancelSubscription failed:", error);
      return false;
    }
  }

  async verifyAndProcessWebhook(args: {
    signature: string;
    payload: string;
  }): Promise<WebhookResult> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Stripe] STRIPE_WEBHOOK_SECRET is not set.");
      return { success: false };
    }

    // constructEvent throws if signature is invalid — keep this isolated
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        args.payload,
        args.signature,
        webhookSecret
      );
    } catch (err: any) {
      console.warn("[Stripe] Webhook signature verification failed:", err.message);
      return { success: false };
    }

    try {
      switch (event.type) {
        // ── Checkout completed — user just paid for the first time ──
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan as "plus" | "pro" | undefined;

          if (!userId || !plan) {
            console.warn(
              "[Stripe] checkout.session.completed is missing userId/plan metadata."
            );
            return { success: true }; // Ack — don't retry
          }

          // Pull period end from the created subscription
          let currentPeriodEnd: number | undefined;
          let subscriptionId: string | undefined;
          let customerId: string | undefined;

          if (session.subscription) {
            const sub = await this.stripe.subscriptions.retrieve(
              session.subscription as string
            );
            subscriptionId = sub.id;
            customerId =
              typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
            // In Stripe SDK v22 current_period_end lives on each subscription item
            const periodEnd = sub.items?.data?.[0]?.current_period_end;
            currentPeriodEnd = periodEnd ? periodEnd * 1000 : undefined;
          }

          return {
            success: true,
            userId,
            plan,
            subscriptionId,
            customerId,
            status: "active",
            currentPeriodEnd,
          };
        }

        // ── Monthly renewal succeeded ──
        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          // In Stripe SDK v22, invoice.parent holds the subscription reference
          const invoiceSubId =
            (invoice as any).subscription ??
            (invoice.parent as any)?.subscription_details?.subscription;
          if (!invoiceSubId) return { success: true };

          const sub = await this.stripe.subscriptions.retrieve(invoiceSubId as string);
          const userId = sub.metadata?.userId;
          const plan = sub.metadata?.plan as "plus" | "pro" | undefined;

          if (!userId || !plan) return { success: true };

          const periodEnd = sub.items?.data?.[0]?.current_period_end;
          return {
            success: true,
            userId,
            plan,
            subscriptionId: sub.id,
            customerId:
              typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
            status: "active",
            currentPeriodEnd: periodEnd ? periodEnd * 1000 : undefined,
          };
        }

        // ── Payment failed — mark past_due but do NOT downgrade yet ──
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const failedSubId =
            (invoice as any).subscription ??
            (invoice.parent as any)?.subscription_details?.subscription;
          if (!failedSubId) return { success: true };

          const sub = await this.stripe.subscriptions.retrieve(failedSubId as string);
          const userId = sub.metadata?.userId;
          if (!userId) return { success: true };

          return {
            success: true,
            userId,
            // plan intentionally omitted — do not downgrade on first failure
            subscriptionId: sub.id,
            customerId:
              typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
            status: "past_due",
          };
        }

        // ── Subscription cancelled (by user or after failed payments) ──
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const userId = sub.metadata?.userId;
          if (!userId) return { success: true };

          return {
            success: true,
            userId,
            plan: "free",
            subscriptionId: sub.id,
            customerId:
              typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
            status: "cancelled",
          };
        }

        // ── Subscription changed (upgrade / downgrade / reactivated) ──
        case "customer.subscription.updated": {
          const sub = event.data.object as Stripe.Subscription;
          const userId = sub.metadata?.userId;
          const plan = sub.metadata?.plan as "plus" | "pro" | undefined;
          if (!userId) return { success: true };

          return {
            success: true,
            userId,
            plan: sub.status === "active" ? plan : "free",
            subscriptionId: sub.id,
            customerId:
              typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
            status: sub.status,
            currentPeriodEnd: sub.items?.data?.[0]?.current_period_end
              ? sub.items.data[0].current_period_end * 1000
              : undefined,
          };
        }

        default:
          // Return true so Stripe doesn't retry unhandled events
          console.log(`[Stripe] Unhandled webhook event skipped: ${event.type}`);
          return { success: true };
      }
    } catch (error: any) {
      console.error("[Stripe] Webhook processing error:", error);
      return { success: false };
    }
  }
}

// ==========================================
// 3. Provider Factory
// ==========================================
function getPaymentProvider(providerName: string): PaymentProvider {
  switch (providerName.toLowerCase()) {
    case "razorpay":
      return new RazorpayProvider();
    case "stripe":
      return new StripeProvider();
    default:
      throw new Error(`Payment provider "${providerName}" is not supported.`);
  }
}

// ==========================================
// 4. Convex Actions
// ==========================================
const providerValidator = v.union(v.literal("razorpay"), v.literal("stripe"));
const planValidator = v.union(v.literal("plus"), v.literal("pro"));

export const createSubscriptionCheckout = action({
  args: {
    plan: planValidator,
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    provider: providerValidator,
  },
  handler: async (_ctx, args) => {
    try {
      return await getPaymentProvider(args.provider).createSubscriptionCheckout(
        args
      );
    } catch (error: any) {
      console.error("[Payments] createSubscriptionCheckout error:", error);
      throw new Error(error.message || "Checkout failed.");
    }
  },
});

export const cancelSubscription = action({
  args: {
    subscriptionId: v.string(),
    provider: providerValidator,
  },
  handler: async (_ctx, args) => {
    try {
      return await getPaymentProvider(args.provider).cancelSubscription(
        args.subscriptionId
      );
    } catch (error: any) {
      console.error("[Payments] cancelSubscription error:", error);
      throw new Error(error.message || "Cancellation failed.");
    }
  },
});

export const processWebhook = internalAction({
  args: {
    signature: v.string(),
    payload: v.string(),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await getPaymentProvider(
        args.provider
      ).verifyAndProcessWebhook(args);

      if (!result.success) {
        console.warn(
          `[Payments] Webhook from "${args.provider}" failed signature verification.`
        );
        return false;
      }

      if (!result.userId) {
        // No userId extracted — nothing to update, but still a valid webhook
        return true;
      }

      // Only pass plan if it's defined — user.ts will skip accountType update if omitted
      await ctx.runMutation(internal.user.updateUserSubscriptionInternal, {
        userId: result.userId as Id<"users">,
        ...(result.plan !== undefined && { plan: result.plan }),
        subscriptionId: result.subscriptionId,
        customerId: result.customerId,
        status: result.status,
        currentPeriodEnd: result.currentPeriodEnd,
        provider: args.provider,
      });

      console.log(
        `[Payments] Webhook handled: provider=${args.provider}, user=${result.userId}, plan=${result.plan ?? "unchanged"}, status=${result.status}`
      );

      return true;
    } catch (error: any) {
      console.error("[Payments] processWebhook error:", error);
      return false;
    }
  },
});
