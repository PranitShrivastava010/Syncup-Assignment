import type { StoredAuthSession } from "@/types/auth";

const SESSION_KEY = "syncup_auth";

export const saveAuthSession = (session: StoredAuthSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getAuthSession = (): StoredAuthSession | null => {
  if (typeof window === "undefined") return null;

  const rawSession = localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as StoredAuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getAccessToken = () => getAuthSession()?.accessToken ?? null;

export const updateAccessToken = (accessToken: string) => {
  const session = getAuthSession();
  if (session) {
    saveAuthSession({ ...session, accessToken });
  }
};

