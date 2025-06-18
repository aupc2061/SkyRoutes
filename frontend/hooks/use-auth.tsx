"use client";

// This is a client-side only component that wraps the auth provider
// to prevent hydration issues with localStorage

import { useAuth as useAuthInternal } from "../components/providers/auth-provider";

export function useAuth() {
  return useAuthInternal();
}
