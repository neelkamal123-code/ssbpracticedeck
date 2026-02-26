"use client";

import { useEffect, type ReactNode } from "react";
import {
  getFirebaseAnalyticsClient,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import { AuthProvider } from "@/providers/auth-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    void getFirebaseAnalyticsClient();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
