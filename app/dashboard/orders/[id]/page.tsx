"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Upload,
  Copy,
  ExternalLink,
  Shield,
  FileText,
  CreditCard,
} from "lucide-react";
import { getExplorerUrl } from "@/lib/order-utils";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [txInput, setTxInput] = useState("");
  const [copyNotice, setCopyNotice] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const fetchOrder = () => {
    fetch(`/api/orders/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();

    fetch("/api/admin/site-settings")
      .then((res) => res.json())
      .then(setSiteSettings)
      .catch(console.error);
  }, [params.id]);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const upRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const upData = await upRes.json();
      if (!upRes.ok) {
        throw new Error(upData.error || "فشل تحميل إيصال الدفع");
      }

      // Update Order with new proof
      const patchRes = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofImageUrl: upData.url,
          proofImageId: upData.publicId,
        }),
      });

      const patchData = await patchRes.json();
      if (!patchRes.ok) {
        throw new Error(patchData.error || "فشل تحديث الطلب");
      }

      alert("تم رفع إثبات الدفع بنجاح وجاري مراجعته من الإدارة!");
      fetchOrder();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء رفع الإيصال");
    } finally {
      setUploading(false);
    }
  };

  const handleTxSubmit = async () => {
    if (!txInput.trim()) return;
    try {
      const patchRes = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: txInput.trim() }),
      });
      if (!patchRes.ok) throw new Error("فشل إرسال هاش المعاملة");
      setTxInput("");
      fetchOrder();
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟")) return;
    setCancelling(true);
    try {
      const patchRes = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      const data = await patchRes.json();
      if (!patchRes.ok) throw new Error(data.error || "فشل إلغاء الطلب");
      alert("تم إلغاء الطلب بنجاح");
      fetchOrder();
    } catch (err: any) {
      alert(err.message || "فشل الإلغاء");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">الطلب غير موجود أو ليس لديك صلاحية الوصول إليه</h2>
        <Link href="/dashboard/orders" className="text-amber-400 text-sm font-semibold hover:underline">
          العودة إلى قائمة الطلبات
        </Link>
      </div>
    );
  }

  const isBuy = order.type === "BUY";
  const explorerLink = getExplorerUrl(order.network, order.txHash);

  // Status timeline steps
  const steps = [
    { key: "PENDING_PAYMENT", label: "إنشاء الطلب والدفع" },
    { key: "PENDING_REVIEW", label: "مراجعة إثبات الدفع" },
    { key: "APPROVED", label: "الموافقة وجاري التحويل" },
    { key: "COMPLETED", label: "اكتمل بنجاح" },
  ];

  const getStepIndex = (st: string) => {
    if (st === "COMPLETED") return 3;
    if (st === "APPROVED") return 2;
    if (st === "PENDING_REVIEW" || st === "UNDER_VERIFICATION") return 1;
    return 0;
  };

  const currentStep = getStepIndex(order.status);
  const isFailed = order.status === "REJECTED" || order.status === "CANCELLED";

  // InstaPay & payment account details
  const instapayRaw = siteSettings?.instapayNumber || "";
  const isInstapayLink =
    instapayRaw.includes("ipn.eg") ||
    instapayRaw.startsWith("http://") ||
    instapayRaw.startsWith("https://");
  const instapayUrl = isInstapayLink
    ? instapayRaw.startsWith("http")
      ? instapayRaw
      : `https://${instapayRaw}`
    : `https://ipn.eg/S/${instapayRaw.replace(/@instapay/i, "")}/instapay`;

  const vodafoneNumber = siteSettings?.vodafoneCashNumber || "";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white font-mono">
                {order.orderNumber || order.id}
              </h1>
              <button
                onClick={() => handleCopy(order.orderNumber || order.id)}
                className="text-gray-400 hover:text-white"
                title="نسخ رقم الطلب"
              >
                <Copy className="w-4 h-4" />
              </button>
              {copyNotice && <span className="text-[10px] text-amber-400 font-bold">تم النسخ!</span>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              تاريخ الإنشاء: {new Date(order.createdAt).toLocaleString("ar-EG")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {["PENDING_PAYMENT", "PENDING_REVIEW"].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all disabled:opacity-50"
            >
              {cancelling ? "جاري الإلغاء..." : "إلغاء الطلب"}
            </button>
          )}
          <Link
            href="/dashboard/support"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10"
          >
            طلب مساعدة بخصوص هذا الطلب
          </Link>
        </div>
      </div>

      {/* Visual Timeline */}
      {!isFailed && (
        <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {steps.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPast
                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                        : isCurrent
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 animate-pulse"
                        : "bg-white/5 text-gray-500 border border-white/10"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? "text-amber-400" : isPast ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rejection / Cancellation Notice */}
      {isFailed && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-400">
              {order.status === "REJECTED" ? "تم رفض هذا الطلب من قبل الإدارة" : "تم إلغاء هذا الطلب"}
            </h4>
            <p className="text-xs text-red-300/80">
              {order.rejectionReason || order.adminNote || "إذا كان لديك أي استفسار يرجى فتح تذكرة دعم فني."}
            </p>
          </div>
        </div>
      )}

      {/* INSTAPAY & VODAFONE CASH QUICK PAYMENT BOX FOR PENDING ORDERS */}
      {isBuy && order.status === "PENDING_PAYMENT" && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#121218] to-black border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,185,66,0.15)] space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-amber-400" />
            <div>
              <h3 className="text-lg font-extrabold text-white">بيانات الدفع والتحويل الفوري</h3>
              <p className="text-xs text-gray-300">
                يرجى تحويل مبلغ{" "}
                <span className="font-bold text-amber-400 font-mono text-sm">
                  {order.egpAmount || order.amount} ج.م
                </span>{" "}
                لإتمام تنفيذ طلب شراء {order.usdtAmount} USDT
              </p>
            </div>
          </div>

          {order.paymentMethod === "INSTAPAY" ? (
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-bold">
                  حساب إنستا باي الرسمي (InstaPay):
                </span>
                <span className="text-[11px] text-gray-400">تحويل فوري بدون عمولة</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="font-mono text-sm sm:text-base text-white select-all font-bold break-all">
                  {instapayRaw || "https://ipn.eg/S/helal_shady/instapay/5zcP7G"}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(instapayRaw || "https://ipn.eg/S/helal_shady/instapay/5zcP7G")}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    {copyNotice ? "تم النسخ!" : "نسخ الرابط"}
                  </button>

                  <a
                    href={instapayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span>فتح والدفع في InstaPay</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-bold">
                  رقم محفظة فودافون كاش الرسمية:
                </span>
                <span className="text-[11px] text-gray-400">إيداع كاش</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="font-mono text-base text-white select-all font-bold">
                  {vodafoneNumber || "010XXXXXXXX"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(vodafoneNumber)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-110"
                >
                  {copyNotice ? "تم النسخ!" : "نسخ الرقم"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial Breakdown & Order Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>تفاصيل المعاملة والحسابات المالية (Permanent Snapshot)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              <div>
                <span className="text-xs text-gray-400">نوع الطلب</span>
                <p className="text-sm font-bold text-white mt-1">
                  {isBuy ? "شراء USDT" : "بيع USDT"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">المبلغ بالدولار</span>
                <p className="text-sm font-bold text-amber-400 mt-1 font-mono">
                  {order.usdtAmount || order.amount} USDT
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">المبلغ بالجنيه المصري</span>
                <p className="text-sm font-bold text-emerald-400 mt-1 font-mono">
                  {order.egpAmount ? `${order.egpAmount} ج.م` : "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">سعر الصرف المعتمد</span>
                <p className="text-sm font-medium text-white mt-1">
                  {order.rateSnapshot ? `${order.rateSnapshot} EGP` : "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">طريقة الدفع</span>
                <p className="text-sm font-medium text-white mt-1">
                  {order.paymentMethod || "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">طريقة الاستلام</span>
                <p className="text-sm font-medium text-white mt-1">
                  {order.receiveMethod || "-"}
                </p>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                بيانات الاستلام والوجهة
              </h4>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">اسم صاحب الحساب:</span>
                  <span className="text-white font-medium">{order.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">رقم الهاتف المسجل:</span>
                  <span className="text-white font-mono">{order.phone}</span>
                </div>
                {order.binanceUid && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Binance / Platform UID:</span>
                    <span className="text-amber-400 font-mono font-bold">{order.binanceUid}</span>
                  </div>
                )}
                {order.walletNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">عنوان المحفظة / رقم الكاش:</span>
                    <span className="text-amber-400 font-mono font-bold break-all">
                      {order.walletNumber}
                    </span>
                  </div>
                )}
                {order.network && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">شبكة البلوك تشين:</span>
                    <span className="text-white font-bold">{order.network}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Blockchain TXID Section */}
            {order.txHash && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold">معرف المعاملة (TXID)</span>
                  {explorerLink && (
                    <a
                      href={explorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>فحص على البلوك تشين</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-white font-mono break-all bg-black/40 p-2.5 rounded-xl border border-white/5">
                  {order.txHash}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Proof of Payment & Actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">إثبات الدفع والتحويل</h3>

            {order.proofImageUrl ? (
              <div className="space-y-3">
                <a
                  href={order.proofImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative rounded-2xl overflow-hidden border border-white/10 group aspect-video bg-black"
                >
                  <img
                    src={order.proofImageUrl}
                    alt="Proof of payment"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                    <span>اضغط لتكبير الصورة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم رفع الإيصال بنجاح وهو قيد المراجعة</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  يرجى إرفاق صورة إيصال التحويل البنكي أو فودافون كاش / إنستا باي لتأكيد طلبك.
                </p>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-500/30 rounded-2xl hover:border-amber-500/60 transition-all cursor-pointer bg-amber-500/5 group">
                  <Upload className="w-6 h-6 text-amber-400 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-xs font-bold text-amber-400 mt-2">
                    {uploading ? "جاري الرفع إلى الخادم..." : "اختر صورة الإيصال"}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1">JPG, PNG أو PDF (الحد الأقصى 10MB)</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}

            {/* If Sell order and no TXID yet, prompt user */}
            {!isBuy && !order.txHash && order.status !== "CANCELLED" && (
              <div className="pt-4 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-amber-400">إدخال هاش المعاملة (TXID)</h4>
                <input
                  type="text"
                  value={txInput}
                  onChange={(e) => setTxInput(e.target.value)}
                  placeholder="الصق هاش التحويل هنا..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  onClick={handleTxSubmit}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20"
                >
                  تأكيد إرسال الـ TXID
                </button>
              </div>
            )}
          </div>

          {/* Status Transitions Audit Trail */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                سجل حالات الطلب (Audit Trail)
              </h4>
              <div className="space-y-2 text-xs">
                {order.statusHistory.map((h: any) => (
                  <div key={h.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex justify-between items-center text-amber-400 font-semibold">
                      <span>{h.toStatus}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {new Date(h.createdAt).toLocaleTimeString("ar-EG")}
                      </span>
                    </div>
                    {h.note && <p className="text-[11px] text-gray-300 mt-1">{h.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
