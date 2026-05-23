-- DateRéunion Database Schema
-- Migration 003: Database Functions & Triggers

-- ─────────────────────────────────────────────────────────────────────────────
-- SWIPE & MATCH LOGIC
-- ─────────────────────────────────────────────────────────────────────────────

-- Called after a swipe; creates a match + conversation if mutual like
create or replace function public.check_and_create_match()
returns trigger language plpgsql security definer as $$
declare
  v_match_id     uuid;
  v_conv_id      uuid;
  v_other_liked  boolean;
begin
  -- Only check on likes and super-likes
  if new.action = 'dislike' then
    return new;
  end if;

  -- Did the other person already like/super-like us?
  select exists(
    select 1 from public.swipes
    where swiper_id = new.swiped_id
      and swiped_id = new.swiper_id
      and action in ('like', 'super-like')
  ) into v_other_liked;

  if v_other_liked then
    -- Create conversation first
    insert into public.conversations (type, created_by)
    values ('1v1', new.swiper_id)
    returning id into v_conv_id;

    -- Add both users as participants
    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conv_id, new.swiper_id), (v_conv_id, new.swiped_id);

    -- Create the match (user1 = lower UUID for uniqueness)
    insert into public.matches (user1_id, user2_id, conversation_id)
    values (
      least(new.swiper_id, new.swiped_id),
      greatest(new.swiper_id, new.swiped_id),
      v_conv_id
    )
    returning id into v_match_id;

    -- Create match notifications for both users
    insert into public.notifications (user_id, type, title, body, data)
    select p.id, 'match', 'Nouveau match ! 🎉',
      'Vous avez un nouveau match ! Commencez à discuter.',
      jsonb_build_object('match_id', v_match_id, 'conversation_id', v_conv_id)
    from public.profiles p
    where p.id in (new.swiper_id, new.swiped_id);
  end if;

  return new;
end;
$$;

create trigger after_swipe_check_match
  after insert on public.swipes
  for each row execute function public.check_and_create_match();

-- ─────────────────────────────────────────────────────────────────────────────
-- GET PROFILES FOR SWIPE (with distance filter)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.get_swipe_candidates(
  p_profile_id    uuid,
  p_max_distance  int default 30,
  p_min_age       int default 18,
  p_max_age       int default 45,
  p_genders       gender_type[] default null,
  p_date_modes    date_mode_type[] default null,
  p_limit         int default 20
)
returns setof public.profiles language sql stable security definer as $$
  select p.* from public.profiles p
  where p.id <> p_profile_id
    and p.is_active = true
    -- Not already swiped
    and not exists (
      select 1 from public.swipes s
      where s.swiper_id = p_profile_id and s.swiped_id = p.id
    )
    -- Age filter
    and extract(year from age(p.birth_date)) between p_min_age and p_max_age
    -- Gender filter (null = all)
    and (p_genders is null or p.gender = any(p_genders))
    -- Date mode filter
    and (p_date_modes is null or p.date_modes && p_date_modes)
    -- Distance filter using Haversine approximation
    and (
      p.latitude is null or p.longitude is null or
      (
        select lat from public.profiles where id = p_profile_id
      ) is null or
      (
        6371 * acos(
          cos(radians((select latitude from public.profiles where id = p_profile_id))) *
          cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians((select longitude from public.profiles where id = p_profile_id))) +
          sin(radians((select latitude from public.profiles where id = p_profile_id))) *
          sin(radians(p.latitude))
        )
      ) <= p_max_distance
    )
  order by
    -- Prioritize super-likes received, then recent activity
    (exists(select 1 from public.swipes where swiper_id = p.id and swiped_id = p_profile_id and action = 'super-like')) desc,
    p.last_seen desc
  limit p_limit;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- Profile is created manually during onboarding, not auto
  -- But we can log the auth event here if needed
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- GET CONVERSATION WITH DETAILS
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.get_my_conversations(p_profile_id uuid)
returns table (
  conversation_id   uuid,
  conversation_type conversation_type,
  conversation_name text,
  last_message_id   uuid,
  last_message_at   timestamptz,
  unread_count      bigint
) language sql stable security definer as $$
  select
    c.id,
    c.type,
    c.name,
    (select id from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1),
    (select created_at from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1),
    (
      select count(*) from public.messages m
      where m.conversation_id = c.id
        and m.created_at > (
          select last_read_at from public.conversation_participants cp2
          where cp2.conversation_id = c.id and cp2.user_id = p_profile_id
        )
        and m.sender_id <> p_profile_id
    )
  from public.conversations c
  join public.conversation_participants cp on cp.conversation_id = c.id
  where cp.user_id = p_profile_id
  order by c.updated_at desc;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────────────────────

-- Run this in Supabase dashboard Storage section or via API:
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
-- insert into storage.buckets (id, name, public) values ('event-photos', 'event-photos', true);

-- Storage RLS
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars: own delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "photos: public read"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "photos: authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
