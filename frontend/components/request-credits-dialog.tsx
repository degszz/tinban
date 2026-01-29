"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { requestCredits } from "@/lib/services/credits-service";

const WHATSAPP_NUMBER = "5491130744578";

interface RequestCreditsDialogProps {
  disabled?: boolean;
  disabledReason?: string;
}

export function RequestCreditsDialog({ 
  disabled = false, 
  disabledReason 
}: RequestCreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(true);

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
    }
  };

  const handleRequestCredits = async () => {
    // Verificar confirmación antes de proceder
    if (!isConfirmed) {
      setError("Tu cuenta aún no ha sido verificada. Por favor, contacta al administrador.");
      return;
    }

    if (!amount || parseInt(amount) <= 0) {
      setError("Ingresa un monto válido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await requestCredits(parseInt(amount), reason);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setAmount("");
          setReason("");
        }, 2000);
      } else {
        // Manejar error de verificación
        if (result.error?.includes('verificada') || result.error?.includes('confirmed')) {
          setError("Tu cuenta no está verificada. Contacta al administrador por WhatsApp.");
          setIsConfirmed(false);
        } else {
          setError(result.error || "Error al solicitar créditos");
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al solicitar créditos");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRequest = () => {
    const message = `Hola, quisiera solicitar ${amount} créditos para subastas.${reason ? ` Motivo: ${reason}` : ''}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setOpen(false);
    setAmount("");
    setReason("");
  };

  // Si está deshabilitado por falta de confirmación
  if (disabled || !isConfirmed) {
    return (
      <div className="relative group">
        <Button 
          className="w-full sm:w-auto" 
          size="lg"
          disabled
        >
          <CreditCard className="h-5 w-5 mr-2" />
          🔒 Solicitar Créditos
        </Button>
        {disabledReason && (
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              {disabledReason}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full sm:w-auto hover:cursor-pointer hover:scale-110 transition-all duration-200" size="lg">
          <CreditCard className="h-5 w-5 mr-2" />
          Solicitar Créditos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Solicitar Créditos
          </AlertDialogTitle>
          <AlertDialogDescription>
            Completa el formulario para solicitar créditos. El administrador revisará tu solicitud.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto de Créditos</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                min="1"
                disabled={loading}
              />
            </div>
          </div>

          {/* Motivo (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Explica por qué necesitas estos créditos..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3">
              <p className="text-sm font-medium">¡Solicitud enviada con éxito!</p>
            </div>
          )}

          {/* Advertencia si no está confirmado */}
          {!isConfirmed && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3">
              <p className="text-sm font-medium">
                ⚠️ Tu cuenta no está verificada. Contacta al administrador.
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          
          <Button
            onClick={handleWhatsAppRequest}
            variant="outline"
            disabled={loading || !amount || parseInt(amount) <= 0}
            className="w-full sm:w-auto"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>

          <Button
            onClick={handleRequestCredits}
            disabled={loading || !amount || parseInt(amount) <= 0 || !isConfirmed}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Solicitud"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}