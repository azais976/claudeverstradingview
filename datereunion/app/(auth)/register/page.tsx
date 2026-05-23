"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { initializeE2EE } from "@/lib/encryption";
import { generateUsername } from "@/lib/utils";
import { INTERESTS, DATE_MODE_LABELS, DATE_MODE_ICONS } from "@/lib/utils";
import {
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
  type RegisterStep1,
  type RegisterStep2,
  type RegisterStep3,
} from "@/lib/validations";

const CITIES = [
  "Saint-Denis", "Saint-Paul", "Saint-Pierre", "Le Tampon",
  "Saint-Louis", "Saint-Benoît", "Saint-André", "Saint-Leu",
  "Saint-Joseph", "Sainte-Marie", "La Possession", "Le Port",
];

const DATE_MODES = ["1v1", "2v2", "3v3", "groupe", "amis"] as const;
const GENDERS = [
  { value: "homme", label: "Homme" },
  { value: "femme", label: "Femme" },
  { value: "non-binaire", label: "Non-binaire" },
  { value: "autre", label: "Autre" },
];

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [step1Data, setStep1Data] = useState<RegisterStep1 | null>(null);
  const [step2Data, setStep2Data] = useState<RegisterStep2 | null>(null);

  const step1Form = useForm<RegisterStep1>({ resolver: zodResolver(registerStep1Schema) });
  const step2Form = useForm<RegisterStep2>({ resolver: zodResolver(registerStep2Schema) });
  const step3Form = useForm<RegisterStep3>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues: { interests: [], date_modes: ["1v1"], looking_for: [] },
  });

  const handleStep1 = (data: RegisterStep1) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2 = (data: RegisterStep2) => {
    setStep2Data(data);
    setStep(3);
  };

  const handleStep3 = async (data: RegisterStep3) => {
    if (!step1Data || !step2Data) return;
    setLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/swipe`,
        },
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || "Erreur lors de l'inscription");
      }

      // 2. Generate E2EE keypair and store private key locally
      const publicKey = await initializeE2EE();

      // 3. Create profile
      const username = generateUsername(step2Data.display_name);
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        username,
        display_name: step2Data.display_name,
        gender: step2Data.gender,
        birth_date: step2Data.birth_date,
        city: step2Data.city,
        bio: data.bio || null,
        interests: data.interests,
        date_modes: data.date_modes,
        looking_for: data.looking_for,
        public_key: publicKey,
      });

      if (profileError) throw new Error(profileError.message);

      toast.success("Compte créé ! Vérifie ta boîte mail pour confirmer.");
      router.push("/swipe");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold mb-2">
          {step === 1 ? "Créer un compte 🎉" : step === 2 ? "Ton profil 📝" : "Tes préférences 💭"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Étape {step} sur 3
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-coral to-volcano rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step 1: Email + Password */}
      {step === 1 && (
        <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              {...step1Form.register("email")}
              type="email"
              placeholder="toi@exemple.re"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral text-sm"
            />
            {step1Form.formState.errors.email && (
              <p className="text-xs text-destructive">{step1Form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mot de passe</label>
            <input
              {...step1Form.register("password")}
              type="password"
              placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral text-sm"
            />
            {step1Form.formState.errors.password && (
              <p className="text-xs text-destructive">{step1Form.formState.errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            Continuer <ChevronRight className="w-4 h-4" />
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <a href="/login" className="text-coral font-semibold hover:underline">Se connecter</a>
          </p>
        </form>
      )}

      {/* Step 2: Profile basics */}
      {step === 2 && (
        <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Prénom / Pseudo</label>
            <input
              {...step2Form.register("display_name")}
              placeholder="Léa"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
            />
            {step2Form.formState.errors.display_name && (
              <p className="text-xs text-destructive">{step2Form.formState.errors.display_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Genre</label>
            <div className="grid grid-cols-2 gap-2">
              {GENDERS.map((g) => (
                <label key={g.value} className="relative">
                  <input type="radio" {...step2Form.register("gender")} value={g.value} className="sr-only peer" />
                  <div className="px-4 py-3 rounded-xl border-2 border-border peer-checked:border-coral peer-checked:bg-coral/10 text-center text-sm font-medium cursor-pointer transition-all">
                    {g.label}
                  </div>
                </label>
              ))}
            </div>
            {step2Form.formState.errors.gender && (
              <p className="text-xs text-destructive">{step2Form.formState.errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date de naissance (18+ requis)</label>
            <input
              {...step2Form.register("birth_date")}
              type="date"
              max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
            />
            {step2Form.formState.errors.birth_date && (
              <p className="text-xs text-destructive">{step2Form.formState.errors.birth_date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ville</label>
            <select
              {...step2Form.register("city")}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm"
            >
              <option value="">Choisir une ville</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {step2Form.formState.errors.city && (
              <p className="text-xs text-destructive">{step2Form.formState.errors.city.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-border rounded-xl font-medium text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
            <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
              Continuer <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio (optionnel)</label>
            <textarea
              {...step3Form.register("bio")}
              placeholder="Parle un peu de toi… tes passions, ce que tu cherches…"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-coral/50 text-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mode de rencontre recherché</label>
            <div className="grid grid-cols-2 gap-2">
              {DATE_MODES.map((mode) => {
                const checked = step3Form.watch("date_modes")?.includes(mode);
                return (
                  <label key={mode} className="relative">
                    <input
                      type="checkbox"
                      value={mode}
                      className="sr-only"
                      onChange={(e) => {
                        const current = step3Form.getValues("date_modes") || [];
                        if (e.target.checked) {
                          step3Form.setValue("date_modes", [...current, mode] as typeof current);
                        } else {
                          step3Form.setValue("date_modes", current.filter((m) => m !== mode) as typeof current);
                        }
                      }}
                    />
                    <div className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all flex items-center gap-2 ${checked ? "border-coral bg-coral/10 text-coral" : "border-border"}`}>
                      <span>{DATE_MODE_ICONS[mode]}</span>
                      <span>{DATE_MODE_LABELS[mode]}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Centres d&apos;intérêt (max 10)</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const selected = step3Form.watch("interests")?.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      const current = step3Form.getValues("interests") || [];
                      if (selected) {
                        step3Form.setValue("interests", current.filter((i) => i !== interest));
                      } else if (current.length < 10) {
                        step3Form.setValue("interests", [...current, interest]);
                      }
                    }}
                    className={`interest-tag text-xs ${selected ? "active" : ""}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex-1 py-3.5 border border-border rounded-xl font-medium text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création…</> : "Créer mon profil 🎉"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
