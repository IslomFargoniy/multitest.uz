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
        <div className="fixed right-4 left-4 bottom-[calc(1.2rem+env(safe-area-inset-bottom))] z-50 md:hidden">
            <div className="flex p-1.5 items-center justify-around rounded-[2.5rem] border border-slate-200/80 bg-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/90 dark:shadow-[0_12px_48px_rgba(0,0,0,0.5)] gap-1">
                {mainNavItems.map((item) => {
                    const isActive = page.url.startsWith(item.href);

                    return (
                        <button
                            key={item.href}
                            onClick={() => {
                                impact('light');
                                router.visit(item.href);
                            }}
                            className={`flex flex-1 flex-col items-center justify-center transition-all duration-300 py-2 px-1 rounded-[1.8rem] ${
                                isActive 
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <item.icon size={isActive ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[9px] font-black mt-1 tracking-tight leading-none uppercase ${isActive ? 'text-primary-foreground' : 'text-slate-400'}`}>
                                {item.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
