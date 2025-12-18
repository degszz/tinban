"use server";

import { cookies } from "next/headers";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * Obtener el ID del usuario actual
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const jwtCookie = (await cookies()).get("strapi_jwt")?.value;
    
    if (!jwtCookie) {
      return null;
    }

    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData.id?.toString() || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

/**
 * Obtener todos los favoritos del usuario
 */
export async function getUserFavorites(): Promise<string[]> {
  try {
    const jwtCookie = (await cookies()).get("strapi_jwt")?.value;
    
    if (!jwtCookie) {
      return [];
    }

    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching favorites:", response.statusText);
      return [];
    }

    const userData = await response.json();
    
    if (Array.isArray(userData.favorites)) {
      return userData.favorites;
    }
    
    return [];
  } catch (error) {
    console.error("Error in getUserFavorites:", error);
    return [];
  }
}

/**
 * Toggle favorito (agregar o remover) - SERVER ACTION
 */
export async function toggleFavoriteAction(auctionId: string): Promise<{
  success: boolean;
  isFavorite: boolean;
  favorites?: string[];
  error?: string;
}> {
  try {
    console.log("=== Toggle Favorite Server Action ===");
    console.log("Auction ID:", auctionId);
    
    const jwtCookie = (await cookies()).get("strapi_jwt")?.value;
    
    if (!jwtCookie) {
      console.error("JWT cookie not found");
      return { success: false, isFavorite: false, error: "No autenticado" };
    }

    console.log("JWT token found");
    
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.error("User ID not found");
      return { success: false, isFavorite: false, error: "Usuario no encontrado" };
    }

    console.log("User ID:", userId);

    // Obtener favoritos actuales
    const currentFavorites = await getUserFavorites();
    console.log("Current favorites:", currentFavorites);
    
    const isFavorite = currentFavorites.includes(auctionId);
    console.log("Is currently favorite:", isFavorite);

    // Calcular nuevos favoritos
    let updatedFavorites: string[];
    if (isFavorite) {
      updatedFavorites = currentFavorites.filter(id => id !== auctionId);
      console.log("Removing from favorites");
    } else {
      updatedFavorites = [...currentFavorites, auctionId];
      console.log("Adding to favorites");
    }

    console.log("Updated favorites:", updatedFavorites);

    // Actualizar en Strapi
    const url = `${STRAPI_URL}/api/users/${userId}`;
    console.log("Update URL:", url);
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtCookie}`,
      },
      body: JSON.stringify({
        favorites: updatedFavorites,
      }),
      cache: "no-store",
    });

    console.log("Update response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error updating favorites:", response.status, errorText);
      return { 
        success: false, 
        isFavorite, 
        error: `Error al actualizar favoritos: ${response.status}` 
      };
    }

    const result = await response.json();
    console.log("Update result:", result);
    console.log("=== Toggle Favorite Success ===");

    return { 
      success: true, 
      isFavorite: !isFavorite, 
      favorites: updatedFavorites 
    };
  } catch (error) {
    console.error("Error in toggleFavorite:", error);
    return { 
      success: false, 
      isFavorite: false, 
      error: "Error del servidor" 
    };
  }
}
