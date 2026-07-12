"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface Order {
  id: string;
  type: "BUY" | "SELL";
  amount: number;
  status: "PENDING_REVIEW" | "UNDER_VERIFICATION" | "APPROVED" | "REJECTED" | "COMPLETED";
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
}

export default function MyOrdersPage() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const StatusDisplay: Record<
    string,
    { label: string; icon: any; color: string; bg: string }
  > = {
    PENDING_REVIEW: {
      label: t("status_PENDING_REVIEW"),
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-600/20",
    },
    UNDER_VERIFICATION: {
      label: t("status_UNDER_VERIFICATION"),
      icon: AlertCircle,
      color: "text-blue-400",
      bg: "bg-blue-600/20",
    },
    APPROVED: {
      label: t("status_APPROVED"),
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-600/20",
    },
    REJECTED: {
      label: t("status_REJECTED"),
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-600/20",
    },
    COMPLETED: {
      label: t("status_COMPLETED"),
      icon: CheckCircle,
      color: "text-[#F5B942]",
      bg: "bg-[#F5B942]/20",
    },
  };

  const TABS = [
    { key: "ALL", label: t("tabAll") },
    { key: "ONGOING", label: t("tabOngoing") },
    { key: "COMPLETED", label: t("tabCompleted") },
    { key: "REJECTED", label: t("tabRejected") },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/my-orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "ONGOING")
      return ["PENDING_REVIEW", "UNDER_VERIFICATION", "APPROVED"].includes(
        order.status
      );
    if (activeTab === "COMPLETED") return order.status === "COMPLETED";
    if (activeTab === "REJECTED") return order.status === "REJECTED";
    return true;
  });

  if (status === "loading" || !session?.user) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-gray-400">{t("loadingOrders")}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {t("orderHistoryTitle1")} <span className="text-[#F5B942]">{t("orderHistoryTitle2")}</span>
            </h1>
            <p className="text-gray-400">{t("orderHistorySubtitle")}</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#F5B942] text-[#0A0A0A]"
                    : "bg-[#1A1A1A] text-gray-400 hover:text-white border border-[#2D2D2D]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center text-gray-400 py-12">
              {t("loadingOrders")}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <p className="text-gray-500">{t("noOrdersInTab")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, index) => {
                const statusInfo =
                  StatusDisplay[order.status] || StatusDisplay.PENDING_REVIEW;
                const StatusIcon = statusInfo.icon;
                const isBuy = order.type === "BUY";

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <a href={`/track?orderId=${order.id}`}>
                      <Card className="hover:border-[#F5B942] transition-colors cursor-pointer">
                        <CardContent>
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <span
                              className={`font-bold text-lg ${
                                isBuy ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {isBuy ? t("buy") : t("sell")}{" "}
                              <span className="text-white">USDT</span>
                            </span>
                            <span
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}
                            >
                              <StatusIcon size={14} />
                              {statusInfo.label}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t("amount")}</span>
                              <span className="font-bold text-white">
                                {order.amount} {isBuy ? "EGP" : "USDT"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">{t("orderId")}</span>
                              <span className="flex items-center gap-2">
                                <span className="font-mono text-gray-300 text-xs">
                                  {order.id}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCopy(order.id);
                                  }}
                                  className="text-gray-500 hover:text-[#F5B942] transition-colors"
                                >
                                  {copiedId === order.id ? (
                                    <Check size={14} />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#2D2D2D]">
                            <span className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleString(
                                "ar-EG"
                              )}
                            </span>
                            <span className="text-xs text-[#F5B942]">
                              {t("viewDetails")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}