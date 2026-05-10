import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  fetchSpotifyProfile,
} from "@/lib/spotify";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=missing_code`
    );
  }

  try {
    // Exchange auth code for tokens
    const tokens = await exchangeCodeForTokens(code);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Fetch Spotify user profile
    const profile = await fetchSpotifyProfile(tokens.access_token);

    // Upsert app user
    const { data: user, error: userError } = await supabaseAdmin
      .from("app_users")
      .upsert(
        {
          spotify_user_id: profile.id,
          display_name: profile.display_name ?? "Spotify User",
          email: profile.email ?? null,
          image_url: profile.images?.[0]?.url ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "spotify_user_id" }
      )
      .select()
      .single();

    if (userError || !user) {
      throw new Error(`Failed to upsert user: ${userError?.message}`);
    }

    // Upsert tokens (one row per user)
    const { error: tokenError } = await supabaseAdmin
      .from("spotify_tokens")
      .upsert(
        {
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (tokenError) {
      throw new Error(`Failed to store tokens: ${tokenError.message}`);
    }

    // Redirect to dashboard with userId
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?userId=${user.id}`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth error";
    console.error("[callback]", message);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(message)}`
    );
  }
}
