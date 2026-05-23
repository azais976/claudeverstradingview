"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Calendar, MapPin, Users, Euro, Shirt, Music2,
  CheckCircle, Loader2, Shield, Lock
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { AddressRevealCard } from "@/components/events/AddressRevealCard";
import { formatEventDate, DATE_MODE_ICONS, EVENT_TYPE_EMOJIS } from "@/lib/utils";
import type { DateEvent, EventParticipant } from "@/types";

export default function EventDetailPage() {
  const params   = useParams<{ id: string }>();
  const router   = useRouter();
  const supabase = createClient();
  const { profile } = useAuthStore();

  const [event, setEvent]             = useState<DateEvent | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading]         = useState(true);
  const [joining, setJoining]         = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [params.id, profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEvent = async () => {
    const { data } = await supabase
      .from("events")
      .select(`
        *,
        creator:profiles!events_creator_id_fkey(id, display_name, profile_photos(*), is_verified),
        event_participants(
          *,
          profile:profiles(id, display_name, profile_photos(*), is_verified)
        )
      `)
      .eq("id", params.id)
      .single();

    if (data) {
      setEvent(data as unknown as DateEvent);
      const parts = (data as Record<string, unknown>).event_participants as EventParticipant[];
      setParticipants(parts ?? []);
      setIsParticipant(parts?.some((p) => p.user_id === profile?.id) ?? false);
    }
    setLoading(false);
  };

  const joinEvent = async () => {
    if (!profile || !event) return;

    // Check if profile is verified for verified-only events
    if (event.is_verified_only && !profile.is_verified) {
      toast.error("Cet événement est réservé aux profils vérifiés. Vérifie ton identité d'abord.");
      router.push("/verify");
      return;
    }

    // Check capacity
    const confirmed = participants.filter((p) => p.status === "confirmed").length;
    if (confirmed >= event.max_participants) {
      toast.error("Événement complet !");
      return;
    }

    setJoining(true);
    try {
      const { error } = await supabase.from("event_participants").insert({
        event_id: event.id,
        user_id:  profile.id,
        status:   "confirmed",
      });

      if (error) throw error;
      toast.success("Tu as rejoint l'événement ! 🎉");
      setIsParticipant(true);
      loadEvent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setJoining(false);
    }
  };

  const leaveEvent = async () => {
    if (!profile || !event) return;
    const { error } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", event.id)
      .eq("user_id", profile.id);

    if (!error) {
      setIsParticipant(false);
      toast.success("Tu as quitté l'événement");
      loadEvent();
    }
  };

  if (loading) return (
    <div className="h-dvh flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-coral" />
    </div>
  );

  if (!event) return (
    <div className="h-dvh flex items-center justify-center text-center px-8">
      <div>
        <div className="text-5xl mb-4">😕</div>
        <h2 className="font-bold text-xl mb-2">Événement introuvable</h2>
        <button onClick={() => router.back()} className="text-coral underline text-sm">Retour</button>
      </div>
    </div>
  );

  const isVilla    = event.event_type === "soiree_villa";
  const isCreator  = event.creator_id === profile?.id;
  const confirmed  = participants.filter((p) => p.status === "confirmed");
  const spotsLeft  = event.max_participants - confirmed.length;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg flex-1 truncate">{event.title}</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            isVilla ? "bg-purple-500/10 text-purple-600" : "bg-coral/10 text-coral"
          }`}>
            {isVilla ? "🏡 Soirée Villa" : `${EVENT_TYPE_EMOJIS[event.event_type]} ${event.event_type}`}
          </span>
          <span className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full">
            {DATE_MODE_ICONS[event.date_mode]} {event.date_mode}
          </span>
          {event.is_verified_only && (
            <span className="bg-green-500/10 text-green-600 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" /> Vérifiés uniquement
            </span>
          )}
          {event.ticket_price != null && event.ticket_price > 0 && (
            <span className="bg-amber-500/10 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Euro className="w-3 h-3" />{event.ticket_price}€/pers
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold leading-tight">{event.title}</h2>

        {/* Villa specific details */}
        {isVilla && (
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 space-y-3">
            {event.theme && (
              <div className="flex items-center gap-2 text-sm">
                <Music2 className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Thème :</span>
                <span>{event.theme}</span>
              </div>
            )}
            {event.dress_code && (
              <div className="flex items-center gap-2 text-sm">
                <Shirt className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Dress code :</span>
                <span>{event.dress_code}</span>
              </div>
            )}
            {event.amenities && event.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.amenities.map((a: string) => (
                  <span key={a} className="text-xs bg-purple-500/10 text-purple-600 px-2.5 py-1 rounded-full">{a}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" /> Date
            </div>
            <p className="text-sm font-semibold">{formatEventDate(event.date_time)}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" /> Places
            </div>
            <p className="text-sm font-semibold">
              {spotsLeft > 0 ? `${spotsLeft} places restantes` : "Complet"}
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 space-y-1 col-span-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" /> Lieu
            </div>
            <p className="text-sm font-semibold">{event.location_name}</p>
            <p className="text-xs text-muted-foreground">
              {event.address_hidden
                ? `${event.location_address} · ${event.city} 🔒`
                : `${event.location_address}, ${event.city}`
              }
            </p>
          </div>
        </div>

        {/* Address Reveal (hidden address events) */}
        {event.address_hidden && isParticipant && (
          <AddressRevealCard
            eventId={event.id}
            fullAddress={event.full_address ?? null}
            creatorId={event.creator_id}
            dateMode={event.date_mode}
          />
        )}
        {event.address_hidden && !isParticipant && (
          <div className="bg-muted/50 border border-border rounded-2xl p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              L&apos;adresse exacte sera révélée après validation mutuelle de tous les participants.
            </p>
          </div>
        )}

        {/* Participants */}
        <div className="space-y-3">
          <h3 className="font-bold text-base">
            Participants ({confirmed.length}/{event.max_participants})
          </h3>
          <div className="flex flex-wrap gap-3">
            {confirmed.map((p) => {
              const pp = p.profile as { display_name?: string; is_verified?: boolean; profile_photos?: {url: string; is_primary: boolean}[] };
              const photo = pp?.profile_photos?.find((ph) => ph.is_primary)?.url ?? pp?.profile_photos?.[0]?.url;
              return (
                <div key={p.user_id} className="flex flex-col items-center gap-1">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted border-2 border-border">
                    {photo
                      ? <Image src={photo} alt={pp?.display_name ?? ""} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                    }
                    {pp?.is_verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[56px]">
                    {pp?.display_name?.split(" ")[0]}
                    {p.user_id === event.creator_id && " 👑"}
                  </span>
                </div>
              );
            })}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, Math.min(3, spotsLeft)) }).map((_, i) => (
              <div key={`empty-${i}`} className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground/40">
                +
              </div>
            ))}
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {((event.creator as unknown as {profile_photos?: {url: string}[]})?.profile_photos?.[0]?.url) ? (
              <Image
                src={(event.creator as unknown as {profile_photos: {url: string}[]}).profile_photos[0].url}
                alt=""
                width={44} height={44}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Organisé par</p>
            <p className="font-semibold text-sm">
              {(event.creator as {display_name?: string})?.display_name}
              {(event.creator as {is_verified?: boolean})?.is_verified && (
                <span className="ml-1 text-green-500 text-xs">✓</span>
              )}
            </p>
          </div>
        </div>

        {/* Action button */}
        {!isCreator && (
          isParticipant ? (
            <button
              onClick={leaveEvent}
              className="w-full py-4 border-2 border-border rounded-2xl font-semibold text-muted-foreground hover:border-red-400 hover:text-red-500 transition-colors"
            >
              Quitter l&apos;événement
            </button>
          ) : (
            <button
              onClick={joinEvent}
              disabled={joining || spotsLeft <= 0}
              className="w-full py-4 bg-gradient-to-r from-coral to-volcano text-white font-bold text-base rounded-2xl hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-coral/20"
            >
              {joining ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Inscription…</>
              ) : spotsLeft <= 0 ? (
                "Événement complet"
              ) : (
                `Rejoindre ${isVilla ? "la soirée 🏡" : "l'événement 🎉"}`
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
}
