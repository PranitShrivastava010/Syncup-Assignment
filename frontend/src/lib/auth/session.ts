import type { StoredAuthSession } from "@/types/auth";

const SESSION_KEY = "syncup_auth";

export const saveAuthSession = (session: StoredAuthSession) => {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getAuthSession = (): StoredAuthSession | null => {
  const rawSession = window.sessionStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as StoredAuthSession;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const clearAuthSession = () => {
  window.sessionStorage.removeItem(SESSION_KEY);
};
