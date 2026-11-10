"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Settings,
  Shield,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Coins,
  ChevronRight,
  Globe,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { locale, setLocale } = useTranslation();
  const text = (ar: string, en: string) => locale === "ar" ? ar : en;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin");
    } else if (
      status === "authenticated" &&
      !["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes((session?.user as any)?.role)
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const role = (session.user as any)?.role || "USER";

  const menuItems = [
    { label: text("لوحة القيادة والمؤشرات", "Dashboard"), href: "/admin", icon: BarChart3 },
    { label: text("كل الطلبات", "All orders"), href: "/admin/orders", icon: FileText },
    { label: text("طلبات الفحص المصرفي", "Bank verification"), href: "/admin/orders?status=UNDER_VERIFICATION", icon: Clock },
    { label: text("المستخدمين والمحافظ", "Users and wallets"), href: "/admin/users", icon: Users },
    { label: text("محرك أسعار الصرف", "Exchange rates"), href: "/admin/settings?tab=rates", icon: Coins, adminOnly: true },
    { label: text("تذاكر الدعم الفني", "Support tickets"), href: "/admin/support", icon: LifeBuoy },
    { label: text("سجل العمليات والتدقيق", "Audit log"), href: "/admin/audit-logs", icon: Shield },
    { label: text("إعدادات وبوابات الدفع", "Payment settings"), href: "/admin/settings", icon: Settings, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col lg:flex-row relative z-10 font-sans">
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#0E0E12] border-b border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/5 text-amber-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-amber-400 font-mono text-sm tracking-wider">
            H8 ADMIN
          </span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
          {role}
        </span>
        <button
          type="button"
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          className="p-2 rounded-lg text-gray-300 hover:bg-white/10"
          aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
        >
          <Globe className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 z-50 w-72 h-screen bg-[#0E0E12] border-l border-white/5 p-6 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-black font-black text-sm">
                H8
              </div>
              <span className="font-extrabold text-white text-base tracking-wider">
                {text("لوحة الإدارة", "Admin panel")}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="p-2 rounded-lg text-gray-300 hover:bg-white/10"
              aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-xs font-bold text-amber-400 truncate">
              {session?.user?.name}
            </div>
            <div className="text-[11px] text-gray-400 truncate">{session?.user?.email}</div>
            <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded bg-black/50 text-amber-300 font-mono font-bold">
              {role}
            </span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              if (item.adminOnly && role === "SUPPORT_AGENT") return null;
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5"
          >
            <span>{text("العودة للموقع الرئيسي", "Back to site")}</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>{text("تسجيل الخروج", "Sign out")}</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
