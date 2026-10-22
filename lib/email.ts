import nodemailer from "nodemailer";

interface SendResetEmailParams {
  toEmail: string;
  code: string;
}

export interface SendOrderCompletedEmailParams {
  toEmail: string;
  userName?: string | null;
  orderId: string;
  orderType: "BUY" | "SELL";
  amount: number;
  paymentMethod?: string | null;
  receiveMethod?: string | null;
  walletNumber?: string | null;
  binanceUid?: string | null;
  adminNote?: string | null;
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  const isPlaceholder =
    !user ||
    !pass ||
    user === "your-email@gmail.com" ||
    pass === "your-app-password";

  if (isPlaceholder) {
    return null;
  }

  const isGmail = host.toLowerCase().includes("gmail");
  const transporter = nodemailer.createTransport(
    isGmail
      ? {
          service: "gmail",
          auth: {
            user,
            pass,
          },
        }
      : {
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
        }
  );

  return { transporter, user };
}

function formatMethodLabel(method?: string | null): string {
  if (!method) return "—";
  switch (method) {
    case "VODAFONE_CASH":
      return "فودافون كاش (Vodafone Cash)";
    case "INSTAPAY":
      return "انستاباي (InstaPay)";
    case "BINANCE_PAY":
      return "بينانس باي (Binance Pay)";
    case "BYBIT_PAY":
      return "باي بيت باي (Bybit Pay)";
    default:
      return method;
  }
}

