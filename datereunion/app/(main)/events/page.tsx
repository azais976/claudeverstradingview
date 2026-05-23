"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Plus, MapPin, Users, Euro, Music2, Shirt } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { formatEventDate, DATE_MODE_ICONS, EVENT_TYPE_EMOJIS } from "@/lib/utils";
import type { DateEvent } from "@/types";

export default function EventsPage() {
  const supabase = createClient();
  const { profile } = useAuthStore();
  const [events, setEvents] = useState<DateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"discover" | "mine">("discover");

  useEffect(() => {
    if (!profile) return;
    fetchEvents();
  }, [profile, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = async () => {
    setLoading(true);
    let query = supabase
      .from("events")
      .select(`
        *,
        creator:profiles!events_creator_id_fkey(id, display_name, profile_photos(*)),
        participants:event_participants(count)
      `)
      .gte("date_time", new Date().toISOString())
      .order("date_time", { ascending: true });

    if (tab === "mine") {
      query = query.eq("creator_id", profile!.id);
    } else {
      query = query.eq("is_public", true);
    }

    const { data } = await query;
    setEvents((data as unknown as DateEvent[]) ?? []);
    setLoading(false);
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-6 h-6 text-coral" />
        <h1 className="text-2xl font-extrabold">Événements</h1>
        <Link
          href="/events/new"
          className="ml-auto w-9 h-9 rounded-xl bg-gradient-to-br from-coral to-volcano text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-md shadow-coral/30"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 mb-5">
        {(["discover", "mine"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t === "discover" ? "🌴 Découvrir" : "📋 Mes dates"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-6xl">{tab === "mine" ? "📅" : "🌺"}</div>
          <h3 className="font-bold text-xl">
            {tab === "mine" ? "Pas encore d'événements" : "Aucun événement nearby"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {tab === "mine" ? "Crée ton premier événement !" : "Sois le premier à proposer une sortie."}
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl hover:opacity-90 mt-2"
          >
            <Plus className="w-4 h-4" /> Créer un événement
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const isVilla = event.event_type === "soiree_villa";
            const creatorPhoto = (event.creator as {profile_photos?: {url: string}[]})?.profile_photos?.[0]?.url;

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className={`block rounded-2xl overflow-hidden border transition-shadow hover:shadow-lg ${
                  isVilla ? "border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-card" : "border-border bg-card"
                }`}
              >
                <div className="p-4">
                  {/* Type + Mode badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isVilla ? "bg-purple-500/10 text-purple-600" : "bg-coral/10 text-coral"
                    }`}>
                      {isVilla ? "🏡" : EVENT_TYPE_EMOJIS[event.event_type]} {isVilla ? "Soirée Villa" : event.event_type}
                    </span>
                    <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                      {DATE_MODE_ICONS[event.date_mode]} {event.date_mode}
                    </span>
                    {event.is_verified_only && (
                      <span className="bg-green-500/10 text-green-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        ✓ Vérifiés
                      </span>
                    )}
                    {event.ticket_price != null && event.ticket_price > 0 && (
                      <span className="bg-amber-500/10 text-amber-600 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Euro className="w-2.5 h-2.5" />{event.ticket_price}
                      </span>
                    )}
                    {event.ticket_price === 0 && isVilla && (
                      <span className="bg-green-500/10 text-green-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        Gratuit
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg leading-tight mb-1">{event.title}</h3>

                  {/* Villa specific: dress code + theme */}
                  {isVilla && (
                    <div className="flex gap-3 mb-2 flex-wrap">
                      {event.dress_code && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Shirt className="w-3 h-3" /> {event.dress_code}
                        </div>
                      )}
                      {event.theme && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Music2 className="w-3 h-3" /> Thème : {event.theme}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amenities chips */}
                  {isVilla && event.amenities && event.amenities.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {event.amenities.slice(0, 4).map((a: string) => (
                        <span key={a} className="text-xs bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                      {event.amenities.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{event.amenities.length - 4}</span>
                      )}
                    </div>
                  )}

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{event.description}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatEventDate(event.date_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.address_hidden ? `${event.city} (adresse masquée 🔒)` : event.city}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Users className="w-3.5 h-3.5" />
                      {event.participant_count ?? 0}/{event.max_participants}
                    </span>
                  </div>

                  {/* Creator */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {creatorPhoto ? (
                        <Image src={creatorPhoto} alt="" width={24} height={24} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Organisé par <strong>{(event.creator as {display_name?: string})?.display_name}</strong>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
