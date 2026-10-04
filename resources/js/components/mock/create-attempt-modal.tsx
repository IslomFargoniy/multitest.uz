import AudioRecorder from '@/components/ui/audio-recorder';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2.5 font-semibold text-primary-foreground shadow-sm transition-colors cursor-pointer"
            >
                <CirclePlay className="h-4 w-4" />
                <span className="text-xs">{label || t('attempt_modal.start_practice', 'Boshlash')}</span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg sm:max-w-[440px]">
                    {/* Header */}
                    <div className="bg-surface-2 p-5 border-b border-border">
                        <DialogHeader>
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <Headphones className="h-4 w-4" />
                            </div>
                            <DialogTitle className="text-lg font-bold text-foreground">{t('attempt_modal.ready_title', "Imtihonga tayyormisiz?")}</DialogTitle>
                            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                                {t('attempt_modal.mic_requirement', "Iltimos, mikrofoningiz to'g'ri ishlayotganiga ishonch hosil qiling")}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="space-y-4 p-5">
                        <form onSubmit={submit} className="w-full space-y-3">
                            {test?.parts && test.parts.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {t('attempt_modal.select_parts', 'Bo\'limlarni tanlang')}
                                    </span>
                                    <div className="grid gap-2 grid-cols-2">
                                        {test.parts.map((part) => {
                                            const isChecked = data.part_ids.includes(part.id);
                                            return (
                                                <label
                                                    key={part.id}
                                                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 transition-colors ${
                                                        isChecked
                                                            ? 'border-primary bg-primary/10 text-foreground'
                                                            : 'border-border bg-surface-2 text-muted-foreground'
                                                    }`}
                                                >
                                                    <span className="text-xs font-semibold">
                                                        {part.name}
                                                    </span>
                                                    <div className={`flex h-4 w-4 items-center justify-center rounded border ${isChecked ? 'border-primary bg-primary' : 'border-border'}`}>
                                                        {isChecked && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={isChecked}
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
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={processing || !hasCheckedMic}
                                className="h-11 w-full rounded-lg text-xs font-semibold"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        {t('common.preparing', 'Tayyorlanmoqda')}...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-1.5">
                                        {t('attempt_modal.start_now', 'Imtihonni boshlash')}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                )}
                            </Button>

                            {!hasCheckedMic && (
                                <div className="flex items-center justify-center gap-1.5 rounded-md bg-warning/10 py-1.5 border border-warning/20">
                                    <span className="text-xs font-medium text-warning">
                                        {t('attempt_modal.record_to_unlock')}
                                    </span>
                                </div>
                            )}
                        </form>

                        {/* Mic Testing Area */}
                        <div className="space-y-3 pt-3 border-t border-border">
                            <div className="flex items-center justify-between px-1">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                    <Mic2 className="h-3.5 w-3.5 text-primary" />
                                    {t('attempt_modal.mic_check')}
                                </span>
                                {hasCheckedMic && (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-success">
                                        <ShieldCheck className="h-3.5 w-3.5" />
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
                                <div className="animate-in fade-in duration-200">
                                    <div className="rounded-lg border border-border bg-surface-2 p-1.5">
                                        <audio controls src={audioUrl} className="h-7 w-full opacity-90" />
                                    </div>
                                    <p className="mt-1 text-center text-xs text-muted-foreground">{t('attempt_modal.ensure_clear')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
