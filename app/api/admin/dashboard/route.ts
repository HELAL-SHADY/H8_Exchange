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

    // Dashboard statistics
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING_REVIEW" },
    });
    const approvedOrders = await prisma.order.count({
      where: { status: "APPROVED" },
    });
    const rejectedOrders = await prisma.order.count({
      where: { status: "REJECTED" },
    });
    const completedOrders = await prisma.order.count({
      where: { status: "COMPLETED" },
    });

    const totalUsers = await prisma.user.count();

    const successRate =
      totalOrders > 0
        ? Math.round((completedOrders / totalOrders) * 100)
        : 0;

    // Calculate total volume
    const totalVolumeData = await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "COMPLETED",
      },
    });

    const totalVolume = totalVolumeData._sum.amount || 0;

    // Get average rating
    const averageRatingData = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });

    const averageRating = averageRatingData._avg.rating || 0;

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        approvedOrders,
        rejectedOrders,
        completedOrders,
        totalUsers,
        successRate,
        totalVolume,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

