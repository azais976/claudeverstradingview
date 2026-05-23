"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, CreditCard, CheckCircle, XCircle, Loader2, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { submitVerification, type VerificationResult } from "@/lib/verification";
import { useAuthStore } from "@/store/authStore";

type FlowStep = "intro" | "selfie" | "id_card" | "processing" | "result";

interface Props {
  onComplete?: (result: VerificationResult) => void;
}

export function VerificationFlow({ onComplete }: Props) {
  const { profile } = useAuthStore();
  const [step, setStep] = useState<FlowStep>("intro");
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [idCardData, setIdCardData] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = useCallback(async (facingMode: "user" | "environment" = "user") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      toast.error("Impossible d'accéder à la caméra. Vérifie les permissions.");
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback((): string | null => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.85);
  }, []);

  // Handle file upload fallback
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (data: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 5 Mo)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Submit for analysis
  const handleSubmit = async () => {
    if (!profile || !selfieData || !idCardData) return;
    setStep("processing");

    try {
      const res = await submitVerification(profile.id, selfieData, idCardData);
      setResult(res);
      setStep("result");
      onComplete?.(res);
    } catch {
      toast.error("Erreur lors de la vérification. Réessaie.");
      setStep("id_card");
    }
  };

  // ── INTRO ──
  if (step === "intro") return (
    <div className="space-y-6 text-center px-4 py-8">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-volcano mx-auto flex items-center justify-center shadow-lg">
        <Shield className="w-10 h-10 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold mb-2">Vérification d&apos;identité</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          Pour rejoindre des soirées et révéler les adresses, nous vérifions que tu es bien une vraie personne
          grâce à un selfie + ta carte d&apos;identité.
        </p>
      </div>

      <div className="space-y-3 text-left max-w-sm mx-auto">
        {[
          { icon: "📸", title: "Selfie en direct", desc: "Une photo de ton visage face caméra" },
          { icon: "🪪", title: "Carte d'identité", desc: "Recto de ta carte nationale ou passeport" },
          { icon: "🤖", title: "Détection IA", desc: "On vérifie que ta photo n'est pas générée par IA" },
          { icon: "✅", title: "Comparaison faciale", desc: "On s'assure que tu es bien la personne sur le document" },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/60">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm text-blue-600 dark:text-blue-400 text-left">
        🔒 <strong>Confidentialité :</strong> Tes documents ne sont jamais partagés avec d&apos;autres utilisateurs.
        Ils sont stockés chiffrés et supprimés après vérification.
      </div>

      <button
        onClick={() => setStep("selfie")}
        className="w-full py-4 bg-gradient-to-r from-coral to-volcano text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
      >
        Commencer la vérification
      </button>
    </div>
  );

  // ── SELFIE ──
  if (step === "selfie") return (
    <div className="space-y-4 px-4 py-6">
      <div className="flex items-center gap-3 mb-2">
        <Camera className="w-5 h-5 text-coral" />
        <h2 className="text-xl font-bold">Selfie en direct</h2>
        <span className="ml-auto text-sm text-muted-foreground">1/2</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Prends une photo de ton visage face à la caméra, dans un endroit bien éclairé.
      </p>

      {/* Camera preview */}
      <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3]">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {!cameraActive && !selfieData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Camera className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Caméra désactivée</p>
          </div>
        )}
        {selfieData && (
          <img src={selfieData} alt="Selfie" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Face guide overlay */}
        {cameraActive && !selfieData && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-60 border-4 border-white/60 rounded-full" />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!cameraActive && !selfieData && (
          <button onClick={() => startCamera("user")} className="flex-1 py-3 bg-muted rounded-xl font-medium text-sm hover:bg-muted/80 flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" /> Ouvrir la caméra
          </button>
        )}
        {cameraActive && !selfieData && (
          <>
            <button onClick={stopCamera} className="px-4 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted">
              Annuler
            </button>
            <button
              onClick={() => {
                const photo = capturePhoto();
                if (photo) { setSelfieData(photo); stopCamera(); }
              }}
              className="flex-1 py-3 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl hover:opacity-90"
            >
              📸 Prendre la photo
            </button>
          </>
        )}
        {selfieData && (
          <>
            <button onClick={() => { setSelfieData(null); startCamera("user"); }} className="px-4 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted">
              Refaire
            </button>
            <button onClick={() => setStep("id_card")} className="flex-1 py-3 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl hover:opacity-90">
              Continuer →
            </button>
          </>
        )}
      </div>

      {/* File upload fallback */}
      {!cameraActive && !selfieData && (
        <div className="text-center">
          <label className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            Ou <span className="text-coral underline">importer depuis la galerie</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setSelfieData)} />
          </label>
        </div>
      )}
    </div>
  );

  // ── ID CARD ──
  if (step === "id_card") return (
    <div className="space-y-4 px-4 py-6">
      <div className="flex items-center gap-3 mb-2">
        <CreditCard className="w-5 h-5 text-coral" />
        <h2 className="text-xl font-bold">Carte d&apos;identité</h2>
        <span className="ml-auto text-sm text-muted-foreground">2/2</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Prends une photo du <strong>recto</strong> de ta carte nationale d&apos;identité ou passeport.
        La photo de ton visage doit être visible et nette.
      </p>

      <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[16/10]">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        {!cameraActive && !idCardData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <CreditCard className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Photo du document</p>
          </div>
        )}
        {idCardData && (
          <img src={idCardData} alt="Carte ID" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {cameraActive && !idCardData && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-2/3 border-4 border-white/60 rounded-xl" />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!cameraActive && !idCardData && (
          <button onClick={() => startCamera("environment")} className="flex-1 py-3 bg-muted rounded-xl font-medium text-sm hover:bg-muted/80 flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" /> Prendre en photo
          </button>
        )}
        {cameraActive && !idCardData && (
          <>
            <button onClick={stopCamera} className="px-4 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted">Annuler</button>
            <button
              onClick={() => { const p = capturePhoto(); if (p) { setIdCardData(p); stopCamera(); }}}
              className="flex-1 py-3 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl"
            >
              📸 Capturer
            </button>
          </>
        )}
        {idCardData && (
          <>
            <button onClick={() => { setIdCardData(null); startCamera("environment"); }} className="px-4 py-3 border border-border rounded-xl text-sm font-medium">Refaire</button>
            <button onClick={handleSubmit} className="flex-1 py-3 bg-gradient-to-r from-coral to-volcano text-white font-semibold rounded-xl">
              Vérifier mon identité ✓
            </button>
          </>
        )}
      </div>

      {!cameraActive && !idCardData && (
        <div className="text-center">
          <label className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            Ou <span className="text-coral underline">importer depuis la galerie</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setIdCardData)} />
          </label>
        </div>
      )}
    </div>
  );

  // ── PROCESSING ──
  if (step === "processing") return (
    <div className="py-20 text-center space-y-6 px-8">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-full bg-coral/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-coral to-volcano flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Analyse en cours…</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>🤖 Détection de photo IA…</p>
          <p>👤 Comparaison de visage…</p>
          <p>✅ Validation du document…</p>
        </div>
      </div>
    </div>
  );

  // ── RESULT ──
  if (step === "result" && result) return (
    <div className="py-12 text-center space-y-6 px-8">
      {result.status === "approved" ? (
        <>
          <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold mb-2">Identité vérifiée ! ✓</h3>
            <p className="text-muted-foreground text-sm">
              Ton profil affiche maintenant le badge <strong className="text-green-500">Vérifié</strong>.
              Tu peux rejoindre les soirées privées et accéder aux adresses.
            </p>
          </div>
        </>
      ) : result.status === "ai_detected" ? (
        <>
          <div className="w-20 h-20 rounded-full bg-red-500/20 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold mb-2">Photo non conforme</h3>
            <p className="text-muted-foreground text-sm">{result.reason}</p>
            <p className="text-sm mt-2">Utilise une vraie photo prise en direct.</p>
          </div>
          <button onClick={() => { setStep("selfie"); setSelfieData(null); }} className="w-full py-3 bg-muted rounded-xl font-medium">
            Réessayer
          </button>
        </>
      ) : result.status === "face_mismatch" ? (
        <>
          <div className="w-20 h-20 rounded-full bg-orange-500/20 mx-auto flex items-center justify-center">
            <XCircle className="w-10 h-10 text-orange-500" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold mb-2">Visages différents</h3>
            <p className="text-muted-foreground text-sm">{result.reason}</p>
          </div>
          <button onClick={() => { setStep("selfie"); setSelfieData(null); setIdCardData(null); }} className="w-full py-3 bg-muted rounded-xl font-medium">
            Recommencer
          </button>
        </>
      ) : (
        <>
          <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
            <XCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">Vérification échouée</h3>
          <p className="text-muted-foreground text-sm">{result.reason ?? "Une erreur est survenue."}</p>
          <button onClick={() => setStep("intro")} className="w-full py-3 bg-muted rounded-xl font-medium">Réessayer</button>
        </>
      )}
    </div>
  );

  return null;
}
