import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('strapi_jwt')?.value;

    if (!token) {
      return NextResponse.json({ token: null }, { status: 200 });
    }

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return NextResponse.json({ token: null }, { status: 500 });
  }
}