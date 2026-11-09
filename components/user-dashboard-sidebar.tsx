"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  User,
  Shield,
  LifeBuoy,
  Bell,
  LogOut,
  ChevronRight,
  Wallet,
} from "lucide-react";

export function UserDashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { label: "نظرة عامة", href: "/dashboard", icon: LayoutDashboard },
    { label: "شراء USDT", href: "/buy", icon: ArrowDownLeft },
    { label: "بيع USDT", href: "/sell", icon: ArrowUpRight },
    { label: "طلباتي", href: "/dashboard/orders", icon: Receipt },
    { label: "المحافظ المحفوظة", href: "/dashboard/wallets", icon: Wallet },
    { label: "الإشعارات", href: "/dashboard/notifications", icon: Bell },
    { label: "الملف الشخصي", href: "/dashboard/profile", icon: User },
    { label: "الأمان و 2FA", href: "/dashboard/security", icon: Shield },
    { label: "الدعم الفني", href: "/dashboard/support", icon: LifeBuoy },
  ];

  return (
    <aside className="w-full lg:w-72 bg-[#0E0E12]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-black to-black border border-amber-500/20">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-black font-extrabold flex items-center justify-center text-lg shadow-lg shadow-amber-500/20">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-white font-bold text-sm truncate">
                {session?.user?.name || "المستخدم"}
              </h3>
              <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                  حساب نشط ومحمي
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/5 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-gray-400"}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-amber-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-white/5 mt-6">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
