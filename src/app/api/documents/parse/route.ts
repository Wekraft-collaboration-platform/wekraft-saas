import { type NextRequest, NextResponse } from "next/server";
import { ratelimit } from "@/lib/rate-limit";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://127.0.0.1:8080";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // 1. Extract FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("user_id") as string | null) || "";
    const projectId = (formData.get("project_id") as string | null) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required for scoped document processing." },
        { status: 400 },
      );
    }

    // 2. Client-side Size Limit Check (10MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
        },
        { status: 413 },
      );
    }

    // 3. Rate limit by user or IP
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "anonymous";
    const identifier = `doc_parse:${userId || ip}`;

    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return NextResponse.json(
        { error: "Too many document upload requests. Please wait a moment." },
        { status: 429 },
      );
    }

    // 4. Forward multipart/form-data to Python Agent
    const baseUrl = AGENT_URL.replace(/\/+$/, "");
    const targetUrl = `${baseUrl}/documents/parse`;

    const backendFormData = new FormData();
    backendFormData.append("file", file, file.name);
    backendFormData.append("user_id", userId);
    if (projectId) {
      backendFormData.append("project_id", projectId);
    }

    const backendResponse = await fetch(targetUrl, {
      method: "POST",
      body: backendFormData,
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Document parsing failed." },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[/api/documents/parse] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error while parsing document." },
      { status: 500 },
    );
  }
}
