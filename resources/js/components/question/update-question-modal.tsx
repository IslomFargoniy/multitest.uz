import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { baseButton } from '@/components/ui/baseButton';
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
                className={`${baseButton} flex h-9 w-9 items-center justify-center border border-slate-200 bg-white p-0 text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/40`}
            >
                <Pencil className="h-4 w-4 shrink-0" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="flex max-h-[95vh] !w-[1100px] !max-w-[95vw] flex-col gap-0 overflow-hidden rounded-[2.5rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-900">
                    <div className="flex-none border-b border-slate-100 bg-slate-50/80 px-10 py-8 dark:border-slate-800 dark:bg-slate-800/40">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {t('test_show.update_question_title')}
                                </DialogTitle>
                                <DialogDescription className="font-medium text-slate-500 dark:text-slate-400">
                                    {t('test_show.update_question_description')}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 space-y-8 overflow-y-auto p-10">
                            {/* Editor Section */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
                                    {t('test_show.question_text_prompt')}
                                </Label>
                                <div className="rounded-3xl border border-slate-200 bg-white p-1 focus-within:ring-4 focus-within:ring-indigo-500/5 dark:border-slate-800 dark:bg-slate-950">
                                    <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-3xl" />}>
                                        <TextEditor
                                            value={data.textarea}
                                            onChange={(content) => setData('textarea', content)}
                                            error={errors.textarea}
                                        />
                                    </Suspense>
                                </div>
                            </div>

                            {/* Settings Grid */}
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                                        <Timer className="h-3.5 w-3.5 text-amber-500" />
                                        {t('test_show.preparation_time_sec')}
                                    </Label>
                                    <Input
                                        type="number"
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 font-mono text-lg font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                        value={data.ready_second}
                                        onChange={(e) => setData('ready_second', Number(e.target.value))}
                                    />
                                    <InputError message={errors.ready_second} />
                                </div>

                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                                        <Timer className="h-3.5 w-3.5 text-emerald-500" />
                                        {t('test_show.speaking_time_sec')}
                                    </Label>
                                    <Input
                                        type="number"
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 font-mono text-lg font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                        value={data.answer_second}
                                        onChange={(e) => setData('answer_second', Number(e.target.value))}
                                    />
                                    <InputError message={errors.answer_second} />
                                </div>

                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                                        <Headphones className="h-3.5 w-3.5 text-indigo-500" />
                                        {t('test_show.audio_prompt_file')}
                                    </Label>
                                    <div className="group relative flex h-14 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-950">
                                        <UploadCloud className="absolute left-4 h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                                        <span className="max-w-[200px] truncate pl-6 text-xs font-bold text-slate-500 dark:text-slate-400">
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

                        <div className="flex-none border-t border-slate-100 bg-slate-50/80 px-10 py-6 dark:border-slate-800 dark:bg-slate-800/40">
                            <div className="flex w-full items-center justify-end gap-3">
                                <DialogClose asChild>
                                    <Button
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
                                    className="h-12 min-w-[160px] rounded-2xl bg-indigo-600 px-8 font-black text-white shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 dark:bg-indigo-500 dark:shadow-none"
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
