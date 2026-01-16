/**
 * API Route: /api/whatsapp/can-send/route.ts
 * Verifica si el usuario puede enviar mensaje de WhatsApp
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/whatsapp-tracking/can-send`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al verificar estado de WhatsApp');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in can-send route:', error);
    return NextResponse.json(
      { error: 'Error al verificar estado' },
      { status: 500 }
    );
  }
}

