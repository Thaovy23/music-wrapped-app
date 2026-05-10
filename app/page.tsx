import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <span className="text-lg font-bold">Music Wrapped</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white text-sm transition-colors"
        >
          GitHub →
        </a>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-10">
        <div className="space-y-6 max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-green-950 border border-green-800 text-green-400 text-xs font-semibold tracking-widest uppercase">
            Data Engineering Portfolio
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
            Turn your Spotify history
            <br />
            <span className="text-green-400">into a personal data story</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Connect Spotify. Sync your listening data. Explore analytics.
            Discover your listener persona. Get your Wrapped.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/api/spotify/login"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-full text-base transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Connect Spotify
            </Link>
          </div>
        </div>

        {/* Pipeline steps */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            {
              step: "01",
              title: "Sync",
              desc: "Connect Spotify and pull your recently played tracks into Supabase via the Web API.",
              emoji: "🔄",
            },
            {
              step: "02",
              title: "Analyze",
              desc: "Data flows through raw tables, normalized schemas, and SQL analytics views.",
              emoji: "📊",
            },
            {
              step: "03",
              title: "Wrapped",
              desc: "Get your listener persona and a Spotify Wrapped-style story based on real data.",
              emoji: "🎁",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-left space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs text-zinc-600 font-mono font-bold">{item.step}</span>
              </div>
              <h3 className="text-white font-bold text-lg">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Architecture */}
        <div className="w-full max-w-3xl rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-left space-y-4">
          <h2 className="text-white font-bold text-xl">Data Pipeline Architecture</h2>
          <pre className="text-green-400 text-sm font-mono leading-relaxed overflow-x-auto">
{`Spotify API
  ↓ OAuth Authorization Code Flow
Next.js API Routes
  ↓ Ingestion
Supabase Raw Layer (raw_spotify_recently_played)
  ↓ ETL
Core Tables (tracks · artists · albums · listening_events)
  ↓ SQL Analytics Views
vw_user_top_tracks · vw_user_top_artists · vw_user_music_profile
  ↓ Insight Engine
Listener Persona + Summary → user_insights
  ↓
Dashboard + Wrapped Cards`}
          </pre>
        </div>

        {/* Tech stack badges */}
        <div className="flex flex-wrap justify-center gap-2 pb-8">
          {["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Recharts", "Spotify Web API"].map(
            (tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-800 px-6 py-4 text-center text-zinc-600 text-xs">
        Music Wrapped Data Pipeline · Built for Data Engineering Portfolio
      </footer>
    </div>
  );
}
