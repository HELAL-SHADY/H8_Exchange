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
import { useTranslation } from "@/lib/i18n";
import { Wrench, AlertTriangle } from "lucide-react";

type BuyPaymentMethod = "VODAFONE_CASH" | "INSTAPAY";
type BuyReceiveMethod = "BINANCE_PAY" | "BYBIT_PAY";

interface SiteSettingsState {
  buyEnabled: boolean;
  vodafoneEnabled: boolean;
  instapayEnabled: boolean;
}

export default function BuyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(51.0);
  const [paymentMethod, setPaymentMethod] = useState<BuyPaymentMethod>("VODAFONE_CASH");
  const [receiveMethod, setReceiveMethod] = useState<BuyReceiveMethod>("BINANCE_PAY");
  const [orderData, setOrderData] = useState({
    binanceUid: "",
    walletNumber: "",
    amountEgp: "",
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettingsState | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [maintenanceNotice, setMaintenanceNotice] = useState<string | null>(null);

  const [amountUsdt, setAmountUsdt] = useState(0);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login");
    }

    fetch("/api/admin/exchange-rates")
      .then((res) => res.json())
      .then((data) => setExchangeRate(data.buyRate))
      .catch(console.error);

    fetch("/api/admin/site-settings")
      .then((res) => res.json())
      .then((data) => {
        const settings: SiteSettingsState = {
          buyEnabled: data.buyEnabled ?? true,
          vodafoneEnabled: data.vodafoneEnabled ?? true,
          instapayEnabled: data.instapayEnabled ?? true,
        };
        setSiteSettings(settings);

        // ضبط خيار الدفع الافتراضي بناءً على المتاح
        if (settings.vodafoneEnabled) {
          setPaymentMethod("VODAFONE_CASH");
        } else if (settings.instapayEnabled) {
          setPaymentMethod("INSTAPAY");
        }
      })
      .catch(console.error)
      .finally(() => setSettingsLoading(false));
  }, [session, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setOrderData({ ...orderData, amountEgp: e.target.value });
    setAmountUsdt(Math.round((amount / exchangeRate) * 100) / 100);
  };

  const handleSelectPaymentMethod = (method: BuyPaymentMethod) => {
    if (method === "VODAFONE_CASH" && siteSettings && !siteSettings.vodafoneEnabled) {
      setMaintenanceNotice("خدمة فودافون كاش متوقفة حالياً للصيانة وسوف تتاح قريباً.");
      return;
    }
    if (method === "INSTAPAY" && siteSettings && !siteSettings.instapayEnabled) {
      setMaintenanceNotice("خدمة إنستا باي متوقفة حالياً للصيانة وسوف تتاح قريباً.");
      return;
    }
    setMaintenanceNotice(null);
    setPaymentMethod(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (siteSettings && !siteSettings.buyEnabled) {
      alert("عمليات الشراء متوقفة حالياً: جاري الصيانة وسوف تتاح قريباً.");
      return;
    }

    if (paymentMethod === "VODAFONE_CASH" && siteSettings && !siteSettings.vodafoneEnabled) {
      alert("فودافون كاش متوقف حالياً: جاري الصيانة وسوف يتاح قريباً.");
      return;
    }

    if (paymentMethod === "INSTAPAY" && siteSettings && !siteSettings.instapayEnabled) {
      alert("إنستا باي متوقف حالياً: جاري الصيانة وسوف يتاح قريباً.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BUY",
          amount: parseFloat(orderData.amountEgp),
          binanceUid: orderData.binanceUid,
          walletNumber: orderData.walletNumber,
          paymentMethod,
          receiveMethod,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      alert(locale === "ar" ? "تم إنشاء الطلب بنجاح! يرجى إتمام عملية الدفع." : "Order created successfully! Please complete the payment.");
      router.push(`/track?orderId=${data.id}`);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="py-8 sm:py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
              {locale === "ar" ? "شراء" : "Buy"}{" "}
              <span className="bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent">USDT</span>
            </h1>
            <p className="text-gray-400 font-light">{t("startBuyNow")}</p>
          </motion.div>

          {/* لو كان الشراء متوقفاً للصيانة بالكامل */}
          {!settingsLoading && siteSettings && !siteSettings.buyEnabled ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="liquid-glass-gold border-yellow-500/40 text-center py-12 px-6">
                <CardContent className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                    <Wrench className="w-10 h-10 animate-pulse" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    جاري الصيانة وسوف يتاح قريباً
                  </h2>
                  <p className="text-gray-300 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                    نعتذر لعملائنا الكرام، خدمة شراء USDT متوقفة حالياً لأعمال الصيانة والتحديثات الدورية وسوف تكون متاحة في أقرب وقت.
                  </p>
                  <div className="pt-4 flex justify-center gap-4">
                    <button
                      onClick={() => router.push("/")}
                      className="px-6 py-2.5 rounded-xl liquid-pill text-sm font-semibold text-gray-200 hover:text-white"
                    >
                      العودة للرئيسية
                    </button>
                    <button
                      onClick={() => router.push("/sell")}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#F5B942] to-[#E6A430] text-[#0A0A0A] rounded-xl text-sm font-bold shadow-lg"
                    >
                      الانتقال لصفحة البيع
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardContent className="p-2 sm:p-4">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Payment Method Switcher */}
                      <FormGroup>
                        <Label>{t("paymentMethod")}</Label>

                        {/* إشعار عند النقر على طريقة دفع مغلقة */}
                        {maintenanceNotice && (
                          <div className="p-3 mb-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center gap-2 text-yellow-300 text-xs sm:text-sm">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>{maintenanceNotice}</span>
                          </div>
                        )}

                        {/* لو الاتنين مقفولين */}
                        {siteSettings && !siteSettings.vodafoneEnabled && !siteSettings.instapayEnabled && (
                          <div className="p-3 mb-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs sm:text-sm">
                            ⚠️ جميع طرق الدفع متوقفة حالياً للصيانة وسوف تتاح قريباً.
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleSelectPaymentMethod("VODAFONE_CASH")}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                              paymentMethod === "VODAFONE_CASH" && (!siteSettings || siteSettings.vodafoneEnabled)
                                ? "liquid-pill-active"
                                : "liquid-pill text-gray-300"
                            } ${siteSettings && !siteSettings.vodafoneEnabled ? "opacity-60 border-yellow-500/40" : ""}`}
                          >
                            <span>Vodafone Cash</span>
                            {siteSettings && !siteSettings.vodafoneEnabled && (
                              <span className="block text-[10px] text-yellow-400 font-normal">
                                جاري الصيانة
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectPaymentMethod("INSTAPAY")}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                              paymentMethod === "INSTAPAY" && (!siteSettings || siteSettings.instapayEnabled)
                                ? "liquid-pill-active"
                                : "liquid-pill text-gray-300"
                            } ${siteSettings && !siteSettings.instapayEnabled ? "opacity-60 border-yellow-500/40" : ""}`}
                          >
                            <span>InstaPay</span>
                            {siteSettings && !siteSettings.instapayEnabled && (
                              <span className="block text-[10px] text-yellow-400 font-normal">
                                جاري الصيانة
                              </span>
                            )}
                          </button>
                        </div>
                      </FormGroup>

                      {/* Receive Method Switcher */}
                      <FormGroup>
                        <Label>{t("receiveMethod")}</Label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setReceiveMethod("BINANCE_PAY")}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                              receiveMethod === "BINANCE_PAY"
                                ? "liquid-pill-active"
                                : "liquid-pill text-gray-300"
                            }`}
                          >
                            Binance Pay
                          </button>
                          <button
                            type="button"
                            onClick={() => setReceiveMethod("BYBIT_PAY")}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                              receiveMethod === "BYBIT_PAY"
                                ? "liquid-pill-active"
                                : "liquid-pill text-gray-300"
                            }`}
                          >
                            Bybit Pay
                          </button>
                        </div>
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="binanceUid">
                          {receiveMethod === "BINANCE_PAY"
                            ? t("binanceUidLabel")
                            : t("bybitUidLabel")}
                        </Label>
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
                          {paymentMethod === "VODAFONE_CASH"
                            ? t("walletNumberLabel")
                            : t("instapayNumberLabel")}
                        </Label>
                        <Input
                          id="walletNumber"
                          placeholder="01012345678"
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
                        <Label htmlFor="amountEgp">{t("amountEgpLabel")}</Label>
                        <Input
                          id="amountEgp"
                          type="number"
                          placeholder="1000"
                          value={orderData.amountEgp}
                          onChange={handleAmountChange}
                          min="100"
                          required
                        />
                        <div className="mt-2.5 p-3 rounded-xl liquid-pill flex items-center justify-between">
                          <span className="text-xs text-gray-300">{t("willReceive")}:</span>
                          <span className="text-sm font-extrabold text-[#F5B942] drop-shadow-[0_0_10px_rgba(245,185,66,0.3)]">
                            {amountUsdt} USDT
                          </span>
                        </div>
                      </FormGroup>

                      <PrimaryButton
                        type="submit"
                        className="w-full py-3.5"
                        disabled={
                          loading ||
                          (siteSettings ? !siteSettings.buyEnabled || (!siteSettings.vodafoneEnabled && !siteSettings.instapayEnabled) : false)
                        }
                      >
                        {loading ? t("processing") : t("createOrderBtn")}
                      </PrimaryButton>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Price Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="liquid-glass-gold">
                  <CardContent className="p-2 sm:p-4">
                    <h3 className="font-bold mb-3 text-white">{t("currentPrice")}</h3>
                    <div className="text-center py-4">
                      <p className="text-gray-300 text-sm mb-1.5">{t("buyRate")}</p>
                      <p className="text-4xl font-extrabold text-[#F5B942] drop-shadow-[0_0_15px_rgba(245,185,66,0.4)]">
                        {exchangeRate}
                      </p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">{t("egpPerUsdt")}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2 sm:p-4">
                    <h3 className="font-bold mb-3 text-white">{t("importantNotes")}</h3>
                    <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside font-light">
                      {(t("buyNotes") as string[]).map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
