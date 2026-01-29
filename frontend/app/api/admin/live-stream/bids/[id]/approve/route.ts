import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    console.log('📥 Approve bid request - documentId:', documentId);

    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener la bid actual para verificar que existe y esta pendiente
    console.log('📡 Fetching bid from Strapi:', `${STRAPI_URL}/api/bids/${documentId}`);
    const getBidResponse = await fetch(`${STRAPI_URL}/api/bids/${documentId}?populate=user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 GET bid response status:', getBidResponse.status);

    if (!getBidResponse.ok) {
      const errorText = await getBidResponse.text();
      console.error('❌ Bid not found:', errorText);
      return NextResponse.json(
        { error: 'Bid no encontrada', details: errorText },
        { status: 404 }
      );
    }

    const bidData = await getBidResponse.json();
    const bid = bidData.data;
    console.log('✅ Bid found:', { id: bid?.id, documentId: bid?.documentId, status: bid?.status });

    if (bid.status !== 'pending') {
      console.log('❌ Bid status is not pending:', bid.status);
      return NextResponse.json(
        { error: 'Solo se pueden aprobar bids pendientes' },
        { status: 400 }
      );
    }

    // Aprobar la bid - cambiar status a active
    console.log('📤 Updating bid status to active');
    const response = await fetch(`${STRAPI_URL}/api/bids/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          status: 'active',
        },
      }),
    });

    console.log('📡 PUT response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error aprobando bid:', errorData);
      return NextResponse.json(
        { error: 'Error al aprobar puja', details: errorData },
        { status: response.status }
      );
    }

    console.log('✅ Bid approved successfully');
    return NextResponse.json({
      success: true,
      message: 'Puja aprobada correctamente',
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Error al aprobar puja' },
      { status: 500 }
    );
  }
}
