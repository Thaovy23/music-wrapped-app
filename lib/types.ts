// ============================================================
// Shared TypeScript types for Music Wrapped Data Pipeline
// ============================================================

export interface AppUser {
  id: string;
  spotify_user_id: string;
  display_name: string;
  email: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface SpotifyToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface Track {
  spotify_track_id: string;
  track_name: string;
  spotify_album_id: string;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_url: string;
}

export interface Artist {
  spotify_artist_id: string;
  artist_name: string;
  genres: string[];
  popularity: number;
  followers: number;
  external_url: string;
  image_url: string;
}

export interface Album {
  spotify_album_id: string;
  album_name: string;
  release_date: string;
  image_url: string;
  external_url: string;
}

export interface ListeningEvent {
  id: string;
  user_id: string;
  spotify_track_id: string;
  played_at: string;
  played_date: string;
  played_hour: number;
}

export interface UserInsight {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  total_plays: number;
  unique_tracks: number;
  top_track: string;
  top_artist: string;
  peak_hour: number;
  repeat_score: number;
  persona: string;
  summary_text: string;
  created_at: string;
}

// Analytics view result types
export interface TopTrack {
  user_id: string;
  spotify_track_id: string;
  track_name: string;
  play_count: number;
  last_played_at: string;
}

export interface TopArtist {
  user_id: string;
  spotify_artist_id: string;
  artist_name: string;
  play_count: number;
}

export interface ListeningByHour {
  user_id: string;
  played_hour: number;
  play_count: number;
}

export interface ListeningByDay {
  user_id: string;
  played_date: string;
  play_count: number;
}

export interface MusicProfile {
  user_id: string;
  total_plays: number;
  unique_tracks: number;
  repeat_score: number;
  last_played_at: string;
}

// Spotify API response types
export interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  album: SpotifyAlbum;
  artists: SpotifyArtistSimple[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string;
  images: { url: string; width: number; height: number }[];
  external_urls: { spotify: string };
}

export interface SpotifyArtistSimple {
  id: string;
  name: string;
  external_urls: { spotify: string };
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

export type ListenerPersona =
  | "Night Owl Listener"
  | "Loop Addict"
  | "Genre Explorer"
  | "Loyal Fan"
  | "Consistent Listener"
  | "Casual Listener";

export interface DashboardData {
  profile: {
    totalPlays: number;
    uniqueTracks: number;
    repeatScore: number;
  };
  topTracks: TopTrack[];
  topArtists: TopArtist[];
  listeningByHour: ListeningByHour[];
  listeningByDay: ListeningByDay[];
}

export interface SyncResult {
  success: boolean;
  insertedEvents: number;
  skippedDuplicates: number;
  error?: string;
}
