import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let fileUrl = url.searchParams.get("url");
    const key = url.searchParams.get("key");
    let filename = url.searchParams.get("filename");
    const download = url.searchParams.get("download") !== "false";

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
      // Extract from URL if not provided
      const urlParts = fileUrl.split("/");
      filename = urlParts[urlParts.length - 1] || "downloaded-file";
    }

    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
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
