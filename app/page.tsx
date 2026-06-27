"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Star,
  Globe,
} from "lucide-react";

export default function HomePage() {
  const [stats, setStats] = useState({
    completedOrders: 0,
    totalUsers: 0,
    successRate: 0,
    avgRating: 0,
  });

  const [exchangeRate, setExchangeRate] = useState({
    buyRate: 51.0,
    sellRate: 50.0,
  });

  useEffect(() => {
    // Fetch stats
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats({
            completedOrders: data.stats.completedOrders,
            totalUsers: data.stats.totalUsers,
            successRate: data.stats.successRate,
            avgRating: data.stats.averageRating,
          });
        }
      })
      .catch(console.error);

    // Fetch exchange rates
    fetch("/api/admin/exchange-rates")
      .then((res) => res.json())
      .then((data) => {
        setExchangeRate({
          buyRate: data.buyRate,
          sellRate: data.sellRate,
        });
      })
      .catch(console.error);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "معاملات آمنة",
      description: "ضمان الأمان والحماية في كل عملية",
    },
    {
      icon: Zap,
      title: "معالجة سريعة",
      description: "تتم المعالجة خلال دقائق",
    },
    {
      icon: TrendingUp,
      title: "دعم Binance",
      description: "تحويل مباشر من/إلى Binance",
    },
    {
      icon: Clock,
      title: "دعم 24/7",
      description: "فريق الدعم متاح على مدار الساعة",
    },
    {
      icon: Globe,
      title: "دعم Vodafone Cash",
      description: "محافظ الهاتف المحمول المدعومة",
    },
    {
      icon: Star,
      title: "تقييمات عالية",
      description: "مصدوقة من قبل آلاف المستخدمين",
    },
  ];

  const steps = {
    buy: [
      { number: 1, title: "إنشاء طلب", description: "ملء نموذج الطلب" },
      { number: 2, title: "تحويل EGP", description: "إرسال الأموال للمحفظة" },
      { number: 3, title: "رفع الإثبات", description: "تحميل لقطة شاشة" },
      { number: 4, title: "استقبال USDT", description: "وصول USDT للمحفظة" },
    ],
    sell: [
      { number: 1, title: "إنشاء طلب", description: "ملء نموذج الطلب" },
      { number: 2, title: "تحويل USDT", description: "إرسال USDT للمحفظة" },
      { number: 3, title: "التحقق", description: "التحقق من الحوالة" },
      { number: 4, title: "استقبال EGP", description: "وصول الأموال" },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5B942]/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent">
                H8 Exchange
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8">
              شراء وبيع USDT مقابل الجنيه المصري بسرعة وأمان
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/buy">
                <PrimaryButton className="text-lg px-8">
                  شراء USDT
                </PrimaryButton>
              </Link>
              <Link href="/sell">
                <SecondaryButton className="text-lg px-8">
                  بيع USDT
                </SecondaryButton>
              </Link>
            </div>
          </motion.div>

          {/* Live Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-[#F5B942]/50 hover:border-[#F5B942] transition-colors">
                <CardContent className="text-center">
                  <p className="text-gray-400 mb-2">سعر الشراء</p>
                  <p className="text-4xl font-bold text-[#F5B942]">
                    {exchangeRate.buyRate} EGP
                  </p>
                  <p className="text-sm text-gray-500 mt-2">لكل 1 USDT</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-[#F5B942]/50 hover:border-[#F5B942] transition-colors">
                <CardContent className="text-center">
                  <p className="text-gray-400 mb-2">سعر البيع</p>
                  <p className="text-4xl font-bold text-[#F5B942]">
                    {exchangeRate.sellRate} EGP
                  </p>
                  <p className="text-sm text-gray-500 mt-2">لكل 1 USDT</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-[#1A1A1A]/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">إحصائياتنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "طلب مكتمل", value: stats.completedOrders },
              { label: "مستخدم", value: stats.totalUsers },
              { label: "معدل النجاح", value: `${stats.successRate}%` },
              { label: "التقييم", value: `${stats.avgRating} ⭐` },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#F5B942]">
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">المميزات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:border-[#F5B942] transition-all duration-300 group">
                    <CardContent className="text-center py-8">
                      <Icon className="w-12 h-12 mx-auto mb-4 text-[#F5B942] group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-[#1A1A1A]/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">كيف يعمل</h2>

          {/* Buy */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-[#F5B942] mb-8">شراء USDT</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.buy.map((step, index) => (
                <div key={index} className="relative">
                  <Card>
                    <CardContent className="py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#F5B942] text-[#0A0A0A] font-bold flex items-center justify-center mx-auto mb-4 text-xl">
                        {step.number}
                      </div>
                      <h4 className="font-semibold mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </CardContent>
                  </Card>
                  {index < steps.buy.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 -mr-3 transform -translate-y-1/2 text-[#F5B942]">
                      ←
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sell */}
          <div>
            <h3 className="text-2xl font-bold text-[#F5B942] mb-8">بيع USDT</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.sell.map((step, index) => (
                <div key={index} className="relative">
                  <Card>
                    <CardContent className="py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#F5B942] text-[#0A0A0A] font-bold flex items-center justify-center mx-auto mb-4 text-xl">
                        {step.number}
                      </div>
                      <h4 className="font-semibold mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </CardContent>
                  </Card>
                  {index < steps.sell.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 -mr-3 transform -translate-y-1/2 text-[#F5B942]">
                      ←
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Track Order Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent>
              <h2 className="text-2xl font-bold mb-6 text-center">تتبع الطلب</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="أدخل رقم الطلب"
                  className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D] border border-[#3D3D3D] text-white placeholder-gray-500 focus:outline-none focus:border-[#F5B942] transition-colors"
                  id="trackOrderId"
                />
                <PrimaryButton
                  className="w-full"
                  onClick={() => {
                    const orderId = (
                      document.getElementById(
                        "trackOrderId"
                      ) as HTMLInputElement
                    ).value;
                    if (orderId) {
                      window.location.href = `/track?orderId=${orderId}`;
                    }
                  }}
                >
                  بحث
                </PrimaryButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
