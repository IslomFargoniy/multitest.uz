import AppearanceTabs from '@/components/appearance-tabs';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageBar = () => {
    const { i18n, t } = useTranslation();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
        setOpen(false);
        router.get(`/lang/${lang}`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Optional: handle success
            }
        });
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLangLabel = i18n.language === 'uz' ? 'Oʻzbekcha' : i18n.language === 'en' ? 'English' : 'Русский';
    const currentLangCode = i18n.language.toUpperCase();

    return (
        <div className="relative flex justify-end" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-lg border border-border-strong bg-surface-2 px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary active:scale-95"
            >
                <span className="text-xs font-bold text-accent-text">{currentLangCode}</span>
                <span className="hidden sm:inline-block">{currentLangLabel}</span>
            </button>

            {open && (
                <div className="absolute right-0 z-[100] mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-sm dark:shadow-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="mb-1 px-2.5 pt-1.5 text-xs font-semibold text-muted-foreground">
                        {t('lang.title') ?? 'Select Language'}
                    </div>
                    <button
                        onClick={() => changeLanguage('uz')}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                            i18n.language === 'uz' ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                        }`}
                    >
                        <span>{t('lang.uz')}</span>
                        <span className="text-xs font-bold text-muted-foreground">UZ</span>
                    </button>
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                            i18n.language === 'en' ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                        }`}
                    >
                        <span>{t('lang.en')}</span>
                        <span className="text-xs font-bold text-muted-foreground">EN</span>
                    </button>
                    <button
                        onClick={() => changeLanguage('ru')}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                            i18n.language === 'ru' ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                        }`}
                    >
                        <span>{t('lang.ru')}</span>
                        <span className="text-xs font-bold text-muted-foreground">RU</span>
                    </button>
                    
                    <div className="my-1 h-px bg-border" />
                    
                    <div className="p-1">
                        <AppearanceTabs className="flex flex-col gap-1 rounded-lg bg-surface-2 p-1" />
                    </div>
                </div>
            )}
        </div>
    );

};

export default LanguageBar;
