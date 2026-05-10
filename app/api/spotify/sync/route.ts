import { NextRequest, NextResponse } from "next/server";
import { fetchRecentlyPlayed, getValidAccessToken } from "@/lib/spotify";
import { ingestRecentlyPlayed } from "@/lib/etl";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body as { userId?: string };

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Get a valid (auto-refreshed if needed) access token
    const accessToken = await getValidAccessToken(userId);

    // Fetch up to 50 recently played tracks from Spotify
    const items = await fetchRecentlyPlayed(accessToken, 50);

    if (!items || items.length === 0) {
      return NextResponse.json({
        success: true,
        insertedEvents: 0,
        skippedDuplicates: 0,
        message: "No recently played tracks found.",
      });
    }

    // ETL into Supabase
    const { insertedEvents, skippedDuplicates } = await ingestRecentlyPlayed(
      userId,
      items
    );

    return NextResponse.json({
      success: true,
      insertedEvents,
      skippedDuplicates,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
