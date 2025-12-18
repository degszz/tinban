'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCreditRequest } from '@/hooks/useCreditRequest';
import { useRefreshCredits } from '@/hooks/useRefreshCredits';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreditRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsappNumber?: string;
}

export function CreditRequestModal({
  open,
  onOpenChange,
  whatsappNumber = '91130744578'
}: CreditRequestModalProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [showWhatsAppOption, setShowWhatsAppOption] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { requestCredits, isLoading, error } = useCreditRequest();
  const { refreshCredits } = useRefreshCredits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const amountNum = parseFloat(amount);

    // Validaciones
    if (isNaN(amountNum) || amountNum <= 0) {
      setValidationError('El monto debe ser mayor a 0');
      return;
    }

    if (reason.trim().length < 10) {
      setValidationError('La razón debe tener al menos 10 caracteres');
      return;
    }

    const success = await requestCredits(amountNum, reason);

    if (success) {
      setShowWhatsAppOption(true);
      await refreshCredits();
    }
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola, acabo de enviar una solicitud de ${amount} créditos. Razón: ${reason}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    handleClose();
  };

  const handleClose = () => {
    setShowWhatsAppOption(false);
    setAmount('');
    setReason('');
    setValidationError('');
    onOpenChange(false);
  };

  // Modal de confirmación WhatsApp
  if (showWhatsAppOption) {
    return (
      <AlertDialog open={open} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <AlertDialogTitle>¡Solicitud Enviada!</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3">
              <p>
                Tu solicitud de <strong>{amount} créditos</strong> ha sido enviada exitosamente.
                Será revisada por un administrador.
              </p>
              <p className="text-sm">
                ¿Deseas contactarnos por WhatsApp para agilizar el proceso?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>
              No, gracias
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleOpenWhatsApp} className="bg-green-600 hover:bg-green-700">
              Abrir WhatsApp
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Modal principal de solicitud
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Solicitar Créditos</AlertDialogTitle>
            <AlertDialogDescription>
              Completa el formulario para solicitar créditos adicionales. Tu
              solicitud será revisada por un administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            {/* Error de validación */}
            {(validationError || error) && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  {validationError || error}
                </p>
              </div>
            )}

            {/* Campo de cantidad */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Cantidad de créditos *</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                placeholder="Ej: 100"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setValidationError('');
                }}
                required
                disabled={isLoading}
              />
            </div>

            {/* Campo de razón */}
            <div className="grid gap-2">
              <Label htmlFor="reason">Razón de la solicitud *</Label>
              <Textarea
                id="reason"
                placeholder="Explica por qué necesitas estos créditos (mínimo 10 caracteres)"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setValidationError('');
                }}
                required
                minLength={10}
                rows={4}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {reason.length}/10 caracteres mínimo
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancelar
            </AlertDialogCancel>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Solicitud
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}