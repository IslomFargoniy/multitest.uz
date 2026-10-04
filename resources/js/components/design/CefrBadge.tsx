import { cn } from '@/lib/utils';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface CefrInfo {
    code: CefrLevel | 'none';
    label: string;
    bgClass: string;
    textClass: string;
}

export function getCefrInfo(score?: number | null, explicitLevel?: string): CefrInfo {
    let code: CefrLevel | 'none' = 'none';

    if (explicitLevel) {
        const norm = explicitLevel.toUpperCase().trim();
        if (norm.includes('C1') || norm.includes('C2')) code = 'C1';
        else if (norm.includes('B2')) code = 'B2';
        else if (norm.includes('B1')) code = 'B1';
        else if (norm.includes('A2')) code = 'A2';
        else if (norm.includes('A1') || norm.includes('BELOW')) code = 'A1';
    }

    if (code === 'none' && typeof score === 'number' && !isNaN(score)) {
        if (score >= 65) code = 'C1';
        else if (score >= 51) code = 'B2';
        else if (score >= 38) code = 'B1';
        else if (score >= 16) code = 'A2';
        else code = 'A1';
    }

    switch (code) {
        case 'C1':
            return { code: 'C1', label: 'C1', bgClass: 'bg-cefr-c1', textClass: 'text-cefr-c1-text' };
        case 'B2':
            return { code: 'B2', label: 'B2', bgClass: 'bg-cefr-b2', textClass: 'text-cefr-b2-text' };
        case 'B1':
            return { code: 'B1', label: 'B1', bgClass: 'bg-cefr-b1', textClass: 'text-cefr-b1-text' };
        case 'A2':
            return { code: 'A2', label: 'A2', bgClass: 'bg-cefr-a2', textClass: 'text-cefr-a2-text' };
        case 'A1':
            return { code: 'A1', label: 'A1', bgClass: 'bg-cefr-a1', textClass: 'text-cefr-a1-text' };
        default:
            return { code: 'none', label: '—', bgClass: 'bg-secondary', textClass: 'text-muted-foreground' };
    }
}

export interface CefrBadgeProps {
    score?: number | null;
    level?: string;
    className?: string;
}

export function CefrBadge({ score, level, className }: CefrBadgeProps) {
    const info = getCefrInfo(score, level);

    return (
        <span
            className={cn(
                'inline-flex items-center justify-center rounded-lg px-3 py-1 text-[18px] leading-none font-bold tracking-tight select-none',
                info.bgClass,
                info.textClass,
                className,
            )}
        >
            {info.label}
        </span>
    );
}

export default CefrBadge;
