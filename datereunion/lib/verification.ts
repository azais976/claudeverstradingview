/**
 * DateRéunion — Identity Verification & AI Photo Detection
 *
 * Pipeline :
 * 1. L'utilisateur soumet : selfie en direct + photo recto carte d'identité
 * 2. Détection IA sur selfie et photos de profil (via API externe)
 * 3. Comparaison de visage : selfie ↔ photo carte d'identité
 * 4. Si tout OK → statut "approved" → profil marqué vérifié ✓
 *
 * APIs utilisées (configurables via env vars) :
 * - AWS Rekognition (recommandé pour La Réunion / DOM-TOM)
 * - OU Azure Face API
 * - OU Sightengine (détection IA photos)
 */

import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type VerificationStatus =
  | "not_submitted"
  | "pending"
  | "ai_detected"
  | "face_mismatch"
  | "approved"
  | "rejected";

export interface VerificationResult {
  status: VerificationStatus;
  aiScore: number;      // 0 = réelle, 1 = générée par IA
  faceScore: number;    // 0 = pas de correspondance, 1 = identique
  reason?: string;
}

// Seuils de détection
const AI_DETECTION_THRESHOLD  = 0.7;  // >0.7 = photo IA probable
const FACE_MATCH_THRESHOLD     = 0.75; // <0.75 = visages différents

// ─── Sightengine API (AI photo detection) ────────────────────────────────────

/**
 * Détecte si une photo est générée par IA.
 * Utilise Sightengine (sightengine.com) — plan gratuit disponible.
 * Renvoie un score de 0 (réelle) à 1 (IA générée).
 */
export async function detectAIPhoto(imageBase64: string): Promise<number> {
  const apiUser = process.env.NEXT_PUBLIC_SIGHTENGINE_USER;
  const apiSecret = process.env.SIGHTENGINE_SECRET;

  // Si pas configuré, on passe (score 0 = OK)
  if (!apiUser || !apiSecret) {
    console.warn("[Verification] Sightengine not configured — skipping AI detection");
    return 0;
  }

  try {
    // Convert base64 to blob
    const blob = base64ToBlob(imageBase64, "image/jpeg");
    const formData = new FormData();
    formData.append("media", blob, "photo.jpg");
    formData.append("models", "genai");
    formData.append("api_user", apiUser);
    formData.append("api_secret", apiSecret);

    const res = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    // Sightengine returns { type: { ai_generated: 0.95 } }
    return data?.type?.ai_generated ?? 0;
  } catch (err) {
    console.error("[Verification] AI detection error:", err);
    return 0;
  }
}

/**
 * Détecte si une image de profil ressemble à une photo IA
 * (GAN, Midjourney, DALL-E, etc.)
 */
export async function checkProfilePhotosForAI(
  photoUrls: string[]
): Promise<{ url: string; score: number }[]> {
  const results = await Promise.all(
    photoUrls.map(async (url) => {
      try {
        // Fetch image and convert to base64
        const res = await fetch(url);
        const blob = await res.blob();
        const b64 = await blobToBase64(blob);
        const score = await detectAIPhoto(b64);
        return { url, score };
      } catch {
        return { url, score: 0 };
      }
    })
  );
  return results;
}

// ─── AWS Rekognition / Face Comparison ───────────────────────────────────────

/**
 * Compare deux visages via l'API de vérification de DateRéunion.
 * L'API Next.js appelle AWS Rekognition côté serveur (clés secrètes).
 *
 * @param selfieBase64  - Selfie de la personne
 * @param idPhotoBase64 - Photo de la carte d'identité
 * @returns score de similarité 0-1
 */
export async function compareFaces(
  selfieBase64: string,
  idPhotoBase64: string
): Promise<number> {
  try {
    const res = await fetch("/api/verify/compare-faces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selfie: selfieBase64, idPhoto: idPhotoBase64 }),
    });

    if (!res.ok) throw new Error("Face comparison API error");
    const data = await res.json();
    return data.similarity ?? 0; // 0-100 from Rekognition, normalized to 0-1
  } catch (err) {
    console.error("[Verification] Face comparison error:", err);
    return 0;
  }
}

// ─── Main Verification Flow ───────────────────────────────────────────────────

/**
 * Lance le pipeline complet de vérification :
 * 1. Upload selfie + carte ID dans Supabase Storage (buckets privés)
 * 2. Détection IA sur le selfie
 * 3. Comparaison de visage selfie ↔ carte ID
 * 4. Enregistrement du résultat en base
 */
export async function submitVerification(
  profileId: string,
  selfieBase64: string,
  idCardBase64: string
): Promise<VerificationResult> {
  const supabase = createClient();

  // 1. Upload photos in private storage
  const selfieBlob  = base64ToBlob(selfieBase64, "image/jpeg");
  const idCardBlob  = base64ToBlob(idCardBase64, "image/jpeg");

  const selfiePath  = `${profileId}/selfie_${Date.now()}.jpg`;
  const idCardPath  = `${profileId}/id_card_${Date.now()}.jpg`;

  await Promise.all([
    supabase.storage.from("selfies").upload(selfiePath, selfieBlob, { upsert: true }),
    supabase.storage.from("id-verifications").upload(idCardPath, idCardBlob, { upsert: true }),
  ]);

  // 2. AI detection on selfie
  const aiScore = await detectAIPhoto(selfieBase64);

  // 3. Face comparison
  let faceScore = 0;
  let status: VerificationStatus = "pending";
  let reason: string | undefined;

  if (aiScore >= AI_DETECTION_THRESHOLD) {
    status = "ai_detected";
    reason = `Photo potentiellement générée par IA (score: ${Math.round(aiScore * 100)}%)`;
  } else {
    faceScore = await compareFaces(selfieBase64, idCardBase64);

    if (faceScore < FACE_MATCH_THRESHOLD) {
      status = "face_mismatch";
      reason = `Le visage ne correspond pas à la carte d'identité (${Math.round(faceScore * 100)}% de similarité)`;
    } else {
      status = "approved";
    }
  }

  // 4. Save result to database
  await supabase.from("identity_verifications").upsert({
    profile_id:          profileId,
    selfie_path:         selfiePath,
    id_card_path:        idCardPath,
    ai_detection_score:  aiScore,
    face_match_score:    faceScore,
    status,
    rejection_reason:    reason ?? null,
    submitted_at:        new Date().toISOString(),
    reviewed_at:         new Date().toISOString(),
  });

  return { status, aiScore, faceScore, reason };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64.split(",")[1] ?? base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
