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
                badgeBg: 'bg-success-bg text-success-text border-success/20',
                privilege: t('landing_calculator.c1_privilege', '100% maksimal ball & Pedagoglarga 50% oylik ustama'),
                status: 'C1 Daraja (65 – 75 ball)',
            };
        } else if (overallScore >= 51) {
            return {
                level: 'B2',
                badgeBg: 'bg-primary/10 text-primary border-primary/20',
                privilege: t('landing_calculator.b2_privilege', 'OTM kirish imtihonlarida 100% maksimal ball & Magistratura talabi'),
                status: 'B2 Daraja (51 – 64 ball)',
            };
        } else if (overallScore >= 38) {
            return {
                level: 'B1',
                badgeBg: 'bg-warning/10 text-warning-text border-warning/20',
                privilege: t('landing_calculator.b1_privilege', 'OTM kirish imtihonlarida chet tili fanidan 75% ball beriladi'),
                status: 'B1 Daraja (38 – 50 ball)',
            };
        } else {
            return {
                level: 'A2',
                badgeBg: 'bg-secondary text-muted-foreground border-border',
                privilege: t('landing_calculator.a2_privilege', '38 balldan past natijaga sertifikat berilmaydi'),
                status: 'Sertifikatsiz (< 38 ball)',
            };
        }
    }, [overallScore, t]);

    const getScoreBadge = (score: number) => {
        if (score >= 65) return { label: 'C1', bg: 'bg-success-bg text-success-text border border-success/20' };
        if (score >= 51) return { label: 'B2', bg: 'bg-primary/10 text-primary border border-primary/20' };
        if (score >= 38) return { label: 'B1', bg: 'bg-warning/10 text-warning-text border border-warning/20' };
        return { label: 'A2', bg: 'bg-secondary text-muted-foreground border border-border' };
    };

    return (
        <section id="cefr-calculator" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
                        <Icon icon="solar:calculator-bold" className="text-sm" />
                        <span>{t('landing_calculator.badge', 'Interaktiv Vosita')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        {t('landing_calculator.title', 'CEFR Darajangizni Hisoblang')}
                    </h2>
                    <p className="mt-3 text-base md:text-lg text-muted-foreground">
                        {t('landing_calculator.subtitle', 'Har bir modul bo\'yicha taxminiy ballaringizni kiriting va umumiy CEFR darajangiz hamda imtiyozlarni aniqlang')}
                    </p>
                </div>

                {/* Main Calculator Box */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-10 md:p-12 shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Sliders Area */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Listening Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <Icon icon="solar:headphones-round-bold" className="text-primary text-lg" />
                                        <span>{t('landing_calculator.listening', 'Listening')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${getScoreBadge(listening).bg}`}>
                                            {getScoreBadge(listening).label}
                                        </span>
                                        <span className="font-bold font-mono text-foreground w-12 text-right">
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
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            {/* Reading Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <Icon icon="solar:book-2-bold" className="text-primary text-lg" />
                                        <span>{t('landing_calculator.reading', 'Reading')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${getScoreBadge(reading).bg}`}>
                                            {getScoreBadge(reading).label}
                                        </span>
                                        <span className="font-bold font-mono text-foreground w-12 text-right">
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
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            {/* Writing Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <Icon icon="solar:pen-new-square-bold" className="text-primary text-lg" />
                                        <span>{t('landing_calculator.writing', 'Writing')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${getScoreBadge(writing).bg}`}>
                                            {getScoreBadge(writing).label}
                                        </span>
                                        <span className="font-bold font-mono text-foreground w-12 text-right">
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
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            {/* Speaking Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <Icon icon="solar:microphone-3-bold" className="text-primary text-lg" />
                                        <span>{t('landing_calculator.speaking', 'Speaking')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${getScoreBadge(speaking).bg}`}>
                                            {getScoreBadge(speaking).label}
                                        </span>
                                        <span className="font-bold font-mono text-foreground w-12 text-right">
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
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>

                        {/* Result Display Gauge & Privilege */}
                        <div className="lg:col-span-5">
                            <div className="rounded-2xl border border-border bg-surface-2 p-6 sm:p-8 text-center shadow-inner">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('landing_calculator.predicted_level', 'Taxminiy Daraja')}
                                </span>

                                {/* Big Level & Overall Score */}
                                <div className="my-4 flex items-center justify-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm text-2xl font-bold font-display">
                                        {levelInfo.level}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-3xl sm:text-4xl font-bold font-mono text-foreground">
                                            {overallScore}{' '}
                                            <span className="text-sm font-semibold text-muted-foreground">/ 75</span>
                                        </div>
                                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${levelInfo.badgeBg}`}>
                                            {levelInfo.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Official Privilege Box */}
                                <div className="mt-5 rounded-xl bg-card p-4 border border-border text-left">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Icon icon="solar:medal-ribbons-star-bold" className="text-warning text-base" />
                                        <p className="text-xs font-bold text-foreground">
                                            {t('landing_calculator.privilege_title', 'Sizga beriladigan imtiyoz')}:
                                        </p>
                                    </div>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {levelInfo.privilege}
                                    </p>
                                </div>

                                {/* Action Button */}
                                <div className="mt-6">
                                    <Link
                                        href="/test"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:scale-95"
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
