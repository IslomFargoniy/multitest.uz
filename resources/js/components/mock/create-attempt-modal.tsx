import AudioRecorder from '@/components/ui/audio-recorder';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mock, Test } from '@/types';
import { useForm } from '@inertiajs/react';
import { ArrowRight, CirclePlay, Headphones, Mic2, ShieldCheck, Check } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Props {
    mock?: Mock;
    test?: Test;
    label?: string;
}

export default function CreateAttemptModal({ mock, test, label }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [hasCheckedMic, setHasCheckedMic] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const { data, setData, post, processing } = useForm<{
        mock_id: number | null;
        test_id: number | null;
        part_ids: number[];
    }>({
        mock_id: mock?.id || null,
        test_id: test?.id || null,
        part_ids: test?.parts?.map((p) => p.id) || [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('attempt.store'), {
            onSuccess: () => {
                setOpen(false);
                toast.success(t('attempt_modal.good_luck'));
            },
            onError: (err: any) => {
                toast.error(err?.error || t('error.create_failed'));
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
                <CirclePlay className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                <span className="text-xs tracking-wider uppercase">{label || t('attempt_modal.start_practice') || 'Boshlash'}</span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white p-0 shadow-2xl sm:max-w-[440px] dark:bg-slate-950">
                    {/* Header */}
                    <div className="bg-slate-900 p-5 text-white dark:bg-slate-900/80">
                        <DialogHeader>
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400">
                                <Headphones className="h-4 w-4" />
                            </div>
                            <DialogTitle className="text-lg font-bold tracking-tight">{t('attempt_modal.ready_title') || "Imtihonga tayyormisiz?"}</DialogTitle>
                            <DialogDescription className="mt-0.5 text-xs text-slate-400">
                                {t('attempt_modal.mic_requirement') || "Iltimos, mikrofoningiz to'g'ri ishlayotganiga ishonch hosil qiling"}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="space-y-4 p-5">
                        {/* Primary Action */}
                        <form onSubmit={submit} className="w-full space-y-3">
                            {test?.parts && test.parts.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                        {t('attempt_modal.select_parts') || 'Bo\'limlarni tanlang'}
                                    </span>
                                    <div className="grid gap-2 grid-cols-2">
                                        {test.parts.map((part) => (
                                            <label
                                                key={part.id}
                                                className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${
                                                    data.part_ids.includes(part.id)
                                                        ? 'border-indigo-500 bg-indigo-50/60 dark:border-indigo-500/50 dark:bg-indigo-500/10'
                                                        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50'
                                                }`}
                                            >
                                                <span className={`text-xs font-bold ${data.part_ids.includes(part.id) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {part.name}
                                                </span>
                                                <div className={`flex h-4 w-4 items-center justify-center rounded-md border ${data.part_ids.includes(part.id) ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}>
                                                    {data.part_ids.includes(part.id) && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={data.part_ids.includes(part.id)}
                                                    onChange={(e) => {
                                                        const current = data.part_ids;
                                                        if (e.target.checked) {
                                                            setData('part_ids', [...current, part.id]);
                                                        } else {
                                                            setData('part_ids', current.filter((id) => id !== part.id));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={processing || !hasCheckedMic}
                                className={`group h-11 w-full rounded-xl text-xs font-bold transition-all ${
                                    hasCheckedMic
                                        ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] cursor-pointer'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-transparent dark:border-slate-800 cursor-not-allowed'
                                }`}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        {t('common.preparing') || 'Tayyorlanmoqda'}...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-1.5 tracking-wider uppercase">
                                        {t('attempt_modal.start_now') || 'Imtihonni boshlash'}
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                )}
                            </Button>

                            {!hasCheckedMic && (
                                <div className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 py-1.5 border border-amber-100/50 dark:border-amber-900/20">
                                    <span className="text-[8px] font-black tracking-tight text-amber-600 uppercase">
                                        {t('attempt_modal.record_to_unlock')}
                                    </span>
                                </div>
                            )}
                        </form>

                        {/* 🎙️ Mic Testing Area (Micro-Compact) */}
                        <div className="space-y-3 pt-2 border-t border-slate-50 dark:border-slate-900">
                            <div className="flex items-center justify-between px-1">
                                <span className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.1em] text-slate-400 dark:text-slate-500 uppercase">
                                    <Mic2 className="h-3 w-3 text-blue-500" />
                                    {t('attempt_modal.mic_check')}
                                </span>
                                {hasCheckedMic && (
                                    <span className="flex items-center gap-1 text-[9px] font-black tracking-widest text-emerald-500 uppercase">
                                        <ShieldCheck className="h-3 w-3" />
                                        {t('common.ready')}
                                    </span>
                                )}
                            </div>

                            <AudioRecorder
                                onRecorded={(url) => {
                                    setAudioUrl(url);
                                    setHasCheckedMic(true);
                                }}
                            />

                            {audioUrl && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-1.5 shadow-sm">
                                        <audio controls src={audioUrl} className="h-7 w-full opacity-80" />
                                    </div>
                                    <p className="mt-1 text-center text-[9px] font-bold text-slate-400 dark:text-slate-500">{t('attempt_modal.ensure_clear')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
