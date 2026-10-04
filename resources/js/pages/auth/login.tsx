import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoginCard from '@/components/auth/login-card';
import LanguageBar from '@/components/language';
import TextLink from '@/components/text-link';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { User } from '@/types';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
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
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
                <div className="relative mb-8">
                    <img 
                        src="/images/logo/logo.png" 
                        alt="Logo" 
                        className="h-24 w-24 rounded-3xl object-cover animate-pulse shadow-2xl"
                    />
                    <div className="absolute -inset-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                    </div>
                    {t('auth.signing_in', 'Signing you in...')}
                </div>
            </div>
        );
    }

    return (
        <AuthLayout title={t('login.title')} description={t('login.description')}>
            <Head title={t('login.submit')} />

            {/* Language Selection Bar */}
            <div className="mb-4 flex justify-center sm:mb-8">
                <LanguageBar />
            </div>

            {/* Main Login Form Card */}
            <LoginCard />

            {/* Password Management & Status */}
            <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">{t('login.password')}</Label>

                    {canResetPassword && (
                        <TextLink
                            href={route('password.request')}
                            className="text-sm font-semibold text-primary hover:underline"
                            tabIndex={5}
                        >
                            {t('login.forgot')}
                        </TextLink>
                    )}
                </div>

                {/* Success Status Message */}
                {status && (
                    <div className="rounded-xl bg-success-bg border border-success/20 p-4 text-center text-sm font-medium text-success-text">
                        {t('login.status_success')}
                    </div>
                )}

                {/* Registration Link */}
                <p className="text-center text-sm text-muted-foreground">
                    {t('login.no_account')}{' '}
                    <TextLink href={route('register')} className="font-bold text-primary hover:underline">
                        {t('login.register')}
                    </TextLink>
                </p>
            </div>
        </AuthLayout>
    );
}
