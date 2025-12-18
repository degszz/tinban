import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const strapiJWT = cookieStore.get("strapi_jwt")?.value;

    if (!strapiJWT) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { admin_notes } = body;

    // Llamar al endpoint custom de Strapi para aprobar
    const response = await fetch(
      `${STRAPI_URL}/api/credit-requests/${id}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${strapiJWT}`,
        },
        body: JSON.stringify({ admin_notes }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || "Error al aprobar solicitud" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      { 
        success: true, 
        message: "Solicitud aprobada exitosamente",
        data 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/admin/credit-requests/[id]/approve error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
