"use client";

import { signOutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const handleLogout = async () => {
    await signOutAction();
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant="ghost" 
      size="sm"
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      Cerrar Sesión
    </Button>
  );
}
