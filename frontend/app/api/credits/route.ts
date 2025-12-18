import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function GET() {
  try {
    const jwtCookie = (await cookies()).get("strapi_jwt")?.value;

    if (!jwtCookie) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener información del usuario con sus créditos
    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al obtener créditos" },
        { status: response.status }
      );
    }

    const userData = await response.json();

    return NextResponse.json({
      credits: userData.credits || 0,
    });
  } catch (error) {
    console.error("Get credits error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
