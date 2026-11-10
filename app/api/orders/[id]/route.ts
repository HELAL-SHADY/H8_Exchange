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

    if (session?.user?.id) {
      const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(session.user.role);
      if (!isStaff && order.userId !== session.user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const { txHash, ...visibleOrder } = order;
    return NextResponse.json({
      ...visibleOrder,
      status: ["PENDING_REVIEW", "APPROVED"].includes(order.status)
        ? "UNDER_VERIFICATION"
        : order.status,
      statusHistory: order.statusHistory.map((history) => ({
        ...history,
        fromStatus: ["PENDING_REVIEW", "APPROVED"].includes(history.fromStatus || "")
          ? "UNDER_VERIFICATION"
          : history.fromStatus,
        toStatus: ["PENDING_REVIEW", "APPROVED"].includes(history.toStatus)
          ? "UNDER_VERIFICATION"
          : history.toStatus,
      })),
    });
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isStaff = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);

    // If caller is authenticated as another non-admin user, deny access
    if (!isStaff && existingOrder.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { proofImageUrl, proofImageId, action } = body;

    // Handle user cancellation (Allowed for order owner, regardless of role)
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
      const { txHash: omittedTxHash, ...visibleOrder } = updated;
      return NextResponse.json(visibleOrder);
    }

    // Handle user submitting payment proof
    if (proofImageUrl || proofImageId) {
      if (["COMPLETED", "REJECTED"].includes(existingOrder.status)) {
        return NextResponse.json(
          { error: "لا يمكن تعديل هذا الطلب نظراً لاكتماله أو رفضه" },
          { status: 400 }
        );
      }

      const updateData: any = {};
      if (proofImageUrl) updateData.proofImageUrl = proofImageUrl;
      if (proofImageId) updateData.proofImageId = proofImageId;

      const shouldAdvance = ["PENDING_PAYMENT", "PENDING_REVIEW", "APPROVED"].includes(existingOrder.status);
      if (shouldAdvance) {
        updateData.status = "UNDER_VERIFICATION";
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
              toStatus: "UNDER_VERIFICATION",
              note: "Payment proof uploaded by user; bank verification started",
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

      const { txHash: omittedTxHash, ...visibleOrder } = updated;
      return NextResponse.json({
        ...visibleOrder,
        status: ["PENDING_REVIEW", "APPROVED"].includes(updated.status)
          ? "UNDER_VERIFICATION"
          : updated.status,
      });
    }

    // Any other arbitrary update without proof or cancel is rejected
    return NextResponse.json(
      { error: "Invalid action or missing required parameters" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
