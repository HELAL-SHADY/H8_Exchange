"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#08080C]/75 backdrop-blur-2xl border-t border-white/[0.08] mt-24 relative overflow-hidden shadow-[0_-10px_35px_rgba(0,0,0,0.4)]">
      <div className="liquid-sheen" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent mb-4 tracking-wide">
              H8 Exchange
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">{t("howItWorks") === "كيف يعمل" ? "روابط سريعة" : "Quick Links"}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/buy"
                  className="text-gray-400 hover:text-[#F5B942] transition-colors text-sm"
                >
                  {t("buyUsdt")}
                </Link>
              </li>
              <li>
                <Link
                  href="/sell"
                  className="text-gray-400 hover:text-[#F5B942] transition-colors text-sm"
                >
                  {t("sellUsdt")}
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="text-gray-400 hover:text-[#F5B942] transition-colors text-sm"
                >
                  {t("trackOrderTitle")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">{t("needHelp") === "هل تحتاج إلى مساعدة؟" ? "الدعم" : "Support"}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="https://t.me/HELAL_SHADY"
                  target="_blank"
                  className="text-gray-400 hover:text-[#F5B942] transition-colors text-sm"
                >
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-[#F5B942] transition-colors text-sm"
                >
                  {t("howItWorks") === "كيف يعمل" ? "سياسة الخصوصية" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-[#F5B942] transition-colors text-sm"
                >
                  {t("howItWorks") === "كيف يعمل" ? "شروط الاستخدام" : "Terms of Service"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">{t("contactUs")}</h4>
            <a
              href="https://t.me/HELAL_SHADY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl liquid-pill text-gray-300 hover:text-[#F5B942] transition-colors text-sm"
            >
              <Send size={16} />
              <span>Telegram Support</span>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.08] pt-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} H8 Exchange. {t("howItWorks") === "كيف يعمل" ? "جميع الحقوق محفوظة." : "All rights reserved."}
            </p>
            <div className="flex gap-4">
              <a
                href="https://t.me/HELAL_SHADY"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full liquid-pill text-[#F5B942] hover:scale-110 transition-transform"
                aria-label="Telegram"
              >
                <Send size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
