"use client";

import Link from "next/link";
import { Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2D2D2D] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent mb-4">
              H8 Exchange
            </h3>
            <p className="text-gray-500 text-sm">
              منصة موثوقة وآمنة لشراء وبيع USDT مقابل الجنيه المصري
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/buy"
                  className="text-gray-500 hover:text-[#F5B942] transition-colors"
                >
                  شراء USDT
                </Link>
              </li>
              <li>
                <Link
                  href="/sell"
                  className="text-gray-500 hover:text-[#F5B942] transition-colors"
                >
                  بيع USDT
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="text-gray-500 hover:text-[#F5B942] transition-colors"
                >
                  تتبع الطلب
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">الدعم</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-500 hover:text-[#F5B942] transition-colors"
                >
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-500 hover:text-[#F5B942] transition-colors"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-500 hover:text-[#F5B942] transition-colors"
                >
                  شروط الاستخدام
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
            <a
              href="https://t.me/HELAL_SHADY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-[#F5B942] transition-colors"
            >
              <Send size={20} />
              <span>Telegram</span>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#2D2D2D] pt-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              &copy; 2024 H8 Exchange. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-4">
              <a
                href="https://t.me/HELAL_SHADY"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5B942] hover:text-[#E6A430] transition-colors"
              >
                <Send size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
