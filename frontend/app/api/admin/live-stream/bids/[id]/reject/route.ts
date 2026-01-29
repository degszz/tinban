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

    console.log('📥 Reject bid request - documentId:', documentId);

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
    console.log('✅ Bid found:', { id: bid?.id, documentId: bid?.documentId, status: bid?.status, user: bid?.user?.id });

    if (bid.status !== 'pending') {
      console.log('❌ Bid status is not pending:', bid.status);
      return NextResponse.json(
        { error: 'Solo se pueden rechazar bids pendientes' },
        { status: 400 }
      );
    }

    const userId = bid.user?.id;
    const amountCharged = bid.amount_charged ? parseFloat(bid.amount_charged) : parseFloat(bid.amount);
    console.log('💰 Amount to refund:', amountCharged, 'to user:', userId);

    // 1. Devolver creditos al usuario si tiene userId y amount_charged
    if (userId && amountCharged > 0) {
      // Obtener creditos actuales del usuario
      const userResponse = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const currentCredits = userData.credits || 0;
        const newCredits = currentCredits + amountCharged;

        console.log('💰 User credits:', currentCredits, '-> new credits:', newCredits);

        // Actualizar creditos del usuario
        const updateUserResponse = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            credits: newCredits,
          }),
        });

        console.log('📡 Update user credits response:', updateUserResponse.status);
        console.log(`✅ Creditos devueltos: ${amountCharged} a usuario ${userId}. Nuevos creditos: ${newCredits}`);
      } else {
        console.error('❌ Error fetching user:', await userResponse.text());
      }
    }

    // 2. Rechazar la bid - cambiar status a outbid
    console.log('📤 Updating bid status to outbid');
    const response = await fetch(`${STRAPI_URL}/api/bids/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          status: 'outbid', // Usamos outbid ya que rejected no esta en el schema
        },
      }),
    });

    console.log('📡 PUT response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error rechazando bid:', errorData);
      return NextResponse.json(
        { error: 'Error al rechazar puja', details: errorData },
        { status: response.status }
      );
    }

    console.log('✅ Bid rejected successfully');
    return NextResponse.json({
      success: true,
      message: 'Puja rechazada y creditos devueltos correctamente',
      refundedAmount: amountCharged,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Error al rechazar puja' },
      { status: 500 }
    );
  }
}
