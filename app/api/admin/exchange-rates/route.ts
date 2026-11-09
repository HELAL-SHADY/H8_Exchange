import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function checkAdminFinancialRole(session: any) {
  // Support agents cannot modify exchange rates; only ADMIN and SUPER_ADMIN
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    let exchangeRate = await prisma.exchangeRate.findFirst();

    if (!exchangeRate) {
      exchangeRate = await prisma.exchangeRate.create({
        data: {
          buyRate: 51.0,
          sellRate: 50.0,
          minOrderAmount: 10,
          maxOrderAmount: 10000,
          tradingEnabled: true,
          buyFeePercent: 0.0,
          sellFeePercent: 0.0,
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const withHistory = searchParams.get("history") === "true";

    let history: any[] = [];
    if (withHistory) {
      history = await prisma.rateHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    return NextResponse.json({ ...exchangeRate, history });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;

    if (!(await checkAdminFinancialRole(session))) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل أسعار الصرف (يتطلب صلاحية Admin أو Super Admin)" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      buyRate,
      sellRate,
      minOrderAmount,
      maxOrderAmount,
      tradingEnabled,
      buyFeePercent,
      sellFeePercent,
      isAutomatic,
      profitMargin,
    } = body;

    const existingRate = await prisma.exchangeRate.findFirst();

    if (!existingRate) {
      return NextResponse.json(
        { error: "Exchange rates not configured" },
        { status: 500 }
      );
    }

    // Save permanent history snapshot in transaction
    const updated = await prisma.$transaction(async (tx) => {
      await tx.rateHistory.create({
        data: {
          oldBuyRate: existingRate.buyRate,
          oldSellRate: existingRate.sellRate,
          newBuyRate: buyRate ?? existingRate.buyRate,
          newSellRate: sellRate ?? existingRate.sellRate,
          updatedBy: session.user.id,
        },
      });

      const rate = await tx.exchangeRate.update({
        where: { id: existingRate.id },
        data: {
          buyRate: buyRate !== undefined ? parseFloat(buyRate) : existingRate.buyRate,
          sellRate: sellRate !== undefined ? parseFloat(sellRate) : existingRate.sellRate,
          minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : existingRate.minOrderAmount,
          maxOrderAmount: maxOrderAmount !== undefined ? parseFloat(maxOrderAmount) : existingRate.maxOrderAmount,
          tradingEnabled: tradingEnabled !== undefined ? Boolean(tradingEnabled) : existingRate.tradingEnabled,
          buyFeePercent: buyFeePercent !== undefined ? parseFloat(buyFeePercent) : existingRate.buyFeePercent,
          sellFeePercent: sellFeePercent !== undefined ? parseFloat(sellFeePercent) : existingRate.sellFeePercent,
          isAutomatic: isAutomatic !== undefined ? isAutomatic : existingRate.isAutomatic,
          profitMargin: profitMargin !== undefined ? profitMargin : existingRate.profitMargin,
          updatedBy: session.user.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          actionType: "EDIT_EXCHANGE_RATES",
          actionDescription: `Rates updated: Buy ${rate.buyRate} EGP, Sell ${rate.sellRate} EGP, Trading=${rate.tradingEnabled}`,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      });

      return rate;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "فشل تحديث أسعار الصرف" },
      { status: 500 }
    );
  }
}
