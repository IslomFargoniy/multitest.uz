import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatDateTime } from '@/lib/date';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { IoCreate } from 'react-icons/io5';
import { Test } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

export default function CreateMockModal({ tests = [] }: { tests: Test[] }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        name: '',
        comment: '',
        started_at: '',
        finished_at: '',
        test_id: null as number | null,
        active: 1,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('mock.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('mock_created', 'Mock yaratildi'));
            },
            onError: (err: any) => {
                const errorMessage = err?.error || err?.name || t('create_failed', 'Xatolik yuz berdi');
                toast.error(errorMessage);
                nameInput.current?.focus();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="default" className="gap-2 font-semibold">
                    <IoCreate className="h-4 w-4" />
                    <span>{t('create_mock', 'Mock yaratish')}</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg w-full rounded-xl bg-card p-6 shadow-lg border border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-1 pb-3 border-b border-border">
                    <DialogTitle className="text-lg font-bold text-foreground">
                        {t('modal.create_mock_title', 'Yangi Mock Test Yaratish')}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {t('modal.create_mock_desc', 'Mock test ma\'lumotlarini kiriting va testni tanlang')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 pt-2">
                    <div>
                        <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">{t('name', 'Nomi')}</Label>
                        <Input
                            id="name"
                            ref={nameInput}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Mock test nomi"
                            className="mt-1.5 h-11 rounded-lg border-border bg-surface-2"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="comment" className="text-xs font-semibold text-muted-foreground">{t('comment', 'Izoh / Tavsif')}</Label>
                        <Input
                            id="comment"
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                            placeholder="Qo'shimcha izoh (ixtiyoriy)"
                            className="mt-1.5 h-11 rounded-lg border-border bg-surface-2"
                        />
                        <InputError message={errors.comment} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="started_at" className="text-xs font-semibold text-muted-foreground">{t('started_at', 'Boshlanish vaqti')}</Label>
                            <DatePicker
                                selected={data.started_at ? new Date(data.started_at) : null}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        setData('started_at', formatDateTime(date));
                                    }
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                className="border border-border bg-surface-2 text-foreground p-2 rounded-lg text-xs w-full mt-1.5 h-11"
                                wrapperClassName="w-full"
                                required
                            />
                            <InputError message={errors.started_at} />
                        </div>

                        <div>
                            <Label htmlFor="finished_at" className="text-xs font-semibold text-muted-foreground">{t('finished_at', 'Tugash vaqti')}</Label>
                            <DatePicker
                                selected={data.finished_at ? new Date(data.finished_at) : null}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        setData('finished_at', formatDateTime(date));
                                    }
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                className="border border-border bg-surface-2 text-foreground p-2 rounded-lg text-xs w-full mt-1.5 h-11"
                                wrapperClassName="w-full"
                                required
                            />
                            <InputError message={errors.finished_at} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="test_id" className="text-xs font-semibold text-muted-foreground">{t('select_test', 'Testni tanlang')}</Label>
                        <Select
                            value={String(data.test_id || '')}
                            onValueChange={(value) => setData('test_id', Number(value))}
                        >
                            <SelectTrigger className="w-full mt-1.5 rounded-lg border border-border bg-surface-2 h-11">
                                <span>
                                    {data.test_id
                                        ? (() => {
                                              const selTest = tests.find((t) => t.id === data.test_id);
                                              return selTest ? selTest.name : t('select_test', 'Testni tanlang');
                                          })()
                                        : t('select_test', 'Testni tanlang')}
                                </span>
                            </SelectTrigger>

                            <SelectContent className="max-h-60 rounded-lg bg-card border-border">
                                {tests.map((test) => (
                                    <SelectItem key={test.id} value={String(test.id)}>
                                        {test.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.test_id} />
                    </div>

                    <div>
                        <Label htmlFor="status" className="mb-2 block text-xs font-semibold text-muted-foreground">
                            {t('status', 'Holati (Faol)')}
                        </Label>
                        <label className="flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-surface-2 px-4 transition-colors">
                            <span className="text-sm font-semibold text-foreground">
                                {data.active === 1 ? t('common.yes') : t('common.no')}
                            </span>
                            <input
                                type="checkbox"
                                id="status"
                                className="h-4 w-4 rounded border-border text-primary focus:ring-0"
                                checked={data.active === 1}
                                onChange={(e) => setData('active', e.target.checked ? 1 : 0)}
                            />
                        </label>
                        <InputError message={errors.active} />
                    </div>

                    <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-border">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    reset();
                                    clearErrors();
                                    setOpen(false);
                                }}
                            >
                                {t('cancel', 'Bekor qilish')}
                            </Button>
                        </DialogClose>

                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {t('save', 'Saqlash')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
