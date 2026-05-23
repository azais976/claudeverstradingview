"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Euro } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { DATE_MODE_LABELS, DATE_MODE_ICONS, EVENT_TYPE_EMOJIS } from "@/lib/utils";

const CITIES = [
  "Saint-Denis", "Saint-Paul", "Saint-Pierre", "Le Tampon",
  "Saint-Louis", "Saint-Benoît", "Saint-André", "Saint-Leu",
  "Saint-Joseph", "Sainte-Marie", "La Possession", "Le Port",
];

const EVENT_TYPES = [
  "restaurant", "randonnee", "plage", "sport",
  "culture", "soiree", "soiree_villa", "autre",
] as const;

const DATE_MODES = ["1v1", "2v2", "3v3", "groupe", "amis"] as const;

const AMENITIES_OPTIONS = [
  "Piscine", "DJ / Musique live", "Barbecue", "Open bar",
  "Photobooth", "Dancefloor", "Tente / Chapiteau", "Vue mer",
  "Jacuzzi", "Karaoké", "Jeux",
];

const createEventSchema = z.object({
  event_type:        z.string().min(1, "Requis"),
  date_mode:         z.string().min(1, "Requis"),
  title:             z.string().min(5).max(100),
  description:       z.string().min(20).max(1000),
  date_time:         z.string().min(1, "Requis"),
  location_name:     z.string().min(2),
  location_address:  z.string().min(5),
  city:              z.string().min(1),
  max_participants:  z.number().min(2).max(200),
  min_age:           z.number().min(18).max(99),
  max_age:           z.number().min(18).max(99),
  is_public:         z.boolean(),
  is_verified_only:  z.boolean(),
  address_hidden:    z.boolean(),
  full_address:      z.string().optional(),
  // Soirée villa fields
  ticket_price:      z.number().min(0).optional().nullable(),
  dress_code:        z.string().max(100).optional(),
  theme:             z.string().max(100).optional(),
  amenities:         z.array(z.string()).optional(),
});

type FormData = z.infer<typeof createEventSchema>;

const CITY_COORDS: Record<string, [number, number]> = {
  "Saint-Denis":   [55.4518, -20.8823],
  "Saint-Paul":    [55.2749, -21.0049],
  "Saint-Pierre":  [55.4770, -21.3386],
  "Le Tampon":     [55.5098, -21.2779],
  "Saint-Louis":   [55.4467, -21.2755],
  "Saint-Benoît":  [55.7135, -21.0357],
  "Saint-André":   [55.6498, -20.9620],
  "Saint-Leu":     [55.2843, -21.1583],
  "Saint-Joseph":  [55.6166, -21.3839],
  "Sainte-Marie":  [55.5331, -20.8996],
  "La Possession": [55.3369, -20.9260],
  "Le Port":       [55.2952, -20.9362],
};

