import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoginCard from '@/components/auth/login-card';
import AuthLayout from '@/layouts/auth-layout';
import { User } from '@/types';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword = true }: LoginProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const { t } = useTranslation();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        // Initialize Telegram WebApp
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.ready();
        tg.expand();

        const user = tg.initDataUnsafe?.user;

        // ✅ Attempt Auto-Login for Telegram WebApp users if not already authenticated
        if (!auth?.user && user) {
            setIsLoggingIn(true);
            fetch('/webapp-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ init_data: tg?.initData }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.redirect) {
                        router.visit(data.redirect);
                    } else {
                        setIsLoggingIn(false);
                    }
                })
                .catch((err) => {
                    console.error('Telegram Login Error:', err);
                    setIsLoggingIn(false);
                });
        }
    }, [auth?.user]);

    if (isLoggingIn) {
        return (
            <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center">
                <div className="relative mb-8">
                    <img src="/images/logo/logo.png" alt="Logo" className="h-20 w-20 animate-pulse rounded-2xl object-cover shadow-2xl" />
                    <div className="border-primary/20 border-t-primary absolute -inset-3 animate-spin rounded-full border-2" />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <div className="flex gap-1">
                        <span className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]"></span>
                        <span className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]"></span>
                        <span className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full"></span>
                    </div>
                    {t('auth.signing_in', 'Tizimga ulanmoqda...')}
                </div>
            </div>
        );
    }

    return (
        <AuthLayout
            title={t('login.title', 'Tizimga kirish')}
            description={t('login.description', 'Speaking imtihonlariga tayyorgarlik uchun hisobingizga kiring')}
        >
            <Head title={t('login.submit', 'Kirish')} />

            {/* Success Status Message */}
            {status && (
                <div className="bg-success-bg border-success/30 text-success-text mb-4 rounded-xl border p-3 text-center text-xs font-semibold">
                    {status}
                </div>
            )}

            {/* Main Login Form Card */}
            <LoginCard canResetPassword={canResetPassword} />
        </AuthLayout>
    );
}
