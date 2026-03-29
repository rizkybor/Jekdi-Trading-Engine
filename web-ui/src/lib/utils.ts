import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, lang: string = 'id') {
  return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getSignalColor(signal: string) {
  switch (signal) {
    case "BUY": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "SELL": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    case "HOLD": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    default: return "text-neutral-400 bg-neutral-800/50 border-neutral-700/50";
  }
}

export function getConfidenceColor(confidence: string) {
  switch (confidence) {
    case "high": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    case "medium": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    case "low": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    default: return "bg-neutral-800/50 text-neutral-400 border border-neutral-700";
  }
}