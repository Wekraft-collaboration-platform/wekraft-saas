import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fileUrl = url.searchParams.get("url");
    let filename = url.searchParams.get("filename");

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    if (!filename) {
      // Extract from URL if not provided
      const urlParts = fileUrl.split('/');
      filename = urlParts[urlParts.length - 1] || "downloaded-file";
    }

    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    
    // Stream the body directly to the client
    const body = response.body;

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        // The attachment directive forces the browser to download the file natively
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
}
