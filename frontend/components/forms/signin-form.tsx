"use client";

import { useActionState } from "react";
import { signInAction, type SignInFormState } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const initialState: SignInFormState = {}; // ✅ Definir el estado inicial con tipo
  const [formState, formAction, pending] = useActionState(
    signInAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="identifier">Email o Usuario</Label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          required
          disabled={pending}
        />
        {formState.errors?.identifier && (
          <p className="text-sm text-red-500 mt-1">
            {formState.errors.identifier[0]}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          disabled={pending}
        />
        {formState.errors?.password && (
          <p className="text-sm text-red-500 mt-1">
            {formState.errors.password[0]}
          </p>
        )}
      </div>

      {formState.errors?._form && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
          <p className="text-sm">{formState.errors._form[0]}</p>
        </div>
      )}

      {formState.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3">
          <p className="text-sm">¡Inicio de sesión exitoso!</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}