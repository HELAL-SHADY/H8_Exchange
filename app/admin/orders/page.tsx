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
import { getExplorerUrl } from "@/lib/order-utils";

export default function AdminOrdersPage() {
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
  const [txHashInput, setTxHashInput] = useState("");

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
    setTxHashInput(order.txHash || "");
  };

  const handleAction = async (action: "APPROVE" | "COMPLETE" | "REJECT" | "VERIFY") => {
    if (!selectedOrder) return;
    if (action === "REJECT" && !rejectionReason.trim()) {
      alert("يرجى كتابة سبب الرفض لتوضيحه للمستخدم");
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
          txHash: txHashInput || undefined,
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
          <h1 className="text-2xl font-black text-white">إدارة وتدقيق طلبات التداول</h1>
          <p className="text-xs text-gray-400 mt-1">
            مراجعة إيصالات الدفع، التحقق من مبالغ المعاملات، واعتماد صرف USDT والجنيه المصري.
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
              placeholder="ابحث برقم الطلب، اسم العميل، الهاتف، أو الـ TXID..."
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
              <option value="ALL">كل الحالات</option>
              <option value="PENDING_REVIEW">بانتظار المراجعة (Pending Review)</option>
              <option value="UNDER_VERIFICATION">تحت الفحص المصرفي</option>
              <option value="APPROVED">معتمد (Approved)</option>
              <option value="COMPLETED">مكتمل (Completed)</option>
              <option value="REJECTED">مرفوض (Rejected)</option>
              <option value="CANCELLED">ملغي (Cancelled)</option>
            </select>

            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">كل الأنواع</option>
              <option value="BUY">شراء USDT</option>
              <option value="SELL">بيع USDT</option>
            </select>

            <button
              onClick={() => {
                setPage(1);
                fetchOrders();
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-110"
            >
              بحث وتصفية
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-[#0E0E12] border border-white/5 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-400 mt-3">جاري تحميل سجل الطلبات...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            لا توجد طلبات مسجلة بهذه المعايير.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#14141A] text-gray-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4 font-semibold">رقم الطلب</th>
                  <th className="py-3 px-4 font-semibold">العميل</th>
                  <th className="py-3 px-4 font-semibold">النوع</th>
                  <th className="py-3 px-4 font-semibold">مبلغ USDT</th>
                  <th className="py-3 px-4 font-semibold">المبلغ (ج.م)</th>
                  <th className="py-3 px-4 font-semibold">وسيلة الدفع / الوجهة</th>
                  <th className="py-3 px-4 font-semibold">الحالة</th>
                  <th className="py-3 px-4 font-semibold">التاريخ</th>
                  <th className="py-3 px-4 font-semibold text-center">الإجراء والتدقيق</th>
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
                          {isBuy ? "شراء USDT" : "بيع USDT"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {ord.usdtAmount || ord.amount} USDT
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                        {ord.egpAmount ? `${ord.egpAmount} ج.م` : "-"}
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
                              : ord.status === "APPROVED"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          <span>{ord.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenReview(ord)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold inline-flex items-center gap-1 border border-amber-500/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>فحص واعتماد</span>
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
                  Order Review & Verification
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
                ✕ إغلاق
              </button>
            </div>

            {/* Financial Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/50 border border-white/5 text-xs">
              <div>
                <span className="text-gray-400">مبلغ USDT:</span>
                <p className="font-bold text-amber-400 text-sm font-mono mt-0.5">
                  {selectedOrder.usdtAmount || selectedOrder.amount} USDT
                </p>
              </div>
              <div>
                <span className="text-gray-400">المبلغ بالجنيه:</span>
                <p className="font-bold text-emerald-400 text-sm font-mono mt-0.5">
                  {selectedOrder.egpAmount || "-"} ج.م
                </p>
              </div>
              <div>
                <span className="text-gray-400">سعر الصرف المعتمد:</span>
                <p className="font-bold text-white text-sm font-mono mt-0.5">
                  {selectedOrder.rateSnapshot || "-"} EGP
                </p>
              </div>
              <div>
                <span className="text-gray-400">الحالة الحالية:</span>
                <p className="font-bold text-amber-300 text-sm mt-0.5">
                  {selectedOrder.status}
                </p>
              </div>
            </div>

            {/* User & Destination Information */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">اسم صاحب الطلب:</span>
                <span className="text-white font-bold">{selectedOrder.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">رقم الهاتف:</span>
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
                  <span className="text-gray-400">عنوان المحفظة / فودافون كاش:</span>
                  <span className="text-amber-400 font-mono font-bold break-all">{selectedOrder.walletNumber}</span>
                </div>
              )}
              {selectedOrder.network && (
                <div className="flex justify-between">
                  <span className="text-gray-400">الشبكة:</span>
                  <span className="text-white font-bold">{selectedOrder.network}</span>
                </div>
              )}
            </div>

            {/* Proof of Payment Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-300 block">إثبات الدفع والتحويل:</span>
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
                    <span>فتح الصورة بالحجم الكامل</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  لم يتم رفع إيصال دفع حتى الآن.
                </div>
              )}
            </div>

            {/* Transaction Hash */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300">
                  هاش المعاملة على البلوك تشين (TXID)
                </label>
                {selectedOrder.txHash && (
                  <a
                    href={getExplorerUrl(selectedOrder.network, selectedOrder.txHash) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    <span>فحص البلوك تشين</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={txHashInput}
                onChange={(e) => setTxHashInput(e.target.value)}
                placeholder="أدخل هاش التحويل لتأكيد إرسال العملات..."
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Admin Notes & Rejection Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">ملاحظة إدارية داخلية</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="ملاحظات المراجعة..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-red-400 block mb-1">سبب الرفض (في حالة الرفض)</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="إيصال غير واضح / عدم تطابق المبلغ..."
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
                رفض الطلب
              </button>
              <button
                type="button"
                disabled={modalActionLoading}
                onClick={() => handleAction("VERIFY")}
                className="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-xs font-bold border border-sky-500/30 disabled:opacity-50"
              >
                تحت الفحص المصرفي
              </button>
              <button
                type="button"
                disabled={modalActionLoading}
                onClick={() => handleAction("APPROVE")}
                className="px-4 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold border border-blue-500/30 disabled:opacity-50"
              >
                موافقة وبدء التحويل
              </button>
              <button
                type="button"
                disabled={modalActionLoading}
                onClick={() => handleAction("COMPLETE")}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                اكتمال الطلب بنجاح (Complete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
