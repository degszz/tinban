import "server-only";
import { verifySession } from "@/lib/session";
import { cache } from "react";

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  return {
    id: session.userId,
    username: session.username,
    email: session.email,
  };
});
