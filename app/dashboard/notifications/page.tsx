"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, ShieldAlert, ArrowRight } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">مركز الإشعارات وتنبيهات الأمان</h1>
          <p className="text-sm text-gray-400 mt-1">
            سجل كافة التحديثات الخاصة بحالة طلباتك، التغييرات المالية، ورسائل الدعم الفني.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold border border-amber-500/30 transition-all"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0E0E12] border border-white/5 space-y-3">
          <Bell className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-sm text-gray-400">لا توجد إشعارات جديدة حالياً.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                n.isRead
                  ? "bg-[#0E0E12] border-white/5 opacity-75"
                  : "bg-gradient-to-r from-amber-500/10 via-[#0E0E12] to-[#0E0E12] border-amber-500/30 shadow-lg shadow-amber-500/5"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type.includes("APPROVED") || n.type.includes("COMPLETED")
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : n.type.includes("REJECTED")
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {n.type.includes("COMPLETED") ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : n.type.includes("REJECTED") ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(n.createdAt).toLocaleString("ar-EG")}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                {n.actionUrl && (
                  <Link
                    href={n.actionUrl}
                    className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold hover:underline pt-1"
                  >
                    <span>عرض التفاصيل</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
