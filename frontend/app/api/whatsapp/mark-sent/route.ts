/**
 * API Route: /api/whatsapp/mark-sent/route.ts
 * Marca que el usuario envió un mensaje de WhatsApp
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/whatsapp-tracking/mark-sent`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al marcar mensaje enviado');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in mark-sent route:', error);
    return NextResponse.json(
      { error: 'Error al marcar mensaje' },
      { status: 500 }
    );
  }
}