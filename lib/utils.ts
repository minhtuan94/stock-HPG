import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function toActionLabel(value: number): "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL" {
  if (value >= 80) return "STRONG_BUY";
  if (value >= 65) return "BUY";
  if (value >= 45) return "HOLD";
  if (value >= 25) return "SELL";
  return "STRONG_SELL";
}
