import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail, Phone, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SocialSignIn from '@/components/auth/SocialSignIn';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RegisterForm = {
    name: string;
    phone: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function RegisterCard() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { t } = useTranslation();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="w-full space-y-5">
            {/* Segmented Tab Switcher */}
            <div className="bg-surface-2 border-border flex rounded-xl border p-1">
                <Link
                    href={route('login')}
                    className="text-muted-foreground hover:text-foreground flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all"
                >
                    {t('login.tab_login', 'Kirish')}
                </Link>
                <button
                    type="button"
                    className="bg-primary text-primary-foreground flex-1 cursor-default rounded-lg py-2 text-center text-xs font-bold shadow-sm transition-all"
                >
                    {t('login.tab_register', "Ro'yxatdan o'tish")}
                </button>
            </div>

            {/* Registration Form */}
            <form className="flex flex-col gap-3.5" onSubmit={submit}>
                <div className="grid gap-3">
                    {/* Name */}
                    <div className="grid gap-1">
                        <Label htmlFor="name" className="text-foreground text-xs font-semibold">
                            {t('register.name', 'Ism va familiya')}
                        </Label>
                        <div className="relative">
                            <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                className="border-border bg-surface-2 focus:border-primary focus:ring-primary/20 text-foreground h-10 rounded-xl pl-10 text-sm focus:ring-2"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                                placeholder={t('register.name_placeholder', "Islom Farg'oniy")}
                            />
                        </div>
                        <InputError message={errors.name} />
                    </div>

                    {/* Phone */}
                    <div className="grid gap-1">
                        <Label htmlFor="phone" className="text-foreground text-xs font-semibold">
                            {t('common.phone', 'Telefon raqam')}
                        </Label>
                        <div className="relative">
                            <Phone className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                id="phone"
                                type="tel"
                                required
                                tabIndex={2}
                                autoComplete="tel"
                                className="border-border bg-surface-2 focus:border-primary focus:ring-primary/20 text-foreground h-10 rounded-xl pl-10 text-sm focus:ring-2"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                disabled={processing}
                                placeholder={t('common.phone_placeholder', '+998 90 123 45 67')}
                            />
                        </div>
                        <InputError message={errors.phone} />
                    </div>

                    {/* Email */}
                    <div className="grid gap-1">
                        <Label htmlFor="email" className="text-foreground text-xs font-semibold">
                            {t('register.email', 'Email (ixtiyoriy)')}
                        </Label>
                        <div className="relative">
                            <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                id="email"
                                type="email"
                                tabIndex={3}
                                autoComplete="email"
                                className="border-border bg-surface-2 focus:border-primary focus:ring-primary/20 text-foreground h-10 rounded-xl pl-10 text-sm focus:ring-2"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={processing}
                                placeholder={t('register.email_placeholder', 'misol@multitest.uz')}
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    {/* Password */}
                    <div className="grid gap-1">
                        <Label htmlFor="password" className="text-foreground text-xs font-semibold">
                            {t('register.password', 'Parol')}
                        </Label>
                        <div className="relative">
                            <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                className="border-border bg-surface-2 focus:border-primary focus:ring-primary/20 text-foreground h-10 rounded-xl pr-10 pl-10 text-sm focus:ring-2"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder={t('register.password_placeholder', 'Kamida 8 ta belgi')}
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? t('auth.hide_password', 'Yashirish') : t('auth.show_password', "Ko'rsatish")}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer rounded p-0.5 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {/* Password Confirmation */}
                    <div className="grid gap-1">
                        <Label htmlFor="password_confirmation" className="text-foreground text-xs font-semibold">
                            {t('register.password_confirmation', 'Parolni tasdiqlang')}
                        </Label>
                        <div className="relative">
                            <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                tabIndex={5}
                                autoComplete="new-password"
                                className="border-border bg-surface-2 focus:border-primary focus:ring-primary/20 text-foreground h-10 rounded-xl pr-10 pl-10 text-sm focus:ring-2"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder={t('register.password_confirmation_placeholder', 'Parolni qayta kiriting')}
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                aria-label={showConfirmPassword ? t('auth.hide_password', 'Yashirish') : t('auth.show_password', "Ko'rsatish")}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer rounded p-0.5 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2 h-11 w-full cursor-pointer rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                        tabIndex={6}
                        disabled={processing}
                    >
                        {processing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {t('register.submit', "Ro'yxatdan o'tish")}
                    </Button>
                </div>
            </form>

            {/* Divider */}
            <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                    <span className="border-border w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs tracking-wider uppercase">
                    <span className="bg-background text-muted-foreground px-3 font-medium">{t('register.or', 'yoki')}</span>
                </div>
            </div>

            {/* Social Login */}
            <SocialSignIn />

            {/* Terms notice */}
            <p className="text-muted-foreground pt-1 text-center text-[11px] leading-relaxed">
                {t('register.terms_agreement', "Ro'yxatdan o'tish orqali siz xizmat ko'rsatish shartlariga rozilik bildirasiz.")}
            </p>
        </div>
    );
}
