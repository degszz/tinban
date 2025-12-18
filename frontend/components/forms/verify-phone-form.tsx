"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyOTPAction, resendOTPAction } from "@/lib/actions/auth-actions";

interface VerifyPhoneFormProps {
  phone: string;
}

export function VerifyPhoneForm({ phone }: VerifyPhoneFormProps) {
  const router = useRouter();
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("otpCode", otpCode);

    const result = await verifyOTPAction({}, formData);

    if (result.errors || result.message) {
      setError(result.message || "Error al verificar código");
      setLoading(false);
    }
    // Si no hay error, la acción redirige automáticamente
  };

  const handleResend = async () => {
    setError("");
    setSuccessMessage("");
    setResending(true);

    const formData = new FormData();
    formData.append("phone", phone);

    const result = await resendOTPAction({}, formData);

    if (result.errors || result.message) {
      setError(result.message || "Error al reenviar código");
    } else {
      setSuccessMessage("Código reenviado exitosamente");
    }

    setResending(false);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Verificar Teléfono</h2>
        <p className="text-muted-foreground mt-2">
          Ingresa el código de 6 dígitos enviado a
        </p>
        <p className="font-semibold mt-1">{phone}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="otpCode">Código de Verificación</Label>
          <Input
            id="otpCode"
            name="otpCode"
            type="text"
            placeholder="123456"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            required
            disabled={loading}
            className="text-center text-2xl tracking-widest"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading || otpCode.length !== 6}>
          {loading ? "Verificando..." : "Verificar"}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">¿No recibiste el código?</p>
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resending}
          className="w-full"
        >
          {resending ? "Reenviando..." : "Reenviar código"}
        </Button>
      </div>
    </div>
  );
}
