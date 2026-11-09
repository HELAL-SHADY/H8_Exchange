"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Coins,
} from "lucide-react";
import { motion } from "framer-motion";

export default function UserDashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/dashboard")
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const rates = data?.rates;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome & Fast Trade Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141419] via-[#101014] to-[#0A0A0C] border border-amber-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>منصة التداول الآمن والمعتمد في مصر</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              أهلاً بك، {data?.user?.name || "عميلنا العزيز"}
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              يمكنك متابعة صفقاتك الحالية، تحويل وشراء USDT بأفضل أسعار السوق المصري عبر InstaPay وفودافون كاش وبوابات التداول العالمية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/buy"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>شراء USDT</span>
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>بيع USDT</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Market Rates Card */}
      {rates && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#111116] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">سعر شراء USDT اليوم</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {rates.buyRate} <span className="text-sm font-normal text-gray-300">ج.م / USDT</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111116] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">سعر بيع USDT اليوم</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {rates.sellRate} <span className="text-sm font-normal text-gray-300">ج.م / USDT</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111116] border border-white/5 hover:border-amber-500/30 transition-all">
          <span className="text-xs text-gray-400 font-medium">إجمالي المشتريات</span>
          <div className="text-xl md:text-2xl font-black text-white mt-1">
            {stats.totalPurchasedUsdt} <span className="text-xs font-normal text-amber-400">USDT</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">عمليات مكتملة</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111116] border border-white/5 hover:border-amber-500/30 transition-all">
          <span className="text-xs text-gray-400 font-medium">إجمالي المبيعات</span>
          <div className="text-xl md:text-2xl font-black text-white mt-1">
            {stats.totalSoldUsdt} <span className="text-xs font-normal text-emerald-400">USDT</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">عمليات مسحوبة</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111116] border border-white/5 hover:border-amber-500/30 transition-all">
          <span className="text-xs text-gray-400 font-medium">الطلبات قيد المراجعة</span>
          <div className="text-xl md:text-2xl font-black text-amber-400 mt-1">
            {stats.pendingOrders}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">بانتظار التأكيد</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111116] border border-white/5 hover:border-amber-500/30 transition-all">
          <span className="text-xs text-gray-400 font-medium">الطلبات المكتملة</span>
          <div className="text-xl md:text-2xl font-black text-emerald-400 mt-1">
            {stats.completedOrders}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">من إجمالي {stats.totalOrders} طلب</span>
        </div>
      </div>

      {/* Recent Activity & Orders */}
      <div className="p-6 rounded-3xl bg-[#0E0E12]/90 border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">آخر المعاملات والطلبات</h2>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>عرض كل الطلبات</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!data?.recentOrders || data.recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-3">
            <p className="text-sm">لا توجد طلبات سابقة حتى الآن.</p>
            <Link
              href="/buy"
              className="inline-block px-5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20"
            >
              ابدأ أول طلب شراء الآن
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/5 text-xs">
                  <th className="pb-3 font-semibold">رقم الطلب</th>
                  <th className="pb-3 font-semibold">النوع</th>
                  <th className="pb-3 font-semibold">المبلغ</th>
                  <th className="pb-3 font-semibold">سعر الصرف</th>
                  <th className="pb-3 font-semibold">طريقة الدفع/الاستلام</th>
                  <th className="pb-3 font-semibold">الحالة</th>
                  <th className="pb-3 font-semibold">التاريخ</th>
                  <th className="pb-3 font-semibold">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recentOrders.map((ord: any) => {
                  const isBuy = ord.type === "BUY";
                  return (
                    <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-mono font-bold text-amber-400 text-xs">
                        {ord.orderNumber || ord.id.slice(0, 10)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                            isBuy
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isBuy ? "شراء USDT" : "بيع USDT"}
                        </span>
                      </td>
                      <td className="py-4 font-semibold text-white">
                        {ord.usdtAmount ? `${ord.usdtAmount} USDT` : `${ord.amount}`}
                        {ord.egpAmount && (
                          <span className="block text-xs text-gray-400 font-normal">
                            ({ord.egpAmount} ج.م)
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-gray-300 text-xs">
                        {ord.rateSnapshot ? `${ord.rateSnapshot} ج.م` : "-"}
                      </td>
                      <td className="py-4 text-gray-300 text-xs">
                        {ord.paymentMethod || ord.receiveMethod || "-"}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : ord.status === "REJECTED" || ord.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {ord.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                          {ord.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                          {ord.status.includes("PENDING") && <Clock className="w-3 h-3" />}
                          <span>{ord.status}</span>
                        </span>
                      </td>
                      <td className="py-4 text-xs text-gray-400">
                        {new Date(ord.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/dashboard/orders/${ord.id}`}
                          className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                        >
                          تفاصيل
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
