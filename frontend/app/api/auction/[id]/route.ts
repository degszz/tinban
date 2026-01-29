// frontend/app/api/auction/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auctionId = params.id;

    // Obtener la tarjeta de Strapi
    const response = await fetch(
      `${STRAPI_URL}/api/cards/${auctionId}?populate=image`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Subasta no encontrada' },
        { status: 404 }
      );
    }

    const data = await response.json();
    
    // Formatear datos
    const card = data.data;
    const auction = {
      id: card.id,
      title: card.attributes.title || card.title,
      description: card.attributes.description || card.description,
      Price: card.attributes.Price || card.Price || 0,
      quantity: card.attributes.quantity || card.quantity,
      measurements: card.attributes.measurements || card.measurements,
      image: card.attributes.image?.data 
        ? Array.isArray(card.attributes.image.data)
          ? card.attributes.image.data.map((img: any) => ({
              url: img.attributes.url,
              alternativeText: img.attributes.alternativeText,
            }))
          : {
              url: card.attributes.image.data.attributes.url,
              alternativeText: card.attributes.image.data.attributes.alternativeText,
            }
        : card.image,
    };

    return NextResponse.json({
      success: true,
      auction,
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    return NextResponse.json(
      { error: 'Error al obtener subasta' },
      { status: 500 }
    );
  }
}