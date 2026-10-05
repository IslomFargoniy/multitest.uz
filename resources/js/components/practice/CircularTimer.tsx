import { useTranslation } from 'react-i18next';

interface CircularTimerProps {
    timeLeft: number;
    totalTime: number;
    phase: string;
    /** Diameter in px; the compact variant (phones) hides the caption and shrinks the number. */
    size?: number;
}

export default function CircularTimer({ timeLeft, totalTime, phase, size = 220 }: CircularTimerProps) {
    const { t } = useTranslation();
    const compact = size < 140;
    const strokeWidth = compact ? 7 : 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Progress goes from 1 (full) down to 0 (empty), clockwise
    const progress = totalTime > 0 ? Math.max(0, Math.min(1, timeLeft / totalTime)) : 0;
    const dashOffset = circumference * (1 - progress);

    const isUploading = phase === 'uploading';

    const displayTime = () => {
        if (isUploading) return '--';
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return `0:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative inline-flex flex-col items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-scale-x-100 rotate-[-90deg]">
                {/* Background track */}
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
                {/* Animated countdown arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--chart)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s linear' }}
                />
            </svg>

            {/* Inner Circle Content */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center select-none">
                <span
                    className={`font-display text-foreground leading-none font-bold tracking-tight tabular-nums ${compact ? 'text-[26px]' : 'text-[56px]'}`}
                >
                    {displayTime()}
                </span>
                <span className={`text-muted-foreground mt-2 text-[13px] font-medium ${compact ? 'hidden' : ''}`}>
                    {t('practice_show.seconds_left', 'soniya qoldi')}
                </span>
            </div>
        </div>
    );
}
