/**
 * Generates an auditable, human-readable unique order number.
 * Format: H8-{TYPE}-{YEAR_MOD}{MONTH}{DAY}-{RANDOM}
 * Example: H8-BUY-261109-7X29
 */
export function generateOrderNumber(type: "BUY" | "SELL"): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `H8-${type}-${yy}${mm}${dd}-${randomChars}`;
}

/**
 * Format currency numbers with precise Egyptian Pounds / USD rounding
 */
export function roundToPrecision(val: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}
