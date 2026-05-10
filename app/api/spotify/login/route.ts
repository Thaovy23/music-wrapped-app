import { NextResponse } from "next/server";
import { buildSpotifyAuthUrl } from "@/lib/spotify";

export async function GET() {
  try {
    const authUrl = buildSpotifyAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
