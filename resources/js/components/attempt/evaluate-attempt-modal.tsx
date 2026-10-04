import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { baseButton } from '@/components/ui/baseButton';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Attempt } from '@/types';
import { CalculatorIcon, Loader2, MessageSquare, Star, UserCheck } from 'lucide-react';

interface UpdateAttemptModalProps {
    attempt: Attempt;
    trigger?: React.ReactNode;
}

export default function EvaluateAttemptModal({ attempt, trigger }: UpdateAttemptModalProps) {
    const { t } = useTranslation();
    const scoreInput = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        score: attempt.score ?? 0,
        review: attempt.review ?? '',
    });

    // Reset data when modal opens/closes to match current attempt state
    useEffect(() => {
        if (open) {
            setData({
                score: attempt.score ?? 0,
                review: attempt.review || '',
            });
        }
    }, [open, attempt]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('attempt.evaluate', { attempt: attempt.id }), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('success.evaluated'));
            },
            onError: (err) => {
                scoreInput.current?.focus();
                toast.error(err?.error || t('error.evaluation_failed'));
            },
        });
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setOpen(true)} className="inline-block cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    title={t('evaluation.evaluate')}
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border-strong bg-surface-2 text-foreground transition-colors hover:bg-secondary cursor-pointer"
                >
                    <CalculatorIcon className="h-4 w-4 shrink-0" />
                </button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm dark:shadow-none">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-[18px] font-bold text-foreground">
                            {t('evaluation.evaluate_submission')}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {t('evaluation.grading')} <span className="font-semibold text-foreground">{attempt.user?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="score"
                                className="text-sm font-semibold text-foreground"
                            >
                                {t('evaluation.final_score')} (0–75)
                            </Label>

                            <div className="flex items-center overflow-hidden rounded-lg border border-border-strong bg-surface-2">
                                <Input
                                    type="number"
                                    id="score"
                                    ref={scoreInput}
                                    min="0"
                                    max="75"
                                    step="1"
                                    placeholder="0"
                                    className="h-11 flex-1 border-none bg-transparent px-3.5 text-base font-semibold focus-visible:ring-0"
                                    value={data.score}
                                    onChange={(e) => setData('score', e.target.value === '' ? 0 : Math.min(75, Math.max(0, Math.round(Number(e.target.value)))))}
                                />
                                <div className="flex h-11 items-center border-l border-border-strong bg-surface-sunken px-4 font-semibold text-sm text-muted-foreground">
                                    / 75
                                </div>
                            </div>
                            <InputError message={errors.score} />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="review"
                                className="text-sm font-semibold text-foreground"
                            >
                                {t('evaluation.teacher_feedback')}
                            </Label>
                            <textarea
                                id="review"
                                rows={4}
                                placeholder={t('evaluation.write_detailed_feedback')}
                                className="block w-full rounded-lg border border-border-strong bg-surface-2 p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
                                value={data.review}
                                onChange={(e) => setData('review', e.target.value)}
                            />
                            <InputError message={errors.review} />
                        </div>

                        <DialogFooter className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        reset();
                                        clearErrors();
                                        setOpen(false);
                                    }}
                                >
                                    {t('common.cancel')}
                                </Button>
                            </DialogClose>

                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>{t('common.saving')}</span>
                                    </div>
                                ) : (
                                    t('evaluation.complete_evaluation')
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
