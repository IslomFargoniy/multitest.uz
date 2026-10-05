import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SocialSignIn from '@/components/auth/SocialSignIn';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email_or_phone: string;
    password: string;
    remember: boolean;
};

interface LoginCardProps {
    canResetPassword?: boolean;
}

export default function LoginCard({ canResetPassword = true }: LoginCardProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email_or_phone: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="w-full space-y-5">
            {/* Segmented Tab Switcher */}
            <div className="bg-surface-2 border-border flex rounded-xl border p-1">
                <button
                    type="button"
                    className="bg-primary text-primary-foreground flex-1 cursor-default rounded-lg py-2 text-center text-xs font-bold shadow-sm transition-all"
                >
                    {t('login.tab_login', 'Kirish')}
                </button>
                <Link
                    href={route('register')}
                    className="text-muted-foreground hover:text-foreground flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all"
                >
                    {t('login.tab_register', "Ro'yxatdan o'tish")}
                </Link>
            </div>

            {/* Main Login Form */}
            <form className="flex flex-col gap-4" onSubmit={submit}>
                <div className="grid gap-3.5">
                    {/* Identifier Input (Email or Phone) */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="email_or_phone" className="text-foreground text-xs font-semibold">
                            {t('login.email_or_phone', 'Email yoki telefon raqam')}
                        </Label>
                        <div className="relative">
                            <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                id="email_or_phone"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="username"
                                className="border-border bg-surface-2 focus:border-primary focus:ring-primary/20 text-foreground h-11 rounded-xl pl-10 text-sm focus:ring-2"
                                value={data.email_or_phone}
                                onChange={(e) => setData('email_or_phone', e.target.value)}
                                placeholder={t('login.email_placeholder', 'admin@multitest.uz')}
                            />
                        </div>
                        <InputError message={errors.email_or_phone} />
                    </div>

                    {/* Password Input */}
                    <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-foreground text-xs font-semibold">
                                {t('login.password_label', 'Parol')}
                            </Label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    tabIndex={5}
                                    className="text-primary text-xs font-medium transition-colors hover:underline"
                                >
                                    {t('login.forgot', 'Parolni unutdingizmi?')}
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                className="border-border bg-surface-2 focus:border-primary focus:ring-primary/20 text-foreground h-11 rounded-xl pr-10 pl-10 text-sm focus:ring-2"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={t('login.password_placeholder', '••••••••')}
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

                    {/* Remember Me Toggle */}
                    <div className="flex items-center space-x-2.5 pt-0.5">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            tabIndex={3}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4 rounded"
                        />
                        <Label
                            htmlFor="remember"
                            className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium transition-colors select-none"
                        >
                            {t('login.remember', 'Meni eslab qol')}
                        </Label>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground mt-1 h-11 w-full cursor-pointer rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {t('login.submit', 'Tizimga kirish')}
                    </Button>
                </div>
            </form>

            {/* Divider */}
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="border-border w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs tracking-wider uppercase">
                    <span className="bg-background text-muted-foreground px-3 font-medium">{t('login.or', 'yoki')}</span>
                </div>
            </div>

            {/* Social Login Section */}
            <SocialSignIn />
        </div>
    );
}
