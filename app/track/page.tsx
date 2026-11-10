"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input, FormGroup, Label } from "@/components/ui/form";
import { PrimaryButton } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  ExternalLink,
  Copy,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";

interface Order {
  id: string;
  orderNumber?: string;
  type: "BUY" | "SELL";
  amount: number;
  usdtAmount?: number;
  egpAmount?: number;
  status: string;
  fullName: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  paymentMethod?: string;
  receiveMethod?: string;
  proofImageUrl?: string;
  rejectionReason?: string;
}

const StatusSteps = {
  PENDING_PAYMENT: 0,
  PENDING_REVIEW: 1,
  UNDER_VERIFICATION: 1,
  APPROVED: 1,
  REJECTED: 0,
  COMPLETED: 2,
};

const methodLabels: Record<string, string> = {
  VODAFONE_CASH: "Vodafone Cash",
  INSTAPAY: "InstaPay",
  BINANCE_PAY: "Binance Pay",
  BEP20: "BSC (BEP20)",
};

export default function TrackPage() {
  const { data: session } = useSession();
  const { t, locale } = useTranslation();
  const text = (ar: string, en: string) => locale === "ar" ? ar : en;
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Payment upload state
  const [file, setFile] = useState<File | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId");
    if (id) {
      setOrderId(id);
      trackOrder(id);
    }

    // Fetch site settings for payment details
    fetch("/api/admin/site-settings")
      .then((res) => res.json())
      .then((data) => setSiteSettings(data))
      .catch(console.error);
  }, []);

  const trackOrder = async (id: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/track?orderId=${encodeURIComponent(id.trim())}`);
      if (!response.ok) throw new Error(t("orderNotFound"));

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError((err as Error).message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      trackOrder(orderId);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm(text("هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟", "Are you sure you want to cancel this order?"))) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || text("فشل إلغاء الطلب", "Failed to cancel order"));
      alert(text("تم إلغاء الطلب بنجاح", "Order cancelled."));
      trackOrder(order.id);
    } catch (e: any) {
      alert(e.message || text("حدث خطأ أثناء الإلغاء", "Error cancelling the order"));
    } finally {
      setCancelling(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!file) {
      alert(t("uploadFirstError") || "يرجى اختيار صورة الإيصال أولاً");
      return;
    }
    setPaymentLoading(true);

    try {
      // 1. Upload proof image to Cloudinary
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || text("فشل تحميل صورة الإيصال", "Failed to upload payment proof"));
      }

      const proofImageUrl = uploadData.url;

      // Uploading proof advances the order to bank verification.
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofImageUrl,
          proofImageId: uploadData.publicId,
        }),
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.error || text("فشل تحديث حالة الطلب", "Failed to update order status"));
      }

      alert(text("تم رفع الإيصال بنجاح وبدأ الفحص المصرفي.", "Proof uploaded. Bank verification has started."));
      setFile(null);
      trackOrder(order.id);
    } catch (err: any) {
      alert(err.message || text("حدث خطأ أثناء رفع إثبات الدفع", "Error uploading payment proof"));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSubmittingReview(true);
    setReviewError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          rating,
          comment: reviewComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setReviewSuccess(true);
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const StatusDisplay: Record<string, any> = {
    PENDING_PAYMENT: { label: t("status_PENDING_PAYMENT") || "بانتظار الدفع", icon: Wallet, color: "yellow" },
    PENDING_REVIEW: { label: t("status_UNDER_VERIFICATION"), icon: Clock, color: "blue" },
    UNDER_VERIFICATION: { label: t("status_UNDER_VERIFICATION"), icon: Clock, color: "blue" },
    APPROVED: { label: t("status_UNDER_VERIFICATION"), icon: Clock, color: "blue" },
    REJECTED: { label: t("status_REJECTED") || "تم الرفض", icon: XCircle, color: "red" },
    COMPLETED: { label: t("status_COMPLETED") || "مكتمل بنجاح", icon: CheckCircle, color: "green" },
    CANCELLED: { label: text("ملغي", "Cancelled"), icon: XCircle, color: "red" },
  };

  // Determine transfer details based on payment method
  const getTransferDetails = () => {
    if (!order || !siteSettings) return null;
    if (order.type === "BUY") {
      if (order.paymentMethod === "VODAFONE_CASH") {
        return {
          label: text("رقم محفظة فودافون كاش الرسمية", "Official Vodafone Cash number"),
          value: siteSettings.vodafoneCashNumber || "010XXXXXXXX",
          isLink: false,
        };
      } else {
        const raw = siteSettings.instapayNumber || "https://ipn.eg/S/helal_shady/instapay/5zcP7G";
        const isUrl = raw.startsWith("http://") || raw.startsWith("https://") || raw.includes("ipn.eg");
        const fullUrl = isUrl
          ? raw.startsWith("http")
            ? raw
            : `https://${raw}`
          : `https://ipn.eg/S/${raw.replace(/@instapay/i, "")}/instapay`;

        return {
          label: text("رابط إنستا باي الرسمي", "Official InstaPay link"),
          value: raw,
          url: fullUrl,
          isLink: true,
        };
      }
    } else {
      return {
        label: text("عنوان إيداع USDT عبر شبكة BSC", "USDT deposit address on BSC"),
        value: siteSettings.usdtBep20Address || "",
        isLink: false,
      };
    }
  };

  const transferDetails = getTransferDetails();

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
              {t("trackOrderTitle")}
            </h1>
            <p className="text-gray-400 font-light">{t("trackOrderSubtitle")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <Card>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <FormGroup>
                    <Label htmlFor="orderId">{t("orderId")}</Label>
                    <Input
                      id="orderId"
                      placeholder="أدخل رقم الطلب مثلاً H8-BUY-261109-9VK4 أو المعرف..."
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </FormGroup>
                  <PrimaryButton type="submit" className="w-full">
                    {loading ? t("searching") : t("search")}
                  </PrimaryButton>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto mb-12 p-4 bg-red-600/20 border border-red-500/40 backdrop-blur-xl rounded-xl text-red-400 text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* PENDING PAYMENT STEP WITH INSTAPAY QUICK BUTTON & CANCEL */}
              {order.status === "PENDING_PAYMENT" && transferDetails && (
                <Card className="border-amber-500/60 shadow-[0_0_35px_rgba(245,185,66,0.15)] bg-gradient-to-br from-[#121218] via-[#0E0E12] to-black">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <Wallet className="text-amber-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(245,185,66,0.5)]" />
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {t("payPendingTitle")}
                          </h2>
                          <p className="text-gray-400 text-xs font-light">
                            {text("المطلوب تحويل:", "Amount to transfer:")}{" "}
                            <span className="text-amber-400 font-bold font-mono text-sm">
                              {order.egpAmount || order.amount} {order.type === "BUY" ? "EGP" : "USDT"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCancelOrder}
                        disabled={cancelling}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all disabled:opacity-50"
                      >
                        {cancelling ? text("جاري الإلغاء...", "Cancelling...") : text("إلغاء الطلب", "Cancel order")}
                      </button>
                    </div>

                    {/* Transfer Info Box */}
                    <div className="p-5 rounded-2xl bg-black/60 border border-amber-500/30 mb-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-400 font-bold">
                          {transferDetails.label}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {transferDetails.isLink ? text("دفع مباشر عبر التطبيق", "Pay directly in the app") : text("تحويل فودافون كاش", "Vodafone Cash transfer")}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                        <span className="font-mono text-sm sm:text-base text-white select-all font-bold break-all flex-1">
                          {transferDetails.value}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(transferDetails.value)}
                            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                          >
                            {copied ? text("تم النسخ!", "Copied!") : text("نسخ الرابط/الرقم", "Copy link/number")}
                          </button>

                          {transferDetails.isLink && (
                            <a
                              href={transferDetails.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all"
                            >
                              <span>فتح والدفع في InstaPay</span>
                              <ExternalLink size={15} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Screenshot submit form */}
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <FormGroup>
                        <Label htmlFor="proofImage" className="font-semibold text-white">
                          {t("uploadScreenshot") || "إرفاق صورة إيصال الدفع"}
                        </Label>
                        <input
                          id="proofImage"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white focus:outline-none focus:border-amber-500 transition-colors duration-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500 file:text-black file:font-semibold hover:file:opacity-90 cursor-pointer text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1 font-light">
                          {text("ارفع لقطة شاشة إيصال تحويل InstaPay أو Vodafone Cash لتأكيد طلبك.", "Upload a screenshot of your InstaPay or Vodafone Cash transfer.")}
                        </p>
                      </FormGroup>

                      <PrimaryButton
                        type="submit"
                        className="w-full py-3.5"
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? text("جاري رفع الإيصال...", "Uploading proof...") : text("تأكيد إرسال إيصال الدفع", "Submit payment proof")}
                      </PrimaryButton>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Order Info Card */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                    <h2 className="text-2xl font-bold">{t("orderDetails")}</h2>
                    {["PENDING_PAYMENT", "PENDING_REVIEW", "APPROVED"].includes(order.status) && (
                      <button
                        onClick={handleCancelOrder}
                        disabled={cancelling}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all"
                      >
                        {cancelling ? text("جاري الإلغاء...", "Cancelling...") : text("إلغاء هذا الطلب", "Cancel order")}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{t("orderId")}</p>
                      <p className="font-semibold text-lg font-mono text-amber-400">
                        {order.orderNumber || order.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{t("processType")}</p>
                      <p className="font-semibold text-lg text-amber-400">
                        {order.type === "BUY" ? text("شراء USDT", "Buy USDT") : text("بيع USDT", "Sell USDT")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{text("المبلغ المطلوب", "Amount")}</p>
                      <p className="font-semibold text-lg text-white font-mono">
                        {order.usdtAmount || order.amount} USDT
                        {order.egpAmount && (
                          <span className="text-xs text-emerald-400 block font-normal">
                            ({order.egpAmount} EGP)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{t("fullName")}</p>
                      <p className="font-semibold text-lg">{order.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{t("createdAt")}</p>
                      <p className="font-semibold">
                        {new Date(order.createdAt).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{t("currentStatus")}</p>
                      <p className="font-semibold text-amber-400">
                        {StatusDisplay[order.status]?.label || order.status}
                      </p>
                    </div>
                    {order.paymentMethod && (
                      <div>
                        <p className="text-gray-500 text-sm mb-1">
                          {order.type === "BUY" ? t("paymentMethod") : t("paymentMethodSell")}
                        </p>
                        <p className="font-semibold text-white">
                          {methodLabels[order.paymentMethod] || order.paymentMethod}
                        </p>
                      </div>
                    )}
                    {order.receiveMethod && (
                      <div>
                        <p className="text-gray-500 text-sm mb-1">
                          {order.type === "BUY" ? t("receiveMethod") : t("receiveMethodSell")}
                        </p>
                        <p className="font-semibold text-white">
                          {methodLabels[order.receiveMethod] || order.receiveMethod}
                        </p>
                      </div>
                    )}
                  </div>

                  {order.proofImageUrl && (
                    <div className="mt-6 pt-4 border-t border-white/5">
                      <p className="text-xs text-gray-400 mb-2">{text("إيصال الدفع المرفوع:", "Uploaded payment proof:")}</p>
                      <a
                        href={order.proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-amber-400 hover:underline font-bold"
                      >
                        <span>{text("عرض صورة الإيصال المرفوع", "View uploaded proof")}</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card>
                <CardContent className="py-6">
                  <h2 className="text-2xl font-bold mb-6">{t("statusHistory")}</h2>

                  {order.status === "REJECTED" ? (
                    <div className="p-4 bg-red-600/20 border border-red-600 rounded-lg">
                      <p className="text-red-400 font-semibold">{t("orderRejected")}</p>
                      <p className="text-red-300 text-sm mt-2">
                        {order.rejectionReason || t("orderRejectedDetail")}
                      </p>
                    </div>
                  ) : order.status === "CANCELLED" ? (
                    <div className="p-4 bg-red-600/20 border border-red-600/40 rounded-lg">
                      <p className="text-red-400 font-semibold">تم إلغاء هذا الطلب</p>
                      <p className="text-red-300 text-sm mt-1">تم إلغاء المعاملة بناءً على طلب العميل.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {[
                        {
                          step: 1,
                          title: t("status_PENDING_PAYMENT"),
                          date: order.createdAt,
                          completed: true,
                        },
                        {
                          step: 2,
                          title: t("status_UNDER_VERIFICATION"),
                          completed: StatusSteps[order.status as keyof typeof StatusSteps] >= 1,
                        },
                        {
                          step: 3,
                          title: t("status_COMPLETED"),
                          date: order.completedAt,
                          completed: StatusSteps[order.status as keyof typeof StatusSteps] >= 2,
                        },
                      ].map((s) => (
                        <div key={s.step} className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              s.completed
                                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_15px_rgba(245,185,66,0.5)]"
                                : "bg-white/[0.04] text-gray-500 border border-white/10"
                            }`}
                          >
                            {s.completed ? "✓" : s.step}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{s.title}</p>
                            {s.date && (
                              <p className="text-xs text-gray-500">
                                {new Date(s.date).toLocaleString(
                                  locale === "ar" ? "ar-EG" : "en-US"
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Section */}
              {order.status === "COMPLETED" && (
                <Card>
                  <CardContent className="py-6">
                    <h2 className="text-2xl font-bold mb-4">{t("reviewTitle") || "تقييم الخدمة"}</h2>
                    {reviewSuccess ? (
                      <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-center font-medium">
                        {t("reviewSuccess") || "تم تسجيل تقييمك بنجاح! شكراً لك."}
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        {reviewError && (
                          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400 text-sm">
                            {reviewError}
                          </div>
                        )}
                        <div>
                          <Label className="block mb-2">{t("rating")}</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-2xl ${
                                  star <= rating ? "text-amber-400" : "text-gray-600"
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <FormGroup>
                          <Label htmlFor="reviewComment">{t("yourComment") || "التعليق"}</Label>
                          <textarea
                            id="reviewComment"
                            rows={3}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder={t("writeOpinion") || "اكتب رأيك هنا..."}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-500 text-sm"
                          />
                        </FormGroup>
                        <PrimaryButton type="submit" disabled={submittingReview}>
                          {submittingReview ? (t("submittingReview") || "جاري الإرسال...") : (t("submitReview") || "إرسال التقييم")}
                        </PrimaryButton>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
