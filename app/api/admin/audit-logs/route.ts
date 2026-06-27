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
    const session: any = await getServerSession(authOptions as any);

    if (!await checkAdminRole(session)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const actionType = searchParams.get("actionType");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (actionType) where.actionType = actionType;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.auditLog.count({ where });

    // Get activity summary
    const totalAdminActions = await prisma.auditLog.count({
      where: {
        actionType: {
          in: [
            "ADMIN_LOGIN",
            "APPROVE_ORDER",
            "REJECT_ORDER",
            "MARK_COMPLETED",
            "EDIT_EXCHANGE_RATES",
            "UPDATE_SETTINGS",
          ],
        },
      },
    });

    const totalUserActions = await prisma.auditLog.count({
      where: {
        actionType: {
          in: [
            "USER_REGISTRATION",
            "USER_LOGIN",
            "CREATE_BUY_ORDER",
            "CREATE_SELL_ORDER",
            "UPLOAD_PROOF",
            "SUBMIT_REVIEW",
          ],
        },
      },
    });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalAdminActions,
        totalUserActions,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

