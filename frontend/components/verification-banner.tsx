"use client";

import { useState, useEffect } from "react";
import { AlertCircle, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VerificationBannerProps {
  isConfirmed: boolean;
  userName?: string;
}

const WHATSAPP_NUMBER = "5491130744578"; // Tu número de WhatsApp
const WAIT_HOURS = 3;

export function VerificationBanner({ isConfirmed, userName }: VerificationBannerProps) {
  const [canSendWhatsApp, setCanSendWhatsApp] = useState(true);
  const [waitTime, setWaitTime] = useState(0);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!isConfirmed) {
      checkWhatsAppStatus();
      
      // Actualizar cada minuto
      const interval = setInterval(checkWhatsAppStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [isConfirmed]);

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/can-send', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCanSendWhatsApp(data.canSend);
        setWaitTime(data.waitTime || 0);
        if (data.lastSentAt) {
          setLastSentAt(new Date(data.lastSentAt));
        }
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    }
  };

  const handleWhatsAppClick = async () => {
    const message = encodeURIComponent(
      `Hola, soy ${userName || 'un usuario'}. Me registré en la plataforma y necesito verificación de mi cuenta para poder solicitar créditos y participar en las subastas. ¡Gracias!`
    );
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');

    // Marcar como enviado
    try {
      await fetch('/api/whatsapp/mark-sent', {
        method: 'POST',
        credentials: 'include',
      });
      
      setCanSendWhatsApp(false);
      setWaitTime(WAIT_HOURS * 60);
      setLastSentAt(new Date());
    } catch (error) {
      console.error('Error marking WhatsApp sent:', error);
    }
  };

  // Si está confirmado, no mostrar banner
  if (isConfirmed) {
    return null;
  }

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Alert className="border-yellow-400 bg-yellow-50 mb-6">
      <AlertCircle className="h-5 w-5 text-yellow-600" />
      <AlertTitle className="text-yellow-900 font-bold text-lg">
        Cuenta no verificada
      </AlertTitle>
      <AlertDescription className="text-yellow-800 space-y-3">
        <p>
          Para solicitar créditos y participar en subastas, primero debes verificar tu cuenta con WhatsApp.
          <strong> El administrador revisará tu solicitud.</strong>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {canSendWhatsApp ? (
            <Button
              onClick={handleWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Verificar ahora
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-sm bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-3">
              <Clock className="h-5 w-5 text-yellow-700 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">
                  Mensaje enviado
                </p>
                <p className="text-yellow-700">
                  Podrás enviar otro mensaje en: <strong>{formatWaitTime(waitTime)}</strong>
                </p>
                {lastSentAt && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Último envío: {lastSentAt.toLocaleString('es-AR')}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 rounded-lg px-4 py-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>
              <strong>Estado:</strong> Pendiente de confirmación
            </span>
          </div>
        </div>

        <div className="mt-4 text-sm text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3">
          <p className="font-semibold mb-1">💡 ¿Qué sucede ahora?</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Tu cuenta está registrada pero inactiva</li>
            <li>Contacta al administrador por WhatsApp</li>
            <li>Espera la verificación (puede tomar algunas horas)</li>
            <li>Recibirás acceso completo una vez confirmado</li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}