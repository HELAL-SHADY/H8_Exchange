import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
        order: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.review.count();

    const avgRating = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      avgRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId, rating, comment } = await request.json();

    if (!orderId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if order belongs to user and is completed
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Order not found or does not belong to user" },
        { status: 404 }
      );
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed orders" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_orderId: {
          userId: (session.user as any).id,
          orderId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this order" },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: (session.user as any).id,
        orderId,
        rating,
        comment,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        orderId,
        actionType: "SUBMIT_REVIEW",
        actionDescription: `User submitted review with rating ${rating} for order ${orderId}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

