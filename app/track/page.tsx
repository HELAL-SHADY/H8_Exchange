"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input, FormGroup, Label } from "@/components/ui/form";
import { PrimaryButton } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertCircle, XCircle, Star } from "lucide-react";
import { useSession } from "next-auth/react";

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
}

const StatusSteps = {
  PENDING_REVIEW: 1,
  UNDER_VERIFICATION: 2,
  APPROVED: 3,
  REJECTED: 0,
  COMPLETED: 4,
};

const StatusDisplay = {
  PENDING_REVIEW: { label: "قيد المراجعة", icon: Clock, color: "yellow" },
  UNDER_VERIFICATION: { label: "التحقق جاري", icon: Clock, color: "blue" },
  APPROVED: { label: "موافق عليه", icon: CheckCircle, color: "green" },
  REJECTED: { label: "مرفوض", icon: XCircle, color: "red" },
  COMPLETED: { label: "مكتمل", icon: CheckCircle, color: "green" },
};

export default function TrackPage() {
  const { data: session } = useSession();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Review states
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

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
        throw new Error(data.error || "فشل إرسال التقييم");
      }

      setReviewSuccess(true);
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId");
    if (id) {
      setOrderId(id);
      trackOrder(id);
    }
  }, []);

  const trackOrder = async (id: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/track?orderId=${id}`);
      if (!response.ok) throw new Error("Order not found");

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
            <h1 className="text-4xl font-bold mb-4">تتبع الطلب</h1>
            <p className="text-gray-400">
              أدخل رقم الطلب لتتبع حالة عمليتك
            </p>
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
                    <Label htmlFor="orderId">رقم الطلب</Label>
                    <Input
                      id="orderId"
                      placeholder="أدخل رقم الطلب"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </FormGroup>
                  <PrimaryButton type="submit" className="w-full">
                    {loading ? "جاري البحث..." : "بحث"}
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
              {/* Order Info Card */}
              <Card>
                <CardContent>
                  <h2 className="text-2xl font-bold mb-6">تفاصيل الطلب</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">رقم الطلب</p>
                      <p className="font-semibold text-lg">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">نوع العملية</p>
                      <p className="font-semibold text-lg text-[#F5B942]">
                        {order.type === "BUY" ? "شراء" : "بيع"} USDT
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">المبلغ</p>
                      <p className="font-semibold text-lg">
                        {order.amount}{" "}
                        {order.type === "BUY" ? "EGP" : "USDT"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">الاسم</p>
                      <p className="font-semibold text-lg">{order.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">تاريخ الإنشاء</p>
                      <p className="font-semibold">
                        {new Date(order.createdAt).toLocaleString("ar-EG")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">الحالة الحالية</p>
                      <p className="font-semibold">
                        {StatusDisplay[order.status as keyof typeof StatusDisplay]?.label ||
                          order.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card>
                <CardContent>
                  <h2 className="text-2xl font-bold mb-6">سجل الحالة</h2>

                  {order.status === "REJECTED" ? (
                    <div className="p-4 bg-red-600/20 border border-red-600 rounded-lg">
                      <p className="text-red-400 font-semibold">
                        ✗ تم رفض الطلب
                      </p>
                      <p className="text-red-300 text-sm mt-2">
                        يرجى تقديم طلب جديد
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {[
                        {
                          step: 1,
                          title: "قيد المراجعة",
                          date: order.createdAt,
                          completed: StatusSteps[order.status as keyof typeof StatusSteps] >= 1,
                        },
                        {
                          step: 2,
                          title: "التحقق جاري",
                          date: order.approvedAt,
                          completed:
                            StatusSteps[order.status as keyof typeof StatusSteps] >= 2,
                        },
                        {
                          step: 3,
                          title: "موافق عليه",
                          date: order.approvedAt,
                          completed:
                            StatusSteps[order.status as keyof typeof StatusSteps] >= 3,
                        },
                        {
                          step: 4,
                          title: "مكتمل",
                          date: order.completedAt,
                          completed:
                            StatusSteps[order.status as keyof typeof StatusSteps] >= 4,
                        },
                      ].map((step) => (
                        <div
                          key={step.step}
                          className="flex gap-4 items-start relative"
                        >
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
                                step.completed
                                  ? "text-white"
                                  : "text-gray-500"
                              }`}
                            >
                              {step.title}
                            </p>
                            {step.date && (
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(step.date).toLocaleString(
                                  "ar-EG"
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

              {/* Review Card */}
              {order.status === "COMPLETED" && (
                <Card>
                  <CardContent className="py-6">
                    <h3 className="font-bold text-lg mb-2">تقييم الخدمة</h3>
                    {reviewSuccess ? (
                      <div className="p-4 bg-green-950/30 border border-green-800 rounded-lg text-green-400">
                        ✓ تم تسجيل تقييمك بنجاح! شكرًا لك على مشاركتنا رأيك.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-400 text-sm">
                          شاركنا رأيك حول هذه العملية لمساعدتنا في تحسين خدماتنا:
                        </p>
                        
                        {!session ? (
                          <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#2D2D2D] text-center">
                            <p className="text-gray-400 text-sm mb-3">يجب عليك تسجيل الدخول لإضافة تقييم.</p>
                            <a
                              href={`/auth/login?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                              className="inline-block px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all text-sm"
                            >
                              تسجيل الدخول
                            </a>
                          </div>
                        ) : (
                          <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">التقييم بالنجوم</label>
                              <div className="flex gap-2">
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
                              <label htmlFor="reviewComment" className="block text-sm text-gray-400 mb-2">
                                تعليقك (اختياري)
                              </label>
                              <textarea
                                id="reviewComment"
                                rows={3}
                                placeholder="اكتب رأيك هنا..."
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
                              {submittingReview ? "جاري الإرسال..." : "إرسال التقييم"}
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
                <CardContent>
                  <h3 className="font-bold mb-2">هل تحتاج إلى مساعدة؟</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    تواصل معنا عبر Telegram للحصول على الدعم الفوري
                  </p>
                  <a
                    href="https://t.me/HELAL_SHADY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b3] transition-colors"
                  >
                    تواصل معنا
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

