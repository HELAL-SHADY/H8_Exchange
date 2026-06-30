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

export default function SellPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(50.0);
  const [adminBinanceUid, setAdminBinanceUid] = useState("");
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [orderData, setOrderData] = useState({
    binanceUid: "",
    receivingWallet: "",
    amountUsdt: "",
  });

  const [amountEgp, setAmountEgp] = useState(0);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login");
    }

    fetch("/api/admin/exchange-rates")
      .then((res) => res.json())
      .then((data) => setExchangeRate(data.sellRate))
      .catch(console.error);

    fetch("/api/admin/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.binanceUid) {
          setAdminBinanceUid(data.binanceUid);
        }
      })
      .catch(console.error);
  }, [session, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setOrderData({ ...orderData, amountUsdt: e.target.value });
    setAmountEgp(Math.round(amount * exchangeRate * 100) / 100);
  };

  const handleCopy = () => {
    if (!adminBinanceUid) return;
    navigator.clipboard.writeText(adminBinanceUid).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("الرجاء تحميل إثبات التحويل (صورة التحويل)");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "فشل رفع صورة الإثبات");
      }

      const proofImageUrl = uploadData.url;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SELL",
          amount: parseFloat(orderData.amountUsdt),
          binanceUid: orderData.receivingWallet,
          walletNumber: orderData.binanceUid,
          proofImageUrl,
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
              بيع <span className="text-[#F5B942]">USDT</span>
            </h1>
            <p className="text-gray-400">ابدأ عملية البيع الآن</p>
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
                      <Label htmlFor="binanceUid">Binance UID الخاص بك</Label>
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
                      <Label htmlFor="receivingWallet">
                        محفظة الاستقبال (Vodafone Cash)
                      </Label>
                      <Input
                        id="receivingWallet"
                        placeholder="201000000000"
                        value={orderData.receivingWallet}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            receivingWallet: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="amountUsdt">مبلغ USDT</Label>
                      <Input
                        id="amountUsdt"
                        type="number"
                        placeholder="100"
                        value={orderData.amountUsdt}
                        onChange={handleAmountChange}
                        required
                      />
                      <p className="text-sm text-[#F5B942] mt-2">
                        ستستقبل: {amountEgp} EGP
                      </p>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="proofImage">إثبات التحويل (صورة الشاشة إجباري)</Label>
                      <input
                        id="proofImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D] border border-[#3D3D3D] text-white focus:outline-none focus:border-[#F5B942] transition-colors duration-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#F5B942] file:text-[#0A0A0A] file:font-semibold hover:file:opacity-90 cursor-pointer text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">يرجى رفع لقطة شاشة واضحة لإثبات التحويل لتسريع عملية المراجعة.</p>
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

            {/* Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">معلومات الاستقبال</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">
                        Binance UID (للإدارة):
                      </p>
                      {adminBinanceUid ? (
                        <>
                          <p className="font-semibold text-lg select-all">
                            {adminBinanceUid}
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
                    <li>أرسل USDT إلى Binance UID المعروض</li>
                    <li>خذ لقطة شاشة للتحويل</li>
                    <li>سيتم التحقق من العملية</li>
                    <li>ستستقبل EGP في محفظتك</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">السعر الحالي</h3>
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-2">سعر البيع</p>
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
                  <li>• تأكد من صحة البيانات المدخلة</li>
                  <li>• احتفظ بلقطة شاشة التحويل</li>
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