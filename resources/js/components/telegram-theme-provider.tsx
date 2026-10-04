import { useEffect } from 'react';

export function TelegramThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg || tg.platform === 'unknown') return;

        const syncHeaderBottomBar = () => {
            const isDark = document.documentElement.classList.contains('dark');
            const bg = isDark ? '#0B1020' : '#F5F7FB';

            if (typeof tg.setHeaderColor === 'function') {
                try {
                    tg.setHeaderColor(bg);
                } catch {
                    // Ignore if not supported
                }
            }
            if (typeof tg.setBackgroundColor === 'function') {
                try {
                    tg.setBackgroundColor(bg);
                } catch {
                    // Ignore
                }
            }
            if (typeof (tg as any).setBottomBarColor === 'function') {
                try {
                    (tg as any).setBottomBarColor(bg);
                } catch {
                    // Ignore
                }
            }
        };

        const updateTheme = () => {
            syncHeaderBottomBar();
        };

        tg.onEvent('themeChanged', updateTheme);
        syncHeaderBottomBar(); // Initial call

        // Observe dark class changes on documentElement to keep Telegram bars in sync
        const observer = new MutationObserver(() => {
            syncHeaderBottomBar();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Ready and expand for better TMA experience
        tg.ready();
        tg.expand();

        return () => {
            tg.offEvent('themeChanged', updateTheme);
            observer.disconnect();
        };
    }, []);

    return <>{children}</>;
}

export const useHaptic = () => {
    const impact = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
        window.Telegram?.WebApp.HapticFeedback.impactOccurred(style);
    };

    const notification = (type: 'error' | 'success' | 'warning') => {
        window.Telegram?.WebApp.HapticFeedback.notificationOccurred(type);
    };

    const selection = () => {
        window.Telegram?.WebApp.HapticFeedback.selectionChanged();
    };

    return { impact, notification, selection };
};

export function useTelegramMainButton(text: string, show: boolean, onClick: () => void, loading = false) {
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg || tg.platform === 'unknown') return;

        const mainButton = tg.MainButton;
        mainButton.setText(text);

        if (show) {
            mainButton.show();
        } else {
            mainButton.hide();
        }

        if (loading) {
            mainButton.showProgress(false);
        } else {
            mainButton.hideProgress();
        }

        mainButton.onClick(onClick);

        return () => {
            mainButton.offClick(onClick);
            mainButton.hide();
        };
    }, [text, show, onClick, loading]);
}

export function useTelegramBackButton(show: boolean, onClick: () => void) {
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg || tg.platform === 'unknown') return;

        const backButton = tg.BackButton;

        if (show) {
            backButton.show();
        } else {
            backButton.hide();
        }

        backButton.onClick(onClick);

        return () => {
            backButton.offClick(onClick);
            backButton.hide();
        };
    }, [show, onClick]);
}

