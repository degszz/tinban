// Bid Service - API calls for bidding

const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export interface Bid {
  id: number;
  amount: number;
  auction_id: string;
  auction_title?: string;
  status: "active" | "winner" | "outbid";
  bidDate: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface CreateBidData {
  amount: number;
  auction_id: string;
  auction_title?: string;
}

// Crear una nueva puja
export async function createBid(
  bidData: CreateBidData,
  jwt: string
): Promise<{ data: Bid } | { error: any }> {
  try {
    const response = await fetch(`${baseUrl}/api/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data: bidData }),
      cache: "no-cache",
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data };
    }

    return { data: data.data };
  } catch (error) {
    console.error("Create Bid Error:", error);
    return { error };
  }
}

// Obtener todas las pujas de un remate
export async function getBidsByAuction(
  auctionId: string
): Promise<Bid[]> {
  try {
    const response = await fetch(
      `${baseUrl}/api/bids/auction/${auctionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch bids");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get Bids Error:", error);
    return [];
  }
}

// Obtener la puja más alta de un remate
export async function getHighestBid(
  auctionId: string
): Promise<Bid | null> {
  try {
    const response = await fetch(
      `${baseUrl}/api/bids/auction/${auctionId}/highest`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get Highest Bid Error:", error);
    return null;
  }
}

// Obtener las pujas del usuario actual
export async function getMyBids(jwt: string): Promise<Bid[]> {
  try {
    const response = await fetch(`${baseUrl}/api/bids/my-bids`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user bids");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get My Bids Error:", error);
    return [];
  }
}
