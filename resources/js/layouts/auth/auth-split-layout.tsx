import AppLogoIcon from '@/components/app-logo-icon';
import LanguageBar from '@/components/language';
import { Link } from '@inertiajs/react';
import { Award, CheckCircle2, Headphones, Play, Sparkles, TrendingUp } from 'lucide-react';
import { type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { t } = useTranslation();

    return (
        <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative grid min-h-dvh lg:grid-cols-12">
            {/* Left Column: SaaS Product Showcase (Desktop only) */}
            <div className="bg-surface-sunken border-border relative hidden flex-col justify-between overflow-hidden border-r p-10 lg:col-span-6 lg:flex xl:col-span-6 xl:p-14">
                {/* Brand Header */}
                <div className="relative z-10">
                    <Link href="/" className="group inline-flex items-center gap-3">
                        <div className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-xl shadow-sm">
                            <AppLogoIcon className="h-6 w-6 fill-current text-white" />
                        </div>
                        <span className="text-foreground text-xl font-bold tracking-tight">
                            MultiTest<span className="text-primary">.uz</span>
                        </span>
                    </Link>
                    <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
                        {t('auth.tagline', "Milliy va xalqaro CEFR Speaking imtihonlariga tayyorgarlik ko'rish platformasi")}
                    </p>
                </div>

                {/* Center Showcase Cards */}
                <div className="relative z-10 my-8 max-w-md space-y-4">
                    {/* Card 1: UzBMB CEFR C1 Certificate Seal */}
                    <div className="border-border bg-surface hover:border-border-strong rounded-2xl border p-5 shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-success-bg border-success/30 text-success flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border">
                                <Award className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-foreground text-base font-bold tracking-tight">UzBMB CEFR C1</h3>
                                    <span className="bg-success-bg text-success-text border-success/30 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold">
                                        Davlat standarti
                                    </span>
                                </div>
                                <p className="text-muted-foreground mt-0.5 text-xs">Rasmiy baholash mezoni va haqiqiy imtihon simulyatori</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Interactive Speaking Wave preview */}
                    <div className="border-border bg-surface hover:border-border-strong rounded-2xl border p-5 shadow-sm transition-all">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
                                <Headphones className="text-primary h-4 w-4" />
                                <span>Speaking Test Practice</span>
                            </div>
                            <span className="text-foreground font-mono text-xs font-bold tabular-nums">00:42 / 01:30</span>
                        </div>
                        <div className="bg-surface-sunken border-border flex items-center gap-3 rounded-xl border p-3">
                            <div className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                                <Play className="ml-0.5 h-4 w-4 fill-current" />
                            </div>
                            <div className="flex h-6 flex-1 items-center gap-1.5">
                                {[40, 65, 85, 45, 95, 70, 40, 80, 100, 60, 45, 85, 75, 40, 90, 60, 45, 70, 90, 50, 65, 80, 40].map((h, i) => (
                                    <span key={i} className="bg-primary/80 flex-1 rounded-full" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Platform Statistics */}
                    <div className="border-border-strong bg-surface-2 flex items-center justify-between rounded-xl border px-4 py-3 text-xs">
                        <div className="text-foreground flex items-center gap-2 font-bold">
                            <Sparkles className="text-primary h-4 w-4" />
                            <span>10,000+ topshirilgan testlar</span>
                        </div>
                        <span className="text-success flex items-center gap-1 font-semibold">
                            <TrendingUp className="h-3.5 w-3.5" />
                            94% muvaffaqiyat
                        </span>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="border-border text-muted-foreground relative z-10 flex items-center justify-between border-t pt-4 text-xs">
                    <p className="flex items-center gap-2">
                        <CheckCircle2 className="text-success h-3.5 w-3.5" />
                        Sun'iy intellekt va professional ustozlar tahlili
                    </p>
                    <span className="font-mono opacity-60">v1.0</span>
                </div>
            </div>

            {/* Right Column: Form Container */}
            <div className="flex min-h-dvh flex-col justify-between p-6 sm:p-10 lg:col-span-6 lg:p-12 xl:col-span-6 xl:p-16">
                {/* Top Bar: Mobile Logo & Language Bar */}
                <div className="mb-6 flex w-full items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2.5 lg:hidden">
                        <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl shadow-sm">
                            <AppLogoIcon className="h-5 w-5 fill-current text-white" />
                        </div>
                        <span className="text-foreground text-lg font-bold tracking-tight">
                            MultiTest<span className="text-primary">.uz</span>
                        </span>
                    </Link>
                    <div className="ml-auto">
                        <LanguageBar />
                    </div>
                </div>

                {/* Form Main Area */}
                <div className="mx-auto my-auto w-full max-w-[420px] py-4">
                    {title && (
                        <div className="mb-6 text-center sm:text-left">
                            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                            {description && <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{description}</p>}
                        </div>
                    )}
                    {children}
                </div>

                {/* Bottom Footer Note */}
                <div className="text-muted-foreground w-full pt-4 text-center text-xs">
                    © {new Date().getFullYear()} MultiTest.uz. {t('auth.all_rights_reserved', 'Barcha huquqlar himoyalangan')}.
                </div>
            </div>
        </div>
    );
}
