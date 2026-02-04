import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// GET - Obtener configuracion del live stream (desde content-type separado)
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/live-stream-config`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Error al obtener configuracion');
    }

    const data = await response.json();

    return NextResponse.json({
      liveStreamActive: data.data?.liveStreamActive || false,
      youtubeLiveUrl: data.data?.youtubeLiveUrl || '',
      activeAuctionId: data.data?.activeAuctionId || '',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuracion' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuracion del live stream (en content-type separado)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Use STRAPI_API_TOKEN if available, fallback to user JWT
    const authToken = STRAPI_API_TOKEN || token;
    const authHeader = `Bearer ${authToken}`;

    const body = await request.json();
    const { liveStreamActive, youtubeLiveUrl, activeAuctionId } = body;

    // Construir objeto de datos solo con campos que vienen en la request
    const updateData: Record<string, any> = {};
    if (liveStreamActive !== undefined) updateData.liveStreamActive = liveStreamActive;
    if (youtubeLiveUrl !== undefined) updateData.youtubeLiveUrl = youtubeLiveUrl;
    if (activeAuctionId !== undefined) updateData.activeAuctionId = activeAuctionId;

    // Actualizar en Strapi - live-stream-config es singleType, no necesita documentId
    const response = await fetch(`${STRAPI_URL}/api/live-stream-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: updateData,
      }),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      console.error('Strapi error:', responseBody);
      throw new Error('Error al actualizar configuracion');
    }

    const result = JSON.parse(responseBody);

    return NextResponse.json({
      success: true,
      message: 'Configuracion actualizada correctamente',
      data: {
        liveStreamActive: result.data?.liveStreamActive,
        youtubeLiveUrl: result.data?.youtubeLiveUrl,
        activeAuctionId: result.data?.activeAuctionId,
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al guardar configuracion' },
      { status: 500 }
    );
  }
}
