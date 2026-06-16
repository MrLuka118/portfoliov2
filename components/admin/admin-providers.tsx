"use client";

import { SessionProvider } from "next-auth/react";

/** SessionProvider za admin panel (useSession, signOut). */
export function AdminProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
