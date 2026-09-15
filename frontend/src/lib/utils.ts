import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Every product gets a manifest code — a functional reference tied to the
 * importation theme (like a cargo manifest line item), not decorative
 * numbering. Derived deterministically from the product's own _id so it
 * stays stable across renders and reloads.
 */
export function manifestCode(id: string) {
  const digits = id
    .split('')
    .map((c) => c.charCodeAt(0))
    .reduce((sum, n) => sum + n, 0);
  return `MF-${String(digits % 9000 + 1000)}`;
}

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  'in-transit': 'In transit',
  'customs-clearance': 'Customs clearance',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
