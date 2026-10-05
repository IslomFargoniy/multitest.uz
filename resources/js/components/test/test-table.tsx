import DeleteItemModal from '@/components/delete-item-modal';
import CreateAttemptModal from '@/components/mock/create-attempt-modal';
import UpdateTestModal from '@/components/test/update-test-modal';
import { Auth, SearchData, type TestPaginate } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface TestTableProps extends TestPaginate {
    searchData: SearchData;
}

const TestTable = ({ searchData, ...test }: TestTableProps) => {
    const { t, i18n } = useTranslation();
    const { auth } = usePage().props as unknown as { auth?: Auth };
    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role) => role.name === 'Teacher');
    const isStudent = auth?.user?.roles?.some((role) => role.name === 'Student');

    const { delete: deleteTest, reset, clearErrors } = useForm();

    const [items, setItems] = useState(test.data);
    const [currentPage, setCurrentPage] = useState(test.current_page);
    const [hasMore, setHasMore] = useState(test.current_page < test.last_page);
    const [isLoading, setIsLoading] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setItems(test.data);
        setCurrentPage(test.current_page);
        setHasMore(test.current_page < test.last_page);
    }, [test.data, test.current_page, test.last_page]);

    const loadMore = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const nextPage = currentPage + 1;
            const params = new URLSearchParams(window.location.search);
            params.set('page', String(nextPage));

            const response = await axios.get(`${window.location.pathname}?${params.toString()}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const newData = response.data;
            setItems((prev) => [...prev, ...newData.data]);
            setCurrentPage(newData.current_page);
            setHasMore(newData.current_page < newData.last_page);
        } catch (error) {
            console.error('Failed to load more tests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '150px',
            },
        );

        const currentSentinel = sentinelRef.current;
        if (currentSentinel) {
            observer.observe(currentSentinel);
        }

        return () => {
            if (currentSentinel) {
                observer.unobserve(currentSentinel);
            }
        };
    }, [hasMore, isLoading, currentPage]);

    const handleDelete = (id: number) => {
        deleteTest(route('test.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                toast.success(t('success.deleted'));
            },
            onError: (err) => toast.error(err?.error || t('error.delete_failed')),
        });
    };

    return (
        <div>
            {/* TEST CARDS GRID - COMPACT CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => {
                    const globalIndex = index + 1;

                    return (
                        <div
                            key={item.id}
                            className="group border-border bg-card hover:border-border-strong relative flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all dark:shadow-none"
                        >
                            <div className="min-w-0">
                                {/* Top bar info */}
                                <div className="mb-2.5 flex items-center justify-between gap-2">
                                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                                        <span className="bg-surface-2 text-foreground border-border inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] font-bold">
                                            #{globalIndex.toString().padStart(2, '0')}
                                        </span>
                                        {item.language?.flag && <span className="text-xs">{item.language.flag}</span>}
                                        <span className="max-w-[120px] truncate text-[11px]">
                                            {i18n.language === 'uz'
                                                ? item.language?.name_uz
                                                : i18n.language === 'ru'
                                                  ? item.language?.name_ru
                                                  : item.language?.name_en}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {item.is_public ? (
                                            <span className="bg-success-bg text-success-text border-success/30 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold">
                                                {t('common.public', 'Public')}
                                            </span>
                                        ) : (
                                            <span className="bg-secondary text-muted-foreground border-border inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                                                {t('common.private', 'Private')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    href={`/test/${item.id}`}
                                    className="text-foreground hover:text-primary line-clamp-1 block text-sm leading-snug font-bold transition-colors sm:text-base"
                                >
                                    {item.name}
                                </Link>

                                <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                                    <span>⏱ 15-18 daq</span>
                                    <span>•</span>
                                    <span>📋 {item.parts?.length || 3} ta bo'lim</span>
                                </div>
                            </div>

                            <div className="border-border mt-4 flex items-center justify-between gap-2 border-t pt-3">
                                <span className="text-success flex items-center gap-1 text-[11px] font-semibold">
                                    <span>⚡️</span>
                                    <span>AI + Ustoz</span>
                                </span>

                                <div className="flex items-center gap-1.5">
                                    {(isAdmin || auth?.user.id === item.user_id) && (
                                        <div className="flex items-center gap-1">
                                            <UpdateTestModal test={item} />
                                            <DeleteItemModal item={item} onDelete={handleDelete} />
                                        </div>
                                    )}
                                    <div className="min-w-[100px]">
                                        <CreateAttemptModal test={item} label={t('start', 'Boshlash')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Infinite Scroll Sentinel & Loading Indicator */}
            <div ref={sentinelRef} className="flex w-full flex-col items-center justify-center gap-4 py-6">
                {isLoading && (
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="border-border bg-card animate-pulse space-y-3 rounded-xl border p-5">
                                <div className="bg-surface-2 h-5 w-3/4 rounded" />
                                <div className="bg-surface-2 h-4 w-full rounded" />
                                <div className="bg-surface-2 h-4 w-2/3 rounded" />
                                <div className="bg-surface-2 mt-4 h-10 rounded-lg" />
                            </div>
                        ))}
                    </div>
                )}
                {!hasMore && items.length > 0 && (
                    <div className="text-muted-foreground py-2 text-xs font-semibold">{t('common.no_more_items', 'Barcha testlar yuklandi')}</div>
                )}
            </div>
        </div>
    );
};

export default TestTable;
