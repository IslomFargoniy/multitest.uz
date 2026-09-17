import { useHaptic } from '@/components/telegram-theme-provider';
import { router, usePage } from '@inertiajs/react';
import { FileText, History, Home, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export function AppBottomNav() {
    const page = usePage();
    const { t } = useTranslation();
    const { impact } = useHaptic();
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Keyboard detection
    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                setIsKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.82);
            }
        };

        window.visualViewport?.addEventListener('resize', handleResize);
        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
        };
    }, []);

    // Scroll hide/show listener
    useEffect(() => {
        let timeoutId: any = null;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Only hide after scrolling down more than 40px
            if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsVisible(true);
            }, 1200);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    if (isKeyboardOpen) {
        return null;
    }

    const mainNavItems = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: '/dashboard',
            icon: Home,
        },
        {
            title: t('sidebar.test', 'Testlar'),
            href: '/test',
            icon: FileText,
        },
        {
            title: t('sidebar.attempt', 'Urinishlar'),
            href: '/attempt',
            icon: History,
        },
        {
            title: t('sidebar.profile', 'Profil'),
            href: '/settings/profile',
            icon: User,
        },
    ];

    return (
        <div
            className={`fixed right-4 left-4 bottom-[calc(0.8rem+env(safe-area-inset-bottom))] z-40 md:hidden transition-transform duration-300 ease-out ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-28 opacity-0 pointer-events-none'
            }`}
        >
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
                            className={`flex flex-1 flex-col items-center justify-center transition-all duration-300 py-2 px-1 rounded-[1.8rem] cursor-pointer ${
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-100'
                                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 active:scale-95'
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
