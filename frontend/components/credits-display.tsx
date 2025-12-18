"use client";

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";

interface CreditsDisplayProps {
  initialCredits: number;
}

export function CreditsDisplay({ initialCredits }: CreditsDisplayProps) {
  const [credits, setCredits] = useState(initialCredits);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayCredits, setDisplayCredits] = useState(initialCredits);

  useEffect(() => {
    setCredits(initialCredits);
    setDisplayCredits(initialCredits);
  }, [initialCredits]);

  // Escuchar eventos de actualización de créditos
  useEffect(() => {
    const handleCreditsUpdate = (event: CustomEvent) => {
      const newCredits = event.detail.credits;
      const oldCredits = credits;

      if (newCredits < oldCredits) {
        // Animación de resta
        setIsAnimating(true);
        
        // Animar el número bajando
        const difference = oldCredits - newCredits;
        const duration = 1000; // 1 segundo
        const steps = 20;
        const stepValue = difference / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
          currentStep++;
          if (currentStep <= steps) {
            setDisplayCredits(Math.round(oldCredits - (stepValue * currentStep)));
          } else {
            clearInterval(interval);
            setDisplayCredits(newCredits);
            setIsAnimating(false);
          }
        }, stepDuration);
      } else {
        setDisplayCredits(newCredits);
      }

      setCredits(newCredits);
    };

    window.addEventListener("creditsUpdated", handleCreditsUpdate as EventListener);
    return () => {
      window.removeEventListener("creditsUpdated", handleCreditsUpdate as EventListener);
    };
  }, [credits]);

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-[#115FB7]/50 to-[#115FB7]/70 px-3 py-2 rounded-lg border border-[#115FB7]">
      <Coins className={`h-5 w-5 text-white ${isAnimating ? 'animate-spin' : ''}`} />
      <div className="flex flex-col">
        <span className={`text-lg font-bold text-white ${isAnimating ? 'animate-pulse' : ''}`}>
          ${displayCredits.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
