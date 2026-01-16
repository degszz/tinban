"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

const signUpSchema = z.object({
  username: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  identifier: z.string().min(1, "Email o usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

// ============================================
// SIGN UP ACTION
// ============================================

export async function signUpAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = signUpSchema.safeParse({
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      phone: formData.get("phone"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Campos inválidos. Por favor verifica los datos.",
      };
    }

    const { username, email, password, phone } = validatedFields.data;

    console.log("📝 Registrando usuario:", { username, email, phone });

    // Registrar usuario (el backend maneja phone y confirmed)
    const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        phone, // ✅ Enviar phone al backend
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error en registro:", data);
      return {
        message: data.error?.message || "Error al registrar usuario",
      };
    }

    console.log("✅ Usuario registrado:", data.user.username, "ID:", data.user.id);
    console.log("📋 Confirmed:", data.user.confirmed);

    // El backend ya maneja confirmed: false, no necesitamos actualizar aquí

    // Crear sesión y guardar JWT
    const userId = data.user.id.toString();
    await createSession(userId);

    const cookieStore = await cookies();
    cookieStore.set("strapi_jwt", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return {
      data: {
        jwt: data.jwt,
        user: data.user,
      },
    };
  } catch (error: any) {
    console.error("❌ Error en signUpAction:", error);
    return {
      message: error.message || "Error al procesar el registro",
    };
  }
}

// ============================================
// SIGN IN ACTION
// ============================================

export async function signInAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = signInSchema.safeParse({
      identifier: formData.get("identifier"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Campos inválidos. Por favor verifica los datos.",
      };
    }

    const { identifier, password } = validatedFields.data;

    console.log("🔐 Iniciando sesión:", identifier);

    const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error en login:", data);
      return {
        message: data.error?.message || "Credenciales inválidas",
      };
    }

    console.log("✅ Login exitoso:", data.user.username);

    // Crear sesión y guardar JWT
    const userId = data.user.id.toString();
    await createSession(userId);

    const cookieStore = await cookies();
    cookieStore.set("strapi_jwt", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return {
      data: {
        jwt: data.jwt,
        user: data.user,
      },
    };
  } catch (error: any) {
    console.error("❌ Error en signInAction:", error);
    return {
      message: error.message || "Error al iniciar sesión",
    };
  }
}

// ============================================
// SIGN OUT ACTION
// ============================================

export async function signOutAction() {
  try {
    console.log("🚪 Cerrando sesión...");

    // Eliminar sesión
    await deleteSession();

    // Eliminar JWT de Strapi
    const cookieStore = await cookies();
    cookieStore.delete("strapi_jwt");

    console.log("✅ Sesión cerrada");
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
  }
  
  redirect("/signin");
}