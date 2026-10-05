import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility for tailwind classes
import { type NavItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { url } = usePage();
    const { t } = useTranslation();

    return (
        <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="text-muted-foreground mb-2 px-2 text-sm font-semibold">
                {t('sidebar.platform', 'Platform')}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const isActive = url === item.href || url.startsWith(`${item.href}/`);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={{ children: item.title }}
                                onClick={() => router.visit(item.href)}
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-nav-active-bg text-nav-active-fg font-semibold'
                                        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-5 w-5 shrink-0 items-center justify-center',
                                        isActive ? 'text-nav-active-fg' : 'text-muted-foreground',
                                    )}
                                >
                                    {item.icon && <item.icon className="h-[18px] w-[18px]" />}
                                </div>

                                <span className="truncate">{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