export async function sendPasswordResetEmail({
  toEmail,
  code,
}: SendResetEmailParams): Promise<{ success: boolean; error?: string }> {
  // Always log the code to console so local testing / dev environment is seamless
  console.log("==================================================");
  console.log(`🔑 [H8 Exchange] PASSWORD RESET CODE for: ${toEmail}`);
  console.log(`🔢 Code: [ ${code} ]`);
  console.log(`⏳ Valid for 15 minutes`);
  console.log("==================================================");

  const mailConfig = getMailTransporter();

  if (!mailConfig) {
    console.warn(
      "⚠️ SMTP credentials are not set or are using default placeholders in .env. Email simulated in console."
    );
    // In dev / unconfigured mode, consider it succeeded so user can use the code printed in console
    return { success: true };
  }

  try {
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

    await mailConfig.transporter.sendMail({
      from: `"H8 Exchange" <${mailConfig.user}>`,
      to: toEmail,
      subject: `كود التحقق لإعادة تعيين كلمة المرور: ${code}`,
      text: `كود التحقق الخاص بك في H8 Exchange هو: ${code}. هذا الكود صالح لمدة 15 دقيقة.`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to send reset email:", err);
    return {
      success: process.env.NODE_ENV !== "production",
      error: err.message || "Failed to send email",
    };
  }
}

/**
 * Sends a notification email to the user when their order is completed
 */
export async function sendOrderCompletedEmail({
  toEmail,
  userName,
  orderId,
  orderType,
  amount,
  receiveMethod,
  walletNumber,
  binanceUid,
  adminNote,
}: SendOrderCompletedEmailParams): Promise<{ success: boolean; error?: string }> {
  console.log("==================================================");
  console.log(`🎉 [H8 Exchange] ORDER COMPLETED NOTIFICATION for: ${toEmail}`);
  console.log(`📌 Order ID: ${orderId} | Type: ${orderType} | Amount: ${amount}`);
  console.log("==================================================");

  const mailConfig = getMailTransporter();

  if (!mailConfig) {
    console.warn("⚠️ SMTP credentials not configured. Order completed email simulated in console.");
    return { success: true };
  }

  try {
    const isBuy = orderType === "BUY";
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://h8exchange.com").replace(/\/$/, "");
    const trackUrl = `${appUrl}/track?id=${orderId}`;
    const targetAccount = isBuy
      ? (binanceUid ? `Binance UID: ${binanceUid}` : walletNumber ? `المحفظة: ${walletNumber}` : null)
      : (walletNumber ? `المحفظة: ${walletNumber}` : binanceUid ? `UID: ${binanceUid}` : null);

    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>تم إكمال طلبك بنجاح - H8 Exchange</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #141414; border: 1px solid #2D2D2D; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
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
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; background: rgba(34, 197, 94, 0.15); border: 2px solid #22C55E; font-size: 32px; color: #22C55E;">
                  ✓
                </span>
              </div>
              <h2 style="margin: 0 0 12px; color: #22C55E; font-size: 22px; text-align: center;">
                تهانينا! تم إكمال طلبك بنجاح 🎉
              </h2>
              <p style="margin: 0 0 20px; color: #CCCCCC; font-size: 15px; line-height: 1.7; text-align: center;">
                مرحباً <b>${userName || "عميلنا العزيز"}</b>، يسعدنا إبلاغك بأنه تم تنفيذ وتأكيد طلبك بنجاح من قبل فريق العمليات.
              </p>

              <!-- Order Details Card -->
              <div style="background-color: #1A1A1A; border: 1px solid #2D2D2D; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <table width="100%" style="border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 10px 0; color: #888888; text-align: right;">رقم الطلب:</td>
                    <td style="padding: 10px 0; color: #F5B942; font-weight: bold; font-family: monospace; text-align: left;">#${orderId.slice(-8).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #888888; text-align: right; border-top: 1px solid #262626;">نوع المعاملة:</td>
                    <td style="padding: 10px 0; color: #FFFFFF; font-weight: bold; text-align: left;">${isBuy ? "🟢 شراء USDT" : "🔴 بيع USDT"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #888888; text-align: right; border-top: 1px solid #262626;">المبلغ المنفذ:</td>
                    <td style="padding: 10px 0; color: #22C55E; font-weight: bold; font-size: 16px; text-align: left;">${amount} ${isBuy ? "USDT" : "ج.م"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #888888; text-align: right; border-top: 1px solid #262626;">طريقة الاستلام:</td>
                    <td style="padding: 10px 0; color: #FFFFFF; text-align: left;">${formatMethodLabel(receiveMethod)}</td>
                  </tr>
                  ${
                    targetAccount
                      ? `
                  <tr>
                    <td style="padding: 10px 0; color: #888888; text-align: right; border-top: 1px solid #262626;">بيانات الاستلام:</td>
                    <td style="padding: 10px 0; color: #FFFFFF; font-family: monospace; text-align: left;">${targetAccount}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    adminNote
                      ? `
                  <tr>
                    <td style="padding: 10px 0; color: #888888; text-align: right; border-top: 1px solid #262626;">ملاحظات الإدارة:</td>
                    <td style="padding: 10px 0; color: #F5B942; text-align: left;">${adminNote}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${trackUrl}" style="display: inline-block; background: linear-gradient(135deg, #F5B942 0%, #E6A430 100%); color: #0A0A0A; font-weight: bold; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 15px rgba(245, 185, 66, 0.3);">
                  تتبع الطلب وكتابة تقييم ⭐
                </a>
              </div>

              <p style="margin: 0; color: #888888; font-size: 13px; line-height: 1.6; text-align: center;">
                رأيك يهمنا دائماً! نسعد بمشاركتك لتجربتك عبر تقييم الخدمة لمساعدتنا في تقديم الأفضل دائماً.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #2D2D2D; padding-top: 20px; margin-top: 24px; text-align: center;">
              <p style="margin: 0 0 6px; color: #666666; font-size: 12px;">
                لأي استفسارات أو دعم، تواصل معنا عبر تيليجرام: 
                <a href="https://t.me/HELAL_SHADY" style="color: #F5B942; text-decoration: none;">@HELAL_SHADY</a>
              </p>
              <p style="margin: 0; color: #444444; font-size: 11px;">
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

    const subject = `🎉 تم إكمال طلبك رقم #${orderId.slice(-8).toUpperCase()} بنجاح | H8 Exchange`;
    const text = `مرحباً ${userName || "عميلنا العزيز"}، يسعدنا إبلاغك بأنه تم تنفيذ طلبك رقم #${orderId.slice(-8).toUpperCase()} بقيمة ${amount} ${isBuy ? "USDT" : "ج.م"} بنجاح. يمكنك متابعة الطلب وكتابة تقييم عبر: ${trackUrl}`;

    await mailConfig.transporter.sendMail({
      from: `"H8 Exchange" <${mailConfig.user}>`,
      to: toEmail,
      subject,
      text,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to send order completed email:", err);
    return {
      success: false,
      error: err.message || "Failed to send email",
    };
  }
}
