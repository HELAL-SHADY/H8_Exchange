"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type !== "ALL") params.set("type", type);
    if (status !== "ALL") params.set("status", status);
    params.set("page", page.toString());
    params.set("limit", "10");

    fetch(`/api/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setOrders(res.orders || []);
        setPagination(res.pagination || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, type, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة طلباتي</h1>
          <p className="text-sm text-gray-400 mt-1">
            سجل وتفاصيل كافة طلبات بيع وشراء USDT الخاصة بك مع التتبع اللحظي للحالة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/buy"
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20"
          >
            + شراء جديد
          </Link>
          <Link
            href="/sell"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10"
          >
            + بيع جديد
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-[#111116] border border-white/5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم الطلب، المعرف، أو هاش المعاملة..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">جميع الأنواع</option>
              <option value="BUY">شراء USDT</option>
              <option value="SELL">بيع USDT</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="PENDING_PAYMENT">بانتظار الدفع</option>
              <option value="PENDING_REVIEW">بانتظار المراجعة</option>
              <option value="APPROVED">معتمد وجاري التحويل</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="REJECTED">مرفوض</option>
              <option value="CANCELLED">ملغي</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold border border-amber-500/30"
            >
              تصفية
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-[#0E0E12] border border-white/5 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-400 mt-3">جاري تحميل سجل الطلبات...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-sm text-gray-400">لا توجد طلبات تطابق معايير البحث الحالية.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#14141A] text-gray-400 text-xs border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">رقم الطلب</th>
                  <th className="py-3.5 px-4 font-semibold">النوع</th>
                  <th className="py-3.5 px-4 font-semibold">المبلغ (USDT)</th>
                  <th className="py-3.5 px-4 font-semibold">المبلغ (EGP)</th>
                  <th className="py-3.5 px-4 font-semibold">السعر المطبق</th>
                  <th className="py-3.5 px-4 font-semibold">الحالة</th>
                  <th className="py-3.5 px-4 font-semibold">تاريخ الإنشاء</th>
                  <th className="py-3.5 px-4 font-semibold text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((ord) => {
                  const isBuy = ord.type === "BUY";
                  return (
                    <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-amber-400 text-xs">
                        {ord.orderNumber || ord.id.slice(0, 10)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold ${
                            isBuy
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isBuy ? "شراء USDT" : "بيع USDT"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {ord.usdtAmount || ord.amount} USDT
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {ord.egpAmount ? `${ord.egpAmount} ج.م` : "-"}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">
                        {ord.rateSnapshot ? `${ord.rateSnapshot} EGP` : "-"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : ord.status === "REJECTED" || ord.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {ord.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                          {ord.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                          {ord.status.includes("PENDING") && <Clock className="w-3 h-3" />}
                          <span>{ord.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">
                        {new Date(ord.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link
                          href={`/dashboard/orders/${ord.id}`}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                        >
                          <span>عرض</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              صفحة {pagination.page} من {pagination.totalPages} (إجمالي {pagination.total} طلب)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
