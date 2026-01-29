import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * Funcion del lado del cliente para realizar una puja
 * @param requiresApproval - Si es true, la puja queda pendiente de aprobacion del admin (live stream)
 *                          Si es false o undefined, la puja se aprueba automaticamente (subastas normales)
 */
export async function placeBidOnAuction(
  auctionId: string,
  amount: number,
  auctionTitle: string,
  requiresApproval: boolean = false
) {
  try {
    const response = await fetch("/api/bids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auctionId,
        amount,
        auctionTitle,
        requiresApproval,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Error al realizar la puja",
      };
    }

    return {
      success: true,
      bid: data.bid,
      newCredits: data.newCredits, // 🔑 Incluir créditos actualizados
    };
  } catch (error) {
    console.error("Place bid error:", error);
    return {
      success: false,
      error: "Error de conexión",
    };
  }
}

/**
 * Función del lado del cliente para obtener las pujas de una subasta
 */
export async function getBidsForAuction(auctionId: string) {
  try {
    const response = await fetch(`/api/bids?auctionId=${auctionId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching bids:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.bids || [];
  } catch (error) {
    console.error("Get bids error:", error);
    return [];
  }
}
