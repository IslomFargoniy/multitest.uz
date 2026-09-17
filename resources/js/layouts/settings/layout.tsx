import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useHaptic } from '@/components/telegram-theme-provider';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation();
    const { url } = usePage();
    const { impact } = useHaptic();

    return (
        <div className="px-2 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto w-full">
            <div className="mb-4 sm:mb-6">
                <Heading title={t('settings_layout.title', 'Sozlamalar')} description={t('settings_layout.description', 'Profilingiz va hisob sozlamalarini boshqaring')} />
            </div>

            {/* Mobile Segmented Pill Tabs */}
            <div className="lg:hidden mb-6">
                <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 gap-1 shadow-xs">
                    {sidebarNavItems.map((item, index) => {
                        const isActive = url === item.href;
                        return (
                            <Link
                                key={`${item.href}-${index}`}
                                href={item.href}
                                onClick={() => impact('light')}
                                className={`flex-1 text-center py-2.5 px-2 rounded-xl text-xs font-black transition-all ${
                                    isActive
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                {t(`settings_layout.${item.title.toLowerCase()}`, item.title)}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-12">
                {/* Desktop Vertical Aside Nav */}
                <aside className="hidden lg:block w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1">
                        {sidebarNavItems.map((item, index) => {
                            const isActive = url === item.href;
                            return (
                                <Button
                                    key={`${item.href}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start rounded-xl font-bold', {
                                        'bg-primary/10 text-primary font-black': isActive,
                                    })}
                                >
                                    <Link href={item.href} prefetch>
                                        {t(`settings_layout.${item.title.toLowerCase()}`, item.title)}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-8">{children}</section>
                </div>
            </div>
        </div>
    );
}
