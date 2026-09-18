import React, { FormEventHandler } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import {
    User as UserIcon,
    AtSign,
    Phone,
    Mail,
    Save,
    Check,
    Lock,
    Palette,
    LogOut,
    ChevronRight,
    ShieldCheck,
    Send,
} from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useHaptic } from '@/components/telegram-theme-provider';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    username: string;
    phone: string;
    email: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslation();
    const { impact } = useHaptic();

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name || '',
        username: auth.user.username || '',
        phone: auth.user.phone || '',
        email: auth.user.email || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        impact('medium');
        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const handleLogout = () => {
        if (confirm(t('confirm_logout') || 'Haqiqatan ham tizimdan chiqmoqchimisiz?')) {
            impact('heavy');
            router.post(route('logout'));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('profile_settings.title') || 'Profil sozlamalari'} />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {t('profile_settings.heading') || "Profil ma'lumotlari"}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('profile_settings.description') || "Ismingiz, telefon raqamingiz va kontakt ma'lumotlaringizni yangilang"}
                        </p>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={submit} className="space-y-4 sm:space-y-5">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t('profile_settings.name') || "To'liq ism"}
                            </Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="name"
                                    className="h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-medium text-sm focus-visible:ring-indigo-500"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder={t('profile_settings.full_name') || "Ismingizni kiriting"}
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

                        {/* Username Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t('profile_settings.username') || "Foydalanuvchi nomi"}
                            </Label>
                            <div className="relative">
                                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="username"
                                    className="h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-medium text-sm focus-visible:ring-indigo-500"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    autoComplete="username"
                                    placeholder={t('profile_settings.username') || "username"}
                                />
                            </div>
                            <InputError message={errors.username} />
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t('profile_settings.phone') || "Telefon raqami"}
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="phone"
                                    className="h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-medium text-sm focus-visible:ring-indigo-500"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    autoComplete="tel"
                                    placeholder="+998901234567"
                                />
                            </div>
                            <InputError message={errors.phone} />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t('profile_settings.email') || "Email manzili"}
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-medium text-sm focus-visible:ring-indigo-500"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="email"
                                    placeholder={t('profile_settings.email_address') || "example@gmail.com"}
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                                    {t('profile_settings.unverified_email') || "Email manzilingiz tasdiqlanmagan."}{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="font-bold underline underline-offset-2 hover:text-amber-900"
                                    >
                                        {t('profile_settings.resend_verification_email') || "Qayta yuborish"}
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-1.5 text-xs font-bold text-emerald-600">
                                        {t('profile_settings.verification_link_sent') || "Tasdiqlash havolasi yuborildi."}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                <span>{processing ? t('saving') || 'Saqlanmoqda...' : t('profile_settings.save') || 'Saqlash'}</span>
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
                                    {t('profile_settings.saved') || "Ma'lumotlar muvaffaqiyatli saqlandi"}
                                </p>
                            </Transition>
                        </div>
                    </form>

                    {/* Mobile Quick Settings Menu Group */}
                    <div className="block md:hidden pt-4 space-y-2.5">
                        <div className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                            {t('quick_actions') || 'Tezkor amallar'}
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                            <Link
                                href="/settings/password"
                                onClick={() => impact('light')}
                                className="flex items-center justify-between p-3.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                                            {t('settings_layout.password') || 'Xavfsizlik & Parol'}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                            Parolni o'zgartirish va himoya
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>

                            <Link
                                href="/settings/appearance"
                                onClick={() => impact('light')}
                                className="flex items-center justify-between p-3.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                        <Palette className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                                            {t('settings_layout.appearance') || 'Ilova ko\'rinishi'}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                            Yorug' / Qorong'u rejim
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                                        <LogOut className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                            {t('logout') || 'Tizimdan chiqish'}
                                        </div>
                                        <div className="text-[10px] text-rose-500/70">
                                            Hisobdan chiqish
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-rose-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
