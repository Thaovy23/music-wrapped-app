import { NextRequest, NextResponse } from "next/server";
import { generateInsights } from "@/lib/insights";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body as { userId?: string };

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const insight = await generateInsights(userId);

    return NextResponse.json({ success: true, insight });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate insights";
    console.error("[insights/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
