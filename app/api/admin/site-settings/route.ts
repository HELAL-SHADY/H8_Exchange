import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function checkAdminRole(session: any) {
  if (
    !session?.user ||
    !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)
  ) {
    return false;
  }
  return true;
}

// GET - جلب إعدادات الموقع (متاح للجميع لعرض أرقام الدفع وحالة الصيانة)
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          binanceUid: "",
          vodafoneCashNumber: "",
          instapayNumber: "",
          usdtBep20Address: "",
          telegramUsername: "",
          supportEmail: "",
          announcement: "",
          buyEnabled: true,
          sellEnabled: true,
          instapayEnabled: true,
          vodafoneEnabled: true,
          binanceEnabled: true,
          bep20Enabled: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - تحديث إعدادات الموقع (للأدمن فقط)
export async function PUT(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!(await checkAdminRole(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      binanceUid,
      vodafoneCashNumber,
      instapayNumber,
      usdtBep20Address,
      telegramUsername,
      supportEmail,
      announcement,
      buyEnabled,
      sellEnabled,
      instapayEnabled,
      vodafoneEnabled,
      binanceEnabled,
      bep20Enabled,
    } = body;

    const existing = await prisma.siteSettings.findFirst();

    let updated;
    if (existing) {
      updated = await prisma.siteSettings.update({
        where: { id: existing.id },
        data: {
          ...(binanceUid !== undefined && { binanceUid }),
          ...(vodafoneCashNumber !== undefined && { vodafoneCashNumber }),
          ...(instapayNumber !== undefined && { instapayNumber }),
          ...(usdtBep20Address !== undefined && { usdtBep20Address }),
          ...(telegramUsername !== undefined && { telegramUsername }),
          ...(supportEmail !== undefined && { supportEmail }),
          ...(announcement !== undefined && { announcement }),
          ...(buyEnabled !== undefined && { buyEnabled }),
          ...(sellEnabled !== undefined && { sellEnabled }),
          ...(instapayEnabled !== undefined && { instapayEnabled }),
          ...(vodafoneEnabled !== undefined && { vodafoneEnabled }),
          ...(binanceEnabled !== undefined && { binanceEnabled }),
          ...(bep20Enabled !== undefined && { bep20Enabled }),
        },
      });
    } else {
      updated = await prisma.siteSettings.create({
        data: {
          binanceUid: binanceUid || "",
          vodafoneCashNumber: vodafoneCashNumber || "",
          instapayNumber: instapayNumber || "",
          usdtBep20Address: usdtBep20Address || "",
          telegramUsername: telegramUsername || "",
          supportEmail: supportEmail || "",
          announcement: announcement || "",
          buyEnabled: buyEnabled ?? true,
          sellEnabled: sellEnabled ?? true,
          instapayEnabled: instapayEnabled ?? true,
          vodafoneEnabled: vodafoneEnabled ?? true,
          binanceEnabled: binanceEnabled ?? true,
          bep20Enabled: bep20Enabled ?? true,
        },
      });
    }

    // تسجيل العملية في السجل
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        actionType: "UPDATE_SETTINGS",
        actionDescription: `تم تحديث إعدادات الموقع`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating site settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
