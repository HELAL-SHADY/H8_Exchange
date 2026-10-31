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

type SellPaymentMethod = "BINANCE_PAY" | "BYBIT_PAY";
type SellReceiveMethod = "VODAFONE_CASH" | "INSTAPAY";

interface SiteSettingsState {
  sellEnabled: boolean;
  vodafoneEnabled: boolean;
  instapayEnabled: boolean;
  binanceEnabled: boolean;
  bybitEnabled: boolean;
}

export default function SellPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(50.0);
  const [paymentMethod, setPaymentMethod] = useState<SellPaymentMethod>("BINANCE_PAY");
  const [receiveMethod, setReceiveMethod] = useState<SellReceiveMethod>("VODAFONE_CASH");
  const [orderData, setOrderData] = useState({
    binanceUid: "",
    receivingWallet: "",
    amountUsdt: "",
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettingsState | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [maintenanceNotice, setMaintenanceNotice] = useState<string | null>(null);

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
        const settings: SiteSettingsState = {
          sellEnabled: data.sellEnabled ?? true,
          vodafoneEnabled: data.vodafoneEnabled ?? true,
          instapayEnabled: data.instapayEnabled ?? true,
          binanceEnabled: data.binanceEnabled ?? true,
          bybitEnabled: data.bybitEnabled ?? true,
        };
        setSiteSettings(settings);

        // ضبط خيار الدفع الافتراضي بناءً على المتاح
        if (settings.binanceEnabled) {
          setPaymentMethod("BINANCE_PAY");
        } else if (settings.bybitEnabled) {
          setPaymentMethod("BYBIT_PAY");
        }

        // ضبط خيار الاستلام الافتراضي بناءً على المتاح
        if (settings.vodafoneEnabled) {
          setReceiveMethod("VODAFONE_CASH");
        } else if (settings.instapayEnabled) {
          setReceiveMethod("INSTAPAY");
        }
      })
      .catch(console.error)
      .finally(() => setSettingsLoading(false));
  }, [session, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setOrderData({ ...orderData, amountUsdt: e.target.value });
    setAmountEgp(Math.round(amount * exchangeRate * 100) / 100);
  };

  const handleSelectPaymentMethod = (method: SellPaymentMethod) => {
    if (method === "BINANCE_PAY" && siteSettings && !siteSettings.binanceEnabled) {
      setMaintenanceNotice("طريقة الدفع عبر Binance متوقفة حالياً للصيانة وسوف تتاح قريباً.");
      return;
    }
    if (method === "BYBIT_PAY" && siteSettings && !siteSettings.bybitEnabled) {
      setMaintenanceNotice("طريقة الدفع عبر Bybit متوقفة حالياً للصيانة وسوف تتاح قريباً.");
      return;
    }
    setMaintenanceNotice(null);
    setPaymentMethod(method);
  };

  const handleSelectReceiveMethod = (method: SellReceiveMethod) => {
    if (method === "VODAFONE_CASH" && siteSettings && !siteSettings.vodafoneEnabled) {
      setMaintenanceNotice("خدمة فودافون كاش متوقفة حالياً للصيانة وسوف تتاح قريباً.");
      return;
    }
    if (method === "INSTAPAY" && siteSettings && !siteSettings.instapayEnabled) {
      setMaintenanceNotice("خدمة إنستا باي متوقفة حالياً للصيانة وسوف تتاح قريباً.");
      return;
    }
    setMaintenanceNotice(null);
    setReceiveMethod(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (siteSettings && !siteSettings.sellEnabled) {
      alert("عمليات البيع متوقفة حالياً: جاري الصيانة وسوف تتاح قريباً.");
      return;
    }

    if (paymentMethod === "BINANCE_PAY" && siteSettings && !siteSettings.binanceEnabled) {
      alert("Binance Pay متوقف حالياً: جاري الصيانة وسوف يتاح قريباً.");
      return;
    }

    if (paymentMethod === "BYBIT_PAY" && siteSettings && !siteSettings.bybitEnabled) {
      alert("Bybit Pay متوقف حالياً: جاري الصيانة وسوف يتاح قريباً.");
      return;
    }

    if (receiveMethod === "VODAFONE_CASH" && siteSettings && !siteSettings.vodafoneEnabled) {
      alert("فودافون كاش متوقف حالياً: جاري الصيانة وسوف يتاح قريباً.");
      return;
    }

    if (receiveMethod === "INSTAPAY" && siteSettings && !siteSettings.instapayEnabled) {
      alert("إنستا باي متوقف حالياً: جاري الصيانة وسوف يتاح قريباً.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SELL",
          amount: parseFloat(orderData.amountUsdt),
          binanceUid: orderData.binanceUid,
          walletNumber: orderData.receivingWallet,
          paymentMethod,
          receiveMethod,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      alert(locale === "ar" ? "تم إنشاء الطلب بنجاح! يرجى إرسال الـ USDT وإرفاق إثبات الدفع." : "Order created successfully! Please send USDT and upload payment proof.");
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
              {locale === "ar" ? "بيع" : "Sell"}{" "}
              <span className="bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent">USDT</span>
            </h1>
            <p className="text-gray-400 font-light">{t("startSellNow")}</p>
          </motion.div>

          {/* لو كان البيع متوقفاً للصيانة بالكامل */}
          {!settingsLoading && siteSettings && !siteSettings.sellEnabled ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto"
            >
              <Card className="border-yellow-500/40 bg-[#121218]/90 text-center py-10 px-6 shadow-[0_0_40px_rgba(245,185,66,0.15)]">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
                    <Wrench className="w-8 h-8 text-[#F5B942]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">خدمة البيع متوقفة مؤقتاً</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    عمليات بيع USDT متوقفة حالياً للصيانة الدورية وتحديث الأنظمة.
                    <br />
                    وسوف تتاح الخدمة قريباً جداً، شكراً لتفهمكم.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://t.me/HELAL_SHADY"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-5 py-2.5 rounded-xl liquid-pill text-xs font-semibold text-[#F5B942] hover:scale-105 transition-all"
                    >
                      تواصل مع الدعم عبر Telegram
                    </a>
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
                        <Label>{t("paymentMethodSell")}</Label>

                        {/* لو الاتنين مقفولين */}
                        {siteSettings && !siteSettings.binanceEnabled && !siteSettings.bybitEnabled && (
                          <div className="p-3 mb-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs sm:text-sm">
                            ⚠️ جميع طرق إرسال USDT متوقفة حالياً للصيانة وسوف تتاح قريباً.
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleSelectPaymentMethod("BINANCE_PAY")}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                              paymentMethod === "BINANCE_PAY" && (!siteSettings || siteSettings.binanceEnabled)
                                ? "liquid-pill-active"
                                : "liquid-pill text-gray-300"
                            } ${siteSettings && !siteSettings.binanceEnabled ? "opacity-60 border-yellow-500/40" : ""}`}
                          >
                            <span>Binance UID</span>
                            {siteSettings && !siteSettings.binanceEnabled && (
                              <span className="block text-[10px] text-yellow-400 font-normal">
                                جاري الصيانة
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectPaymentMethod("BYBIT_PAY")}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                              paymentMethod === "BYBIT_PAY" && (!siteSettings || siteSettings.bybitEnabled)
                                ? "liquid-pill-active"
                                : "liquid-pill text-gray-300"
                            } ${siteSettings && !siteSettings.bybitEnabled ? "opacity-60 border-yellow-500/40" : ""}`}
                          >
                            <span>Bybit Pay</span>
                            {siteSettings && !siteSettings.bybitEnabled && (
                              <span className="block text-[10px] text-yellow-400 font-normal">
                                جاري الصيانة
                              </span>
                            )}
                          </button>
                        </div>
                      </FormGroup>

                      {/* Receive Method Switcher */}
                      <FormGroup>
                        <Label>{t("receiveMethodSell")}</Label>

                        {/* إشعار عند النقر على طريقة استلام مغلقة */}
                        {maintenanceNotice && (
                          <div className="p-3 mb-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center gap-2 text-yellow-300 text-xs sm:text-sm">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>{maintenanceNotice}</span>
                          </div>
                        )}

                        {/* لو الاتنين مقفولين */}
                        {siteSettings && !siteSettings.vodafoneEnabled && !siteSettings.instapayEnabled && (
                          <div className="p-3 mb-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs sm:text-sm">
                            ⚠️ جميع طرق الاستلام متوقفة حالياً للصيانة وسوف تتاح قريباً.
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleSelectReceiveMethod("VODAFONE_CASH")}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                              receiveMethod === "VODAFONE_CASH" && (!siteSettings || siteSettings.vodafoneEnabled)
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
                            onClick={() => handleSelectReceiveMethod("INSTAPAY")}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                              receiveMethod === "INSTAPAY" && (!siteSettings || siteSettings.instapayEnabled)
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

                      <FormGroup>
                        <Label htmlFor="binanceUid">
                          {paymentMethod === "BINANCE_PAY"
                            ? t("binanceUidLabelSell")
                            : t("bybitUidLabelSell")}
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
                        <Label htmlFor="receivingWallet">
                          {receiveMethod === "VODAFONE_CASH"
                            ? t("receivingWalletLabel")
                            : t("receivingInstapayLabel")}
                        </Label>
                        <Input
                          id="receivingWallet"
                          placeholder={receiveMethod === "VODAFONE_CASH" ? "01012345678" : "username@instapay أو رقم الهاتف"}
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
                        <Label htmlFor="amountUsdt">{t("amountUsdtLabel")}</Label>
                        <Input
                          id="amountUsdt"
                          type="number"
                          placeholder="100"
                          value={orderData.amountUsdt}
                          onChange={handleAmountChange}
                          min="1"
                          required
                        />
                        <div className="mt-2.5 p-3 rounded-xl liquid-pill flex items-center justify-between">
                          <span className="text-xs text-gray-300">{t("willReceive")}:</span>
                          <span className="text-sm font-extrabold text-[#F5B942] drop-shadow-[0_0_10px_rgba(245,185,66,0.3)]">
                            {amountEgp} EGP
                          </span>
                        </div>
                      </FormGroup>

                      <PrimaryButton
                        type="submit"
                        className="w-full py-3.5"
                        disabled={
                          loading ||
                          (siteSettings
                            ? !siteSettings.sellEnabled ||
                              (!siteSettings.vodafoneEnabled && !siteSettings.instapayEnabled) ||
                              (!siteSettings.binanceEnabled && !siteSettings.bybitEnabled)
                            : false)
                        }
                      >
                        {loading ? t("processing") : t("createOrderBtn")}
                      </PrimaryButton>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="liquid-glass-gold">
                  <CardContent className="p-2 sm:p-4">
                    <h3 className="font-bold mb-3 text-white">{t("currentPrice")}</h3>
                    <div className="text-center py-4">
                      <p className="text-gray-300 text-sm mb-1.5">{t("sellRate")}</p>
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
                      {(t("sellNotes") as string[]).map((note, idx) => (
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
