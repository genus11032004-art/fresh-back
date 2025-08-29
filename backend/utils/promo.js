export function applyPromo(code, subtotal) {
  if (!code) return { discount: 0, final: subtotal, code: null };
  const normalized = String(code).trim().toUpperCase();
  if (normalized === "FRESH10") {
    const discount = Math.round(subtotal * 0.10 * 100) / 100;
    return { discount, final: Math.max(0, subtotal - discount), code: normalized };
  }
  return { discount: 0, final: subtotal, code: null };
}
