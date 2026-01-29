import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// GET - Obtener configuracion del live stream
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/home-page`, {
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

// PUT - Actualizar configuracion del live stream
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Use STRAPI_API_TOKEN if available, fallback to user JWT
    const authToken = STRAPI_API_TOKEN || token;
    const tokenSource = STRAPI_API_TOKEN ? 'STRAPI_API_TOKEN' : 'JWT';

    // Debug: Log which token is being used
    console.log('[DEBUG] Using token source:', tokenSource);
    console.log('[DEBUG] Token (first 20 chars):', authToken.substring(0, 20) + '...');

    const body = await request.json();
    const { liveStreamActive, youtubeLiveUrl, activeAuctionId } = body;

    // Debug: Log the Authorization header being sent
    const authHeader = `Bearer ${authToken}`;
    console.log('[DEBUG] Authorization header:', `Bearer ${authToken.substring(0, 20)}...`);

    // 1. Obtener el documentId del home-page
    const getResponse = await fetch(`${STRAPI_URL}/api/home-page`, {
      headers: {
        Authorization: authHeader,
      },
      cache: 'no-store',
    });

    // Debug: Log response status
    console.log('[DEBUG] getResponse status:', getResponse.status);
    console.log('[DEBUG] getResponse ok:', getResponse.ok);

    if (!getResponse.ok) {
      // Debug: Log full response body on failure
      const errorBody = await getResponse.text();
      console.error('[DEBUG] getResponse failed - Status:', getResponse.status);
      console.error('[DEBUG] getResponse failed - Body:', errorBody);
      throw new Error(`Error al obtener home-page: ${getResponse.status} - ${errorBody}`);
    }

    const homePageData = await getResponse.json();
    const documentId = homePageData.data?.documentId;
    console.log('[DEBUG] documentId:', documentId);

    if (!documentId) {
      console.error('No se encontro documentId del home-page');
      throw new Error('No se encontro documentId del home-page');
    }

    // Construir objeto de datos solo con campos que vienen en la request
    const updateData: Record<string, any> = {};
    if (liveStreamActive !== undefined) updateData.liveStreamActive = liveStreamActive;
    if (youtubeLiveUrl !== undefined) updateData.youtubeLiveUrl = youtubeLiveUrl;
    if (activeAuctionId !== undefined) updateData.activeAuctionId = activeAuctionId;

    // 2. Actualizar en Strapi usando el documentId
    const response = await fetch(`${STRAPI_URL}/api/home-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: updateData,
      }),
    });

    console.log('[DEBUG] updateResponse status:', response.status);
    const responseBody = await response.text();
    console.log('[DEBUG] updateResponse body:', responseBody);

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
