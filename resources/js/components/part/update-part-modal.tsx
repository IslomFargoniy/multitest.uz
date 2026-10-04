import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Part } from '@/types';
import { AlignLeft, Music, Pencil, RefreshCcw } from 'lucide-react';

interface UpdatePartModalProps {
    part: Part;
}

export default function UpdatePartModal({ part }: UpdatePartModalProps) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        name: string;
        description: string;
        audio_path: string | File;
        _method: 'PUT' | 'POST';
    }>({
        name: part.name || '',
        description: part.description || '',
        audio_path: '',
        _method: 'PUT',
    });

    useEffect(() => {
        if (open) {
            setData({
                name: part.name || '',
                description: part.description || '',
                audio_path: '',
                _method: 'PUT',
            });
        }
    }, [part, open]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('part.update', part.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('success.updated'));
            },
            onError: (err) => {
                nameInput.current?.focus();
                toast.error(err?.error || t('error.update_failed'));
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 p-0 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground cursor-pointer"
            >
                <Pencil className="h-4 w-4 shrink-0" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg">
                    <div className="bg-surface-2 px-6 py-5 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <RefreshCcw className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {t('test_table.update_section_title')}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    {t('test_table.update_section_description')}
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
                            <div className="relative">
                                <AlignLeft className="absolute top-3.5 left-3.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="description"
                                    value={data.description}
                                    className="h-11 rounded-lg border-border bg-surface-2 pl-10"
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.description} />
                        </div>

                        {/* Audio Upload */}
                        <div className="space-y-1.5">
                            <Label htmlFor="audio_path" className="text-xs font-semibold text-muted-foreground">
                                {t('test_show.audio_prompt')}
                            </Label>
                            <div className="group relative flex min-h-[70px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-2 transition-colors">
                                <Input
                                    type="file"
                                    id="audio_path"
                                    accept="audio/*"
                                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setData('audio_path', e.target.files[0]);
                                        }
                                    }}
                                />
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <Music className="h-4 w-4 text-muted-foreground" />
                                    <span className="px-4 text-xs font-medium text-muted-foreground">
                                        {data.audio_path ? (data.audio_path as File).name : t('test_table.replace_audio_optional')}
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
                                className="min-w-[120px]"
                            >
                                {processing ? t('common.updating') : t('common.save_changes')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
