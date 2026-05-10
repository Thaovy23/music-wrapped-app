# Music Wrapped Data Pipeline

A full-stack Spotify analytics web app built as a **Data Engineering / Data Science portfolio project**.

Connect your Spotify account, sync your listening history, and get a Spotify Wrapped–style story powered by a real data pipeline.

---

## Architecture

```
User
 ↓
Next.js Frontend (Landing / Dashboard / Wrapped)
 ↓ Spotify OAuth Authorization Code Flow
Spotify Web API (/v1/me, /v1/me/player/recently-played)
 ↓
Next.js API Routes (Ingestion Layer)
 ↓
Supabase Raw Layer
  └── raw_spotify_recently_played
 ↓ ETL (lib/etl.ts)
Core Tables
  ├── albums
  ├── tracks
  ├── artists
  ├── track_artists
  └── listening_events (fact table)
 ↓ SQL Analytics Views
  ├── vw_user_top_tracks
  ├── vw_user_top_artists
  ├── vw_user_listening_by_hour
  ├── vw_user_listening_by_day
  └── vw_user_music_profile
 ↓ Insight Engine (lib/insights.ts)
  └── user_insights (persona + summary)
 ↓
Dashboard + Wrapped Story Cards
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Database | Supabase (Postgres) |
| Auth / OAuth | Spotify Web API — Authorization Code Flow |
| Supabase client | @supabase/supabase-js |

---

## Data Pipeline Explanation

1. **OAuth**: User connects Spotify. The app exchanges the authorization code for access + refresh tokens stored in `spotify_tokens`.
2. **Ingestion**: The `/api/spotify/sync` route fetches the last 50 recently played tracks via the Spotify API.
3. **Raw layer**: Each item is written to `raw_spotify_recently_played` as a JSONB payload (data lake pattern).
4. **ETL**: `lib/etl.ts` normalizes each raw item into `albums`, `tracks`, `artists`, `track_artists`, and `listening_events`.
5. **Deduplication**: All tables use `unique(user_id, spotify_track_id, played_at)` constraints with upsert / ignoreDuplicates so repeated syncs are idempotent.
6. **Analytics views**: SQL views aggregate listening events into top tracks, top artists, listening-by-hour, listening-by-day, and a music profile.
7. **Insight engine**: `lib/insights.ts` queries the views, applies rule-based logic to assign a listener persona, generates a summary, and saves the result to `user_insights`.

---

## Database Schema

### Core tables

| Table | Purpose |
|---|---|
| `app_users` | App-level user identity (Spotify user_id mapped to internal UUID) |
| `spotify_tokens` | OAuth access + refresh tokens per user |
| `raw_spotify_recently_played` | Raw JSONB landing zone (one row per play event) |
| `albums` | Normalized album dimension |
| `tracks` | Normalized track dimension |
| `artists` | Normalized artist dimension |
| `track_artists` | Many-to-many bridge between tracks and artists |
| `listening_events` | Fact table — one row per (user, track, played_at) |
| `user_insights` | Generated persona + summary per user |

### Analytics views

| View | Purpose |
|---|---|
| `vw_user_top_tracks` | Play count per track per user |
| `vw_user_top_artists` | Play count per artist per user |
| `vw_user_listening_by_hour` | Hour-of-day distribution |
| `vw_user_listening_by_day` | Day-level trend |
| `vw_user_music_profile` | Total plays, unique tracks, repeat score |

---

## Listener Personas

| Persona | Rule |
|---|---|
| Night Owl Listener | Peak listening hour is 22:00–04:00 |
| Loop Addict | Repeat score ≥ 2.0 (plays / unique tracks) |
| Genre Explorer | Unique tracks / total plays ≥ 0.8 |
| Loyal Fan | Top artist accounts for ≥ 30% of plays |
| Consistent Listener | Listening spread across ≥ 7 days |
| Casual Listener | Everything else |

---

## Spotify OAuth Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Add `http://localhost:3000/api/spotify/callback` as a Redirect URI
4. Copy **Client ID** and **Client Secret** into `.env.local`

Required scopes: `user-read-recently-played user-top-read user-read-private user-read-email`

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:
   - `sql/001_create_tables.sql`
   - `sql/002_create_views.sql`
   - (Optional) `sql/003_rls_policies.sql`
3. Copy your **Project URL**, **Anon Key**, and **Service Role Key** from Settings → API

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-side only
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=            # server-side only
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Never commit `.env.local`** — it is listed in `.gitignore` by default.

---

## How to Run Locally

```bash
# 1. Clone or open the project
cd music-wrapped-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Fill in your Supabase and Spotify credentials

# 4. Run the SQL migrations in Supabase SQL Editor
# (copy-paste sql/001_create_tables.sql then sql/002_create_views.sql)

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

---

## Screenshots

| Page | Description |
|---|---|
| Landing | Hero + pipeline explanation + Connect Spotify CTA |
| Dashboard | Stat cards, top tracks/artists tables, listening charts |
| Wrapped | Story cards: plays → artist → track → hour → persona → summary |

_(Add screenshots here after running locally)_

---

## Future Improvements

- Scheduled sync with GitHub Actions or Vercel Cron
- Supabase RLS policies for multi-user production use
- Shareable Wrapped card image export (html2canvas)
- LLM-generated personalized summaries
- Monthly/weekly filter for analytics
- Music twin similarity matching
- Clustering-based persona detection
- Data freshness indicator on dashboard
- Sync job monitoring table
