import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function checkAdminRole(session: any) {
  if (
    !session?.user ||
    !["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes((session.user as any).role)
  ) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;

    if (!(await checkAdminRole(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      pendingOrders,
      underVerificationOrders,
      approvedOrders,
      rejectedOrders,
      completedOrders,
      totalUsers,
      todayOrders,
      monthOrders,
      buyStats,
      sellStats,
      exchangeRate,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["PENDING_PAYMENT", "PENDING_REVIEW"] } } }),
      prisma.order.count({ where: { status: "UNDER_VERIFICATION" } }),
      prisma.order.count({ where: { status: "APPROVED" } }),
      prisma.order.count({ where: { status: "REJECTED" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.user.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
      prisma.order.aggregate({
        where: { type: "BUY", status: "COMPLETED" },
        _sum: { usdtAmount: true, egpAmount: true },
      }),
      prisma.order.aggregate({
        where: { type: "SELL", status: "COMPLETED" },
        _sum: { usdtAmount: true, egpAmount: true },
      }),
      prisma.exchangeRate.findFirst(),
    ]);

    const totalBuyVolumeUsdt = buyStats._sum.usdtAmount || 0;
    const totalSellVolumeUsdt = sellStats._sum.usdtAmount || 0;
    const totalVolumeUsdt = totalBuyVolumeUsdt + totalSellVolumeUsdt;

    // Gross trading spread profit calculation:
    // Profit per matched unit = (Buy Rate - Sell Rate)
    // Here we compute the actual spread margin achieved
    const spreadPerUsdt = exchangeRate ? Math.max(0, exchangeRate.buyRate - exchangeRate.sellRate) : 1.0;
    const matchedVolume = Math.min(totalBuyVolumeUsdt, totalSellVolumeUsdt);
    const estimatedSpreadProfitEgp = Math.round(matchedVolume * spreadPerUsdt * 100) / 100;

    const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        underVerificationOrders,
        approvedOrders,
        rejectedOrders,
        completedOrders,
        totalUsers,
        todayOrders,
        monthOrders,
        totalBuyVolumeUsdt,
        totalSellVolumeUsdt,
        totalVolumeUsdt,
        estimatedSpreadProfitEgp,
        spreadPerUsdt,
        successRate,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
