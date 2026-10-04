import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import React from 'react';

export type NoticeTone = 'warning' | 'danger' | 'info';

export interface NoticeBannerProps {
    tone: NoticeTone;
    title: React.ReactNode;
    children?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export function NoticeBanner({ tone, title, children, action, className }: NoticeBannerProps) {
    let containerClasses = '';
    let iconElement: React.ReactNode = null;

    switch (tone) {
        case 'warning':
            containerClasses = 'bg-warning-banner-bg border border-warning-banner-border text-warning-text';
            iconElement = <AlertTriangle className="text-warning-text mt-0.5 h-[22px] w-[22px] shrink-0" aria-hidden="true" />;
            break;
        case 'danger':
            containerClasses = 'bg-danger-bg border border-danger/30 text-danger-text';
            iconElement = <AlertCircle className="text-danger-text mt-0.5 h-[22px] w-[22px] shrink-0" aria-hidden="true" />;
            break;
        case 'info':
            containerClasses = 'bg-surface-2 border border-border-strong text-foreground';
            iconElement = <Info className="text-accent-text mt-0.5 h-[22px] w-[22px] shrink-0" aria-hidden="true" />;
            break;
    }

    return (
        <div role="alert" className={cn('flex items-start gap-3.5 rounded-xl p-4', containerClasses, className)}>
            {iconElement}
            <div className="min-w-0 flex-1">
                <div className="text-[15px] leading-snug font-bold">{title}</div>
                {children && <div className="mt-1 text-[14px] leading-relaxed opacity-90">{children}</div>}
            </div>
            {action && <div className="shrink-0 self-center">{action}</div>}
        </div>
    );
}

export default NoticeBanner;
