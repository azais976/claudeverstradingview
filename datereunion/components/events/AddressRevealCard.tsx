"use client";

import { useState, useEffect } from "react";
import { MapPin, Lock, CheckCircle, XCircle, Clock, Users, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface ValidationState {
  validator_id: string;
  target_id: string;
  status: "pending" | "approved" | "rejected";
  validator_name: string;
  target_name: string;
}

interface Props {
  eventId: string;
  fullAddress: string | null;
  creatorId: string;
  dateMode: string;
}

export function AddressRevealCard({ eventId, fullAddress, creatorId, dateMode }: Props) {
  const supabase = createClient();
  const { profile } = useAuthStore();

  const [addressRevealed, setAddressRevealed] = useState(false);
  const [validations, setValidations] = useState<ValidationState[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadValidations();

    // Realtime updates
    const channel = supabase
      .channel(`validations:${eventId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "address_validations",
        filter: `event_id=eq.${eventId}`,
      }, loadValidations)
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadValidations = async () => {
    // Check if address should be revealed for me
    const { data: revealData } = await supabase
      .rpc("should_reveal_address", {
        p_event_id: eventId,
        p_profile_id: profile?.id,
      });
    setAddressRevealed(!!revealData);

    // Load all validations for this event
    const { data: vals } = await supabase
      .from("address_validations")
      .select(`
        validator_id,
        target_id,
        status,
        validator:profiles!address_validations_validator_id_fkey(display_name),
        target:profiles!address_validations_target_id_fkey(display_name)
      `)
      .eq("event_id", eventId);

    if (vals) {
      setValidations(vals.map((v: Record<string, unknown>) => ({
        validator_id: v.validator_id as string,
        target_id: v.target_id as string,
        status: v.status as "pending" | "approved" | "rejected",
        validator_name: (v.validator as {display_name: string})?.display_name ?? "?",
        target_name: (v.target as {display_name: string})?.display_name ?? "?",
      })));
    }
    setLoading(false);
  };

  const handleValidation = async (targetId: string, approve: boolean) => {
    if (!profile) return;
    setActionLoading(targetId);
    try {
      await supabase
        .from("address_validations")
        .update({ status: approve ? "approved" : "rejected" })
        .eq("event_id", eventId)
        .eq("validator_id", profile.id)
        .eq("target_id", targetId);

      await loadValidations();
    } finally {
      setActionLoading(null);
    }
  };

  // My pending validations (people I need to validate)
  const myPendingValidations = validations.filter(
    (v) => v.validator_id === profile?.id && v.status === "pending"
  );

  const isCreator = profile?.id === creatorId;

  // ── Address is revealed ──
  if (addressRevealed && fullAddress) return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <CheckCircle className="w-5 h-5" />
        <span className="font-semibold text-sm">Adresse révélée</span>
      </div>
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <p className="font-medium text-sm leading-relaxed">{fullAddress}</p>
      </div>
      <a
        href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-green-600 hover:underline"
      >
        Ouvrir dans Google Maps →
      </a>
    </div>
  );

  // ── Loading ──
  if (loading) return (
    <div className="bg-muted/50 rounded-2xl p-4 flex items-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Chargement des validations…</span>
    </div>
  );

  // ── Validation pending ──
  const totalValidations = validations.length;
  const approvedValidations = validations.filter((v) => v.status === "approved").length;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lock className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-semibold text-sm">Adresse masquée</p>
          <p className="text-xs text-muted-foreground">
            Révélée quand toutes les validations sont approuvées
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Validations mutuelles ({dateMode})
          </span>
          <span>{approvedValidations}/{totalValidations}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-coral to-volcano rounded-full transition-all duration-500"
            style={{ width: totalValidations > 0 ? `${(approvedValidations / totalValidations) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Validations grid */}
      <div className="space-y-2">
        {validations.map((v, i) => (
          <div key={i} className={cn(
            "flex items-center gap-2 text-xs px-3 py-2 rounded-xl",
            v.status === "approved" ? "bg-green-500/10 text-green-600" :
            v.status === "rejected" ? "bg-red-500/10 text-red-600" :
            "bg-muted/60 text-muted-foreground"
          )}>
            {v.status === "approved" ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> :
             v.status === "rejected" ? <XCircle className="w-3.5 h-3.5 flex-shrink-0" /> :
             <Clock className="w-3.5 h-3.5 flex-shrink-0" />}
            <span className="truncate">
              <strong>{v.validator_name}</strong> valide <strong>{v.target_name}</strong>
            </span>
          </div>
        ))}
      </div>

      {/* My pending actions */}
      {myPendingValidations.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">Ton avis sur :</p>
          {myPendingValidations.map((v) => (
            <div key={v.target_id} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-muted/60 rounded-xl text-sm font-medium truncate">
                {v.target_name}
              </div>
              <button
                onClick={() => handleValidation(v.target_id, false)}
                disabled={!!actionLoading}
                className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {actionLoading === v.target_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleValidation(v.target_id, true)}
                disabled={!!actionLoading}
                className="w-9 h-9 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                {actionLoading === v.target_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
