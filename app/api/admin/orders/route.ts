import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function checkAdminRole(session: any) {
  if (
    !session?.user ||
    !["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes((session.user as any).role)
  ) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;

    if (!(await checkAdminRole(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status === "UNDER_VERIFICATION"
        ? { in: ["UNDER_VERIFICATION", "PENDING_REVIEW", "APPROVED"] }
        : status;
    }
    if (type && type !== "ALL") where.type = type;
    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { binanceUid: { contains: search, mode: "insensitive" } },
        { walletNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isVerified: true,
            },
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          reviews: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    const visibleOrders = orders.map(({ txHash, ...order }) => ({
      ...order,
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
    }));

    return NextResponse.json({
      orders: visibleOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
