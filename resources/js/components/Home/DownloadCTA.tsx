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
            color: 'text-indigo-600 dark:text-indigo-400',
        },
        {
            value: t('landing_download.stat_tests', '50,000+'),
            label: t('landing_download.stat_tests_label', 'Topshirilgan testlar'),
            icon: 'solar:document-add-bold',
            color: 'text-purple-600 dark:text-purple-400',
        },
        {
            value: t('landing_download.stat_accuracy', '98.5%'),
            label: t('landing_download.stat_accuracy_label', 'AI baholash aniqligi'),
            icon: 'solar:shield-check-bold',
            color: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            value: t('landing_download.stat_satisfaction', '4.9 / 5'),
            label: t('landing_download.stat_satisfaction_label', 'Foydalanuvchi bahosi'),
            icon: 'solar:star-bold',
            color: 'text-amber-500',
        },
    ];

    return (
        <section id="download-apps" className="py-16 md:py-24 bg-gradient-to-b from-slate-50/50 to-indigo-50/30 dark:from-slate-900/30 dark:to-indigo-950/20">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Main CTA Card */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-14 text-white shadow-2xl">
                    {/* Background Decorative Rings */}
                    <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300 backdrop-blur-md">
                                <Icon icon="solar:smartphone-2-bold" className="text-sm" />
                                <span>{t('landing_download.badge', 'Ekotizim')}</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                                {t('landing_download.title', 'Har Qanday Qurilmada Qulay O\'rganing')}
                            </h2>

                            <p className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed">
                                {t('landing_download.subtitle', 'Kompyuter, telefon brauzeri, rasmiy Android ilova yoki Telegram boti orqali uzluksiz amaliyot qiling')}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                <a
                                    href="https://t.me/MultitestUzBot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 rounded-2xl bg-sky-500 hover:bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Icon icon="tabler:brand-telegram" className="text-2xl" />
                                    <span>Telegram Bot (@MultitestUzBot)</span>
                                </a>

                                <a
                                    href="/multitest.apk"
                                    className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                                >
                                    <Icon icon="tabler:brand-android" className="text-2xl text-emerald-400" />
                                    <span>Android Ilova (APK)</span>
                                </a>
                            </div>
                        </div>

                        {/* Right: Feature Highlights */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                                        <Icon icon="tabler:brand-telegram" className="text-xl" />
                                    </div>
                                    <h4 className="font-bold text-white text-sm">
                                        {t('landing_download.bot_title', 'Telegram Bot (@MultitestUzBot)')}
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {t('landing_download.bot_desc', 'Telegramdan chiqmasdan, WebApp orqali testlarni bajaring va natijalarni to\'g\'ridan-to\'g\'ri xabarda qabul qiling.')}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                        <Icon icon="tabler:brand-android" className="text-xl" />
                                    </div>
                                    <h4 className="font-bold text-white text-sm">
                                        {t('landing_download.android_title', 'Android Ilova')}
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {t('landing_download.android_desc', 'Google Play va to\'g\'ridan-to\'g\'ri APK orqali o\'rnating, qulay ovoz yozish va push-bildirishnomalardan foydalaning.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Stats Counter Bar */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="flex justify-center mb-2">
                                <Icon icon={stat.icon} className={`text-2xl ${stat.color}`} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {stat.value}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
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
