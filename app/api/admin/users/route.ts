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

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!(await checkAdminRole(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            supportTickets: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!(await checkAdminRole(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId, isBanned, isVerified, role } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Only SUPER_ADMIN can change user roles
    if (role && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "تغيير رتب وصلاحيات المستخدمين متاح فقط للـ Super Admin" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (role !== undefined) updateData.role = role;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
