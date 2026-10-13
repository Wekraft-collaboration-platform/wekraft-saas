import { NextRequest, NextResponse } from "next/server";
import { verifyLinearConnection } from "@/lib/mcp/linear";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key is required" }, { status: 400 });
    }

    const result = await verifyLinearConnection(apiKey);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
