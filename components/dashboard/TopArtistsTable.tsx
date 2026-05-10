import type { TopArtist } from "@/lib/types";

interface TopArtistsTableProps {
  artists: TopArtist[];
}

export function TopArtistsTable({ artists }: TopArtistsTableProps) {
  if (artists.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Artists</h3>
        <p className="text-zinc-500 text-sm">No artists yet. Sync your Spotify data.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Top Artists</h3>
      <div className="space-y-3">
        {artists.map((artist, i) => (
          <div
            key={artist.spotify_artist_id}
            className="flex items-center gap-4"
          >
            <span className="text-zinc-600 font-mono text-sm w-5 text-right">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{artist.artist_name}</p>
            </div>
            <span className="text-green-400 font-semibold text-sm whitespace-nowrap">
              {artist.play_count} plays
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
