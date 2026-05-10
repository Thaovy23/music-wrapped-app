"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WrappedStory } from "@/components/wrapped/WrappedStory";
import { Button } from "@/components/ui/button";
import type { UserInsight } from "@/lib/types";

export default function WrappedPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";

  const [insight, setInsight] = useState<UserInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch latest insight via a simple server endpoint
    async function load() {
      try {
        const res = await fetch(`/api/insights/latest?userId=${userId}`);
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error ?? "Failed to load insight");
        }
        const json = await res.json();
        setInsight(json.insight);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

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
        <Link href={`/dashboard?userId=${userId}`}>
          <Button size="sm" variant="outline">
            ← Dashboard
          </Button>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold">Your Music Wrapped</h2>
          <p className="text-zinc-400">Your personal listening story</p>
        </div>

        {loading && (
          <div className="w-full max-w-sm mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 animate-pulse" style={{ minHeight: "480px" }} />
        )}

        {error && (
          <div className="text-center space-y-4">
            <p className="text-zinc-400">{error}</p>
            <p className="text-zinc-500 text-sm">
              Go to the dashboard, sync your data, and generate insights first.
            </p>
            <Link href={`/dashboard?userId=${userId}`}>
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        )}

        {!loading && !error && !insight && (
          <div className="text-center space-y-4">
            <p className="text-zinc-400">No insights generated yet.</p>
            <p className="text-zinc-500 text-sm">
              Sync your Spotify data and click Generate Insights on the dashboard.
            </p>
            <Link href={`/dashboard?userId=${userId}`}>
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        )}

        {insight && <WrappedStory insight={insight} />}
      </main>
    </div>
  );
}
