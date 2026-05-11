"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthSession, saveAuthSession } from "./session";
import { ROUTES } from "@/routes/paths";
import type { StoredAuthSession } from "@/types/auth";
import { authApi } from "@/lib/api/auth";

export const useCandidateSession = () => {
  const router = useRouter();
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const stored = getAuthSession();

      if (stored) {
        if (stored.user.role === "RECRUITER") {
          router.replace(ROUTES.recruiter);
          return;
        }
        if (!cancelled) {
          setSession(stored);
          setIsCheckingSession(false);
        }
        return;
      }

      try {
        const result = await authApi.refresh();

        if (result.accessToken && result.user) {
          saveAuthSession({
            accessToken: result.accessToken,
            user: result.user,
          });

          if (result.user.role === "RECRUITER") {
            router.replace(ROUTES.recruiter);
            return;
          }

          if (!cancelled) {
            setSession({ accessToken: result.accessToken, user: result.user });
            setIsCheckingSession(false);
          }
          return;
        }
      } catch {
      }

      router.replace(ROUTES.login);
    };

    init();
    return () => { cancelled = true; };
  }, [router]);

  return { session, isCheckingSession };
};


