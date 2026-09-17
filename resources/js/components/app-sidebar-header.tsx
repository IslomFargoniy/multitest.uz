import { Breadcrumbs } from '@/components/breadcrumbs';
import LanguageBar from '@/components/language';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <div className="fixed top-0 left-0 right-0 z-40 block w-full bg-sidebar/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-border/50">
            <header className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <SidebarTrigger className="-ml-1 hidden md:flex" />
                    <div className="truncate">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
                
                <div className="shrink-0">
                    <LanguageBar />
                </div>
            </header>
        </div>
    );
}
