import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import SocialSignIn from '@/components/auth/SocialSignIn';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email_or_phone: string;
    password: string;
    remember: boolean;
};

export default function LoginCard() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email_or_phone: '',
        password: '',
        remember: false,
    });

    const { t } = useTranslation();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="mx-auto w-full max-w-md space-y-4 sm:space-y-6">
            {/* Social Login Section */}
            <SocialSignIn />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="bg-card px-3 font-semibold text-muted-foreground">{t('login.or')}</span>
                </div>
            </div>

            {/* Main Login Form */}
            <form className="flex flex-col gap-4 sm:gap-5" onSubmit={submit}>
                <div className="grid gap-3 sm:gap-4">
                    {/* Identifier Input (Email or Phone) */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="email_or_phone" className="text-sm font-semibold text-foreground">
                            {t('login.email_or_phone')}
                        </Label>
                        <Input
                            id="email_or_phone"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            className="h-11 rounded-xl border-border bg-secondary focus:ring-2 focus:ring-primary/20 text-foreground"
                            value={data.email_or_phone}
                            onChange={(e) => setData('email_or_phone', e.target.value)}
                            placeholder={t('login.email_placeholder')}
                        />
                        <InputError message={errors.email_or_phone} />
                    </div>

                    {/* Password Input */}
                    <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                                {t('login.password_label')}
                            </Label>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            className="h-11 rounded-xl border-border bg-secondary focus:ring-2 focus:ring-primary/20 text-foreground"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={t('login.password_placeholder')}
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Remember Me Toggle */}
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            tabIndex={3}
                            className="h-5 w-5 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label
                            htmlFor="remember"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                        >
                            {t('login.remember')}
                        </Label>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="mt-2 h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : null}
                        {t('login.submit')}
                    </Button>
                </div>

                {/* Registration Link */}
                <div className="mt-2 text-center text-sm font-medium text-muted-foreground">
                    {t('login.no_account')}{' '}
                    <TextLink href={route('register')} tabIndex={5} className="font-bold text-primary hover:underline">
                        {t('login.signup')}
                    </TextLink>
                </div>
            </form>
        </div>
    );
}
