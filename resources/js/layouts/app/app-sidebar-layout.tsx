import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useTelegramBackButton } from '@/components/telegram-theme-provider';
import { type BreadcrumbItem } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { AppBottomNav } from '@/components/app-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{
    breadcrumbs?: BreadcrumbItem[]
}>) {
    const isMobile = useIsMobile();
    const { url } = usePage();
    const isDashboard = url === '/dashboard';

    // Detail/nested pages should not show bottom nav so full content is visible
    const isDetailPage = /\/(attempt|test|user|practice)\/\d+/.test(url);
    const showBottomNav = isMobile && !isDetailPage;

    useTelegramBackButton(!isDashboard, () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    });

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className={`w-full overflow-x-hidden ${
                    showBottomNav
                        ? 'pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-0'
                        : 'pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-0'
                }`}
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />

                <div className="flex-1 px-1.5 sm:px-4 md:px-0">
                    {children}
                </div>
            </AppContent>

            {showBottomNav && <AppBottomNav />}
        </AppShell>
    );
}
