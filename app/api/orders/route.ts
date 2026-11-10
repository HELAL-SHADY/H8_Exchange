import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendNewOrderNotification } from "@/lib/telegram";
import { generateOrderNumber, roundToPrecision } from "@/lib/order-utils";

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== "ALL") {
      where.status = status === "UNDER_VERIFICATION"
        ? { in: ["UNDER_VERIFICATION", "PENDING_REVIEW", "APPROVED"] }
        : status;
    }

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          reviews: true,
          statusHistory: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    const visibleOrders = orders.map(({ txHash, ...order }) => ({
      ...order,
      status: ["PENDING_REVIEW", "APPROVED"].includes(order.status)
        ? "UNDER_VERIFICATION"
        : order.status,
      statusHistory: order.statusHistory.map((history) => ({
        ...history,
        fromStatus: ["PENDING_REVIEW", "APPROVED"].includes(history.fromStatus || "")
          ? "UNDER_VERIFICATION"
          : history.fromStatus,
        toStatus: ["PENDING_REVIEW", "APPROVED"].includes(history.toStatus)
          ? "UNDER_VERIFICATION"
          : history.toStatus,
      })),
    }));

    return NextResponse.json({
      orders: visibleOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      amount,
      binanceUid,
      walletNumber,
      proofImageUrl,
      proofImageId,
      paymentMethod,
      receiveMethod,
      network,
    } = body;

    if (!type || !amount) {
      return NextResponse.json(
        { error: "الرجاء تحديد نوع المعاملة والمبلغ المطلوب" },
        { status: 400 }
      );
    }

    // Check system maintenance & trading status
    const siteSettings = await prisma.siteSettings.findFirst();
    if (type !== "BUY" && type !== "SELL") {
      return NextResponse.json({ error: "نوع المعاملة غير صالح" }, { status: 400 });
    }

    if (siteSettings) {
      if (type === "BUY" && !siteSettings.buyEnabled) {
        return NextResponse.json(
          { error: "عمليات الشراء متوقفة حالياً للصيانة، وسوف تتاح قريباً." },
          { status: 503 }
        );
      }
      if (type === "SELL" && !siteSettings.sellEnabled) {
        return NextResponse.json(
          { error: "عمليات البيع متوقفة حالياً للصيانة، وسوف تتاح قريباً." },
          { status: 503 }
        );
      }
    }

    if (type === "BUY") {
      if (!["VODAFONE_CASH", "INSTAPAY"].includes(paymentMethod)) {
        return NextResponse.json({ error: "طريقة الدفع غير مدعومة" }, { status: 400 });
      }
      if (
        (paymentMethod === "VODAFONE_CASH" && !siteSettings?.vodafoneEnabled) ||
        (paymentMethod === "INSTAPAY" && !siteSettings?.instapayEnabled)
      ) {
        return NextResponse.json({ error: "طريقة الدفع متوقفة حاليًا" }, { status: 503 });
      }
      if (!["BINANCE_PAY", "CRYPTO_WALLET"].includes(receiveMethod)) {
        return NextResponse.json({ error: "طريقة الاستلام غير مدعومة" }, { status: 400 });
      }
      if (receiveMethod === "BINANCE_PAY" && !siteSettings?.binanceEnabled) {
        return NextResponse.json({ error: "استلام Binance متوقف حاليًا" }, { status: 503 });
      }
      if (receiveMethod === "CRYPTO_WALLET" && network !== "BEP20") {
        return NextResponse.json({ error: "شبكة العنوان المدعومة هي BSC فقط" }, { status: 400 });
      }
      if (receiveMethod === "CRYPTO_WALLET" && !siteSettings?.bep20Enabled) {
        return NextResponse.json({ error: "شبكة BSC متوقفة حاليًا" }, { status: 503 });
      }
    } else {
      if (paymentMethod !== "BEP20" || network !== "BEP20") {
        return NextResponse.json({ error: "الإيداع متاح عبر شبكة BSC فقط" }, { status: 400 });
      }
      if (!siteSettings?.bep20Enabled || !siteSettings.usdtBep20Address?.trim()) {
        return NextResponse.json({ error: "الإيداع عبر BSC غير متاح حاليًا" }, { status: 503 });
      }
      if (!["VODAFONE_CASH", "INSTAPAY"].includes(receiveMethod)) {
        return NextResponse.json({ error: "طريقة استلام الجنيه غير مدعومة" }, { status: 400 });
      }
      if (
        (receiveMethod === "VODAFONE_CASH" && !siteSettings.vodafoneEnabled) ||
        (receiveMethod === "INSTAPAY" && !siteSettings.instapayEnabled)
      ) {
        return NextResponse.json({ error: "طريقة الاستلام متوقفة حاليًا" }, { status: 503 });
      }
    }

    // Get verified current exchange rate
    const exchangeRate = await prisma.exchangeRate.findFirst();
    if (!exchangeRate || !exchangeRate.tradingEnabled) {
      return NextResponse.json(
        { error: "خدمة التداول متوقفة مؤقتاً لتحديث أسعار الصرف، يرجى المحاولة بعد قليل" },
        { status: 503 }
      );
    }

    // Server-side financial calculations & permanent snapshots
    const rateSnapshot = type === "BUY" ? exchangeRate.buyRate : exchangeRate.sellRate;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "المبلغ المدخل غير صالح" }, { status: 400 });
    }

    let usdtAmount = 0;
    let egpAmount = 0;

    if (type === "BUY") {
      // In BUY order: amount entered is EGP or USDT
      // If payment is fiat, calculate USDT
      egpAmount = roundToPrecision(numericAmount);
      usdtAmount = roundToPrecision(egpAmount / rateSnapshot);
    } else {
      // SELL order: amount entered is USDT
      usdtAmount = roundToPrecision(numericAmount);
      egpAmount = roundToPrecision(usdtAmount * rateSnapshot);
    }

    // Validate limits strictly against USDT amount
    if (
      usdtAmount < exchangeRate.minOrderAmount ||
      usdtAmount > exchangeRate.maxOrderAmount
    ) {
      return NextResponse.json(
        {
          error: `المبلغ يجب أن يكون بين ${exchangeRate.minOrderAmount} USDT و ${exchangeRate.maxOrderAmount} USDT`,
        },
        { status: 400 }
      );
    }

    // Retrieve user credentials
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, phone: true },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const orderNumber = generateOrderNumber(type);

    const initialStatus = proofImageUrl || proofImageId ? "UNDER_VERIFICATION" : "PENDING_PAYMENT";

    // Create Order with Snapshot and Status History in transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          type,
          amount: type === "BUY" ? egpAmount : usdtAmount,
          rateSnapshot,
          usdtAmount,
          egpAmount,
          totalAmount: type === "BUY" ? egpAmount : egpAmount,
          fullName: user.name,
          phone: user.phone || "",
          binanceUid: binanceUid || "",
          walletNumber: walletNumber || "",
          proofImageUrl: proofImageUrl || null,
          proofImageId: proofImageId || null,
          paymentMethod: paymentMethod || null,
          receiveMethod: receiveMethod || null,
          network: network || null,
          status: initialStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: initialStatus,
          note: "Order created by user",
          changedBy: session.user.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: session.user.id,
          orderId: order.id,
          type: "ORDER_SUBMITTED",
          title: "تم إنشاء طلبك بنجاح",
          message: `طلب رقم ${orderNumber} بمبلغ ${usdtAmount} USDT (${egpAmount} ج.م) بانتظار إتمام الدفع والمراجعة.`,
          actionUrl: `/dashboard/orders/${order.id}`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          orderId: order.id,
          actionType: type === "BUY" ? "CREATE_BUY_ORDER" : "CREATE_SELL_ORDER",
          actionDescription: `Created ${type} order ${orderNumber} for ${usdtAmount} USDT @ ${rateSnapshot} EGP`,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      });

      return order;
    });

    // Notify Telegram channel asynchronously
    try {
      await sendNewOrderNotification(newOrder);
    } catch (e) {
      console.warn("Telegram alert failed silently:", e);
    }

    const { txHash, ...visibleOrder } = newOrder;
    return NextResponse.json(visibleOrder, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "فشل إنشاء الطلب. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}
