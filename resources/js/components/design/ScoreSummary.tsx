import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { CefrBadge } from './CefrBadge';
import { CefrScale } from './CefrScale';

export type ScoreSource = 'teacher' | 'ai' | 'pending';

export interface ScoreSummaryProps {
    score: number | null;
    max?: number;
    source?: ScoreSource;
    className?: string;
    showScale?: boolean;
}

export function ScoreSummary({ score, max = 75, source = 'ai', className, showScale = true }: ScoreSummaryProps) {
    const { t } = useTranslation();

    const isPending = score === null || source === 'pending';
    const sourceLabel = source === 'teacher' ? ` · ${t('score_summary.teacher', "O'qituvchi")}` : source === 'ai' ? ' · AI' : '';

    const labelText = `${t('score_summary.total_score', 'Umumiy ball')}${!isPending ? sourceLabel : ''}`;

    return (
        <Card className={cn('flex flex-col justify-between', className)}>
            <div>
                {/* Header row: Label left, CefrBadge right */}
                <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-muted-foreground text-[14px] leading-tight font-semibold">{labelText}</span>
                    <CefrBadge score={score} />
                </div>

                {/* Score row: Big Space Grotesk number */}
                <div className="my-2 flex items-baseline gap-2">
                    {isPending ? (
                        <div className="flex items-baseline gap-3">
                            <span className="font-display text-muted-foreground text-[56px] leading-none font-bold tabular-nums sm:text-[72px]">
                                —
                            </span>
                            <span className="text-muted-foreground text-[14px] font-medium">{t('score_summary.pending', 'Baholanmoqda')}</span>
                        </div>
                    ) : (
                        <div className="flex items-baseline">
                            <span className="font-display text-foreground text-[56px] leading-none font-bold tracking-tight tabular-nums sm:text-[72px]">
                                {score}
                            </span>
                            <span className="font-display text-muted-foreground ml-2 text-[22px] font-semibold tabular-nums sm:text-[28px]">
                                / {max}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom: CefrScale */}
            {showScale && (
                <div className="border-border mt-6 border-t pt-4">
                    <CefrScale score={score} />
                </div>
            )}
        </Card>
    );
}

export default ScoreSummary;
