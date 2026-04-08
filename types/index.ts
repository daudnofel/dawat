// =============================================================
// Dawat — Shared TypeScript Interfaces & Enums
// Every file imports types from here. Never define types inline.
// =============================================================

// ─── Enums ───────────────────────────────────────────────────

export enum GenderMode {
  Mixed = 'mixed',
  SistersOnly = 'sisters_only',
  BrothersOnly = 'brothers_only',
  Family = 'family',
}

export enum RsvpStatus {
  Yes = 'yes',
  Inshallah = 'inshallah',
  No = 'no',
  Waitlist = 'waitlist',
}

export enum OrgType {
  Masjid = 'masjid',
  School = 'school',
  Dawah = 'dawah',
  Community = 'community',
  Other = 'other',
}

export enum OrgPlan {
  Free = 'free',
  Starter = 'starter',
  Pro = 'pro',
  Enterprise = 'enterprise',
}

export enum OrgMemberRole {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

export enum HalalSpotType {
  Restaurant = 'restaurant',
  FoodTruck = 'food_truck',
  Venue = 'venue',
  Cafe = 'cafe',
  Other = 'other',
}

export enum NotificationType {
  EventInvite = 'event_invite',
  RsvpUpdate = 'rsvp_update',
  Reminder48h = 'reminder_48h',
  Reminder2h = 'reminder_2h',
  TextBlast = 'text_blast',
  NewEventFromOrg = 'new_event_from_org',
  InshallahNudge = 'inshallah_nudge',
}

export enum NotificationChannel {
  Push = 'push',
  WhatsApp = 'whatsapp',
  Email = 'email',
}

export enum GenderPref {
  All = 'all',
  SistersOnly = 'sisters_only',
  BrothersOnly = 'brothers_only',
  Family = 'family',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  PreferNotSay = 'prefer_not_say',
}

// ─── Database Row Types ──────────────────────────────────────

export interface User {
  id: string;
  username: string;
  display_name: string;
  phone: string | null;
  avatar_url: string | null;
  gender: Gender | null;
  gender_pref: GenderPref;
  is_id_verified: boolean;
  location_city: string | null;
  location_lat: number | null;
  location_lng: number | null;
  is_masjid_admin: boolean;
  push_token: string | null;
  whatsapp_opt_in: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  org_id: string | null;
  host_id: string;
  theme_id: string;
  theme_custom_url: string | null;
  gender_mode: GenderMode;
  is_id_required: boolean;
  date_time: string | null;
  date_tbd: boolean;
  hijri_date: string | null;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  is_location_hidden: boolean;
  price: number;
  capacity: number | null;
  is_halal_venue: boolean;
  prayer_info: string | null;
  custom_tags: string[] | null;
  slug: string;
  is_published: boolean;
  is_cancelled: boolean;
  stripe_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rsvp {
  id: string;
  event_id: string;
  user_id: string | null;
  guest_phone: string | null;
  guest_name: string | null;
  status: RsvpStatus;
  children_count: number;
  children_names: string[] | null;
  plus_one_names: string[];
  checked_in: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Home Tab Refactor (DAW-23) ──────────────────────────────

export interface EventView {
  id: string;
  event_id: string;
  user_id: string;
  viewed_at: string;
}

export interface EventInvite {
  id: string;
  event_id: string;
  invited_user_id: string;
  invited_by: string;
  created_at: string;
  viewed_at: string | null;
  responded_at: string | null;
}

export interface FeaturedCollection {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TrendingTheme {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  theme_id: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// ─── Messaging (DAW-24) ──────────────────────────────────────

export interface Conversation {
  id: string;
  created_at: string;
  last_message_at: string;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Boop {
  id: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
}

// Convenience joined types for the inbox UI
export interface ConversationWithMeta extends Conversation {
  other_user: { id: string; display_name: string | null; avatar_url: string | null };
  last_message: Message | null;
  unread_count: number;
}

export interface BoopSuggestion {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Organisation {
  id: string;
  name: string;
  handle: string;
  type: OrgType | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  location_city: string | null;
  location_address: string | null;
  website: string | null;
  instagram_handle: string | null;
  is_verified: boolean;
  plan: OrgPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: OrgMemberRole;
  created_at: string;
}

export interface OrgFollower {
  org_id: string;
  user_id: string;
  created_at: string;
}

export interface HalalSpot {
  id: string;
  name: string;
  type: HalalSpotType | null;
  is_halal_certified: boolean;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  emoji: string;
  checkin_count: number;
  added_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  event_id: string | null;
  type: 'rsvp' | 'comment' | 'event_update' | 'event_cancelled';
  title: string;
  body: string;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
}

// ─── Comment Reactions (DAW-39) ─────────────────────────────

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '🤲', '🎉', '🙌', '🤍', '✅'] as const;
export type ReactionEmoji = typeof REACTION_EMOJIS[number];

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  emoji: ReactionEmoji;
  created_at: string;
}

// ─── Joined / Computed Types ─────────────────────────────────

export interface EventWithDetails extends Event {
  organisations: Pick<Organisation, 'name' | 'logo_url' | 'is_verified' | 'handle'> | null;
  rsvp_count: number;
  yes_count: number;
  inshallah_count: number;
}

export interface RsvpWithUser extends Rsvp {
  users: Pick<User, 'display_name' | 'avatar_url' | 'username'> | null;
}

// ─── Event Creation State ────────────────────────────────────

export interface EventDraft {
  theme_id: string;
  title: string;
  host_name: string;
  org_id: string | null;
  description: string;
  date_time: Date | null;
  date_tbd: boolean;
  location_name: string;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  is_location_hidden: boolean;
  is_halal_venue: boolean;
  price: number;
  capacity: number | null;
  gender_mode: GenderMode;
  is_id_required: boolean;
  custom_tags: string[];
  rsvp_deadline: Date | null;
  virtual_link: string;
  allow_plus_ones: boolean;
  max_plus_ones: number;
}

// ─── Theme ───────────────────────────────────────────────────

export interface DawatTheme {
  id: string;
  name: string;
  categories: string[];
  bannerBg: string;
  bannerBgImage: string;
  bannerBgSize?: string;
  accentColor: string;
  textColor: string;
  tagBg: string;
  tagColor: string;
  defaultEmoji: string;
}
