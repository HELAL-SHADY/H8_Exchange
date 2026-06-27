"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  completedOrders: number;
  totalUsers: number;
  successRate: number;
  totalVolume: number;
  averageRating: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center text-gray-400">جاري التحميل...</div>;
  }

  if (!stats) {
    return <div className="text-center text-red-400">فشل تحميل الإحصائيات</div>;
  }

  const statCards = [
    {
      label: "إجمالي الطلبات",
      value: stats.totalOrders,
      icon: BarChart3,
      color: "blue",
    },
    {
      label: "طلبات معلقة",
      value: stats.pendingOrders,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "طلبات معتمدة",
      value: stats.approvedOrders,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "طلبات مرفوضة",
      value: stats.rejectedOrders,
      icon: XCircle,
      color: "red",
    },
    {
      label: "طلبات مكتملة",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "emerald",
    },
    {
      label: "إجمالي المستخدمين",
      value: stats.totalUsers,
      icon: Users,
      color: "purple",
    },
    {
      label: "معدل النجاح",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: "gold",
    },
    {
      label: "إجمالي الحجم",
      value: `${Math.round(stats.totalVolume)} EGP`,
      icon: BarChart3,
      color: "indigo",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold">لوحة التحكم</h1>
        <p className="text-gray-400 mt-2">مرحباً بك في لوحة تحكم الإدارة</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            blue: "text-blue-500",
            yellow: "text-yellow-500",
            green: "text-green-500",
            red: "text-red-500",
            emerald: "text-emerald-500",
            purple: "text-purple-500",
            gold: "text-[#F5B942]",
            indigo: "text-indigo-500",
          };

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:border-[#F5B942] transition-colors">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${colorMap[stat.color]}`} />
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card>
          <CardContent>
            <h3 className="font-bold text-lg mb-4">الإجراءات السريعة</h3>
            <div className="space-y-2">
              <a
                href="/admin/orders?status=PENDING_REVIEW"
                className="block px-4 py-2 bg-[#2D2D2D] hover:bg-[#F5B942] hover:text-[#0A0A0A] rounded-lg transition-colors"
              >
                عرض الطلبات المعلقة
              </a>
              <a
                href="/admin/settings"
                className="block px-4 py-2 bg-[#2D2D2D] hover:bg-[#F5B942] hover:text-[#0A0A0A] rounded-lg transition-colors"
              >
                تحديث أسعار الصرف
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="font-bold text-lg mb-4">الإحصائيات</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-sm mb-1">متوسط التقييم</p>
                <p className="text-2xl font-bold text-[#F5B942]">
                  {stats.averageRating} ⭐
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">نسبة الإنجاز</p>
                <div className="w-full bg-[#2D2D2D] rounded-full h-2">
                  <div
                    className="bg-[#F5B942] h-2 rounded-full transition-all"
                    style={{
                      width: `${stats.successRate}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
