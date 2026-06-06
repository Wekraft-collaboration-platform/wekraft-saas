import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifySignature } from "@/lib/presign-utils";

/**
 * GET /api/teamspace/download
 * Serves files from AWS S3.
 * Supports:
 * 1. Clerk session authentication (for logged-in users in the browser).
 * 2. HMAC-signed transient token authentication (for unauthenticated external services like Microsoft Office Web Viewer).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let fileUrl = url.searchParams.get("url");
    const key = url.searchParams.get("key");
    let filename = url.searchParams.get("filename");
    const download = url.searchParams.get("download") !== "false";

    // ── Authentication Check ─────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) {
      // Unauthenticated request: check for valid HMAC preview token and timestamp
      const token = url.searchParams.get("token");
      const expiresStr = url.searchParams.get("expires");

      if (!token || !expiresStr) {
        return NextResponse.json(
          { error: "Unauthorized: Clerk session or valid preview token required." },
          { status: 401 }
        );
      }

      const expires = parseInt(expiresStr, 10);
      const targetKey = key || fileUrl || "";

      if (!verifySignature(targetKey, expires, token)) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or expired preview token." },
          { status: 401 }
        );
      }
    }

    // ── File Retrieval ────────────────────────────────────────────────────────
    if (key && key !== "null" && key !== "undefined") {
      const bucket = "wekraft-saas-upload-s3";
      fileUrl = `https://${bucket}.s3.ap-south-1.amazonaws.com/${key}`;
    }

    if (!fileUrl || fileUrl === "null" || fileUrl === "undefined") {
      return NextResponse.json(
        { error: "Missing or invalid url/key parameter" },
        { status: 400 },
      );
    }

    if (!filename) {
      // Extract filename from S3 key or URL if not explicitly provided
      const urlParts = fileUrl.split("/");
      filename = urlParts[urlParts.length - 1] || "downloaded-file";
    }

    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch file from S3: ${response.statusText}`);
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // Stream the body directly to the client
    const body = response.body;

    const headers: Record<string, string> = {
      "Content-Type": contentType,
    };

    if (download) {
      headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    } else {
      headers["Content-Disposition"] = "inline";
    }

    return new NextResponse(body, { headers });
  } catch (error) {
    console.error("Download proxy error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 },
    );
  }
}
