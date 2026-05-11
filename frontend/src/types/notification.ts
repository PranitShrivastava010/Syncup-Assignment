export type NotificationPayload = {
  applicationId?: string;
  jobId?: string;
  status?: string;
  [key: string]: unknown;
};

export type AppNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  payload: NotificationPayload | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
};

export type ApiNotification = Omit<AppNotification, "payload"> & {
  payload?: string | NotificationPayload | null;
};

export type NotificationSocketMessage =
  | {
      type: "CONNECTED";
      message: string;
    }
  | {
      type: "NOTIFICATION";
      data: ApiNotification;
    };
