export async function requestCredits(amount: number, reason: string) {
  try {
    console.log('🔄 Solicitando créditos:', { amount, reason });

    // ✅ Llamar a la API route de Next.js (no directamente a Strapi)
    const response = await fetch('/api/credits/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ✅ IMPORTANTE: Incluir cookies
      body: JSON.stringify({
        amount,
        reason,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error en requestCredits:', data);
      return {
        success: false,
        error: data.error || 'Error al solicitar créditos',
        requiresVerification: data.requiresVerification || false,
      };
    }

    console.log('✅ Solicitud exitosa:', data);
    return {
      success: true,
      data: data.data,
    };
  } catch (error: any) {
    console.error('❌ Error en requestCredits:', error);
    return {
      success: false,
      error: error.message || 'Error al conectar con el servidor',
    };
  }
}

export async function getUserCredits(): Promise<number> {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.user?.credits || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    return 0;
  }
}