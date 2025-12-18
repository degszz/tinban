"use client";

import { useActionState } from "react";
import { signInAction } from "@/lib/actions/auth-actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StrapiErrors } from "./strapi-errors";
import { FormState } from "@/lib/definitions";

const INITIAL_STATE: FormState = {
  errors: {},
};

export function SignInForm() {
  const [formState, formAction, pending] = useActionState(
    signInAction,
    INITIAL_STATE
  );

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Iniciar Sesión</h2>
        <p className="text-muted-foreground mt-2">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Identifier Field (email or username) */}
        <div className="space-y-2">
          <Label htmlFor="identifier">Email o Usuario</Label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="tu@email.com o usuario"
            required
            disabled={pending}
          />
          {formState.errors?.identifier && (
            <p className="text-sm text-red-500">
              {formState.errors.identifier[0]}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            disabled={pending}
          />
          {formState.errors?.password && (
            <p className="text-sm text-red-500">{formState.errors.password[0]}</p>
          )}
        </div>

        <StrapiErrors error={formState?.message} />

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </form>

      <div className="text-center text-sm">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Regístrate
        </Link>
      </div>
    </div>
  );
}
