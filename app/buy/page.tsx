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
import { Wrench, AlertTriangle, ShieldCheck, CheckCircle2, Copy } from "lucide-react";

type BuyPaymentMethod = "VODAFONE_CASH" | "INSTAPAY" | "BANK_TRANSFER";
type BuyReceivePlatform = "BINANCE_PAY" | "CRYPTO_WALLET";

interface SiteSettingsState {
  buyEnabled: boolean;
  vodafoneEnabled: boolean;
  instapayEnabled: boolean;
  binanceEnabled: boolean;
  bep20Enabled: boolean;
  vodafoneCashNumber?: string;
  instapayNumber?: string;
}

export default function BuyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(51.0);
  const [minOrder, setMinOrder] = useState(10);
  const [maxOrder, setMaxOrder] = useState(10000);

  const [paymentMethod, setPaymentMethod] = useState<BuyPaymentMethod>("VODAFONE_CASH");
  const [receivePlatform, setReceivePlatform] = useState<BuyReceivePlatform>("BINANCE_PAY");
  const [network, setNetwork] = useState("BEP20");

  const [orderData, setOrderData] = useState({
    identifier: "", // UID or Wallet Address
    walletNumber: "", // User's paying phone or bank reference
    amountEgp: "",
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettingsState | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [maintenanceNotice, setMaintenanceNotice] = useState<string | null>(null);
  const [amountUsdt, setAmountUsdt] = useState(0);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/buy");
    }

    fetch("/api/admin/exchange-rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.buyRate) setExchangeRate(data.buyRate);
        if (data.minOrderAmount) setMinOrder(data.minOrderAmount);
        if (data.maxOrderAmount) setMaxOrder(data.maxOrderAmount);
      })
      .catch(console.error);

    fetch("/api/admin/site-settings")
      .then((res) => res.json())
      .then((data) => {
        const settings: SiteSettingsState = {
          buyEnabled: data.buyEnabled ?? true,
          vodafoneEnabled: data.vodafoneEnabled ?? true,
          instapayEnabled: data.instapayEnabled ?? true,
          binanceEnabled: data.binanceEnabled ?? true,
          bep20Enabled: data.bep20Enabled ?? true,
          vodafoneCashNumber: data.vodafoneCashNumber,
          instapayNumber: data.instapayNumber,
        };
        setSiteSettings(settings);

        if (settings.vodafoneEnabled) {
          setPaymentMethod("VODAFONE_CASH");
        } else if (settings.instapayEnabled) {
          setPaymentMethod("INSTAPAY");
        }
        if (!settings.binanceEnabled) {
          setReceivePlatform("CRYPTO_WALLET");
        }
      })
      .catch(console.error)
      .finally(() => setSettingsLoading(false));
  }, [session, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const amount = parseFloat(val) || 0;
    setOrderData({ ...orderData, amountEgp: val });
    setAmountUsdt(Math.round((amount / exchangeRate) * 100) / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (siteSettings && !siteSettings.buyEnabled) {
      alert("عمليات الشراء متوقفة حالياً للصيانة وسوف تتاح قريباً.");
      return;
    }

    if (amountUsdt < minOrder || amountUsdt > maxOrder) {
      alert(`المبلغ المحسوب يجب أن يكون بين ${minOrder} USDT و ${maxOrder} USDT`);
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
          binanceUid: receivePlatform !== "CRYPTO_WALLET" ? orderData.identifier : "",
          walletNumber: receivePlatform === "CRYPTO_WALLET" ? orderData.identifier : orderData.walletNumber,
          paymentMethod,
          receiveMethod: receivePlatform,
          network: receivePlatform === "CRYPTO_WALLET" ? network : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      router.push(`/dashboard/orders/${data.id}`);
    } catch (error: any) {
      alert(error.message || "حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="py-8 sm:py-12 px-4 relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "سعر صرف مضمون ومثبت عند تأكيد الطلب" : "Guaranteed exchange rate locked when you confirm"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {locale === "ar" ? "شراء" : "Buy"} <span className="text-amber-400">USDT</span> {locale === "ar" ? "مقابل الجنيه المصري" : "with Egyptian pounds"}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {locale === "ar" ? "استلم USDT عبر Binance UID أو على محفظتك الشخصية عبر شبكة BSC." : "Receive USDT through Binance UID or to your personal wallet on BSC."}
          </p>
        </motion.div>

        {!settingsLoading && siteSettings && !siteSettings.buyEnabled ? (
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[#111116] border border-amber-500/40 text-center space-y-4">
            <Wrench className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">{locale === "ar" ? "خدمة الشراء متوقفة مؤقتاً للصيانة" : "Buying is temporarily paused for maintenance"}</h2>
            <p className="text-gray-400 text-sm">
              {locale === "ar" ? "سيتم استئناف الخدمة قريبًا." : "The service will resume soon."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Choose Payment Method */}
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      {locale === "ar" ? "1. اختر طريقة الدفع بالجنيه المصري (EGP)" : "1. Choose an EGP payment method"}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={!siteSettings?.vodafoneEnabled}
                        onClick={() => setPaymentMethod("VODAFONE_CASH")}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed ${
                          paymentMethod === "VODAFONE_CASH"
                            ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10"
                            : "bg-black/40 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        Vodafone Cash
                      </button>
                      <button
                        type="button"
                        disabled={!siteSettings?.instapayEnabled}
                        onClick={() => setPaymentMethod("INSTAPAY")}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed ${
                          paymentMethod === "INSTAPAY"
                            ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10"
                            : "bg-black/40 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        InstaPay
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Choose Receiving Platform */}
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      {locale === "ar" ? "2. أين تريد استلام USDT؟" : "2. Where should we send your USDT?"}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={!siteSettings?.binanceEnabled}
                        onClick={() => setReceivePlatform("BINANCE_PAY")}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed ${
                          receivePlatform === "BINANCE_PAY"
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-black/40 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        Binance UID
                      </button>
                      <button
                        type="button"
                        disabled={!siteSettings?.bep20Enabled}
                        onClick={() => setReceivePlatform("CRYPTO_WALLET")}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed ${
                          receivePlatform === "CRYPTO_WALLET"
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-black/40 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {locale === "ar" ? "محفظة خارجية (BSC)" : "External wallet (BSC)"}
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Receiving Details */}
                  {receivePlatform === "CRYPTO_WALLET" ? (
                    <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">{locale === "ar" ? "شبكة البلوك تشين" : "Blockchain network"}</label>
                        <div className="w-full px-3 py-2.5 rounded-xl bg-[#111116] border border-white/10 text-white text-xs">BNB Smart Chain (BSC / BEP20)</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">{locale === "ar" ? "عنوان محفظة USDT" : "USDT wallet address"}</label>
                        <input
                          type="text"
                          required
                          placeholder={locale === "ar" ? "أدخل عنوان محفظتك على شبكة BSC" : "Enter your wallet address on BSC"}
                          value={orderData.identifier}
                          onChange={(e) => setOrderData({ ...orderData, identifier: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#111116] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                      <label className="text-xs text-gray-400 block mb-1">
                        {locale === "ar" ? "معرف Binance (UID)" : "Binance UID"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="12345678"
                        value={orderData.identifier}
                        onChange={(e) => setOrderData({ ...orderData, identifier: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#111116] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  {/* Payment Source */}
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      {locale === "ar" ? "رقم الهاتف أو الحساب الذي ستدفع منه (للتأكيد ومطابقة الإيداع)" : "Phone number or account used to pay (for payment verification)"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={paymentMethod === "VODAFONE_CASH" ? "010XXXXXXXX" : "010XXXXXXXX or username@instapay"}
                      value={orderData.walletNumber}
                      onChange={(e) => setOrderData({ ...orderData, walletNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Amount in EGP */}
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      {locale === "ar" ? "المبلغ بالجنيه المصري (EGP)" : "Amount in Egyptian pounds (EGP)"}
                    </label>
                    <input
                      type="number"
                      required
                      min="500"
                      placeholder="10000"
                      value={orderData.amountEgp}
                      onChange={handleAmountChange}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-lg font-bold font-mono focus:outline-none focus:border-amber-500"
                    />
                    <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                      <span className="text-xs text-gray-300">{locale === "ar" ? "رصيد USDT الذي ستستلمه:" : "USDT you will receive:"}</span>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        {amountUsdt} USDT
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !orderData.amountEgp || !orderData.identifier}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
                  >
                    {loading
                      ? locale === "ar" ? "جاري إنشاء الطلب وحجز السعر..." : "Creating order and locking rate..."
                      : locale === "ar" ? "تأكيد الطلب والمتابعة للدفع" : "Confirm and continue to payment"}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Rate & Guarantee */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#0E0E12] border border-amber-500/30 shadow-2xl space-y-4">
                <span className="text-xs text-gray-400 font-medium">{locale === "ar" ? "سعر الشراء الحالي" : "Current buy rate"}</span>
                <div className="text-4xl font-black text-amber-400 font-mono">
                  {exchangeRate} <span className="text-sm text-gray-300">EGP / USDT</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-[11px] text-gray-300 space-y-1">
                  <p>• {locale === "ar" ? "الحد الأدنى للطلب:" : "Minimum order:"} {minOrder} USDT</p>
                  <p>• {locale === "ar" ? "الحد الأقصى للطلب:" : "Maximum order:"} {maxOrder} USDT</p>
                  <p>• {locale === "ar" ? "الرسوم: 0% بدون مصاريف خفية" : "Fees: 0%, no hidden charges"}</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-3 text-xs text-gray-400">
                <h4 className="font-bold text-white">{locale === "ar" ? "ضمان وأمان H8 Exchange" : "H8 Exchange security"}</h4>
                <p>• {locale === "ar" ? "يتم تثبيت سعر الصرف فور تأكيد الطلب." : "Your exchange rate is locked when you confirm the order."}</p>
                <p>• {locale === "ar" ? "ستحصل على رقم تتبع لمتابعة حالة الطلب وإثبات الدفع." : "Track your order and payment proof using your order number."}</p>
                <p>• {locale === "ar" ? "تبدأ المراجعة المصرفية بعد رفع إثبات الدفع." : "Bank verification starts after you upload payment proof."}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
