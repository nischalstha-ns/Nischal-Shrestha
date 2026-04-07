import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US', 
  symbol?: string,
  decimalPlaces: number = 2
) {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  const formatted = formatter.format(amount);
  const displaySymbol = symbol || currency;

  return `${displaySymbol} ${formatted}`;
}
