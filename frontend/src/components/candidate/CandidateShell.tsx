"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  FileText,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { CandidateNotificationCenter } from "./CandidateNotificationCenter";
import { clearAuthSession } from "@/lib/auth/session";
import { useNotifications } from "@/lib/notifications/useNotifications";
import { ROUTES } from "@/routes/paths";
import type { AuthUser } from "@/types/auth";
import type { AppNotification } from "@/types/notification";
import styles from "./candidate.module.css";

type CandidateShellProps = {
  user: AuthUser;
  accessToken: string;
  title: string;
  subtitle: string;
  onNotification?: (notification: AppNotification) => void;
  children: React.ReactNode;
};

export function CandidateShell({
  user,
  accessToken,
  title,
  subtitle,
  onNotification,
  children,
}: CandidateShellProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    error,
    connectionStatus,
    hasMore,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications(accessToken, { onNotification });

  useEffect(() => {
    router.prefetch(ROUTES.candidateJobs);
    router.prefetch(ROUTES.candidateApplications);
  }, [router]);

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    clearAuthSession();
    router.replace(ROUTES.login);
  };

  return (
    <main className={styles.page}>
      <button
        aria-expanded={isSidebarOpen}
        aria-label="Toggle navigation"
        className={styles.mobileMenuButton}
        type="button"
        onClick={() => setIsSidebarOpen((current) => !current)}
      >
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        <span>Menu</span>
      </button>

      {isSidebarOpen ? (
        <button
          aria-label="Close navigation"
          className={styles.mobileBackdrop}
          type="button"
          onClick={closeSidebar}
        />
      ) : null}

      <aside
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <Link
          className={styles.brand}
          href={ROUTES.candidateJobs}
          onClick={closeSidebar}
        >
          <span>Syncup</span>
        </Link>

        <nav className={styles.sidebarNav} aria-label="Candidate navigation">
          <Link href={ROUTES.candidateJobs} onClick={closeSidebar}>
            <BriefcaseBusiness size={17} />
            Jobs
          </Link>
          <Link href={ROUTES.candidateApplications} onClick={closeSidebar}>
            <FileText size={17} />
            Applications
          </Link>
        </nav>

        <div className={styles.userBox}>
          <UserRound size={18} />
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <button className={styles.logoutButton} type="button" onClick={handleLogout}>
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p>Candidate Workspace</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
          </div>
          <div className={styles.headerActions}>
            <Link className={styles.headerAction} href={ROUTES.candidateApplications}>
              <FileText size={18} />
              Applications
            </Link>
            <CandidateNotificationCenter
              connectionStatus={connectionStatus}
              error={error}
              hasMore={hasMore}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              notifications={notifications}
              unreadCount={unreadCount}
              onLoadMore={loadMoreNotifications}
              onMarkAllRead={() => {
                void markAllAsRead();
              }}
              onMarkRead={(notificationId) => {
                void markAsRead(notificationId);
              }}
            />
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
