import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    const trimmed = orderId.trim();

    // Support lookup by primary CUID id OR by orderNumber (e.g. H8-BUY-261109-9VK4)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { orderNumber: trimmed },
          { orderNumber: { equals: trimmed, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        type: true,
        amount: true,
        usdtAmount: true,
        egpAmount: true,
        rateSnapshot: true,
        status: true,
        createdAt: true,
        approvedAt: true,
        rejectedAt: true,
        completedAt: true,
        fullName: true,
        paymentMethod: true,
        receiveMethod: true,
        proofImageUrl: true,
        txHash: true,
        rejectionReason: true,
        adminNote: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to track order" },
      { status: 500 }
    );
  }
}
