"use client";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * Obtener el token JWT del cliente - con múltiples intentos
 */
function getJwtToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  console.log("All cookies:", document.cookie);
  
  const cookies = document.cookie.split(';');
  
  // Intentar diferentes nombres de cookie
  const possibleNames = ['strapi_jwt', 'jwt', 'token'];
  
  for (const name of possibleNames) {
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    if (cookie) {
      const token = cookie.split('=')[1];
      console.log(`Found token with name '${name}':`, token.substring(0, 20) + '...');
      return token;
    }
  }
  
  console.error("No JWT token found in cookies");
  return null;
}

/**
 * Obtener el ID del usuario actual
 */
async function getCurrentUserId(jwt: string): Promise<string | null> {
  try {
    console.log("Getting user ID with token:", jwt.substring(0, 20) + '...');
    
    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.log("User me response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error getting user:", response.statusText, errorText);
      return null;
    }

    const userData = await response.json();
    console.log("User data:", userData);
    return userData.id?.toString() || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

/**
 * Obtener todos los favoritos del usuario
 */
export async function getUserFavoritesClient(): Promise<string[]> {
  try {
    const jwt = getJwtToken();
    
    if (!jwt) {
      console.warn("No JWT token available");
      return [];
    }

    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
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
 * Toggle favorito (agregar o remover)
 */
export async function toggleFavoriteClient(auctionId: string): Promise<{
  success: boolean;
  isFavorite: boolean;
  favorites?: string[];
  error?: string;
}> {
  try {
    console.log("=== Toggle Favorite Start ===");
    console.log("Auction ID:", auctionId);
    
    const jwt = getJwtToken();
    
    if (!jwt) {
      console.error("JWT token not found");
      return { success: false, isFavorite: false, error: "No autenticado - Cookie JWT no encontrada" };
    }

    console.log("JWT token found");
    
    const userId = await getCurrentUserId(jwt);
    
    if (!userId) {
      console.error("User ID not found");
      return { success: false, isFavorite: false, error: "Usuario no encontrado" };
    }

    console.log("User ID:", userId);

    // Obtener favoritos actuales
    const currentFavorites = await getUserFavoritesClient();
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
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        favorites: updatedFavorites,
      }),
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
