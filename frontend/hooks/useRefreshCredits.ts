'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export function useRefreshCredits() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshCredits = async (): Promise<number | null> => {
    setIsRefreshing(true);

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
        throw new Error('No se encontró token');
      }

      // Obtener datos actualizados del usuario
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos del usuario');
      }

      const userData = await response.json();
      const newCredits = userData.credits || 0;

      // Emitir evento personalizado para actualizar UI
      window.dispatchEvent(
        new CustomEvent('creditsUpdated', {
          detail: { credits: newCredits },
        })
      );

      console.log('✅ Créditos actualizados:', newCredits);
      return newCredits;
    } catch (error) {
      console.error('❌ Error al refrescar créditos:', error);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    refreshCredits,
    isRefreshing,
  };
}