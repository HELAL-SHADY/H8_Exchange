"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { NotificationBell } from "@/components/notification-bell";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, locale, setLocale } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  return (
    <nav className="bg-[#08080C]/70 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
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
              textShadow: "none",
              filter: "drop-shadow(0 0 8px rgba(245,185,66,0.6))",
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = "drop-shadow(0 0 16px rgba(245,185,66,0.95))")}
            onMouseLeave={e => (e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(245,185,66,0.6))")}
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
                  href="/my-orders"
                  className="px-3 py-1.5 rounded-xl liquid-pill text-gray-300 hover:text-white text-sm"
                >
                  {t("myOrders")}
                </Link>
                {((session.user as any).role === "ADMIN" ||
                (session.user as any).role === "SUPER_ADMIN") ? (
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-gradient-to-r from-[#F5B942] to-[#E6A430] text-[#0A0A0A] rounded-xl font-bold shadow-[0_0_20px_rgba(245,185,66,0.35)] hover:shadow-[0_0_30px_rgba(245,185,66,0.6)] transition-all text-sm"
                  >
                    {t("dashboard")}
                  </Link>
                ) : null}
                <button
                  onClick={() => signOut()}
                  className="px-3.5 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-colors text-sm font-medium border border-red-500/30"
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

          {/* Mobile Right Controls (Menu & Language & Notifications) */}
          <div className="md:hidden flex items-center gap-2">
            {session?.user && <NotificationBell />}

            {/* Language Switcher for Mobile */}
            <button
              onClick={toggleLanguage}
              className="p-2 liquid-pill text-gray-300 hover:text-white rounded-xl flex items-center gap-1 text-xs"
            >
              <Globe size={14} />
              <span>{locale === "ar" ? "EN" : "AR"}</span>
            </button>

            <button
              className="text-[#F5B942] p-1.5 liquid-pill rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2 bg-[#0C0C12]/95 backdrop-blur-2xl border-b border-white/10 rounded-b-2xl shadow-2xl px-2">
            <Link
              href="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-gray-300 hover:text-[#F5B942] hover:bg-white/[0.06] rounded-xl transition-all"
            >
              {t("buy")}
            </Link>
            <Link
              href="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-gray-300 hover:text-[#F5B942] hover:bg-white/[0.06] rounded-xl transition-all"
            >
              {t("sell")}
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-gray-300 hover:text-[#F5B942] hover:bg-white/[0.06] rounded-xl transition-all"
            >
              {t("track")}
            </Link>
            <Link
              href="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-gray-300 hover:text-[#F5B942] hover:bg-white/[0.06] rounded-xl transition-all"
            >
              {t("reviews")}
            </Link>
            {session?.user ? (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <Link
                  href="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-gray-300 hover:text-[#F5B942] hover:bg-white/[0.06] rounded-xl transition-all"
                >
                  {t("myOrders")}
                </Link>
                {((session.user as any).role === "ADMIN" ||
                (session.user as any).role === "SUPER_ADMIN") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 bg-gradient-to-r from-[#F5B942] to-[#E6A430] text-[#0A0A0A] rounded-xl font-bold text-center shadow-lg transition-all"
                  >
                    {t("dashboard")}
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full px-4 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-colors font-medium border border-red-500/30"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 bg-gradient-to-r from-[#F5B942] to-[#E6A430] text-[#0A0A0A] rounded-xl font-bold text-center shadow-lg transition-all"
              >
                {t("login")}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
