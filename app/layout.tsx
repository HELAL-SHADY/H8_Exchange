import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
      <body className={`${inter.className} bg-[#0A0A0A] text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
