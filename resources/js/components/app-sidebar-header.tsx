import { Breadcrumbs } from '@/components/breadcrumbs';
import LanguageBar from '@/components/language';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <div className="fixed top-0 z-50 block w-full bg-sidebar">

            <header className="border-sidebar-border/50 flex h-14 items-center justify-between border-b px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="flex-1"></div>
                <div className="fixed top-0 right-0 p-3 md:right-30">
                    <LanguageBar />
                </div>
            </header>
        </div>
    );
}
