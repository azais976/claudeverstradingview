import { VerificationFlow } from "@/components/verification/VerificationFlow";
import { Shield } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-6 h-6 text-coral" />
        <h1 className="text-2xl font-extrabold">Vérification</h1>
      </div>
      <VerificationFlow />
    </div>
  );
}
