import { z } from "zod";

/** Register step 1: email + phone */
export const registerStep1Schema = z.object({
  email: z.string().email("Email invalide"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Numéro de téléphone invalide")
    .optional(),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
});

/** Register step 2: profile basics */
export const registerStep2Schema = z.object({
  display_name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(40, "Maximum 40 caractères"),
  gender: z.enum(["homme", "femme", "non-binaire", "autre"]),
  birth_date: z
    .string()
    .refine((d) => {
      const age = new Date().getFullYear() - new Date(d).getFullYear();
      return age >= 18;
    }, "Vous devez avoir 18 ans ou plus"),
  city: z.string().min(1, "Choisissez une ville"),
});

/** Register step 3: profile details */
export const registerStep3Schema = z.object({
  bio: z.string().max(500, "Maximum 500 caractères").optional(),
  interests: z.array(z.string()).max(10, "Maximum 10 centres d'intérêt"),
  date_modes: z
    .array(z.enum(["1v1", "2v2", "3v3", "groupe", "amis"]))
    .min(1, "Choisissez au moins un mode"),
  looking_for: z.array(z.enum(["homme", "femme", "non-binaire", "autre"])),
});

/** Event creation */
export const createEventSchema = z.object({
  title: z.string().min(5, "Minimum 5 caractères").max(100),
  description: z.string().min(20, "Minimum 20 caractères").max(1000),
  event_type: z.enum([
    "restaurant", "randonnee", "plage", "sport", "culture", "soiree", "autre",
  ]),
  date_mode: z.enum(["1v1", "2v2", "3v3", "groupe", "amis"]),
  date_time: z.string().refine((d) => new Date(d) > new Date(), "La date doit être dans le futur"),
  location_name: z.string().min(2, "Requis"),
  location_address: z.string().min(5, "Requis"),
  city: z.string().min(1, "Choisissez une ville"),
  max_participants: z.number().min(2).max(50),
  min_age: z.number().min(18).max(99),
  max_age: z.number().min(18).max(99),
  is_public: z.boolean(),
  is_verified_only: z.boolean(),
});

/** Profile edit */
export const editProfileSchema = z.object({
  display_name: z.string().min(2).max(40),
  bio: z.string().max(500).optional(),
  city: z.string().min(1),
  neighborhood: z.string().max(50).optional(),
  cultural_origin: z.string().optional(),
  interests: z.array(z.string()).max(10),
  date_modes: z.array(z.enum(["1v1", "2v2", "3v3", "groupe", "amis"])).min(1),
  looking_for: z.array(z.enum(["homme", "femme", "non-binaire", "autre"])),
  min_age_pref: z.number().min(18),
  max_age_pref: z.number().max(99),
  max_distance_km: z.number().min(1).max(100),
});

export type RegisterStep1 = z.infer<typeof registerStep1Schema>;
export type RegisterStep2 = z.infer<typeof registerStep2Schema>;
export type RegisterStep3 = z.infer<typeof registerStep3Schema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type EditProfileInput = z.infer<typeof editProfileSchema>;
