import EvaluateAttemptModal from '@/components/attempt/evaluate-attempt-modal';
import DeleteItemModal from '@/components/delete-item-modal';
import { type AttemptPaginate, Auth, SearchData } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, Clock, Info, Star, User, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface AttemptTableProps extends AttemptPaginate {
    searchData: SearchData;
}

const AttemptTable = ({ searchData, ...attempt }: AttemptTableProps) => {
    const { t } = useTranslation();
    const { auth } = usePage().props as unknown as { auth?: Auth };
    const isMobile = useIsMobile();

    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role) => role.name === 'Teacher');

    const { delete: deleteAttempt, reset, clearErrors } = useForm();

    const [items, setItems] = useState(attempt.data);
    const [currentPage, setCurrentPage] = useState(attempt.current_page);
    const [hasMore, setHasMore] = useState(attempt.current_page < attempt.last_page);
    const [isLoading, setIsLoading] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setItems(attempt.data);
        setCurrentPage(attempt.current_page);
        setHasMore(attempt.current_page < attempt.last_page);
    }, [attempt.data, attempt.current_page, attempt.last_page]);

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
            console.error('Failed to load more attempts:', error);
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
        deleteAttempt(route('attempt.destroy', { attempt: id }), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                toast.success(t('success.deleted'));
            },
            onError: (err) => {
                toast.error(err?.error || t('error.delete_failed'));
            },
        });
    };

    const AttemptCard = ({ item, globalIndex }: { item: any; globalIndex: number }) => (
        <div 
            className="group relative cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-primary/20 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            onClick={() => item.id && router.get(route('attempt.show', { attempt: item.id }))}
        >
            <div className="flex items-start justify-between gap-3">
                {/* Left: User Avatar & Names */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-400">
                                #{globalIndex.toString().padStart(2, '0')}
                            </span>
                            <span className="truncate font-black text-sm text-slate-900 dark:text-white">
                                {item.user?.name}
                            </span>
                        </div>
                        <p className="truncate text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.mock?.name || item.test?.name}
                        </p>
                    </div>
                </div>

                {/* Right: Score Badge & Actions */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                        item.score && item.score >= 7
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-slate-50 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400'
                    }`}>
                        <Star className={`h-2.5 w-2.5 ${(item.score ?? item?.ai_score_avg) ? 'fill-current' : ''}`} />
                        <span>
                            {item?.score != null
                                ? Number(item.score).toFixed(2)
                                : item?.ai_score_avg != null
                                  ? Number(item.ai_score_avg).toFixed(2)
                                  : t('exam_attempts.pending')}
                        </span>
                    </div>

                    {(item.tab_switch_count ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[9px] font-bold border border-red-200 dark:border-red-800">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {item.tab_switch_count} buzilish
                        </span>
                    )}

                    {item.review && (
                        <span className="text-[8px] font-black tracking-widest text-blue-500 dark:text-blue-400 uppercase">
                            {t('exam_attempts.reviewed')}
                        </span>
                    )}
                </div>
            </div>

            {/* Bottom Meta Row */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100/50 pt-3 dark:border-slate-800/40">
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-300" />
                        {new Date(item.started_at).toLocaleDateString()}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-300" />
                        {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                </div>

                {/* Actions Inline */}
                {(isAdmin || isTeacher) && (
                    <div 
                        className="flex items-center gap-1 rounded-xl bg-slate-50 p-1 dark:bg-slate-800/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EvaluateAttemptModal attempt={item} />
                        <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-700" />
                        <DeleteItemModal item={item} onDelete={handleDelete} />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {isMobile ? (
                /* 📱 MOBILE CARD VIEW */
                <div className="space-y-4">
                    {items.length > 0 ? (
                        items.map((item, index) => {
                            const globalIndex = index + 1;
                            return <AttemptCard key={item.id} item={item} globalIndex={globalIndex} />;
                        })
                    ) : (
                        <div className="tma-card py-20 text-center">
                            <Info className="mx-auto mb-2 h-10 w-10 opacity-20" />
                            <p className="text-xs font-black tracking-widest uppercase text-slate-400">{t('exam_attempts.no_attempts_found')}</p>
                        </div>
                    )}
                </div>
            ) : (
                /* 💻 DESKTOP TABLE VIEW */
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-3.5">#</th>
                                    <th className="px-5 py-3.5">{t('exam_attempts.student') || 'Talaba'}</th>
                                    <th className="px-5 py-3.5">{t('exam_attempts.details') || "Ma'lumotlar"}</th>
                                    <th className="px-5 py-3.5">{t('exam_attempts.timeline') || 'Vaqt'}</th>
                                    <th className="px-5 py-3.5 text-center">{t('exam_attempts.performance') || 'Natija'}</th>
                                    <th className="px-5 py-3.5 text-right">{t('common.actions') || 'Amallar'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {items.length > 0 ? (
                                    items.map((item, index) => {
                                        const globalIndex = index + 1;

                                        return (
                                            <tr 
                                                key={item.id} 
                                                className="group cursor-pointer transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                                                onClick={() => item.id && router.get(route('attempt.show', { attempt: item.id }))}
                                            >
                                                <td className="px-5 py-4 font-mono text-xs font-bold text-slate-400">
                                                    {globalIndex.toString().padStart(2, '0')}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <Link 
                                                        href={item.id ? route('attempt.show', { attempt: item.id }) : '#'} 
                                                        className="group/user flex items-center gap-3"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover/user:bg-indigo-50 group-hover/user:text-indigo-600 dark:bg-slate-800 dark:text-slate-400">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-slate-900 transition-colors group-hover/user:text-indigo-600 dark:text-white dark:group-hover/user:text-indigo-400">
                                                                {item.user?.name}
                                                            </p>
                                                            <p className="text-xs text-slate-400">ID: #{item.user?.id}</p>
                                                        </div>
                                                    </Link>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <div className="max-w-[220px]">
                                                            <p className="truncate font-bold text-sm text-slate-800 dark:text-slate-200">
                                                                {item.mock?.name || item.test?.name}
                                                            </p>
                                                            {item.mock && item.test && (
                                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">{item.test.name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="space-y-1 text-xs font-medium">
                                                        <div
                                                            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"
                                                            title={t('exam_attempts.date_started')}
                                                        >
                                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                            {new Date(item.started_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-400" title={t('exam_attempts.time_started')}>
                                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                            {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div
                                                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                                item.score && item.score >= 7
                                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/60'
                                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            <Star className={`h-3.5 w-3.5 ${(item.score ?? item?.ai_score_avg) ? 'fill-current text-amber-500' : ''}`} />
                                                            {item?.score != null
                                                                ? Number(item.score).toFixed(2)
                                                                : item?.ai_score_avg != null
                                                                  ? Number(item.ai_score_avg).toFixed(2)
                                                                  : (t('exam_attempts.pending') || 'Kutilmoqda')}
                                                        </div>

                                                        {(item.tab_switch_count ?? 0) > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                {item.tab_switch_count} buzilish
                                                            </span>
                                                        )}

                                                        {item.review && (
                                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                                                                {t('exam_attempts.reviewed') || 'Baholangan'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {(isAdmin || isTeacher) && (
                                                            <div 
                                                                className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <EvaluateAttemptModal attempt={item} />
                                                                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
                                                                <DeleteItemModal item={item} onDelete={handleDelete} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <Info className="mb-2 h-8 w-8 opacity-20" />
                                                <p className="font-semibold">{t('exam_attempts.no_attempts_found') || 'Urinishlar topilmadi'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
            )}

            {/* Infinite Scroll Sentinel & Loading Indicator */}
            <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2">
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>{t('common.loading') || 'Loading...'}</span>
                    </div>
                )}
                {!hasMore && items.length > 0 && (
                    <div className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest py-2">
                        {t('common.no_more_items') || 'No more items'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttemptTable;
