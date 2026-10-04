import { useForm } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import { FormEventHandler, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoCreate } from 'react-icons/io5';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FindMockModal() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const codeInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        code: '',
    });

    const handleOpenChange = useCallback(
        (state: boolean) => {
            setOpen(state);
            if (!state) {
                setTimeout(() => {
                    reset();
                    clearErrors();
                }, 200);
            }
        },
        [reset, clearErrors],
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('mock-student.enter'), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                toast.success(t('mock_exam.exam_starting', 'Imtihon muvaffaqiyatli boshlanmoqda!'));
            },
            onError: (err: any) => {
                codeInput.current?.focus();
                const errorMessage = err?.code || err?.error || t('mock_exam.invalid_code', 'Kiritilgan kod xato!');
                toast.error(errorMessage);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="default" className="gap-2 font-semibold">
                    <IoCreate className="h-4 w-4" />
                    <span>{t('common.exam', 'Imtihon kodi')}</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md w-full rounded-xl border border-border shadow-lg bg-card p-0 overflow-hidden">
                <header className="border-b border-border bg-surface-2 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <LayoutGrid className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground">
                                {t('mock_exam.enter_exam_title', 'Imtihonga Kirish (Mock Exam)')}
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {t('mock_exam.enter_code_description', 'Sizga berilgan MSXXXXXXXX nomzod kodingizni kiriting')}
                            </p>
                        </div>
                    </div>
                </header>

                <form onSubmit={submit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code-input" className="text-xs font-semibold text-foreground">
                            {t('mock_exam.candidate_code_label', 'Nomzod Kodingiz (MSXXXXXXXX)')} *
                        </Label>
                        <Input
                            id="code-input"
                            ref={codeInput}
                            placeholder="Masalan: MS84920133"
                            className="h-11 rounded-lg border-border bg-surface-2 px-4 font-mono font-bold text-sm tracking-wider uppercase"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.code} />
                    </div>

                    <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                            >
                                {t('cancel', 'Bekor qilish')}
                            </Button>
                        </DialogClose>

                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing}
                        >
                            {t('mock_exam.start_exam_button', 'Imtihonni Boshlash →')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
