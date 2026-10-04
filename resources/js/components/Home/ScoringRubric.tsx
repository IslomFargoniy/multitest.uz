import React from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const ScoringRubric: React.FC = () => {
    const { t } = useTranslation();

    const rubrics = [
        {
            icon: 'solar:chat-line-bold',
            title: t('landing_scoring.fluency_title', 'Fluency & Coherence'),
            desc: t('landing_scoring.fluency_desc', 'Nutqning ravonligi, tabiiy uzluksizligi, to\'xtalishsiz gapirish va mantiqiy bog\'lovchilardan to\'g\'ri foydalanish.'),
            badge: t('landing_scoring.weight_badge', '25% Salmoq'),
            color: 'text-primary bg-primary/10 border-primary/20',
        },
        {
            icon: 'solar:book-bookmark-bold',
            title: t('landing_scoring.lexical_title', 'Lexical Resource'),
            desc: t('landing_scoring.lexical_desc', 'Mavzuga oid boy so\'z boyligi, sinonimlar, idiomatik ifodalar, akademik terminlar va kollokatsiyalarning xilma-xilligi.'),
            badge: t('landing_scoring.weight_badge', '25% Salmoq'),
            color: 'text-primary bg-primary/10 border-primary/20',
        },
        {
            icon: 'solar:code-file-bold',
            title: t('landing_scoring.grammar_title', 'Grammatical Range & Accuracy'),
            desc: t('landing_scoring.grammar_desc', 'Murakkab gap tuzilmalari, zamonlarning to\'g\'ri qo\'llanilishi va grammatik xatolar sonining minimal bo\'lishi.'),
            badge: t('landing_scoring.weight_badge', '25% Salmoq'),
            color: 'text-primary bg-primary/10 border-primary/20',
        },
        {
            icon: 'solar:soundwave-bold',
            title: t('landing_scoring.pronunciation_title', 'Pronunciation & Intonation'),
            desc: t('landing_scoring.pronunciation_desc', 'Har bir tovushning to\'g\'ri artikulyatsiyasi, so\'z va gap urg\'ulari, tabiiy intonatsiya hamda nutqning tushunarliligi.'),
            badge: t('landing_scoring.weight_badge', '25% Salmoq'),
            color: 'text-success-text bg-success-bg border-success/20',
        },
    ];

    return (
        <section id="ai-rubrics" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
                        <Icon icon="solar:magic-stick-3-bold" className="text-sm" />
                        <span>{t('landing_scoring.badge', 'AI Baholash Tizimi')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        {t('landing_scoring.title', 'Sun\'iy Intellekt Qanday Baholaydi?')}
                    </h2>
                    <p className="mt-3 text-base md:text-lg text-muted-foreground">
                        {t('landing_scoring.subtitle', 'Rasmiy UzBMB va CEFR mezonlari asosida ishlab chiqilgan model nutqingizni 4 ta asosiy mezon bo\'yicha baholaydi')}
                    </p>
                </div>

                {/* Rubric Cards Grid + Real AI Result Card Demo */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left: 4 Pillars */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {rubrics.map((r, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-border-strong transition-colors"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${r.color}`}>
                                        <Icon icon={r.icon} className="text-xl" />
                                    </div>
                                    <span className="rounded-full bg-secondary border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                        {r.badge}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-1.5">
                                    {r.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {r.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Right: AI Score Certificate Preview Card */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl">
                            {/* Certificate Badge */}
                            <div className="flex items-center justify-between border-b border-border pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                                        AI
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">Multitest Diagnostic Report</h4>
                                        <p className="text-xs text-muted-foreground">Official Format Assessment</p>
                                    </div>
                                </div>
                                <span className="rounded-xl bg-success-bg px-3 py-1 text-xs font-bold text-success-text border border-success/20">
                                    CEFR C1 (71 ball)
                                </span>
                            </div>

                            {/* Score Breakdown Progress Bars */}
                            <div className="mt-6 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                                        <span className="text-foreground">Fluency & Coherence</span>
                                        <span className="text-primary font-bold font-mono">72 / 75 (C1)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                        <div className="h-full rounded-full bg-primary w-[96%]" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                                        <span className="text-foreground">Lexical Resource</span>
                                        <span className="text-primary font-bold font-mono">68 / 75 (C1)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                        <div className="h-full rounded-full bg-primary w-[90%]" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                                        <span className="text-foreground">Grammatical Accuracy</span>
                                        <span className="text-primary font-bold font-mono">70 / 75 (C1)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                        <div className="h-full rounded-full bg-primary w-[93%]" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                                        <span className="text-foreground">Pronunciation & Intonation</span>
                                        <span className="text-success font-bold font-mono">74 / 75 (C1)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                        <div className="h-full rounded-full bg-success w-[98%]" />
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendations Box */}
                            <div className="mt-6 rounded-xl bg-surface-2 p-4 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon icon="solar:lightbulb-bolt-bold" className="text-warning text-lg" />
                                    <p className="text-xs font-bold text-foreground">AI Tavsiyasi</p>
                                </div>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    "Part 1.2 da rasmlarni taqqoslashda 'whereas', 'in contrast' kabi bog'lovchilardan to'g'ri foydalandingiz. C1 darajangizni yanada mustahkamlash uchun Part 3 munozarasida akademik kollokatsiyalarni kengaytiring."
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
