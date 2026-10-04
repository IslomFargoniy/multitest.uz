import 'react-datepicker/dist/react-datepicker.css';
import 'react-time-picker/dist/TimePicker.css';
import '../css/app.css';
import i18n from './i18n';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { toast, Toaster } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';
import { initTelegramWebApp } from './hooks/use-telegram';

initTelegramWebApp();

// Auto-reload on deployment chunk version mismatches (Vite preload error)
window.addEventListener('vite:preloadError', () => {
    window.location.reload();
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

interface FlashProps {
    success?: string | null;
    error?: string | null;
}

// Controllers flash an i18n key or a plain message. Success feedback is shown by the forms themselves,
// so only server-side errors (which have no form handler) are toasted globally.
const showFlash = (flash?: FlashProps) => {
    if (flash?.error) {
        toast.error(i18n.exists(flash.error) ? i18n.t(flash.error) : flash.error);
    }
};

router.on('success', (event) => showFlash((event.detail.page.props as { flash?: FlashProps }).flash));

import { TelegramThemeProvider } from './components/telegram-theme-provider';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        return resolvePageComponent(`./pages/${name}.tsx`, pages).catch((err) => {
            if (err?.message?.includes('Failed to fetch dynamically imported module') || err?.name === 'TypeError') {
                window.location.reload();
            }
            throw err;
        });
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Sync i18n language with server-side locale...
        if (props.initialPage.props.locale) {
            i18n.changeLanguage(props.initialPage.props.locale as string);
        }

        showFlash((props.initialPage.props as { flash?: FlashProps }).flash);

        root.render(
            <TelegramThemeProvider>
                <App {...props} />
                <Toaster richColors position="bottom-right" />
            </TelegramThemeProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
