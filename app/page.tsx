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
import { useTranslation } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useTranslation();
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
                {t("heroTitle")}
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8">
              {t("heroSubtitle")}
            </p>
            <div className="flex gap-6 justify-center flex-wrap mt-4">
              {/* Buy Button */}
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/buy">
                  <div className="relative group cursor-pointer rounded-2xl overflow-hidden"
                    style={{ minWidth: 180 }}>
                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F5B942] to-[#e6a120] opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: "0 0 32px 6px rgba(245,185,66,0.45)" }} />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1 px-10 py-5">
                      <div className="flex items-center gap-2">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                          <path d="M12 4v16M4 12l8-8 8 8" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[#0A0A0A] font-extrabold text-xl tracking-wide">{t("buyUsdt")}</span>
                      </div>
                      <span className="text-[#0A0A0A]/70 text-sm font-medium">
                        {exchangeRate.buyRate} {t("egpPerUsdt")}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Sell Button */}
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/sell">
                  <div className="relative group cursor-pointer rounded-2xl overflow-hidden"
                    style={{ minWidth: 180 }}>
                    {/* Border glow effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-[#F5B942]/60 group-hover:border-[#F5B942] transition-colors duration-300" />
                    <div className="absolute inset-0 bg-[#1A1A1A] group-hover:bg-[#222]/90 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: "0 0 28px 4px rgba(245,185,66,0.25)" }} />
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1 px-10 py-5">
                      <div className="flex items-center gap-2">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                          <path d="M12 20V4M4 12l8 8 8-8" stroke="#F5B942" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[#F5B942] font-extrabold text-xl tracking-wide">{t("sellUsdt")}</span>
                      </div>
                      <span className="text-gray-400 text-sm font-medium">
                        {exchangeRate.sellRate} {t("egpPerUsdt")}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
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
                  <p className="text-gray-400 mb-2">{t("buyRate")}</p>
                  <p className="text-4xl font-bold text-[#F5B942]">
                    {exchangeRate.buyRate} EGP
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{t("perUsdt")}</p>
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
                  <p className="text-gray-400 mb-2">{t("sellRate")}</p>
                  <p className="text-4xl font-bold text-[#F5B942]">
                    {exchangeRate.sellRate} EGP
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{t("perUsdt")}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-[#1A1A1A]/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{t("ourStats")}</h2>
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
          <h2 className="text-4xl font-bold text-center mb-12">{t("features")}</h2>
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
          <h2 className="text-4xl font-bold text-center mb-12">{t("howItWorks")}</h2>

          {/* Buy */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-[#F5B942] mb-8">{t("buyUsdt")}</h3>
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
            <h3 className="text-2xl font-bold text-[#F5B942] mb-8">{t("sellUsdt")}</h3>
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
              <h2 className="text-2xl font-bold mb-6 text-center">{t("trackOrderTitle")}</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t("enterOrderId")}
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
