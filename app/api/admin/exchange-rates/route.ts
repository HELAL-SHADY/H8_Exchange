import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function checkAdminRole(session: any) {
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const exchangeRate = await prisma.exchangeRate.findFirst();

    if (!exchangeRate) {
      // Create default rates if not exists
      const newRate = await prisma.exchangeRate.create({
        data: {
          buyRate: 51.0,
          sellRate: 50.0,
          minOrderAmount: 100,
          maxOrderAmount: 10000,
        },
      });
      return NextResponse.json(newRate);
    }

    return NextResponse.json(exchangeRate);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!await checkAdminRole(session)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { buyRate, sellRate, minOrderAmount, maxOrderAmount, isAutomatic, profitMargin } =
      await request.json();

    const existingRate = await prisma.exchangeRate.findFirst();

    if (!existingRate) {
      return NextResponse.json(
        { error: "Exchange rates not configured" },
        { status: 500 }
      );
    }

    // Save history
    await prisma.rateHistory.create({
      data: {
        oldBuyRate: existingRate.buyRate,
        oldSellRate: existingRate.sellRate,
        newBuyRate: buyRate || existingRate.buyRate,
        newSellRate: sellRate || existingRate.sellRate,
        updatedBy: (session.user as any).id,
      },
    });

    const updatedRate = await prisma.exchangeRate.update({
      where: { id: existingRate.id },
      data: {
        buyRate: buyRate || existingRate.buyRate,
        sellRate: sellRate || existingRate.sellRate,
        minOrderAmount: minOrderAmount || existingRate.minOrderAmount,
        maxOrderAmount: maxOrderAmount || existingRate.maxOrderAmount,
        isAutomatic: isAutomatic !== undefined ? isAutomatic : existingRate.isAutomatic,
        profitMargin: profitMargin || existingRate.profitMargin,
        updatedBy: (session.user as any).id,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        actionType: "EDIT_EXCHANGE_RATES",
        actionDescription: `Updated exchange rates: Buy ${updatedRate.buyRate}, Sell ${updatedRate.sellRate}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json(updatedRate);
  } catch (error: any) {
    console.error("Error updating exchange rates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update exchange rates" },
      { status: 500 }
    );
  }
}
