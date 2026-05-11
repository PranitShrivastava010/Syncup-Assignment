"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildNotificationSocketUrl,
  normalizeNotification,
  notificationApi,
} from "@/lib/api/notifications";
import type {
  AppNotification,
  NotificationSocketMessage,
} from "@/types/notification";
import type { PaginationMeta } from "@/types/pagination";

type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected";

type UseNotificationsOptions = {
  onNotification?: (notification: AppNotification) => void;
};

const MAX_NOTIFICATIONS = 20;

const parseSocketMessage = (data: unknown): NotificationSocketMessage | null => {
  if (typeof data !== "string") {
    return null;
  }

  try {
    return JSON.parse(data) as NotificationSocketMessage;
  } catch {
    return null;
  }
};

export const useNotifications = (
  token?: string | null,
  options: UseNotificationsOptions = {}
) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const onNotificationRef = useRef(options.onNotification);

  useEffect(() => {
    onNotificationRef.current = options.onNotification;
  }, [options.onNotification]);

  const loadNotificationsPage = useCallback(
    async (page: number, append = false) => {
      if (!token) {
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      try {
        const response = await notificationApi.getMyNotifications(token, {
          page,
          limit: MAX_NOTIFICATIONS,
        });
        const nextNotifications = response.result.map(normalizeNotification);

        setNotifications((currentNotifications) =>
          append
            ? [
                ...currentNotifications,
                ...nextNotifications.filter(
                  (notification) =>
                    !currentNotifications.some(
                      (current) => current.id === notification.id
                    )
                ),
              ]
            : nextNotifications
        );
        setPagination(response.pagination ?? null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load notifications."
        );
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setPagination(null);
      return;
    }

    void loadNotificationsPage(1);
  }, [loadNotificationsPage, token]);

  useEffect(() => {
    if (!token) {
      setConnectionStatus("idle");
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let shouldReconnect = true;
    let retryAttempt = 0;

    const connect = () => {
      setConnectionStatus("connecting");
      socket = new WebSocket(buildNotificationSocketUrl(token));

      socket.onopen = () => {
        retryAttempt = 0;
        setConnectionStatus("connected");
      };

      socket.onmessage = (event) => {
        const message = parseSocketMessage(event.data);

        if (message?.type !== "NOTIFICATION") {
          return;
        }

        const notification = normalizeNotification(message.data);

        setNotifications((currentNotifications) => {
          const withoutDuplicate = currentNotifications.filter(
            (item) => item.id !== notification.id
          );

          return [notification, ...withoutDuplicate];
        });

        setPagination((currentPagination) =>
          currentPagination
            ? {
                ...currentPagination,
                total: currentPagination.total + 1,
              }
            : currentPagination
        );

        onNotificationRef.current?.(notification);
      };

      socket.onerror = () => {
        setConnectionStatus("disconnected");
      };

      socket.onclose = () => {
        if (!shouldReconnect) {
          return;
        }

        setConnectionStatus("disconnected");
        const retryDelay = Math.min(1000 * 2 ** retryAttempt, 10000);
        retryAttempt += 1;
        reconnectTimer = window.setTimeout(connect, retryDelay);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;

      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }

      if (!socket) {
        return;
      }

      const closingSocket = socket;
      closingSocket.onmessage = null;
      closingSocket.onerror = null;
      closingSocket.onclose = null;

      if (closingSocket.readyState === WebSocket.CONNECTING) {
        closingSocket.onopen = () => closingSocket.close();
        return;
      }

      if (closingSocket.readyState === WebSocket.OPEN) {
        closingSocket.close();
      }
    };
  }, [token]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const loadMoreNotifications = useCallback(() => {
    if (!pagination?.hasNextPage || isLoadingMore) {
      return;
    }

    void loadNotificationsPage(pagination.page + 1, true);
  }, [isLoadingMore, loadNotificationsPage, pagination]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!token) {
        return;
      }

      try {
        const response = await notificationApi.markAsRead(token, notificationId);
        const updatedNotification = normalizeNotification(response.result);

        setNotifications((currentNotifications) =>
          currentNotifications.map((notification) =>
            notification.id === notificationId
              ? updatedNotification
              : notification
          )
        );
      } catch (markError) {
        setError(
          markError instanceof Error
            ? markError.message
            : "Unable to update notification."
        );
      }
    },
    [token]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token || unreadCount === 0) {
      return;
    }

    try {
      await notificationApi.markAllAsRead(token);
      const readAt = new Date().toISOString();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? readAt,
        }))
      );
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : "Unable to update notifications."
      );
    }
  }, [token, unreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    error,
    connectionStatus,
    hasMore: Boolean(pagination?.hasNextPage),
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
  };
};
