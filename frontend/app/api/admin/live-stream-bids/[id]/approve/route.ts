import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const bidId = params.id;

    const response = await fetch(`${STRAPI_URL}/api/bids/${bidId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          adminStatus: 'approved',
          approvedAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Error al aprobar puja');
    }

    return NextResponse.json({
      success: true,
      message: 'Puja aprobada correctamente',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al aprobar puja' },
      { status: 500 }
    );
  }
}