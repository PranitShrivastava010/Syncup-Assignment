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
  _isRetry?: boolean;
};

let isRefreshing = false;
let refreshQueue: Array<(newToken: string | null) => void> = [];

const drainQueue = (newToken: string | null) => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

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

const silentRefresh = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data: { accessToken: string; user: RefreshResult["user"] } =
      await res.json();

    if (!data.accessToken) return null;

    const { updateAccessToken, getAuthSession, saveAuthSession } = await import(
      "../auth/session"
    );

    const existingSession = getAuthSession();
    if (existingSession) {
      updateAccessToken(data.accessToken);
    } else {
      saveAuthSession({ accessToken: data.accessToken, user: data.user as never });
    }

    return data.accessToken;
  } catch {
    return null;
  }
};

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

  if (response.status === 401 && !options._isRetry) {
    if (path === "/api/auth/refresh") {
      throw new ApiError(401, data?.message ?? "Session expired");
    }

    let newToken: string | null;

    if (isRefreshing) {
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
      const { clearAuthSession } = await import("../auth/session");
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

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

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message ?? "Something went wrong. Please try again."
    );
  }

  return data as T;
};

