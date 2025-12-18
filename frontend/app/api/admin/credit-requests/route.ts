import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    // 🔑 CAMBIO: Obtener JWT de cookies en lugar de headers
    const cookieStore = await cookies();
    const jwt = cookieStore.get('strapi_jwt')?.value;
    
    if (!jwt) {
      console.log('❌ No JWT token found in cookies');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('✅ JWT detectado:', jwt.substring(0, 20) + '...');

    // Fetch a Strapi
    const strapiResponse = await fetch(
      `${STRAPI_URL}/api/credit-requests?populate=user&sort=createdAt:desc`,
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📡 Response status:', strapiResponse.status);

    if (!strapiResponse.ok) {
      const errorText = await strapiResponse.text();
      console.error('❌ Strapi error:', errorText);
      return NextResponse.json(
        { error: 'Error al obtener solicitudes', details: errorText },
        { status: strapiResponse.status }
      );
    }

    const responseData = await strapiResponse.json();
    console.log('📦 Raw response:', JSON.stringify(responseData, null, 2));

    // Verificar estructura de respuesta
    const rawRequests = responseData.data || responseData;
    
    if (!Array.isArray(rawRequests)) {
      console.error('❌ Response is not an array:', typeof rawRequests);
      return NextResponse.json({ requests: [] });
    }

    console.log(`✅ Requests encontradas: ${rawRequests.length}`);

    // Transformar datos
    const requests = rawRequests.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      amount: item.amount || item.attributes?.amount,
      reason: item.reason || item.attributes?.reason || '',
      status: item.status || item.attributes?.status || 'pending',
      createdAt: item.createdAt || item.attributes?.createdAt,
      updatedAt: item.updatedAt || item.attributes?.updatedAt,
      user: item.user || item.attributes?.user?.data || null,
      admin_notes: item.admin_notes || item.attributes?.admin_notes || null,
    }));

    console.log('✅ Requests transformadas:', requests.length);
    console.log('📄 Primera request:', requests[0]);

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error('❌ Error en API route:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
