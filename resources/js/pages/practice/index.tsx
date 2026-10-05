import { AppShell } from '@/components/app-shell';
import StepTabs from '@/components/practice/StepTabs';
import SafeHtml from '@/components/safe-html';
import { type Attempt } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronRight, Headphones, Info, Layers, Mic2, Play, Timer, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Practice() {
    const { attempt } = usePage<{ attempt: Attempt }>().props;
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(true);

    const firstPartId = attempt.attempt_parts?.[0]?.id;

    const handleAudioEnd = () => {
        if (firstPartId) {
            router.visit(route('practice.show', firstPartId));
        }
    };

    return (
        <AppShell>
            <Head title={t('nav.tests')} />

            <div className="bg-background min-h-dvh">
                {/* 1. Top Navigation & Progress */}
                <div className="border-border bg-surface-2 border-b">
                    <div className="mx-auto max-w-5xl px-4">
                        <StepTabs attempt_parts={attempt?.attempt_parts ?? []} active={0} />
                    </div>
                </div>

                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-12">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Left Side: Test Context (Col 7) */}
                        <div className="space-y-6 lg:col-span-7">
                            <div className="space-y-3">
                                <div className="bg-primary/10 border-primary/20 text-primary inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                                    <span className="relative flex h-2 w-2">
                                        <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                                        <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
                                    </span>
                                    {t('practice.speaking_session_active')}
                                </div>
                                <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                                    {attempt.mock?.name || attempt.test?.name}
                                </h1>
                                <SafeHtml
                                    className="text-muted-foreground min-w-0 text-base leading-relaxed"
                                    html={attempt.mock?.description || attempt.test?.description}
                                />
                            </div>

                            {/* Info Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <InfoCard
                                    label={t('practice.total_parts')}
                                    value={attempt.attempt_parts?.length ?? 0}
                                    icon={<Layers className="text-primary h-5 w-5" />}
                                />
                                <InfoCard label={t('practice.estimated_time')} value="15-20 min" icon={<Timer className="text-warning h-5 w-5" />} />
                            </div>

                            {/* Hardware Checklist */}
                            <div className="border-border bg-card rounded-2xl border border-dashed p-6">
                                <h4 className="text-muted-foreground mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                    <Info className="h-4 w-4" /> {t('practice.before_you_start')}
                                </h4>
                                <div className="flex flex-wrap gap-6">
                                    <CheckItem icon={<Headphones className="h-4 w-4" />} text={t('practice.wear_headphones')} />
                                    <CheckItem icon={<Mic2 className="h-4 w-4" />} text={t('practice.check_microphone')} />
                                    <CheckItem icon={<Volume2 className="h-4 w-4" />} text={t('practice.quiet_environment')} />
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Immersive Audio Card (Col 5) */}
                        <div className="lg:col-span-5">
                            <div className="border-border bg-card sticky top-8 overflow-hidden rounded-2xl border p-6 shadow-xl sm:p-8">
                                <div className="relative space-y-6">
                                    <div>
                                        <h3 className="text-foreground text-xl font-bold tracking-tight">{t('practice.instructions')}</h3>
                                        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                                            {t('practice.listen_to_intro_instruction')}
                                        </p>
                                    </div>

                                    {/* Visual Audio Player */}
                                    <div className="border-border bg-surface-2 rounded-xl border p-5">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                                                    isPlaying ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-muted-foreground'
                                                }`}
                                            >
                                                {isPlaying ? <Volume2 className="h-5 w-5 animate-pulse" /> : <Play className="h-5 w-5" />}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-primary text-xs font-semibold tracking-wider uppercase">
                                                    {t('practice.playing_audio')}
                                                </p>
                                                <p className="text-foreground truncate text-sm font-bold">{t('practice.test_introduction')}</p>
                                            </div>
                                        </div>

                                        {attempt.mock?.audio_path || attempt.test?.audio_path ? (
                                            <audio
                                                autoPlay
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                                onEnded={handleAudioEnd}
                                                className="h-10 w-full rounded-full opacity-60 transition-opacity hover:opacity-100"
                                                controls
                                                controlsList="nodownload"
                                            >
                                                <source src={attempt.mock?.audio_path ?? attempt.test?.audio_path} type="audio/mpeg" />
                                            </audio>
                                        ) : (
                                            <p className="text-muted-foreground text-xs italic">{t('practice.no_audio_available')}</p>
                                        )}
                                    </div>

                                    {firstPartId && (
                                        <Link
                                            href={route('practice.show', firstPartId)}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-center font-bold shadow-sm transition-colors active:scale-98"
                                        >
                                            <span>{t('practice.skip_to_first_part')}</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

function InfoCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
    return (
        <div className="border-border bg-card hover:border-border-strong flex items-center gap-3.5 rounded-2xl border p-4 transition-colors">
            <div className="bg-secondary flex h-11 w-11 items-center justify-center rounded-xl">{icon}</div>
            <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">{label}</p>
                <p className="text-foreground font-mono text-lg font-bold">{value}</p>
            </div>
        </div>
    );
}

function CheckItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
            <div className="text-primary">{icon}</div>
            {text}
        </div>
    );
}
