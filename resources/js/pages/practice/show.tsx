import { AppShell } from '@/components/app-shell';
import QuestionPlayer from '@/components/practice/QuestionPlayer';
import StepTabs from '@/components/practice/StepTabs';
import { useHaptic } from '@/components/telegram-theme-provider';
import { AttemptPart } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CloudUpload, Info, Mic, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast, Toaster } from 'sonner';

export default function PracticeShow() {
    const { attempt_part } = usePage<{ attempt_part: AttemptPart }>().props;
    const { t } = useTranslation();
    const { notification } = useHaptic();

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                notification('warning');
                toast.warning(t('practice_show.anti_cheat_warning_title'), {
                    description: t('practice_show.anti_cheat_warning_desc'),
                    duration: 5000,
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [t]);

    return (
        <AppShell>
            <Toaster position="top-center" richColors />
            <Head title={`${attempt_part.part?.name || t('practice_show.part_label')} - CEFR Speaking`} />

            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
                {/* 🛰️ Global Progress Bar */}
                <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="mx-auto w-full max-w-5xl px-2">
                        <StepTabs attempt_parts={attempt_part.attempt?.attempt_parts ?? []} active={attempt_part.id} />
                    </div>
                </div>

                {/* 🎭 Main Stage */}
                <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-2 py-4 sm:px-6 md:py-12">
                    {/* 🎙️ The Interactive Player Instance */}
                    <div className="w-full">
                        <div className="relative overflow-hidden rounded-2xl md:rounded-[3rem] bg-white shadow-2xl ring-1 shadow-blue-500/10 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                            {/* Key forces a re-mount of QuestionPlayer logic (timers/state) for each new part */}
                            <QuestionPlayer key={attempt_part.id} attempt_part={attempt_part} />
                        </div>
                    </div>

                    {/* 🛡️ Status Bar & Trust Indicators */}
                    <div className="mt-6 md:mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatusIndicator
                            icon={<CloudUpload className="h-4 w-4" />}
                            label={t('practice_show.auto_save')}
                            status={t('practice_show.synchronized')}
                        />
                        <StatusIndicator
                            icon={<Mic className="h-4 w-4" />}
                            label={t('practice_show.microphone')}
                            status={t('practice_show.ready')}
                            active
                        />
                        <StatusIndicator
                            icon={<ShieldCheck className="h-4 w-4" />}
                            label={t('practice_show.exam_mode')}
                            status={t('practice_show.secure')}
                        />
                    </div>

                    {/* Quick Help Tip */}
                    <div className="mt-8 md:mt-16 flex max-w-md items-start gap-3 rounded-2xl bg-indigo-50/50 p-4 dark:bg-indigo-500/5">
                        <Info className="h-5 w-5 shrink-0 text-indigo-400" />
                        <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                            <strong>{t('practice_show.pro_tip')}:</strong> {t('practice_show.speaking_exam_hint_text')}
                        </p>
                    </div>
                </main>
            </div>
        </AppShell>
    );
}

/* --- UI Helper Components --- */

function StatusIndicator({ icon, label, status, active = false }: { icon: React.ReactNode; label: string; status: string; active?: boolean }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10' : 'bg-slate-50 text-slate-400 dark:bg-slate-800'
                }`}
            >
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">{label}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{status}</p>
            </div>
        </div>
    );
}
