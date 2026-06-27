const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Sends a text message to the configured Telegram group
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("Telegram bot token or chat ID is missing in environment variables.");
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Failed to send Telegram message: ${response.status} - ${errText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

/**
 * Sends a photo with a caption to the configured Telegram group
 */
export async function sendTelegramPhoto(photoUrl: string, caption: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("Telegram bot token or chat ID is missing in environment variables.");
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        photo: photoUrl,
        caption: caption,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Failed to send Telegram photo: ${response.status} - ${errText}`);
      // Fallback to sending as a normal message with photo link if sendPhoto fails
      const fallbackText = `${caption}\n\n🖼️ <b>رابط إثبات الدفع:</b> <a href="${photoUrl}">اضغط هنا لمشاهدة الإثبات</a>`;
      return sendTelegramMessage(fallbackText);
    }

    return true;
  } catch (error) {
    console.error("Error sending Telegram photo:", error);
    // Fallback to text message
    const fallbackText = `${caption}\n\n🖼️ <b>رابط إثبات الدفع:</b> <a href="${photoUrl}">اضغط هنا لمشاهدة الإثبات</a>`;
    return sendTelegramMessage(fallbackText);
  }
}

/**
 * Helper to translate order status to user-friendly Arabic/English text
 */
function formatStatus(status: string): string {
  switch (status) {
    case "PENDING_REVIEW":
      return "⏳ قيد المراجعة (Pending Review)";
    case "UNDER_VERIFICATION":
      return "🔍 قيد التحقق (Under Verification)";
    case "APPROVED":
      return "✅ تم القبول (Approved)";
    case "REJECTED":
      return "❌ تم الرفض (Rejected)";
    case "COMPLETED":
      return "🎉 تم الاكتمال (Completed)";
    default:
      return status;
  }
}

/**
 * Sends a notification when a new order is submitted
 */
export async function sendNewOrderNotification(order: any): Promise<boolean> {
  const isBuy = order.type === "BUY";
  const typeText = isBuy ? "🟢 شراء (BUY)" : "🔴 بيع (SELL)";
  const currency = isBuy ? "EGP" : "USDT";

  const message = [
    `<b>🆕 طلب جديد تم إنشاؤه (${typeText})</b>`,
    `--------------------------------------------`,
    `<b>📌 رقم الطلب:</b> <code>${order.id}</code>`,
    `<b>👤 العميل:</b> ${order.fullName}`,
    `<b>📞 رقم الهاتف:</b> <code>${order.phone}</code>`,
    `<b>💰 القيمة:</b> <b>${order.amount} ${currency}</b>`,
    `<b>💳 Binance UID:</b> <code>${order.binanceUid}</code>`,
    `<b>👛 رقم المحفظة:</b> <code>${order.walletNumber}</code>`,
    `<b>📅 التاريخ:</b> ${new Date(order.createdAt || Date.now()).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" })}`,
    `--------------------------------------------`,
    `💻 <i>يرجى التوجه إلى لوحة التحكم لمراجعة الطلب.</i>`
  ].join("\n");

  if (order.proofImageUrl) {
    return sendTelegramPhoto(order.proofImageUrl, message);
  }

  return sendTelegramMessage(message);
}

/**
 * Sends a notification when an order status is updated
 */
export async function sendOrderStatusNotification(order: any, oldStatus?: string): Promise<boolean> {
  const isBuy = order.type === "BUY";
  const typeText = isBuy ? "🟢 شراء (BUY)" : "🔴 بيع (SELL)";
  const currency = isBuy ? "EGP" : "USDT";

  const message = [
    `<b>🔄 تحديث حالة الطلب (${typeText})</b>`,
    `--------------------------------------------`,
    `<b>📌 رقم الطلب:</b> <code>${order.id}</code>`,
    `<b>👤 العميل:</b> ${order.fullName}`,
    `<b>💰 القيمة:</b> <b>${order.amount} ${currency}</b>`,
    oldStatus ? `<b>🟡 الحالة السابقة:</b> ${formatStatus(oldStatus)}` : "",
    `<b>🟢 الحالة الجديدة:</b> ${formatStatus(order.status)}`,
    order.adminNote ? `<b>📝 ملاحظة الإدارة:</b> ${order.adminNote}` : "",
    `<b>📅 تاريخ التحديث:</b> ${new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo" })}`,
    `--------------------------------------------`
  ].filter(Boolean).join("\n");

  if (order.proofImageUrl && order.status === "UNDER_VERIFICATION") {
    // If user uploaded proof and status changed to verification
    return sendTelegramPhoto(order.proofImageUrl, message);
  }

  return sendTelegramMessage(message);
}
