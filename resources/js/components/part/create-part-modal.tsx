import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Test } from '@/types';
import { IoCloudUpload, IoCreate, IoMicOutline } from 'react-icons/io5';

export default function CreatePartModal({ test }: { test: Test }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        test_id: number;
        name: string;
        description: string;
        audio_path: string | File;
    }>({
        test_id: test.id,
        name: '',
        description: '',
        audio_path: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('part.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('success.created'));
            },
            onError: (err) => {
                nameInput.current?.focus();
                toast.error(err?.error || t('error.create_failed'));
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="default" className="gap-2">
                    <IoCreate className="h-4 w-4" />
                    <span>{t('test_table.add_section')}</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg">
                <div className="bg-surface-2 px-6 py-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <IoMicOutline className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-foreground">
                                {t('test_table.new_section_title')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                {t('test_table.new_section_description')}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-4 p-6">
                    {/* Part Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
                            {t('common.name')}
                        </Label>
                        <Input
                            id="name"
                            ref={nameInput}
                            value={data.name}
                            placeholder={t('test_table.enter_section_name')}
                            className="h-11 rounded-lg border-border bg-surface-2"
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">
                            {t('test_show.part_instructions')}
                        </Label>
                        <Input
                            id="description"
                            value={data.description}
                            placeholder={t('test_table.enter_instructions')}
                            className="h-11 rounded-lg border-border bg-surface-2"
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* Audio File */}
                    <div className="space-y-1.5">
                        <Label htmlFor="audio_path" className="text-xs font-semibold text-muted-foreground">
                            {t('test_table.audio_file')}
                        </Label>
                        <div className="group relative flex min-h-[70px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-2 transition-colors">
                            <Input
                                type="file"
                                id="audio_path"
                                accept="audio/*"
                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setData('audio_path', e.target.files[0]);
                                    }
                                }}
                            />
                            <div className="flex flex-col items-center gap-1 text-center">
                                <IoCloudUpload className="h-5 w-5 text-muted-foreground" />
                                <span className="px-4 text-xs font-medium text-muted-foreground">
                                    {data.audio_path ? (data.audio_path as File).name : t('test_table.click_to_upload')}
                                </span>
                            </div>
                        </div>
                        <InputError message={errors.audio_path} />
                    </div>

                    <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-3 border-t border-border pt-4">
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
                            className="min-w-[100px]"
                        >
                            {processing ? t('common.saving') : t('common.save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
