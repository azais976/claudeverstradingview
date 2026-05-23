"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { MapPin, Star, Users, ChevronDown, ChevronUp } from "lucide-react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { cn, getAge, DATE_MODE_ICONS } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface SwipeCardProps {
  profile: UserProfile;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isTop?: boolean;
}

const SWIPE_THRESHOLD = 100;

export function SwipeCard({ profile, onSwipe, isTop = false }: SwipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const superLikeOpacity = useTransform(y, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const primaryPhoto = profile.photos?.find((p) => p.is_primary) ?? profile.photos?.[0];
  const photos = profile.photos ?? [];
  const age = getAge(profile.birth_date);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;

    if (offset.y < -SWIPE_THRESHOLD && Math.abs(offset.x) < 80) {
      onSwipe("up"); // Super like
    } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      onSwipe("right"); // Like
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      onSwipe("left"); // Dislike
    }
  };

  const cardVariants = {
    default: { scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 },
    dragging: { scale: 1.02 },
  };

  return (
    <motion.div
      ref={cardRef}
      className="swipe-card absolute inset-0 shadow-2xl"
      style={{ x, y, rotate, zIndex: isTop ? 10 : 5 }}
      variants={cardVariants}
      initial="default"
      whileDrag="dragging"
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
    >
      {/* Photo */}
      <div className="relative w-full h-full">
        {primaryPhoto ? (
          <Image
            src={photos[photoIndex]?.url ?? primaryPhoto.url}
            alt={profile.display_name}
            fill
            className="object-cover"
            priority={isTop}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-coral/30 to-ocean/30 flex items-center justify-center">
            <div className="text-8xl">👤</div>
          </div>
        )}

        {/* Photo indicators */}
        {photos.length > 1 && (
          <div className="absolute top-3 inset-x-3 flex gap-1 z-20">
            {photos.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-1 rounded-full transition-all",
                  i === photoIndex ? "bg-white" : "bg-white/40"
                )}
              />
            ))}
          </div>
        )}

        {/* Photo tap zones */}
        <div className="absolute inset-0 flex z-10">
          <div
            className="w-1/3 h-full"
            onClick={() => setPhotoIndex((p) => Math.max(0, p - 1))}
          />
          <div className="flex-1" />
          <div
            className="w-1/3 h-full"
            onClick={() => setPhotoIndex((p) => Math.min(photos.length - 1, p + 1))}
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        {/* LIKE / NOPE / SUPER indicators */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-12 left-6 z-30 border-4 border-green-400 text-green-400 rounded-xl px-4 py-2 font-black text-3xl rotate-[-20deg]"
            >
              LIKE ❤️
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-12 right-6 z-30 border-4 border-red-400 text-red-400 rounded-xl px-4 py-2 font-black text-3xl rotate-[20deg]"
            >
              NOPE ✗
            </motion.div>
            <motion.div
              style={{ opacity: superLikeOpacity }}
              className="absolute top-12 left-1/2 -translate-x-1/2 z-30 border-4 border-blue-400 text-blue-400 rounded-xl px-4 py-2 font-black text-2xl"
            >
              SUPER ⭐
            </motion.div>
          </>
        )}

        {/* Profile info */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-5">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <h2 className="text-white font-bold text-2xl leading-tight">
                {profile.display_name}, {age}
              </h2>
              {profile.show_distance && (
                <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.city}</span>
                </div>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                {profile.date_modes?.slice(0, 3).map((mode) => (
                  <span
                    key={mode}
                    className="bg-white/20 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    {DATE_MODE_ICONS[mode]} {mode}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
              className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white ml-3"
            >
              {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>

          {/* Expanded info */}
          {expanded && (
            <div className="mt-4 space-y-3 bg-black/40 backdrop-blur rounded-2xl p-4">
              {profile.bio && (
                <p className="text-white/90 text-sm leading-relaxed">{profile.bio}</p>
              )}
              {profile.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.slice(0, 6).map((interest) => (
                    <span key={interest} className="bg-white/15 text-white text-xs px-2.5 py-1 rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
              {profile.cultural_origin && (
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <Users className="w-3.5 h-3.5" />
                  <span>{profile.cultural_origin}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
