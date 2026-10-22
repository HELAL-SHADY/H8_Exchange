"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PrimaryButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
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
import { useTranslation } from "@/lib/i18n";

export default function HomePage() {
  const { t, locale } = useTranslation();
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
      title: t("feature1Title"),
      description: t("feature1Desc"),
    },
    {
      icon: Zap,
      title: t("feature2Title"),
      description: t("feature2Desc"),
    },
    {
      icon: TrendingUp,
      title: t("feature3Title"),
      description: t("feature3Desc"),
    },
    {
      icon: Clock,
      title: t("feature4Title"),
      description: t("feature4Desc"),
    },
    {
      icon: Globe,
      title: t("feature5Title"),
      description: t("feature5Desc"),
    },
    {
      icon: Star,
      title: t("feature6Title"),
      description: t("feature6Desc"),
    },
  ];

  const steps = {
    buy: [
      { number: 1, title: t("step1Title"), description: t("step1Desc") },
      { number: 2, title: t("step2TitleBuy"), description: t("step2DescBuy") },
      { number: 3, title: t("step3TitleBuy"), description: t("step3DescBuy") },
      { number: 4, title: t("step4TitleBuy"), description: t("step4DescBuy") },
    ],
    sell: [
      { number: 1, title: t("step1Title"), description: t("step1Desc") },
      { number: 2, title: t("step2TitleSell"), description: t("step2DescSell") },
      { number: 3, title: t("step3TitleSell"), description: t("step3DescSell") },
      { number: 4, title: t("step4TitleSell"), description: t("step4DescSell") },
    ],
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-pill mb-6 text-xs text-[#F5B942] font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#F5B942] animate-pulse" />
              <span>{locale === "ar" ? "المنصة الأكثر أماناً وسرعة للتحويل" : "Fastest & Most Secure USDT Exchange"}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-[#F5B942] via-[#FFF3D1] to-[#E6A430] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(245,185,66,0.35)]">
                {t("heroTitle")}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              {t("heroSubtitle")}
            </p>

            {/* Liquid Action Buttons */}
            <div className="flex gap-6 justify-center flex-wrap mt-6">
              {/* Buy Button */}
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/buy">
                  <div
                    className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-[0_10px_35px_rgba(245,185,66,0.35)]"
                    style={{ minWidth: 200 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F5B942] via-[#F8C65D] to-[#E6A430] opacity-95 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="liquid-sheen" />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 px-10 py-5">
                      <div className="flex items-center gap-2.5">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                          <path d="M12 4v16M4 12l8-8 8 8" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[#0A0A0A] font-extrabold text-xl tracking-wide">{t("buyUsdt")}</span>
                      </div>
                      <span className="text-[#0A0A0A]/80 text-sm font-semibold">
                        {exchangeRate.buyRate} {t("egpPerUsdt")}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Sell Button */}
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/sell">
                  <div
                    className="relative group cursor-pointer rounded-2xl overflow-hidden liquid-glass border-[#F5B942]/40 hover:border-[#F5B942] shadow-[0_10px_35px_rgba(0,0,0,0.6)] transition-all duration-300"
                    style={{ minWidth: 200 }}
                  >
                    <div className="absolute inset-0 bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors duration-300" />
                    <div className="liquid-sheen" />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 px-10 py-5">
                      <div className="flex items-center gap-2.5">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                          <path d="M12 20V4M4 12l8 8 8-8" stroke="#F5B942" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[#F5B942] font-extrabold text-xl tracking-wide">{t("sellUsdt")}</span>
                      </div>
                      <span className="text-gray-300 text-sm font-semibold">
                        {exchangeRate.sellRate} {t("egpPerUsdt")}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Live Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="liquid-glass-gold">
                <CardContent className="text-center py-6">
                  <p className="text-gray-300 font-medium mb-1.5">{t("buyRate")}</p>
                  <p className="text-4xl sm:text-5xl font-extrabold text-[#F5B942] tracking-tight drop-shadow-[0_0_25px_rgba(245,185,66,0.4)]">
                    {exchangeRate.buyRate} EGP
                  </p>
                  <p className="text-xs text-gray-400 mt-2 font-medium">{t("perUsdt")}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="liquid-glass-gold">
                <CardContent className="text-center py-6">
                  <p className="text-gray-300 font-medium mb-1.5">{t("sellRate")}</p>
                  <p className="text-4xl sm:text-5xl font-extrabold text-[#F5B942] tracking-tight drop-shadow-[0_0_25px_rgba(245,185,66,0.4)]">
                    {exchangeRate.sellRate} EGP
                  </p>
                  <p className="text-xs text-gray-400 mt-2 font-medium">{t("perUsdt")}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 tracking-wide">
            {t("ourStats")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: t("completedOrder"), value: stats.completedOrders },
              { label: t("user"), value: stats.totalUsers },
              { label: t("successRate"), value: `${stats.successRate}%` },
              { label: t("rating"), value: `${stats.avgRating} ⭐` },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center">
                  <CardContent className="py-8">
                    <p className="text-gray-400 text-sm mb-2 font-medium">{stat.label}</p>
                    <p className="text-3xl font-extrabold text-[#F5B942] drop-shadow-[0_0_15px_rgba(245,185,66,0.3)]">
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
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 tracking-wide">
            {t("features")}
          </h2>
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
                  <Card className="group h-full">
                    <CardContent className="text-center py-8">
                      <div className="w-16 h-16 rounded-2xl liquid-pill flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:border-[#F5B942]/60 transition-all duration-300">
                        <Icon className="w-8 h-8 text-[#F5B942] drop-shadow-[0_0_10px_rgba(245,185,66,0.5)]" />
                      </div>
                      <h3 className="text-lg font-bold mb-2.5 text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed font-light">
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
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16 tracking-wide">
            {t("howItWorks")}
          </h2>

          {/* Buy */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-[#F5B942] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5B942]" />
              <span>{t("buyUsdt")}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.buy.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="h-full">
                    <CardContent className="py-8 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#F5B942] to-[#E6A430] text-[#0A0A0A] font-extrabold flex items-center justify-center mx-auto mb-4 text-xl shadow-[0_0_20px_rgba(245,185,66,0.4)]">
                        {step.number}
                      </div>
                      <h4 className="font-bold mb-2 text-white">{step.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed font-light">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Sell */}
          <div>
            <h3 className="text-2xl font-bold text-[#F5B942] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5B942]" />
              <span>{t("sellUsdt")}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.sell.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="h-full">
                    <CardContent className="py-8 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#F5B942] to-[#E6A430] text-[#0A0A0A] font-extrabold flex items-center justify-center mx-auto mb-4 text-xl shadow-[0_0_20px_rgba(245,185,66,0.4)]">
                        {step.number}
                      </div>
                      <h4 className="font-bold mb-2 text-white">{step.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed font-light">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Track Order Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-2xl mx-auto relative z-10">
          <Card className="liquid-glass-gold">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-2xl font-bold mb-6 text-center text-white">{t("trackOrderTitle")}</h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder={t("enterOrderId")}
                  id="trackOrderId"
                />
                <PrimaryButton
                  className="w-full py-3.5"
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
                  {t("search")}
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
