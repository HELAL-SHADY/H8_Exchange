import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // Verify token validity
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        token: cleanCode,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "كود التحقق غير صحيح أو غير متطابق" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(tokenRecord.expiresAt)) {
      await prisma.passwordResetToken.delete({
        where: { id: tokenRecord.id },
      });
      return NextResponse.json(
        { error: "انتهت صلاحية كود التحقق، يرجى طلب كود جديد" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Delete all reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Log the audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: "PASSWORD_RESET",
        actionDescription: `User ${user.name} (${user.email}) successfully reset their password`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json(
      {
        message: "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error.message || "فشل إعادة تعيين كلمة المرور" },
      { status: 500 }
    );
  }
}
