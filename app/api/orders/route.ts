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

    const { type, amount, binanceUid, walletNumber, proofImageUrl } = await request.json();

    if (!type || !amount || !binanceUid || !walletNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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
        proofImageUrl,
        status: "PENDING_REVIEW",
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: (session.user as any).id,
        orderId: order.id,
        type: "ORDER_SUBMITTED",
        title: "تم إنشاء طلبك",
        message: `تم إنشاء طلب ${type === "BUY" ? "شراء" : "بيع"} بقيمة ${amount}`,
      },
    });

    // Send Telegram Notification
    try {
      await sendNewOrderNotification(order);
    } catch (telegramError) {
      console.error("Failed to send Telegram notification:", telegramError);
    }

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