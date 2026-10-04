import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Question } from '@/types';
import { FileText, Headphones, Pencil, Timer, UploadCloud } from 'lucide-react';
import { lazy, Suspense } from 'react';

const TextEditor = lazy(() => import('@/components/ui/text-editor'));

interface UpdateQuestionModalProps {
    question: Question;
}

interface QuestionUpdateForm {
    [key: string]: string | number | File | undefined | null;
    textarea: string;
    audio_path: File | string;
    ready_second: number;
    answer_second: number;
    _method: 'PUT';
}

export default function UpdateQuestionModal({ question }: UpdateQuestionModalProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<QuestionUpdateForm>({
        textarea: question.textarea || '',
        audio_path: '',
        ready_second: Number(question.ready_second) || 0,
        answer_second: Number(question.answer_second) || 0,
        _method: 'PUT',
    });

    useEffect(() => {
        if (open) {
            setData({
                textarea: question.textarea || '',
                audio_path: '',
                ready_second: Number(question.ready_second) || 0,
                answer_second: Number(question.answer_second) || 0,
                _method: 'PUT',
            });
        }
    }, [open, question, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('question.update', question.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                clearErrors();
                toast.success(t('success.updated'));
            },
            onError: (err) => {
                toast.error(err?.error || t('error.update_failed'));
            },
        });
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 p-0 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground cursor-pointer"
            >
                <Pencil className="h-4 w-4 shrink-0" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="flex max-h-[95vh] !w-[1100px] !max-w-[95vw] flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg">
                    <div className="flex-none border-b border-border bg-surface-2 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {t('test_show.update_question_title')}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    {t('test_show.update_question_description')}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 space-y-6 overflow-y-auto p-6">
                            {/* Editor Section */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    {t('test_show.question_text_prompt')}
                                </Label>
                                <div className="rounded-xl border border-border bg-surface-2 p-1">
                                    <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
                                        <TextEditor
                                            value={data.textarea}
                                            onChange={(content) => setData('textarea', content)}
                                            error={errors.textarea}
                                        />
                                    </Suspense>
                                </div>
                            </div>

                            {/* Settings Grid */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                        <Timer className="h-3.5 w-3.5 text-warning" />
                                        {t('test_show.preparation_time_sec')}
                                    </Label>
                                    <Input
                                        type="number"
                                        className="h-11 rounded-lg border-border bg-surface-2 font-mono text-base font-bold"
                                        value={data.ready_second}
                                        onChange={(e) => setData('ready_second', Number(e.target.value))}
                                    />
                                    <InputError message={errors.ready_second} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                        <Timer className="h-3.5 w-3.5 text-success" />
                                        {t('test_show.speaking_time_sec')}
                                    </Label>
                                    <Input
                                        type="number"
                                        className="h-11 rounded-lg border-border bg-surface-2 font-mono text-base font-bold"
                                        value={data.answer_second}
                                        onChange={(e) => setData('answer_second', Number(e.target.value))}
                                    />
                                    <InputError message={errors.answer_second} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                        <Headphones className="h-3.5 w-3.5 text-primary" />
                                        {t('test_show.audio_prompt_file')}
                                    </Label>
                                    <div className="group relative flex h-11 items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-2 transition-colors">
                                        <UploadCloud className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                        <span className="max-w-[180px] truncate pl-4 text-xs font-medium text-muted-foreground">
                                            {data.audio_path ? (data.audio_path as File).name : t('test_table.replace_audio_optional')}
                                        </span>
                                        <Input
                                            type="file"
                                            accept="audio/*"
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setData('audio_path', e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                    <InputError message={errors.audio_path} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-none border-t border-border bg-surface-2 px-6 py-4">
                            <div className="flex w-full items-center justify-end gap-3">
                                <DialogClose asChild>
                                    <Button
                                        variant="ghost"
                                        type="button"
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
                                    className="min-w-[140px]"
                                >
                                    {processing ? t('common.updating') : t('common.save_changes')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
