import { cn } from '@/lib/utils';
import React from 'react';
import { Card } from './Card';

export interface CriteriaItem {
    label: string;
    value: number | null;
}

export interface CriteriaBarsProps {
    items: CriteriaItem[];
    className?: string;
    title?: React.ReactNode;
    wrapInCard?: boolean;
}

export function CriteriaBars({ items, className, title, wrapInCard = false }: CriteriaBarsProps) {
    const content = (
        <div className={cn('space-y-3.5', className)}>
            {title && <h3 className="text-foreground mb-4 text-[18px] leading-tight font-bold">{title}</h3>}
            <div className="space-y-3">
                {items.map((item, idx) => {
                    const hasValue = typeof item.value === 'number' && !isNaN(item.value);
                    const clampedValue = hasValue ? Math.max(0, Math.min(15, item.value!)) : 0;
                    const percent = hasValue ? (clampedValue / 15) * 100 : 0;

                    return (
                        <div key={idx} className="grid grid-cols-[130px_1fr_44px] items-center gap-3 sm:grid-cols-[150px_1fr_48px]">
                            {/* Label */}
                            <span className="text-foreground truncate text-[14px] font-medium" title={item.label}>
                                {item.label}
                            </span>

                            {/* 8px Track */}
                            <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                                {hasValue && percent > 0 ? (
                                    <div className="bg-chart h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                                ) : null}
                            </div>

                            {/* Space Grotesk score */}
                            <span className="font-display text-foreground text-right text-[14px] font-semibold tabular-nums">
                                {hasValue ? `${item.value}/15` : '—'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (wrapInCard) {
        return <Card className={className}>{content}</Card>;
    }

    return content;
}

export default CriteriaBars;
