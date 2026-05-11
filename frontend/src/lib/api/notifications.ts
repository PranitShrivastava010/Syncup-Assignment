import { API_BASE_URL, apiRequest } from "./client";
import type {
  ApiNotification,
  AppNotification,
  NotificationPayload,
} from "@/types/notification";
import type { PaginationMeta, PaginationQuery } from "@/types/pagination";

type ApiListResponse<T> = {
  success: boolean;
  result: T;
  pagination?: PaginationMeta;
};

type ApiMutationResponse<T> = {
  success: boolean;
  result: T;
};

const parseNotificationPayload = (
  payload?: string | NotificationPayload | null
): NotificationPayload | null => {
  if (!payload) {
    return null;
  }

  if (typeof payload !== "string") {
    return payload;
  }

  try {
    const parsed = JSON.parse(payload);
    return parsed && typeof parsed === "object"
      ? (parsed as NotificationPayload)
      : null;
  } catch {
    return null;
  }
};

const buildPaginationQuery = (pagination: PaginationQuery = {}) => {
  const params = new URLSearchParams();

  if (pagination.page) {
    params.set("page", String(pagination.page));
  }

  if (pagination.limit) {
    params.set("limit", String(pagination.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const normalizeNotification = (
  notification: ApiNotification
): AppNotification => ({
  ...notification,
  payload: parseNotificationPayload(notification.payload),
});

export const buildNotificationSocketUrl = (token: string) => {
  const baseUrl = new URL(
    API_BASE_URL,
    typeof window === "undefined" ? "http://localhost:3000" : window.location.origin
  );

  baseUrl.protocol = baseUrl.protocol === "https:" ? "wss:" : "ws:";
  baseUrl.pathname = "/ws/notifications";
  baseUrl.search = "";
  baseUrl.searchParams.set("token", token);

  return baseUrl.toString();
};

export const notificationApi = {
  getMyNotifications: (token: string, pagination?: PaginationQuery) =>
    apiRequest<ApiListResponse<ApiNotification[]>>(
      `/api/notifications${buildPaginationQuery(pagination)}`,
      {
        method: "GET",
        authToken: token,
      }
    ),

  markAsRead: (token: string, notificationId: string) =>
    apiRequest<ApiMutationResponse<ApiNotification>>(
      `/api/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        authToken: token,
      }
    ),

  markAllAsRead: (token: string) =>
    apiRequest<ApiMutationResponse<{ count: number }>>(
      "/api/notifications/read-all",
      {
        method: "PATCH",
        authToken: token,
      }
    ),
};
