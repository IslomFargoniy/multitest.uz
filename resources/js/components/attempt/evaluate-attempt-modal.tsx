import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { baseButton } from '@/components/ui/baseButton';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Attempt } from '@/types';
import { CalculatorIcon, Loader2, MessageSquare, Star, UserCheck } from 'lucide-react';

interface UpdateAttemptModalProps {
    attempt: Attempt;
}

export default function EvaluateAttemptModal({ attempt }: UpdateAttemptModalProps) {
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
            <button
                onClick={() => setOpen(true)}
                title={t('evaluation.evaluate')}
                type="button"
                className={`${baseButton} flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white p-0 text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/40`}
            >
                <CalculatorIcon className="h-5 w-5 shrink-0" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="flex max-h-[90vh] !w-[550px] !max-w-[95vw] flex-col gap-0 overflow-hidden rounded-[2.5rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-950">
                    <div className="flex-none border-b border-slate-100 bg-slate-50/80 px-10 py-8 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {t('evaluation.evaluate_submission')}
                                </DialogTitle>
                                <DialogDescription className="font-medium text-slate-500 dark:text-slate-400">
                                    {t('evaluation.grading')} <span className="font-bold text-indigo-600">{attempt.user?.name}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 flex-1 space-y-8 overflow-y-auto p-10">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="score"
                                    className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                                >
                                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                    {t('evaluation.final_score')}
                                </Label>

                                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900">
                                    <Input
                                        type="number"
                                        id="score"
                                        ref={scoreInput}
                                        min="0"
                                        max="75"
                                        step="1"
                                        placeholder="0.0"
                                        className="h-14 flex-1 border-none bg-transparent px-6 text-xl font-black focus-visible:ring-0 dark:text-white"
                                        value={data.score}
                                        onChange={(e) => setData('score', e.target.value === '' ? 0 : Math.min(75, Math.max(0, Math.round(Number(e.target.value)))))}
                                    />
                                    <div className="flex h-14 items-center border-l border-slate-100 bg-slate-100/50 px-6 font-black whitespace-nowrap text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                                        / 75
                                    </div>
                                </div>
                                <InputError message={errors.score} />
                            </div>

                            <div className="space-y-3">
                                <Label
                                    htmlFor="review"
                                    className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                                >
                                    <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                                    {t('evaluation.teacher_feedback')}
                                </Label>
                                <textarea
                                    id="review"
                                    rows={5}
                                    placeholder={t('evaluation.write_detailed_feedback')}
                                    className="block w-full rounded-[1.5rem] border-slate-100 bg-slate-50 p-6 text-sm leading-relaxed font-medium transition-all outline-none placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-600"
                                    value={data.review}
                                    onChange={(e) => setData('review', e.target.value)}
                                />
                                <InputError message={errors.review} />
                            </div>
                        </div>

                        <DialogFooter className="flex-none border-t border-slate-100 bg-slate-50/80 px-10 py-6 dark:border-slate-800 dark:bg-slate-900/50">
                            <div className="flex w-full items-center justify-end gap-3">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-12 rounded-2xl px-8 font-bold text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
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
                                    className="h-12 min-w-[160px] rounded-2xl bg-indigo-600 px-8 font-black text-white shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 dark:bg-indigo-500"
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {t('common.saving')}
                                        </div>
                                    ) : (
                                        t('evaluation.complete_evaluation')
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
