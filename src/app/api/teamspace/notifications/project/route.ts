// This endpoint has been removed.
// Project membership notifications are now handled server-side via Convex mutations.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ removed: true }, { status: 410 });
}
