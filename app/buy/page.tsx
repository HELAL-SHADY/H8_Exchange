"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton } from "@/components/ui/button";
import { Input, FormGroup, Label } from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

type BuyPaymentMethod = "VODAFONE_CASH" | "INSTAPAY";
type BuyReceiveMethod = "BINANCE_PAY" | "BYBIT_PAY";

export default function BuyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(51.0);
  const [paymentMethod, setPaymentMethod] = useState<BuyPaymentMethod>("VODAFONE_CASH");
  const [receiveMethod, setReceiveMethod] = useState<BuyReceiveMethod>("BINANCE_PAY");
  const [orderData, setOrderData] = useState({
    binanceUid: "",
    walletNumber: "",
    amountEgp: "",
  });

  const [amountUsdt, setAmountUsdt] = useState(0);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login");
    }

    fetch("/api/admin/exchange-rates")
      .then((res) => res.json())
      .then((data) => setExchangeRate(data.buyRate))
      .catch(console.error);
  }, [session, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setOrderData({ ...orderData, amountEgp: e.target.value });
    setAmountUsdt(Math.round((amount / exchangeRate) * 100) / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BUY",
          amount: parseFloat(orderData.amountEgp),
          binanceUid: orderData.binanceUid,
          walletNumber: orderData.walletNumber,
          paymentMethod,
          receiveMethod,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      alert(locale === "ar" ? "تم إنشاء الطلب بنجاح! يرجى إتمام عملية الدفع." : "Order created successfully! Please complete the payment.");
      router.push(`/track?orderId=${data.id}`);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("buyUsdtTitle")} <span className="text-[#F5B942]">USDT</span>
            </h1>
            <p className="text-gray-400">{t("startBuyNow")}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Payment Method Switcher */}
                    <FormGroup>
                      <Label>{t("paymentMethod")}</Label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("VODAFONE_CASH")}
                          className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                            paymentMethod === "VODAFONE_CASH"
                              ? "bg-[#F5B942] text-[#0A0A0A] border-[#F5B942]"
                              : "bg-[#2D2D2D] text-gray-300 border-[#3D3D3D] hover:border-[#F5B942]"
                          }`}
                        >
                          Vodafone Cash
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("INSTAPAY")}
                          className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                            paymentMethod === "INSTAPAY"
                              ? "bg-[#F5B942] text-[#0A0A0A] border-[#F5B942]"
                              : "bg-[#2D2D2D] text-gray-300 border-[#3D3D3D] hover:border-[#F5B942]"
                          }`}
                        >
                          InstaPay
                        </button>
                      </div>
                    </FormGroup>

                    {/* Receive Method Switcher */}
                    <FormGroup>
                      <Label>{t("receiveMethod")}</Label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setReceiveMethod("BINANCE_PAY")}
                          className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                            receiveMethod === "BINANCE_PAY"
                              ? "bg-[#F5B942] text-[#0A0A0A] border-[#F5B942]"
                              : "bg-[#2D2D2D] text-gray-300 border-[#3D3D3D] hover:border-[#F5B942]"
                          }`}
                        >
                          Binance Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setReceiveMethod("BYBIT_PAY")}
                          className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                            receiveMethod === "BYBIT_PAY"
                              ? "bg-[#F5B942] text-[#0A0A0A] border-[#F5B942]"
                              : "bg-[#2D2D2D] text-gray-300 border-[#3D3D3D] hover:border-[#F5B942]"
                          }`}
                        >
                          Bybit Pay
                        </button>
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="binanceUid">
                        {receiveMethod === "BINANCE_PAY"
                          ? t("binanceUidLabel")
                          : t("bybitUidLabel")}
                      </Label>
                      <Input
                        id="binanceUid"
                        placeholder="123456789"
                        value={orderData.binanceUid}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            binanceUid: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="walletNumber">
                        {paymentMethod === "VODAFONE_CASH"
                          ? t("walletNumberLabel")
                          : t("instapayNumberLabel")}
                      </Label>
                      <Input
                        id="walletNumber"
                        placeholder="201000000000"
                        value={orderData.walletNumber}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            walletNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="amountEgp">{t("amountEgpLabel")}</Label>
                      <Input
                        id="amountEgp"
                        type="number"
                        placeholder="5100"
                        value={orderData.amountEgp}
                        onChange={handleAmountChange}
                        required
                      />
                      <p className="text-sm text-[#F5B942] mt-2">
                        {t("willReceive")}: {amountUsdt} USDT
                      </p>
                    </FormGroup>

                    <PrimaryButton
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? t("processing") : t("createOrderBtn")}
                    </PrimaryButton>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Price Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">{t("currentPrice")}</h3>
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-2">{t("buyRate")}</p>
                    <p className="text-3xl font-bold text-[#F5B942]">
                      {exchangeRate}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{t("egpPerUsdt")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">{t("importantNotes")}</h3>
                  <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
                    {(t("buyNotes") as string[]).map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}