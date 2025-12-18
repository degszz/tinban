import { cookies } from "next/headers";
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

interface BidData {
  amount: number;
  auction_id: string;
  auction_title: string;
}

// Función para obtener el JWT de Strapi desde las cookies
async function getStrapiJWT() {
  const cookieStore = await cookies();
  return cookieStore.get("strapi_jwt")?.value;
}

/**
 * Crea una nueva puja en Strapi (SOLO SERVIDOR)
 */
export async function createBid(bidData: BidData, jwt?: string) {
  try {
    const token = jwt || await getStrapiJWT();

    if (!token) {
      return {
        error: {
          message: "No autenticado. Inicia sesión para pujar.",
        },
      };
    }
    
    const response = await fetch(`${STRAPI_URL}/api/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: bidData,
      }),
    });
    
    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          message: data.error?.message || "Error al crear la puja",
          details: data.error,
        },
      };
    }

    return { data: data };
  } catch (error) {
    console.error("Create bid error:", error);
    return {
      error: {
        message: "Error de conexión al crear la puja",
      },
    };
  }
}

/**
 * Obtiene todas las pujas de una subasta específica (SOLO SERVIDOR)
 */
export async function getBidsByAuction(auctionId: string) {
  try {
    const query = qs.stringify(
      {
        filters: {
          auction_id: {
            $eq: auctionId,
          },
        },
        populate: "user",
        sort: ["amount:desc", "createdAt:desc"],
      },
      { encodeValuesOnly: true }
    );
    
    const response = await fetch(`${STRAPI_URL}/api/bids?${query}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Error fetching bids:", response.statusText);
      return [];
    }

    const data = await response.json();
    
    const bids = data.data.map((bid: any) => ({
      id: bid.id,
      amount: bid.amount,
      userId: bid.user?.id || "unknown",
      userName: bid.user?.username || "Usuario",
      timestamp: bid.createdAt,
      auctionId: bid.auction_id,
      auctionTitle: bid.auction_title,
      status: bid.status,
    }));

    return bids;
  } catch (error) {
    console.error("Get bids by auction error:", error);
    return [];
  }
}

/**
 * Obtiene la puja más alta de una subasta (SOLO SERVIDOR)
 */
export async function getHighestBid(auctionId: string) {
  try {
    const bids = await getBidsByAuction(auctionId);
    
    if (bids.length === 0) {
      return null;
    }

    return bids[0];
  } catch (error) {
    console.error("Get highest bid error:", error);
    return null;
  }
}
