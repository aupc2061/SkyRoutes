"use client";

// This is a compatibility wrapper that allows for a smooth transition from NextAuth to our JWT-based authentication
// Eventually, you'll want to completely remove NextAuth and only use the JWT-based auth from the Express backend

import React, { createContext, useContext } from "react";

interface SessionContextType {
  // Mock session data to provide compatibility with components that expect NextAuth session
  data: {
    user: any | null;
    expires: string;
  } | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const SessionContext = createContext<SessionContextType>({
  data: null,
  status: "unauthenticated",
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // We're using a simplified provider since actual auth is handled by AuthProvider
  return (
    <SessionContext.Provider value={{ data: null, status: "unauthenticated" }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  return useContext(SessionContext);
};