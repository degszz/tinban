// frontend/app/api/admin/live-stream-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// GET - Obtener configuración actual
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/home-page`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Error al obtener configuración');
    }

    const data = await response.json();
    
    return NextResponse.json({
      activeAuctionId: data.data?.activeAuctionId || '',
      youtubeLiveUrl: data.data?.youtubeLiveUrl || '',
      liveStreamActive: data.data?.liveStreamActive || false,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

// POST - Actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { activeAuctionId } = body;

    // Actualizar en Strapi
    const response = await fetch(`${STRAPI_URL}/api/home-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          activeAuctionId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar configuración');
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    );
  }
}