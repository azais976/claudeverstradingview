-- DateRéunion Database Schema
-- Migration 001: Core Tables

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "postgis"; -- For geographic queries

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────────────

create type gender_type as enum ('homme', 'femme', 'non-binaire', 'autre');
create type date_mode_type as enum ('1v1', '2v2', '3v3', 'groupe', 'amis');
create type reunion_city as enum (
  'Saint-Denis', 'Saint-Paul', 'Saint-Pierre', 'Le Tampon',
  'Saint-Louis', 'Saint-Benoît', 'Saint-André', 'Saint-Leu',
  'Saint-Joseph', 'Sainte-Marie', 'Sainte-Suzanne', 'Saint-Philippe',
  'Cilaos', 'Salazie', 'Entre-Deux', 'La Possession',
  'Le Port', 'Trois-Bassins', 'Petite-Île', 'Saint-Rose'
);

create table public.profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  username        text not null unique,
  display_name    text not null,
  bio             text,
  gender          gender_type not null,
  birth_date      date not null,
  city            reunion_city not null default 'Saint-Denis',
  neighborhood    text,
  latitude        double precision,
  longitude       double precision,
  cultural_origin text,
  interests       text[] default '{}',
  date_modes      date_mode_type[] default '{1v1}',
  looking_for     gender_type[] default '{}',
  min_age_pref    int not null default 18 check (min_age_pref >= 18),
  max_age_pref    int not null default 45,
  max_distance_km int not null default 30,
  is_verified     boolean not null default false,
  is_premium      boolean not null default false,
  is_active       boolean not null default true,
  show_distance   boolean not null default true,
  show_age        boolean not null default true,
  show_online     boolean not null default true,
  last_seen       timestamptz not null default now(),
  -- E2EE: user's X25519 public key (base64 encoded)
  public_key      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- Age must be 18+
  constraint age_18_plus check (
    extract(year from age(birth_date)) >= 18
  )
);

-- Profile photos (up to 8)
create table public.profile_photos (
  id           uuid primary key default uuid_generate_v4(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  url          text not null,
  is_primary   boolean not null default false,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  constraint max_photos check (
    (select count(*) from public.profile_photos pp where pp.profile_id = profile_id) <= 8
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SWIPES & MATCHES
-- ─────────────────────────────────────────────────────────────────────────────

create type swipe_action as enum ('like', 'dislike', 'super-like');

create table public.swipes (
  id         uuid primary key default uuid_generate_v4(),
  swiper_id  uuid not null references public.profiles(id) on delete cascade,
  swiped_id  uuid not null references public.profiles(id) on delete cascade,
  action     swipe_action not null,
  created_at timestamptz not null default now(),
  unique (swiper_id, swiped_id)
);

create table public.matches (
  id              uuid primary key default uuid_generate_v4(),
  user1_id        uuid not null references public.profiles(id) on delete cascade,
  user2_id        uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid, -- set after conversation is created
  is_active       boolean not null default true,
  matched_at      timestamptz not null default now(),
  constraint no_self_match check (user1_id <> user2_id),
  unique (user1_id, user2_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CONVERSATIONS & MESSAGES (E2EE)
-- ─────────────────────────────────────────────────────────────────────────────

create type conversation_type as enum ('1v1', 'group');
create type message_type as enum ('text', 'image', 'event', 'system');

create table public.conversations (
  id         uuid primary key default uuid_generate_v4(),
  type       conversation_type not null default '1v1',
  name       text,            -- group chat name
  event_id   uuid,            -- linked event (if any)
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_participants (
  id                   uuid primary key default uuid_generate_v4(),
  conversation_id      uuid not null references public.conversations(id) on delete cascade,
  user_id              uuid not null references public.profiles(id) on delete cascade,
  -- For group E2EE: the session key encrypted with this user's public key
  encrypted_session_key text,
  joined_at            timestamptz not null default now(),
  last_read_at         timestamptz not null default now(),
  unique (conversation_id, user_id)
);

create table public.messages (
  id                  uuid primary key default uuid_generate_v4(),
  conversation_id     uuid not null references public.conversations(id) on delete cascade,
  sender_id           uuid not null references public.profiles(id) on delete cascade,
  -- All content is E2EE encrypted (ChaCha20-Poly1305)
  encrypted_content   text not null,     -- base64 ciphertext
  iv                  text not null,     -- base64 nonce/IV
  message_type        message_type not null default 'text',
  -- Ephemeral public key for X25519 DH (Double Ratchet step)
  ephemeral_public_key text,
  is_edited           boolean not null default false,
  is_deleted          boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENTS / DATES
-- ─────────────────────────────────────────────────────────────────────────────

create type event_type as enum (
  'restaurant', 'randonnee', 'plage', 'sport', 'culture', 'soiree', 'autre'
);
create type participant_status as enum ('pending', 'confirmed', 'declined');

create table public.events (
  id                uuid primary key default uuid_generate_v4(),
  creator_id        uuid not null references public.profiles(id) on delete cascade,
  title             text not null,
  description       text not null,
  event_type        event_type not null,
  date_mode         date_mode_type not null,
  date_time         timestamptz not null,
  location_name     text not null,
  location_address  text not null,
  city              reunion_city not null,
  latitude          double precision not null,
  longitude         double precision not null,
  max_participants  int not null default 6,
  min_age           int not null default 18,
  max_age           int not null default 99,
  gender_filter     gender_type[],   -- null = all genders
  is_public         boolean not null default true,
  is_verified_only  boolean not null default false,
  conversation_id   uuid references public.conversations(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.event_participants (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  status     participant_status not null default 'pending',
  joined_at  timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────

create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null, -- 'match', 'message', 'event', 'like', 'super-like', 'system'
  title      text not null,
  body       text not null,
  data       jsonb not null default '{}',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

create index idx_profiles_user_id       on public.profiles(user_id);
create index idx_profiles_city          on public.profiles(city);
create index idx_profiles_is_active     on public.profiles(is_active);
create index idx_swipes_swiper          on public.swipes(swiper_id);
create index idx_swipes_swiped          on public.swipes(swiped_id);
create index idx_matches_user1          on public.matches(user1_id);
create index idx_matches_user2          on public.matches(user2_id);
create index idx_messages_conversation  on public.messages(conversation_id);
create index idx_messages_created       on public.messages(created_at desc);
create index idx_events_date_time       on public.events(date_time);
create index idx_events_city            on public.events(city);
create index idx_notifications_user     on public.notifications(user_id, is_read);
create index idx_conv_participants_conv on public.conversation_participants(conversation_id);
create index idx_conv_participants_user on public.conversation_participants(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at  before update on public.profiles  for each row execute function public.handle_updated_at();
create trigger convs_updated_at     before update on public.conversations for each row execute function public.handle_updated_at();
create trigger messages_updated_at  before update on public.messages   for each row execute function public.handle_updated_at();
create trigger events_updated_at    before update on public.events     for each row execute function public.handle_updated_at();

-- Auto-update conversations.updated_at when a message is inserted
create or replace function public.update_conversation_on_message()
returns trigger language plpgsql as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;
create trigger message_updates_conversation after insert on public.messages for each row execute function public.update_conversation_on_message();
