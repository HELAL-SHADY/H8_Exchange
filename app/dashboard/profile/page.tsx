"use client";

import { useEffect, useState } from "react";
import { User, Phone, Mail, Shield, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    binanceUid: "",
    walletNumber: "",
    telegramUsername: "",
    currentPassword: "",
    newPassword: "",
  });

  const fetchProfile = () => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          binanceUid: data.binanceUid || "",
          walletNumber: data.walletNumber || "",
          telegramUsername: data.telegramUsername || "",
          currentPassword: "",
          newPassword: "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "فشل التحديث");

      setMsg({ type: "success", text: "تم تحديث البيانات بنجاح" });
      setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      fetchProfile();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">الملف الشخصي وإعدادات الحساب</h1>
        <p className="text-sm text-gray-400 mt-1">
          إدارة بياناتك الشخصية، معلومات الاستلام الافتراضية، وكلمة المرور.
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            msg.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>البيانات الأساسية</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">الاسم الكامل</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 text-sm cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                البريد الإلكتروني مرتبط بأمان حسابك وموثق.
              </span>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">رقم الهاتف (فودافون كاش / إنستا باي)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010XXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">معرف تيليجرام (اختياري للإشعارات)</label>
              <input
                type="text"
                value={formData.telegramUsername}
                onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                placeholder="@username"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Default Crypto & Wallet Info */}
        <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>بيانات الاستلام الافتراضية للتداول السريع</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                معرف بينانس الافتراضي (Binance UID)
              </label>
              <input
                type="text"
                value={formData.binanceUid}
                onChange={(e) => setFormData({ ...formData, binanceUid: e.target.value })}
                placeholder="مثال: 12345678"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">
                عنوان محفظة USDT (TRC20 / BEP20)
              </label>
              <input
                type="text"
                value={formData.walletNumber}
                onChange={(e) => setFormData({ ...formData, walletNumber: e.target.value })}
                placeholder="T..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>تغيير كلمة المرور</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">كلمة المرور الحالية</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
