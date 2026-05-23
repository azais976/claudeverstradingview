"use client";

import Image from "next/image";
import Link from "next/link";
import { Settings, Edit3, Shield, CheckCircle, MapPin, Camera } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getAge, DATE_MODE_LABELS, DATE_MODE_ICONS } from "@/lib/utils";

export default function ProfilePage() {
  const { profile } = useAuthStore();
  if (!profile) return null;

  const primaryPhoto = profile.photos?.find((p) => p.is_primary)?.url ?? profile.photos?.[0]?.url;
  const age = getAge(profile.birth_date);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-extrabold">Mon profil</h1>
        <div className="flex gap-2">
          <Link href="/profile/edit" className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80">
            <Edit3 className="w-4 h-4" />
          </Link>
          <Link href="/settings" className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80">
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Cover + Avatar */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-coral/30 via-volcano/20 to-ocean/30" />
        <div className="absolute -bottom-12 left-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-background bg-muted shadow-xl">
            {primaryPhoto
              ? <Image src={primaryPhoto} alt={profile.display_name} fill className="object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-coral/20 to-ocean/20 flex items-center justify-center text-4xl">👤</div>
            }
          </div>
        </div>
      </div>

      <div className="mt-16 px-4 space-y-5">
        {/* Name + verification */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold">{profile.display_name}, {age}</h2>
            {profile.is_verified && (
              <div className="flex items-center gap-1 bg-green-500/10 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Vérifié
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{profile.city}{profile.neighborhood ? ` · ${profile.neighborhood}` : ""}</span>
          </div>
        </div>

        {/* Verification CTA */}
        {!profile.is_verified && (
          <Link
            href="/verify"
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-coral/10 to-volcano/10 border border-coral/20 hover:border-coral/40 transition-colors"
          >
            <Shield className="w-8 h-8 text-coral flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Vérifier mon identité</p>
              <p className="text-xs text-muted-foreground">Accède aux soirées privées et affiche le badge vérifié</p>
            </div>
            <span className="text-coral text-lg">→</span>
          </Link>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Bio</h3>
            <p className="text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Date modes */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Je recherche</h3>
          <div className="flex flex-wrap gap-2">
            {profile.date_modes?.map((mode) => (
              <div key={mode} className="flex items-center gap-1.5 bg-coral/10 text-coral text-sm font-medium px-3 py-1.5 rounded-full">
                <span>{DATE_MODE_ICONS[mode]}</span>
                <span>{DATE_MODE_LABELS[mode]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Centres d&apos;intérêt</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="text-sm bg-muted px-3 py-1.5 rounded-full">{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Photos grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Photos ({profile.photos?.length ?? 0}/8)
            </h3>
            <Link href="/profile/edit" className="flex items-center gap-1 text-xs text-coral">
              <Camera className="w-3 h-3" /> Modifier
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {profile.photos?.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-muted relative">
                <Image src={photo.url} alt="" fill className="object-cover" />
                {photo.is_primary && (
                  <div className="absolute top-1.5 left-1.5 bg-coral text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    Principale
                  </div>
                )}
              </div>
            ))}
            {/* Add photo slot */}
            {(profile.photos?.length ?? 0) < 8 && (
              <Link href="/profile/edit" className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-coral transition-colors">
                <Camera className="w-6 h-6 text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
