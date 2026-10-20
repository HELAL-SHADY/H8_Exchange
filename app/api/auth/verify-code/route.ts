import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكود التحقق مطلوبان" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // Find token matching email and code
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        token: cleanCode,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "كود التحقق غير صحيح" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(tokenRecord.expiresAt)) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: tokenRecord.id },
      });

      return NextResponse.json(
        { error: "انتهت صلاحية كود التحقق، يرجى طلب كود جديد" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "تم التحقق من الكود بنجاح",
        valid: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء التحقق من الكود" },
      { status: 500 }
    );
  }
}
