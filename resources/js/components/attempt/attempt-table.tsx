import EvaluateAttemptModal from '@/components/attempt/evaluate-attempt-modal';
import DeleteItemModal from '@/components/delete-item-modal';
import { CefrBadge } from '@/components/design/CefrBadge';
import { type AttemptPaginate, Auth, SearchData } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, BookOpen, Calendar, Clock, Info, Loader2, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
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
                    'X-Requested-With': 'XMLHttpRequest',
                },
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

    const getScore = (item: any) => {
        if (item.score != null) return Math.round(Number(item.score));
        if (item.ai_score_avg != null) return Math.round(Number(item.ai_score_avg));
        return null;
    };

    const AttemptCard = ({ item, globalIndex }: { item: any; globalIndex: number }) => {
        const score = getScore(item);

        return (
            <div
                className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:border-border-strong"
                onClick={() => item.id && router.get(route('attempt.show', { attempt: item.id }))}
            >
                <div className="flex items-start justify-between gap-3">
                    {/* Left: User & Test */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                            <User className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-display text-xs font-semibold text-muted-foreground">
                                    #{globalIndex.toString().padStart(2, '0')}
                                </span>
                                <span className="truncate font-semibold text-sm text-foreground">
                                    {item.user?.name}
                                </span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground mt-0.5">
                                {item.mock?.name || item.test?.name}
                            </p>
                        </div>
                    </div>

                    {/* Right: Score */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-2">
                            <CefrBadge score={score} />
                            <span className="font-display font-semibold text-sm text-foreground tabular-nums">
                                {score !== null ? `${score}/75` : t('exam_attempts.pending', 'Kutilmoqda')}
                            </span>
                        </div>

                        {(item.tab_switch_count ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20">
                                <AlertTriangle className="w-3 h-3" />
                                {item.tab_switch_count} buzilish
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom Meta Row */}
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(item.started_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 font-display">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                    </div>

                    {(isAdmin || isTeacher) && (
                        <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <EvaluateAttemptModal attempt={item} />
                            <DeleteItemModal item={item} onDelete={handleDelete} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {isMobile ? (
                /* 📱 MOBILE CARD VIEW */
                <div className="space-y-3">
                    {items.length > 0 ? (
                        items.map((item, index) => {
                            const globalIndex = index + 1;
                            return <AttemptCard key={item.id} item={item} globalIndex={globalIndex} />;
                        })
                    ) : (
                        <div className="rounded-xl border border-border bg-card py-16 text-center">
                            <Info className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-semibold text-muted-foreground">{t('exam_attempts.no_attempts_found', 'Urinishlar topilmadi')}</p>
                        </div>
                    )}
                </div>
            ) : (
                /* 💻 DESKTOP TABLE VIEW */
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-sunken text-xs font-semibold text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-5 py-3">#</th>
                                <th className="px-5 py-3">{t('exam_attempts.student', 'Talaba')}</th>
                                <th className="px-5 py-3">{t('exam_attempts.details', "Ma'lumotlar")}</th>
                                <th className="px-5 py-3">{t('exam_attempts.timeline', 'Vaqt')}</th>
                                <th className="px-5 py-3 text-center">{t('exam_attempts.performance', 'Natija')}</th>
                                <th className="px-5 py-3 text-right">{t('common.actions', 'Amallar')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.length > 0 ? (
                                items.map((item, index) => {
                                    const globalIndex = index + 1;
                                    const score = getScore(item);

                                    return (
                                        <tr
                                            key={item.id}
                                            className="cursor-pointer transition-colors hover:bg-secondary/40"
                                            onClick={() => item.id && router.get(route('attempt.show', { attempt: item.id }))}
                                        >
                                            <td className="px-5 py-3.5 font-display text-xs font-semibold text-muted-foreground">
                                                {globalIndex.toString().padStart(2, '0')}
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-foreground hover:text-accent-text transition-colors">
                                                            {item.user?.name}
                                                        </p>
                                                        <p className="font-display text-xs text-muted-foreground">ID: #{item.user?.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2 max-w-[240px]">
                                                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <span className="truncate font-semibold text-sm text-foreground">
                                                        {item.mock?.name || item.test?.name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                                <div>{new Date(item.started_at).toLocaleDateString()}</div>
                                                <div className="font-display">
                                                    {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <CefrBadge score={score} />
                                                    <span className="font-display font-semibold text-sm text-foreground tabular-nums">
                                                        {score !== null ? `${score}/75` : t('exam_attempts.pending', 'Kutilmoqda')}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 text-right">
                                                {(isAdmin || isTeacher) && (
                                                    <div
                                                        className="flex items-center justify-end gap-1.5"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <EvaluateAttemptModal attempt={item} />
                                                        <DeleteItemModal item={item} onDelete={handleDelete} />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                                        <Info className="mx-auto mb-2 h-6 w-6 text-muted-foreground opacity-50" />
                                        <p className="font-semibold">{t('exam_attempts.no_attempts_found', 'Urinishlar topilmadi')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="py-4 flex flex-col items-center justify-center gap-2">
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>{t('common.loading', 'Yuklanmoqda...')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttemptTable;
