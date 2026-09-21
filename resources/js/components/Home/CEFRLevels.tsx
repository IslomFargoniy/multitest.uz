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
            color: 'from-blue-500 to-indigo-600',
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
            color: 'from-purple-500 to-pink-600',
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
            color: 'from-emerald-500 to-teal-600',
        },
    ];

    const levels = [
        {
            code: 'B1',
            score: '38 – 50 ball',
            title: t('landing_cefr.b1_title', 'B1 Daraja (38 – 50 ball)'),
            desc: t('landing_cefr.b1_desc', 'Tanish va kundalik mavzularda o\'z fikrini ifoda qila oladi. Grammatika va so\'z boyligi asosiy muloqot uchun yetarli darajada.'),
            benefits: t('landing_cefr.b1_benefit', 'OTM kirish imtihonlarida chet tili fanidan 75% ball beriladi'),
            badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
        },
        {
            code: 'B2',
            score: '51 – 64 ball',
            title: t('landing_cefr.b2_title', 'B2 Daraja (51 – 64 ball)'),
            desc: t('landing_cefr.b2_desc', 'Murakkab mavzularni tushunadi va ravon muloqot qiladi. Bakalavriat va Magistratura uchun asosiy imtiyozli daraja.'),
            benefits: t('landing_cefr.b2_benefit', 'OTM kirish imtihonlarida 100% maksimal ball & Magistratura talabi'),
            badgeBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
            isPopular: true,
        },
        {
            code: 'C1',
            score: '65 – 75 ball',
            title: t('landing_cefr.c1_title', 'C1 Daraja (65 – 75 ball)'),
            desc: t('landing_cefr.c1_desc', 'Professional, akademik va har qanday murakkab mavzuda ravon, aniq va uslubiy jihatdan mukammal so\'zlash darajasi.'),
            benefits: t('landing_cefr.c1_benefit', 'OTMga 100% maksimal ball & Pedagoglarga 50% oylik ustama'),
            badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
        },
    ];

    return (
        <section id="cefr-structure" className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300 mb-4">
                        <Icon icon="solar:diploma-verified-bold" className="text-sm" />
                        <span>{t('landing_cefr.badge', 'UzBMB Standarti')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('landing_cefr.title', 'CEFR (Multi-level) Imtihon Tuzilishi')}
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300">
                        {t('landing_cefr.subtitle', 'O\'zbekiston Davlat Test Markazi (UzBMB) rasmiy talablari asosida tuzilgan to\'liq Speaking simulyatsiyasi')}
                    </p>
                </div>

                {/* 3 Speaking Parts Interactive Showcase */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                    {parts.map((item) => (
                        <div
                            key={item.part}
                            onClick={() => setActivePart(item.part)}
                            className={`cursor-pointer rounded-3xl p-6 transition-all duration-300 border ${
                                activePart === item.part
                                    ? 'bg-white shadow-xl shadow-indigo-500/10 border-indigo-400 dark:bg-slate-900 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                                    : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md`}>
                                    <Icon icon={item.icon} className="text-2xl" />
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {item.duration}
                                </span>
                            </div>

                            <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-black uppercase text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-2">
                                {item.badge}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {item.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                {item.desc}
                            </p>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400">
                                    <strong className="text-slate-700 dark:text-slate-200 font-semibold">{item.questionsCount}</strong>
                                </span>
                                <span className="text-indigo-600 font-medium dark:text-indigo-400">
                                    {item.focus}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CEFR Levels & Scoring Scale */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-10 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {t('landing_cefr.levels_title', 'Baholash Shkalasi va Darajalar')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            {t('landing_cefr.levels_subtitle', 'UzBMB (Milliy sertifikat) rasmiy mezonlariga ko\'ra Speaking va umumiy ballarning darajalarga taqsimoti (maksimal 75 ball)')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {levels.map((lvl) => (
                            <div
                                key={lvl.code}
                                className={`relative rounded-2xl p-6 border transition-all ${
                                    lvl.isPopular
                                        ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md ring-1 ring-indigo-500/30'
                                        : 'border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30'
                                }`}
                            >
                                {lvl.isPopular && (
                                    <span className="absolute -top-3 right-4 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                                        {t('landing_cefr.most_demanded', 'Eng Ko\'p Talab Qilinadi')}
                                    </span>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                    <span className={`rounded-xl border px-3 py-1 text-base font-black ${lvl.badgeBg}`}>
                                        {lvl.code}
                                    </span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {lvl.score}
                                    </span>
                                </div>

                                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                                    {lvl.title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                    {lvl.desc}
                                </p>

                                <div className="rounded-xl bg-white/80 p-3 text-[11px] font-medium text-slate-700 dark:bg-slate-900/80 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 flex items-start gap-2">
                                    <Icon icon="solar:star-bold" className="text-amber-500 shrink-0 text-sm mt-0.5" />
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
