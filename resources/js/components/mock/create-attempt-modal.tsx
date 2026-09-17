import { useHaptic } from '@/components/telegram-theme-provider';
import AudioEqualizer from '@/components/ui/audio-equalizer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mock, Test } from '@/types';
import { getPersistentAudioStream } from '@/utils/media-stream-manager';
import { useForm } from '@inertiajs/react';
import { ArrowRight, Check, CheckCircle2, CirclePlay, Headphones, Mic, MicOff, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Props {
    mock?: Mock;
    test?: Test;
    label?: string;
}

export default function CreateAttemptModal({ mock, test, label }: Props) {
    const { t } = useTranslation();
    const { impact, notification } = useHaptic();
    const [open, setOpen] = useState(false);
    const [isCheckingMic, setIsCheckingMic] = useState(false);
    const [hasCheckedMic, setHasCheckedMic] = useState(false);
    const [micError, setMicError] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    const { data, setData, post, processing } = useForm<{
        mock_id: number | null;
        test_id: number | null;
        part_ids: number[];
    }>({
        mock_id: mock?.id || null,
        test_id: test?.id || null,
        part_ids: test?.parts?.map((p) => p.id) || [],
    });

    const runFastMicCheck = async () => {
        setIsCheckingMic(true);
        setMicError(false);
        impact('medium');

        try {
            const stream = await getPersistentAudioStream();

            // Set up audio analyzer for live 2-second feedback (Option B)
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            // Run 2-second live mic check
            setTimeout(() => {
                setIsCheckingMic(false);
                setHasCheckedMic(true);
                notification('success');
                toast.success(t('audio_recorder.mic_found', 'Mikrofon muvaffaqiyatli tekshirildi!'));
                audioContextRef.current?.close();
            }, 2000);
        } catch (error) {
            console.error('Microphone check error:', error);
            setIsCheckingMic(false);
            setMicError(true);
            notification('error');
            toast.error(t('audio_recorder.mic_denied', "Mikrofonga ruxsat berilmadi. Iltimos ruxsat bering!"));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        impact('heavy');

        post(route('attempt.store'), {
            onSuccess: () => {
                setOpen(false);
                toast.success(t('attempt_modal.good_luck', 'Omad yor bo‘lsin!'));
            },
            onError: (err: any) => {
                toast.error(err?.error || t('error.create_failed', 'Urinish yaratishda xatolik yuz berdi'));
            },
        });
    };

    const allPartsCount = test?.parts?.length || 0;
    const isAllSelected = test?.parts && data.part_ids.length === test.parts.length;

    const toggleAllParts = () => {
        if (!test?.parts) return;
        impact('light');
        if (isAllSelected) {
            setData('part_ids', []);
        } else {
            setData('part_ids', test.parts.map((p) => p.id));
        }
    };

    const togglePart = (id: number) => {
        impact('light');
        const current = data.part_ids;
        if (current.includes(id)) {
            setData('part_ids', current.filter((pId) => pId !== id));
        } else {
            setData('part_ids', [...current, id]);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    impact('light');
                    setOpen(true);
                }}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-4 py-3 font-bold text-primary-foreground shadow-sm transition-all active:scale-95 cursor-pointer"
            >
                <CirclePlay className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                <span className="text-xs tracking-wider uppercase font-black">{label || t('attempt_modal.start_practice', 'Boshlash')}</span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 sm:top-[50%] sm:bottom-auto sm:translate-y-[-50%] sm:max-w-[460px] mx-auto overflow-hidden rounded-t-[2rem] sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-0 shadow-2xl max-h-[90vh] overflow-y-auto">
                    {/* Mobile Drag Indicator */}
                    <div className="w-full flex justify-center pt-2 sm:hidden">
                        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>

                    {/* Header */}
                    <div className="bg-slate-900 p-5 sm:p-6 text-white dark:bg-slate-900/90 relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
                        
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-sm">
                                    <Headphones className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <DialogTitle className="text-lg font-black tracking-tight truncate text-white">
                                        {mock?.name || test?.name || t('attempt_modal.ready_title', 'Imtihonni Boshlash')}
                                    </DialogTitle>
                                    <DialogDescription className="mt-0.5 text-xs text-slate-400 flex items-center gap-3 font-medium">
                                        <span className="inline-flex items-center gap-1">
                                            <Timer className="h-3.5 w-3.5 text-amber-400" /> ~15-20 min
                                        </span>
                                        <span>•</span>
                                        <span>{allPartsCount} {t('practice.total_parts', 'ta qism')}</span>
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4">
                        {/* 1. Parts Selection Section */}
                        {test?.parts && test.parts.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                                        {t('attempt_modal.select_parts', 'Bo‘limlar')} ({data.part_ids.length}/{allPartsCount})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={toggleAllParts}
                                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                                    >
                                        {isAllSelected ? t('common.deselect_all', 'Barchasini bekor qilish') : t('common.select_all', 'Barchasi')}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {test.parts.map((part) => {
                                        const isSelected = data.part_ids.includes(part.id);
                                        return (
                                            <button
                                                key={part.id}
                                                type="button"
                                                onClick={() => togglePart(part.id)}
                                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 text-primary dark:border-primary/50'
                                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500'
                                                }`}
                                            >
                                                <span className="truncate">{part.name}</span>
                                                <div
                                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                                                        isSelected
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-slate-300 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. Microphone Verification Area (Option B - Fast 2s Live Check) */}
                        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                                    <Mic className="h-3.5 w-3.5 text-primary" />
                                    {t('attempt_modal.mic_check', 'Mikrofon Tekshiruvi')}
                                </span>
                                {hasCheckedMic && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {t('common.ready', 'Tayyor')}
                                    </span>
                                )}
                            </div>

                            {/* Live Equalizer when checking */}
                            {isCheckingMic && (
                                <div className="h-12 w-full rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 animate-in fade-in">
                                    <AudioEqualizer analyser={analyserRef.current} active={isCheckingMic} />
                                    <span className="text-[9px] font-bold text-primary mt-1 animate-pulse uppercase tracking-wider">
                                        {t('audio_recorder.checking_mic', 'Ovoz to‘lqini tekshirilmoqda...')}
                                    </span>
                                </div>
                            )}

                            {/* Mic Error state */}
                            {micError && (
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold">
                                    <MicOff className="h-4 w-4 shrink-0" />
                                    <p className="text-[11px] leading-snug">{t('audio_recorder.mic_denied', "Mikrofonga ruxsat berilmadi. Iltimos brauzer sozlamalaridan ruxsat bering.")}</p>
                                </div>
                            )}

                            {!hasCheckedMic && !isCheckingMic && (
                                <Button
                                    type="button"
                                    onClick={runFastMicCheck}
                                    variant="outline"
                                    className="w-full h-10 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <Mic className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                    {t('audio_recorder.verify_microphone', 'Mikrofonni Tekshirish')}
                                </Button>
                            )}
                        </div>

                        {/* 3. Primary Action Button */}
                        <form onSubmit={submit} className="pt-2">
                            <Button
                                type="submit"
                                disabled={processing || data.part_ids.length === 0 || (!hasCheckedMic && !isCheckingMic)}
                                className={`w-full h-12 rounded-xl text-sm font-black tracking-wide uppercase transition-all shadow-md ${
                                    hasCheckedMic && data.part_ids.length > 0
                                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 cursor-pointer active:scale-[0.98]'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border-0'
                                }`}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        {t('common.preparing', 'Tayyorlanmoqda...')}
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        {t('attempt_modal.start_now', 'Imtihonni Boshlash')}
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
