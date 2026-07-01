"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton } from "@/components/ui/button";
import { FormGroup, Label, Input } from "@/components/ui/form";
import { motion } from "framer-motion";

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
  bybitPayId: string;
  telegramUsername: string;
  supportEmail: string;
  announcement: string;
  buyEnabled: boolean;
  sellEnabled: boolean;
}

export default function AdminSettingsPage() {
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
    bybitPayId: "",
    telegramUsername: "",
    supportEmail: "",
    announcement: "",
    buyEnabled: true,
    sellEnabled: true,
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
          bybitPayId: data.bybitPayId || "",
          telegramUsername: data.telegramUsername || "",
          supportEmail: data.supportEmail || "",
          announcement: data.announcement || "",
          buyEnabled: data.buyEnabled ?? true,
          sellEnabled: data.sellEnabled ?? true,
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
        alert("✅ تم تحديث الأسعار بنجاح!");
      } else {
        alert("❌ فشل التحديث");
      }
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
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
        alert("✅ تم تحديث إعدادات الموقع بنجاح!");
      } else {
        const err = await response.json();
        alert("❌ فشل التحديث: " + (err.error || "خطأ غير معروف"));
      }
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-10">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold">الإعدادات</h1>
        <p className="text-gray-400 mt-2">إدارة أسعار الصرف وإعدادات الدفع</p>
      </motion.div>

      {/* ===== Payment Settings ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">إعدادات الدفع</h2>
            <p className="text-sm text-gray-400 mb-6">
              طرق الدفع المتاحة للعملاء — تظهر في صفحات الشراء والبيع
            </p>

            <form onSubmit={handleSiteSettingsSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vodafone Cash */}
                <FormGroup>
                  <Label htmlFor="vodafoneCashNumber">
                    رقم Vodafone Cash 📱
                  </Label>
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
                    يُعرض للعملاء في صفحة الشراء (شراء USDT مقابل EGP)
                  </p>
                </FormGroup>

                {/* InstaPay */}
                <FormGroup>
                  <Label htmlFor="instapayNumber">
                    رقم / رابط InstaPay 💠
                  </Label>
                  <Input
                    id="instapayNumber"
                    type="text"
                    placeholder="مثال: 01069053242 أو yourname@instapay"
                    value={siteSettings.instapayNumber}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        instapayNumber: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يُعرض للعملاء كطريقة بديلة في صفحة الشراء (EGP)
                  </p>
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
                  <p className="text-xs text-gray-500 mt-1">
                    يُعرض للعملاء في صفحة البيع (بيع USDT مقابل EGP)
                  </p>
                </FormGroup>

                {/* Bybit Pay */}
                <FormGroup>
                  <Label htmlFor="bybitPayId">
                    Bybit Pay ID 💠
                  </Label>
                  <Input
                    id="bybitPayId"
                    type="text"
                    placeholder="مثال: 123456789"
                    value={siteSettings.bybitPayId}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        bybitPayId: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يُعرض للعملاء كطريقة بديلة في صفحة البيع (USDT)
                  </p>
                </FormGroup>
              </div>

              {/* Preview */}
              {(siteSettings.vodafoneCashNumber ||
                siteSettings.binanceUid ||
                siteSettings.instapayNumber ||
                siteSettings.bybitPayId) && (
                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#F5B942]/20">
                  <p className="text-xs text-[#F5B942] font-semibold mb-3 uppercase tracking-wide">
                    معاينة — ما سيراه العملاء
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
                        <span className="text-gray-500">InstaPay:</span>
                        <span className="text-white font-semibold mr-2">
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
                    {siteSettings.bybitPayId && (
                      <div>
                        <span className="text-gray-500">Bybit Pay ID:</span>
                        <span className="text-white font-semibold mr-2">
                          {siteSettings.bybitPayId}
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
                {savingSettings ? "جاري الحفظ..." : "💾 حفظ إعدادات الدفع"}
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
            <h2 className="text-xl sm:text-2xl font-bold mb-6">أسعار الصرف</h2>

            <form onSubmit={handleRatesSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Buy Rate */}
                <FormGroup>
                  <Label htmlFor="buyRate">سعر الشراء (EGP/USDT)</Label>
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
                    الحالي: {rates?.buyRate.toFixed(2)} EGP
                  </p>
                </FormGroup>

                {/* Sell Rate */}
                <FormGroup>
                  <Label htmlFor="sellRate">سعر البيع (EGP/USDT)</Label>
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
                    الحالي: {rates?.sellRate.toFixed(2)} EGP
                  </p>
                </FormGroup>

                {/* Min Order */}
                <FormGroup>
                  <Label htmlFor="minOrder">الحد الأدنى للطلب (USDT / $)</Label>
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
                  <Label htmlFor="maxOrder">الحد الأقصى للطلب (USDT / $)</Label>
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
                {saving ? "جاري الحفظ..." : "💾 حفظ الأسعار"}
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
            <h3 className="text-lg font-bold mb-4">معلومات هامة</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• عند تغيير رقم Vodafone Cash أو InstaPay، يظهر الرقم الجديد فوراً لكل العملاء</li>
              <li>• عند تغيير Binance UID أو Bybit Pay ID، يظهر فوراً في صفحة البيع</li>
              <li>• عند تحديث الأسعار، تُحدَّث تلقائياً في جميع الصفحات</li>
              <li>• كل تغيير يُسجَّل في سجل العمليات</li>
              <li>• تأكد من صحة أرقام الدفع قبل الحفظ لتجنب أخطاء التحويلات</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}