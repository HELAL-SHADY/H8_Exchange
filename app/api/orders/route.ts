import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendNewOrderNotification } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: (session.user as any).id,
      },
      include: {
        reviews: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
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
    const session: any = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type, amount, binanceUid, walletNumber, proofImageUrl, paymentMethod, receiveMethod } =
      await request.json();

    if (!type || !amount || !binanceUid || !walletNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // التحقق من إعدادات الموقع وتوفر العمليات وطرق الدفع
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
      if (
        (paymentMethod === "INSTAPAY" || receiveMethod === "INSTAPAY") &&
        !siteSettings.instapayEnabled
      ) {
        return NextResponse.json(
          { error: "خدمة إنستا باي (InstaPay) متوقفة حالياً للصيانة، وسوف تتاح قريباً." },
          { status: 503 }
        );
      }
      if (
        (paymentMethod === "VODAFONE_CASH" || receiveMethod === "VODAFONE_CASH") &&
        !siteSettings.vodafoneEnabled
      ) {
        return NextResponse.json(
          { error: "خدمة فودافون كاش (Vodafone Cash) متوقفة حالياً للصيانة، وسوف تتاح قريباً." },
          { status: 503 }
        );
      }
      if (
        (paymentMethod === "BINANCE_PAY" || receiveMethod === "BINANCE_PAY") &&
        !siteSettings.binanceEnabled
      ) {
        return NextResponse.json(
          { error: "خدمة بينانس (Binance Pay) متوقفة حالياً للصيانة، وسوف تتاح قريباً." },
          { status: 503 }
        );
      }
      if (
        (paymentMethod === "BYBIT_PAY" || receiveMethod === "BYBIT_PAY") &&
        !siteSettings.bybitEnabled
      ) {
        return NextResponse.json(
          { error: "خدمة بايبت (Bybit Pay) متوقفة حالياً للصيانة، وسوف تتاح قريباً." },
          { status: 503 }
        );
      }
    }

    // جلب بيانات المستخدم (الاسم ورقم الهاتف) من حسابه المسجل
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { name: true, phone: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const fullName = user.name;
    const phone = user.phone || "";

    // Get current exchange rate
    const exchangeRate = await prisma.exchangeRate.findFirst();
    if (!exchangeRate) {
      return NextResponse.json(
        { error: "Exchange rate not configured" },
        { status: 500 }
      );
    }

    // Validate amount (both BUY and SELL evaluated in USD/USDT)
    const amountInUsdt = type === "BUY" ? (amount / exchangeRate.buyRate) : amount;

    if (amountInUsdt < exchangeRate.minOrderAmount || amountInUsdt > exchangeRate.maxOrderAmount) {
      if (type === "BUY") {
        const minEgp = Math.round(exchangeRate.minOrderAmount * exchangeRate.buyRate);
        const maxEgp = Math.round(exchangeRate.maxOrderAmount * exchangeRate.buyRate);
        return NextResponse.json(
          { error: `المبلغ يجب أن يكون بين ${minEgp} EGP و ${maxEgp} EGP (ما يعادل ${exchangeRate.minOrderAmount}$ إلى ${exchangeRate.maxOrderAmount}$)` },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: `المبلغ يجب أن يكون بين ${exchangeRate.minOrderAmount}$ و ${exchangeRate.maxOrderAmount}$` },
          { status: 400 }
        );
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: (session.user as any).id,
        type,
        amount,
        fullName,
        phone,
        binanceUid,
        walletNumber,
        proofImageUrl: proofImageUrl || null,
        paymentMethod,
        receiveMethod,
        status: "PENDING_PAYMENT",
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: (session.user as any).id,
        orderId: order.id,
        type: "ORDER_SUBMITTED",
        title: "تم إنشاء طلبك",
        message: `تم إنشاء طلب ${type === "BUY" ? "شراء" : "بيع"} بقيمة ${amount} وهو في انتظار الدفع`,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        orderId: order.id,
        actionType: type === "BUY" ? "CREATE_BUY_ORDER" : "CREATE_SELL_ORDER",
        actionDescription: `User created ${type} order for ${amount}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
