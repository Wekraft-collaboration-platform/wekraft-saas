"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
// @ts-ignore
import Razorpay from "razorpay";

// We can extend this with "stripe" or others in the future
const providerValidator = v.union(v.literal("razorpay"), v.literal("stripe"));
const planValidator = v.union(v.literal("plus"), v.literal("pro"));

export const createPaymentOrder = action({
  args: { 
    plan: planValidator, 
    userId: v.id("users"),
    provider: providerValidator,
  },
  handler: async (ctx, args) => {
    // 1. Fetch exchange rate or plan details
    let rate = 96; // fallback
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates && data.rates.INR) {
          rate = data.rates.INR;
          console.log(`[Payments] Fetched rate: 1 USD = ${rate} INR`);
        }
      }
    } catch (e) {
      console.error("[Payments] Failed to fetch exchange rate, using fallback", e);
    }

    const amountInUSD = args.plan === "plus" ? 6 : args.plan === "pro" ? 15 : 0;
    
    if (amountInUSD === 0) {
      throw new Error("Invalid plan selected for payment.");
    }

    const amountInINR = Math.round(amountInUSD * rate);

    if (args.provider === "razorpay") {
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      if (!key_id || !key_secret) {
        console.error("[Razorpay] Keys are missing from environment variables.");
        throw new Error("Payment gateway is not configured properly. Please contact support.");
      }

      const instance = new Razorpay({
        key_id,
        key_secret,
      });

      try {
        const order = await instance.orders.create({
          amount: amountInINR * 100, // amount in paise (must be integer)
          currency: "INR",
          receipt: `receipt_order_${Date.now()}`,
          notes: {
            userId: args.userId,
            plan: args.plan,
          },
        });

        return {
          provider: "razorpay",
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          key: key_id,
        };
      } catch (error) {
        console.error("[Razorpay] Error creating order:", error);
        throw new Error("Failed to create payment order. Please try again later.");
      }
    } else if (args.provider === "stripe") {
      // Future: Implement Stripe integration here
      throw new Error("Stripe is not implemented yet.");
    }

    throw new Error("Invalid payment provider selected.");
  },
});
