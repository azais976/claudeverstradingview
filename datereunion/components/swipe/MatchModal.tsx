"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { UserProfile } from "@/types";

interface MatchModalProps {
  matchedProfile: UserProfile;
  myProfile: UserProfile;
  conversationId?: string;
  onClose: () => void;
}

export function MatchModal({ matchedProfile, myProfile, conversationId, onClose }: MatchModalProps) {
  const myPhoto = myProfile.photos?.find((p) => p.is_primary)?.url;
  const theirPhoto = matchedProfile.photos?.find((p) => p.is_primary)?.url;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="text-center px-8 max-w-sm w-full"
        >
          {/* Title */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white/70 text-sm font-medium mb-2">C&apos;est un</p>
            <h2 className="text-5xl font-extrabold gradient-text mb-2">MATCH !</h2>
            <p className="text-white/70 text-sm mb-8">
              Toi et {matchedProfile.display_name} vous vous aimez mutuellement 💕
            </p>
          </motion.div>

          {/* Photos */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-28 h-28 rounded-full border-4 border-coral overflow-hidden shadow-xl"
            >
              {myPhoto ? (
                <Image src={myPhoto} alt="Moi" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-coral/30 flex items-center justify-center text-4xl">👤</div>
              )}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
              className="animate-pulse-heart"
            >
              <Heart className="w-10 h-10 text-coral fill-coral" />
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-28 h-28 rounded-full border-4 border-coral overflow-hidden shadow-xl"
            >
              {theirPhoto ? (
                <Image src={theirPhoto} alt={matchedProfile.display_name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-ocean/30 flex items-center justify-center text-4xl">👤</div>
              )}
            </motion.div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {conversationId && (
              <Link
                href={`/messages/${conversationId}`}
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-coral to-volcano text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-coral/30"
              >
                💬 Envoyer un message
              </Link>
            )}
            <button
              onClick={onClose}
              className="w-full py-3.5 border-2 border-white/20 text-white font-semibold rounded-2xl hover:bg-white/10 transition-colors"
            >
              Continuer à swiper
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
