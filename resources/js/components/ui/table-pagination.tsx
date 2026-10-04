import React from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean | string;
}

interface TablePaginationProps {
    from?: number | null;
    to?: number | null;
    total: number;
    per_page?: number;
    links?: PaginationLink[];
    searchParams?: Record<string, any>;
}

export default function TablePagination({
    from,
    to,
    total,
    links = [],
    searchParams = {},
}: TablePaginationProps) {
    const { t } = useTranslation();

    if (!total || total === 0 || !links || links.length <= 3) {
        return null;
    }

    const buildUrl = (rawUrl: string | null) => {
        if (!rawUrl) return '#';
        const urlObj = new URL(rawUrl, window.location.origin);
        
        // Preserve all current search parameters except page which comes from rawUrl
        Object.entries(searchParams).forEach(([k, v]) => {
            if (k !== 'page' && v !== undefined && v !== null && v !== '') {
                urlObj.searchParams.set(k, String(v));
            }
        });

        return urlObj.pathname + urlObj.search;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-3 text-sm text-muted-foreground border-t border-border">
            <div className="font-medium text-xs sm:text-sm text-foreground">
                {t('showing', {
                    from: from ?? 1,
                    to: to ?? total,
                    total: total,
                }) || `Ko'rsatilmoqda: ${from ?? 1}-${to ?? total} dan ${total} ta`}
            </div>

            <div className="flex items-center gap-1.5">
                {links.map((link, idx) => {
                    const isPrevious = link.label.includes('Previous') || link.label.includes('&laquo;') || link.label.includes('chevron-left');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;') || link.label.includes('chevron-right');

                    if (!link.url && (isPrevious || isNext)) {
                        return (
                            <span
                                key={idx}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface-sunken text-muted-foreground opacity-50 cursor-not-allowed text-sm font-semibold"
                            >
                                {isPrevious ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                        );
                    }

                    if (isPrevious) {
                        return (
                            <Link
                                key={idx}
                                href={buildUrl(link.url)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border-strong bg-surface-2 hover:bg-secondary text-foreground transition-colors cursor-pointer text-sm font-semibold"
                                title={t('previous', 'Oldingi')}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        );
                    }

                    if (isNext) {
                        return (
                            <Link
                                key={idx}
                                href={buildUrl(link.url)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border-strong bg-surface-2 hover:bg-secondary text-foreground transition-colors cursor-pointer text-sm font-semibold"
                                title={t('next', 'Keyingi')}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        );
                    }

                    if (!link.url) {
                        return (
                            <span
                                key={idx}
                                className="inline-flex items-center justify-center h-9 px-2 text-muted-foreground font-semibold text-sm"
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={buildUrl(link.url)}
                            className={`inline-flex items-center justify-center h-9 min-w-[36px] px-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                                link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-border-strong bg-surface-2 hover:bg-secondary text-foreground'
                            }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
