"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <span className="text-white font-semibold hidden sm:inline">Exchange</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/buy"
              className="text-gray-400 hover:text-[#F5B942] transition-colors"
            >
              شراء
            </Link>
            <Link
              href="/sell"
              className="text-gray-400 hover:text-[#F5B942] transition-colors"
            >
              بيع
            </Link>
            <Link
              href="/track"
              className="text-gray-400 hover:text-[#F5B942] transition-colors"
            >
              تتبع
            </Link>
            <Link
              href="/reviews"
              className="text-gray-400 hover:text-[#F5B942] transition-colors"
            >
              تقييمات
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/my-orders"
                  className="text-gray-400 hover:text-[#F5B942] transition-colors"
                >
                  طلباتي
                </Link>
                {(session.user as any).role === "ADMIN" ||
                (session.user as any).role === "SUPER_ADMIN" ? (
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all"
                  >
                    لوحة التحكم
                  </Link>
                ) : null}
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#F5B942]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
            >
              شراء
            </Link>
            <Link
              href="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
            >
              بيع
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
            >
              تتبع
            </Link>
            <Link
              href="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
            >
              تقييمات
            </Link>
            {session?.user ? (
              <div className="pt-2 border-t border-[#2D2D2D] space-y-2">
                <Link
                  href="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#1A1A1A] rounded-lg"
                >
                  طلباتي
                </Link>
                {((session.user as any).role === "ADMIN" ||
                (session.user as any).role === "SUPER_ADMIN") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all"
                  >
                    لوحة التحكم
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 bg-[#F5B942] text-[#0A0A0A] rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-[#F5B942]/50 transition-all"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}