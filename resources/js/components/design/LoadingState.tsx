import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface LoadingStateProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function LoadingState({ title, description, action, className }: LoadingStateProps) {
    const { t } = useTranslation();

    const displayTitle = title ?? t('loading_state.loading', 'Yuklanmoqda...');

    return (
        <div className={cn('bg-card border-border flex flex-col items-center justify-center rounded-xl border p-8 text-center sm:p-12', className)}>
            <div className="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" aria-hidden="true" />
            </div>

            <h3 className="text-foreground text-[18px] leading-tight font-bold">{displayTitle}</h3>

            {description && <p className="text-muted-foreground mt-1.5 max-w-sm text-[14px] leading-relaxed">{description}</p>}

            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export default LoadingState;
