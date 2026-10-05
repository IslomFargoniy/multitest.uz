import { AppShell } from '@/components/app-shell';
import StepTabs from '@/components/practice/StepTabs';
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

            <div className="min-h-screen bg-background">
                {/* 1. Top Navigation & Progress */}
                <div className="border-b border-border bg-surface-2">
                    <div className="mx-auto max-w-5xl px-4">
                        <StepTabs attempt_parts={attempt?.attempt_parts ?? []} active={0} />
                    </div>
                </div>

                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-12">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Left Side: Test Context (Col 7) */}
                        <div className="space-y-6 lg:col-span-7">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                                    </span>
                                    {t('practice.speaking_session_active')}
                                </div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                                    {attempt.mock?.name || attempt.test?.name}
                                </h1>
                                <div className="text-base leading-relaxed text-muted-foreground">
                                    {attempt.mock?.description || attempt.test?.description}
                                </div>
                            </div>

                            {/* Info Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <InfoCard
                                    label={t('practice.total_parts')}
                                    value={attempt.attempt_parts?.length ?? 0}
                                    icon={<Layers className="h-5 w-5 text-primary" />}
                                />
                                <InfoCard
                                    label={t('practice.estimated_time')}
                                    value="15-20 min"
                                    icon={<Timer className="h-5 w-5 text-warning" />}
                                />
                            </div>

                            {/* Hardware Checklist */}
                            <div className="rounded-2xl border border-dashed border-border bg-card p-6">
                                <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
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
                            <div className="sticky top-8 overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
                                <div className="relative space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-foreground">{t('practice.instructions')}</h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                            {t('practice.listen_to_intro_instruction')}
                                        </p>
                                    </div>

                                    {/* Visual Audio Player */}
                                    <div className="rounded-xl border border-border bg-surface-2 p-5">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                                                    isPlaying ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-muted-foreground'
                                                }`}
                                            >
                                                {isPlaying ? <Volume2 className="h-5 w-5 animate-pulse" /> : <Play className="h-5 w-5" />}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                                                    {t('practice.playing_audio')}
                                                </p>
                                                <p className="truncate font-bold text-foreground text-sm">{t('practice.test_introduction')}</p>
                                            </div>
                                        </div>

                                        {(attempt.mock?.audio_path || attempt.test?.audio_path) ? (
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
                                            <p className="text-xs text-muted-foreground italic">{t('practice.no_audio_available')}</p>
                                        )}
                                    </div>

                                    {firstPartId && (
                                        <Link
                                            href={route('practice.show', firstPartId)}
                                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-center font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:scale-98"
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
        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-border-strong">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                {icon}
            </div>
            <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
                <p className="text-lg font-bold text-foreground font-mono">{value}</p>
            </div>
        </div>
    );
}

function CheckItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <div className="text-primary">{icon}</div>
            {text}
        </div>
    );
}
