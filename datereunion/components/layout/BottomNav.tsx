"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, Calendar, User, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/swipe",   icon: Flame,          label: "Découvrir" },
  { href: "/matches", icon: Heart,          label: "Matches" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/events",  icon: Calendar,       label: "Événements" },
  { href: "/profile", icon: User,           label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all",
                active
                  ? "text-coral scale-110"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn("w-6 h-6", active && "fill-coral stroke-coral")}
                strokeWidth={active ? 0 : 1.8}
              />
              <span className={cn("text-[10px] font-medium", active ? "text-coral" : "")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
