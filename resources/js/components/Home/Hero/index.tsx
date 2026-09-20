import { useIsMobile } from '@/hooks/use-mobile';
import { getImagePrefix } from '@/utils/util';
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
        <section id="home-section" className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-background to-background pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-16 dark:from-indigo-950/20 dark:via-background dark:to-background md:pb-24">
            {/* Background Glow Orbs */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-500/20 blur-3xl dark:from-indigo-600/10 dark:to-purple-800/10" />
            <div className="pointer-events-none absolute top-1/3 -right-20 -z-10 h-80 w-80 rounded-full bg-pink-400/10 blur-3xl dark:bg-pink-600/5" />

            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                    {/* Left Column: Headline & Action */}
                    <div className="col-span-1 flex flex-col gap-6 text-left lg:col-span-7">
                        {/* Top Pill / Badge */}
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-bold text-indigo-700 backdrop-blur-sm dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                            <Icon icon="solar:verified-check-bold" className="text-base text-indigo-600 dark:text-indigo-400" />
                            <span>{t('hero.badge')}</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white leading-[1.15]">
                            {t('hero.title_prefix', 'UzBMB CEFR & IELTS ')}
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                                {t('hero.title_accent', 'Speaking AI')}
                            </span>
                            {t('hero.title_suffix', ' Simulyatori')}
                        </h1>

                        {/* Description */}
                        <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                            {t('hero.description')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link
                                href={auth?.user ? route('dashboard') : '/test'}
                                className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/35 active:scale-95"
                            >
                                <Icon icon="solar:play-circle-bold" className="text-2xl transition-transform group-hover:rotate-12" />
                                <span>{t('hero.start_mock', 'Mock Testni Boshlash')}</span>
                            </Link>

                            <a
                                href="#cefr-structure"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3.5 text-base font-bold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-slate-100 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                            >
                                <Icon icon="solar:document-text-bold" className="text-xl" />
                                <span>{t('hero.exam_format', 'Imtihon Formati')}</span>
                            </a>
                        </div>

                        {/* Key Pillars */}
                        <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3">
                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/60 p-2.5 backdrop-blur-xs dark:border-slate-800/60 dark:bg-slate-900/60">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                    <Icon icon="solar:shield-check-bold" className="text-lg" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-900 dark:text-white">{t('hero.accuracy', '98.5% Aniqlik')}</p>
                                    <p className="text-slate-500 dark:text-slate-400">{t('hero.accuracy_desc', 'UzBMB standarti')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/60 p-2.5 backdrop-blur-xs dark:border-slate-800/60 dark:bg-slate-900/60">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                                    <Icon icon="solar:bolt-bold" className="text-lg" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-900 dark:text-white">{t('hero.instant_time', '60 Soniyada')}</p>
                                    <p className="text-slate-500 dark:text-slate-400">{t('hero.instant_desc', 'Lahzali baho')}</p>
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/60 p-2.5 backdrop-blur-xs sm:col-span-1 dark:border-slate-800/60 dark:bg-slate-900/60">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                    <Icon icon="solar:medal-ribbon-star-bold" className="text-lg" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-900 dark:text-white">{t('hero.levels_title', 'B1 • B2 • C1')}</p>
                                    <p className="text-slate-500 dark:text-slate-400">{t('hero.levels_desc', 'To\'liq darajalar')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interactive AI Speaking Simulation Card */}
                    <div className="col-span-1 lg:col-span-5">
                        <div className="relative mx-auto w-full max-w-md">
                            {/* Decorative Floating Badges */}
                            <div className="absolute -top-4 -left-4 z-20 flex items-center gap-2 rounded-2xl border border-white/40 bg-white/90 px-3.5 py-2 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 animate-bounce [animation-duration:4s]">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                                    <Icon icon="solar:cup-star-bold" className="text-sm" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t('hero.card_latest_result', 'So\'nggi Natija')}</p>
                                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{t('hero.card_result_val', 'CEFR C1 (78 ball)')}</p>
                                </div>
                            </div>

                            <div className="absolute -right-3 bottom-8 z-20 flex items-center gap-2 rounded-2xl border border-white/40 bg-white/90 px-3.5 py-2 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">
                                    <Icon icon="solar:microphone-3-bold" className="text-sm" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t('hero.card_ai_eval', 'AI Baholash')}</p>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('hero.card_ai_eval_sub', '98% Aniq Transkript')}</p>
                                </div>
                            </div>

                            {/* Main Card UI Preview */}
                            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                                {/* Simulated Mock Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-md">
                                            DTM
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('hero.card_mock_title', 'Multilevel Speaking Mock')}</h4>
                                            <p className="text-xs text-indigo-600 font-medium dark:text-indigo-400">{t('hero.card_mock_part', 'Part 2: Comparison & Solution')}</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                        {t('hero.card_live_badge', 'Jonli Sinov')}
                                    </span>
                                </div>

                                {/* Simulated Question Card */}
                                <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        {t('hero.card_task_title', 'Topshiriq 2')}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {t('hero.card_task_content', '"Compare these two ways of studying: online vs traditional classroom. Which one is more effective?"')}
                                    </p>
                                </div>

                                {/* Simulated Audio Wave Visualizer */}
                                <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5 dark:border-indigo-950 dark:from-indigo-950/30 dark:to-purple-950/30">
                                    <div className="mb-3 flex items-center justify-between w-full px-1">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={togglePlayAudio}
                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                                                title={isPlayingDemo ? "To'xtatish" : "Tinglash"}
                                            >
                                                <Icon icon={isPlayingDemo ? "solar:pause-bold" : "solar:play-bold"} className="text-xl ml-0.5" />
                                            </button>
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('hero.card_audio_sample', 'Ovoz namunasi')}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {isPlayingDemo ? (
                                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">Tinglanmoqda...</span>
                                                    ) : (
                                                        t('hero.card_click_listen', 'Tinglash uchun bosing')
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
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
                                                             ? 'bg-gradient-to-t from-indigo-600 to-purple-500 shadow-xs'
                                                             : 'bg-slate-300 dark:bg-slate-700'
                                                     }`}
                                                 />
                                             );
                                         })}
                                     </div>
                                 </div>

                                 {/* Score Breakdown Snippet */}
                                 <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                                     <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/40">
                                         <p className="text-[10px] text-slate-400">{t('hero.card_fluency', 'Fluency')}</p>
                                         <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">B2 (68)</p>
                                     </div>
                                     <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/40">
                                         <p className="text-[10px] text-slate-400">{t('hero.card_lexicon', 'Lexicon')}</p>
                                         <p className="text-xs font-extrabold text-purple-600 dark:text-purple-400">C1 (76)</p>
                                     </div>
                                     <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/40">
                                         <p className="text-[10px] text-slate-400">{t('hero.card_grammar', 'Grammar')}</p>
                                         <p className="text-xs font-extrabold text-pink-600 dark:text-pink-400">B2 (70)</p>
                                     </div>
                                     <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/40">
                                         <p className="text-[10px] text-slate-400">{t('hero.card_pronounce', 'Pronounce')}</p>
                                         <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">C1 (79)</p>
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
