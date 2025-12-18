"use client";

import { useSearchParams } from "next/navigation";
import { VerifyPhoneForm } from "@/components/forms/verify-phone-form";

export default function VerifyPhonePage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  if (!phone) {
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p>No se encontró el número telefónico. Por favor, regístrate nuevamente.</p>
      </div>
    );
  }

  return <VerifyPhoneForm phone={phone} />;
}
