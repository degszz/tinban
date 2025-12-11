// lib/actions/auth-actions.ts
"use server";

export interface SignInFormState {
  errors?: {
    identifier?: string[];
    password?: string[];
    _form?: string[];
  };
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

    // Tu lógica de autenticación con Strapi...
    // const response = await fetch(...)

    return {
      success: true,
    };
  } catch (error) {
    return {
      errors: {
        _form: ["Error al iniciar sesión. Verifica tus credenciales."],
      },
    };
  }
}