import DeleteItemModal from '@/components/delete-item-modal';
import CreateMockModal from '@/components/mock/create-mock-modal';
import UpdateMockModal from '@/components/mock/update-mock-modal';
import MockStudentManager from '@/components/mock/mock-student-manager';
import TablePagination from '@/components/ui/table-pagination';
import { Auth, Mock, type MockPaginate, SearchData, Test } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CheckCircle, Clock, MinusCircle, PencilIcon, TrashIcon } from 'lucide-react';
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
                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <MinusCircle className="mr-1 h-3 w-3" /> {t('inactive') || 'Nofaol'}
                </span>
            );
        }
        if (status === 'scheduled') {
            return (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                    <Clock className="mr-1 h-3 w-3" /> {t('scheduled') || 'Boshlanmagan'}
                </span>
            );
        }
        if (status === 'expired') {
            return (
                <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
                    <MinusCircle className="mr-1 h-3 w-3" /> {t('expired') || 'Vaqti tugagan'}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="mr-1 h-3 w-3" /> {t('active') || 'Faol'}
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
                toast.success(t('deleted_successfully') || "Mock o'chirildi");
            },
            onError: (err: any) => {
                const errorMessage = err?.error || t('delete_failed') || "O'chirishda xatolik";
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
            {/* Cards Grid */}
            {mock.data.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-sm text-slate-500">
                    {t('mock_exam.no_mocks_found') || 'Hozircha hech qanday mock test mavjud emas. Yangi mock test yaratishingiz mumkin.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {mock.data.map((item, index) => {
                        const globalIndex = (mock.current_page - 1) * mock.per_page + index + 1;

                        return (
                            <div
                                key={item.id}
                                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                            >
                                {/* Header */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                                            #{globalIndex.toString().padStart(2, '0')}
                                        </span>
                                        {renderStatusBadge(item)}
                                    </div>
                                    <h3 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                        <Link href={`/mock/${item.id}`}>{item.name}</Link>
                                    </h3>
                                    <div className="mt-1 flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        <span className="truncate">{item.test?.name || t('mock_exam.no_test_selected') || 'Test tanlanmagan'}</span>
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="mb-4 flex-grow">
                                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic">
                                        {item.comment || item.description || t('no_comment') || "Izoh yo'q"}
                                    </p>
                                </div>

                                {/* Dates */}
                                <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">{t('started_at') || 'Boshlanadi'}</span>
                                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                                            {formatSafeDate(item.started_at)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">{t('finished_at') || 'Tugaydi'}</span>
                                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                                            {formatSafeDate(item.finished_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <MockStudentManager
                                        mockId={item.id}
                                        mockName={item.name}
                                        students={(item as any).students ?? []}
                                    />

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateClick(item)}
                                            className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                                            title={t('edit') || 'Tahrirlash'}
                                        >
                                            <PencilIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(item)}
                                            className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                                            title={t('delete') || "O'chirish"}
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
