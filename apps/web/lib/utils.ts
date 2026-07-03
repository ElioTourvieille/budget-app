import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency = "CHF") {
  const value = typeof amount === "string" ? Number(amount) : amount
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatShortDate(date: string | Date) {
  const value = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("fr-CH", { day: "numeric", month: "short" }).format(value)
}
