import AppLogoIcon from '@/components/app-logo-icon';
import LanguageBar from '@/components/language';
import { Link } from '@inertiajs/react';
import { Award, CheckCircle2, Headphones, Pause, Play, Sparkles, TrendingUp, Volume2 } from 'lucide-react';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

const DEFAULT_WAVE_HEIGHTS = [35, 60, 85, 45, 95, 70, 40, 80, 100, 60, 45, 85, 75, 40, 90, 60, 45, 70, 90, 50, 65, 80, 40];

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSeconds, setCurrentSeconds] = useState(42);
    const [waveHeights, setWaveHeights] = useState<number[]>(DEFAULT_WAVE_HEIGHTS);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const waveAnimRef = useRef<number | null>(null);

    // Audio playback toggle with synthesized ambient speaking simulation
    const togglePlayback = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (waveAnimRef.current) cancelAnimationFrame(waveAnimRef.current);
            setWaveHeights(DEFAULT_WAVE_HEIGHTS);
        } else {
            setIsPlaying(true);

            // Play pleasant audio tone through Web Audio API
            try {
                const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                if (!audioCtxRef.current) {
                    audioCtxRef.current = new AudioCtx();
                }
                if (audioCtxRef.current.state === 'suspended') {
                    audioCtxRef.current.resume();
                }

                const ctx = audioCtxRef.current;
                const now = ctx.currentTime;

                // Create a pleasant warm speaking simulation melodic cadence
                const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
                notes.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.14);

                    gain.gain.setValueAtTime(0, now + idx * 0.14);
                    gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.14 + 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.28);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.14);
                    osc.stop(now + idx * 0.14 + 0.3);
                });
            } catch {
                // AudioContext not supported or restricted, gracefully proceed with visual playback
            }
        }
    };

    // Live timer ticking
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentSeconds((prev) => {
                    if (prev >= 90) return 0;
                    return prev + 1;
                });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying]);

    // Live wave bar pulsation
    useEffect(() => {
        if (!isPlaying) {
            setWaveHeights(DEFAULT_WAVE_HEIGHTS);
            return;
        }

        let step = 0;
        const animate = () => {
            step += 0.15;
            setWaveHeights(
                DEFAULT_WAVE_HEIGHTS.map((base, idx) => {
                    const dynamic = Math.sin(step + idx * 0.5) * 30;
                    return Math.max(25, Math.min(100, Math.round(base + dynamic)));
                }),
            );
            waveAnimRef.current = requestAnimationFrame(animate);
        };

        waveAnimRef.current = requestAnimationFrame(animate);

        return () => {
            if (waveAnimRef.current) cancelAnimationFrame(waveAnimRef.current);
        };
    }, [isPlaying]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative grid min-h-dvh lg:grid-cols-12">
            {/* Left Column: SaaS Product Showcase (Desktop only) */}
            <div className="bg-surface-sunken border-border relative hidden flex-col justify-between overflow-hidden border-r p-10 lg:col-span-6 lg:flex xl:col-span-6 xl:p-14">
                {/* Brand Header */}
                <div className="relative z-10">
                    <Link href="/" className="group inline-flex items-center gap-3">
                        <div className="bg-surface border-border flex h-11 w-11 items-center justify-center rounded-xl border p-1.5 shadow-sm transition-transform group-hover:scale-105">
                            <AppLogoIcon className="h-full w-full object-contain" />
                        </div>
                        <span className="text-foreground text-xl font-bold tracking-tight">
                            MultiTest<span className="text-primary">.uz</span>
                        </span>
                    </Link>
                    <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
                        {t('auth.tagline', "Milliy va xalqaro CEFR Speaking imtihonlariga tayyorgarlik ko'rish platformasi")}
                    </p>
                </div>

                {/* Center Showcase Cards */}
                <div className="relative z-10 my-8 max-w-md space-y-4">
                    {/* Card 1: UzBMB CEFR C1 Certificate Seal */}
                    <div className="border-border bg-surface hover:border-border-strong rounded-2xl border p-5 shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-success-bg border-success/30 text-success flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border">
                                <Award className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-foreground text-base font-bold tracking-tight">UzBMB CEFR C1</h3>
                                    <span className="bg-success-bg text-success-text border-success/30 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold">
                                        {t('auth.state_standard', 'Davlat standarti')}
                                    </span>
                                </div>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                    {t('auth.cert_standard_desc', 'Rasmiy baholash mezoni va haqiqiy imtihon simulyatori')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Interactive Speaking Wave preview with real Play/Pause */}
                    <div
                        onClick={togglePlayback}
                        className="border-border bg-surface hover:border-primary/50 group cursor-pointer rounded-2xl border p-5 shadow-sm transition-all"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-muted-foreground group-hover:text-primary flex items-center gap-2 text-xs font-semibold transition-colors">
                                <Headphones className="text-primary h-4 w-4" />
                                <span>{t('auth.speaking_practice', 'Speaking Test Practice')}</span>
                                {isPlaying && (
                                    <span className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold animate-pulse">
                                        <Volume2 className="h-3 w-3" /> Live
                                    </span>
                                )}
                            </div>
                            <span className="text-foreground font-mono text-xs font-bold tabular-nums">
                                {formatTime(currentSeconds)} / 01:30
                            </span>
                        </div>
                        <div className="bg-surface-sunken border-border flex items-center gap-3 rounded-xl border p-3">
                            <button
                                type="button"
                                aria-label={isPlaying ? 'Pause sample' : 'Play sample'}
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all ${
                                    isPlaying ? 'bg-amber-600 hover:bg-amber-500 scale-105' : 'bg-primary hover:bg-primary/90'
                                }`}
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4 fill-current" />
                                ) : (
                                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                                )}
                            </button>
                            <div className="flex h-6 flex-1 items-center gap-1.5">
                                {waveHeights.map((h, i) => (
                                    <span
                                        key={i}
                                        className={`flex-1 rounded-full transition-all duration-150 ${
                                            isPlaying ? 'bg-primary' : 'bg-primary/60'
                                        }`}
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Platform Statistics */}
                    <div className="border-border-strong bg-surface-2 flex items-center justify-between rounded-xl border px-4 py-3 text-xs">
                        <div className="text-foreground flex items-center gap-2 font-bold">
                            <Sparkles className="text-primary h-4 w-4" />
                            <span>{t('auth.tests_taken_stat', '10,000+ topshirilgan testlar')}</span>
                        </div>
                        <span className="text-success flex items-center gap-1 font-semibold">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {t('auth.success_rate', '94% muvaffaqiyat')}
                        </span>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="border-border text-muted-foreground relative z-10 flex items-center justify-between border-t pt-4 text-xs">
                    <p className="flex items-center gap-2">
                        <CheckCircle2 className="text-success h-3.5 w-3.5" />
                        {t('auth.ai_teacher_analysis', "Sun'iy intellekt va professional ustozlar tahlili")}
                    </p>
                    <span className="font-mono opacity-60">v1.0</span>
                </div>
            </div>

            {/* Right Column: Form Container */}
            <div className="flex min-h-dvh flex-col justify-between p-6 sm:p-10 lg:col-span-6 lg:p-12 xl:col-span-6 xl:p-16">
                {/* Top Bar: Mobile Logo & Language Bar */}
                <div className="mb-6 flex w-full items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2.5 lg:hidden">
                        <div className="bg-surface border-border flex h-9 w-9 items-center justify-center rounded-xl border p-1 shadow-sm">
                            <AppLogoIcon className="h-full w-full object-contain" />
                        </div>
                        <span className="text-foreground text-lg font-bold tracking-tight">
                            MultiTest<span className="text-primary">.uz</span>
                        </span>
                    </Link>
                    <div className="ml-auto">
                        <LanguageBar />
                    </div>
                </div>

                {/* Form Main Area */}
                <div className="mx-auto my-auto w-full max-w-[420px] py-4">
                    {title && (
                        <div className="mb-6 text-center sm:text-left">
                            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                            {description && <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{description}</p>}
                        </div>
                    )}
                    {children}
                </div>

                {/* Bottom Footer Note */}
                <div className="text-muted-foreground w-full pt-4 text-center text-xs">
                    © {new Date().getFullYear()} MultiTest.uz. {t('auth.all_rights_reserved', 'Barcha huquqlar himoyalangan')}.
                </div>
            </div>
        </div>
    );
}
