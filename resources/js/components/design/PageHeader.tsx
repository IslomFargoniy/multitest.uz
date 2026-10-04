import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import React from 'react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
            <div className="min-w-0 flex-1">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav aria-label="Breadcrumbs" className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[13px]">
                        {breadcrumbs.map((item, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;
                            return (
                                <React.Fragment key={idx}>
                                    {idx > 0 && <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                                    {item.href && !isLast ? (
                                        <Link href={item.href} className="hover:text-foreground max-w-[200px] truncate transition-colors">
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className={cn('max-w-[200px] truncate', isLast && 'text-foreground font-medium')}>{item.label}</span>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </nav>
                )}
                <h1 className="text-foreground text-[28px] leading-tight font-bold tracking-tight">{title}</h1>
                {subtitle && <p className="text-muted-foreground mt-1 text-[14px] leading-normal">{subtitle}</p>}
            </div>

            {actions && <div className="flex shrink-0 flex-wrap items-center gap-3 sm:self-center">{actions}</div>}
        </div>
    );
}

export default PageHeader;
