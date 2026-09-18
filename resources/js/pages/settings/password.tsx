import React, { FormEventHandler, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { Lock, KeyRound, Check, ShieldAlert, Save } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { useHaptic } from '@/components/telegram-theme-provider';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const { impact } = useHaptic();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        impact('medium');

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('password_settings.title') || 'Parol sozlamalari'} />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {t('password_settings.heading') || 'Xavfsizlik va Parol'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('password_settings.description') || 'Hisobingiz xavfsizligini ta\'minlash uchun kuchli paroldan foydalaning'}
                        </p>
                    </div>

                    <form onSubmit={updatePassword} className="space-y-4 sm:space-y-5">
                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="current_password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t('password_settings.current_password') || 'Joriy parol'}
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    type="password"
                                    className="h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-medium text-sm focus-visible:ring-indigo-500"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                />
                            </div>
                            <InputError message={errors.current_password} />
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t('password_settings.new_password') || 'Yangi parol'}
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type="password"
                                    className="h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-medium text-sm focus-visible:ring-indigo-500"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t('password_settings.confirm_password') || 'Yangi parolni tasdiqlash'}
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    type="password"
                                    className="h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-medium text-sm focus-visible:ring-indigo-500"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                <span>{processing ? t('saving') || 'Saqlanmoqda...' : t('password_settings.save_password') || 'Parolni yangilash'}</span>
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out duration-300"
                                enterFrom="opacity-0 translate-y-1"
                                leave="transition ease-in-out duration-300"
                                leaveTo="opacity-0"
                            >
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                                    <Check className="h-3.5 w-3.5" />
                                    {t('password_settings.saved') || 'Parol muvaffaqiyatli o\'zgartirildi'}
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
