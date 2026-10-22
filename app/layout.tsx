import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "H8 Exchange - شراء وبيع USDT",
  description: "منصة موثوقة لشراء وبيع USDT مقابل الجنيه المصري بسرعة وأمان",
  keywords: "USDT, EGP, تحويل أموال, عملات رقمية, صرافة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.className} text-white relative min-h-screen`}>
        {/* Ambient Liquid Glass Floating Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-[#F5B942]/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: "7s" }} />
          <div className="absolute top-1/4 -right-32 w-[550px] h-[550px] bg-[#E6A430]/8 rounded-full blur-[160px]" />
          <div className="absolute top-2/3 -left-40 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[180px]" />
          <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-[#F5B942]/8 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Providers>
            {children}
            <SpeedInsights />
          </Providers>
        </div>
      </body>
    </html>
  );
}
