import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.count({
      where: { status: "COMPLETED" },
    });

    const totalUsers = await prisma.user.count();

    const successRate =
      totalOrders > 0
        ? Math.round((completedOrders / totalOrders) * 100)
        : 0;

    // Get average rating from reviews
    const averageRatingData = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });

    const averageRating = averageRatingData._avg.rating || 0;

    return NextResponse.json({
      stats: {
        completedOrders,
        totalUsers,
        successRate,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error: any) {
    console.error("Error fetching public stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
