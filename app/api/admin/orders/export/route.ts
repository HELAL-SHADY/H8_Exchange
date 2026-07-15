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

const methodLabels: Record<string, string> = {
  VODAFONE_CASH: "Vodafone Cash",
  INSTAPAY: "InstaPay",
  BINANCE_PAY: "Binance Pay",
  BYBIT_PAY: "Bybit Pay",
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "في انتظار الدفع",
  PENDING_REVIEW: "قيد المراجعة",
  UNDER_VERIFICATION: "التحقق جاري",
  APPROVED: "معتمد",
  REJECTED: "مرفوض",
  COMPLETED: "مكتمل",
};

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return "";
  let str = String(val);
  // Double quotes escape in CSV is done by duplicating them
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!await checkAdminRole(session)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Log the audit log action
    try {
      await prisma.auditLog.create({
        data: {
          userId: (session.user as any).id,
          actionType: "EXPORT_ORDERS",
          actionDescription: `تم تصدير الطلبات إلى Excel (${orders.length} طلب). الفلاتر: الحالة=${status || "الكل"}، النوع=${type || "الكل"}.`,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      });
    } catch (auditError) {
      console.error("Failed to write audit log for export:", auditError);
    }

    // CSV Headers (in Arabic for admin clarity)
    const headers = [
      "معرف الطلب",
      "تاريخ الطلب",
      "العميل (الحساب)",
      "البريد الإلكتروني",
      "نوع العملية",
      "القيمة",
      "طريقة الدفع/الإرسال",
      "طريقة الاستلام",
      "الاسم الكامل للتحويل",
      "الهاتف",
      "معرف بينانس",
      "المحفظة / الرقم المرسل منه",
      "الحالة",
      "ملاحظة المسؤول",
    ];

    const rows = orders.map((order) => {
      const formattedDate = new Date(order.createdAt).toLocaleString("ar-EG", {
        timeZone: "Asia/Cairo",
      });
      return [
        order.id,
        formattedDate,
        order.user.name,
        order.user.email,
        order.type === "BUY" ? "شراء" : "بيع",
        order.amount,
        order.paymentMethod ? methodLabels[order.paymentMethod] || order.paymentMethod : "—",
        order.receiveMethod ? methodLabels[order.receiveMethod] || order.receiveMethod : "—",
        order.fullName,
        order.phone,
        order.binanceUid,
        order.walletNumber,
        statusLabels[order.status] || order.status,
        order.adminNote || "",
      ];
    });

    // Build CSV with commas
    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // Add UTF-8 BOM so Excel opens Arabic correctly
    const BOM = "\uFEFF";
    const filename = `orders_export_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(BOM + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export orders" },
      { status: 500 }
    );
  }
}
