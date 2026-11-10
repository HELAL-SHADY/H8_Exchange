"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Download,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function AdminOrdersPage() {
  const { locale } = useTranslation();
  const text = (ar: string, en: string) => locale === "ar" ? ar : en;
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "ALL";

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(initialStatus);
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  // Selected Order for Review Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalActionLoading, setModalActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (type !== "ALL") params.set("type", type);
    if (search) params.set("search", search);
    params.set("page", page.toString());
    params.set("limit", "15");

    fetch(`/api/admin/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setPagination(data.pagination || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [status, type, page]);

  const handleOpenReview = (order: any) => {
    setSelectedOrder(order);
    setAdminNote(order.adminNote || "");
    setRejectionReason(order.rejectionReason || "");
  };

  const handleAction = async (action: "COMPLETE" | "REJECT") => {
    if (!selectedOrder) return;
    if (action === "REJECT" && !rejectionReason.trim()) {
      alert(text("يرجى كتابة سبب الرفض لتوضيحه للمستخدم", "Enter a rejection reason for the customer"));
      return;
    }

    setModalActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminNote,
          rejectionReason,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل تحديث الطلب");
      }

      setSelectedOrder(null);
      fetchOrders();
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setModalActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">{text("إدارة وتدقيق طلبات التداول", "Trading orders")}</h1>
          <p className="text-xs text-gray-400 mt-1">
            {text("مراجعة إثباتات الدفع والتحقق المصرفي ثم إكمال الطلب أو رفضه.", "Review payment proofs, verify transactions, then complete or reject orders.")}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0E0E12] border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={text("ابحث برقم الطلب، اسم العميل أو الهاتف...", "Search by order number, customer name, or phone...")}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{text("كل الحالات", "All statuses")}</option>
              <option value="PENDING_PAYMENT">{text("بانتظار الدفع", "Pending payment")}</option>
              <option value="UNDER_VERIFICATION">{text("الفحص المصرفي", "Bank verification")}</option>
              <option value="COMPLETED">{text("مكتمل", "Completed")}</option>
              <option value="REJECTED">{text("مرفوض", "Rejected")}</option>
              <option value="CANCELLED">{text("ملغي", "Cancelled")}</option>
            </select>

            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{text("كل الأنواع", "All types")}</option>
              <option value="BUY">{text("شراء USDT", "Buy USDT")}</option>
              <option value="SELL">{text("بيع USDT", "Sell USDT")}</option>
            </select>

            <button
              onClick={() => {
                setPage(1);
                fetchOrders();
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-110"
            >
              {text("بحث وتصفية", "Search and filter")}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-[#0E0E12] border border-white/5 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-400 mt-3">{text("جاري تحميل سجل الطلبات...", "Loading orders...")}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {text("لا توجد طلبات مسجلة بهذه المعايير.", "No orders match these filters.")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#14141A] text-gray-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4 font-semibold">{text("رقم الطلب", "Order number")}</th>
                  <th className="py-3 px-4 font-semibold">{text("العميل", "Customer")}</th>
                  <th className="py-3 px-4 font-semibold">{text("النوع", "Type")}</th>
                  <th className="py-3 px-4 font-semibold">USDT</th>
                  <th className="py-3 px-4 font-semibold">{text("المبلغ (EGP)", "Amount (EGP)")}</th>
                  <th className="py-3 px-4 font-semibold">{text("وسيلة الدفع / الوجهة", "Payment / destination")}</th>
                  <th className="py-3 px-4 font-semibold">{text("الحالة", "Status")}</th>
                  <th className="py-3 px-4 font-semibold">{text("التاريخ", "Date")}</th>
                  <th className="py-3 px-4 font-semibold text-center">{text("الإجراء", "Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((ord) => {
                  const isBuy = ord.type === "BUY";
                  return (
                    <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {ord.orderNumber || ord.id.slice(0, 10)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{ord.fullName || ord.user?.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{ord.phone || ord.user?.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBuy
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isBuy ? text("شراء USDT", "Buy USDT") : text("بيع USDT", "Sell USDT")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {ord.usdtAmount || ord.amount} USDT
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                        {ord.egpAmount ? `${ord.egpAmount} EGP` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        <div>{ord.paymentMethod || ord.receiveMethod || "-"}</div>
                        <div className="text-[10px] text-gray-500 font-mono break-all">
                          {ord.walletNumber || ord.binanceUid}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : ord.status === "REJECTED" || ord.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          <span>{ord.status === "PENDING_REVIEW" || ord.status === "APPROVED"
                            ? text("الفحص المصرفي", "Bank verification")
                            : ord.status === "UNDER_VERIFICATION"
                            ? text("الفحص المصرفي", "Bank verification")
                            : ord.status === "PENDING_PAYMENT"
                            ? text("بانتظار الدفع", "Pending payment")
                            : ord.status === "COMPLETED"
                            ? text("مكتمل", "Completed")
                            : ord.status === "REJECTED"
                            ? text("مرفوض", "Rejected")
                            : ord.status === "CANCELLED"
                            ? text("ملغي", "Cancelled")
                            : ord.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenReview(ord)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold inline-flex items-center gap-1 border border-amber-500/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{text("مراجعة الطلب", "Review order")}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#111116] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                          {text("مراجعة الطلب والفحص المصرفي", "Order review and bank verification")}
                </span>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <span>{selectedOrder.orderNumber || selectedOrder.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-amber-400 font-sans">
                    {selectedOrder.type}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕ {text("إغلاق", "Close")}
              </button>
            </div>

            {/* Financial Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/50 border border-white/5 text-xs">
              <div>
                <span className="text-gray-400">USDT:</span>
                <p className="font-bold text-amber-400 text-sm font-mono mt-0.5">
                  {selectedOrder.usdtAmount || selectedOrder.amount} USDT
                </p>
              </div>
              <div>
                <span className="text-gray-400">{text("المبلغ بالجنيه:", "Amount in EGP:")}</span>
                <p className="font-bold text-emerald-400 text-sm font-mono mt-0.5">
                  {selectedOrder.egpAmount || "-"} ج.م
                </p>
              </div>
              <div>
                <span className="text-gray-400">{text("سعر الصرف:", "Exchange rate:")}</span>
                <p className="font-bold text-white text-sm font-mono mt-0.5">
                  {selectedOrder.rateSnapshot || "-"} EGP
                </p>
              </div>
              <div>
                <span className="text-gray-400">{text("الحالة الحالية:", "Current status:")}</span>
                <p className="font-bold text-amber-300 text-sm mt-0.5">
                  {selectedOrder.status}
                </p>
              </div>
            </div>

            {/* User & Destination Information */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">{text("اسم صاحب الطلب:", "Customer name:")}</span>
                <span className="text-white font-bold">{selectedOrder.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{text("رقم الهاتف:", "Phone:")}</span>
                <span className="text-white font-mono">{selectedOrder.phone}</span>
              </div>
              {selectedOrder.binanceUid && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Binance / Platform UID:</span>
                  <span className="text-amber-400 font-mono font-bold">{selectedOrder.binanceUid}</span>
                </div>
              )}
              {selectedOrder.walletNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{text("عنوان المحفظة / رقم الدفع:", "Wallet / payment address:")}</span>
                  <span className="text-amber-400 font-mono font-bold break-all">{selectedOrder.walletNumber}</span>
                </div>
              )}
              {selectedOrder.network && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{text("الشبكة:", "Network:")}</span>
                  <span className="text-white font-bold">{selectedOrder.network}</span>
                </div>
              )}
            </div>

            {/* Proof of Payment Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-300 block">{text("إثبات الدفع والتحويل:", "Payment proof:")}</span>
              {selectedOrder.proofImageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black max-h-64">
                  <img
                    src={selectedOrder.proofImageUrl}
                    alt="Proof"
                    className="w-full h-full object-contain"
                  />
                  <a
                    href={selectedOrder.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-bold flex items-center gap-1 hover:bg-black"
                  >
                    <span>{text("فتح الصورة بالحجم الكامل", "Open full-size image")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  {text("لم يتم رفع إثبات دفع حتى الآن.", "No payment proof has been uploaded yet.")}
                </div>
              )}
            </div>

            {/* Admin Notes & Rejection Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">{text("ملاحظة إدارية داخلية", "Internal admin note")}</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={text("ملاحظات المراجعة...", "Review notes...")}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-red-400 block mb-1">{text("سبب الرفض", "Rejection reason")}</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={text("إيصال غير واضح / عدم تطابق المبلغ...", "Unclear proof / amount mismatch...")}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-white/5">
              <button
                type="button"
                disabled={modalActionLoading}
                onClick={() => handleAction("REJECT")}
                className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold border border-red-500/30 disabled:opacity-50"
              >
                {text("رفض الطلب", "Reject order")}
              </button>
              <button
                type="button"
                disabled={modalActionLoading || selectedOrder.status !== "UNDER_VERIFICATION"}
                onClick={() => handleAction("COMPLETE")}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {text("إكمال الطلب", "Complete order")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
