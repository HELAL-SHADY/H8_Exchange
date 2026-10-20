import nodemailer from "nodemailer";

interface SendResetEmailParams {
  toEmail: string;
  code: string;
}

export async function sendPasswordResetEmail({
  toEmail,
  code,
}: SendResetEmailParams): Promise<{ success: boolean; error?: string }> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  // Always log the code to console so local testing / dev environment is seamless
  console.log("==================================================");
  console.log(`🔑 [H8 Exchange] PASSWORD RESET CODE for: ${toEmail}`);
  console.log(`🔢 Code: [ ${code} ]`);
  console.log(`⏳ Valid for 15 minutes`);
  console.log("==================================================");

  // Check if SMTP credentials are placeholders or not configured
  const isPlaceholder =
    !user ||
    !pass ||
    user === "your-email@gmail.com" ||
    pass === "your-app-password";

  if (isPlaceholder) {
    console.warn(
      "⚠️ SMTP credentials are not set or are using default placeholders in .env. Email simulated in console."
    );
    // In dev / unconfigured mode, consider it succeeded so user can use the code printed in console
    return { success: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>استعادة كلمة المرور - H8 Exchange</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 500px; background-color: #1A1A1A; border: 1px solid #2D2D2D; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #F5B942; letter-spacing: 1px;">
                H8 Exchange
              </h1>
              <p style="margin: 6px 0 0; color: #888888; font-size: 14px;">
                منصة تداول العملات الرقمية
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #2D2D2D; padding-bottom: 24px;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="text-align: right; direction: rtl;">
              <h2 style="margin: 0 0 12px; color: #FFFFFF; font-size: 20px;">
                طلب استعادة كلمة المرور
              </h2>
              <p style="margin: 0 0 20px; color: #B3B3B3; font-size: 15px; line-height: 1.6;">
                مرحباً، لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك المسجل بهذا البريد. استخدم كود التحقق التالي لإتمام العملية:
              </p>

              <!-- Code Box -->
              <div style="background: linear-gradient(135deg, rgba(245, 185, 66, 0.1) 0%, rgba(230, 164, 48, 0.05) 100%); border: 1px dashed #F5B942; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #F5B942; display: inline-block; font-family: monospace;">
                  ${code}
                </span>
              </div>

              <p style="margin: 0 0 12px; color: #888888; font-size: 13px; line-height: 1.5;">
                ⏱️ <b>ملاحظة:</b> هذا الكود صالح لمدة <b>15 دقيقة</b> فقط من تاريخ الإرسال.
              </p>
              <p style="margin: 0 0 24px; color: #888888; font-size: 13px; line-height: 1.5;">
                🔒 لا تشارك هذا الكود مع أي شخص لحماية أمان حسابك. إذا لم تكن أنت من طلب هذا الرمز، يمكنك تجاهل هذه الرسالة ولن يتم إجراء أي تغيير على حسابك.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #2D2D2D; padding-top: 20px; text-align: center;">
              <p style="margin: 0; color: #555555; font-size: 12px;">
                © ${new Date().getFullYear()} H8 Exchange. جميع الحقوق محفوظة.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"H8 Exchange" <${user}>`,
      to: toEmail,
      subject: `كود التحقق لإعادة تعيين كلمة المرور: ${code}`,
      text: `كود التحقق الخاص بك في H8 Exchange هو: ${code}. هذا الكود صالح لمدة 15 دقيقة.`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to send reset email:", err);
    // Still return success in development if email fails so testing is not blocked, but note the error
    return {
      success: process.env.NODE_ENV !== "production",
      error: err.message || "Failed to send email",
    };
  }
}
