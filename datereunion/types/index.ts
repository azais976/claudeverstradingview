// ─── Enums ──────────────────────────────────────────────────────────────────

export type Gender = 'homme' | 'femme' | 'non-binaire' | 'autre';
export type DateMode = '1v1' | '2v2' | '3v3' | 'groupe' | 'amis';
export type EventType = 'restaurant' | 'randonnee' | 'plage' | 'sport' | 'culture' | 'soiree' | 'soiree_villa' | 'autre';
export type SwipeAction = 'like' | 'dislike' | 'super-like';
export type MessageType = 'text' | 'image' | 'event' | 'system';
export type ConversationType = '1v1' | 'group';

// Villes et quartiers de La Réunion
export type ReunionCity =
  | 'Saint-Denis' | 'Saint-Paul' | 'Saint-Pierre' | 'Le Tampon'
  | 'Saint-Louis' | 'Saint-Benoît' | 'Saint-André' | 'Saint-Leu'
  | 'Saint-Joseph' | 'Sainte-Marie' | 'Sainte-Suzanne' | 'Saint-Philippe'
  | 'Cilaos' | 'Salazie' | 'Entre-Deux' | 'La Possession'
  | 'Le Port' | 'Trois-Bassins' | 'Petite-Île' | 'Saint-Rose';

// Origines culturelles (La Réunion est très multiculturelle)
export type CulturalOrigin =
  | 'Créole réunionnais' | 'Malgache' | 'Indien tamoul' | 'Indien gujarati'
  | 'Chinois' | 'Comorien' | 'Mahorais' | 'Métropolitain'
  | 'Africain' | 'Autre' | 'Préfère ne pas dire';

// ─── User / Profile ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string | null;
  gender: Gender;
  birth_date: string;
  age: number; // computed
  city: ReunionCity;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  cultural_origin: CulturalOrigin | null;
  interests: string[];
  date_modes: DateMode[];
  looking_for: Gender[];
  min_age_pref: number;
  max_age_pref: number;
  max_distance_km: number;
  photos: ProfilePhoto[];
  is_verified: boolean;
  is_premium: boolean;
  is_active: boolean;
  show_distance: boolean;
  show_age: boolean;
  show_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
  // E2EE
  public_key: string | null; // base64 X25519 public key
}

export interface ProfilePhoto {
  id: string;
  profile_id: string;
  url: string;
  storage_path: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

// ─── Swipe & Match ───────────────────────────────────────────────────────────

export interface Swipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  action: SwipeAction;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  conversation_id: string;
  matched_at: string;
  is_active: boolean;
  // Joined
  matched_profile?: UserProfile;
  conversation?: Conversation;
}

// ─── Messaging / E2EE ────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null; // for group chats
  event_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  participants?: ConversationParticipant[];
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  // Encrypted session key for E2EE group chats
  encrypted_session_key: string | null;
  joined_at: string;
  last_read_at: string;
  profile?: UserProfile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  // Encrypted content (base64 encoded ciphertext)
  encrypted_content: string;
  // IV / nonce for decryption (base64)
  iv: string;
  message_type: MessageType;
  // For ephemeral key in Double Ratchet
  ephemeral_public_key: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Client-side decrypted content (never stored)
  decrypted_content?: string;
  sender?: UserProfile;
}

// ─── E2EE Keys ───────────────────────────────────────────────────────────────

export interface UserKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface StoredKeyPair {
  publicKey: string; // base64
  privateKey: string; // base64, stored in IndexedDB only
}

export interface EncryptedMessage {
  ciphertext: string; // base64
  iv: string; // base64
  ephemeralPublicKey?: string; // base64, for DH key exchange
}

// Alias used by useMessages
export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  ephemeralPublicKey: string;
}

// ─── Events / Dates ──────────────────────────────────────────────────────────

export interface DateEvent {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  event_type: EventType;
  date_mode: DateMode;
  date_time: string;
  location_name: string;
  location_address: string;
  city: ReunionCity;
  latitude: number;
  longitude: number;
  max_participants: number;
  min_age: number;
  max_age: number;
  gender_filter: Gender[] | null; // null = all
  is_public: boolean;
  is_verified_only: boolean;
  conversation_id: string | null;
  // Soirée villa fields
  ticket_price: number | null;
  dress_code: string | null;
  theme: string | null;
  amenities: string[];
  address_hidden: boolean;
  full_address: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  creator?: UserProfile;
  participants?: EventParticipant[];
  participant_count?: number;
  is_participating?: boolean;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'declined';
  joined_at: string;
  profile?: UserProfile;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: 'match' | 'message' | 'event' | 'like' | 'super-like' | 'system';
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// ─── Filters / Search ────────────────────────────────────────────────────────

export interface SwipeFilters {
  min_age: number;
  max_age: number;
  max_distance_km: number;
  date_modes: DateMode[];
  gender: Gender[];
  city: ReunionCity | null;
}

export interface EventFilters {
  event_type: EventType | null;
  date_mode: DateMode | null;
  city: ReunionCity | null;
  date_from: string | null;
  date_to: string | null;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  profile?: UserProfile;
}

// ─── API Response types ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}
