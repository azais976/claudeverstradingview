import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, differenceInYears, format } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compute age from ISO date string */
export function getAge(birthDate: string): number {
  return differenceInYears(new Date(), new Date(birthDate));
}

/** Format relative time in French */
export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr });
}

/** Format date in French */
export function formatDate(dateStr: string, fmt = "d MMMM yyyy"): string {
  return format(new Date(dateStr), fmt, { locale: fr });
}

/** Format event datetime */
export function formatEventDate(dateStr: string): string {
  return format(new Date(dateStr), "EEEE d MMMM 'à' HH'h'mm", { locale: fr });
}

/** Calculate distance between two coordinates (Haversine) */
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Generate a random username */
export function generateUsername(displayName: string): string {
  const base = displayName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `${base}${suffix}`;
}

/** Date mode labels in French */
export const DATE_MODE_LABELS: Record<string, string> = {
  "1v1": "1 contre 1",
  "2v2": "Double date",
  "3v3": "Triple date",
  groupe: "Groupe",
  amis: "Amis",
};

/** Date mode icons */
export const DATE_MODE_ICONS: Record<string, string> = {
  "1v1": "💑",
  "2v2": "👫👫",
  "3v3": "👥",
  groupe: "🎉",
  amis: "🤝",
};

/** Event type labels */
export const EVENT_TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  randonnee: "Randonnée",
  plage: "Plage",
  sport: "Sport",
  culture: "Culture",
  soiree: "Soirée",
  autre: "Autre",
};

/** Event type emojis */
export const EVENT_TYPE_EMOJIS: Record<string, string> = {
  restaurant: "🍽️",
  randonnee: "🥾",
  plage: "🏖️",
  sport: "⚽",
  culture: "🎭",
  soiree: "🎊",
  autre: "📍",
};

/** Interests list for La Réunion */
export const INTERESTS = [
  "Randonnée", "Plage", "Surf", "Canyoning",
  "Musique", "Cuisine réunionnaise", "Maloya", "Séga",
  "Sport", "Yoga", "Danse", "Lecture",
  "Voyage", "Photo", "Cinéma", "Jeux vidéo",
  "Art", "Bénévolat", "Environnement", "Animaux",
  "Plongée", "Escalade", "VTT", "Course à pied",
];

/** Cities coordinates at La Réunion */
export const REUNION_CITIES_COORDS: Record<string, [number, number]> = {
  "Saint-Denis":    [55.4518, -20.8823],
  "Saint-Paul":     [55.2749, -21.0049],
  "Saint-Pierre":   [55.4770, -21.3386],
  "Le Tampon":      [55.5098, -21.2779],
  "Saint-Louis":    [55.4467, -21.2755],
  "Saint-Benoît":   [55.7135, -21.0357],
  "Saint-André":    [55.6498, -20.9620],
  "Saint-Leu":      [55.2843, -21.1583],
  "Saint-Joseph":   [55.6166, -21.3839],
  "Sainte-Marie":   [55.5331, -20.8996],
  "La Possession":  [55.3369, -20.9260],
  "Le Port":        [55.2952, -20.9362],
};
