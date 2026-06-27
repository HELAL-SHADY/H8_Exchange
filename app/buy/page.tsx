"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton } from "@/components/ui/button";
import { Input, FormGroup, Label } from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BuyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(51.0);
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [orderData, setOrderData] = useState({
    fullName: "",
    phone: "",
    binanceUid: "",
    walletNumber: "",
    amountEgp: "",
  });

  const [amountUsdt, setAmountUsdt] = useState(0);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login");
    }

    // جلب سعر الصرف
    fetch("/api/admin/exchange-rates")
      .then((res) => res.json())
      .then((data) => setExchangeRate(data.buyRate))
      .catch(console.error);

    // جلب رقم Vodafone Cash من إعدادات الموقع
    fetch("/api/admin/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.vodafoneCashNumber) {
          setVodafoneCashNumber(data.vodafoneCashNumber);
        }
      })
      .catch(console.error);
  }, [session, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setOrderData({ ...orderData, amountEgp: e.target.value });
    setAmountUsdt(Math.round((amount / exchangeRate) * 100) / 100);
  };

  const handleCopy = () => {
    if (!vodafoneCashNumber) return;
    navigator.clipboard.writeText(vodafoneCashNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BUY",
          amount: parseFloat(orderData.amountEgp),
          fullName: orderData.fullName,
          phone: orderData.phone,
          binanceUid: orderData.binanceUid,
          walletNumber: orderData.walletNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      alert("تم إنشاء الطلب بنجاح!");
      router.push(`/track?orderId=${data.id}`);
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              شراء <span className="text-[#F5B942]">USDT</span>
            </h1>
            <p className="text-gray-400">ابدأ عملية الشراء الآن</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <FormGroup>
                      <Label htmlFor="fullName">الاسم الكامل</Label>
                      <Input
                        id="fullName"
                        placeholder="أحمد محمد"
                        value={orderData.fullName}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        placeholder="201000000000"
                        value={orderData.phone}
                        onChange={(e) =>
                          setOrderData({ ...orderData, phone: e.target.value })
                        }
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="binanceUid">Binance UID</Label>
                      <Input
                        id="binanceUid"
                        placeholder="123456789"
                        value={orderData.binanceUid}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            binanceUid: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="walletNumber">
                        رقم محفظة Vodafone Cash
                      </Label>
                      <Input
                        id="walletNumber"
                        placeholder="201000000000"
                        value={orderData.walletNumber}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            walletNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="amountEgp">المبلغ بالجنيه المصري</Label>
                      <Input
                        id="amountEgp"
                        type="number"
                        placeholder="5100"
                        value={orderData.amountEgp}
                        onChange={handleAmountChange}
                        required
                      />
                      <p className="text-sm text-[#F5B942] mt-2">
                        ستستقبل: {amountUsdt} USDT
                      </p>
                    </FormGroup>

                    <PrimaryButton
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "جاري المعالجة..." : "إنشاء الطلب"}
                    </PrimaryButton>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">معلومات الدفع</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">
                        طريقة الدفع:
                      </p>
                      <p className="font-semibold text-[#F5B942]">
                        Vodafone Cash
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-2">
                        رقم Vodafone Cash:
                      </p>
                      {vodafoneCashNumber ? (
                        <>
                          <p className="font-semibold text-lg select-all">
                            {vodafoneCashNumber}
                          </p>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="text-xs text-[#F5B942] hover:underline mt-2 transition-opacity"
                          >
                            {copied ? "✅ تم النسخ!" : "انسخ الرقم"}
                          </button>
                        </>
                      ) : (
                        <p className="text-gray-600 text-sm italic">
                          جاري التحميل...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">التعليمات</h3>
                  <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
                    <li>أرسل المبلغ بالجنيه إلى رقم Vodafone Cash</li>
                    <li>خذ لقطة شاشة للحوالة</li>
                    <li>سيتم التحقق من الحوالة من قبل الإدارة</li>
                    <li>سيتم إرسال USDT إلى محفظتك</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">السعر الحالي</h3>
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-2">سعر الشراء</p>
                    <p className="text-3xl font-bold text-[#F5B942]">
                      {exchangeRate}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">EGP per USDT</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 sm:mt-12 max-w-2xl"
          >
            <Card>
              <CardContent>
                <h3 className="text-lg font-bold mb-4">ملاحظات مهمة</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• تأكد من صحة بيانات Binance UID</li>
                  <li>• احتفظ بلقطة شاشة الحوالة</li>
                  <li>• سيتم التحقق من الطلب خلال 30 دقيقة</li>
                  <li>• تواصل معنا عبر Telegram للدعم</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
