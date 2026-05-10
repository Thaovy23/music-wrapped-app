import { supabaseAdmin } from "./supabaseAdmin";
import type {
  SpotifyProfile,
  SpotifyRecentlyPlayedItem,
  SpotifyToken,
} from "./types";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export function buildSpotifyAuthUrl(): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Missing Spotify env vars: SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI");
  }

  const scopes = [
    "user-read-recently-played",
    "user-top-read",
    "user-read-private",
    "user-read-email",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token exchange failed: ${err}`);
  }

  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token refresh failed: ${err}`);
  }

  return res.json();
}

export async function getValidAccessToken(userId: string): Promise<string> {
  const { data: tokenRow, error } = await supabaseAdmin
    .from("spotify_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !tokenRow) {
    throw new Error("No Spotify token found for user");
  }

  const token = tokenRow as SpotifyToken;
  const expiresAt = new Date(token.expires_at).getTime();
  const now = Date.now();

  // Refresh if token expires within 5 minutes
  if (expiresAt - now < 5 * 60 * 1000) {
    const refreshed = await refreshAccessToken(token.refresh_token);
    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

    await supabaseAdmin
      .from("spotify_tokens")
      .update({
        access_token: refreshed.access_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return refreshed.access_token;
  }

  return token.access_token;
}

export async function fetchSpotifyProfile(accessToken: string): Promise<SpotifyProfile> {
  const res = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Spotify profile: ${res.status}`);
  }

  return res.json();
}

export async function fetchRecentlyPlayed(
  accessToken: string,
  limit = 50
): Promise<SpotifyRecentlyPlayedItem[]> {
  const res = await fetch(
    `${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch recently played: ${res.status}`);
  }

  const data = await res.json();
  return data.items as SpotifyRecentlyPlayedItem[];
}
