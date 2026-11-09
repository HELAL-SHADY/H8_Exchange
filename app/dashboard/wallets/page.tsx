"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus, Trash2, CheckCircle2, AlertCircle, Copy } from "lucide-react";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    type: "VODAFONE_CASH",
    network: "TRC20",
    address: "",
    isDefault: false,
  });

  const fetchWallets = () => {
    fetch("/api/user/wallets")
      .then((res) => res.json())
      .then((data) => setWallets(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("فشل إضافة المحفظة");
      setShowModal(false);
      setFormData({
        label: "",
        type: "VODAFONE_CASH",
        network: "TRC20",
        address: "",
        isDefault: false,
      });
      fetchWallets();
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المحفظة؟")) return;
    try {
      await fetch(`/api/user/wallets?id=${id}`, { method: "DELETE" });
      fetchWallets();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">المحافظ وحسابات الاستلام المحفوظة</h1>
          <p className="text-sm text-gray-400 mt-1">
            سجل محافظ فودافون كاش، إنستا باي، وبينانس لسرعة ملء بيانات طلبات البيع والشراء.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة محفظة جديدة</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : wallets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0E0E12] border border-white/5 space-y-3">
          <Wallet className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-sm text-gray-400">لم تقم بإضافة أي محافظ محفوظة بعد.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30 hover:bg-amber-500/20"
          >
            إضافة أول محفظة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="p-5 rounded-2xl bg-[#0E0E12] border border-white/5 hover:border-amber-500/30 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  {w.label}
                </span>
                <div className="flex items-center gap-2">
                  {w.isDefault && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                      افتراضي
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {w.type} {w.network ? `(${w.network})` : ""}
                </div>
                <div className="text-sm font-mono text-amber-400 font-bold break-all mt-1 flex items-center justify-between">
                  <span>{w.address}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(w.address)}
                    className="text-gray-500 hover:text-white shrink-0 ml-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">إضافة محفظة أو حساب استلام</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">اسم المحفظة التمييزي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فودافون كاش الأساسي"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">نوع المحفظة</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="VODAFONE_CASH">فودافون كاش (Vodafone Cash)</option>
                  <option value="INSTAPAY">إنستا باي (InstaPay)</option>
                  <option value="BINANCE_PAY">معرف بينانس (Binance UID)</option>
                  <option value="BYBIT_PAY">معرف بايبت (Bybit UID)</option>
                  <option value="CRYPTO_WALLET">محفظة كريبتو خارجية (On-chain Wallet)</option>
                </select>
              </div>

              {formData.type === "CRYPTO_WALLET" && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">شبكة التحويل</label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="TRC20">TRON (TRC20) - الأسرع والأقل عمولة</option>
                    <option value="BEP20">BNB Smart Chain (BEP20)</option>
                    <option value="ERC20">Ethereum (ERC20)</option>
                    <option value="POLYGON">Polygon (MATIC)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-400 block mb-1">رقم الهاتف أو المعرف أو العنوان</label>
                <input
                  type="text"
                  required
                  placeholder="010XXXXXXXX أو المعرف أو العنوان"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-white/10 bg-black/40 text-amber-500"
                />
                <label htmlFor="defaultCheck" className="text-xs text-gray-300">
                  تعيين كحساب استلام افتراضي
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : "حفظ المحفظة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
