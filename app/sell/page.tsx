"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wrench, ShieldCheck, Copy, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type SellReceiveMethod = "VODAFONE_CASH" | "INSTAPAY";

interface SiteSettingsState {
  sellEnabled: boolean;
  vodafoneEnabled: boolean;
  instapayEnabled: boolean;
  bep20Enabled: boolean;
  usdtBep20Address?: string;
}

export default function SellPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { locale } = useTranslation();
  const text = (ar: string, en: string) => locale === "ar" ? ar : en;
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(50.0);
  const [minOrder, setMinOrder] = useState(10);
  const [maxOrder, setMaxOrder] = useState(10000);

  const [receiveMethod, setReceiveMethod] = useState<SellReceiveMethod>("VODAFONE_CASH");

  const [orderData, setOrderData] = useState({
    amountUsdt: "",
    receivingAccount: "", // Vodafone Cash mobile or InstaPay address
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettingsState | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [amountEgp, setAmountEgp] = useState(0);
  const [copyNotice, setCopyNotice] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/sell");
    }

    fetch("/api/admin/exchange-rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.sellRate) setExchangeRate(data.sellRate);
        if (data.minOrderAmount) setMinOrder(data.minOrderAmount);
        if (data.maxOrderAmount) setMaxOrder(data.maxOrderAmount);
      })
      .catch(console.error);

    fetch("/api/admin/site-settings")
      .then((res) => res.json())
      .then((data) => {
        const settings: SiteSettingsState = {
          sellEnabled: data.sellEnabled ?? true,
          vodafoneEnabled: data.vodafoneEnabled ?? true,
          instapayEnabled: data.instapayEnabled ?? true,
          bep20Enabled: data.bep20Enabled ?? true,
          usdtBep20Address: data.usdtBep20Address || "",
        };
        setSiteSettings(settings);

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
    const val = e.target.value;
    const amount = parseFloat(val) || 0;
    setOrderData({ ...orderData, amountUsdt: val });
    setAmountEgp(Math.round(amount * exchangeRate * 100) / 100);
  };

  const getDepositDestination = () => {
    return siteSettings?.usdtBep20Address || "";
  };

  const handleCopyDeposit = () => {
    navigator.clipboard.writeText(getDepositDestination());
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (siteSettings && !siteSettings.sellEnabled) {
      alert(text("عمليات البيع متوقفة حالياً للصيانة وسوف تتاح قريباً.", "Selling is temporarily paused for maintenance."));
      return;
    }
    if (!siteSettings?.bep20Enabled || !getDepositDestination()) {
      alert(text("الإيداع عبر شبكة BSC غير متاح حاليًا.", "BSC deposits are currently unavailable."));
      return;
    }

    const usdt = parseFloat(orderData.amountUsdt);
    if (usdt < minOrder || usdt > maxOrder) {
      alert(text(`المبلغ يجب أن يكون بين ${minOrder} و ${maxOrder} USDT`, `Amount must be between ${minOrder} and ${maxOrder} USDT`));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SELL",
          amount: usdt,
          binanceUid: "",
          walletNumber: orderData.receivingAccount,
          paymentMethod: "BEP20",
          receiveMethod,
          network: "BEP20",
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{text("تحويل سريع للجنيه المصري بعد التحقق من الإيداع", "Fast EGP payout after deposit verification")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {text("بيع", "Sell")} <span className="text-amber-400">USDT</span> {text("واستلام الجنيه المصري", "and receive EGP")}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {text("حوّل USDT عبر شبكة BSC واستلم الجنيه المصري عبر فودافون كاش أو إنستا باي.", "Send USDT on BSC and receive EGP through Vodafone Cash or InstaPay.")}
          </p>
        </motion.div>

        {!settingsLoading && siteSettings && !siteSettings.sellEnabled ? (
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[#111116] border border-amber-500/40 text-center space-y-4">
            <Wrench className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">{text("خدمة البيع متوقفة مؤقتاً للصيانة", "Selling is temporarily paused for maintenance")}</h2>
            <p className="text-gray-400 text-sm">
              {text("سيتم استئناف الخدمة قريبًا.", "The service will resume soon.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Network Selection */}
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      {text("1. شبكة إيداع USDT", "1. USDT deposit network")}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        disabled={!siteSettings?.bep20Enabled}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                          siteSettings?.bep20Enabled
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-black/40 border-white/10 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        BSC (BEP20) — USDT
                      </button>
                    </div>
                  </div>

                  {/* Official Deposit Address Display */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-400 font-bold">
                        {text("عنوان إيداع USDT الرسمي (BSC):", "Official USDT deposit address (BSC):")}
                      </span>
                      {copyNotice && <span className="text-[10px] text-amber-400 font-bold">{text("تم النسخ!", "Copied!")}</span>}
                    </div>
                    <div className="flex items-center justify-between bg-black/50 p-3 rounded-xl border border-white/10">
                      <span className="text-xs font-mono text-white font-bold break-all">
                        {getDepositDestination() || text("لم يتم إعداد العنوان بعد", "Address not configured yet")}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyDeposit}
                        className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 ml-2 shrink-0"
                        title={text("نسخ العنوان", "Copy address")}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {text("حوّل عبر شبكة BSC (BEP20) فقط إلى هذا العنوان.", "Send only over the BSC (BEP20) network to this address.")}
                    </p>
                  </div>

                  {/* Step 2: Choose EGP Receiving Method */}
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      {text("2. طريقة استلام الجنيه المصري (EGP)", "2. EGP payout method")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={!siteSettings?.vodafoneEnabled}
                        onClick={() => setReceiveMethod("VODAFONE_CASH")}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed ${
                          receiveMethod === "VODAFONE_CASH"
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-black/40 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        Vodafone Cash
                      </button>
                      <button
                        type="button"
                        disabled={!siteSettings?.instapayEnabled}
                        onClick={() => setReceiveMethod("INSTAPAY")}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed ${
                          receiveMethod === "INSTAPAY"
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-black/40 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        InstaPay
                      </button>
                    </div>
                  </div>

                  {/* Receiving Account */}
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      {receiveMethod === "VODAFONE_CASH"
                        ? text("رقم محفظة فودافون كاش لاستلام المبلغ", "Vodafone Cash number to receive EGP")
                        : text("عنوان إنستا باي (IPA) أو رقم الهاتف المسجل", "InstaPay address (IPA) or registered phone number")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={receiveMethod === "VODAFONE_CASH" ? "010XXXXXXXX" : "010XXXXXXXX or name@instapay"}
                      value={orderData.receivingAccount}
                      onChange={(e) => setOrderData({ ...orderData, receivingAccount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* USDT Amount */}
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">{text("المبلغ المطلوب بيعه (USDT)", "USDT amount to sell")}</label>
                    <input
                      type="number"
                      required
                      min={minOrder}
                      max={maxOrder}
                      placeholder="100"
                      value={orderData.amountUsdt}
                      onChange={handleAmountChange}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-lg font-bold font-mono focus:outline-none focus:border-amber-500"
                    />
                    <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                      <span className="text-xs text-gray-300">{text("المبلغ الصافي الذي سيصلك:", "You will receive:")}</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {amountEgp} EGP
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !siteSettings?.bep20Enabled || !getDepositDestination() || !orderData.amountUsdt || !orderData.receivingAccount}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
                  >
                    {loading ? text("جاري تسجيل الطلب...", "Creating order...") : text("تأكيد طلب البيع والمتابعة", "Confirm sell order")}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Rate & Guarantee */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#0E0E12] border border-emerald-500/30 shadow-2xl space-y-4">
                <span className="text-xs text-gray-400 font-medium">{text("سعر بيع USDT الحالي", "Current USDT sell rate")}</span>
                <div className="text-4xl font-black text-emerald-400 font-mono">
                  {exchangeRate} <span className="text-sm text-gray-300">EGP / USDT</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-[11px] text-gray-300 space-y-1">
                  <p>• {text("الحد الأدنى للطلب:", "Minimum order:")} {minOrder} USDT</p>
                  <p>• {text("الحد الأقصى للطلب:", "Maximum order:")} {maxOrder} USDT</p>
                  <p>• {text("الرسوم: 0% مجاناً بالكامل", "Fee: 0%")}</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-3 text-xs text-gray-400">
                <h4 className="font-bold text-white">{text("إجراءات الأمان والتحقق من المعاملة", "Security and verification")}</h4>
                <p>• {text("يرجى رفع إثبات التحويل بعد إرسال USDT عبر شبكة BSC.", "Upload your transfer proof after sending USDT on BSC.")}</p>
                <p>• {text("يتم فحص الإيداع مصرفيًا قبل إرسال الجنيه إلى حسابك.", "Your deposit is bank-verified before EGP is sent to your account.")}</p>
                <p>• {text("لا تشارك كلمات السر أو رموز OTP مع أي طرف.", "Never share passwords or OTP codes with anyone.")}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
