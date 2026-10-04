import DeleteItemModal from '@/components/delete-item-modal';
import UpdateMockModal from '@/components/mock/update-mock-modal';
import MockStudentManager from '@/components/mock/mock-student-manager';
import TablePagination from '@/components/ui/table-pagination';
import { StatusPill } from '@/components/design/StatusPill';
import { Auth, Mock, type MockPaginate, SearchData, Test } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
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
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-muted-foreground border border-border">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    {t('inactive', 'Nofaol')}
                </span>
            );
        }
        if (status === 'scheduled') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-warning-bg text-warning-text border border-warning/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                    {t('scheduled', 'Boshlanmagan')}
                </span>
            );
        }
        if (status === 'expired') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-danger-bg text-danger-text border border-danger/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                    {t('expired', 'Vaqti tugagan')}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-success-bg text-success-text border border-success/20">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
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
        if (!d) return '-';
        try {
            return format(new Date(d), 'MMM dd, HH:mm');
        } catch {
            return '-';
        }
    };

    return (
        <div>
            {mock.data.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                    {t('mock_exam.no_mocks_found', 'Hozircha hech qanday mock test mavjud emas. Yangi mock test yaratishingiz mumkin.')}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {mock.data.map((item, index) => {
                        const globalIndex = (mock.current_page - 1) * mock.per_page + index + 1;

                        return (
                            <div
                                key={item.id}
                                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm dark:shadow-none transition-colors hover:border-border-strong"
                            >
                                {/* Header */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold font-mono text-muted-foreground">
                                            #{globalIndex.toString().padStart(2, '0')}
                                        </span>
                                        {renderStatusBadge(item)}
                                    </div>
                                    <h3 className="line-clamp-1 text-base font-bold text-foreground transition-colors hover:text-primary">
                                        <Link href={`/mock/${item.id}`}>{item.name}</Link>
                                    </h3>
                                    <div className="mt-1 flex items-center text-xs font-medium text-muted-foreground">
                                        <span className="truncate">{item.test?.name || t('mock_exam.no_test_selected', 'Test tanlanmagan')}</span>
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="mb-4 flex-grow">
                                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                        {item.comment || item.description || t('no_comment', "Izoh yo'q")}
                                    </p>
                                </div>

                                {/* Dates */}
                                <div className="mb-4 space-y-1.5 rounded-lg border border-border bg-surface-2 p-3 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('started_at', 'Boshlanadi')}</span>
                                        <span className="font-mono font-medium text-foreground tabular-nums">
                                            {formatSafeDate(item.started_at)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('finished_at', 'Tugaydi')}</span>
                                        <span className="font-mono font-medium text-foreground tabular-nums">
                                            {formatSafeDate(item.finished_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                                    <MockStudentManager
                                        mockId={item.id}
                                        mockName={item.name}
                                        students={(item as any).students ?? []}
                                    />

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateClick(item)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground cursor-pointer"
                                            title={t('edit', 'Tahrirlash')}
                                        >
                                            <PencilIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(item)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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

            {selectedMock && openDelete && (
                <DeleteItemModal
                    item={selectedMock}
                    open={openDelete}
                    setOpen={setOpenDelete}
                    onDelete={handleDelete}
                />
            )}

            {/* Pagination */}
            <TablePagination
                from={mock.from}
                to={mock.to}
                total={mock.total}
                per_page={mock.per_page}
                links={mock.links}
                searchParams={searchData}
            />
        </div>
    );
};

export default MockTable;
