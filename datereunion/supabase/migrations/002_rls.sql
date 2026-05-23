-- DateRéunion Database Schema
-- Migration 002: Row Level Security Policies

-- ─────────────────────────────────────────────────────────────────────────────
-- Enable RLS on all tables
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles                  enable row level security;
alter table public.profile_photos            enable row level security;
alter table public.swipes                    enable row level security;
alter table public.matches                   enable row level security;
alter table public.conversations             enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                  enable row level security;
alter table public.events                    enable row level security;
alter table public.event_participants        enable row level security;
alter table public.notifications             enable row level security;

-- Helper: get current user's profile id
create or replace function public.my_profile_id()
returns uuid language sql stable as $$
  select id from public.profiles where user_id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────────────

-- Anyone authenticated can view active profiles
create policy "profiles: read active"
  on public.profiles for select
  to authenticated
  using (is_active = true);

-- Users can only edit their own profile
create policy "profiles: own write"
  on public.profiles for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILE PHOTOS
-- ─────────────────────────────────────────────────────────────────────────────

create policy "photos: read all"
  on public.profile_photos for select
  to authenticated
  using (true);

create policy "photos: own write"
  on public.profile_photos for all
  to authenticated
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SWIPES
-- ─────────────────────────────────────────────────────────────────────────────

-- Users can only see their own swipes
create policy "swipes: own read"
  on public.swipes for select
  to authenticated
  using (swiper_id = public.my_profile_id());

create policy "swipes: own insert"
  on public.swipes for insert
  to authenticated
  with check (swiper_id = public.my_profile_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- MATCHES
-- ─────────────────────────────────────────────────────────────────────────────

create policy "matches: read own"
  on public.matches for select
  to authenticated
  using (
    user1_id = public.my_profile_id() or
    user2_id = public.my_profile_id()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- CONVERSATIONS
-- ─────────────────────────────────────────────────────────────────────────────

create policy "conversations: participant read"
  on public.conversations for select
  to authenticated
  using (
    id in (
      select conversation_id from public.conversation_participants
      where user_id = public.my_profile_id()
    )
  );

create policy "conversations: create"
  on public.conversations for insert
  to authenticated
  with check (created_by = public.my_profile_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- CONVERSATION PARTICIPANTS
-- ─────────────────────────────────────────────────────────────────────────────

create policy "conv_participants: read if participant"
  on public.conversation_participants for select
  to authenticated
  using (
    conversation_id in (
      select conversation_id from public.conversation_participants
      where user_id = public.my_profile_id()
    )
  );

create policy "conv_participants: insert own"
  on public.conversation_participants for insert
  to authenticated
  with check (user_id = public.my_profile_id());

create policy "conv_participants: update own"
  on public.conversation_participants for update
  to authenticated
  using (user_id = public.my_profile_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────

-- Only participants can read messages
create policy "messages: participant read"
  on public.messages for select
  to authenticated
  using (
    conversation_id in (
      select conversation_id from public.conversation_participants
      where user_id = public.my_profile_id()
    )
  );

-- Only participants can send messages
create policy "messages: participant insert"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = public.my_profile_id() and
    conversation_id in (
      select conversation_id from public.conversation_participants
      where user_id = public.my_profile_id()
    )
  );

-- Only sender can edit/delete their messages
create policy "messages: own update"
  on public.messages for update
  to authenticated
  using (sender_id = public.my_profile_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────────────────────────────────────

-- Public events visible to all, private only to participants
create policy "events: read public"
  on public.events for select
  to authenticated
  using (
    is_public = true or
    creator_id = public.my_profile_id() or
    id in (
      select event_id from public.event_participants
      where user_id = public.my_profile_id()
    )
  );

create policy "events: creator write"
  on public.events for all
  to authenticated
  using (creator_id = public.my_profile_id())
  with check (creator_id = public.my_profile_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT PARTICIPANTS
-- ─────────────────────────────────────────────────────────────────────────────

create policy "event_participants: read"
  on public.event_participants for select
  to authenticated
  using (
    event_id in (select id from public.events where is_public = true) or
    user_id = public.my_profile_id()
  );

create policy "event_participants: join"
  on public.event_participants for insert
  to authenticated
  with check (user_id = public.my_profile_id());

create policy "event_participants: update own"
  on public.event_participants for update
  to authenticated
  using (user_id = public.my_profile_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────

create policy "notifications: own"
  on public.notifications for all
  to authenticated
  using (user_id = public.my_profile_id())
  with check (user_id = public.my_profile_id());
