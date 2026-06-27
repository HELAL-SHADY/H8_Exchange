"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AuditLog {
  id: string;
  user?: { name: string; email: string };
  actionType: string;
  actionDescription: string;
  ipAddress: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/audit-logs?page=${page}&limit=20`);
      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const actionColors: Record<string, string> = {
    USER_REGISTRATION: "text-blue-400",
    USER_LOGIN: "text-green-400",
    CREATE_BUY_ORDER: "text-yellow-400",
    CREATE_SELL_ORDER: "text-yellow-400",
    APPROVE_ORDER: "text-emerald-400",
    REJECT_ORDER: "text-red-400",
    MARK_COMPLETED: "text-purple-400",
    EDIT_EXCHANGE_RATES: "text-orange-400",
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold">سجل العمليات</h1>
        <p className="text-gray-400 mt-2">تتبع جميع العمليات والأنشطة</p>
      </motion.div>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center text-gray-400">جاري التحميل...</div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">لا توجد سجلات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            actionColors[log.actionType] || "text-gray-400"
                          }`}
                        >
                          {log.actionType}
                        </span>
                        {log.user && (
                          <span className="text-sm text-gray-500">
                            {log.user.name} ({log.user.email})
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300">{log.actionDescription}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>{log.ipAddress}</span>
                        <span>
                          {new Date(log.createdAt).toLocaleString("ar-EG")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#F5B942] hover:text-[#0A0A0A] rounded-lg transition-colors disabled:opacity-50"
          >
            السابق
          </button>
          <span className="px-4 py-2 text-gray-400">
            صفحة {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#F5B942] hover:text-[#0A0A0A] rounded-lg transition-colors disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
