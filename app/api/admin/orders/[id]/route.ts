import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendOrderStatusNotification } from "@/lib/telegram";

async function checkAdminRole(session: any) {
  if (
    !session?.user ||
    !["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes((session.user as any).role)
  ) {
    return false;
  }
  return true;
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  const { params } = context;
  try {
    const session = (await getServerSession(authOptions as any)) as any;

    if (!(await checkAdminRole(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, adminNote, rejectionReason, txHash } = await request.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Role boundary: Support Agent can view and add notes, but cannot approve/complete/reject financial state
    const isFullAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
    if (!isFullAdmin && ["APPROVE", "COMPLETE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "موظف الدعم الفني غير مصرح له بتغيير الحالة المالية للطلب" },
        { status: 403 }
      );
    }

    let newStatus: any = existingOrder.status;
    const now = new Date();
    const updateData: any = {
      adminNote: adminNote !== undefined ? adminNote : existingOrder.adminNote,
    };

    if (txHash) {
      updateData.txHash = txHash;
    }

    switch (action) {
      case "APPROVE":
        newStatus = "APPROVED";
        updateData.status = newStatus;
        updateData.approvedBy = session.user.id;
        updateData.approvedAt = now;
        break;
      case "REJECT":
        newStatus = "REJECTED";
        updateData.status = newStatus;
        updateData.rejectionReason = rejectionReason || adminNote || "لم يتم استيفاء شروط العملية";
        updateData.rejectedAt = now;
        break;
      case "COMPLETE":
        newStatus = "COMPLETED";
        updateData.status = newStatus;
        updateData.completedAt = now;
        break;
      case "VERIFY":
        newStatus = "UNDER_VERIFICATION";
        updateData.status = newStatus;
        break;
      case "NOTE_ONLY":
        // Only update adminNote
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: params.id },
        data: updateData,
        include: { user: true },
      });

      if (action !== "NOTE_ONLY" && newStatus !== existingOrder.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: ord.id,
            fromStatus: existingOrder.status,
            toStatus: newStatus,
            note: adminNote || rejectionReason || `Order status updated to ${newStatus}`,
            changedBy: session.user.id,
          },
        });

        // User in-app notification
        const titleMap: any = {
          APPROVED: "✅ تمت الموافقة على طلبك",
          COMPLETED: "🎉 تم تنفيذ طلبك بنجاح",
          REJECTED: "❌ تم رفض طلبك",
          UNDER_VERIFICATION: "🔍 طلبك قيد الفحص والتحقق المصرفي",
        };

        await tx.notification.create({
          data: {
            userId: ord.userId,
            orderId: ord.id,
            type:
              newStatus === "COMPLETED"
                ? "ORDER_COMPLETED"
                : newStatus === "REJECTED"
                ? "ORDER_REJECTED"
                : "ORDER_APPROVED",
            title: titleMap[newStatus] || "تحديث على حالة طلبك",
            message:
              rejectionReason ||
              adminNote ||
              `تغيرت حالة الطلب رقم ${ord.orderNumber || ord.id} إلى ${newStatus}`,
            actionUrl: `/dashboard/orders/${ord.id}`,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            orderId: ord.id,
            actionType:
              newStatus === "COMPLETED"
                ? "MARK_COMPLETED"
                : newStatus === "REJECTED"
                ? "REJECT_ORDER"
                : "APPROVE_ORDER",
            actionDescription: `Admin ${session.user.name} changed status of ${ord.orderNumber || ord.id} to ${newStatus}`,
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          },
        });
      }

      return ord;
    });

    // Notify Telegram channel
    try {
      await sendOrderStatusNotification(updatedOrder, newStatus);
    } catch (e) {
      console.warn("Telegram status alert failed:", e);
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