export default function NewEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      max_participants:  6,
      min_age:           18,
      max_age:           40,
      is_public:         true,
      is_verified_only:  false,
      address_hidden:    false,
      amenities:         [],
    },
  });

  const selectedType  = watch("event_type");
  const selectedMode  = watch("date_mode");
  const addressHidden = watch("address_hidden");
  const isVilla       = selectedType === "soiree_villa";

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) => {
      const next = prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item];
      setValue("amenities", next);
      return next;
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!profile) return;
    setLoading(true);
    try {
      const [lng, lat] = CITY_COORDS[data.city] ?? [55.45, -20.88];

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          creator_id:       profile.id,
          event_type:       data.event_type,
          date_mode:        data.date_mode,
          title:            data.title,
          description:      data.description,
          date_time:        data.date_time,
          location_name:    data.location_name,
          location_address: data.location_address,
          city:             data.city,
          latitude:         lat,
          longitude:        lng,
          max_participants: data.max_participants,
          min_age:          data.min_age,
          max_age:          data.max_age,
          is_public:        data.is_public,
          is_verified_only: data.is_verified_only,
          address_hidden:   data.address_hidden,
          full_address:     data.address_hidden ? data.full_address : null,
          ticket_price:     isVilla ? (data.ticket_price ?? null) : null,
          dress_code:       isVilla ? (data.dress_code ?? null) : null,
          theme:            isVilla ? (data.theme ?? null) : null,
          amenities:        isVilla ? selectedAmenities : [],
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join as confirmed participant
      await supabase.from("event_participants").insert({
        event_id: event.id,
        user_id:  profile.id,
        status:   "confirmed",
      });

      toast.success("Événement créé ! 🎉");
      router.push(`/events/${event.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-extrabold">Créer un événement</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Event type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Type de sortie</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue("event_type", type)}
                className={`p-3 rounded-xl border-2 text-center text-xs font-medium transition-all ${
                  selectedType === type ? "border-coral bg-coral/10 text-coral" : "border-border hover:border-muted-foreground/60"
                }`}
              >
                <div className="text-xl mb-1">
                  {type === "soiree_villa" ? "🏡" : EVENT_TYPE_EMOJIS[type]}
                </div>
                {type === "soiree_villa" ? "Soirée Villa" : type}
              </button>
            ))}
          </div>
          {errors.event_type && <p className="text-xs text-destructive">{errors.event_type.message}</p>}
        </div>

        {/* Date mode */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Format</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DATE_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setValue("date_mode", mode)}
                className={`p-3 rounded-xl border-2 text-sm font-medium flex items-center gap-2 transition-all ${
                  selectedMode === mode ? "border-coral bg-coral/10 text-coral" : "border-border hover:border-muted-foreground/60"
                }`}
              >
                <span>{DATE_MODE_ICONS[mode]}</span>
                <span>{DATE_MODE_LABELS[mode]}</span>
              </button>
            ))}
          </div>
          {errors.date_mode && <p className="text-xs text-destructive">{errors.date_mode.message}</p>}
        </div>

        {/* ── SOIRÉE VILLA SPECIFIC FIELDS ── */}
        {isVilla && (
          <div className="space-y-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <span className="text-xl">🏡</span>
              <h3 className="font-bold">Détails de la soirée villa</h3>
            </div>

            {/* Ticket price */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Prix d&apos;entrée</label>
              <div className="relative">
                <Euro className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("ticket_price", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="0 = gratuit"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">Laisse 0 pour une soirée gratuite</p>
            </div>

            {/* Dress code */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Dress code (optionnel)</label>
              <input
                {...register("dress_code")}
                placeholder="Ex: Blanc obligatoire, Tenue de soirée…"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
              />
            </div>

            {/* Theme */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Thème (optionnel)</label>
              <input
                {...register("theme")}
                placeholder="Ex: Tropical, Années 80, Halloween…"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
              />
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Équipements disponibles</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                      selectedAmenities.includes(item)
                        ? "border-purple-500 bg-purple-500/10 text-purple-600"
                        : "border-border hover:border-muted-foreground/60"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Hidden address option */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-muted cursor-pointer">
              <input
                {...register("address_hidden")}
                type="checkbox"
                className="w-5 h-5 rounded accent-coral mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">Masquer l&apos;adresse exacte</p>
                <p className="text-xs text-muted-foreground">
                  L&apos;adresse est révélée uniquement après validation mutuelle de tous les participants.
                  Idéal pour les soirées privées.
                </p>
              </div>
            </label>

            {/* Full address (only shown if hidden) */}
            {addressHidden && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Adresse complète (masquée) <span className="text-red-500">*</span></label>
                <input
                  {...register("full_address")}
                  placeholder="Adresse complète révélée après validation"
                  className="w-full px-4 py-3 rounded-xl border border-coral/50 bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  🔒 Cette adresse ne sera visible que par les participants validés mutuellement
                </p>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Titre <span className="text-red-500">*</span></label>
          <input
            {...register("title")}
            placeholder={isVilla ? "Ex: Soirée tropicale villa Piton 🌴" : "Ex: Randonnée Piton de la Fournaise 🌋"}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Description <span className="text-red-500">*</span></label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder={isVilla
              ? "Décris la soirée, l'ambiance, le programme prévu, les règles de la maison…"
              : "Décris ta sortie, l'ambiance, ce que tu recherches…"
            }
            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm resize-none"
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        {/* Date & Time */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Date et heure <span className="text-red-500">*</span></label>
          <input
            {...register("date_time")}
            type="datetime-local"
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
          />
          {errors.date_time && <p className="text-xs text-destructive">{errors.date_time.message}</p>}
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">Lieu</label>
          <select
            {...register("city")}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
          >
            <option value="">Choisir une ville</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}

          <input
            {...register("location_name")}
            placeholder={isVilla ? "Nom de la villa (ex: Villa Lagon Bleu)" : "Nom du lieu"}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
          />

          {/* Public address (approximate) */}
          <input
            {...register("location_address")}
            placeholder={isVilla && addressHidden
              ? "Adresse approximative (quartier, ville — publique)"
              : "Adresse complète"
            }
            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
          />
          {isVilla && addressHidden && (
            <p className="text-xs text-muted-foreground">
              ℹ️ Cette adresse publique (ex: &quot;Saint-Gilles, proche mer&quot;) aide les gens à savoir si c&apos;est proche. L&apos;adresse exacte est celle du champ précédent.
            </p>
          )}
        </div>

        {/* Participants & Age */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Participants max</label>
            <input
              {...register("max_participants", { valueAsNumber: true })}
              type="number" min={2} max={200}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Âge min</label>
            <input
              {...register("min_age", { valueAsNumber: true })}
              type="number" min={18} max={99}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Options</label>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-muted cursor-pointer">
            <input {...register("is_public")} type="checkbox" className="w-5 h-5 rounded accent-coral" />
            <div>
              <p className="text-sm font-medium">Événement public</p>
              <p className="text-xs text-muted-foreground">Visible dans la liste des événements</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-muted cursor-pointer">
            <input {...register("is_verified_only")} type="checkbox" className="w-5 h-5 rounded accent-coral" />
            <div>
              <p className="text-sm font-medium">Profils vérifiés uniquement ✓</p>
              <p className="text-xs text-muted-foreground">
                {isVilla ? "Recommandé pour les soirées privées" : "Réservé aux membres vérifiés"}
              </p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-coral to-volcano text-white font-bold text-base rounded-2xl hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-coral/20"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Création…</>
            : isVilla ? "Créer la soirée villa 🏡" : "Créer l'événement 🎉"
          }
        </button>
      </form>
    </div>
  );
}
