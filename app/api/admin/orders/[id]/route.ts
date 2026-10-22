import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendOrderStatusNotification } from "@/lib/telegram";
import { sendOrderCompletedEmail } from "@/lib/email";

async function checkAdminRole(session: any) {
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
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
    const session: any = await getServerSession(authOptions as any);

    if (!await checkAdminRole(session)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { action, adminNote } = await request.json();

    if (!["APPROVE", "REJECT", "COMPLETE"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    let newStatus: any;
    switch (action) {
      case "APPROVE":
        newStatus = "APPROVED";
        break;
      case "REJECT":
        newStatus = "REJECTED";
        break;
      case "COMPLETE":
        newStatus = "COMPLETED";
        break;
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

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        adminNote,
        approvedBy: action === "APPROVE" ? (session.user as any).id : existingOrder.approvedBy,
        approvedAt: action === "APPROVE" ? new Date() : existingOrder.approvedAt,
        rejectedAt: action === "REJECT" ? new Date() : existingOrder.rejectedAt,
        completedAt: action === "COMPLETE" ? new Date() : existingOrder.completedAt,
      },
      include: {
        user: true,
      },
    });

    // Create notification for user in Arabic
    const formattedTitle =
      action === "COMPLETE"
        ? "🎉 تم إكمال طلبك بنجاح"
        : action === "APPROVE"
        ? "✅ تم قبول طلبك"
        : "❌ تم رفض طلبك";

    const isBuy = order.type === "BUY";
    const formattedMessage =
      action === "COMPLETE"
        ? (adminNote ||
          (isBuy
            ? `تم إرسال ${order.amount} USDT إلى حسابك بنجاح. شكراً لتعاملك مع H8 Exchange!`
            : `تم تحويل ${order.amount} ج.م إلى محفظتك بنجاح. شكراً لتعاملك مع H8 Exchange!`))
        : action === "APPROVE"
        ? (adminNote || "تمت الموافقة على طلبك بنجاح وهو الآن في مرحلة التنفيذ والتحويل.")
        : (adminNote || "تم رفض طلبك. يرجى مراجعة التفاصيل أو التواصل مع الدعم الفني.");

    await prisma.notification.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        type:
          action === "APPROVE"
            ? "ORDER_APPROVED"
            : action === "REJECT"
            ? "ORDER_REJECTED"
            : "ORDER_COMPLETED",
        title: formattedTitle,
        message: formattedMessage,
        actionUrl: `/track?id=${order.id}`,
      },
    });

    // Send Email to user on order completion
    if (action === "COMPLETE" && order.user?.email) {
      try {
        await sendOrderCompletedEmail({
          toEmail: order.user.email,
          userName: order.user.name || order.fullName,
          orderId: order.id,
          orderType: order.type,
          amount: order.amount,
          paymentMethod: order.paymentMethod,
          receiveMethod: order.receiveMethod,
          walletNumber: order.walletNumber,
          binanceUid: order.binanceUid,
          adminNote: adminNote || null,
        });
      } catch (emailErr) {
        console.error("Failed to send order completed email to user:", emailErr);
      }
    }

    // Send Telegram Notification to Admin
    try {
      await sendOrderStatusNotification(order, existingOrder.status);
    } catch (telegramError) {
      console.error("Failed to send Telegram order status update notification:", telegramError);
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        orderId: order.id,
        actionType:
          action === "APPROVE"
            ? "APPROVE_ORDER"
            : action === "REJECT"
            ? "REJECT_ORDER"
            : "MARK_COMPLETED",
        actionDescription: `Admin ${action.toLowerCase()} order ${params.id}. Note: ${adminNote || "None"}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
