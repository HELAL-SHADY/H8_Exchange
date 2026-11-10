"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Globe, LayoutDashboard, UserCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { NotificationBell } from "@/components/notification-bell";

export function Navbar() {
  const { data: session } = useSession();
  const { t, locale, setLocale } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  const userRole = (session?.user as any)?.role;
  const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(userRole);

  return (
    <nav className="bg-[#08080C]/80 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="liquid-sheen" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Centered HELAL Telegram Link */}
          <a
            href="https://t.me/HELAL_SHADY"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute left-1/2 -translate-x-1/2 font-extrabold text-lg tracking-[0.25em] select-none transition-all duration-300"
            style={{
              background: "linear-gradient(90deg, #F5B942, #fff8e1, #F5B942)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 8px rgba(245,185,66,0.6))",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "drop-shadow(0 0 16px rgba(245,185,66,0.95))")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(245,185,66,0.6))")}
          >
            HELAL
          </a>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent group-hover:drop-shadow-[0_0_15px_rgba(245,185,66,0.6)] transition-all">
              H8
            </div>
            <span className="text-white font-semibold hidden sm:inline tracking-wide">{t("exchange")}</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/buy"
              className="text-gray-300 hover:text-[#F5B942] transition-colors font-medium text-sm"
            >
              {t("buy")}
            </Link>
            <Link
              href="/sell"
              className="text-gray-300 hover:text-[#F5B942] transition-colors font-medium text-sm"
            >
              {t("sell")}
            </Link>
            <Link
              href="/track"
              className="text-gray-300 hover:text-[#F5B942] transition-colors font-medium text-sm"
            >
              {t("track")}
            </Link>
            <Link
              href="/reviews"
              className="text-gray-300 hover:text-[#F5B942] transition-colors font-medium text-sm"
            >
              {t("reviews")}
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />

                <Link
                  href="/dashboard"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{locale === "ar" ? "لوحة المستخدم" : "Dashboard"}</span>
                </Link>

                {isStaff && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-gradient-to-r from-[#F5B942] to-[#E6A430] text-[#0A0A0A] rounded-xl font-bold shadow-[0_0_20px_rgba(245,185,66,0.35)] hover:shadow-[0_0_30px_rgba(245,185,66,0.6)] transition-all text-xs flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{locale === "ar" ? "لوحة الإدارة" : "Admin"}</span>
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-colors text-xs font-medium border border-red-500/30"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-gradient-to-r from-[#F5B942] to-[#E6A430] text-[#0A0A0A] rounded-xl font-bold shadow-[0_0_20px_rgba(245,185,66,0.35)] hover:shadow-[0_0_30px_rgba(245,185,66,0.6)] transition-all text-sm"
              >
                {t("login")}
              </Link>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 liquid-pill text-gray-300 hover:text-white rounded-xl flex items-center gap-1.5 text-xs font-semibold"
              title={locale === "ar" ? "English" : "العربية"}
            >
              <Globe size={15} />
              <span>{locale === "ar" ? "EN" : "AR"}</span>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-2">
            {session?.user && <NotificationBell />}

            <button
              onClick={toggleLanguage}
              className="p-2 liquid-pill text-gray-300 hover:text-white rounded-xl flex items-center gap-1 text-xs"
            >
              <Globe size={14} />
              <span>{locale === "ar" ? "EN" : "AR"}</span>
            </button>

          </div>
        </div>

        <div className="md:hidden border-t border-white/10 py-2">
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: t("buy"), href: "/buy" },
              { label: t("sell"), href: "/sell" },
              { label: t("track"), href: "/track" },
              { label: t("reviews"), href: "/reviews" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-center px-1 py-2 text-xs font-semibold text-gray-300 hover:text-[#F5B942] hover:bg-white/[0.06] rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            {session?.user ? (
              <>
                <Link href="/dashboard" className="px-3 py-1.5 text-xs text-amber-400 font-bold rounded-lg hover:bg-amber-500/10">
                  {t("dashboard")}
                </Link>
                {isStaff && (
                  <Link href="/admin" className="px-3 py-1.5 text-xs text-amber-300 font-bold rounded-lg hover:bg-amber-500/10">
                    {locale === "ar" ? "الإدارة" : "Admin"}
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="px-3 py-1.5 text-xs text-red-400 rounded-lg hover:bg-red-500/10"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="px-3 py-1.5 text-xs font-bold text-[#0A0A0A] bg-gradient-to-r from-[#F5B942] to-[#E6A430] rounded-lg">
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
