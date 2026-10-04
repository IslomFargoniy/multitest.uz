import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { baseButton } from '@/components/ui/baseButton';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Part } from '@/types';
import { FileText, Headphones, Timer, UploadCloud } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { IoCreate } from 'react-icons/io5';

const TextEditor = lazy(() => import('@/components/ui/text-editor'));

interface QuestionCreateForm {
    [key: string]: string | number | File | undefined | null;
    part_id: number;
    textarea: string;
    audio_path: File | string;
    ready_second: number;
    answer_second: number;
}

export default function CreateQuestionModal({ part }: { part: Part }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<QuestionCreateForm>({
        part_id: part.id,
        textarea: '',
        audio_path: '',
        ready_second: 0,
        answer_second: 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('question.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('success.created'));
            },
            onError: (err) => {
                toast.error(err?.error || t('error.create_failed'));
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className={`${baseButton} flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2 text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-600`}
                >
                    <IoCreate className="h-4 w-4" />
                    <span className="text-xs font-bold tracking-wider uppercase">{t('test_show.add_question')}</span>
                </button>
            </DialogTrigger>

            <DialogContent className="flex max-h-[95vh] !w-[1100px] !max-w-[95vw] flex-col gap-0 overflow-hidden rounded-[2.5rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-900">
                <div className="flex-none border-b border-slate-100 bg-slate-50/80 px-10 py-8 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                {t('test_show.create_question_title')}
                            </DialogTitle>
                            <DialogDescription className="font-medium text-slate-500 dark:text-slate-400">
                                {t('test_show.create_question_description')}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-8 overflow-y-auto p-10">
                        {/* Rich Text Editor */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
                                {t('test_show.question_text_prompt')}
                            </Label>
                            <div className="rounded-3xl border border-slate-200 bg-white p-1 focus-within:ring-4 focus-within:ring-indigo-500/5 dark:border-slate-800 dark:bg-slate-950">
                                <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-3xl" />}>
                                    <TextEditor value={data.textarea} onChange={(content) => setData('textarea', content)} error={errors.textarea} />
                                </Suspense>
                            </div>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="ready_second"
                                    className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                                >
                                    <Timer className="h-3.5 w-3.5 text-amber-500" />
                                    {t('test_show.preparation_time_sec')}
                                </Label>
                                <Input
                                    type="number"
                                    id="ready_second"
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 font-mono text-lg font-bold transition-all focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                    value={data.ready_second}
                                    onChange={(e) => setData('ready_second', Number(e.target.value))}
                                />
                                <InputError message={errors.ready_second} />
                            </div>

                            <div className="space-y-3">
                                <Label
                                    htmlFor="answer_second"
                                    className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                                >
                                    <Timer className="h-3.5 w-3.5 text-emerald-500" />
                                    {t('test_show.speaking_time_sec')}
                                </Label>
                                <Input
                                    type="number"
                                    id="answer_second"
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 font-mono text-lg font-bold transition-all focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                    value={data.answer_second}
                                    onChange={(e) => setData('answer_second', Number(e.target.value))}
                                />
                                <InputError message={errors.answer_second} />
                            </div>

                            <div className="space-y-3">
                                <Label
                                    htmlFor="audio_path"
                                    className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                                >
                                    <Headphones className="h-3.5 w-3.5 text-indigo-500" />
                                    {t('test_show.audio_prompt_file')}
                                </Label>
                                <div className="group relative flex h-14 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-950">
                                    <UploadCloud className="absolute left-4 h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                                    <span className="max-w-[200px] truncate pl-6 text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {data.audio_path ? (data.audio_path as File).name : t('test_table.click_to_upload')}
                                    </span>
                                    <Input
                                        type="file"
                                        id="audio_path"
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

                    <DialogFooter className="flex-none border-t border-slate-100 bg-slate-50/80 px-10 py-6 dark:border-slate-800 dark:bg-slate-800/40">
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
                                className="h-12 min-w-[160px] rounded-2xl bg-indigo-600 px-8 font-black text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 dark:bg-indigo-500 dark:shadow-none"
                            >
                                {processing ? t('common.saving') : t('test_show.save_question')}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
