import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Language, Test } from '@/types';
import { Lock, Pencil, RotateCcw } from 'lucide-react';

interface UpdateTestModalProps {
    test: Test;
}

export default function UpdateTestModal({ test }: UpdateTestModalProps) {
    const { t, i18n } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const [languages, setLanguages] = useState<Language[]>([]);
    const [loadingLanguages, setLoadingLanguages] = useState(false);

    useEffect(() => {
        if (!open) return;

        const fetchLanguages = async () => {
            setLoadingLanguages(true);
            try {
                const response = await fetch(route('language.all.json'));
                const result = await response.json();

                const list: Language[] = Array.isArray(result) ? result : Array.isArray(result.data) ? result.data : [];

                setLanguages(list);
            } catch (error) {
                console.error(error);
                setLanguages([]);
            } finally {
                setLoadingLanguages(false);
            }
        };

        fetchLanguages();
    }, [open]);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        name: string;
        language_id: number;
        description: string;
        audio_path: string | File;
        is_public: number;
        _method: 'PUT';
    }>({
        name: test.name || '',
        language_id: test.language_id,
        description: test.description || '',
        audio_path: '',
        is_public: test.is_public ? 1 : 0,
        _method: 'PUT',
    });

    useEffect(() => {
        setData({
            name: test.name || '',
            language_id: test.language_id,
            description: test.description || '',
            audio_path: '',
            is_public: test.is_public ? 1 : 0,
            _method: 'PUT',
        });
    }, [test]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('test.update', test.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
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
                <DialogContent className="max-w-md overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg">
                    <div className="bg-surface-2 px-6 py-5 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <Pencil className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {t('test_table.update_title')}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    {t('test_table.update_description')}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4 p-6">
                        {/* Name */}
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

                        {/* Language */}
                        <div className="space-y-1.5">
                            <Label htmlFor="language_id" className="text-xs font-semibold text-muted-foreground">
                                {t('common.language')}
                            </Label>
                            <select
                                id="language_id"
                                value={data.language_id}
                                className="flex h-11 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-hidden"
                                onChange={(e) => setData('language_id', parseInt(e.target.value))}
                            >
                                <option value="0" disabled>
                                    {loadingLanguages ? t('common.loading') : t('test_table.select_language')}
                                </option>
                                {languages.map((lang) => {
                                    const displayName = i18n.language === 'uz' ? lang.name_uz : i18n.language === 'ru' ? lang.name_ru : lang.name_en;

                                    return (
                                        <option key={lang.id} value={lang.id}>
                                            {displayName}
                                        </option>
                                    );
                                })}
                            </select>
                            <InputError message={errors.language_id} />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">
                                {t('common.description')}
                            </Label>
                            <Input
                                id="description"
                                value={data.description}
                                className="h-11 rounded-lg border-border bg-surface-2"
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* Audio Upload */}
                        <div className="space-y-1.5">
                            <Label htmlFor="audio_path" className="text-xs font-semibold text-muted-foreground">
                                {t('test_table.audio_file')}
                            </Label>
                            <div className="group relative flex min-h-[70px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-2 transition-colors">
                                <Input
                                    type="file"
                                    id="audio_path"
                                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setData('audio_path', e.target.files[0]);
                                        }
                                    }}
                                />
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                                    <span className="px-4 text-xs font-medium text-muted-foreground">
                                        {data.audio_path ? (data.audio_path as File).name : t('test_table.replace_audio_optional')}
                                    </span>
                                </div>
                            </div>
                            <InputError message={errors.audio_path} />
                        </div>

                        {/* Public */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                <Lock className="h-3.5 w-3.5 text-primary" />
                                {t('common.public')}
                            </Label>

                            <label className="flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-surface-2 px-4 transition-colors">
                                <span className="text-sm font-semibold text-foreground">
                                    {data.is_public ? t('common.yes') : t('common.no')}
                                </span>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-0"
                                    checked={Boolean(data.is_public)}
                                    onChange={(e) => setData('is_public', e.target.checked ? 1 : 0)}
                                />
                            </label>

                            <InputError message={errors.is_public} />
                        </div>

                        <DialogFooter className="mt-2 flex flex-row items-center justify-end gap-3 border-t border-border pt-4">
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
                                {processing ? t('common.updating') : t('test_table.update_test')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
