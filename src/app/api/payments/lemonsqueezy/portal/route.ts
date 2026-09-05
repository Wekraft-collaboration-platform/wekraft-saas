import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  // Require authenticated Clerk user
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

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      console.error("[Lemon Squeezy Portal] Missing LEMONSQUEEZY_API_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Verify ownership via Convex
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (!convexUrl || !backendSecret) {
      console.error("[Lemon Squeezy Portal] Missing CONVEX_URL or BACKEND_SECRET");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const convex = new ConvexHttpClient(convexUrl);

    // Verify that this customerId belongs to the authenticated Clerk user
    // @ts-ignore — ConvexHttpClient types don't perfectly match generated api types
    const isOwner = await convex.query(api.lemonsqueezy.verifyCustomerOwner, {
      backendSecret,
      customerId: customerId.toString(),
      clerkUserId: userId,
    });

    if (!isOwner) {
      console.warn(
        `[Lemon Squeezy Portal] Ownership check failed: userId=${userId} tried to access customerId=${customerId}`,
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Retrieve Customer Portal URL from Lemon Squeezy API
    const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customerId}`, {
      method: "GET",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.detail || "Failed to fetch customer portal";
      console.error("[Lemon Squeezy Customer API Error]", data);
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const portalUrl = data.data?.attributes?.urls?.customer_portal;
    if (!portalUrl) {
      // If direct customer portal URL isn't returned, fallback to the store URL billing page
      const fallbackUrl = `https://my-store.lemonsqueezy.com/billing`;
      console.warn("[Lemon Squeezy Portal] No customer_portal URL returned, using store fallback.");
      return NextResponse.json({ url: fallbackUrl });
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error("[Lemon Squeezy Portal Error]", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
