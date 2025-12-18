"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/lib/services/favorites-service";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  auctionId: string;
  initialIsFavorite: boolean;
  userId?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function FavoriteButton({ 
  auctionId, 
  initialIsFavorite,
  userId,
  size = "icon"
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);

    try {
      console.log("Toggling favorite for:", auctionId);
      const result = await toggleFavoriteAction(auctionId);
      
      console.log("Toggle result:", result);
      
      if (result.success) {
        setIsFavorite(result.isFavorite);
        
        // Disparar evento personalizado para actualizar otras partes de la UI
        window.dispatchEvent(new CustomEvent('favoritesUpdated', {
          detail: { auctionId, isFavorite: result.isFavorite }
        }));
        
        // Recargar la página para reflejar cambios
        router.refresh();
      } else {
        console.error("Error toggling favorite:", result.error);
        alert(result.error || "Error al actualizar favoritos");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Error al actualizar favoritos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        transition-all duration-200 
        ${isFavorite 
          ? 'bg-red-50 border-red-300 hover:bg-red-100 dark:bg-red-950 dark:border-red-800' 
          : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={isFavorite ? "Remover de favoritos" : "Agregar a favoritos"}
    >
      <Heart 
        className={`h-5 w-5 transition-all duration-200 ${
          isFavorite 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-600 dark:text-gray-400'
        }`}
      />
    </Button>
  );
}
