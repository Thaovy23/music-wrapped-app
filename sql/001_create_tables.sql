-- ============================================================
-- Music Wrapped Data Pipeline — Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- App Users
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  spotify_user_id text unique,
  display_name text,
  email text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Spotify Tokens
create table if not exists spotify_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Raw Recently Played (landing zone)
create table if not exists raw_spotify_recently_played (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  spotify_track_id text not null,
  played_at timestamptz not null,
  raw_payload jsonb not null,
  ingested_at timestamptz default now(),
  unique(user_id, spotify_track_id, played_at)
);

-- Albums
create table if not exists albums (
  spotify_album_id text primary key,
  album_name text,
  release_date text,
  image_url text,
  external_url text,
  created_at timestamptz default now()
);

-- Tracks
create table if not exists tracks (
  spotify_track_id text primary key,
  track_name text not null,
  spotify_album_id text references albums(spotify_album_id),
  duration_ms int,
  popularity int,
  preview_url text,
  external_url text,
  created_at timestamptz default now()
);

-- Artists
create table if not exists artists (
  spotify_artist_id text primary key,
  artist_name text not null,
  genres text[],
  popularity int,
  followers int,
  external_url text,
  image_url text,
  created_at timestamptz default now()
);

-- Track <-> Artist bridge
create table if not exists track_artists (
  spotify_track_id text references tracks(spotify_track_id) on delete cascade,
  spotify_artist_id text references artists(spotify_artist_id) on delete cascade,
  primary key (spotify_track_id, spotify_artist_id)
);

-- Listening Events (fact table)
create table if not exists listening_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  spotify_track_id text references tracks(spotify_track_id),
  played_at timestamptz not null,
  played_date date generated always as ((played_at at time zone 'utc')::date) stored,
  played_hour int generated always as (extract(hour from played_at at time zone 'utc')::int) stored,
  created_at timestamptz default now(),
  unique(user_id, spotify_track_id, played_at)
);

-- User Insights
create table if not exists user_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  period_start date,
  period_end date,
  total_plays int,
  unique_tracks int,
  top_track text,
  top_artist text,
  peak_hour int,
  repeat_score numeric,
  persona text,
  summary_text text,
  created_at timestamptz default now()
);
