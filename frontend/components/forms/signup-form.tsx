"use client";

import { useActionState } from "react";
import { signUpAction } from "@/lib/actions/auth-actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StrapiErrors } from "./strapi-errors";
import { FormState } from "@/lib/definitions";

const INITIAL_STATE: FormState = {
  errors: {},
};

export function SignUpForm() {
  const [formState, formAction, pending] = useActionState(
    signUpAction,
    INITIAL_STATE
  );

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Crear Cuenta</h2>
        <p className="text-muted-foreground mt-2">
          Completa el formulario para registrarte
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Nombre y Apellido</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Juan Pérez"
            required
            disabled={pending}
          />
          {formState.errors?.username && (
            <p className="text-sm text-red-500">{formState.errors.username[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Número telefónico</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="1234567890"
            required
            disabled={pending}
            minLength={10}
            maxLength={15}
          />
          {formState.errors?.phone && (
            <p className="text-sm text-red-500">{formState.errors.phone[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            disabled={pending}
          />
          {formState.errors?.email && (
            <p className="text-sm text-red-500">{formState.errors.email[0]}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            disabled={pending}
          />
          {formState.errors?.confirmPassword && (
            <p className="text-sm text-red-500">
              {formState.errors.confirmPassword[0]}
            </p>
          )}
        </div>

        <StrapiErrors error={formState?.message} />

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Registrando..." : "Registrarse"}
        </Button>
      </form>

      <div className="text-center text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/signin" className="text-primary hover:underline font-medium">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}