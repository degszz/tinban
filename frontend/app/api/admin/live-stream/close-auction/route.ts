import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { auctionId } = body;

    if (!auctionId) {
      return NextResponse.json(
        { error: 'Se requiere auctionId' },
        { status: 400 }
      );
    }

    console.log('🔒 Closing auction:', auctionId);

    // Get all active bids for this auction, sorted by amount descending
    const bidsResponse = await fetch(
      `${STRAPI_URL}/api/bids?filters[auction_id][$eq]=${encodeURIComponent(auctionId)}&filters[status][$eq]=active&populate=user&sort[0]=amount:desc`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!bidsResponse.ok) {
      console.error('❌ Error fetching bids');
      return NextResponse.json(
        { error: 'Error al obtener pujas' },
        { status: 500 }
      );
    }

    const bidsData = await bidsResponse.json();
    const activeBids = bidsData.data || [];

    console.log('📊 Active bids found:', activeBids.length);

    if (activeBids.length === 0) {
      return NextResponse.json(
        { error: 'No hay pujas activas para cerrar', noActiveBids: true },
        { status: 400 }
      );
    }

    // The highest bid is the winner (already sorted by amount desc)
    const winningBid = activeBids[0];
    console.log('🏆 Winning bid:', {
      id: winningBid.id,
      documentId: winningBid.documentId,
      amount: winningBid.amount,
      userId: winningBid.user?.id,
      username: winningBid.user?.username,
    });

    // Mark the highest bid as winner
    const updateResponse = await fetch(
      `${STRAPI_URL}/api/bids/${winningBid.documentId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            status: 'winner',
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('❌ Error marking winner:', errorData);
      return NextResponse.json(
        { error: 'Error al marcar ganador' },
        { status: 500 }
      );
    }

    // Mark all other active bids as outbid
    const otherBids = activeBids.slice(1);
    for (const bid of otherBids) {
      await fetch(`${STRAPI_URL}/api/bids/${bid.documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            status: 'outbid',
          },
        }),
      });
    }

    console.log('✅ Auction closed successfully');

    return NextResponse.json({
      success: true,
      winner: {
        id: winningBid.id,
        documentId: winningBid.documentId,
        amount: winningBid.amount,
        userId: winningBid.user?.id,
        username: winningBid.user?.username,
      },
      message: `Remate cerrado. Ganador: ${winningBid.user?.username || 'Usuario'} con $${winningBid.amount.toLocaleString()}`,
    });
  } catch (error) {
    console.error('❌ Error closing auction:', error);
    return NextResponse.json(
      { error: 'Error al cerrar remate' },
      { status: 500 }
    );
  }
}
