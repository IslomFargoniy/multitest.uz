import { Breadcrumbs } from '@/components/breadcrumbs';
import LanguageBar from '@/components/language';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-background/80 dark:bg-slate-950/80 px-4 sm:px-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <SidebarTrigger className="-ml-1 flex" />
                <div className="truncate">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            
            <div className="shrink-0">
                <LanguageBar />
            </div>
        </header>
    );
}
