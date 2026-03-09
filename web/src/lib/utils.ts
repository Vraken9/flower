import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministic price formatter (avoids Intl hydration mismatch
 * between Node.js and mobile browsers).
 */
export function formatPrice(price: number): string {
  const formatted = Math.round(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
}

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

/**
 * Deterministic date formatter (avoids Intl hydration mismatch).
 */
export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}
