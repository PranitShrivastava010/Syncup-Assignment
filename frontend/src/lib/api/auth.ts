import { apiRequest } from "./client";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  RefreshResponse,
} from "@/types/auth";

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiRequest<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: payload,
    }),

  login: (payload: LoginPayload) =>
    apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    }),

  /**
   * Uses the httpOnly refresh-token cookie — no token param needed.
   * Called automatically by the 401 interceptor in client.ts,
   * but can also be called manually on app startup for silent restore.
   */
  refresh: () =>
    apiRequest<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      _isRetry: true, // skip the interceptor loop for this call
    } as Parameters<typeof apiRequest>[1]),

  logout: () =>
    apiRequest<{ success: boolean; message: string }>("/api/auth/logout", {
      method: "POST",
    }),
};

