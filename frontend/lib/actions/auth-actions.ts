"use server";

import { z } from "zod";
import { FormState } from "@/lib/definitions";
import {
  registerUserService,
  loginUserService,
} from "@/lib/services/auth-service";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    .max(20, { message: "El nombre de usuario no puede tener más de 20 caracteres" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "El nombre de usuario solo puede contener letras, números y guiones bajos",
    }),
  email: z
    .string()
    .email({ message: "Por favor ingresa un email válido" })
    .min(3, { message: "El email debe tener al menos 3 caracteres" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(100, { message: "La contraseña no puede tener más de 100 caracteres" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export async function signUpAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = signUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, email, password } = validatedFields.data;

  const responseData = await registerUserService({
    username,
    email,
    password,
  });

  if ("error" in responseData) {
    return {
      errors: {},
      message: responseData.error.message || "Error al registrar usuario",
    };
  }

  // Guardar JWT de Strapi en cookie
  (await cookies()).set("strapi_jwt", responseData.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    sameSite: "lax",
    path: "/",
  });

  await createSession(
    responseData.user.id,
    responseData.user.username,
    responseData.user.email
  );

  redirect("/dashboard");
}

const signInSchema = z.object({
  identifier: z
    .string()
    .min(3, { message: "El identificador debe tener al menos 3 caracteres" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export async function signInAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = signInSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { identifier, password } = validatedFields.data;

  const responseData = await loginUserService({
    identifier,
    password,
  });

  if ("error" in responseData) {
    return {
      errors: {},
      message: responseData.error.message || "Credenciales inválidas",
    };
  }

  // Guardar JWT de Strapi en cookie
  (await cookies()).set("strapi_jwt", responseData.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    sameSite: "lax",
    path: "/",
  });

  await createSession(
    responseData.user.id,
    responseData.user.username,
    responseData.user.email
  );

  redirect("/dashboard");
}

export async function signOutAction() {
  // Eliminar ambas cookies
  (await cookies()).delete("strapi_jwt");
  await deleteSession();
  redirect("/");
}
