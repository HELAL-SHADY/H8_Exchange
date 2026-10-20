import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "الرجاء إدخال البريد الإلكتروني" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني" },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "هذا الحساب محظور، يرجى التواصل مع الدعم الفني" },
        { status: 403 }
      );
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Remove any previous active tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token: code,
        expiresAt,
      },
    });

    // Send email
    const emailResult = await sendPasswordResetEmail({
      toEmail: normalizedEmail,
      code,
    });

    if (!emailResult.success) {
      console.warn("Email sending returned warning/error:", emailResult.error);
    }

    return NextResponse.json(
      {
        message: "تم إرسال كود التحقق بنجاح إلى بريدك الإلكتروني",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}
