import React from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const ScoringRubric: React.FC = () => {
    const { t } = useTranslation();

    const rubrics = [
        {
            icon: 'solar:chat-line-bold',
            title: t('landing_scoring.fluency_title', 'Fluency & Coherence'),
            desc: t('landing_scoring.fluency_desc', 'Nutqning uzluksizligi, to\'xtalishsiz gapirish, logik bog\'liqlik va konnektorlardan to\'g\'ri foydalanish.'),
            badge: '25% Salmoq',
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-900/50 dark:text-indigo-400',
        },
        {
            icon: 'solar:book-bookmark-bold',
            title: t('landing_scoring.lexical_title', 'Lexical Resource'),
            desc: t('landing_scoring.lexical_desc', 'So\'z boyligi, sinonimlar, idiomatik ifodalar, akademik terminlar va kollokatsiyalarning xilma-xilligi.'),
            badge: '25% Salmoq',
            color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-900/50 dark:text-purple-400',
        },
        {
            icon: 'solar:code-file-bold',
            title: t('landing_scoring.grammar_title', 'Grammatical Range & Accuracy'),
            desc: t('landing_scoring.grammar_desc', 'Murakkab gap tuzilmalari, zamonlarning to\'g\'ri qo\'llanilishi va grammatik xatolar sonining minimal bo\'lishi.'),
            badge: '25% Salmoq',
            color: 'text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-950/50 dark:border-pink-900/50 dark:text-pink-400',
        },
        {
            icon: 'solar:soundwave-bold',
            title: t('landing_scoring.pronunciation_title', 'Pronunciation & Accent'),
            desc: t('landing_scoring.pronunciation_desc', 'Har bir tovushning to\'g\'ri artikulyatsiyasi, so\'z urg\'ulari, intonatsiya va nutqning tushunarliligi.'),
            badge: '25% Salmoq',
            color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900/50 dark:text-emerald-400',
        },
    ];

    return (
        <section id="ai-rubrics" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50/80 px-3.5 py-1 text-xs font-bold text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/50 dark:text-purple-300 mb-4">
                        <Icon icon="solar:magic-stick-3-bold" className="text-sm" />
                        <span>{t('landing_scoring.badge', 'AI Baholash Tizimi')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('landing_scoring.title', 'Sun\'iy Intellekt Qanday Baholaydi?')}
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300">
                        {t('landing_scoring.subtitle', 'Xalqaro CEFR va UzBMB mezonlari asosida ishlab chiqilgan neyron tarmoq sizning har bir jumlani sinchkovlik bilan tekshiradi')}
                    </p>
                </div>

                {/* Rubric Cards Grid + Real AI Result Card Demo */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left: 4 Pillars */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {rubrics.map((r, i) => (
                            <div
                                key={i}
                                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${r.color}`}>
                                        <Icon icon={r.icon} className="text-xl" />
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        {r.badge}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                                    {r.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {r.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Right: AI Score Certificate Preview Card */}
                    <div className="lg:col-span-5">
                        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-white to-white p-6 md:p-8 shadow-2xl dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900">
                            {/* Certificate Badge */}
                            <div className="flex items-center justify-between border-b border-indigo-100 pb-5 dark:border-indigo-900/40">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-sm">
                                        AI
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Multitest Diagnostic Report</h4>
                                        <p className="text-[11px] text-slate-500">Official Format Assessment</p>
                                    </div>
                                </div>
                                <span className="rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 border border-emerald-500/20">
                                    CEFR B2+ (72)
                                </span>
                            </div>

                            {/* Score Breakdown Progress Bars */}
                            <div className="mt-6 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-700 dark:text-slate-300">Fluency & Coherence</span>
                                        <span className="text-indigo-600 font-black">74 / 75 (C1)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div className="h-full rounded-full bg-indigo-600 w-[95%]" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-700 dark:text-slate-300">Lexical Resource</span>
                                        <span className="text-purple-600 font-black">68 / 75 (B2)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div className="h-full rounded-full bg-purple-600 w-[80%]" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-700 dark:text-slate-300">Grammatical Accuracy</span>
                                        <span className="text-pink-600 font-black">70 / 75 (B2)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div className="h-full rounded-full bg-pink-600 w-[85%]" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-700 dark:text-slate-300">Pronunciation</span>
                                        <span className="text-emerald-600 font-black">76 / 75 (C1)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div className="h-full rounded-full bg-emerald-600 w-[98%]" />
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendations Box */}
                            <div className="mt-6 rounded-2xl bg-indigo-50/60 p-4 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon icon="solar:lightbulb-bolt-bold" className="text-amber-500 text-lg" />
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Tavsiyasi</p>
                                </div>
                                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                                    "Part 2 da rasmlarni taqqoslashda 'whereas', 'in contrast' kabi bog'lovchilardan unumli foydalandingiz. C1 darajaga chiqish uchun Part 3 da idiomatik kollokatsiyalarni ko'proq ishlating."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScoringRubric;
