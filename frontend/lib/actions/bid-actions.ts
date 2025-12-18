"use server";

import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { createBid, getBidsByAuction, getHighestBid } from "@/lib/services/bid-service-server";
import { revalidatePath } from "next/cache";

interface BidFormState {
  success?: boolean;
  error?: string;
  bid?: any;
}

export async function placeBidAction(
  auctionId: string,
  auctionTitle: string,
  formData: FormData
): Promise<BidFormState> {
  try {
    // Verificar sesión
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return {
        success: false,
        error: "Debes iniciar sesión para pujar",
      };
    }

    // Obtener JWT de Strapi (necesitarás guardarlo en la sesión)
    // Por ahora, asumimos que tienes el JWT guardado en una cookie separada
    const strapiJWT = (await cookies()).get("strapi_jwt")?.value;

    if (!strapiJWT) {
      return {
        success: false,
        error: "Sesión de Strapi no encontrada. Inicia sesión nuevamente.",
      };
    }

    const amount = parseFloat(formData.get("amount") as string);

    if (!amount || amount <= 0) {
      return {
        success: false,
        error: "El monto debe ser mayor a 0",
      };
    }

    // Obtener la puja más alta actual
    const highestBid = await getHighestBid(auctionId);

    if (highestBid && amount <= highestBid.amount) {
      return {
        success: false,
        error: `La puja debe ser mayor a $${highestBid.amount}`,
      };
    }

    // Crear la puja
    const result = await createBid(
      {
        amount,
        auction_id: auctionId,
        auction_title: auctionTitle,
      },
      strapiJWT
    );

    if ("error" in result) {
      return {
        success: false,
        error: result.error?.message || "Error al crear la puja",
      };
    }

    // Revalidar la página para mostrar la nueva puja
    revalidatePath(`/auction/${auctionId}`);

    return {
      success: true,
      bid: result.data,
    };
  } catch (error) {
    console.error("Place Bid Action Error:", error);
    return {
      success: false,
      error: "Error inesperado al pujar",
    };
  }
}
