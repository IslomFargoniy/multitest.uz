import { cn } from '@/lib/utils';

export interface CefrScaleProps {
    score?: number | null;
    className?: string;
    showLabels?: boolean;
}

const SEGMENTS = [
    { key: 'A1', label: 'A1', range: '0–15', bgClass: 'bg-cefr-a1' },
    { key: 'A2', label: 'A2', range: '16–37', bgClass: 'bg-cefr-a2' },
    { key: 'B1', label: 'B1', range: '38–50', bgClass: 'bg-cefr-b1' },
    { key: 'B2', label: 'B2', range: '51–64', bgClass: 'bg-cefr-b2' },
    { key: 'C1', label: 'C1', range: '65–75', bgClass: 'bg-cefr-c1' },
];

export function CefrScale({ score, className, showLabels = true }: CefrScaleProps) {
    const hasScore = typeof score === 'number' && !isNaN(score);
    const clampedScore = hasScore ? Math.max(0, Math.min(75, score)) : 0;
    const markerPositionPercent = (clampedScore / 75) * 100;

    return (
        <div className={cn('w-full select-none', className)}>
            {/* Scale Bar Track Container */}
            <div className="relative py-2">
                <div
                    className="grid h-[8px] gap-[3px] overflow-hidden rounded-sm sm:h-[10px]"
                    style={{ gridTemplateColumns: '16fr 22fr 13fr 14fr 11fr' }}
                >
                    {SEGMENTS.map((seg) => (
                        <div key={seg.key} className={cn('h-full', seg.bgClass)} />
                    ))}
                </div>

                {/* Score Marker */}
                {hasScore && (
                    <div
                        className="ring-card pointer-events-none absolute top-1/2 z-10 h-[20px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm ring-[3px]"
                        style={{ left: `${markerPositionPercent}%` }}
                        aria-hidden="true"
                    />
                )}
            </div>

            {/* Labels Row */}
            {showLabels && (
                <div
                    className="text-muted-foreground mt-1 grid gap-[3px] text-center text-[12px]"
                    style={{ gridTemplateColumns: '16fr 22fr 13fr 14fr 11fr' }}
                >
                    {SEGMENTS.map((seg) => (
                        <div key={seg.key} className="truncate">
                            <span className="text-foreground/80 font-semibold">{seg.label}</span>
                            <span className="ml-1 hidden opacity-70 sm:inline">({seg.range})</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CefrScale;
