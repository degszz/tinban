import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { createBid, getBidsByAuction } from "@/lib/services/bid-service-server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// GET - Obtener pujas de una subasta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get("auctionId");

    if (!auctionId) {
      return NextResponse.json(
        { error: "Auction ID is required" },
        { status: 400 }
      );
    }

    const bids = await getBidsByAuction(auctionId);

    return NextResponse.json({ bids }, { status: 200 });
  } catch (error) {
    console.error("GET /api/bids error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva puja
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Verificar sesión del usuario
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.userId) {
      return NextResponse.json(
        { error: "No autenticado. Inicia sesión para pujar." },
        { status: 401 }
      );
    }

    // Obtener JWT de Strapi
    const strapiJWT = cookieStore.get("strapi_jwt")?.value;

    if (!strapiJWT) {
      return NextResponse.json(
        { error: "Sesión de Strapi no encontrada" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { auctionId, amount, auctionTitle } = body;

    // Validar datos
    if (!auctionId || !amount || !auctionTitle) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor a 0" },
        { status: 400 }
      );
    }

    // Crear la puja en Strapi
    // El backend de Strapi se encarga de:
    // 1. Verificar créditos suficientes
    // 2. Descontar créditos del usuario
    // 3. Devolver créditos al usuario anterior si fue superado
    // 4. Crear la bid
    const result = await createBid(
      {
        amount,
        auction_id: auctionId,
        auction_title: auctionTitle,
      },
      strapiJWT
    );

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error?.message || "Error al crear la puja" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        bid: result.data,
        newCredits: result.data.userCredits,
        message: "Puja realizada con éxito"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/bids error:", error);
    return NextResponse.json(
      { error: "Error al procesar la puja" },
      { status: 500 }
    );
  }
}
