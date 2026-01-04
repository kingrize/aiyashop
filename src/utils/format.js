/**
 * Cached currency formatter (biar render list/cart lebih ringan).
 * Pakai: import { formatRupiah } from "../utils/format";
 */
const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(val) {
  return IDR.format(Number(val || 0));
}
