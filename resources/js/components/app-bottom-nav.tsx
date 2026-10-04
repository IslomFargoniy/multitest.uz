import { TelegramThemeProvider, useHaptic } from '@/components/telegram-theme-provider';
import { router, usePage } from '@inertiajs/react';
import { FileText, History, Home, User } from 'lucide-react';
import { useState, useEffect } from 'react';
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

    if (isKeyboardOpen) {
        return null;
    }

    const mainNavItems = [
        {
            title: t('sidebar.dashboard'),
            href: '/dashboard',
            icon: Home,
        },
        {
            title: t('sidebar.test'),
            href: '/test',
            icon: FileText,
        },
        {
            title: t('sidebar.attempt'),
            href: '/attempt',
            icon: History,
        },
        {
            title: t('sidebar.profile'),
            href: '/settings/profile',
            icon: User,
        },
    ];

    return (
        <div className="fixed right-4 left-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 md:hidden">
            <div className="flex p-1.5 items-center justify-around rounded-xl border border-border bg-surface-sunken">
                {mainNavItems.map((item) => {
                    const isActive = page.url.startsWith(item.href);

                    return (
                        <button
                            key={item.href}
                            onClick={() => {
                                impact('light');
                                router.visit(item.href);
                            }}
                            className={`flex flex-1 flex-col items-center justify-center transition-colors py-2 px-1 rounded-lg gap-1 ${
                                isActive 
                                    ? 'bg-secondary text-foreground font-semibold' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <item.icon size={20} />
                            <span className="text-[12px] font-medium leading-none">
                                {item.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
