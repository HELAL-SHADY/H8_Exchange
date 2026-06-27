"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton, DangerButton, SecondaryButton } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Select, Input, FormGroup, Label } from "@/components/ui/form";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Order {
  id: string;
  user: { name: string; email: string; phone: string };
  type: "BUY" | "SELL";
  amount: number;
  status: string;
  fullName: string;
  phone: string;
  binanceUid: string;
  walletNumber: string;
  createdAt: string;
  adminNote?: string;
  proofImageUrl?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [type, setType] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [status, type]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (status) query.append("status", status);
      if (type) query.append("type", type);

      const response = await fetch(`/api/admin/orders?${query}`);
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (
  orderId: string,
  action: "APPROVE" | "REJECT" | "COMPLETE"
) => {
  setActionLoading(orderId);

  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        adminNote: "",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("تم تحديث الطلب بنجاح");
      fetchOrders();
    } else {
      alert(data.error || "فشل تحديث الطلب");
    }
  } catch (error) {
    console.error(error);
    alert("حدث خطأ");
  } finally {
    setActionLoading(null);
  }
};
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold">إدارة الطلبات</h1>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormGroup>
                <Label htmlFor="status">الحالة</Label>
                <Select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">الكل</option>
                  <option value="PENDING_REVIEW">قيد المراجعة</option>
                  <option value="UNDER_VERIFICATION">التحقق جاري</option>
                  <option value="APPROVED">معتمد</option>
                  <option value="REJECTED">مرفوض</option>
                  <option value="COMPLETED">مكتمل</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="type">النوع</Label>
                <Select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">الكل</option>
                  <option value="BUY">شراء</option>
                  <option value="SELL">بيع</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>&nbsp;</Label>
                <SecondaryButton
                  onClick={fetchOrders}
                  className="w-full"
                >
                  تحديث
                </SecondaryButton>
              </FormGroup>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center text-gray-400">جاري التحميل...</div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">لا توجد طلبات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:border-[#F5B942] transition-colors"
                onClick={() =>
                  setExpandedOrder(
                    expandedOrder === order.id ? null : order.id
                  )
                }
              >
                <CardContent className="py-4">
                  {/* Summary */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-semibold">{order.id}</span>
                        <span className="px-3 py-1 rounded-full text-sm bg-[#2D2D2D]">
                          {order.type === "BUY" ? "🟢 شراء" : "🔴 بيع"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === "PENDING_REVIEW"
                              ? "bg-yellow-600/30 text-yellow-300"
                              : order.status === "APPROVED"
                              ? "bg-green-600/30 text-green-300"
                              : order.status === "REJECTED"
                              ? "bg-red-600/30 text-red-300"
                              : "bg-blue-600/30 text-blue-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {order.user.name} • {order.amount}{" "}
                        {order.type === "BUY" ? "EGP" : "USDT"}
                      </p>
                    </div>
                    <div>
                      {expandedOrder === order.id ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  {expandedOrder === order.id && (
                    <div className="mt-6 pt-6 border-t border-[#2D2D2D] space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 text-sm">الاسم</p>
                          <p className="font-semibold">{order.fullName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">الهاتف</p>
                          <p className="font-semibold">{order.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Binance UID</p>
                          <p className="font-semibold">{order.binanceUid}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">المحفظة</p>
                          <p className="font-semibold">{order.walletNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">البريد الإلكتروني</p>
                          <p className="font-semibold">{order.user.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">التاريخ</p>
                          <p className="font-semibold">
                            {new Date(order.createdAt).toLocaleString("ar-EG")}
                          </p>
                        </div>
                      </div>

                      {order.proofImageUrl && (
                        <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#2D2D2D]" onClick={(e) => e.stopPropagation()}>
                          <p className="text-[#F5B942] font-semibold mb-2">📷 إثبات التحويل (Screenshot):</p>
                          <div className="relative max-w-md overflow-hidden rounded border border-[#3D3D3D] mb-2 bg-[#0F0F0F]">
                            <img
                              src={order.proofImageUrl}
                              alt="إثبات التحويل"
                              className="w-full object-contain max-h-96 hover:scale-[1.02] transition-transform cursor-pointer"
                              onClick={() => window.open(order.proofImageUrl, "_blank")}
                            />
                          </div>
                          <a
                            href={order.proofImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm text-[#F5B942] hover:underline"
                          >
                            فتح الصورة في علامة تبويب جديدة ↗
                          </a>
                        </div>
                      )}

                      {/* Actions */}
                      {order.status === "PENDING_REVIEW" && (
                        <div className="flex gap-3 pt-4 border-t border-[#2D2D2D]">
                          <PrimaryButton
                            onClick={() =>
                              handleOrderAction(order.id, "APPROVE")
                            }
                            disabled={actionLoading === order.id}
                            className="flex-1"
                          >
                            قبول
                          </PrimaryButton>
                          <DangerButton
                            onClick={() =>
                              handleOrderAction(order.id, "REJECT")
                            }
                            disabled={actionLoading === order.id}
                            className="flex-1"
                          >
                            رفض
                          </DangerButton>
                        </div>
                      )}

                      {order.status === "APPROVED" && (
                        <PrimaryButton
                          onClick={() =>
                            handleOrderAction(order.id, "COMPLETE")
                          }
                          disabled={actionLoading === order.id}
                          className="w-full mt-4"
                        >
                          تحديد كمكتمل
                        </PrimaryButton>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
