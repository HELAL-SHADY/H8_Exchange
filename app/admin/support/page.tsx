"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LifeBuoy, Search, MessageSquare, ChevronRight } from "lucide-react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    fetch("/api/support/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">تذاكر الدعم الفني واستفسارات العملاء</h1>
        <p className="text-xs text-gray-400 mt-1">
          متابعة مراسلات العملاء والرد على استفسارات تحويلات الكاش وشبكات USDT.
        </p>
      </div>

      <div className="rounded-3xl bg-[#0E0E12] border border-white/5 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            لا توجد تذاكر دعم فني حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#14141A] text-gray-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">رقم التذكرة</th>
                  <th className="py-3 px-4">العميل</th>
                  <th className="py-3 px-4">الموضوع</th>
                  <th className="py-3 px-4">القسم</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">آخر تحديث</th>
                  <th className="py-3 px-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{t.user?.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{t.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">{t.category}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(t.updatedAt).toLocaleString("ar-EG")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/dashboard/support/${t.id}`}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>رد ومتابعة</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
