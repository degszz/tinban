"use client";

import { useActionState, useState, useEffect } from "react";
import { placeBidAction } from "@/lib/actions/bid-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock } from "lucide-react";

interface BidFormState {
  success?: boolean;
  error?: string;
}

interface BidFormProps {
  auctionId: string;
  auctionTitle: string;
  currentHighestBid?: number;
  minBidIncrement?: number;
  userConfirmed?: boolean; // ✅ NUEVO: Verificación del usuario
}

export function BidForm({
  auctionId,
  auctionTitle,
  currentHighestBid = 0,
  minBidIncrement = 10,
  userConfirmed = false, // ✅ Por defecto false
}: BidFormProps) {
  const [amount, setAmount] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(userConfirmed);
  const minBid = currentHighestBid + minBidIncrement;

  // Verificar confirmación del usuario
  useEffect(() => {
    checkUserConfirmation();
  }, []);

  const checkUserConfirmation = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setIsConfirmed(data.user?.confirmed === true);
      }
    } catch (error) {
      console.error('Error checking confirmation:', error);
      setIsConfirmed(false);
    }
  };

  const placeBid = placeBidAction.bind(null, auctionId, auctionTitle);
  const [state, formAction, pending] = useActionState(
    async (prevState: BidFormState, formData: FormData) => {
      // ✅ Verificar confirmación antes de enviar
      if (!isConfirmed) {
        return {
          error: "Tu cuenta no está verificada. Contacta al administrador para verificar tu cuenta."
        };
      }
      return placeBid(formData);
    },
    {}
  );

  useEffect(() => {
    if (state.success) {
      setAmount("");
      alert("¡Puja realizada con éxito!");
    }
  }, [state.success]);

  // 🔒 Si no está confirmado, mostrar formulario bloqueado
  if (!isConfirmed) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Realizar Puja
        </h3>

        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
          <Lock className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-yellow-900 mb-2">
            Cuenta no verificada
          </h4>
          <p className="text-sm text-yellow-800 mb-4">
            Para pujar en subastas necesitas que tu cuenta sea verificada por el administrador.
          </p>
          <div className="bg-yellow-100 border border-yellow-300 rounded p-3 text-xs text-yellow-700">
            <p className="font-semibold mb-1">¿Cómo verificar tu cuenta?</p>
            <ol className="list-decimal list-inside text-left space-y-1">
              <li>Ve a tu Dashboard</li>
              <li>Haz clic en "Verificar ahora"</li>
              <li>Envía un mensaje por WhatsApp</li>
              <li>Espera la confirmación del administrador</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Formulario normal para usuarios verificados
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Realizar Puja
      </h3>

      {currentHighestBid > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Puja actual más alta:
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${currentHighestBid.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tu puja debe ser al menos ${minBid.toFixed(2)}
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="amount">Monto de tu Puja</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min={minBid}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Mínimo: ${minBid.toFixed(2)}`}
              className="pl-7"
              required
              disabled={pending}
            />
          </div>
        </div>

        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{state.error}</p>
          </div>
        )}

        {state.success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3">
            <p className="text-sm font-medium">¡Puja realizada con éxito!</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Procesando..." : "Pujar Ahora"}
        </Button>
      </form>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          • Las pujas son vinculantes
          <br />
          • Recibirás una notificación si eres superado
          <br />• El ganador será contactado al finalizar el remate
        </p>
      </div>
    </div>
  );
}