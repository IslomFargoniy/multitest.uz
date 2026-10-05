import { Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Lock, Palette, Send, Shield, User as UserIcon } from 'lucide-react';
import { type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import Heading from '@/components/heading';
import { useHaptic } from '@/components/telegram-theme-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation();
    const { impact } = useHaptic();
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const navItems = [
        {
            title: t('settings_layout.profile', 'Profil'),
            href: '/settings/profile',
            icon: UserIcon,
        },
        {
            title: t('settings_layout.password', 'Xavfsizlik'),
            href: '/settings/password',
            icon: Lock,
        },
        {
            title: t('settings_layout.appearance', "Ko'rinish"),
            href: '/settings/appearance',
            icon: Palette,
        },
    ];

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const roleName = user?.roles?.[0]?.name || 'Student';

    return (
        <div className="mx-auto w-full max-w-7xl space-y-4 px-3 py-3 sm:space-y-6 sm:px-6 sm:py-6">
            {/* ========================================================= */}
            {/* MOBILE NATIVE APP PROFILE HEADER                          */}
            {/* ========================================================= */}
            <div className="block space-y-3.5 md:hidden">
                {/* Hero Profile Card */}
                <div className="bg-card border-border text-foreground relative overflow-hidden rounded-2xl border p-5 shadow-xs">
                    <div className="relative z-10 flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="bg-secondary border-border text-foreground flex h-14 w-14 items-center justify-center rounded-xl border text-lg font-bold">
                                {getInitials(user?.name)}
                            </div>
                            <span className="bg-success ring-card absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full ring-2">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                            </span>
                        </div>

                        {/* User Details */}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-foreground truncate text-base font-bold tracking-tight">{user?.name || 'Foydalanuvchi'}</h2>
                                <span className="bg-secondary border-border text-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold tracking-wider uppercase">
                                    <Shield className="text-primary h-2.5 w-2.5" />
                                    {roleName}
                                </span>
                            </div>
                            <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                {user?.username ? `@${user.username}` : user?.phone || user?.email || 'ID: #' + user?.id}
                            </p>

                            {/* Status Chips */}
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="bg-secondary text-muted-foreground inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium">
                                    ID: #{user?.id}
                                </span>
                                {user?.telegram_id ? (
                                    <span className="bg-primary/10 border-primary/20 text-primary inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium">
                                        <Send className="h-2.5 w-2.5" /> Telegram ulangan
                                    </span>
                                ) : (
                                    <span className="bg-warning/10 border-warning/20 text-warning inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium">
                                        Telegram ulanmagan
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Native App Segmented Control Tabs */}
                <div className="bg-secondary border-border flex items-center gap-1 rounded-xl border p-1 shadow-xs">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => impact('light')}
                                className={cn(
                                    'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors',
                                    isActive ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{item.title}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Content Card */}
                <div className="bg-card border-border rounded-2xl border p-4 pb-24 shadow-xs sm:p-5">{children}</div>
            </div>

            {/* ========================================================= */}
            {/* DESKTOP VIEW                                              */}
            {/* ========================================================= */}
            <div className="hidden space-y-6 md:block">
                <Heading
                    title={t('settings_layout.title', 'Sozlamalar')}
                    description={t('settings_layout.description', "Profilingiz ma'lumotlari va xavfsizlik sozlamalarini boshqaring")}
                />

                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <aside className="w-full max-w-xl lg:w-56">
                        <nav className="flex flex-col space-y-1.5">
                            {navItems.map((item) => {
                                const isActive = currentPath === item.href;
                                const Icon = item.icon;

                                return (
                                    <Button
                                        key={item.href}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'h-11 w-full cursor-pointer justify-start rounded-xl px-3.5 text-sm font-semibold transition-colors',
                                            isActive
                                                ? 'bg-nav-active-bg text-nav-active-fg'
                                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                                        )}
                                    >
                                        <Link href={item.href} prefetch className="flex items-center gap-2.5">
                                            <Icon className={cn('h-4 w-4', isActive ? 'text-nav-active-fg' : 'text-muted-foreground')} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </aside>

                    <div className="flex-1 md:max-w-2xl">
                        <section className="bg-card border-border max-w-xl space-y-8 rounded-2xl border p-6 shadow-xs">{children}</section>
                    </div>
                </div>
            </div>
        </div>
    );
}
