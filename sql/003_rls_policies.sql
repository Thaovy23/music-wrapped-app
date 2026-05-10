-- ============================================================
-- Music Wrapped Data Pipeline — RLS Policies (optional)
-- Enable Row Level Security after MVP when using Supabase Auth
-- ============================================================

-- Enable RLS on core tables
alter table app_users enable row level security;
alter table spotify_tokens enable row level security;
alter table raw_spotify_recently_played enable row level security;
alter table listening_events enable row level security;
alter table user_insights enable row level security;

-- For MVP with service role key (server-side only), RLS won't block API routes.
-- Add user-facing policies here when you integrate Supabase Auth for client-side access.

-- Example: users can only read their own data
-- create policy "Users can view own data"
--   on listening_events for select
--   using (auth.uid()::text = user_id::text);
