import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: any
) {
  const { params } = context;
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        order: true,
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(session.user.role);
    if (!isStaff && ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: any
) {
  const { params } = context;
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(session.user.role);
    if (!isStaff && ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { message, status } = await request.json();

    if (status && isStaff) {
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: { status },
      });
    }

    if (message && message.trim()) {
      const newMsg = await prisma.supportMessage.create({
        data: {
          ticketId: params.id,
          senderId: session.user.id,
          message: message.trim(),
          isAdmin: isStaff,
        },
        include: {
          sender: { select: { name: true, role: true } },
        },
      });

      // Update ticket updated timestamp and set status accordingly
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: {
          updatedAt: new Date(),
          status: isStaff ? "WAITING_USER" : "IN_PROGRESS",
        },
      });

      // If staff responded, send notification to user
      if (isStaff && ticket.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: ticket.userId,
            type: "TICKET_REPLY",
            title: "رد جديد على تذكرتك",
            message: `قام فريق الدعم بالرد على التذكرة #${ticket.ticketNumber}`,
            actionUrl: `/dashboard/support/${ticket.id}`,
          },
        });
      }

      return NextResponse.json(newMsg, { status: 201 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
