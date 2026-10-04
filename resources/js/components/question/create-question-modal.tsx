import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
                <Button variant="default" size="default" className="gap-2">
                    <IoCreate className="h-4 w-4" />
                    <span>{t('test_show.add_question')}</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="flex max-h-[95vh] !w-[1100px] !max-w-[95vw] flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg">
                <div className="flex-none border-b border-border bg-surface-2 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-foreground">
                                {t('test_show.create_question_title')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                {t('test_show.create_question_description')}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-6 overflow-y-auto p-6">
                        {/* Rich Text Editor */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                {t('test_show.question_text_prompt')}
                            </Label>
                            <div className="rounded-xl border border-border bg-surface-2 p-1">
                                <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
                                    <TextEditor value={data.textarea} onChange={(content) => setData('textarea', content)} error={errors.textarea} />
                                </Suspense>
                            </div>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="ready_second"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                                >
                                    <Timer className="h-3.5 w-3.5 text-warning" />
                                    {t('test_show.preparation_time_sec')}
                                </Label>
                                <Input
                                    type="number"
                                    id="ready_second"
                                    className="h-11 rounded-lg border-border bg-surface-2 font-mono text-base font-bold"
                                    value={data.ready_second}
                                    onChange={(e) => setData('ready_second', Number(e.target.value))}
                                />
                                <InputError message={errors.ready_second} />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="answer_second"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                                >
                                    <Timer className="h-3.5 w-3.5 text-success" />
                                    {t('test_show.speaking_time_sec')}
                                </Label>
                                <Input
                                    type="number"
                                    id="answer_second"
                                    className="h-11 rounded-lg border-border bg-surface-2 font-mono text-base font-bold"
                                    value={data.answer_second}
                                    onChange={(e) => setData('answer_second', Number(e.target.value))}
                                />
                                <InputError message={errors.answer_second} />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="audio_path"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                                >
                                    <Headphones className="h-3.5 w-3.5 text-primary" />
                                    {t('test_show.audio_prompt_file')}
                                </Label>
                                <div className="group relative flex h-11 items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-2 transition-colors">
                                    <UploadCloud className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                    <span className="max-w-[180px] truncate pl-4 text-xs font-medium text-muted-foreground">
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

                    <DialogFooter className="flex-none border-t border-border bg-surface-2 px-6 py-4">
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
                                {processing ? t('common.saving') : t('test_show.save_question')}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
