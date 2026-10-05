import { format, isValid } from 'date-fns';

export const SYSTEM_DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm';
export const SYSTEM_DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Format any date or timestamp into the system-wide standard "YYYY-MM-DD HH:mm" (e.g. 2026-09-22 22:10).
 */
export function formatDateTime(
    date?: string | number | Date | null,
    fallback: string = '-'
): string {
    if (!date) return fallback;
    try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (!isValid(d) || isNaN(d.getTime())) return fallback;
        return format(d, SYSTEM_DATE_TIME_FORMAT);
    } catch {
        return fallback;
    }
}

/**
 * Format date into "YYYY-MM-DD"
 */
export function formatDate(
    date?: string | number | Date | null,
    fallback: string = '-'
): string {
    if (!date) return fallback;
    try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (!isValid(d) || isNaN(d.getTime())) return fallback;
        return format(d, SYSTEM_DATE_FORMAT);
    } catch {
        return fallback;
    }
}
