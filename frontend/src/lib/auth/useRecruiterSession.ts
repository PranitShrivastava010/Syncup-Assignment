"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthSession, saveAuthSession } from "./session";
import { ROUTES } from "@/routes/paths";
import type { StoredAuthSession } from "@/types/auth";
import { authApi } from "@/lib/api/auth";

export const useRecruiterSession = () => {
  const router = useRouter();
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // ── 1. Fast path: valid session already in localStorage ──────────────
      const stored = getAuthSession();

      if (stored) {
        if (stored.user.role !== "RECRUITER") {
          router.replace(ROUTES.home);
          return;
        }
        if (!cancelled) {
          setSession(stored);
          setIsCheckingSession(false);
        }
        return;
      }

      // ── 2. Slow path: no localStorage → try silent refresh via cookie ────
      try {
        const result = await authApi.refresh();

        if (result.accessToken && result.user) {
          saveAuthSession({
            accessToken: result.accessToken,
            user: result.user,
          });

          if (result.user.role !== "RECRUITER") {
            router.replace(ROUTES.home);
            return;
          }

          if (!cancelled) {
            setSession({ accessToken: result.accessToken, user: result.user });
            setIsCheckingSession(false);
          }
          return;
        }
      } catch {
        // refresh failed — fall through to login
      }

      // ── 3. No valid session at all → redirect to login ───────────────────
      router.replace(ROUTES.login);
    };

    init();
    return () => { cancelled = true; };
  }, [router]);

  return { session, isCheckingSession };
};

