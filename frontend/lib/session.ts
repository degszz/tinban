import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionPayload } from "@/lib/definitions";
import { getUserMeService } from "@/lib/services/auth-service";

const secretKey = process.env.NEXTAUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: number, username: string, email: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, username, email, expiresAt });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  (await cookies()).delete("session");
  (await cookies()).delete("strapi_jwt");
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * 🔧 Función decrypt mejorada - Verifica JWT de Strapi directamente
 * @param token - JWT de Strapi (opcional)
 * @returns Datos del usuario o null
 */
export async function decrypt(token?: string) {
  try {
    if (!token) {
      return null;
    }

    // Verificar el token con Strapi
    const userData = await getUserMeService(token);
    
    if ("error" in userData) {
      return null;
    }

    return {
      userId: userData.id,
      username: userData.username,
      email: userData.email,
    };
  } catch (error) {
    // Silenciar el error en producción, solo loguear en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("Failed to verify JWT with Strapi");
    }
    return null;
  }
}

/**
 * Verifica la sesión del usuario usando el JWT de Strapi
 */
export async function verifySession() {
  const cookie = (await cookies()).get("strapi_jwt")?.value;

  if (!cookie) {
    redirect("/signin");
  }

  try {
    const userData = await getUserMeService(cookie);
    
    if ("error" in userData) {
      redirect("/signin");
    }

    return {
      isAuth: true,
      userId: userData.id,
      username: userData.username,
      email: userData.email,
    };
  } catch (error) {
    redirect("/signin");
  }
}
