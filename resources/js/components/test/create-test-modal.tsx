import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Language } from '@/types';
import { IoCloudUploadOutline, IoCreate } from 'react-icons/io5';

export default function CreateTestModal({ defaultLanguageId }: { defaultLanguageId?: number }) {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        const fetchTests = async () => {
            setLoading(true);
            try {
                const response = await fetch(route('language.all.json'));
                const result = await response.json();

                const list: Language[] = Array.isArray(result)
                    ? result
                    : Array.isArray(result.data)
                      ? result.data
                      : Array.isArray(result.tests)
                        ? result.tests
                        : [];

                setLanguages(list);
            } catch (error) {
                console.error(error);
                setLanguages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, [open]);

    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        name: string;
        language_id: number;
        description: string;
        audio_path: string | File;
    }>({
        name: '',
        language_id: defaultLanguageId || 0,
        description: '',
        audio_path: '',
    });

    useEffect(() => {
        if (open && defaultLanguageId) {
            setData('language_id', defaultLanguageId);
        }
    }, [open, defaultLanguageId]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('test.store'), {
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
                    <span>{t('create_test') || t('common.create', 'Test yaratish')}</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg">
                <div className="bg-surface-2 px-6 py-5 border-b border-border">
                    <DialogTitle className="text-xl font-bold text-foreground">
                        {t('test_table.create_title')}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        {t('test_table.create_description')}
                    </DialogDescription>
                </div>

                <form onSubmit={submit} className="space-y-4 p-6">
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
                            {t('common.name')}
                        </Label>
                        <Input
                            id="name"
                            ref={nameInput}
                            value={data.name}
                            placeholder={t('test_table.enter_title')}
                            className="h-11 rounded-lg border-border bg-surface-2"
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">
                            {t('common.description')}
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
                                {loading ? t('common.loading') : t('test_table.select_language')}
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

                    <div className="space-y-1.5">
                        <Label htmlFor="audio_path" className="text-xs font-semibold text-muted-foreground">
                            {t('test_table.audio_file')}
                        </Label>
                        <div className="group relative">
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-2 transition-colors">
                                <div className="flex flex-col items-center gap-1">
                                    <IoCloudUploadOutline className="h-5 w-5 text-muted-foreground" />
                                    <span className="px-4 text-center text-xs font-medium text-muted-foreground">
                                        {data.audio_path ? (data.audio_path as File).name : t('test_table.click_to_upload')}
                                    </span>
                                </div>
                            </div>
                            <Input
                                type="file"
                                id="audio_path"
                                accept="audio/*"
                                className="relative h-20 cursor-pointer opacity-0"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setData('audio_path', e.target.files[0]);
                                    }
                                }}
                            />
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
