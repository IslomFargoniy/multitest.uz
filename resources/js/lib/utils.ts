import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export { formatDateTime, formatDate, SYSTEM_DATE_TIME_FORMAT, SYSTEM_DATE_FORMAT } from './date';
