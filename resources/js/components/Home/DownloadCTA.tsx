import React from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const DownloadCTA: React.FC = () => {
    const { t } = useTranslation();

    const stats = [
        {
            value: t('landing_download.stat_users', '10,000+'),
            label: t('landing_download.stat_users_label', 'Faol o\'quvchilar'),
            icon: 'solar:users-group-two-rounded-bold',
            color: 'text-primary',
        },
        {
            value: t('landing_download.stat_tests', '50,000+'),
            label: t('landing_download.stat_tests_label', 'Topshirilgan testlar'),
            icon: 'solar:document-add-bold',
            color: 'text-primary',
        },
        {
            value: t('landing_download.stat_accuracy', '98.5%'),
            label: t('landing_download.stat_accuracy_label', 'AI baholash aniqligi'),
            icon: 'solar:shield-check-bold',
            color: 'text-success',
        },
        {
            value: t('landing_download.stat_satisfaction', '4.9 / 5'),
            label: t('landing_download.stat_satisfaction_label', 'Foydalanuvchi bahosi'),
            icon: 'solar:star-bold',
            color: 'text-warning',
        },
    ];

    return (
        <section id="download-apps" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Main CTA Card */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-14 text-foreground shadow-xl">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                                <Icon icon="solar:smartphone-2-bold" className="text-sm" />
                                <span>{t('landing_download.badge', 'Ekotizim')}</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
                                {t('landing_download.title', 'Har Qanday Qurilmada Qulay O\'rganing')}
                            </h2>

                            <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
                                {t('landing_download.subtitle', 'Kompyuter, telefon brauzeri, rasmiy Android ilova yoki Telegram boti orqali uzluksiz amaliyot qiling')}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <a
                                    href="https://t.me/MultitestUzBot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:scale-95"
                                >
                                    <Icon icon="tabler:brand-telegram" className="text-2xl" />
                                    <span>Telegram Bot (@MultitestUzBot)</span>
                                </a>

                                <a
                                    href="/multitest.apk"
                                    className="inline-flex items-center gap-3 rounded-xl border border-border bg-secondary hover:bg-accent px-6 py-3.5 text-sm font-semibold text-foreground transition-colors active:scale-95"
                                >
                                    <Icon icon="tabler:brand-android" className="text-2xl text-success" />
                                    <span>Android Ilova (APK)</span>
                                </a>
                            </div>
                        </div>

                        {/* Right: Feature Highlights */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="rounded-xl border border-border bg-surface-2 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon icon="tabler:brand-telegram" className="text-xl" />
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm">
                                        {t('landing_download.bot_title', 'Telegram Bot (@MultitestUzBot)')}
                                    </h4>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('landing_download.bot_desc', 'Telegramdan chiqmasdan, WebApp orqali testlarni bajaring va natijalarni to\'g\'ridan-to\'g\'ri xabarda qabul qiling.')}
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-surface-2 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-bg text-success-text">
                                        <Icon icon="tabler:brand-android" className="text-xl text-success" />
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm">
                                        {t('landing_download.android_title', 'Android Ilova')}
                                    </h4>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('landing_download.android_desc', 'Google Play va to\'g\'ridan-to\'g\'ri APK orqali o\'rnating, qulay ovoz yozish va push-bildirishnomalardan foydalaning.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Stats Counter Bar */}
                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-border bg-card p-6 text-center shadow-xs"
                        >
                            <div className="flex justify-center mb-2">
                                <Icon icon={stat.icon} className={`text-2xl ${stat.color}`} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground tracking-tight">
                                {stat.value}
                            </h3>
                            <p className="text-xs font-semibold text-muted-foreground mt-1">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DownloadCTA;
