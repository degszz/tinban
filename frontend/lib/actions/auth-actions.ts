// lib/actions/auth-actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface SignInFormState {
  errors?: {
    identifier?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
}

export interface SignUpFormState {
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string;
  success?: boolean;
}

export async function signInAction(
  prevState: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  try {
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    // Validaciones
    if (!identifier) {
      return {
        errors: {
          identifier: ["El email o usuario es requerido"],
        },
      };
    }

    if (!password) {
      return {
        errors: {
          password: ["La contraseña es requerida"],
        },
      };
    }

    // Autenticar con Strapi
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        errors: {
          _form: [data.error?.message || "Credenciales inválidas"],
        },
      };
    }

    // Guardar JWT y datos de sesión en cookies
    const cookieStore = await cookies();
    
    // Guardar el JWT de Strapi
    cookieStore.set("strapi_jwt", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    // Guardar datos de sesión
    cookieStore.set("session", JSON.stringify({
      userId: data.user.id,
      username: data.user.username,
      email: data.user.email,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    // Redirigir al dashboard o home
    redirect("/");
  } catch (error) {
    console.error("Sign In Error:", error);
    return {
      errors: {
        _form: ["Error al iniciar sesión. Verifica tus credenciales."],
      },
    };
  }
}

export async function signUpAction(
  prevState: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  try {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validaciones
    if (!username) {
      return {
        errors: {
          username: ["El nombre de usuario es requerido"],
        },
      };
    }

    if (!email) {
      return {
        errors: {
          email: ["El email es requerido"],
        },
      };
    }

    if (!password) {
      return {
        errors: {
          password: ["La contraseña es requerida"],
        },
      };
    }

    if (password !== confirmPassword) {
      return {
        errors: {
          confirmPassword: ["Las contraseñas no coinciden"],
        },
      };
    }

    if (password.length < 6) {
      return {
        errors: {
          password: ["La contraseña debe tener al menos 6 caracteres"],
        },
      };
    }

    // Registrar usuario en Strapi
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        message: data.error?.message || "Error al registrar usuario",
      };
    }

    // Registro exitoso, redirigir al login
    redirect("/signin");
  } catch (error) {
    console.error("Sign Up Error:", error);
    return {
      message: "Error inesperado al registrar usuario",
    };
  }
}

export async function signOutAction() {
  // Eliminar las cookies de sesión
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("strapi_jwt");
  
  // Redirigir al inicio
  redirect("/");
}