"use client";

import { useActionState, useState, useEffect } from "react";
import { placeBidAction } from "@/lib/actions/bid-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BidFormProps {
  auctionId: string;
  auctionTitle: string;
  currentHighestBid?: number;
  minBidIncrement?: number;
}

export function BidForm({
  auctionId,
  auctionTitle,
  currentHighestBid = 0,
  minBidIncrement = 10,
}: BidFormProps) {
  const [amount, setAmount] = useState("");
  const minBid = currentHighestBid + minBidIncrement;

  const placeBid = placeBidAction.bind(null, auctionId, auctionTitle);
  const [state, formAction, pending] = useActionState(placeBid, {});

  useEffect(() => {
    if (state.success) {
      setAmount("");
      // Opcional: Mostrar notificación de éxito
      alert("¡Puja realizada con éxito!");
    }
  }, [state.success]);

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
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
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
