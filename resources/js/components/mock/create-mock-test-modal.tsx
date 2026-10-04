import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { MultiValue, StylesConfig } from 'react-select';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Mock, Test } from '@/types';
import { BookPlus, Library, Search } from 'lucide-react';
import { useIsDarkMode } from '@/hooks/use-is-dark-mode';

interface CreateMockTestModalProps {
    mock: Mock;
}

interface OptionType {
    value: number;
    label: string;
}

export default function CreateMockTestModal({ mock }: CreateMockTestModalProps) {
    const { t } = useTranslation();
    const isDark = useIsDarkMode();

    const [open, setOpen] = useState(false);
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        mock_id: number;
        testIds: number[];
    }>({
        mock_id: mock.id,
        testIds: [],
    });

    useEffect(() => {
        if (!open) return;

        const fetchTests = async () => {
            setLoading(true);
            try {
                const response = await fetch(route('test.all.json'));
                const result = await response.json();

                const list: Test[] = Array.isArray(result)
                    ? result
                    : Array.isArray(result.data)
                      ? result.data
                      : Array.isArray(result.tests)
                        ? result.tests
                        : [];

                setTests(list);
            } catch (error) {
                console.error(error);
                setTests([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, [open]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('mock-test.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('success.created'));
            },
            onError: (err: any) => {
                toast.error(err?.error || t('error.create_failed'));
            },
        });
    };

    const options: OptionType[] = tests.map((item) => ({
        value: item.id,
        label: `${item.name} (${item.language?.name_uz || ''})`,
    }));

    const selectedOptions = options.filter((opt) => data.testIds.includes(opt.value));

    const customStyles: StylesConfig<OptionType, true> = {
        control: (base, state) => ({
            ...base,
            backgroundColor: isDark ? 'hsl(220 18% 10%)' : 'hsl(220 14% 96%)',
            borderColor: state.isFocused ? 'hsl(220 90% 56%)' : isDark ? 'hsl(220 16% 16%)' : 'hsl(220 13% 91%)',
            borderRadius: '8px',
            padding: '2px 8px',
            minHeight: '44px',
            boxShadow: 'none',
        }),
        input: (base) => ({
            ...base,
            color: isDark ? '#f1f5f9' : '#0b0e14',
        }),
        placeholder: (base) => ({
            ...base,
            color: isDark ? '#64748b' : '#94a3b8',
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: isDark ? 'hsl(220 18% 10%)' : '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            border: isDark ? '1px solid hsl(220 16% 16%)' : '1px solid hsl(220 13% 91%)',
            zIndex: 9999,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? 'hsl(220 90% 56%)' : state.isFocused ? (isDark ? 'hsl(220 16% 16%)' : 'hsl(220 14% 96%)') : 'transparent',
            color: state.isSelected ? '#ffffff' : isDark ? '#cbd5e1' : '#475569',
            padding: '8px 12px',
            fontSize: '13px',
            cursor: 'pointer',
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: isDark ? 'hsl(220 16% 16%)' : 'hsl(220 14% 92%)',
            borderRadius: '6px',
            padding: '2px 4px',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: isDark ? '#f1f5f9' : '#0b0e14',
            fontWeight: '600',
            fontSize: '12px',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: isDark ? '#94a3b8' : '#64748b',
            borderRadius: '4px',
            '&:hover': {
                backgroundColor: 'hsl(0 72% 51%)',
                color: '#ffffff',
            },
        }),
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 p-0 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground cursor-pointer"
            >
                <BookPlus className="h-4 w-4 shrink-0" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="flex max-h-[90vh] !w-[600px] !max-w-[95vw] flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg">
                    <div className="flex-none border-b border-border bg-surface-2 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <Library className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {t('modal.assign_tests')}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    {t('modal.assign_tests_description')}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 space-y-4 p-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                    <Search className="h-3.5 w-3.5" />
                                    {t('mock_table.select_tests')}
                                </Label>

                                <Select
                                    isMulti
                                    options={options}
                                    value={selectedOptions}
                                    onChange={(selected: MultiValue<OptionType>) => {
                                        setData(
                                            'testIds',
                                            selected.map((s) => s.value),
                                        );
                                    }}
                                    isLoading={loading}
                                    styles={customStyles}
                                    placeholder={t('mock_table.search_and_select_tests')}
                                    noOptionsMessage={() => t('common.no_data')}
                                    classNamePrefix="react-select"
                                />

                                <div className="flex items-center justify-between px-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {t('mock_table.currently_selected')}:{' '}
                                        <span className="font-bold text-primary">{data.testIds.length}</span>
                                    </p>
                                    {loading && <span className="animate-pulse text-xs text-muted-foreground">{t('common.loading')}</span>}
                                </div>
                                <InputError message={errors.testIds} />
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
                                    disabled={processing || loading || data.testIds.length === 0}
                                    className="min-w-[120px]"
                                >
                                    {processing ? t('mock_table.assigning') : t('mock_table.assign_tests')}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
