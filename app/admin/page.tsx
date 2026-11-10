"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      setStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-red-400 py-12">فشل تحميل إحصائيات الإدارة</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">لوحة القيادة والمؤشرات المالية الحية</h1>
        <p className="text-xs text-gray-400 mt-1">
          رصد فوري لحجم التداول الكلي، أرباح الهامش (Spread Margin)، وحالات مراجعة الطلبات.
        </p>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0E0E12] border border-amber-500/30">
          <span className="text-xs text-gray-400 font-medium">حجم الشراء الكلي (Buy Volume)</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {stats.totalBuyVolumeUsdt} <span className="text-xs text-gray-300">USDT</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">عمليات شراء منفذة</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E0E12] border border-emerald-500/30">
          <span className="text-xs text-gray-400 font-medium">حجم البيع الكلي (Sell Volume)</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {stats.totalSellVolumeUsdt} <span className="text-xs text-gray-300">USDT</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">عمليات بيع منفذة</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E0E12] border border-white/5">
          <span className="text-xs text-gray-400 font-medium">أرباح هامش الصرف (Gross Spread)</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {stats.estimatedSpreadProfitEgp} <span className="text-xs text-amber-400">EGP</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            بناءً على فارق السعر ({stats.spreadPerUsdt} ج.م / USDT)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E0E12] border border-white/5">
          <span className="text-xs text-gray-400 font-medium">إجمالي المستخدمين المسجلين</span>
          <div className="text-2xl font-black text-purple-400 font-mono mt-1">
            {stats.totalUsers}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">عملاء نشطين</span>
        </div>
      </div>

      {/* Operational Order Flow Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/orders?status=PENDING_PAYMENT"
          className="p-5 rounded-2xl bg-[#0E0E12] border border-amber-500/20 hover:border-amber-500/50 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">بانتظار الدفع</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{stats.pendingOrders}</div>
          <span className="text-[10px] text-amber-400/80 mt-1 block group-hover:underline">
            عرض الطلبات العاجلة ←
          </span>
        </Link>

        <Link
          href="/admin/orders?status=UNDER_VERIFICATION"
          className="p-5 rounded-2xl bg-[#0E0E12] border border-blue-500/20 hover:border-blue-500/50 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">الفحص المصرفي</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">{stats.underVerificationOrders}</div>
          <span className="text-[10px] text-blue-400/80 mt-1 block group-hover:underline">
            مراجعة إثبات الدفع ←
          </span>
        </Link>

        <Link
          href="/admin/orders?status=COMPLETED"
          className="p-5 rounded-2xl bg-[#0E0E12] border border-emerald-500/20 hover:border-emerald-500/50 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">مكتملة بنجاح</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{stats.completedOrders}</div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block group-hover:underline">
            معدل إنجاز {stats.successRate}%
          </span>
        </Link>

        <Link
          href="/admin/orders?status=REJECTED"
          className="p-5 rounded-2xl bg-[#0E0E12] border border-red-500/20 hover:border-red-500/50 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">مرفوضة أو ملغية</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 mt-2">{stats.rejectedOrders}</div>
          <span className="text-[10px] text-red-400/80 mt-1 block group-hover:underline">
            عرض أسباب الرفض ←
          </span>
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/orders"
          className="p-6 rounded-3xl bg-gradient-to-br from-[#121218] to-[#0A0A0E] border border-white/5 hover:border-amber-500/30 transition-all space-y-2 block"
        >
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>إدارة وتدقيق كافة الطلبات</span>
            <ChevronRight className="w-4 h-4 text-amber-400 rtl:rotate-180" />
          </h3>
          <p className="text-xs text-gray-400">
            فحص إيصالات الدفع، مطابقة مبالغ فودافون كاش وإنستا باي، واعتماد التحويلات للمستخدمين.
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="p-6 rounded-3xl bg-gradient-to-br from-[#121218] to-[#0A0A0E] border border-white/5 hover:border-amber-500/30 transition-all space-y-2 block"
        >
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>تحديث أسعار الصرف وبوابات الدفع</span>
            <ChevronRight className="w-4 h-4 text-amber-400 rtl:rotate-180" />
          </h3>
          <p className="text-xs text-gray-400">
            تعديل سعر شراء وبيع USDT، تفعيل وتعطيل فودافون كاش أو إنستا باي، وحفظ سجل التغييرات.
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="p-6 rounded-3xl bg-gradient-to-br from-[#121218] to-[#0A0A0E] border border-white/5 hover:border-amber-500/30 transition-all space-y-2 block"
        >
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>إدارة حسابات العملاء والصلاحيات</span>
            <ChevronRight className="w-4 h-4 text-amber-400 rtl:rotate-180" />
          </h3>
          <p className="text-xs text-gray-400">
            توثيق العملاء، إيقاف الحسابات المشبوهة، ومتابعة سجل العمليات الحساسة.
          </p>
        </Link>
      </div>
    </div>
  );
}
