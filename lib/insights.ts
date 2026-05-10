import { supabaseAdmin } from "./supabaseAdmin";
import type {
  ListenerPersona,
  ListeningByHour,
  MusicProfile,
  TopArtist,
  TopTrack,
  UserInsight,
} from "./types";

function determinePersona({
  peakHour,
  repeatScore,
  uniqueTracks,
  totalPlays,
  topArtistShare,
  totalListeningDays,
}: {
  peakHour: number;
  repeatScore: number;
  uniqueTracks: number;
  totalPlays: number;
  topArtistShare: number;
  totalListeningDays: number;
}): ListenerPersona {
  if (peakHour >= 22 || peakHour <= 4) return "Night Owl Listener";
  if (repeatScore >= 2.0) return "Loop Addict";
  if (totalPlays > 0 && uniqueTracks / totalPlays >= 0.8) return "Genre Explorer";
  if (topArtistShare >= 0.3) return "Loyal Fan";
  if (totalListeningDays >= 7) return "Consistent Listener";
  return "Casual Listener";
}

function buildSummary({
  totalPlays,
  topArtist,
  topTrack,
  peakHour,
  persona,
}: {
  totalPlays: number;
  topArtist: string;
  topTrack: string;
  peakHour: number;
  persona: string;
}): string {
  return (
    `Your music profile shows that you listened to ${totalPlays} tracks in this period. ` +
    `Your top artist was ${topArtist}, and your most played track was ${topTrack}. ` +
    `Your peak listening hour was around ${peakHour}:00. ` +
    `Based on your listening pattern, your persona is ${persona}.`
  );
}

export async function generateInsights(userId: string): Promise<UserInsight> {
  // Query all analytics views in parallel
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
        .eq("user_id", userId),
      supabaseAdmin
        .from("vw_user_listening_by_day")
        .select("*")
        .eq("user_id", userId),
    ]);

  const profile = profileRes.data as MusicProfile | null;
  const topTracks = (topTracksRes.data ?? []) as TopTrack[];
  const topArtists = (topArtistsRes.data ?? []) as TopArtist[];
  const byHour = (byHourRes.data ?? []) as ListeningByHour[];
  const byDay = byDayRes.data ?? [];

  if (!profile) {
    throw new Error("No listening data found. Please sync your Spotify data first.");
  }

  const totalPlays = Number(profile.total_plays) || 0;
  const uniqueTracks = Number(profile.unique_tracks) || 0;
  const repeatScore = Number(profile.repeat_score) || 0;

  // Peak listening hour
  const peakHourRow = byHour.reduce(
    (max, h) => (Number(h.play_count) > Number(max.play_count) ? h : max),
    byHour[0] ?? { played_hour: 12, play_count: 0 }
  );
  const peakHour = Number(peakHourRow?.played_hour ?? 12);

  const topTrack = topTracks[0]?.track_name ?? "Unknown";
  const topArtist = topArtists[0]?.artist_name ?? "Unknown";

  // Top artist share of total plays
  const topArtistPlays = Number(topArtists[0]?.play_count ?? 0);
  const topArtistShare = totalPlays > 0 ? topArtistPlays / totalPlays : 0;

  const totalListeningDays = byDay.length;

  const persona = determinePersona({
    peakHour,
    repeatScore,
    uniqueTracks,
    totalPlays,
    topArtistShare,
    totalListeningDays,
  });

  const summaryText = buildSummary({ totalPlays, topArtist, topTrack, peakHour, persona });

  // Date range from listening events
  const datesRes = await supabaseAdmin
    .from("listening_events")
    .select("played_at")
    .eq("user_id", userId)
    .order("played_at", { ascending: true });

  const events = datesRes.data ?? [];
  const periodStart = events[0]?.played_at?.split("T")[0] ?? new Date().toISOString().split("T")[0];
  const periodEnd =
    events[events.length - 1]?.played_at?.split("T")[0] ?? new Date().toISOString().split("T")[0];

  const insightRow = {
    user_id: userId,
    period_start: periodStart,
    period_end: periodEnd,
    total_plays: totalPlays,
    unique_tracks: uniqueTracks,
    top_track: topTrack,
    top_artist: topArtist,
    peak_hour: peakHour,
    repeat_score: repeatScore,
    persona,
    summary_text: summaryText,
  };

  const { data: saved, error } = await supabaseAdmin
    .from("user_insights")
    .insert(insightRow)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save insight: ${error.message}`);
  }

  return saved as UserInsight;
}

export async function getLatestInsight(userId: string): Promise<UserInsight | null> {
  const { data, error } = await supabaseAdmin
    .from("user_insights")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as UserInsight;
}
