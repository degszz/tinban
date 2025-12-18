import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function POST(request: NextRequest) {
  try {
    const { amount, reason } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      );
    }

    const jwtCookie = (await cookies()).get("strapi_jwt")?.value;
    const sessionCookie = (await cookies()).get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!jwtCookie || !session?.userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Crear solicitud de créditos en Strapi
    const response = await fetch(`${STRAPI_URL}/api/credit-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtCookie}`,
      },
      body: JSON.stringify({
        data: {
          amount,
          reason: reason || "",
          status: "pending",
          user: session.userId,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || "Error al crear solicitud" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      request: data.data,
    });
  } catch (error) {
    console.error("Request credits error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
