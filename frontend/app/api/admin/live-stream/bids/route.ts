import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// GET - Obtener bids por auctionId y status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get('auctionId');
    const status = searchParams.get('status');

    // Construir filtros
    let filterQuery = '';
    if (auctionId) {
      filterQuery += `&filters[auction_id][$eq]=${auctionId}`;
    }
    if (status) {
      filterQuery += `&filters[status][$eq]=${status}`;
    }

    const response = await fetch(
      `${STRAPI_URL}/api/bids?populate=user&sort=createdAt:desc${filterQuery}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strapi error:', errorText);
      return NextResponse.json(
        { error: 'Error al obtener bids', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transformar datos
    const bids = (data.data || []).map((bid: any) => ({
      id: bid.id,
      documentId: bid.documentId,
      userId: bid.user?.id?.toString() || 'unknown',
      username: bid.user?.username || 'Usuario',
      amount: parseFloat(bid.amount),
      amountCharged: bid.amount_charged ? parseFloat(bid.amount_charged) : null,
      auctionId: bid.auction_id,
      auctionTitle: bid.auction_title || '',
      timestamp: bid.createdAt || bid.bidDate,
      status: bid.status,
    }));

    return NextResponse.json({ bids });
  } catch (error: any) {
    console.error('Error en API route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}
