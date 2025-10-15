import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyIRR(amount: number): string {
  try {
    return new Intl.NumberFormat('fa-IR', { style: 'currency', currency: 'IRR', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${Number(amount || 0).toLocaleString('fa-IR')} ریال`;
  }
}
