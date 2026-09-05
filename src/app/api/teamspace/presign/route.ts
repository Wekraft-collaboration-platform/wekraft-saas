import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { generateSignature } from "@/lib/presign-utils";

/**
 * GET /api/teamspace/presign
 * Generates an HMAC-signed proxy URL for file preview/downloads.
 * This route is Clerk-protected to ensure only logged-in users can request signatures.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const url = searchParams.get("url");

    if (!key && !url) {
      return NextResponse.json(
        { error: "Missing key or url parameter" },
        { status: 400 }
      );
    }

    // Sign the identifier (key is preferred, fallback to url)
    const targetKey = key || url || "";

    // Set expiration to 60 seconds from now
    const expires = Date.now() + 60 * 1000;

    // Generate SHA-256 HMAC signature
    const token = generateSignature(targetKey, expires);

    // Build the token-secured proxy download URL
    const proxyParams = new URLSearchParams();
    if (key) {
      proxyParams.set("key", key);
    }
    if (url) {
      proxyParams.set("url", url);
    }
    proxyParams.set("token", token);
    proxyParams.set("expires", expires.toString());
    proxyParams.set("download", "false"); // Used for embedded viewer preview

    const signedUrl = `/api/teamspace/download?${proxyParams.toString()}`;

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("[Presign Route Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
