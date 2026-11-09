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
      where.status = status;
    }

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
        { txHash: { contains: search, mode: "insensitive" } },
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

    return NextResponse.json({
      orders,
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
      txHash,
    } = body;

    if (!type || !amount) {
      return NextResponse.json(
        { error: "الرجاء تحديد نوع المعاملة والمبلغ المطلوب" },
        { status: 400 }
      );
    }

    // Check system maintenance & trading status
    const siteSettings = await prisma.siteSettings.findFirst();
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

    // Initial status: If proof or txHash is already uploaded, PENDING_REVIEW; otherwise PENDING_PAYMENT
    const initialStatus = (proofImageUrl || txHash) ? "PENDING_REVIEW" : "PENDING_PAYMENT";

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
          txHash: txHash || null,
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

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "فشل إنشاء الطلب. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}
