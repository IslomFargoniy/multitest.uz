import React, { type PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    User as UserIcon,
    Lock,
    Palette,
    Shield,
    CheckCircle2,
    Send,
} from 'lucide-react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { useHaptic } from '@/components/telegram-theme-provider';

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
            title: t('settings_layout.appearance', 'Ko\'rinish'),
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
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
            {/* ========================================================= */}
            {/* MOBILE NATIVE APP PROFILE HEADER                          */}
            {/* ========================================================= */}
            <div className="block md:hidden space-y-3.5">
                {/* Hero Profile Card */}
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 text-foreground shadow-xs">
                    <div className="relative z-10 flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary border border-border text-lg font-bold text-foreground">
                                {getInitials(user?.name)}
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-success ring-2 ring-card">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                            </span>
                        </div>

                        {/* User Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base font-bold tracking-tight text-foreground truncate">
                                    {user?.name || 'Foydalanuvchi'}
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                                    <Shield className="h-2.5 w-2.5 text-primary" />
                                    {roleName}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {user?.username ? `@${user.username}` : user?.phone || user?.email || 'ID: #' + user?.id}
                            </p>

                            {/* Status Chips */}
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                    ID: #{user?.id}
                                </span>
                                {user?.telegram_id ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                                        <Send className="h-2.5 w-2.5" /> Telegram ulangan
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-warning/10 border border-warning/20 px-2 py-0.5 text-xs font-medium text-warning">
                                        Telegram ulanmagan
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Native App Segmented Control Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-secondary border border-border shadow-xs gap-1">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => impact('light')}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                                    isActive
                                        ? 'bg-card text-primary shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{item.title}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Content Card */}
                <div className="rounded-2xl bg-card p-4 sm:p-5 border border-border shadow-xs pb-24">
                    {children}
                </div>
            </div>

            {/* ========================================================= */}
            {/* DESKTOP VIEW                                              */}
            {/* ========================================================= */}
            <div className="hidden md:block space-y-6">
                <Heading
                    title={t('settings_layout.title', 'Sozlamalar')}
                    description={t('settings_layout.description', 'Profilingiz ma\'lumotlari va xavfsizlik sozlamalarini boshqaring')}
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
                                            'w-full justify-start h-11 rounded-xl px-3.5 text-sm font-semibold transition-colors cursor-pointer',
                                            isActive
                                                ? 'bg-primary/10 text-primary shadow-xs'
                                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        )}
                                    >
                                        <Link href={item.href} prefetch className="flex items-center gap-2.5">
                                            <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </aside>

                    <div className="flex-1 md:max-w-2xl">
                        <section className="max-w-xl space-y-8 rounded-2xl bg-card p-6 border border-border shadow-xs">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
