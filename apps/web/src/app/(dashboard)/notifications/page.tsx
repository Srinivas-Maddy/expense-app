"use client";

import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/use-notifications";

export default function NotificationsPage() {
  const notifications = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const typeStyles: Record<string, string> = {
    budget_alert: "bg-red-100 text-red-700",
    reminder: "bg-blue-100 text-blue-700",
    recurring_created: "bg-green-100 text-green-700",
    export_ready: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={() => markAllRead.mutate()}
          className="text-sm text-indigo-500 hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.data?.data.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border bg-white p-4 ${!n.isRead ? "border-indigo-200 bg-indigo-50/30" : ""}`}
            onClick={() => !n.isRead && markRead.mutate(n.id)}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${typeStyles[n.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {n.type.replace(/_/g, " ")}
                  </span>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                </div>
                <h3 className="mt-1 font-medium">{n.title}</h3>
                <p className="text-sm text-gray-600">{n.message}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {notifications.data?.data.length === 0 && (
          <p className="py-12 text-center text-gray-400">No notifications</p>
        )}
      </div>
    </div>
  );
}
