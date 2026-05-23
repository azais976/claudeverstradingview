-- DateRéunion
-- Migration 004: Soirées Villa, Validations mutuelles, Vérification d'identité

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. EXTEND EVENT TYPE — add soiree_villa
-- ─────────────────────────────────────────────────────────────────────────────

-- Recreate event_type enum with new value
alter type event_type add value if not exists 'soiree_villa';

-- Extend events table with party/villa fields
alter table public.events
  add column if not exists ticket_price        numeric(8,2),    -- Prix d'entrée (null = gratuit)
  add column if not exists dress_code          text,            -- Ex: "Tenue de soirée", "Blanc obligatoire"
  add column if not exists theme               text,            -- Thème de la soirée
  add column if not exists amenities           text[],          -- ["Piscine","DJ","Barbecue","Open bar"]
  add column if not exists age_restriction     int default 18,
  -- L'adresse précise est cachée jusqu'à la validation mutuelle
  add column if not exists address_hidden      boolean not null default false,
  add column if not exists full_address        text;            -- Adresse complète (révélée après validation)

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MUTUAL ADDRESS VALIDATION
-- Avant que l'adresse soit révélée, l'organisateur doit valider le participant
-- ET le participant doit confirmer sa participation.
-- Pour les groupes (2v2, 3v3...) : TOUS les membres doivent valider mutuellement.
-- ─────────────────────────────────────────────────────────────────────────────

create type validation_status as enum ('pending', 'approved', 'rejected');

-- Chaque paire (validator, target) pour un événement
create table public.address_validations (
  id           uuid primary key default uuid_generate_v4(),
  event_id     uuid not null references public.events(id) on delete cascade,
  validator_id uuid not null references public.profiles(id) on delete cascade,  -- qui valide
  target_id    uuid not null references public.profiles(id) on delete cascade,  -- qui est validé
  status       validation_status not null default 'pending',
  note         text,          -- Message optionnel du validateur
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (event_id, validator_id, target_id)
);

create index idx_addr_val_event    on public.address_validations(event_id);
create index idx_addr_val_target   on public.address_validations(target_id);
create index idx_addr_val_validator on public.address_validations(validator_id);

alter table public.address_validations enable row level security;

-- Seuls les participants de l'événement peuvent voir/créer les validations
create policy "validations: read if participant"
  on public.address_validations for select
  to authenticated
  using (
    event_id in (
      select event_id from public.event_participants
      where user_id = public.my_profile_id()
    )
    or validator_id = public.my_profile_id()
    or target_id    = public.my_profile_id()
  );

create policy "validations: insert own"
  on public.address_validations for insert
  to authenticated
  with check (validator_id = public.my_profile_id());

create policy "validations: update own"
  on public.address_validations for update
  to authenticated
  using (validator_id = public.my_profile_id());

create trigger address_validations_updated_at
  before update on public.address_validations
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: should_reveal_address(event_id, asking_profile_id)
-- Renvoie true si l'adresse doit être révélée à cette personne.
-- Règle : toutes les validations croisées pour ce groupe doivent être 'approved'.
-- Ex 2v2 : A valide B, B valide A, C valide D, D valide C → 4 validations approuvées.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.should_reveal_address(
  p_event_id    uuid,
  p_profile_id  uuid
)
returns boolean language plpgsql stable security definer as $$
declare
  v_event          record;
  v_participants   uuid[];
  v_required_count int;
  v_approved_count int;
begin
  select * into v_event from public.events where id = p_event_id;

  -- If address is not hidden, always reveal
  if not v_event.address_hidden then
    return true;
  end if;

  -- Check if requester is a confirmed participant
  if not exists (
    select 1 from public.event_participants
    where event_id = p_event_id
      and user_id = p_profile_id
      and status = 'confirmed'
  ) then
    return false;
  end if;

  -- Creator always sees the address
  if v_event.creator_id = p_profile_id then
    return true;
  end if;

  -- Get all confirmed participants (excluding creator)
  select array_agg(user_id) into v_participants
  from public.event_participants
  where event_id = p_event_id and status = 'confirmed';

  -- Total validations needed = N * (N-1) for full mutual validation
  v_required_count := array_length(v_participants, 1) * (array_length(v_participants, 1) - 1);

  -- Count approved validations
  select count(*) into v_approved_count
  from public.address_validations
  where event_id = p_event_id and status = 'approved';

  return v_approved_count >= v_required_count;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: initialize_validations_for_event(event_id)
-- Crée toutes les paires de validations nécessaires quand quelqu'un rejoint.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.initialize_validations_for_new_participant()
returns trigger language plpgsql security definer as $$
declare
  v_event       record;
  v_participant uuid;
