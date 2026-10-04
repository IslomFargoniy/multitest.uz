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
            <SidebarGroupLabel className="mb-2 px-2 text-xs font-bold tracking-widest text-slate-400/80 uppercase dark:text-slate-500">
                {t('sidebar.platform', 'Platform')}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
                {items.map((item) => {
                    const isActive = url === item.href || url.startsWith(`${item.href}/`);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={{ children: item.title }}
                                onClick={() => router.visit(item.href)}
                                className={cn(
                                    'group relative flex h-10 w-full items-center gap-3 rounded-xl px-3 transition-all duration-300 ease-in-out',
                                    // Light Mode Styles
                                    'text-slate-600 hover:bg-slate-100',
                                    // Dark Mode Styles
                                    'dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100',
                                    // Active State
                                    isActive && [
                                        'bg-primary/10 text-primary shadow-sm',
                                        'dark:bg-primary/20 dark:text-primary dark:shadow-none',
                                        'before:absolute before:left-0 before:h-5 before:w-1 before:rounded-r-full before:bg-primary dark:before:bg-primary',
                                    ],
                                )}
                            >
                                {/* Icon Container with micro-animation */}
                                <div
                                    className={cn(
                                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110',
                                        isActive
                                            ? 'text-primary'
                                            : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100',
                                    )}
                                >
                                    {item.icon && <item.icon className="h-[18px] w-[18px]" />}
                                </div>

                                <span
                                    className={cn(
                                        'text-sm font-semibold transition-colors duration-300',
                                        isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100',
                                    )}
                                >
                                    {item.title}
                                </span>

                                {/* Decorative subtle glow for active item */}
                                {isActive && (
                                    <span className="absolute inset-0 rounded-xl ring-1 ring-primary/10 ring-inset dark:ring-primary/20" />
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
