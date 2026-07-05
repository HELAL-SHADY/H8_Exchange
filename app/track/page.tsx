"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input, FormGroup, Label } from "@/components/ui/form";
import { PrimaryButton } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertCircle, XCircle, Star, Wallet, ArrowRightLeft, CreditCard } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";

interface Order {
  id: string;
  type: "BUY" | "SELL";
  amount: number;
  status: string;
  fullName: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  paymentMethod?: string;
  receiveMethod?: string;
}

const StatusSteps = {
  PENDING_PAYMENT: 0,
  PENDING_REVIEW: 1,
  UNDER_VERIFICATION: 2,
  APPROVED: 3,
  REJECTED: 0,
  COMPLETED: 4,
};

const methodLabels: Record<string, string> = {
  VODAFONE_CASH: "Vodafone Cash",
  INSTAPAY: "InstaPay",
  BINANCE_PAY: "Binance Pay",
  BYBIT_PAY: "Bybit Pay",
};

export default function TrackPage() {
  const { data: session } = useSession();
  const { t, locale } = useTranslation();
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
      const response = await fetch(`/api/track?orderId=${id}`);
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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!file) {
      alert(t("uploadFirstError"));
      return;
    }
    setPaymentLoading(true);

    try {
      // 1. Upload proof image
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Failed to upload image");
      }

      const proofImageUrl = uploadData.url;

      // 2. Update order to PENDING_REVIEW
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PENDING_REVIEW",
          proofImageUrl,
        }),
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.error || "Failed to update order status");
      }

      alert(t("paymentSubmittedSuccess"));
      // Refresh order info
      trackOrder(order.id);
    } catch (err: any) {
      alert(err.message || "Error submitting payment");
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

  const StatusDisplay = {
    PENDING_PAYMENT: { label: t("status_PENDING_PAYMENT"), icon: Wallet, color: "yellow" },
    PENDING_REVIEW: { label: t("status_PENDING_REVIEW"), icon: Clock, color: "yellow" },
    UNDER_VERIFICATION: { label: t("status_UNDER_VERIFICATION"), icon: Clock, color: "blue" },
    APPROVED: { label: t("status_APPROVED"), icon: CheckCircle, color: "green" },
    REJECTED: { label: t("status_REJECTED"), icon: XCircle, color: "red" },
    COMPLETED: { label: t("status_COMPLETED"), icon: CheckCircle, color: "green" },
  };

  // Determine transfer details based on payment method
  const getTransferDetails = () => {
    if (!order || !siteSettings) return null;
    if (order.type === "BUY") {
      if (order.paymentMethod === "VODAFONE_CASH") {
        return {
          label: "Vodafone Cash Number",
          value: siteSettings.vodafoneCashNumber,
        };
      } else {
        return {
          label: "InstaPay Address",
          value: siteSettings.instapayNumber,
        };
      }
    } else {
      if (order.paymentMethod === "BINANCE_PAY") {
        return {
          label: "Binance UID",
          value: siteSettings.binanceUid,
        };
      } else {
        return {
          label: "Bybit Pay ID",
          value: siteSettings.bybitPayId,
        };
      }
    }
  };

  const transferDetails = getTransferDetails();

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">{t("trackOrderTitle")}</h1>
            <p className="text-gray-400">{t("trackOrderSubtitle")}</p>
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
                      placeholder={t("enterOrderId")}
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
              className="max-w-2xl mx-auto mb-12 p-4 bg-red-600/20 border border-red-600 rounded-lg text-red-400"
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
              {/* PENDING PAYMENT STEP */}
              {order.status === "PENDING_PAYMENT" && transferDetails && (
                <Card className="border-[#F5B942] border-2">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Wallet className="text-[#F5B942] w-8 h-8" />
                      <h2 className="text-2xl font-bold text-white">{t("payPendingTitle")}</h2>
                    </div>
                    <p className="text-gray-400 mb-6">{t("payPendingSubtitle")}</p>

                    <div className="bg-[#1A1A1A] p-5 rounded-xl border border-[#2D2D2D] mb-6 space-y-4">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">{t("transferToNumber").replace("{amount}", `${order.amount} ${order.type === "BUY" ? "EGP" : "USDT"}`)}</p>
                        <p className="font-bold text-[#F5B942] text-sm">{transferDetails.label}</p>
                        <div className="flex items-center justify-between mt-2 bg-[#0A0A0A] p-3 rounded-lg border border-[#3D3D3D]">
                          <span className="font-mono text-lg text-white select-all">{transferDetails.value}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(transferDetails.value)}
                            className="text-xs text-[#F5B942] hover:underline"
                          >
                            {copied ? t("copied") : t("copyNumber")}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Screenshot submit form */}
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <FormGroup>
                        <Label htmlFor="proofImage" className="font-semibold text-white">
                          {t("uploadScreenshot")}
                        </Label>
                        <input
                          id="proofImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D] border border-[#3D3D3D] text-white focus:outline-none focus:border-[#F5B942] transition-colors duration-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#F5B942] file:text-[#0A0A0A] file:font-semibold hover:file:opacity-90 cursor-pointer text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">{t("uploadScreenshotPlaceholder")}</p>
                      </FormGroup>

                      <PrimaryButton
                        type="submit"
                        className="w-full"
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? t("processing") : t("markAsPaid")}
                      </PrimaryButton>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Order Info Card */}
              <Card>
                <CardContent className="py-6">
                  <h2 className="text-2xl font-bold mb-6">{t("orderDetails")}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{t("orderId")}</p>
                      <p className="font-semibold text-lg">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{t("processType")}</p>
                      <p className="font-semibold text-lg text-[#F5B942]">
                        {order.type === "BUY" ? t("buyUsdtTitle") : t("sellUsdtTitle")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{t("amount")}</p>
                      <p className="font-semibold text-lg">
                        {order.amount} {order.type === "BUY" ? "EGP" : "USDT"}
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
                      <p className="font-semibold text-[#F5B942]">
                        {StatusDisplay[order.status as keyof typeof StatusDisplay]?.label || order.status}
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
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card>
                <CardContent className="py-6">
                  <h2 className="text-2xl font-bold mb-6">{t("statusHistory")}</h2>

                  {order.status === "REJECTED" ? (
                    <div className="p-4 bg-red-600/20 border border-red-600 rounded-lg">
                      <p className="text-red-400 font-semibold">{t("orderRejected")}</p>
                      <p className="text-red-300 text-sm mt-2">{t("orderRejectedDetail")}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {[
                        {
                          step: 1,
                          title: t("status_PENDING_REVIEW"),
                          date: order.createdAt,
                          completed:
                            StatusSteps[order.status as keyof typeof StatusSteps] >= 1,
                        },
                        {
                          step: 2,
                          title: t("status_UNDER_VERIFICATION"),
                          date: order.approvedAt,
                          completed:
                            StatusSteps[order.status as keyof typeof StatusSteps] >= 2,
                        },
                        {
                          step: 3,
                          title: t("status_APPROVED"),
                          date: order.approvedAt,
                          completed:
                            StatusSteps[order.status as keyof typeof StatusSteps] >= 3,
                        },
                        {
                          step: 4,
                          title: t("status_COMPLETED"),
                          date: order.completedAt,
                          completed:
                            StatusSteps[order.status as keyof typeof StatusSteps] >= 4,
                        },
                      ].map((step) => (
                        <div key={step.step} className="flex gap-4 items-start relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                              step.completed
                                ? "bg-[#F5B942] text-[#0A0A0A]"
                                : "bg-[#2D2D2D] text-gray-400"
                            }`}
                          >
                            {step.completed ? "✓" : step.step}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`font-semibold ${
                                step.completed ? "text-white" : "text-gray-500"
                              }`}
                            >
                              {step.title}
                            </p>
                            {step.completed && step.date && (
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(step.date).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Card */}
              {order.status === "COMPLETED" && (
                <Card>
                  <CardContent className="py-6">
                    <h3 className="font-bold text-lg mb-2">{t("reviewTitle")}</h3>
                    {reviewSuccess ? (
                      <div className="p-4 bg-green-950/30 border border-green-800 rounded-lg text-green-400">
                        {t("reviewSuccess")}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-400 text-sm">
                          {t("reviewInstruction")}
                        </p>

                        {!session ? (
                          <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#2D2D2D] text-center">
                            <p className="text-gray-400 text-sm mb-3">
                              {t("loginToReview")}
                            </p>
                            
                            <a
                              href={`/auth/login?callbackUrl=${encodeURIComponent(
                                typeof window !== "undefined" ? window.location.href : ""
                              )}`}
                              className="inline-block px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all text-sm"
                            >
                              {t("login")}
                            </a>
                          </div>
                        ) : (
                          <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">
                                {t("starRating")}
                              </label>
                              <div className="flex gap-2 font-light">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                  >
                                    <Star
                                      size={28}
                                      className={
                                        star <= rating
                                          ? "fill-[#F5B942] text-[#F5B942]"
                                          : "text-gray-600 hover:text-[#F5B942]"
                                      }
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor="reviewComment"
                                className="block text-sm text-gray-400 mb-2"
                              >
                                {t("yourComment")}
                              </label>
                              <textarea
                                id="reviewComment"
                                rows={3}
                                placeholder={t("writeOpinion")}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D] border border-[#3D3D3D] text-white placeholder-gray-500 focus:outline-none focus:border-[#F5B942] transition-colors resize-none text-sm"
                              />
                            </div>

                            {reviewError && (
                              <p className="text-red-400 text-sm">{reviewError}</p>
                            )}

                            <PrimaryButton
                              type="submit"
                              disabled={submittingReview}
                              className="w-full text-sm"
                            >
                              {submittingReview ? t("submittingReview") : t("submitReview")}
                            </PrimaryButton>
                          </form>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Support Card */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="font-bold mb-2">{t("needHelp")}</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {t("telegramSupport")}
                  </p>
                  
                  <a
                    href="https://t.me/HELAL_SHADY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b3] transition-colors text-sm"
                  >
                    {t("contactUs")}
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}