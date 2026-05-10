import { NextRequest, NextResponse } from "next/server";
import { getLatestInsight } from "@/lib/insights";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const insight = await getLatestInsight(userId);

    if (!insight) {
      return NextResponse.json({ error: "No insights found" }, { status: 404 });
    }

    return NextResponse.json({ insight });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load insight";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
