import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';

const ScoreCalculator: React.FC = () => {
    const { t } = useTranslation();

    // Default realistic B2 candidate scores (out of 75)
    const [listening, setListening] = useState<number>(65);
    const [reading, setReading] = useState<number>(68);
    const [writing, setWriting] = useState<number>(58);
    const [speaking, setSpeaking] = useState<number>(62);

    const overallScore = useMemo(() => {
        return Math.round((listening + reading + writing + speaking) / 4);
    }, [listening, reading, writing, speaking]);

    const levelInfo = useMemo(() => {
        if (overallScore >= 65) {
            return {
                level: 'C1',
                color: 'from-emerald-500 to-teal-600',
                textColor: 'text-emerald-600 dark:text-emerald-400',
                badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
                privilege: t('landing_calculator.c1_privilege', '100% maksimal ball & Pedagoglarga 50% oylik ustama'),
                status: 'C1 Daraja (65 – 75 ball)',
            };
        } else if (overallScore >= 51) {
            return {
                level: 'B2',
                color: 'from-indigo-600 to-purple-600',
                textColor: 'text-indigo-600 dark:text-indigo-400',
                badgeBg: 'bg-indigo-500/10 border-indigo-500/30',
                privilege: t('landing_calculator.b2_privilege', 'OTM kirish imtihonlarida 100% maksimal ball & Magistratura talabi'),
                status: 'B2 Daraja (51 – 64 ball)',
            };
        } else if (overallScore >= 38) {
            return {
                level: 'B1',
                color: 'from-amber-500 to-orange-600',
                textColor: 'text-amber-600 dark:text-amber-400',
                badgeBg: 'bg-amber-500/10 border-amber-500/30',
                privilege: t('landing_calculator.b1_privilege', 'OTM kirish imtihonlarida chet tili fanidan 75% ball beriladi'),
                status: 'B1 Daraja (38 – 50 ball)',
            };
        } else {
            return {
                level: 'A2',
                color: 'from-slate-500 to-slate-700',
                textColor: 'text-slate-600 dark:text-slate-400',
                badgeBg: 'bg-slate-500/10 border-slate-500/30',
                privilege: t('landing_calculator.a2_privilege', '38 balldan past natijaga sertifikat berilmaydi'),
                status: 'Sertifikatsiz (< 38 ball)',
            };
        }
    }, [overallScore, t]);

    const getScoreBadge = (score: number) => {
        if (score >= 65) return { label: 'C1', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' };
        if (score >= 51) return { label: 'B2', bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' };
        if (score >= 38) return { label: 'B1', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' };
        return { label: 'A2', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    };

    return (
        <section id="cefr-calculator" className="py-16 md:py-24 bg-gradient-to-b from-slate-50/50 via-background to-slate-50/50 dark:from-slate-900/30 dark:via-background dark:to-slate-900/30">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300 mb-4">
                        <Icon icon="solar:calculator-bold" className="text-sm" />
                        <span>{t('landing_calculator.badge', 'Interaktiv Vosita')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('landing_calculator.title', 'CEFR Darajangizni Hisoblang')}
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300">
                        {t('landing_calculator.subtitle', 'Har bir modul bo\'yicha taxminiy ballaringizni kiriting va umumiy CEFR darajangiz hamda imtiyozlarni aniqlang')}
                    </p>
                </div>

                {/* Main Calculator Box */}
                <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white p-6 sm:p-10 md:p-12 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Sliders Area */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Listening Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                        <Icon icon="solar:headphones-round-bold" className="text-blue-500 text-lg" />
                                        <span>{t('landing_calculator.listening', 'Listening')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${getScoreBadge(listening).bg}`}>
                                            {getScoreBadge(listening).label}
                                        </span>
                                        <span className="font-extrabold text-slate-900 dark:text-white w-12 text-right">
                                            {listening} / 75
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="75"
                                    value={listening}
                                    onChange={(e) => setListening(Number(e.target.value))}
                                    className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>

                            {/* Reading Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                        <Icon icon="solar:book-2-bold" className="text-emerald-500 text-lg" />
                                        <span>{t('landing_calculator.reading', 'Reading')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${getScoreBadge(reading).bg}`}>
                                            {getScoreBadge(reading).label}
                                        </span>
                                        <span className="font-extrabold text-slate-900 dark:text-white w-12 text-right">
                                            {reading} / 75
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="75"
                                    value={reading}
                                    onChange={(e) => setReading(Number(e.target.value))}
                                    className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                            </div>

                            {/* Writing Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                        <Icon icon="solar:pen-new-square-bold" className="text-purple-500 text-lg" />
                                        <span>{t('landing_calculator.writing', 'Writing')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${getScoreBadge(writing).bg}`}>
                                            {getScoreBadge(writing).label}
                                        </span>
                                        <span className="font-extrabold text-slate-900 dark:text-white w-12 text-right">
                                            {writing} / 75
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="75"
                                    value={writing}
                                    onChange={(e) => setWriting(Number(e.target.value))}
                                    className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                            </div>

                            {/* Speaking Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                        <Icon icon="solar:microphone-3-bold" className="text-pink-500 text-lg" />
                                        <span>{t('landing_calculator.speaking', 'Speaking')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${getScoreBadge(speaking).bg}`}>
                                            {getScoreBadge(speaking).label}
                                        </span>
                                        <span className="font-extrabold text-slate-900 dark:text-white w-12 text-right">
                                            {speaking} / 75
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="75"
                                    value={speaking}
                                    onChange={(e) => setSpeaking(Number(e.target.value))}
                                    className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-600"
                                />
                            </div>
                        </div>

                        {/* Result Display Gauge & Privilege */}
                        <div className="lg:col-span-5">
                            <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6 sm:p-8 text-center dark:border-slate-800 dark:from-slate-950 dark:to-indigo-950/20 shadow-inner">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {t('landing_calculator.predicted_level', 'Taxminiy Daraja')}
                                </span>

                                {/* Big Level & Overall Score */}
                                <div className="my-4 flex items-center justify-center gap-4">
                                    <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${levelInfo.color} text-white shadow-lg text-3xl font-black`}>
                                        {levelInfo.level}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                                            {overallScore}{' '}
                                            <span className="text-sm font-semibold text-slate-400">/ 75</span>
                                        </div>
                                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${levelInfo.badgeBg} ${levelInfo.textColor}`}>
                                            {levelInfo.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Official Privilege Box */}
                                <div className="mt-5 rounded-2xl bg-white/90 p-4 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800 text-left">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Icon icon="solar:medal-ribbons-star-bold" className="text-amber-500 text-base" />
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                            {t('landing_calculator.privilege_title', 'Sizga beriladigan imtiyoz')}:
                                        </p>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                        {levelInfo.privilege}
                                    </p>
                                </div>

                                {/* Action Button */}
                                <div className="mt-6">
                                    <Link
                                        href="/test"
                                        className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95"
                                    >
                                        <Icon icon="solar:play-circle-bold" className="text-xl" />
                                        <span>{t('landing_calculator.practice_cta', 'Speaking darajasini oshirish')}</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScoreCalculator;
