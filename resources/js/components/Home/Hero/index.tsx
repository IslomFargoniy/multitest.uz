import { useIsMobile } from '@/hooks/use-mobile';
import { Icon } from '@iconify/react';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { SharedData } from '@/types';

const Hero = () => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const { auth } = usePage<SharedData>().props;

    // Real audio player state
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlayingDemo, setIsPlayingDemo] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(26);

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlayAudio = () => {
        if (!audioRef.current) {
            const audio = new Audio('/en/audio/part-2-voice.mp3');
            audioRef.current = audio;

            audio.addEventListener('timeupdate', () => {
                if (audio.duration) {
                    setCurrentTime(audio.currentTime);
                    setAudioProgress((audio.currentTime / audio.duration) * 100);
                }
            });

            audio.addEventListener('loadedmetadata', () => {
                if (audio.duration) {
                    setDuration(audio.duration);
                }
            });

            audio.addEventListener('ended', () => {
                setIsPlayingDemo(false);
                setAudioProgress(0);
                setCurrentTime(0);
            });

            audio.addEventListener('pause', () => {
                setIsPlayingDemo(false);
            });

            audio.addEventListener('play', () => {
                setIsPlayingDemo(true);
            });
        }

        const audio = audioRef.current;
        if (audio.paused) {
            audio.play().then(() => {
                setIsPlayingDemo(true);
            }).catch((err) => {
                console.error('Audio play error:', err);
                setIsPlayingDemo(false);
            });
        } else {
            audio.pause();
            setIsPlayingDemo(false);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) {
            togglePlayAudio();
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const audio = audioRef.current;
        if (audio.duration) {
            audio.currentTime = percentage * audio.duration;
            setAudioProgress(percentage * 100);
            setCurrentTime(audio.currentTime);
            if (audio.paused) {
                audio.play().catch(() => {});
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current = null;
            }
        };
    }, []);

    return (
        <section id="home-section" className="relative overflow-hidden bg-background pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-16 md:pb-24">
            {/* Background Glow Orbs */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                    {/* Left Column: Headline & Action */}
                    <div className="col-span-1 flex flex-col gap-6 text-left lg:col-span-7">
                        {/* Top Pill / Badge */}
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <Icon icon="solar:verified-check-bold" className="text-base text-primary" />
                            <span>{t('hero.badge')}</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15]">
                            {t('hero.title_prefix', 'UzBMB CEFR & IELTS ')}
                            <span className="text-primary font-display font-black">
                                {t('hero.title_accent', 'Speaking AI')}
                            </span>
                            {t('hero.title_suffix', ' Simulyatori')}
                        </h1>

                        {/* Description */}
                        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                            {t('hero.description')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link
                                href={auth?.user ? route('dashboard') : '/test'}
                                className="group inline-flex items-center gap-3 rounded-xl bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                            >
                                <Icon icon="solar:play-circle-bold" className="text-2xl transition-transform group-hover:rotate-12" />
                                <span>{t('hero.start_mock', 'Mock Testni Boshlash')}</span>
                            </Link>

                            <a
                                href="#cefr-structure"
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground shadow-xs transition-colors hover:bg-accent"
                            >
                                <Icon icon="solar:document-text-bold" className="text-xl text-primary" />
                                <span>{t('hero.exam_format', 'Imtihon Formati')}</span>
                            </a>
                        </div>

                        {/* Key Pillars */}
                        <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3">
                            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon icon="solar:shield-check-bold" className="text-lg" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-foreground">{t('hero.accuracy', '98.5% Aniqlik')}</p>
                                    <p className="text-muted-foreground">{t('hero.accuracy_desc', 'UzBMB standarti')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                                    <Icon icon="solar:bolt-bold" className="text-lg" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-foreground">{t('hero.instant_time', '60 Soniyada')}</p>
                                    <p className="text-muted-foreground">{t('hero.instant_desc', 'Lahzali baho')}</p>
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 sm:col-span-1">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-bg text-success-text">
                                    <Icon icon="solar:medal-ribbon-star-bold" className="text-lg text-success" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-foreground">{t('hero.levels_title', 'B1 • B2 • C1')}</p>
                                    <p className="text-muted-foreground">{t('hero.levels_desc', 'To\'liq darajalar')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interactive AI Speaking Simulation Card */}
                    <div className="col-span-1 lg:col-span-5">
                        <div className="relative mx-auto w-full max-w-md pt-8 pb-8 px-2 sm:px-3">
                            {/* Decorative Floating Badges */}
                            <div className="absolute top-0 left-1 sm:-left-3 z-20 flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 shadow-md">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                                    <Icon icon="solar:cup-star-bold" className="text-sm" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">{t('hero.card_latest_result', 'So\'nggi Natija')}</p>
                                    <p className="text-xs font-bold text-success-text">{t('hero.card_result_val', 'CEFR C1 (71 ball)')}</p>
                                </div>
                            </div>

                            <div className="absolute bottom-0 right-1 sm:-right-3 z-20 flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 shadow-md">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Icon icon="solar:microphone-3-bold" className="text-sm" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">{t('hero.card_ai_eval', 'AI Baholash')}</p>
                                    <p className="text-xs font-bold text-foreground">{t('hero.card_ai_eval_sub', '98% Aniq Transkript')}</p>
                                </div>
                            </div>

                            {/* Main Card UI Preview */}
                            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                                {/* Simulated Mock Header */}
                                <div className="flex items-center justify-between border-b border-border pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                                            DTM
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">{t('hero.card_mock_title', 'Multilevel Speaking Mock')}</h4>
                                            <p className="text-xs text-primary font-medium">{t('hero.card_mock_part', 'Part 2: Comparison & Solution')}</p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-success-bg border border-success/20 px-2.5 py-1 text-xs font-semibold text-success-text">
                                        {t('hero.card_live_badge', 'Jonli Sinov')}
                                    </span>
                                </div>

                                {/* Simulated Question Card */}
                                <div className="mt-4 rounded-xl bg-surface-2 border border-border p-4">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                                        {t('hero.card_task_title', 'Topshiriq 2')}
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        {t('hero.card_task_content', '"Compare these two ways of studying: online vs traditional classroom. Which one is more effective?"')}
                                    </p>
                                </div>

                                {/* Simulated Audio Wave Visualizer */}
                                <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-border bg-surface-2 p-5">
                                    <div className="mb-3 flex items-center justify-between w-full px-1">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={togglePlayAudio}
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                                                title={isPlayingDemo ? "To'xtatish" : "Tinglash"}
                                            >
                                                <Icon icon={isPlayingDemo ? "solar:pause-bold" : "solar:play-bold"} className="text-xl ml-0.5" />
                                            </button>
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-foreground">{t('hero.card_audio_sample', 'Ovoz namunasi')}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {isPlayingDemo ? (
                                                        <span className="text-primary font-semibold animate-pulse">Tinglanmoqda...</span>
                                                    ) : (
                                                        t('hero.card_click_listen', 'Tinglash uchun bosing')
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-xs font-semibold text-muted-foreground">
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Animated Waveform Bars with Click-to-Seek */}
                                    <div
                                        onClick={handleSeek}
                                        className="flex h-12 w-full items-center justify-center gap-1 cursor-pointer py-1 group/wave"
                                        title="Ovozni istalgan joyiga o'tkazish"
                                    >
                                        {[40, 65, 80, 45, 95, 70, 85, 30, 90, 60, 75, 50, 100, 65, 85, 40, 90, 70, 55, 30].map((h, i) => {
                                             const barPercent = (i / 20) * 100;
                                             const isPlayed = barPercent <= audioProgress;
                                             return (
                                                 <div
                                                     key={i}
                                                     style={{
                                                         height: isPlayingDemo
                                                             ? `${Math.max(20, (h * (0.6 + 0.4 * Math.sin((currentTime * 6) + i)))) % 100}%`
                                                             : `${h * 0.45}%`,
                                                     }}
                                                     className={`w-1 rounded-full transition-all duration-150 group-hover/wave:opacity-90 ${
                                                         isPlayed
                                                             ? 'bg-primary shadow-xs'
                                                             : 'bg-muted'
                                                     }`}
                                                 />
                                             );
                                         })}
                                    </div>
                                </div>

                                {/* Score Breakdown Snippet */}
                                <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                                    <div className="rounded-xl bg-secondary p-2">
                                        <p className="text-xs text-muted-foreground">{t('hero.card_fluency', 'Fluency')}</p>
                                        <p className="text-xs font-bold text-foreground">B2 (58)</p>
                                    </div>
                                    <div className="rounded-xl bg-secondary p-2">
                                        <p className="text-xs text-muted-foreground">{t('hero.card_lexicon', 'Lexicon')}</p>
                                        <p className="text-xs font-bold text-foreground">C1 (72)</p>
                                    </div>
                                    <div className="rounded-xl bg-secondary p-2">
                                        <p className="text-xs text-muted-foreground">{t('hero.card_grammar', 'Grammar')}</p>
                                        <p className="text-xs font-bold text-foreground">B2 (62)</p>
                                    </div>
                                    <div className="rounded-xl bg-secondary p-2">
                                        <p className="text-xs text-muted-foreground">{t('hero.card_pronounce', 'Pronounce')}</p>
                                        <p className="text-xs font-bold text-foreground">C1 (74)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
