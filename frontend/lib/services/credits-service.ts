const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * Obtener los créditos del usuario autenticado
 */
export async function getUserCredits() {
  try {
    const response = await fetch("/api/credits", {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching credits:", response.statusText);
      return 0;
    }

    const data = await response.json();
    return data.credits || 0;
  } catch (error) {
    console.error("Get credits error:", error);
    return 0;
  }
}

/**
 * Solicitar créditos al administrador
 */
export async function requestCredits(amount: number, reason?: string) {
  try {
    const response = await fetch("/api/credits/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        reason,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Error al solicitar créditos",
      };
    }

    return {
      success: true,
      request: data.request,
    };
  } catch (error) {
    console.error("Request credits error:", error);
    return {
      success: false,
      error: "Error de conexión",
    };
  }
}
