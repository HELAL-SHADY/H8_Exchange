"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton } from "@/components/ui/button";
import { FormGroup, Label, Input } from "@/components/ui/form";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

interface ExchangeRates {
  buyRate: number;
  sellRate: number;
  minOrderAmount: number;
  maxOrderAmount: number;
}

interface SiteSettings {
  binanceUid: string;
  vodafoneCashNumber: string;
  instapayNumber: string;
  usdtBep20Address: string;
  telegramUsername: string;
  supportEmail: string;
  announcement: string;
  buyEnabled: boolean;
  sellEnabled: boolean;
  instapayEnabled: boolean;
  vodafoneEnabled: boolean;
  binanceEnabled: boolean;
  bep20Enabled: boolean;
}

// ===== Toggle Switch Component =====
function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
  enabledColor = "bg-green-500",
  disabledLabel = "مغلق • جاري الصيانة",
  enabledLabel = "مفعّل",
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  enabledColor?: string;
  disabledLabel?: string;
  enabledLabel?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
        enabled
          ? "border-green-500/30 bg-green-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <div className="flex-1 min-w-0 ml-4">
        <p className="font-semibold text-white text-sm">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
        )}
        <span
          className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            enabled
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {enabled ? `✅ ${enabledLabel}` : `🔒 ${disabledLabel}`}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
          enabled ? enabledColor : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            enabled ? "translate-x-8" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { locale } = useTranslation();
  const text = (ar: string, en: string) => locale === "ar" ? ar : en;
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [formData, setFormData] = useState<ExchangeRates>({
    buyRate: 51.0,
    sellRate: 50.0,
    minOrderAmount: 100,
    maxOrderAmount: 10000,
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    binanceUid: "",
    vodafoneCashNumber: "",
    instapayNumber: "",
    usdtBep20Address: "",
    telegramUsername: "",
    supportEmail: "",
    announcement: "",
    buyEnabled: true,
    sellEnabled: true,
    instapayEnabled: true,
    vodafoneEnabled: true,
    binanceEnabled: true,
    bep20Enabled: true,
  });

  useEffect(() => {
    fetchRates();
    fetchSiteSettings();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch("/api/admin/exchange-rates");
      const data = await response.json();
      setRates(data);
      setFormData(data);
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch("/api/admin/site-settings");
      const data = await response.json();
      if (!data.error) {
        setSiteSettings({
          binanceUid: data.binanceUid || "",
          vodafoneCashNumber: data.vodafoneCashNumber || "",
          instapayNumber: data.instapayNumber || "",
          usdtBep20Address: data.usdtBep20Address || "",
          telegramUsername: data.telegramUsername || "",
          supportEmail: data.supportEmail || "",
          announcement: data.announcement || "",
          buyEnabled: data.buyEnabled ?? true,
          sellEnabled: data.sellEnabled ?? true,
          instapayEnabled: data.instapayEnabled ?? true,
          vodafoneEnabled: data.vodafoneEnabled ?? true,
          binanceEnabled: data.binanceEnabled ?? true,
          bep20Enabled: data.bep20Enabled ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
    }
  };

  const handleRatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/admin/exchange-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updated = await response.json();
        setRates(updated);
        alert(text("✅ تم تحديث الأسعار بنجاح!", "✅ Exchange rates updated."));
      } else {
        alert(text("❌ فشل التحديث", "❌ Update failed."));
      }
    } catch (error) {
      alert(text("حدث خطأ: ", "Error: ") + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSiteSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      });
      if (response.ok) {
        alert(text("✅ تم تحديث إعدادات الموقع بنجاح!", "✅ Site settings updated."));
      } else {
        const err = await response.json();
        alert(text("❌ فشل التحديث: ", "❌ Update failed: ") + (err.error || text("خطأ غير معروف", "Unknown error")));
      }
    } catch (error) {
      alert(text("حدث خطأ: ", "Error: ") + (error as Error).message);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-10">{text("جاري التحميل...", "Loading...")}</div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold">{text("الإعدادات", "Settings")}</h1>
        <p className="text-gray-400 mt-2">{text("إدارة أسعار الصرف وإعدادات الدفع", "Manage exchange rates and payment settings")}</p>
      </motion.div>

      {/* ===== Operations Control ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">🔧 {text("التحكم في العمليات", "Trading controls")}</h2>
            <p className="text-sm text-gray-400 mb-6">
              {text("تشغيل أو إيقاف عمليات الشراء والبيع — عند الإيقاف يظهر للمستخدم رسالة صيانة", "Enable or pause buying and selling. Paused services show a maintenance notice.")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ToggleSwitch
                enabled={siteSettings.buyEnabled}
                onChange={(v) => setSiteSettings({ ...siteSettings, buyEnabled: v })}
                label={text("عملية الشراء (Buy USDT)", "Buy USDT")}
                description={text("السماح للمستخدمين بشراء USDT مقابل EGP", "Allow users to buy USDT with EGP")}
                enabledColor="bg-green-500"
                enabledLabel={text("الشراء متاح", "Buying enabled")}
                disabledLabel={text("الشراء موقوف", "Buying paused")}
              />
              <ToggleSwitch
                enabled={siteSettings.sellEnabled}
                onChange={(v) => setSiteSettings({ ...siteSettings, sellEnabled: v })}
                label={text("عملية البيع (Sell USDT)", "Sell USDT")}
                description={text("السماح للمستخدمين ببيع USDT مقابل EGP", "Allow users to sell USDT for EGP")}
                enabledColor="bg-green-500"
                enabledLabel={text("البيع متاح", "Selling enabled")}
                disabledLabel={text("البيع موقوف", "Selling paused")}
              />
            </div>

            <h2 className="text-xl font-bold mb-1">💳 {text("التحكم في طرق الدفع والاستلام", "Payment and payout methods")}</h2>
            <p className="text-sm text-gray-400 mb-4">
              {text("إيقاف طريقة دفع أو استلام بعينها — يظهر للمستخدم رسالة صيانة عند محاولة استخدامها", "Enable or disable individual payment and payout methods.")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToggleSwitch
                enabled={siteSettings.instapayEnabled}
                onChange={(v) => setSiteSettings({ ...siteSettings, instapayEnabled: v })}
                label="InstaPay 💠"
                description={text("الدفع / الاستلام عبر InstaPay", "Pay or receive through InstaPay")}
                enabledColor="bg-blue-500"
                enabledLabel={text("InstaPay متاح", "InstaPay enabled")}
                disabledLabel={text("InstaPay موقوف", "InstaPay paused")}
              />
              <ToggleSwitch
                enabled={siteSettings.vodafoneEnabled}
                onChange={(v) => setSiteSettings({ ...siteSettings, vodafoneEnabled: v })}
                label="Vodafone Cash 📱"
                description={text("الدفع / الاستلام عبر Vodafone Cash", "Pay or receive through Vodafone Cash")}
                enabledColor="bg-red-500"
                enabledLabel={text("Vodafone متاح", "Vodafone enabled")}
                disabledLabel={text("Vodafone موقوف", "Vodafone paused")}
              />
              <ToggleSwitch
                enabled={siteSettings.binanceEnabled}
                onChange={(v) => setSiteSettings({ ...siteSettings, binanceEnabled: v })}
                label="Binance UID 🔑"
                description={text("استلام USDT عبر Binance UID", "Receive USDT through Binance UID")}
                enabledColor="bg-yellow-500"
                enabledLabel={text("Binance متاح", "Binance enabled")}
                disabledLabel={text("Binance موقوف", "Binance paused")}
              />
              <ToggleSwitch
                enabled={siteSettings.bep20Enabled}
                onChange={(v) => setSiteSettings({ ...siteSettings, bep20Enabled: v })}
                label="USDT wallet (BSC / BEP20)"
                description={text("إيداع وسحب USDT عبر شبكة BSC فقط", "USDT transfers on BSC only")}
                enabledColor="bg-yellow-500"
                enabledLabel={text("شبكة BSC متاحة", "BSC enabled")}
                disabledLabel={text("شبكة BSC موقوفة", "BSC paused")}
              />
            </div>

            {/* Status Summary */}
            {(!siteSettings.buyEnabled ||
              !siteSettings.sellEnabled ||
              !siteSettings.instapayEnabled ||
              !siteSettings.vodafoneEnabled ||
              !siteSettings.binanceEnabled ||
              !siteSettings.bep20Enabled) && (
              <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ {text("تحذير — خدمات موقوفة حاليًا:", "Warning — services currently paused:")}</p>
                <ul className="text-xs text-yellow-300 space-y-1">
                  {!siteSettings.buyEnabled && <li>• {text("الشراء موقوف — لا يمكن للمستخدمين شراء USDT", "Buying is paused — users cannot buy USDT")}</li>}
                  {!siteSettings.sellEnabled && <li>• {text("البيع موقوف — لا يمكن للمستخدمين بيع USDT", "Selling is paused — users cannot sell USDT")}</li>}
                  {!siteSettings.instapayEnabled && <li>• {text("InstaPay متوقف للصيانة", "InstaPay is paused for maintenance")}</li>}
                  {!siteSettings.vodafoneEnabled && <li>• {text("Vodafone Cash متوقف للصيانة", "Vodafone Cash is paused for maintenance")}</li>}
                  {!siteSettings.binanceEnabled && <li>• {text("استلام Binance UID متوقف للصيانة", "Binance UID payouts are paused")}</li>}
                  {!siteSettings.bep20Enabled && <li>• {text("شبكة BSC متوقفة للصيانة", "BSC transfers are paused")}</li>}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <PrimaryButton
                type="button"
                onClick={handleSiteSettingsSubmit}
                className="w-full sm:w-auto"
                disabled={savingSettings}
              >
                {savingSettings ? text("جاري الحفظ...", "Saving...") : `💾 ${text("حفظ إعدادات التشغيل", "Save service settings")}`}
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== Payment Settings ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">{text("إعدادات الدفع", "Payment settings")}</h2>
            <p className="text-sm text-gray-400 mb-6">
              {text("طرق الدفع المتاحة للعملاء — تظهر في صفحات الشراء والبيع", "Customer payment details shown on the buy and sell pages")}
            </p>

            <form onSubmit={handleSiteSettingsSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vodafone Cash */}
                <FormGroup>
                  <Label htmlFor="vodafoneCashNumber">{text("رقم Vodafone Cash 📱", "Vodafone Cash number 📱")}</Label>
                  <Input
                    id="vodafoneCashNumber"
                    type="tel"
                    placeholder="مثال: 01069053242"
                    value={siteSettings.vodafoneCashNumber}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        vodafoneCashNumber: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {text("يُعرض للعملاء في صفحة الشراء (شراء USDT مقابل EGP)", "Shown to customers on the Buy USDT page")}
                  </p>
                </FormGroup>

                {/* InstaPay Link */}
                <FormGroup>
                  <Label htmlFor="instapayNumber">{text("رابط دفع InstaPay المباشر 🔗", "InstaPay payment link 🔗")}</Label>
                  <Input
                    id="instapayNumber"
                    type="text"
                    placeholder="مثال: https://ipn.eg/S/username/instapay/..."
                    value={siteSettings.instapayNumber}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        instapayNumber: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">{text("رابط الدفع المباشر عبر InstaPay — يظهر للعميل عند اختيار طريقة الدفع.", "Direct InstaPay link shown to customers who choose this payment method.")}</p>
                </FormGroup>

                {/* Binance UID */}
                <FormGroup>
                  <Label htmlFor="binanceUid">
                    Binance UID 🔑
                  </Label>
                  <Input
                    id="binanceUid"
                    type="text"
                    placeholder="مثال: 842292089"
                    value={siteSettings.binanceUid}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        binanceUid: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">{text("يُعرض للعملاء لاستلام USDT عبر Binance UID", "Shown to customers receiving USDT through Binance UID")}</p>
                </FormGroup>

                {/* BSC deposit address */}
                <FormGroup>
                  <Label htmlFor="usdtBep20Address">{text("عنوان إيداع USDT على شبكة BSC (BEP20)", "USDT deposit address on BSC (BEP20)")}</Label>
                  <Input
                    id="usdtBep20Address"
                    type="text"
                    placeholder="0x..."
                    value={siteSettings.usdtBep20Address}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        usdtBep20Address: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">{text("العنوان الذي سيحوّل إليه العملاء USDT عبر شبكة BSC فقط.", "The address customers use to send USDT over BSC only.")}</p>
                </FormGroup>
              </div>

              {/* Preview */}
              {(siteSettings.vodafoneCashNumber ||
                siteSettings.binanceUid ||
                siteSettings.instapayNumber ||
              siteSettings.usdtBep20Address) && (
                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#F5B942]/20">
                  <p className="text-xs text-[#F5B942] font-semibold mb-3 uppercase tracking-wide">
                    {text("معاينة — ما سيراه العملاء", "Preview — customer view")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {siteSettings.vodafoneCashNumber && (
                      <div>
                        <span className="text-gray-500">Vodafone Cash:</span>
                        <span className="text-white font-semibold mr-2">
                          {siteSettings.vodafoneCashNumber}
                        </span>
                      </div>
                    )}
                    {siteSettings.instapayNumber && (
                      <div>
                        <span className="text-gray-500">InstaPay Link:</span>
                        <span className="text-white font-semibold mr-2 break-all">
                          {siteSettings.instapayNumber}
                        </span>
                      </div>
                    )}
                    {siteSettings.binanceUid && (
                      <div>
                        <span className="text-gray-500">Binance UID:</span>
                        <span className="text-white font-semibold mr-2">
                          {siteSettings.binanceUid}
                        </span>
                      </div>
                    )}
                    {siteSettings.usdtBep20Address && (
                      <div>
                        <span className="text-gray-500">USDT BSC:</span>
                        <span className="text-white font-semibold mr-2">
                          {siteSettings.usdtBep20Address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <PrimaryButton
                type="submit"
                className="w-full sm:w-auto"
                disabled={savingSettings}
              >
                {savingSettings ? text("جاري الحفظ...", "Saving...") : `💾 ${text("حفظ إعدادات الدفع", "Save payment settings")}`}
              </PrimaryButton>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== Exchange Rates ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent>
            <h2 className="text-xl sm:text-2xl font-bold mb-6">{text("أسعار الصرف", "Exchange rates")}</h2>

            <form onSubmit={handleRatesSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Buy Rate */}
                <FormGroup>
                  <Label htmlFor="buyRate">{text("سعر الشراء (EGP/USDT)", "Buy rate (EGP/USDT)")}</Label>
                  <Input
                    id="buyRate"
                    type="number"
                    step="0.01"
                    value={formData.buyRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyRate: parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-sm text-[#F5B942] mt-2">
                    {text("الحالي:", "Current:")} {rates?.buyRate.toFixed(2)} EGP
                  </p>
                </FormGroup>

                {/* Sell Rate */}
                <FormGroup>
                  <Label htmlFor="sellRate">{text("سعر البيع (EGP/USDT)", "Sell rate (EGP/USDT)")}</Label>
                  <Input
                    id="sellRate"
                    type="number"
                    step="0.01"
                    value={formData.sellRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellRate: parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-sm text-[#F5B942] mt-2">
                    {text("الحالي:", "Current:")} {rates?.sellRate.toFixed(2)} EGP
                  </p>
                </FormGroup>

                {/* Min Order */}
                <FormGroup>
                  <Label htmlFor="minOrder">{text("الحد الأدنى للطلب (USDT)", "Minimum order (USDT)")}</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: parseFloat(e.target.value),
                      })
                    }
                  />
                </FormGroup>

                {/* Max Order */}
                <FormGroup>
                  <Label htmlFor="maxOrder">{text("الحد الأقصى للطلب (USDT)", "Maximum order (USDT)")}</Label>
                  <Input
                    id="maxOrder"
                    type="number"
                    value={formData.maxOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxOrderAmount: parseFloat(e.target.value),
                      })
                    }
                  />
                </FormGroup>
              </div>

              <PrimaryButton
                type="submit"
                className="w-full sm:w-auto"
                disabled={saving}
              >
                {saving ? text("جاري الحفظ...", "Saving...") : `💾 ${text("حفظ الأسعار", "Save rates")}`}
              </PrimaryButton>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== Info Card ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent>
            <h3 className="text-lg font-bold mb-4">{text("معلومات هامة", "Important information")}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• {text("عند إيقاف الشراء أو البيع، تظهر رسالة صيانة للمستخدمين.", "Paused buy/sell services show a maintenance notice.")}</li>
              <li>• {text("إيقاف وسيلة دفع يمنع استخدامها في الطلبات الجديدة.", "Disabling a payment method prevents its use in new orders.")}</li>
              <li>• {text("يظهر رابط InstaPay مباشرة للعملاء عند اختياره.", "The InstaPay link is shown directly when selected.")}</li>
              <li>• {text("يتم استخدام عنوان USDT الذي أدخلته لشبكة BSC فقط.", "The configured USDT address is used for BSC only.")}</li>
              <li>• {text("تُحدَّث الأسعار تلقائيًا في جميع الصفحات.", "Updated rates are reflected across the site.")}</li>
              <li>• {text("تُسجَّل التغييرات في سجل العمليات.", "Changes are recorded in the audit log.")}</li>
              <li>• {text("تحقق من بيانات الدفع قبل الحفظ لتجنب أخطاء التحويل.", "Verify payment details before saving to avoid transfer errors.")}</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
