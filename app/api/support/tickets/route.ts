import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(session.user.role);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (!isStaff) {
      where.userId = session.user.id;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        order: { select: { id: true, orderNumber: true, type: true, amount: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, category, priority, message, orderId } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "عنوان التذكرة والرسالة مطلوبين" },
        { status: 400 }
      );
    }

    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketNumber = `TKT-${yy}${mm}-${rand}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: session.user.id,
        orderId: orderId || null,
        subject,
        category: category || "GENERAL",
        priority: priority || "MEDIUM",
        messages: {
          create: {
            senderId: session.user.id,
            message,
            isAdmin: false,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
