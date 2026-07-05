"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "ar" | "en";

export const translations = {
  ar: {
    // Navbar
    buy: "شراء",
    sell: "بيع",
    track: "تتبع",
    reviews: "تقييمات",
    myOrders: "طلباتي",
    dashboard: "لوحة التحكم",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    exchange: "صرافة",

    // Home
    heroTitle: "H8 Exchange",
    heroSubtitle: "شراء وبيع USDT مقابل الجنيه المصري بسرعة وأمان",
    buyUsdt: "شراء USDT",
    sellUsdt: "بيع USDT",
    ourStats: "إحصائياتنا",
    completedOrder: "طلب مكتمل",
    user: "مستخدم",
    successRate: "معدل النجاح",
    rating: "التقييم",
    features: "المميزات",
    howItWorks: "كيف يعمل",
    enterOrderId: "أدخل رقم الطلب",
    search: "بحث",
    searching: "جاري البحث...",
    buyRate: "سعر الشراء",
    sellRate: "سعر البيع",
    perUsdt: "لكل 1 USDT",
    egpPerUsdt: "EGP per USDT",

    // Features Section
    feature1Title: "معاملات آمنة",
    feature1Desc: "ضمان الأمان والحماية في كل عملية",
    feature2Title: "معالجة سريعة",
    feature2Desc: "تتم المعالجة خلال دقائق",
    feature3Title: "دعم Binance",
    feature3Desc: "تحويل مباشر من/إلى Binance",
    feature4Title: "دعم 24/7",
    feature4Desc: "فريق الدعم متاح على مدار الساعة",
    feature5Title: "دعم Vodafone Cash",
    feature5Desc: "محافظ الهاتف المحمول المدعومة",
    feature6Title: "تقييمات عالية",
    feature6Desc: "مصدوقة من قبل آلاف المستخدمين",

    // Steps Section
    step1Title: "إنشاء طلب",
    step1Desc: "ملء نموذج الطلب",
    step2TitleBuy: "تحويل EGP",
    step2DescBuy: "إرسال الأموال للمحفظة",
    step2TitleSell: "تحويل USDT",
    step2DescSell: "إرسال USDT للمحفظة",
    step3TitleBuy: "رفع الإثبات",
    step3DescBuy: "تحميل لقطة شاشة",
    step3TitleSell: "التحقق",
    step3DescSell: "التحقق من الحوالة",
    step4TitleBuy: "استقبل USDT",
    step4DescBuy: "وصول USDT للمحفظة",
    step4TitleSell: "استقبل EGP",
    step4DescSell: "وصول الأموال لمحفظتك",

    // Buy / Sell Pages
    buyUsdtTitle: "شراء USDT",
    sellUsdtTitle: "بيع USDT",
    startBuyNow: "ابدأ عملية الشراء الآن",
    startSellNow: "ابدأ عملية البيع الآن",
    paymentMethod: "طريقة الدفع",
    paymentMethodSell: "طريقة إرسال USDT",
    receiveMethod: "طريقة استلام USDT",
    receiveMethodSell: "طريقة استلام EGP",
    binanceUidLabel: "Binance UID الخاص بك (لاستقبال USDT)",
    bybitUidLabel: "Bybit Pay ID الخاص بك (لاستقبال USDT)",
    binanceUidLabelSell: "Binance UID الخاص بك",
    bybitUidLabelSell: "Bybit Pay ID الخاص بك",
    walletNumberLabel: "رقم محفظة Vodafone Cash المرسل منها",
    instapayNumberLabel: "رقم الحساب / الهاتف المرسل منه InstaPay",
    receivingWalletLabel: "محفظة الاستقبال (Vodafone Cash)",
    receivingInstapayLabel: "رقم / رابط InstaPay للاستقبال",
    amountEgpLabel: "المبلغ بالجنيه المصري",
    amountUsdtLabel: "مبلغ USDT",
    willReceive: "ستستقبل",
    createOrderBtn: "إنشاء الطلب",
    processing: "جاري المعالجة...",
    paymentInfo: "معلومات الدفع",
    receivingInfo: "معلومات الاستقبال",
    copied: "✅ تم النسخ!",
    copyNumber: "انسخ الرقم",
    loading: "جاري التحميل...",
    instructions: "التعليمات",
    buyInstructions: [
      "أرسل المبلغ بالجنيه إلى رقم Vodafone Cash أو InstaPay الموضح بالأعلى",
      "خذ لقطة شاشة للحوالة",
      "سيتم التحقق من الحوالة من قبل الإدارة",
      "سيتم إرسال USDT إلى حسابك"
    ],
    sellInstructions: [
      "أرسل USDT إلى Binance UID أو Bybit Pay ID المعروض",
      "خذ لقطة شاشة للتحويل",
      "سيتم التحقق من العملية",
      "ستستقبل EGP في محفظتك"
    ],
    currentPrice: "السعر الحالي",
    importantNotes: "ملاحظات مهمة",
    buyNotes: [
      "تأكد من صحة بيانات الحساب المُراد الاستلام عليه (Binance / Bybit)",
      "احتفظ بلقطة شاشة الحوالة",
      "سيتم التحقق من الطلب خلال 30 دقيقة",
      "تواصل معنا عبر Telegram للدعم"
    ],
    sellNotes: [
      "تأكد من صحة البيانات المدخلة",
      "احتفظ بلقطة شاشة التحويل",
      "سيتم التحقق من الطلب خلال 30 دقيقة",
      "تواصل معنا عبر Telegram للدعم"
    ],

    // Track Page
    trackOrderTitle: "تتبع الطلب",
    trackOrderSubtitle: "أدخل رقم الطلب لتتبع حالة عمليتك",
    orderNotFound: "الطلب غير موجود",
    orderDetails: "تفاصيل الطلب",
    orderId: "رقم الطلب",
    processType: "نوع العملية",
    amount: "المبلغ",
    fullName: "الاسم",
    createdAt: "تاريخ الإنشاء",
    currentStatus: "الحالة الحالية",
    statusHistory: "سجل الحالة",
    orderRejected: "تم رفض الطلب",
    orderRejectedDetail: "يرجى تقديم طلب جديد",
    status_PENDING_PAYMENT: "في انتظار الدفع",
    status_PENDING_REVIEW: "قيد المراجعة",
    status_UNDER_VERIFICATION: "التحقق جاري",
    status_APPROVED: "موافق عليه",
    status_REJECTED: "مرفوض",
    status_COMPLETED: "مكتمل",
    reviewTitle: "تقييم الخدمة",
    reviewSuccess: "تم تسجيل تقييمك بنجاح! شكرًا لك على مشاركتنا رأيك.",
    reviewInstruction: "شاركنا رأيك حول هذه العملية لمساعدتنا في تحسين خدماتنا:",
    loginToReview: "يجب عليك تسجيل الدخول لإضافة تقييم.",
    starRating: "التقييم بالنجوم",
    yourComment: "تعليقك (اختياري)",
    writeOpinion: "اكتب رأيك هنا...",
    submitReview: "إرسال التقييم",
    submittingReview: "جاري الإرسال...",
    needHelp: "هل تحتاج إلى مساعدة؟",
    telegramSupport: "تواصل معنا عبر Telegram للحصول على الدعم الفوري",
    contactUs: "تواصل معنا",

    // New Order Payment step
    payPendingTitle: "الطلب قيد الانتظار: يرجى الدفع",
    payPendingSubtitle: "الرجاء تحويل المبلغ المطلوب لإكمال الطلب",
    transferToNumber: "الرجاء تحويل مبلغ {amount} إلى الحساب التالي:",
    uploadScreenshot: "إثبات التحويل (صورة الشاشة إجباري)",
    uploadScreenshotPlaceholder: "يرجى رفع لقطة شاشة واضحة لإثبات التحويل لتسريع عملية المراجعة.",
    markAsPaid: "تم الدفع",
    paymentSubmittedSuccess: "تم تقديم الطلب بنجاح وهو الآن قيد المراجعة!",
    uploadFirstError: "الرجاء تحميل إثبات الدفع (صورة التحويل)"
  },
  en: {
    // Navbar
    buy: "Buy",
    sell: "Sell",
    track: "Track",
    reviews: "Reviews",
    myOrders: "My Orders",
    dashboard: "Dashboard",
    logout: "Logout",
    login: "Login",
    exchange: "Exchange",

    // Home
    heroTitle: "H8 Exchange",
    heroSubtitle: "Buy and Sell USDT against Egyptian Pound quickly and securely",
    buyUsdt: "Buy USDT",
    sellUsdt: "Sell USDT",
    ourStats: "Our Statistics",
    completedOrder: "Completed Orders",
    user: "Users",
    successRate: "Success Rate",
    rating: "Rating",
    features: "Features",
    howItWorks: "How it works",
    enterOrderId: "Enter Order ID",
    search: "Search",
    searching: "Searching...",
    buyRate: "Buy Rate",
    sellRate: "Sell Rate",
    perUsdt: "Per 1 USDT",
    egpPerUsdt: "EGP per USDT",

    // Features Section
    feature1Title: "Secure Transactions",
    feature1Desc: "Guaranteed safety and protection in every transaction",
    feature2Title: "Fast Processing",
    feature2Desc: "Processed within minutes",
    feature3Title: "Binance Support",
    feature3Desc: "Direct transfer from/to Binance",
    feature4Title: "24/7 Support",
    feature4Desc: "Support team available around the clock",
    feature5Title: "Vodafone Cash Support",
    feature5Desc: "Mobile wallets supported",
    feature6Title: "High Ratings",
    feature6Desc: "Trusted by thousands of users",

    // Steps Section
    step1Title: "Create Order",
    step1Desc: "Fill the order form",
    step2TitleBuy: "Transfer EGP",
    step2DescBuy: "Send funds to the wallet",
    step2TitleSell: "Transfer USDT",
    step2DescSell: "Send USDT to the wallet",
    step3TitleBuy: "Upload Proof",
    step3DescBuy: "Upload screenshot",
    step3TitleSell: "Verify",
    step3DescSell: "Verify the transfer",
    step4TitleBuy: "Receive USDT",
    step4DescBuy: "USDT arrives in your wallet",
    step4TitleSell: "Receive EGP",
    step4DescSell: "Funds arrive in your wallet",

    // Buy / Sell Pages
    buyUsdtTitle: "Buy USDT",
    sellUsdtTitle: "Sell USDT",
    startBuyNow: "Start the purchase process now",
    startSellNow: "Start the sell process now",
    paymentMethod: "Payment Method",
    paymentMethodSell: "USDT Sending Method",
    receiveMethod: "USDT Receive Method",
    receiveMethodSell: "EGP Receive Method",
    binanceUidLabel: "Your Binance UID (to receive USDT)",
    bybitUidLabel: "Your Bybit Pay ID (to receive USDT)",
    binanceUidLabelSell: "Your Binance UID",
    bybitUidLabelSell: "Your Bybit Pay ID",
    walletNumberLabel: "Vodafone Cash wallet number sent from",
    instapayNumberLabel: "Account / Phone sent from on InstaPay",
    receivingWalletLabel: "Receiving wallet (Vodafone Cash)",
    receivingInstapayLabel: "Account / Link to receive on InstaPay",
    amountEgpLabel: "Amount in EGP",
    amountUsdtLabel: "USDT Amount",
    willReceive: "You will receive",
    createOrderBtn: "Create Order",
    processing: "Processing...",
    paymentInfo: "Payment Info",
    receivingInfo: "Receiving Info",
    copied: "✅ Copied!",
    copyNumber: "Copy Number",
    loading: "Loading...",
    instructions: "Instructions",
    buyInstructions: [
      "Send the amount in EGP to the Vodafone Cash number or InstaPay link shown above",
      "Take a screenshot of the transfer",
      "The transfer will be verified by administration",
      "USDT will be sent to your wallet"
    ],
    sellInstructions: [
      "Send USDT to the displayed Binance UID or Bybit Pay ID",
      "Take a screenshot of the transfer",
      "The transaction will be verified",
      "You will receive EGP in your wallet"
    ],
    currentPrice: "Current Price",
    importantNotes: "Important Notes",
    buyNotes: [
      "Make sure the receiving account details are correct (Binance / Bybit)",
      "Keep a screenshot of the transfer",
      "The order will be verified within 30 minutes",
      "Contact us via Telegram for support"
    ],
    sellNotes: [
      "Make sure the entered details are correct",
      "Keep a screenshot of the transfer",
      "The order will be verified within 30 minutes",
      "Contact us via Telegram for support"
    ],

    // Track Page
    trackOrderTitle: "Track Order",
    trackOrderSubtitle: "Enter the order ID to track your transaction status",
    orderNotFound: "Order not found",
    orderDetails: "Order Details",
    orderId: "Order ID",
    processType: "Process Type",
    amount: "Amount",
    fullName: "Full Name",
    createdAt: "Creation Date",
    currentStatus: "Current Status",
    statusHistory: "Status History",
    orderRejected: "Order Rejected",
    orderRejectedDetail: "Please submit a new order",
    status_PENDING_PAYMENT: "Pending Payment",
    status_PENDING_REVIEW: "Pending Review",
    status_UNDER_VERIFICATION: "Under Verification",
    status_APPROVED: "Approved",
    status_REJECTED: "Rejected",
    status_COMPLETED: "Completed",
    reviewTitle: "Service Review",
    reviewSuccess: "Your review has been successfully registered! Thank you for sharing your feedback.",
    reviewInstruction: "Share your feedback about this transaction to help us improve our services:",
    loginToReview: "You must login to add a review.",
    starRating: "Star Rating",
    yourComment: "Your Comment (Optional)",
    writeOpinion: "Write your review here...",
    submitReview: "Submit Review",
    submittingReview: "Submitting...",
    needHelp: "Need help?",
    telegramSupport: "Contact us on Telegram for instant support",
    contactUs: "Contact Us",

    // New Order Payment step
    payPendingTitle: "Order Pending: Please Pay",
    payPendingSubtitle: "Please transfer the required amount to complete the order",
    transferToNumber: "Please transfer {amount} to the following account:",
    uploadScreenshot: "Proof of Transfer (Screenshot mandatory)",
    uploadScreenshotPlaceholder: "Please upload a clear screenshot of the transfer to speed up review.",
    markAsPaid: "I have Paid",
    paymentSubmittedSuccess: "Order successfully submitted and is now under review!",
    uploadFirstError: "Please upload the transfer proof screenshot"
  }
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof translations.ar) => any;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language preference from local storage
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale === "en" || savedLocale === "ar") {
      setLocale(savedLocale);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Save language preference and apply layout direction changes
    localStorage.setItem("locale", locale);
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale, mounted]);

  const t = (key: keyof typeof translations.ar) => {
    return translations[locale][key] || translations.ar[key] || key;
  };

  // Prevent flash by waiting for hydration client-side if needed, 
  // but to avoid rendering empty screen, we still render children
  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
