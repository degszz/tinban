'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StrapiUser } from '@/lib/definitions';

interface AuthContextType {
  user: (StrapiUser & { credits?: number }) | null;
  token: string | null;
  setUser: (user: (StrapiUser & { credits?: number }) | null) => void;
  setToken: (token: string | null) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(StrapiUser & { credits?: number }) | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para refrescar datos del usuario
  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
    }
  }, [token]);

  // Obtener token y usuario inicial desde cookies/session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Obtener token desde cookie (necesitas crear un endpoint para esto)
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            setToken(data.token);
            
            // Obtener datos del usuario
            const userResponse = await fetch(
              `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/users/me`,
              {
                headers: {
                  Authorization: `Bearer ${data.token}`,
                },
                cache: 'no-store',
              }
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData);
            }
          }
        }
      } catch (error) {
        console.error('Error al inicializar auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}