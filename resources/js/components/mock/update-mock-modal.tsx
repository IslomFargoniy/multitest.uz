import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Mock, Test } from '@/types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

interface UpdateMockModalProps {
    tests: Test[];
    mock: Mock;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function UpdateMockModal({ tests = [], mock, open, setOpen }: UpdateMockModalProps) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const formatSafeDate = (d?: string | null) => {
        if (!d) return '';
        try {
            return format(new Date(d), 'yyyy-MM-dd HH:mm');
        } catch {
            return '';
        }
    };

    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        name: mock.name || '',
        comment: mock.comment || '',
        started_at: formatSafeDate(mock.started_at),
        finished_at: formatSafeDate(mock.finished_at),
        test_id: mock.test_id || (mock.mock_tests && mock.mock_tests[0]?.test_id) || null,
        active: mock.active ? 1 : 0,
    });

    useEffect(() => {
        if (mock) {
            setData({
                name: mock.name || '',
                comment: mock.comment || '',
                started_at: formatSafeDate(mock.started_at),
                finished_at: formatSafeDate(mock.finished_at),
                test_id: mock.test_id || (mock.mock_tests && mock.mock_tests[0]?.test_id) || null,
                active: mock.active ? 1 : 0,
            });
        }
    }, [mock]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('mock.update', mock.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('mock_updated') || 'Mock test yangilandi');
            },
            onError: (err: any) => {
                const errorMessage = err?.error || err?.name || t('update_failed') || 'Xatolik yuz berdi';
                toast.error(errorMessage);
                nameInput.current?.focus();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-1 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {t('modal.update_mock_title') || 'Mock Testni Tahrirlash'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                        {t('modal.update_mock_desc') || 'Mock test ma\'lumotlarini o\'zgartiring'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 pt-2">
                    <div>
                        <Label htmlFor="name">{t('name') || 'Nomi'}</Label>
                        <Input
                            id="name"
                            ref={nameInput}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="comment">{t('comment') || 'Izoh / Tavsif'}</Label>
                        <Input
                            id="comment"
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                        />
                        <InputError message={errors.comment} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="started_at">{t('started_at') || 'Boshlanish vaqti'}</Label>
                            <DatePicker
                                selected={data.started_at ? new Date(data.started_at) : null}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        setData('started_at', format(date, 'yyyy-MM-dd HH:mm'));
                                    }
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded-xl text-xs w-full mt-1.5"
                                wrapperClassName="w-full"
                                required
                            />
                            <InputError message={errors.started_at} />
                        </div>

                        <div>
                            <Label htmlFor="finished_at">{t('finished_at') || 'Tugash vaqti'}</Label>
                            <DatePicker
                                selected={data.finished_at ? new Date(data.finished_at) : null}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        setData('finished_at', format(date, 'yyyy-MM-dd HH:mm'));
                                    }
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded-xl text-xs w-full mt-1.5"
                                wrapperClassName="w-full"
                                required
                            />
                            <InputError message={errors.finished_at} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="test_id">{t('select_test') || 'Testni tanlang'}</Label>
                        <Select
                            value={String(data.test_id || '')}
                            onValueChange={(value) => setData('test_id', Number(value))}
                        >
                            <SelectTrigger className="w-full mt-1.5 rounded-xl border border-gray-300 dark:border-gray-700">
                                <span>
                                    {data.test_id
                                        ? (() => {
                                              const selTest = tests.find((t) => t.id === data.test_id);
                                              return selTest ? selTest.name : t('select_test') || 'Testni tanlang';
                                          })()
                                        : t('select_test') || 'Testni tanlang'}
                                </span>
                            </SelectTrigger>

                            <SelectContent className="max-h-60 rounded-xl bg-white dark:bg-gray-900">
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
                        <Label htmlFor="status" className="mb-2 block">
                            {t('status') || 'Holati (Faol)'}
                        </Label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="status"
                                className="sr-only peer"
                                checked={data.active === 1}
                                onChange={(e) => setData('active', e.target.checked ? 1 : 0)}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                        </label>
                        <InputError message={errors.active} />
                    </div>

                    <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                className="rounded-xl text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                    reset();
                                    clearErrors();
                                    setOpen(false);
                                }}
                            >
                                {t('cancel') || 'Bekor qilish'}
                            </Button>
                        </DialogClose>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl text-xs bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 cursor-pointer font-bold"
                        >
                            {t('save') || 'Saqlash'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
