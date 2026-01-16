/**
 * API Route: /api/auth/session/route.ts
 * Devuelve información de la sesión del usuario incluido el campo confirmed
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener datos del usuario desde Strapi
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener usuario' },
        { status: response.status }
      );
    }

    const userData = await response.json();

    // ✅ Devolver token y datos del usuario incluyendo 'confirmed'
    return NextResponse.json({
      token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        confirmed: userData.confirmed, // ✅ Campo de verificación
        credits: userData.credits || 0,
        phone: userData.phone,
      },
    });
  } catch (error) {
    console.error('Error in session route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}