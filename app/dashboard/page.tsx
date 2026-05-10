"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { TopTracksTable } from "@/components/dashboard/TopTracksTable";
import { TopArtistsTable } from "@/components/dashboard/TopArtistsTable";
import { ListeningByHourChart } from "@/components/dashboard/ListeningByHourChart";
import { ListeningByDayChart } from "@/components/dashboard/ListeningByDayChart";
import { Button } from "@/components/ui/button";
import type { DashboardData, SyncResult, UserInsight } from "@/lib/types";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [insight, setInsight] = useState<UserInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?userId=${userId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load dashboard");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/spotify/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sync failed");
      setSyncResult(json);
      await loadDashboard();
    } catch (err) {
      setSyncResult({
        success: false,
        insertedEvents: 0,
        skippedDuplicates: 0,
        error: err instanceof Error ? err.message : "Sync error",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/insights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to generate insights");
      setInsight(json.insight);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Insight generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">No user session found.</p>
          <Link href="/">
            <Button variant="outline">Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold">Music Wrapped</h1>
        </div>
        <Link href={`/wrapped?userId=${userId}`}>
          <Button size="sm" variant="outline">
            View Wrapped →
          </Button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={handleSync} disabled={syncing} size="lg">
            {syncing ? "Syncing…" : "Sync Spotify Data"}
          </Button>
          <Button
            onClick={handleGenerateInsights}
            disabled={generating}
            variant="secondary"
            size="lg"
          >
            {generating ? "Generating…" : "Generate Insights"}
          </Button>
        </div>

        {/* Sync feedback */}
        {syncResult && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              syncResult.success
                ? "bg-green-950 border border-green-800 text-green-300"
                : "bg-red-950 border border-red-800 text-red-300"
            }`}
          >
            {syncResult.success
              ? `✓ Synced ${syncResult.insertedEvents} new events · ${syncResult.skippedDuplicates} duplicates skipped`
              : `✗ ${syncResult.error}`}
          </div>
        )}

        {/* Insight panel */}
        {insight && (
          <div className="rounded-xl bg-zinc-900 border border-green-800 p-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold text-lg">{insight.persona}</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{insight.summary_text}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg px-4 py-3 text-sm bg-red-950 border border-red-800 text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Plays"
              value={data?.profile.totalPlays ?? 0}
            />
            <StatCard
              label="Unique Tracks"
              value={data?.profile.uniqueTracks ?? 0}
            />
            <StatCard
              label="Repeat Score"
              value={data?.profile.repeatScore?.toFixed(2) ?? "0.00"}
              subLabel="avg plays per track"
            />
          </div>
        )}

        {/* Tables */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 h-56 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopTracksTable tracks={data?.topTracks ?? []} />
            <TopArtistsTable artists={data?.topArtists ?? []} />
          </div>
        )}

        {/* Charts */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ListeningByHourChart data={data?.listeningByHour ?? []} />
            <ListeningByDayChart data={data?.listeningByDay ?? []} />
          </div>
        )}
      </main>
    </div>
  );
}
