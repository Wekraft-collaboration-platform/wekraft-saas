"use node";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Razorpay from "razorpay";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    order?: {
      entity: {
        notes?: {
          userId: string;
          plan: string;
        };
      };
    };
    payment?: {
      entity: {
        notes?: {
          userId: string;
          plan: string;
        };
      };
    };
  };
}

export const processWebhook = internalAction({
  args: {
    signature: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[Razorpay Webhook] Missing secret");
      return false;
    }

    try {
      const isValid = Razorpay.validateWebhookSignature(args.payload, args.signature, secret);

      if (!isValid) {
        console.error("[Razorpay Webhook] Invalid signature");
        return false;
      }

      const body: RazorpayWebhookPayload = JSON.parse(args.payload);
      console.log(`[Razorpay Webhook] Received event: ${body.event}`);

      if (body.event === "order.paid" || body.event === "payment.captured") {
        // payment.captured might have order details in payload
        const order = body.payload.order?.entity || body.payload.payment?.entity;
        const notes = order?.notes;
        
        if (notes && notes.userId && notes.plan) {
          await ctx.runMutation(internal.user.updatePlanInternal, {
            userId: notes.userId as Id<"users">,
            plan: notes.plan,
          });
          console.log(`[Razorpay Webhook] Successfully upgraded user ${notes.userId} to ${notes.plan}`);
        } else {
          console.warn("[Razorpay Webhook] No user or plan in notes", notes);
        }
      }

      return true;
    } catch (error) {
      console.error("[Razorpay Webhook] Error processing webhook:", error);
      return false;
    }
  }
});
