"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, locale, setLocale } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  return (
    <nav className="bg-[#0A0A0A] border-b border-[#2D2D2D] sticky top-0 z-50">
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
              filter: "drop-shadow(0 0 6px rgba(245,185,66,0.5))",
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = "drop-shadow(0 0 14px rgba(245,185,66,0.9))")}
            onMouseLeave={e => (e.currentTarget.style.filter = "drop-shadow(0 0 6px rgba(245,185,66,0.5))")}
          >
            HELAL
          </a>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent">
              H8
            </div>
            <span className="text-white font-semibold hidden sm:inline">{t("exchange")}</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/buy"
              className="text-gray-400 hover:text-[#F5B942] transition-colors"
            >
              {t("buy")}
            </Link>
            <Link
              href="/sell"
              className="text-gray-400 hover:text-[#F5B942] transition-colors"
            >
              {t("sell")}
            </Link>
            <Link
              href="/track"
              className="text-gray-400 hover:text-[#F5B942] transition-colors"
            >
              {t("track")}
            </Link>
            <Link
              href="/reviews"
              className="text-gray-400 hover:text-[#F5B942] transition-colors"
            >
              {t("reviews")}
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/my-orders"
                  className="text-gray-400 hover:text-[#F5B942] transition-colors"
                >
                  {t("myOrders")}
                </Link>
                {(session.user as any).role === "ADMIN" ||
                (session.user as any).role === "SUPER_ADMIN" ? (
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all"
                  >
                    {t("dashboard")}
                  </Link>
                ) : null}
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all"
              >
                {t("login")}
              </Link>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 bg-[#1A1A1A] hover:bg-[#2D2D2D] text-gray-300 hover:text-white rounded-lg transition-colors border border-[#2D2D2D] flex items-center gap-1.5 text-sm"
              title={locale === "ar" ? "English" : "العربية"}
            >
              <Globe size={16} />
              <span>{locale === "ar" ? "EN" : "AR"}</span>
            </button>
          </div>

          {/* Mobile Right Controls (Menu & Language) */}
          <div className="md:hidden flex items-center gap-3">
            {/* Language Switcher for Mobile */}
            <button
              onClick={toggleLanguage}
              className="p-2 bg-[#1A1A1A] hover:bg-[#2D2D2D] text-gray-300 hover:text-white rounded-lg transition-colors border border-[#2D2D2D] flex items-center gap-1 text-xs"
            >
              <Globe size={14} />
              <span>{locale === "ar" ? "EN" : "AR"}</span>
            </button>

            <button
              className="text-[#F5B942]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
            >
              {t("buy")}
            </Link>
            <Link
              href="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
            >
              {t("sell")}
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
            >
              {t("track")}
            </Link>
            <Link
              href="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
            >
              {t("reviews")}
            </Link>
            {session?.user ? (
              <div className="pt-2 border-t border-[#2D2D2D] space-y-2">
                <Link
                  href="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
                >
                  {t("myOrders")}
                </Link>
                {((session.user as any).role === "ADMIN" ||
                (session.user as any).role === "SUPER_ADMIN") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all"
                  >
                    {t("dashboard")}
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all"
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