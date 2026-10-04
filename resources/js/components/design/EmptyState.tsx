import { cn } from '@/lib/utils';
import { Inbox, LucideIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface EmptyStateProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    icon?: LucideIcon;
    className?: string;
}

export function EmptyState({ title, description, action, icon: Icon = Inbox, className }: EmptyStateProps) {
    const { t } = useTranslation();

    const displayTitle = title ?? t('empty_state.title', "Ma'lumot topilmadi");
    const displayDescription = description ?? t('empty_state.description', "Hozircha ko'rsatish uchun hech qanday ma'lumot yo'q.");

    return (
        <div
            className={cn(
                'border-border bg-card flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center sm:p-12',
                className,
            )}
        >
            <div className="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Icon className="text-muted-foreground h-8 w-8" aria-hidden="true" />
            </div>

            <h3 className="text-foreground text-[18px] leading-tight font-bold">{displayTitle}</h3>

            {displayDescription && <p className="text-muted-foreground mt-1.5 max-w-sm text-[14px] leading-relaxed">{displayDescription}</p>}

            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export default EmptyState;
