"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, XCircle, Clock, Check, ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const { locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for live notification updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, actionUrl?: string | null) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: true }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (actionUrl) {
        setIsOpen(false);
        router.push(actionUrl);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return locale === "ar" ? "الآن" : "Just now";
      if (diffMins < 60) return locale === "ar" ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
      if (diffHours < 24) return locale === "ar" ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
      return locale === "ar" ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER_COMPLETED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case "ORDER_APPROVED":
        return <CheckCircle2 className="w-5 h-5 text-[#F5B942] shrink-0" />;
      case "ORDER_REJECTED":
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-lg bg-[#141414] hover:bg-[#202020] border border-[#2D2D2D] text-gray-300 hover:text-white transition-all focus:outline-none"
        title={locale === "ar" ? "الإشعارات" : "Notifications"}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-300 hover:text-[#F5B942] transition-colors" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-[#0A0A0A] bg-[#F5B942] rounded-full shadow-lg shadow-[#F5B942]/40 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          dir={locale === "ar" ? "rtl" : "ltr"}
          className={`absolute ${
            locale === "ar" ? "left-0 sm:left-auto sm:right-0" : "right-0"
          } mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-[#141414] border border-[#2D2D2D] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border-b border-[#2D2D2D]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">
                {locale === "ar" ? "الإشعارات" : "Notifications"}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/30">
                  {unreadCount} {locale === "ar" ? "جديد" : "new"}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-gray-400 hover:text-[#F5B942] flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{locale === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#242424]">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-gray-400" />
                <p className="text-sm">
                  {locale === "ar" ? "لا توجد إشعارات حتى الآن" : "No notifications yet"}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.actionUrl)}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                    !n.isRead
                      ? "bg-[#1C180E] hover:bg-[#252014] border-r-2 border-[#F5B942]"
                      : "hover:bg-[#1A1A1A]"
                  }`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          !n.isRead ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 shrink-0">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-1.5">
                      {n.message}
                    </p>

                    {n.actionUrl && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#F5B942] hover:underline font-medium">
                        <span>{locale === "ar" ? "عرض التفاصيل" : "View Details"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#F5B942] mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-[#171717] border-t border-[#2D2D2D] text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/my-orders");
              }}
              className="text-xs text-gray-400 hover:text-[#F5B942] transition-colors"
            >
              {locale === "ar" ? "عرض جميع طلباتي ⬅" : "View all my orders ➡"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