begin
  select * into v_event from public.events where id = new.event_id;

  -- Only for address-hidden events
  if not v_event.address_hidden then
    return new;
  end if;

  -- For each existing confirmed participant, create mutual validation pairs
  for v_participant in (
    select user_id from public.event_participants
    where event_id = new.event_id
      and status = 'confirmed'
      and user_id <> new.user_id
  ) loop
    -- New participant must validate existing
    insert into public.address_validations (event_id, validator_id, target_id)
    values (new.event_id, new.user_id, v_participant)
    on conflict do nothing;

    -- Existing must validate new participant
    insert into public.address_validations (event_id, validator_id, target_id)
    values (new.event_id, v_participant, new.user_id)
    on conflict do nothing;

    -- Notify existing participant they have a new validation request
    insert into public.notifications (user_id, type, title, body, data)
    values (
      v_participant,
      'event',
      'Nouveau participant à valider 👀',
      'Quelqu''un veut rejoindre votre sortie. Validez-le pour partager l''adresse.',
      jsonb_build_object('event_id', new.event_id, 'target_id', new.user_id)
    );
  end loop;

  return new;
end;
$$;

create trigger on_participant_join_init_validations
  after insert on public.event_participants
  for each row execute function public.initialize_validations_for_new_participant();

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: notify_on_full_validation(event_id)
-- Quand toutes les validations sont approuvées → notifie tous les participants
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.check_full_validation()
returns trigger language plpgsql security definer as $$
declare
  v_participant uuid;
  v_event       record;
begin
  if new.status <> 'approved' then
    return new;
  end if;

  -- Check if all validations are now approved
  if public.should_reveal_address(new.event_id, new.target_id) then
    select * into v_event from public.events where id = new.event_id;

    -- Notify all confirmed participants
    for v_participant in (
      select user_id from public.event_participants
      where event_id = new.event_id and status = 'confirmed'
    ) loop
      insert into public.notifications (user_id, type, title, body, data)
      values (
        v_participant,
        'event',
        '📍 Adresse révélée !',
        'Toutes les validations sont complètes. L''adresse de la soirée est maintenant disponible.',
        jsonb_build_object('event_id', new.event_id)
      );
    end loop;
  end if;

  return new;
end;
$$;

create trigger on_validation_approved_check_full
  after update on public.address_validations
  for each row execute function public.check_full_validation();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. IDENTITY VERIFICATION (Photo IA + Face ID)
-- ─────────────────────────────────────────────────────────────────────────────

create type verification_status_type as enum (
  'not_submitted',  -- Pas encore soumis
  'pending',        -- En attente d'analyse
  'ai_detected',    -- Photo IA détectée → rejeté
  'face_mismatch',  -- Visage ne correspond pas à la carte d'identité
  'approved',       -- Vérifié avec succès
  'rejected'        -- Rejeté manuellement
);

create table public.identity_verifications (
  id                   uuid primary key default uuid_generate_v4(),
  profile_id           uuid not null unique references public.profiles(id) on delete cascade,
  -- Selfie storage path (face live)
  selfie_path          text,
  -- ID card photo storage path (front only, face side)
  id_card_path         text,
  -- Scores (0.0 → 1.0)
  ai_detection_score   float,    -- 0 = réelle, 1 = IA générée
  face_match_score     float,    -- 0 = pas de correspondance, 1 = identique
  -- Status
  status               verification_status_type not null default 'not_submitted',
  rejection_reason     text,
  -- Metadata
  submitted_at         timestamptz,
  reviewed_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index idx_id_verif_profile on public.identity_verifications(profile_id);
create index idx_id_verif_status  on public.identity_verifications(status);

alter table public.identity_verifications enable row level security;

-- Only the owner can see their own verification
create policy "id_verif: own read"
  on public.identity_verifications for select
  to authenticated
  using (profile_id = public.my_profile_id());

create policy "id_verif: own insert"
  on public.identity_verifications for insert
  to authenticated
  with check (profile_id = public.my_profile_id());

create policy "id_verif: own update"
  on public.identity_verifications for update
  to authenticated
  using (profile_id = public.my_profile_id());

create trigger id_verif_updated_at
  before update on public.identity_verifications
  for each row execute function public.handle_updated_at();

-- Update profile is_verified when verification is approved
create or replace function public.sync_profile_verification()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'approved' then
    update public.profiles set is_verified = true where id = new.profile_id;
  elsif new.status in ('rejected', 'ai_detected', 'face_mismatch') then
    update public.profiles set is_verified = false where id = new.profile_id;
  end if;
  return new;
end;
$$;

create trigger on_verification_status_change
  after update of status on public.identity_verifications
  for each row execute function public.sync_profile_verification();

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage buckets for verification photos
-- (run manually in Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('id-verifications', 'id-verifications', false);
-- insert into storage.buckets (id, name, public) values ('selfies', 'selfies', false);
-- (private buckets — only accessible server-side)
-- ─────────────────────────────────────────────────────────────────────────────
