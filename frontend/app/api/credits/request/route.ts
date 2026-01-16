import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // 🔑 Obtener JWT de Strapi desde las cookies
    const strapiJWT = cookieStore.get('strapi_jwt')?.value;

    if (!strapiJWT) {
      console.log('❌ No hay JWT de Strapi en las cookies');
      return NextResponse.json(
        { error: 'No autenticado. Por favor inicia sesión.' },
        { status: 401 }
      );
    }

    console.log('✅ JWT encontrado, verificando usuario...');

    // ✅ Verificar que el usuario esté confirmado ANTES de crear la solicitud
    try {
      const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${strapiJWT}`,
        },
      });

      if (!userResponse.ok) {
        console.log('❌ Error al obtener datos del usuario');
        return NextResponse.json(
          { error: 'Error al verificar usuario' },
          { status: 401 }
        );
      }

      const userData = await userResponse.json();
      console.log(`👤 Usuario: ${userData.username} - Confirmed: ${userData.confirmed}`);
      
      // ✅ Verificar campo confirmed
      if (!userData.confirmed) {
        console.log('❌ Usuario no confirmado');
        return NextResponse.json(
          { 
            error: "Tu cuenta no está verificada. Contacta al administrador para verificar tu cuenta.",
            requiresVerification: true 
          },
          { status: 403 }
        );
      }

      console.log('✅ Usuario confirmado, procesando solicitud...');
    } catch (verificationError) {
      console.error('❌ Error en verificación:', verificationError);
      return NextResponse.json(
        { error: 'Error al verificar estado de cuenta' },
        { status: 500 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { amount, reason } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    console.log('📤 Enviando solicitud de créditos a Strapi:', { amount, reason });
    console.log('🔑 JWT (primeros 20 chars):', strapiJWT.substring(0, 20) + '...');

    // 🚀 Hacer request a Strapi con el JWT en el header
    const response = await fetch(`${STRAPI_URL}/api/credit-requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${strapiJWT}`,  // ✅ CRÍTICO: Agregar JWT
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          amount,
          reason: reason || 'Sin motivo especificado',
          status: 'pending',
        },
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Error de Strapi:', responseData);
      
      // Verificar si es error de verificación
      if (response.status === 403) {
        return NextResponse.json(
          { 
            error: 'Tu cuenta no está verificada. Contacta al administrador.',
            requiresVerification: true 
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: responseData.error?.message || 'Error al crear solicitud' },
        { status: response.status }
      );
    }

    console.log('✅ Solicitud creada exitosamente:', responseData.data?.id);

    return NextResponse.json({
      success: true,
      data: responseData.data,
      message: 'Solicitud de créditos enviada correctamente'
    });
  } catch (error: any) {
    console.error('❌ Error en credits/request route:', error);
    return NextResponse.json(
      { error: error.message || 'Error al solicitar créditos' },
      { status: 500 }
    );
  }
}