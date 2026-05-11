"use client";

import Link from "next/link";
import type { UIEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { ROUTES } from "@/routes/paths";
import type { AppNotification } from "@/types/notification";
import styles from "./candidate.module.css";

type CandidateNotificationCenterProps = {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string;
  connectionStatus: "idle" | "connecting" | "connected" | "disconnected";
  onLoadMore: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (notificationId: string) => void;
};

const formatNotificationTime = (value: string) => {
  const createdAt = new Date(value);

  if (Number.isNaN(createdAt.getTime())) {
    return "";
  }

  const diffInSeconds = Math.round((createdAt.getTime() - Date.now()) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of units) {
    const amount = Math.trunc(diffInSeconds / seconds);

    if (Math.abs(amount) >= 1) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        amount,
        unit
      );
    }
  }

  return "just now";
};

const getNotificationHref = (notification: AppNotification) => {
  if (notification.type === "APPLICATION_STATUS_UPDATED") {
    return ROUTES.candidateApplications;
  }

  if (notification.payload?.jobId) {
    return ROUTES.candidateJob(notification.payload.jobId);
  }

  return ROUTES.candidateApplications;
};

export function CandidateNotificationCenter({
  notifications,
  unreadCount,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
  onMarkAllRead,
  onMarkRead,
}: CandidateNotificationCenterProps) {
  const visibleNotifications = notifications;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;

    if (
      hasMore &&
      !isLoadingMore &&
      target.scrollHeight - target.scrollTop - target.clientHeight < 48
    ) {
      onLoadMore();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  return (
    <div className={styles.notificationPanel} ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Open notifications"
        className={styles.notificationBell}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell size={18} />
        {unreadCount > 0 ? <span className={styles.notificationDot} /> : null}
      </button>

      {isOpen ? (
        <section className={styles.notificationDropdown} aria-label="Notifications">
          <div className={styles.notificationHeader}>
            <div className={styles.notificationHeading}>
              <Bell size={16} />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 ? (
              <button
                className={styles.markAllButton}
                type="button"
                onClick={onMarkAllRead}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {error ? <p className={styles.notificationError}>{error}</p> : null}

          {isLoading ? (
            <p className={styles.notificationEmpty}>Loading updates...</p>
          ) : visibleNotifications.length === 0 ? (
            <p className={styles.notificationEmpty}>No notifications yet.</p>
          ) : (
            <div className={styles.notificationList} onScroll={handleScroll}>
              {visibleNotifications.map((notification) => (
                <article
                  className={`${styles.notificationItem} ${
                    notification.isRead ? "" : styles.notificationItemUnread
                  }`}
                  key={notification.id}
                >
                  <Link
                    className={styles.notificationLink}
                    href={getNotificationHref(notification)}
                    onClick={() => {
                      if (!notification.isRead) {
                        onMarkRead(notification.id);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <span>{formatNotificationTime(notification.createdAt)}</span>
                  </Link>
                  <button
                    aria-label={`Mark ${notification.title} as read`}
                    className={styles.markReadButton}
                    disabled={notification.isRead}
                    title="Mark as read"
                    type="button"
                    onClick={() => onMarkRead(notification.id)}
                  >
                    <Check size={14} />
                  </button>
                </article>
              ))}
              {isLoadingMore ? (
                <p className={styles.notificationEmpty}>Loading older updates...</p>
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
