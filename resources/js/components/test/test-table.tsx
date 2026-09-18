import DeleteItemModal from '@/components/delete-item-modal';
import CreateAttemptModal from '@/components/mock/create-attempt-modal';
import UpdateTestModal from '@/components/test/update-test-modal';
import { Auth, SearchData, type TestPaginate } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

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
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
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
            }
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 🗃️ TEST CARDS GRID */}
            <div className="grid grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item, index) => {
                    const globalIndex = index + 1;

                    if (isStudent) {
                        return (
                            <div
                                key={item.id}
                                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white p-4 shadow-xs transition-all hover:border-indigo-500/30 hover:shadow-md dark:bg-slate-900"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-1 mb-2">
                                        <span className="text-xs font-bold text-slate-400">
                                            #{globalIndex.toString().padStart(2, '0')}
                                        </span>
                                        {item.is_public ? (
                                            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                {t('common.public') || 'Public'}
                                            </span>
                                        ) : (
                                            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                {t('common.private') || 'Private'}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href={`/test/${item.id}`}
                                        className="block text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                                    >
                                        <div className="line-clamp-2 min-h-[2.5rem] break-words">
                                            {item.name}
                                        </div>
                                    </Link>
                                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        {item.language?.flag && <span>{item.language.flag}</span>}
                                        <span>
                                            {i18n.language === 'uz'
                                                ? item.language?.name_uz
                                                : i18n.language === 'ru'
                                                  ? item.language?.name_ru
                                                  : item.language?.name_en}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="transform transition-transform active:scale-95">
                                        <CreateAttemptModal test={item} label={t('start') || 'Boshlash'} />
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={item.id}
                            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="min-w-0">
                                {/* Top bar info */}
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <span className="font-mono text-slate-400">#{globalIndex.toString().padStart(2, '0')}</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        {item.language?.flag && <span className="text-sm">{item.language.flag}</span>}
                                        <span className="truncate">
                                            {i18n.language === 'uz'
                                                ? item.language?.name_uz
                                                : i18n.language === 'ru'
                                                  ? item.language?.name_ru
                                                  : item.language?.name_en}
                                        </span>
                                    </div>

                                    {item.is_public ? (
                                        <span className="inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                                            {t('common.public') || 'Public'}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {t('common.private') || 'Private'}
                                        </span>
                                    )}
                                </div>

                                <Link
                                    href={`/test/${item.id}`}
                                    className="block text-base font-bold text-slate-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                                >
                                    <span className="line-clamp-2 min-h-[2.5rem] break-words">{item.name}</span>
                                </Link>

                                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                    {item.description || t('common.no_description') || 'Tavsif mavjud emas'}
                                </p>

                                {(isAdmin || isTeacher) && item.audio_path && (
                                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2 transition-colors dark:border-slate-800 dark:bg-slate-950/50">
                                        <audio
                                            preload="none"
                                            controls
                                            controlsList="nodownload"
                                            className="h-7 w-full opacity-80 transition-opacity hover:opacity-100"
                                        >
                                            <source src={item.audio_path} />
                                        </audio>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2.5">
                                <div className="transform transition-transform active:scale-95">
                                    <CreateAttemptModal test={item} label={t('start') || 'Boshlash'} />
                                </div>

                                {(isAdmin || auth?.user.id == item.user_id) && (
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <UpdateTestModal test={item} />
                                        <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                        <DeleteItemModal item={item} onDelete={handleDelete} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Infinite Scroll Sentinel & Loading Indicator */}
            <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-4 w-full">
                {isLoading && (
                    <div className="grid grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 w-full">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 animate-pulse">
                                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-full" />
                                <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3" />
                                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl mt-4" />
                            </div>
                        ))}
                    </div>
                )}
                {!hasMore && items.length > 0 && (
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider py-2">
                        {t('common.no_more_items') || 'Barcha testlar yuklandi'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestTable;
