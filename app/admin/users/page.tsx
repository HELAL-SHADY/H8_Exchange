"use client";

import { useEffect, useState } from "react";
import { Users, Search, Shield, Ban, CheckCircle2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (user: any) => {
    if (!confirm(`هل أنت متأكد من ${user.isBanned ? "إلغاء حظر" : "حظر"} هذا المستخدم؟`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isBanned: !user.isBanned }),
      });
      if (!res.ok) throw new Error("فشل التحديث");
      fetchUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleVerify = async (user: any) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isVerified: !user.isVerified }),
      });
      if (!res.ok) throw new Error("فشل التحديث");
      fetchUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة حسابات العملاء</h1>
        <p className="text-xs text-gray-400 mt-1">
          عرض بيانات المستخدمين، حالة التوثيق، عدد الطلبات المنفذة، وإمكانية الحظر الأمني.
        </p>
      </div>

      <div className="flex gap-2 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، البريد أو الهاتف..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#0E0E12] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={fetchUsers}
          className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
        >
          بحث
        </button>
      </div>

      <div className="rounded-3xl bg-[#0E0E12] border border-white/5 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#14141A] text-gray-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">الاسم</th>
                  <th className="py-3 px-4">البريد الإلكتروني</th>
                  <th className="py-3 px-4">الهاتف</th>
                  <th className="py-3 px-4">الرتبة</th>
                  <th className="py-3 px-4">الطلبات</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">{u.email}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">{u.phone || "-"}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-amber-400 font-mono text-[10px] font-bold">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white">
                      {u._count?.orders || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isBanned ? (
                        <span className="text-red-400 font-bold text-[10px]">محظور</span>
                      ) : (
                        <span className="text-emerald-400 font-bold text-[10px]">نشط</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleToggleVerify(u)}
                        className="px-2.5 py-1 rounded bg-white/5 text-gray-300 hover:text-white text-[10px]"
                      >
                        {u.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}
                      </button>
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          u.isBanned
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {u.isBanned ? "إلغاء الحظر" : "حظر"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
