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

  refresh: () =>
    apiRequest<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      _isRetry: true,
    } as Parameters<typeof apiRequest>[1]),

  logout: () =>
    apiRequest<{ success: boolean; message: string }>("/api/auth/logout", {
      method: "POST",
    }),
};


