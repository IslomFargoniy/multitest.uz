import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type AnswerStatus = 'graded' | 'no_speech' | 'wrong_language' | 'off_topic' | 'pending' | 'ai_error';

export interface StatusPillProps {
    status: AnswerStatus;
    className?: string;
    showDot?: boolean;
}

export function StatusPill({ status, className, showDot = true }: StatusPillProps) {
    const { t } = useTranslation();

    let textKey = `status.${status}`;
    let defaultText = '';
    let colorClasses = '';
    let dotColorClass = '';

    switch (status) {
        case 'graded':
            defaultText = 'Baholandi';
            colorClasses = 'bg-success-bg text-success-text';
            dotColorClass = 'bg-success';
            break;
        case 'no_speech':
            defaultText = 'Ovoz eshitilmadi';
            colorClasses = 'bg-warning-bg text-warning-text';
            dotColorClass = 'bg-warning';
            break;
        case 'wrong_language':
            defaultText = 'Boshqa tilda javob';
            colorClasses = 'bg-warning-bg text-warning-text';
            dotColorClass = 'bg-warning';
            break;
        case 'off_topic':
            defaultText = 'Savolga mos emas';
            colorClasses = 'bg-warning-bg text-warning-text';
            dotColorClass = 'bg-warning';
            break;
        case 'pending':
            defaultText = 'Baholanmoqda';
            colorClasses = 'bg-secondary text-muted-foreground';
            dotColorClass = 'bg-muted-foreground';
            break;
        case 'ai_error':
            defaultText = 'AI xatosi';
            colorClasses = 'bg-danger-bg text-danger-text';
            dotColorClass = 'bg-danger';
            break;
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] leading-none font-semibold tracking-tight select-none',
                colorClasses,
                className,
            )}
        >
            {showDot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColorClass)} aria-hidden="true" />}
            <span>{t(textKey, defaultText)}</span>
        </span>
    );
}

export default StatusPill;
