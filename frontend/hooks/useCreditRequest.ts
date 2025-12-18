'use client';

import { useState } from 'react';
import { createCreditRequest } from '@/lib/api/creditRequests';

interface UseCreditRequestReturn {
  requestCredits: (amount: number, reason: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useCreditRequest(): UseCreditRequestReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCredits = async (
    amount: number,
    reason: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener token desde cookie mediante API route
      const sessionResponse = await fetch('/api/auth/session', {
        cache: 'no-store',
      });

      if (!sessionResponse.ok) {
        throw new Error('No estás autenticado');
      }

      const { token } = await sessionResponse.json();

      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Crear solicitud
      const response = await createCreditRequest({ amount, reason }, token);

      console.log('✅ Solicitud de créditos creada:', response);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al enviar solicitud';
      setError(errorMessage);
      console.error('❌ Error en useCreditRequest:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestCredits,
    isLoading,
    error,
  };
}