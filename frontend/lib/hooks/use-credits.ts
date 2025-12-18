"use client";

import { useState, useEffect } from "react";
import { getUserCredits } from "@/lib/services/credits-service";

export function useCredits() {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    setLoading(true);
    const userCredits = await getUserCredits();
    setCredits(userCredits);
    setLoading(false);
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const refreshCredits = () => {
    fetchCredits();
  };

  const updateCredits = (newCredits: number) => {
    setCredits(newCredits);
  };

  return {
    credits,
    loading,
    refreshCredits,
    updateCredits,
  };
}
