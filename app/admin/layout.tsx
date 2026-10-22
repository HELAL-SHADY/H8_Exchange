"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (
      status === "authenticated" &&
      !["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role)
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  const menuItems = [
    { label: "لوحة التحكم", href: "/admin", icon: BarChart3 },
    { label: "الطلبات", href: "/admin/orders", icon: FileText },
    { label: "سجل العمليات", href: "/admin/audit-logs", icon: BookOpen },
    { label: "الإعدادات", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex relative z-10">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed
        lg:relative
        top-0
        bottom-0
        right-0
        z-50
        w-[260px]
        h-screen
        bg-[#0B0B10]/80
        backdrop-blur-2xl
        border-l
        border-white/10
        shadow-2xl
        flex
        flex-col
        transition-transform
        duration-200
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="liquid-sheen" />
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent">
            H8 Admin
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setSidebarOpen(false)}
                  className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  text-gray-300
                  hover:bg-white/[0.06]
                  hover:text-[#F5B942]
                  hover:border-white/10
                  border border-transparent
                  transition-all
                  "
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut()}
            className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-red-600/80
            hover:bg-red-600
            py-3
            text-white
            font-medium
            border border-red-500/30
            transition
            "
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">

        {/* Header */}
        <header
          className="
          sticky
          top-0
          z-30
          bg-[#0B0B10]/70
          backdrop-blur-2xl
          border-b
          border-white/10
          px-6
          py-4
          flex
          items-center
          justify-between
          shadow-lg
          "
        >
          <div className="liquid-sheen" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#F5B942] lg:hidden p-1.5 liquid-pill rounded-xl"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="text-right">
            <p className="text-gray-400 text-xs">
              مرحباً
            </p>
            <p className="font-bold text-white text-sm">
              {session?.user?.name || "Admin"}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
