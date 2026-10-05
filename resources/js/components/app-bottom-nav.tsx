import { useHaptic } from '@/components/telegram-theme-provider';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { FileText, History, Home, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function AppBottomNav() {
    const page = usePage();
    const { t } = useTranslation();
    const { impact } = useHaptic();
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                // If visual viewport height is significantly less than window height, virtual keyboard is likely open
                setIsKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.85);
            }
        };

        window.visualViewport?.addEventListener('resize', handleResize);
        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
        };
    }, []);

    // The exam is a focus mode: no navigation while answering.
    const path = page.url.split('?')[0].split('#')[0];
    if (isKeyboardOpen || path.startsWith('/practice')) {
        return null;
    }

    const mainNavItems = [
        { title: t('sidebar.dashboard'), href: '/dashboard', match: '/dashboard', icon: Home },
        { title: t('sidebar.test'), href: '/test', match: '/test', icon: FileText },
        { title: t('sidebar.attempt'), href: '/attempt', match: '/attempt', icon: History },
        { title: t('sidebar.profile'), href: '/settings/profile', match: '/settings', icon: User },
    ];

    return (
        <nav
            aria-label={t('nav.bottom', 'Asosiy menyu')}
            className="fixed right-4 left-4 z-50 md:hidden"
            style={{ bottom: 'calc(0.75rem + max(env(safe-area-inset-bottom), var(--tg-safe-area-inset-bottom, 0px)))' }}
        >
            <div className="border-border bg-surface-sunken flex items-center justify-around rounded-xl border p-1.5">
                {mainNavItems.map((item) => {
                    const isActive = path === item.match || path.startsWith(`${item.match}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            onClick={() => impact('light')}
                            aria-current={isActive ? 'page' : undefined}
                            className="focus-visible:ring-ring flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 outline-none focus-visible:ring-2"
                        >
                            <span
                                className={cn(
                                    'flex h-[30px] w-14 items-center justify-center rounded-full transition-colors',
                                    isActive ? 'bg-nav-active-bg text-nav-active-fg' : 'text-muted-foreground',
                                )}
                            >
                                <item.icon size={22} strokeWidth={isActive ? 2.25 : 2} aria-hidden="true" />
                            </span>
                            <span
                                className={cn(
                                    'text-xs leading-none',
                                    isActive ? 'text-nav-active-fg font-bold' : 'text-muted-foreground font-medium',
                                )}
                            >
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
