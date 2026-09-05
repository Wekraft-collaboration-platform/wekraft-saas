import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("[Lemon Squeezy] Missing NEXT_PUBLIC_CONVEX_URL");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    const userObj = await convex.query(api.user.getUserByClerkToken, { clerkToken: userId });
    
    if (!userObj) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }
    const convexUserId = userObj._id;

    const { planName, planType, priceUSD, userEmail } = await req.json();

    if (!planName || !planType || priceUSD === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    
    if (!apiKey || !storeId) {
      console.error("[Lemon Squeezy] Missing LEMONSQUEEZY_API_KEY or LEMONSQUEEZY_STORE_ID");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    let targetVariantId = "";
    if (planType === "plus") {
      targetVariantId = process.env.LEMONSQUEEZY_PLUS_VARIANT_ID || "";
    } else if (planType === "pro") {
      targetVariantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID || "";
    }

    if (!targetVariantId) {
      console.error(`[Lemon Squeezy] Missing configuration for ${planType} plan`);
      return NextResponse.json(
        { error: `Server missing configuration for ${planType} plan` },
        { status: 500 },
      );
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${origin}/dashboard?success=true`;

    // Create Lemon Squeezy Checkout
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: userEmail,
              custom: {
                userId: convexUserId,
                planType,
              },
            },
            product_options: {
              redirect_url: redirectUrl,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId.toString(),
              },
            },
            variant: {
              data: {
                type: "variants",
                id: targetVariantId.toString(),
              },
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.detail || "Failed to create checkout";
      console.error("[Lemon Squeezy Checkout API Error]", data);
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const checkoutUrl = data.data?.attributes?.url;
    if (!checkoutUrl) {
      throw new Error("No checkout URL returned from Lemon Squeezy");
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[Lemon Squeezy Checkout Error]", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
