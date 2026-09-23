import api from "../../../api/client";

export interface UnreadNotificationCount {
  count: number;
}

export interface DashboardNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  emphasizedText?: string;
  suffix?: string;
  time?: string;
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`);
}

export async function getUnreadNotification(): Promise<UnreadNotificationCount> {
  const response = await api.get<{ data: UnreadNotificationCount }>(
    "/notifications/unread-count",
  );
  return response.data.data;
}

export async function getAllNotifications(): Promise<DashboardNotification[]> {
  const response = await api.get<{ data: DashboardNotification[] }>(
    "/notifications",
  );
  return response.data.data;
}
