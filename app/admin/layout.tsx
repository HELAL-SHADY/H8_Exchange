"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Settings,
  BookOpen,
  FileText,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

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
      session?.user &&
      !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || !session?.user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-white">جاري التحميل...</p>
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
    <div className="min-h-screen bg-[#0A0A0A] flex">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
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
        bg-[#1A1A1A]
        border-l
        border-[#2D2D2D]
        flex
        flex-col
        transition-transform
        duration-200
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="p-6 border-b border-[#2D2D2D]">
          <h1 className="text-2xl font-bold text-[#F5B942]">
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
                  hover:bg-[#2D2D2D]
                  hover:text-[#F5B942]
                  transition
                  "
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2D2D2D]">
          <button
            onClick={() => signOut()}
            className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-red-600
            py-3
            text-white
            hover:bg-red-700
            transition
            "
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-0">

        {/* Header */}
        <header
          className="
          sticky
          top-0
          z-30
          bg-[#1A1A1A]
          border-b
          border-[#2D2D2D]
          px-4
          py-4
          flex
          items-center
          justify-between
          "
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#F5B942] lg:hidden"
          >
            {sidebarOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          <div className="text-right">
            <p className="text-gray-400 text-sm">
              مرحباً
            </p>
            <p className="font-bold">
              {session.user.name}
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
