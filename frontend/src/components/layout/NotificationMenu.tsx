import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "../../features/dashboard/player/api";
import { useAllNotifications } from "../../features/dashboard/player/hooks/useAllNotifications";
import { useUnreadNotification } from "../../features/dashboard/player/hooks/useUnReadNotification";

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const notificationsQuery = useAllNotifications();
  const unreadQuery = useUnreadNotification();
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadQuery.data?.count ?? 0;

  function refreshNotifications() {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: refreshNotifications,
    onError: (error) => toast.error(error.message),
  });

  const markOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: refreshNotifications,
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-lg p-2 text-cream hover:bg-white/10"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-amber px-1.5 text-[10px] font-bold text-pitch-dark">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-line bg-chalk p-4 text-ink shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Notifications</h2>
            <button
              type="button"
              disabled={markAll.isPending || !notifications.some((item) => !item.isRead)}
              onClick={() => markAll.mutate()}
              className="text-xs font-semibold text-turf disabled:opacity-50"
            >
              Mark all read
            </button>
          </div>

          <div className="mt-3 max-h-80 divide-y divide-line overflow-y-auto">
            {notificationsQuery.isPending ? (
              <p className="py-4 text-sm text-ink-soft">Loading notifications...</p>
            ) : notificationsQuery.isError ? (
              <p className="py-4 text-sm text-danger">Could not load notifications.</p>
            ) : notifications.length === 0 ? (
              <p className="py-4 text-sm text-ink-soft">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className="py-3">
                  <div className="flex items-start gap-2">
                    {!notification.isRead && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{notification.title}</p>
                      <p className="mt-1 text-sm text-ink-soft">{notification.message}</p>
                      {!notification.isRead && (
                        <button
                          type="button"
                          disabled={markOne.isPending}
                          onClick={() => markOne.mutate(notification._id)}
                          className="mt-2 text-xs font-semibold text-turf disabled:opacity-50"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
