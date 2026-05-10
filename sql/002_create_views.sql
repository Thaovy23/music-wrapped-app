-- ============================================================
-- Music Wrapped Data Pipeline — Analytics Views
-- Run this after 001_create_tables.sql
-- ============================================================

-- Top tracks per user
create or replace view vw_user_top_tracks as
select
  le.user_id,
  le.spotify_track_id,
  t.track_name,
  count(*) as play_count,
  max(le.played_at) as last_played_at
from listening_events le
join tracks t on le.spotify_track_id = t.spotify_track_id
group by le.user_id, le.spotify_track_id, t.track_name;

-- Top artists per user
create or replace view vw_user_top_artists as
select
  le.user_id,
  a.spotify_artist_id,
  a.artist_name,
  count(*) as play_count
from listening_events le
join track_artists ta on le.spotify_track_id = ta.spotify_track_id
join artists a on ta.spotify_artist_id = a.spotify_artist_id
group by le.user_id, a.spotify_artist_id, a.artist_name;

-- Listening activity by hour of day
create or replace view vw_user_listening_by_hour as
select
  user_id,
  played_hour,
  count(*) as play_count
from listening_events
group by user_id, played_hour;

-- Listening activity by calendar day
create or replace view vw_user_listening_by_day as
select
  user_id,
  played_date,
  count(*) as play_count
from listening_events
group by user_id, played_date;

-- Overall music profile
create or replace view vw_user_music_profile as
select
  user_id,
  count(*) as total_plays,
  count(distinct spotify_track_id) as unique_tracks,
  round(count(*)::numeric / nullif(count(distinct spotify_track_id), 0), 2) as repeat_score,
  max(played_at) as last_played_at
from listening_events
group by user_id;
