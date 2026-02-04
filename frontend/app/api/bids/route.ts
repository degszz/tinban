import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// GET - Obtener pujas de una subasta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get("auctionId");
    const includeWinner = searchParams.get("includeWinner") === "true";

    if (!auctionId) {
      return NextResponse.json(
        { error: "Auction ID is required" },
        { status: 400 }
      );
    }

    console.log("📥 GET /api/bids - Fetching bids for auction:", auctionId, "includeWinner:", includeWinner);

    // Build status filter - include winner if requested
    let statusFilter = "filters[status][$eq]=active";
    if (includeWinner) {
      statusFilter = "filters[status][$in][0]=active&filters[status][$in][1]=winner";
    }

    // Obtener bids desde Strapi
    const strapiResponse = await fetch(
      `${STRAPI_URL}/api/bids?filters[auction_id][$eq]=${auctionId}&${statusFilter}&populate=user&sort[0]=amount:desc&sort[1]=createdAt:desc`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    console.log("📡 Strapi response status:", strapiResponse.status);

    if (!strapiResponse.ok) {
      console.error("❌ Error from Strapi:", strapiResponse.statusText);
      return NextResponse.json({ bids: [] }, { status: 200 });
    }

    const data = await strapiResponse.json();
    console.log("✅ Bids data received:", data.data?.length || 0, "bids");

    // Transformar datos de Strapi al formato esperado
    const bids = data.data?.map((bid: any) => ({
      id: bid.id,
      amount: parseFloat(bid.amount),
      userId: bid.user?.id?.toString() || "unknown",
      userName: bid.user?.username || "Usuario",
      timestamp: bid.createdAt || bid.bidDate,
      auctionId: bid.auction_id,
      status: bid.status,
    })) || [];

    console.log("📤 Returning bids:", bids);

    return NextResponse.json({ bids }, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/bids error:", error);
    return NextResponse.json(
      { bids: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva puja (ya existente, mantener)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // 🔑 Obtener JWT de Strapi (prioridad)
    const strapiJWT = cookieStore.get("strapi_jwt")?.value;

    if (!strapiJWT) {
      console.log('❌ No hay JWT de Strapi');
      return NextResponse.json(
        { error: "No autenticado. Inicia sesión para pujar." },
        { status: 401 }
      );
    }

    console.log('✅ JWT de Strapi encontrado');

    // ✅ Verificar que el usuario esté confirmado
    try {
      const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${strapiJWT}`,
        },
      });

      if (!userResponse.ok) {
        console.log('❌ Error al obtener datos del usuario');
        return NextResponse.json(
          { error: "Error al verificar usuario" },
          { status: 401 }
        );
      }

      const userData = await userResponse.json();
      
      if (!userData.confirmed) {
        console.log('❌ Usuario no confirmado:', userData.username);
        return NextResponse.json(
          { 
            error: "Tu cuenta no está verificada. Contacta al administrador para verificar tu cuenta.",
            requiresVerification: true 
          },
          { status: 403 }
        );
      }

      console.log('✅ Usuario confirmado:', userData.username);
    } catch (verificationError) {
      console.error('❌ Error en verificación:', verificationError);
      return NextResponse.json(
        { error: "Error al verificar estado de cuenta" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { auctionId, amount, auctionTitle, requiresApproval } = body;

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

    console.log('📤 Creando puja:', { auctionId, amount, auctionTitle, requiresApproval });

    const result = await fetch(`${STRAPI_URL}/api/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${strapiJWT}`,
      },
      body: JSON.stringify({
        data: {
          amount,
          auction_id: auctionId,
          auction_title: auctionTitle,
          requires_approval: requiresApproval || false,
        },
      }),
    });

    const resultData = await result.json();

    if (!result.ok) {
      console.error('❌ Error al crear puja:', resultData);
      
      if (resultData.error?.message?.includes('verificada') || 
          resultData.error?.message?.includes('confirmed')) {
        return NextResponse.json(
          { 
            error: "Tu cuenta no está verificada. Contacta al administrador.",
            requiresVerification: true 
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: resultData.error?.message || "Error al crear la puja" },
        { status: 400 }
      );
    }

    console.log('✅ Puja creada exitosamente');

    // Extraer newCredits del resultado - puede venir en data.userCredits o userCredits
    const newCredits = resultData.data?.userCredits ?? resultData.userCredits;

    return NextResponse.json(
      {
        success: true,
        bid: resultData.data,
        newCredits,
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