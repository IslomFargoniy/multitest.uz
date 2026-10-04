import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { baseButton } from '@/components/ui/baseButton';
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
                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                    <IoCreate className="h-4 w-4" />
                    <span>{t('create_test') || t('common.create', 'Test yaratish')}</span>
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-md gap-0 overflow-hidden rounded-[2rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-900">
                {/* Header Section */}
                <div className="bg-slate-50/50 px-6 py-6 dark:bg-slate-800/30">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {t('test_table.create_title')}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {t('test_table.create_description')}
                    </DialogDescription>
                </div>

                <form onSubmit={submit} className="space-y-5 p-6">
                    {/* Name Input */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                            {t('common.name')}
                        </Label>
                        <Input
                            id="name"
                            ref={nameInput}
                            value={data.name}
                            placeholder={t('test_table.enter_title')}
                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Description Input */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                            {t('common.description')}
                        </Label>
                        <Input
                            id="description"
                            value={data.description}
                            placeholder={t('test_table.enter_instructions')}
                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* languages */}
                    <div className="space-y-1.5">
                        <Label htmlFor="language_id" className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                            {t('common.language')}
                        </Label>

                        <select
                            id="language_id"
                            value={data.language_id}
                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm ring-offset-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            onChange={(e) => setData('language_id', parseInt(e.target.value))}
                        >
                            <option value="0" disabled>
                                {loading ? t('common.loading') : t('test_table.select_language')}
                            </option>
                            {languages.map((lang) => {
                                // Determine which name field to show based on current locale
                                // Falls back to name_en if the current language field is missing
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

                    {/* Audio File Upload */}
                    <div className="space-y-1.5">
                        <Label htmlFor="audio_path" className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                            {t('test_table.audio_file')}
                        </Label>
                        <div className="group relative">
                            <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-colors group-hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex flex-col items-center gap-1">
                                    <IoCloudUploadOutline className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                                    <span className="px-4 text-center text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
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

                    <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/50">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                type="button"
                                className="rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                            className="min-w-[100px] rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400"
                        >
                            {processing ? t('common.saving') : t('common.save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
