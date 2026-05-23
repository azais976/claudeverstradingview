"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Eye, Trash2, LogOut, ChevronRight,
  Moon, Sun, Monitor, Lock, type LucideIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { clearKeyPair } from "@/lib/encryption";
import Link from "next/link";

type SettingItem =
  | { kind: "link";   icon: LucideIcon; label: string; desc: string; href: string; badge?: string; badgeColor?: string }
  | { kind: "toggle"; icon: LucideIcon; label: string; desc: string; key: string; value: boolean | undefined }
  | { kind: "badge";  icon: LucideIcon; label: string; desc: string; badge: string; badgeColor: string }
  | { kind: "custom"; icon: LucideIcon; label: string; custom: React.ReactNode };

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { signOut, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      toast.warning("Clique encore pour confirmer la suppression définitive.");
      return;
    }
    try {
      await supabase.from("profiles").delete().eq("id", profile!.id);
      await clearKeyPair();
      await supabase.auth.signOut();
      router.push("/");
      toast.success("Compte supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({ [key]: value }).eq("id", profile.id);
    if (error) toast.error("Erreur de mise à jour");
    else toast.success("Préférences mises à jour");
  };

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: "Compte",
      items: [
        {
          kind: "link",
          icon: Shield,
          label: "Vérification d'identité",
          desc: profile?.is_verified ? "Compte vérifié ✓" : "Vérifier mon compte",
          href: "/verify",
          badge: profile?.is_verified ? "Vérifié" : "Non vérifié",
          badgeColor: profile?.is_verified ? "text-green-600 bg-green-500/10" : "text-orange-500 bg-orange-500/10",
        },
      ],
    },
    {
      title: "Confidentialité",
      items: [
        { kind: "toggle", icon: Eye, label: "Afficher ma distance", desc: "Les autres voient à quelle distance tu es", key: "show_distance", value: profile?.show_distance },
        { kind: "toggle", icon: Eye, label: "Afficher mon âge", desc: "Ton âge est visible sur ton profil", key: "show_age", value: profile?.show_age },
        { kind: "toggle", icon: Eye, label: "Afficher si en ligne", desc: "Les autres voient quand tu es actif", key: "show_online", value: profile?.show_online },
      ],
    },
    {
      title: "Sécurité",
      items: [
        { kind: "badge", icon: Lock, label: "Chiffrement E2EE", desc: "Tes messages sont chiffrés localement", badge: "Activé", badgeColor: "text-green-600 bg-green-500/10" },
      ],
    },
    {
      title: "Apparence",
      items: [
        {
          kind: "custom",
          icon: Monitor,
          label: "Thème",
          custom: (
            <div className="flex gap-2">
              {(["system", "light", "dark"] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)} className={`p-2 rounded-lg transition-all ${theme === t ? "bg-foreground text-background" : "bg-muted hover:bg-muted/80"}`}>
                  {t === "light" ? <Sun className="w-4 h-4" /> : t === "dark" ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="px-4 py-6 pb-10">
      <h1 className="text-2xl font-extrabold mb-6">Paramètres</h1>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{section.title}</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {section.items.map((item, idx) => (
                <div key={idx} className="px-4 py-3.5">
                  {item.kind === "link" ? (
                    <Link href={item.href} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      {item.badge && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ) : item.kind === "toggle" ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <button onClick={() => handleToggle(item.key, !item.value)} className={`w-12 h-6 rounded-full transition-all ${item.value ? "bg-coral" : "bg-muted"} relative`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${item.value ? "left-7" : "left-1"}`} />
                      </button>
                    </div>
                  ) : item.kind === "badge" ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">{item.label}</p>
                        {item.custom}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone */}
        <div>
          <h2 className="text-xs font-bold text-destructive uppercase tracking-wider mb-2 px-1">Zone dangereuse</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left">
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Se déconnecter</p>
                <p className="text-xs text-muted-foreground">Ferme ta session</p>
              </div>
            </button>
            <button onClick={handleDeleteAccount} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-destructive/5 transition-colors text-left">
              <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-destructive">
                  {deleteConfirm ? "⚠️ Confirmer la suppression" : "Supprimer mon compte"}
                </p>
                <p className="text-xs text-muted-foreground">Action irréversible · Toutes tes données seront effacées</p>
              </div>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">DateRéunion v0.1.0 · Made with ❤️ à La Réunion 🇷🇪</p>
      </div>
    </div>
  );
}
