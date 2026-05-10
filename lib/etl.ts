import { supabaseAdmin } from "./supabaseAdmin";
import type { SpotifyRecentlyPlayedItem } from "./types";

/**
 * ETL pipeline: transforms Spotify recently-played items and loads
 * them into the normalized Supabase tables in the correct order.
 *
 * Upsert order: raw → albums → tracks → artists → track_artists → listening_events
 *
 * Duplicate detection for listening_events uses Postgres error code 23505
 * (unique_violation) instead of relying on HTTP status codes, which are
 * unreliable when ignoreDuplicates:true silently swallows conflicts.
 */
export async function ingestRecentlyPlayed(
  userId: string,
  items: SpotifyRecentlyPlayedItem[]
): Promise<{ insertedEvents: number; skippedDuplicates: number }> {
  let insertedEvents = 0;
  let skippedDuplicates = 0;

  for (const item of items) {
    const { track, played_at } = item;
    const album = track.album;
    const artists = track.artists;

    // 1. Raw landing zone
    const { error: rawError } = await supabaseAdmin
      .from("raw_spotify_recently_played")
      .upsert(
        {
          user_id: userId,
          spotify_track_id: track.id,
          played_at,
          raw_payload: item,
        },
        { onConflict: "user_id,spotify_track_id,played_at", ignoreDuplicates: true }
      );

    if (rawError) {
      console.error("raw insert error:", rawError.message);
    }

    // 2. Albums
    const { error: albumError } = await supabaseAdmin.from("albums").upsert(
      {
        spotify_album_id: album.id,
        album_name: album.name,
        release_date: album.release_date,
        image_url: album.images?.[0]?.url ?? null,
        external_url: album.external_urls?.spotify ?? null,
      },
      { onConflict: "spotify_album_id", ignoreDuplicates: true }
    );

    if (albumError) {
      console.error("album upsert error:", albumError.message);
    }

    // 3. Tracks
    const { error: trackError } = await supabaseAdmin.from("tracks").upsert(
      {
        spotify_track_id: track.id,
        track_name: track.name,
        spotify_album_id: album.id,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        preview_url: track.preview_url ?? null,
        external_url: track.external_urls?.spotify ?? null,
      },
      { onConflict: "spotify_track_id", ignoreDuplicates: true }
    );

    if (trackError) {
      console.error("track upsert error:", trackError.message);
    }

    // 4. Artists + 5. Track–Artist bridge
    for (const artist of artists) {
      const { error: artistError } = await supabaseAdmin.from("artists").upsert(
        {
          spotify_artist_id: artist.id,
          artist_name: artist.name,
          genres: [],
          external_url: artist.external_urls?.spotify ?? null,
        },
        { onConflict: "spotify_artist_id", ignoreDuplicates: true }
      );

      if (artistError) {
        console.error("artist upsert error:", artistError.message);
      }

      const { error: taError } = await supabaseAdmin
        .from("track_artists")
        .upsert(
          { spotify_track_id: track.id, spotify_artist_id: artist.id },
          { onConflict: "spotify_track_id,spotify_artist_id", ignoreDuplicates: true }
        );

      if (taError) {
        console.error("track_artists upsert error:", taError.message);
      }
    }

    // 6. Listening events — use plain INSERT so Postgres 23505 (unique_violation)
    //    is visible as a real error code rather than being silenced by ignoreDuplicates.
    //    This gives accurate inserted / skipped counts.
    const { error: eventError } = await supabaseAdmin
      .from("listening_events")
      .insert({
        user_id: userId,
        spotify_track_id: track.id,
        played_at,
      });

    if (eventError) {
      // Postgres unique_violation — expected on repeated syncs
      if (eventError.code === "23505") {
        skippedDuplicates++;
      } else {
        console.error("listening_events insert error:", eventError.message);
      }
    } else {
      insertedEvents++;
    }
  }

  return { insertedEvents, skippedDuplicates };
}
