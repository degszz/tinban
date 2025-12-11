import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionPayload } from "@/lib/definitions";

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
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    if (!session) {
      return null;
    }
    
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    // Silenciar el error en producción, solo loguear en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("Failed to verify session");
    }
    return null;
  }
}

export async function verifySession() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/signin");
  }

  return {
    isAuth: true,
    userId: session.userId,
    username: session.username,
    email: session.email,
  };
}
