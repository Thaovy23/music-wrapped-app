import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { DashboardData } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const [profileRes, topTracksRes, topArtistsRes, byHourRes, byDayRes] =
      await Promise.all([
        supabaseAdmin
          .from("vw_user_music_profile")
          .select("*")
          .eq("user_id", userId)
          .single(),
        supabaseAdmin
          .from("vw_user_top_tracks")
          .select("*")
          .eq("user_id", userId)
          .order("play_count", { ascending: false })
          .limit(5),
        supabaseAdmin
          .from("vw_user_top_artists")
          .select("*")
          .eq("user_id", userId)
          .order("play_count", { ascending: false })
          .limit(5),
        supabaseAdmin
          .from("vw_user_listening_by_hour")
          .select("*")
          .eq("user_id", userId)
          .order("played_hour", { ascending: true }),
        supabaseAdmin
          .from("vw_user_listening_by_day")
          .select("*")
          .eq("user_id", userId)
          .order("played_date", { ascending: true }),
      ]);

    const profile = profileRes.data;

    const data: DashboardData = {
      profile: {
        totalPlays: Number(profile?.total_plays ?? 0),
        uniqueTracks: Number(profile?.unique_tracks ?? 0),
        repeatScore: Number(profile?.repeat_score ?? 0),
      },
      topTracks: topTracksRes.data ?? [],
      topArtists: topArtistsRes.data ?? [],
      listeningByHour: byHourRes.data ?? [],
      listeningByDay: byDayRes.data ?? [],
    };

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load dashboard";
    console.error("[dashboard]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
