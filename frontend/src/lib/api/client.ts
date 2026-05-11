export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  authToken?: string;
  /**
   * Internal flag — prevents infinite retry loops.
   * Set automatically by the refresh interceptor.
   */
  _isRetry?: boolean;
};

// ─── Token-refresh state ────────────────────────────────────────────────────

/** True while a /api/auth/refresh call is in-flight. */
let isRefreshing = false;

/**
 * Callbacks queued while a refresh is in-flight.
 * Once the refresh resolves, each callback is called with the new token.
 */
let refreshQueue: Array<(newToken: string | null) => void> = [];

const drainQueue = (newToken: string | null) => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

// ─── Silent token refresh ────────────────────────────────────────────────────

type RefreshResult = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
};

/**
 * Calls POST /api/auth/refresh.  The backend reads the httpOnly `refreshToken`
 * cookie automatically — no JS access to the cookie is needed.
 *
 * Returns the new access token, or null when the refresh token is also expired.
 */
const silentRefresh = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends the httpOnly refresh-token cookie
    });

    if (!res.ok) return null;

    const data: { accessToken: string; user: RefreshResult["user"] } =
      await res.json();

    if (!data.accessToken) return null;

    // Lazily import to avoid circular dependency issues
    const { updateAccessToken, getAuthSession, saveAuthSession } = await import(
      "../auth/session"
    );

    // Keep the existing user data; just patch the access token
    const existingSession = getAuthSession();
    if (existingSession) {
      updateAccessToken(data.accessToken);
    } else {
      // No session in storage → build one from the refresh response
      saveAuthSession({ accessToken: data.accessToken, user: data.user as never });
    }

    return data.accessToken;
  } catch {
    return null;
  }
};

// ─── Core request helper ─────────────────────────────────────────────────────

const buildRequest = (
  path: string,
  options: RequestOptions,
  overrideToken?: string
): { url: string; init: RequestInit } => {
  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (
    options.body !== undefined &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const token = overrideToken ?? options.authToken;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const body: BodyInit | undefined =
    options.body === undefined
      ? undefined
      : isFormData
      ? (options.body as FormData)
      : JSON.stringify(options.body);

  return {
    url: `${API_BASE_URL}${path}`,
    init: { ...options, headers, credentials: "include", body },
  };
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { url, init } = buildRequest(path, options);

  const response = await fetch(url, init);

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  // ── 401 interceptor ──────────────────────────────────────────────────────
  if (response.status === 401 && !options._isRetry) {
    // Don't try to refresh if we're already on the refresh endpoint itself
    if (path === "/api/auth/refresh") {
      throw new ApiError(401, data?.message ?? "Session expired");
    }

    let newToken: string | null;

    if (isRefreshing) {
      // Another request already kicked off a refresh — wait for it
      newToken = await new Promise<string | null>((resolve) => {
        refreshQueue.push(resolve);
      });
    } else {
      isRefreshing = true;
      newToken = await silentRefresh();
      isRefreshing = false;
      drainQueue(newToken);
    }

    if (!newToken) {
      // Refresh token is also expired → force logout
      const { clearAuthSession } = await import("../auth/session");
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    // Retry the original request once with the fresh access token
    const retry = buildRequest(path, { ...options, _isRetry: true }, newToken);
    const retryRes = await fetch(retry.url, retry.init);

    const retryContentType = retryRes.headers.get("content-type") || "";
    const retryData = retryContentType.includes("application/json")
      ? await retryRes.json()
      : null;

    if (!retryRes.ok) {
      throw new ApiError(
        retryRes.status,
        retryData?.message ?? "Something went wrong. Please try again."
      );
    }

    return retryData as T;
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message ?? "Something went wrong. Please try again."
    );
  }

  return data as T;
};
