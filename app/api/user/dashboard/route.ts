import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user aggregate stats
    const [
      user,
      totalOrdersCount,
      pendingOrdersCount,
      completedOrdersCount,
      rejectedOrdersCount,
      buyVolumeAgg,
      sellVolumeAgg,
      recentOrders,
      recentNotifications,
      activeTicketsCount,
      rates,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          binanceUid: true,
          walletNumber: true,
          isVerified: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.order.count({ where: { userId } }),
      prisma.order.count({
        where: {
          userId,
          status: { in: ["PENDING_PAYMENT", "PENDING_REVIEW", "UNDER_VERIFICATION"] },
        },
      }),
      prisma.order.count({ where: { userId, status: "COMPLETED" } }),
      prisma.order.count({ where: { userId, status: "REJECTED" } }),
      prisma.order.aggregate({
        where: { userId, type: "BUY", status: "COMPLETED" },
        _sum: { usdtAmount: true, amount: true },
      }),
      prisma.order.aggregate({
        where: { userId, type: "SELL", status: "COMPLETED" },
        _sum: { usdtAmount: true, amount: true },
      }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.supportTicket.count({
        where: { userId, status: { in: ["OPEN", "IN_PROGRESS", "WAITING_USER"] } },
      }),
      prisma.exchangeRate.findFirst(),
    ]);

    const totalPurchasedUsdt = buyVolumeAgg._sum.usdtAmount || 0;
    const totalSoldUsdt = sellVolumeAgg._sum.usdtAmount || 0;

    return NextResponse.json({
      user,
      stats: {
        totalPurchasedUsdt,
        totalSoldUsdt,
        totalOrders: totalOrdersCount,
        pendingOrders: pendingOrdersCount,
        completedOrders: completedOrdersCount,
        rejectedOrders: rejectedOrdersCount,
        activeTickets: activeTicketsCount,
        accountStatus: user?.isVerified ? "VERIFIED" : "STANDARD",
      },
      rates: rates
        ? {
            buyRate: rates.buyRate,
            sellRate: rates.sellRate,
            minOrder: rates.minOrderAmount,
            maxOrder: rates.maxOrderAmount,
            updatedAt: rates.updatedAt,
          }
        : null,
      recentOrders,
      recentNotifications,
    });
  } catch (error: any) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
