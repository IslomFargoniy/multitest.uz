import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const CEFRLevels: React.FC = () => {
    const { t } = useTranslation();
    const [activePart, setActivePart] = useState<1 | 2 | 3>(1);

    const parts = [
        {
            part: 1 as const,
            badge: t('landing_cefr.part1_badge', 'Part 1'),
            title: t('landing_cefr.part1_title', 'Interview & Daily Topics'),
            desc: t('landing_cefr.part1_desc', '1.1-qismda shaxsiy mavzularda 3 ta savol (har biriga 30 soniya). 1.2-qismda 2 ta rasmni solishtirish va savollarga javob berish (1 daqiqa tayyorgarlik, 2 daqiqa javob).'),
            duration: t('landing_cefr.part1_duration', '3-4 daqiqa'),
            questionsCount: t('landing_cefr.part1_count', '3 ta savol + 2 ta rasm'),
            focus: t('landing_cefr.part1_focus', 'Kundalik muloqot va taqqoslash'),
            icon: 'solar:user-speak-rounded-bold-duotone',
        },
        {
            part: 2 as const,
            badge: t('landing_cefr.part2_badge', 'Part 2'),
            title: t('landing_cefr.part2_title', 'Picture Presentation & Solution'),
            desc: t('landing_cefr.part2_desc', 'Rasm yoki vaziyatga oid 3 ta savol asosida bog\'langan nutq so\'zlash va muammoga yechim taklif qilish (1 daqiqa tayyorgarlik, 2 daqiqa nutq).'),
            duration: t('landing_cefr.part2_duration', '3 daqiqa'),
            questionsCount: t('landing_cefr.part2_count', '1 ta vaziyat + 3 ta savol'),
            focus: t('landing_cefr.part2_focus', 'Taqdimot va mantiqiy xulosalar'),
            icon: 'solar:gallery-wide-bold-duotone',
        },
        {
            part: 3 as const,
            badge: t('landing_cefr.part3_badge', 'Part 3'),
            title: t('landing_cefr.part3_title', 'Discussion & Argumentation'),
            desc: t('landing_cefr.part3_desc', 'Berilgan dolzarb mavzu bo\'yicha \'for\' (yoqlash) va \'against\' (qarshilik) dalillarini keltirib, muvozanatli va asosli nutq so\'zlash (1 daqiqa tayyorgarlik, 2 daqiqa nutq).'),
            duration: t('landing_cefr.part3_duration', '3 daqiqa'),
            questionsCount: t('landing_cefr.part3_count', 'Murakkab mavzu + argumentlar'),
            focus: t('landing_cefr.part3_focus', 'Akademik lug\'at va dalillar'),
            icon: 'solar:chat-round-bold-duotone',
        },
    ];

    const levels = [
        {
            code: 'B1',
            score: '38 – 50 ball',
            title: t('landing_cefr.b1_title', 'B1 Daraja (38 – 50 ball)'),
            desc: t('landing_cefr.b1_desc', 'Tanish va kundalik mavzularda o\'z fikrini ifoda qila oladi. Grammatika va so\'z boyligi asosiy muloqot uchun yetarli darajada.'),
            benefits: t('landing_cefr.b1_benefit', 'OTM kirish imtihonlarida chet tili fanidan 75% ball beriladi'),
            badgeBg: 'bg-warning/10 text-warning-text border-warning/20',
        },
        {
            code: 'B2',
            score: '51 – 64 ball',
            title: t('landing_cefr.b2_title', 'B2 Daraja (51 – 64 ball)'),
            desc: t('landing_cefr.b2_desc', 'Murakkab mavzularni tushunadi va ravon muloqot qiladi. Bakalavriat va Magistratura uchun asosiy imtiyozli daraja.'),
            benefits: t('landing_cefr.b2_benefit', 'OTM kirish imtihonlarida 100% maksimal ball & Magistratura talabi'),
            badgeBg: 'bg-primary/10 text-primary border-primary/20',
            isPopular: true,
        },
        {
            code: 'C1',
            score: '65 – 75 ball',
            title: t('landing_cefr.c1_title', 'C1 Daraja (65 – 75 ball)'),
            desc: t('landing_cefr.c1_desc', 'Professional, akademik va har qanday murakkab mavzuda ravon, aniq va uslubiy jihatdan mukammal so\'zlash darajasi.'),
            benefits: t('landing_cefr.c1_benefit', 'OTMga 100% maksimal ball & Pedagoglarga 50% oylik ustama'),
            badgeBg: 'bg-success-bg text-success-text border-success/20',
        },
    ];

    return (
        <section id="cefr-structure" className="py-16 md:py-24 bg-surface-2/40 border-y border-border">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
                        <Icon icon="solar:diploma-verified-bold" className="text-sm" />
                        <span>{t('landing_cefr.badge', 'UzBMB Standarti')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        {t('landing_cefr.title', 'CEFR (Multi-level) Imtihon Tuzilishi')}
                    </h2>
                    <p className="mt-3 text-base md:text-lg text-muted-foreground">
                        {t('landing_cefr.subtitle', 'O\'zbekiston Davlat Test Markazi (UzBMB) rasmiy talablari asosida tuzilgan to\'liq Speaking simulyatsiyasi')}
                    </p>
                </div>

                {/* 3 Speaking Parts Interactive Showcase */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                    {parts.map((item) => (
                        <div
                            key={item.part}
                            onClick={() => setActivePart(item.part)}
                            className={`cursor-pointer rounded-2xl p-6 transition-colors border ${
                                activePart === item.part
                                    ? 'bg-card border-primary/50 shadow-md ring-1 ring-primary/30'
                                    : 'bg-card border-border hover:border-border-strong shadow-xs'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon icon={item.icon} className="text-2xl" />
                                </div>
                                <span className="rounded-full bg-secondary border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                                    {item.duration}
                                </span>
                            </div>

                            <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary mb-2">
                                {item.badge}
                            </span>
                            <h3 className="text-lg font-bold text-foreground mb-2">
                                {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                {item.desc}
                            </p>

                            <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                                <span className="text-muted-foreground font-medium">
                                    {item.questionsCount}
                                </span>
                                <span className="text-primary font-semibold">
                                    {item.focus}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CEFR Levels & Scoring Scale */}
                <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-xs">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <h3 className="text-2xl font-bold text-foreground">
                            {t('landing_cefr.levels_title', 'Baholash Shkalasi va Darajalar')}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t('landing_cefr.levels_subtitle', 'UzBMB (Milliy sertifikat) rasmiy mezonlariga ko\'ra Speaking va umumiy ballarning darajalarga taqsimoti (maksimal 75 ball)')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {levels.map((lvl) => (
                            <div
                                key={lvl.code}
                                className={`relative rounded-xl p-6 border transition-colors ${
                                    lvl.isPopular
                                        ? 'border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20'
                                        : 'border-border bg-secondary/30'
                                }`}
                            >
                                {lvl.isPopular && (
                                    <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold uppercase text-primary-foreground shadow-xs">
                                        {t('landing_cefr.most_demanded', 'Eng Ko\'p Talab Qilinadi')}
                                    </span>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                    <span className={`rounded-xl border px-3 py-1 text-sm font-bold font-mono ${lvl.badgeBg}`}>
                                        {lvl.code}
                                    </span>
                                    <span className="text-sm font-bold font-mono text-foreground">
                                        {lvl.score}
                                    </span>
                                </div>

                                <h4 className="text-base font-bold text-foreground mb-2">
                                    {lvl.title}
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                    {lvl.desc}
                                </p>

                                <div className="rounded-xl bg-card p-3 text-xs font-medium text-foreground border border-border flex items-start gap-2">
                                    <Icon icon="solar:star-bold" className="text-warning shrink-0 text-sm mt-0.5" />
                                    <span>{lvl.benefits}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CEFRLevels;
