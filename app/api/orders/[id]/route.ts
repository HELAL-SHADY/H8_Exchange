import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendOrderStatusNotification, sendNewOrderNotification } from "@/lib/telegram";

export async function GET(
  request: NextRequest,
  context: any
) {
  const { params } = context;
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        reviews: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  const { params } = context;
  try {
    const session = (await getServerSession(authOptions)) as any;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const data = await request.json();

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
    });

    // Send Telegram Notification if status or proof changed
    try {
      if (existingOrder.status === "PENDING_PAYMENT" && order.status === "PENDING_REVIEW") {
        await sendNewOrderNotification(order);
      } else if (order.status !== existingOrder.status || order.proofImageUrl !== existingOrder.proofImageUrl) {
        await sendOrderStatusNotification(order, existingOrder.status);
      }
    } catch (telegramError) {
      console.error("Failed to send Telegram order update notification:", telegramError);
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
