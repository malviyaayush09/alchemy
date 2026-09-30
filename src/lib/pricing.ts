/** Pure pricing maths, shared by the cart display and the server checkout (which is authoritative). */

export type CouponRule = { code: string; type: "flat" | "percent"; value: number; minOrderPaise: number };

export type Totals = { subtotalPaise: number; discountPaise: number; deliveryFeePaise: number; totalPaise: number };

export function couponDiscount(subtotalPaise: number, c: CouponRule | null): number {
  if (!c || subtotalPaise < c.minOrderPaise) return 0;
  const raw = c.type === "percent" ? Math.floor((subtotalPaise * c.value) / 100) : c.value;
  return Math.min(raw, subtotalPaise);
}

export function computeTotals(lines: { unitPaise: number; quantity: number }[], deliveryFeePaise: number, coupon: CouponRule | null): Totals {
  const subtotalPaise = lines.reduce((s, l) => s + l.unitPaise * l.quantity, 0);
  const discountPaise = couponDiscount(subtotalPaise, coupon);
  return { subtotalPaise, discountPaise, deliveryFeePaise, totalPaise: subtotalPaise - discountPaise + deliveryFeePaise };
}

/** GST split for invoices (intra-state: CGST + SGST halves). Amounts in paise. */
export function gstBreakdown(amountPaise: number, rateBps: number, inclusive: boolean) {
  if (rateBps <= 0) return { taxablePaise: amountPaise, cgstPaise: 0, sgstPaise: 0, grossPaise: amountPaise };
  const taxable = inclusive ? Math.round((amountPaise * 10000) / (10000 + rateBps)) : amountPaise;
  const tax = inclusive ? amountPaise - taxable : Math.round((amountPaise * rateBps) / 10000);
  const cgst = Math.floor(tax / 2);
  return { taxablePaise: taxable, cgstPaise: cgst, sgstPaise: tax - cgst, grossPaise: taxable + tax };
}
