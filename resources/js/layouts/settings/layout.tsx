import React, { type PropsWithChildren } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    User as UserIcon,
    Lock,
    Palette,
    Shield,
    CheckCircle2,
    Send,
    LogOut,
    ChevronRight,
    Sparkles,
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
            title: t('settings_layout.profile') || 'Profil',
            href: '/settings/profile',
            icon: UserIcon,
        },
        {
            title: t('settings_layout.password') || 'Xavfsizlik',
            href: '/settings/password',
            icon: Lock,
        },
        {
            title: t('settings_layout.appearance') || 'Ko\'rinish',
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
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-800 p-5 text-white shadow-xl shadow-indigo-500/15">
                    {/* Background Glow Decorations */}
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 text-xl font-black text-white shadow-inner">
                                {getInitials(user?.name)}
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-indigo-700">
                                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                            </span>
                        </div>

                        {/* User Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-black tracking-tight text-white truncate">
                                    {user?.name || 'Foydalanuvchi'}
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                                    <Shield className="h-2.5 w-2.5" />
                                    {roleName}
                                </span>
                            </div>
                            <p className="text-xs text-indigo-100/80 truncate mt-0.5">
                                {user?.username ? `@${user.username}` : user?.phone || user?.email || 'ID: #' + user?.id}
                            </p>

                            {/* Status Chips */}
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-black/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-100">
                                    ID: #{user?.id}
                                </span>
                                {user?.telegram_id ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-sky-500/30 px-2 py-0.5 text-[10px] font-semibold text-sky-100">
                                        <Send className="h-2.5 w-2.5" /> Telegram ulangan
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                                        Telegram ulanmagan
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Native App Segmented Control Tabs */}
                <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs gap-1">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => impact('light')}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
                                    isActive
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{item.title}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Content Card */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs pb-24">
                    {children}
                </div>
            </div>

            {/* ========================================================= */}
            {/* DESKTOP VIEW                                              */}
            {/* ========================================================= */}
            <div className="hidden md:block space-y-6">
                <Heading
                    title={t('settings_layout.title') || 'Sozlamalar'}
                    description={t('settings_layout.description') || 'Profilingiz ma\'lumotlari va xavfsizlik sozlamalarini boshqaring'}
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
                                            'w-full justify-start h-11 rounded-xl px-3.5 text-sm font-semibold transition-all cursor-pointer',
                                            isActive
                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        )}
                                    >
                                        <Link href={item.href} prefetch className="flex items-center gap-2.5">
                                            <Icon className={cn('h-4 w-4', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </aside>

                    <div className="flex-1 md:max-w-2xl">
                        <section className="max-w-xl space-y-8 rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
