import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendNewOrderNotification } from "@/lib/telegram";

export async function GET(
  request: NextRequest,
  context: any
) {
  const { params } = context;
  try {
    const session = (await getServerSession(authOptions as any)) as any;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        reviews: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If authenticated, check role/ownership; if not authenticated, allow basic order retrieval for tracking by exact ID
    if (session?.user?.id) {
      const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(session.user.role);
      if (!isStaff && order.userId !== session.user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
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
    const session = (await getServerSession(authOptions as any)) as any;

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isStaff = session?.user?.role && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);

    // If regular user or guest tracking their order
    if (!isStaff) {
      if (session?.user?.id && existingOrder.userId !== session.user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // If order is already completed or rejected, user cannot modify
      if (["COMPLETED", "REJECTED"].includes(existingOrder.status)) {
        return NextResponse.json(
          { error: "لا يمكن تعديل هذا الطلب نظراً لاكتماله أو رفضه" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { proofImageUrl, proofImageId, txHash, action } = body;

      // Handle user cancellation
      if (action === "CANCEL") {
        if (["COMPLETED", "REJECTED", "CANCELLED"].includes(existingOrder.status)) {
          return NextResponse.json(
            { error: "الطلب تم إلغاؤه أو إكماله بالفعل" },
            { status: 400 }
          );
        }

        const updated = await prisma.$transaction(async (tx) => {
          const ord = await tx.order.update({
            where: { id: params.id },
            data: { status: "CANCELLED" },
          });
          await tx.orderStatusHistory.create({
            data: {
              orderId: params.id,
              fromStatus: existingOrder.status,
              toStatus: "CANCELLED",
              note: "Cancelled by user",
              changedBy: session?.user?.id || "USER",
            },
          });
          return ord;
        });
        return NextResponse.json(updated);
      }

      // Handle user payment proof / txHash submission
      const updateData: any = {};
      if (proofImageUrl) updateData.proofImageUrl = proofImageUrl;
      if (proofImageId) updateData.proofImageId = proofImageId;
      if (txHash) updateData.txHash = txHash;

      // Transition to PENDING_REVIEW if previously PENDING_PAYMENT
      const shouldAdvance = existingOrder.status === "PENDING_PAYMENT" && (proofImageUrl || txHash);
      if (shouldAdvance) {
        updateData.status = "PENDING_REVIEW";
      }

      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id: params.id },
          data: updateData,
        });

        if (shouldAdvance) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: params.id,
              fromStatus: existingOrder.status,
              toStatus: "PENDING_REVIEW",
              note: "Payment details / proof uploaded by user",
              changedBy: session?.user?.id || "USER",
            },
          });
        }
        return ord;
      });

      // Send telegram alert if proof uploaded
      try {
        if (shouldAdvance) {
          await sendNewOrderNotification(updated);
        }
      } catch (err) {
        console.warn("Telegram notify failed:", err);
      }

      return NextResponse.json(updated);
    }

    // Admin updates are strictly routed to /api/admin/orders/[id]
    return NextResponse.json(
      { error: "Use administrative routes for admin management" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
