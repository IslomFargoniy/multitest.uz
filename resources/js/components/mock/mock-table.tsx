import DeleteItemModal from '@/components/delete-item-modal';
import MockStudentManager from '@/components/mock/mock-student-manager';
import UpdateMockModal from '@/components/mock/update-mock-modal';
import TablePagination from '@/components/ui/table-pagination';
import { Auth, Mock, type MockPaginate, SearchData, Test } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { formatDateTime } from '@/lib/date';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface MockTableProps extends MockPaginate {
    searchData: SearchData;
    tests: Test[];
}

const MockTable = ({ tests = [], searchData, ...mock }: MockTableProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedMock, setSelectedMock] = useState<Mock | null>(null);

    const { auth } = usePage().props as unknown as { auth?: Auth };
    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');

    const renderStatusBadge = (item: Mock) => {
        const status = (item as any).status || (item.active ? 'active' : 'inactive');
        if (!item.active || status === 'inactive') {
            return (
                <span className="bg-secondary text-muted-foreground border-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    <span className="bg-muted-foreground h-1.5 w-1.5 rounded-full" />
                    {t('inactive', 'Nofaol')}
                </span>
            );
        }
        if (status === 'scheduled') {
            return (
                <span className="bg-warning-bg text-warning-text border-warning/20 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    <span className="bg-warning h-1.5 w-1.5 rounded-full" />
                    {t('scheduled', 'Boshlanmagan')}
                </span>
            );
        }
        if (status === 'expired') {
            return (
                <span className="bg-danger-bg text-danger-text border-danger/20 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    <span className="bg-danger h-1.5 w-1.5 rounded-full" />
                    {t('expired', 'Vaqti tugagan')}
                </span>
            );
        }
        return (
            <span className="bg-success-bg text-success-text border-success/20 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                <span className="bg-success h-1.5 w-1.5 rounded-full" />
                {t('active', 'Faol')}
            </span>
        );
    };

    const handleUpdateClick = (mockData: Mock) => {
        setSelectedMock(mockData);
        setOpen(true);
    };

    const handleDeleteClick = (mockData: Mock) => {
        setSelectedMock(mockData);
        setOpenDelete(true);
    };

    const { delete: deleteMock, reset, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        deleteMock(route('mock.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpenDelete(false);
                toast.success(t('deleted_successfully', "Mock o'chirildi"));
            },
            onError: (err: any) => {
                const errorMessage = err?.error || t('delete_failed', "O'chirishda xatolik");
                toast.error(errorMessage);
            },
        });
    };

    const formatSafeDate = (d?: string | null) => {
        return formatDateTime(d);
    };

    return (
        <div>
            {mock.data.length === 0 ? (
                <div className="border-border text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
                    {t('mock_exam.no_mocks_found', 'Hozircha hech qanday mock test mavjud emas. Yangi mock test yaratishingiz mumkin.')}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mock.data.map((item, index) => {
                        const globalIndex = (mock.current_page - 1) * mock.per_page + index + 1;

                        return (
                            <div
                                key={item.id}
                                className="group border-border bg-card hover:border-border-strong flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all dark:shadow-none"
                            >
                                {/* Header */}
                                <div className="mb-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-muted-foreground font-mono text-xs font-semibold">
                                            #{globalIndex.toString().padStart(2, '0')}
                                        </span>
                                        {renderStatusBadge(item)}
                                    </div>
                                    <h3 className="text-foreground hover:text-primary line-clamp-1 text-base font-bold transition-colors">
                                        <Link href={`/mock/${item.id}`}>{item.name}</Link>
                                    </h3>
                                    <div className="text-muted-foreground mt-1 flex items-center text-xs font-medium">
                                        <span className="truncate">{item.test?.name || t('mock_exam.no_test_selected', 'Test tanlanmagan')}</span>
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="mb-4 flex-grow">
                                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                                        {item.comment || item.description || t('no_comment', "Izoh yo'q")}
                                    </p>
                                </div>

                                {/* Dates */}
                                <div className="border-border bg-surface-2 mb-4 space-y-1.5 rounded-lg border p-3 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('started_at', 'Boshlanadi')}</span>
                                        <span className="text-foreground font-mono font-medium tabular-nums">{formatSafeDate(item.started_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('finished_at', 'Tugaydi')}</span>
                                        <span className="text-foreground font-mono font-medium tabular-nums">{formatSafeDate(item.finished_at)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
                                    <MockStudentManager mockId={item.id} mockName={item.name} students={(item as any).students ?? []} />

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateClick(item)}
                                            className="border-border bg-surface-2 text-muted-foreground hover:border-border-strong hover:text-foreground flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors"
                                            title={t('edit', 'Tahrirlash')}
                                        >
                                            <PencilIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(item)}
                                            className="border-border bg-surface-2 text-destructive hover:bg-destructive/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors"
                                            title={t('delete', "O'chirish")}
                                        >
                                            <TrashIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            {selectedMock && open && <UpdateMockModal tests={tests} mock={selectedMock} open={open} setOpen={setOpen} />}

            {selectedMock && openDelete && <DeleteItemModal item={selectedMock} open={openDelete} setOpen={setOpenDelete} onDelete={handleDelete} />}

            {/* Pagination */}
            <TablePagination from={mock.from} to={mock.to} total={mock.total} per_page={mock.per_page} links={mock.links} searchParams={searchData} />
        </div>
    );
};

export default MockTable;
