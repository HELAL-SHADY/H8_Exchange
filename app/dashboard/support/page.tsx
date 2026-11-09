"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle2, ChevronRight } from "lucide-react";

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "GENERAL",
    priority: "MEDIUM",
    message: "",
  });

  const fetchTickets = () => {
    fetch("/api/support/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("فشل إرسال التذكرة");
      setShowModal(false);
      setFormData({ subject: "", category: "GENERAL", priority: "MEDIUM", message: "" });
      fetchTickets();
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">مركز المساعدة والدعم الفني</h1>
          <p className="text-sm text-gray-400 mt-1">
            فريق خدمة العملاء متواجد للمساعدة على مدار الساعة في التحويلات، استفسارات الصرف، والمشاكل التقنية.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://t.me/H8ExchangeSupport"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-bold border border-sky-500/30 transition-all"
          >
            تواصل عبر تيليجرام
          </a>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>فتح تذكرة دعم جديدة</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0E0E12] border border-white/5 space-y-3">
          <LifeBuoy className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-sm text-gray-400">ليس لديك أي تذاكر دعم مفتوحة حالياً.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/support/${t.id}`}
              className="p-5 rounded-2xl bg-[#0E0E12] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group block"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {t.ticketNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                    {t.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  {t.subject}
                </h3>
                <p className="text-xs text-gray-400">
                  آخر تحديث: {new Date(t.updatedAt).toLocaleString("ar-EG")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                    t.status === "OPEN"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : t.status === "WAITING_USER"
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {t.status}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 rtl:rotate-180" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111116] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">فتح تذكرة دعم فني جديدة</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">موضوع التذكرة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: استفسار عن تحويل إثبات الدفع للطلب H8-..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">القسم</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="GENERAL">عام</option>
                    <option value="BUY_ORDER">طلب شراء USDT</option>
                    <option value="SELL_ORDER">طلب بيع USDT</option>
                    <option value="PAYMENT_VERIFICATION">التحقق من الدفع والإيصالات</option>
                    <option value="TECHNICAL">مشكلة تقنية</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">الأولوية</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="LOW">عادية</option>
                    <option value="MEDIUM">متوسطة</option>
                    <option value="HIGH">عالية</option>
                    <option value="URGENT">طارئة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">تفاصيل الرسالة أو المشكلة</label>
                <textarea
                  required
                  rows={4}
                  placeholder="اشرح المشكلة بالتفصيل مع إرفاق رقم العملية إن وجد..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
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
                  {saving ? "جاري الإرسال..." : "إرسال التذكرة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
