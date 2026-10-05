import { CefrBadge } from '@/components/design/CefrBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type HourlyStatItem, type StatItem, type User, type WeeklyStatItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { LucideActivity, LucideAward, LucideChevronRight, LucideTrendingUp, LucideUserCheck, LucideUserCircle } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
    user: User;
    daily_users: StatItem[];
    daily_attempts: StatItem[];
    hourly_attempts: HourlyStatItem[];
    today_hourly_attempts: HourlyStatItem[];
    weekly_attempts: WeeklyStatItem[];
    [key: string]: unknown;
}

const AttemptsChart = lazy(() => import('@/components/attempt/attempt-chart'));
const DailyStatsChart = lazy(() => import('@/components/dashboard/DailyStatsChart'));
const HourlyAttemptsChart = lazy(() => import('@/components/dashboard/HourlyAttemptsChart'));
const SkillsRadarChart = lazy(() => import('@/components/dashboard/SkillsRadarChart'));
const WeeklyAttemptsChart = lazy(() => import('@/components/dashboard/WeeklyAttemptsChart'));
const ChartFallback = () => <Skeleton className="h-72 w-full rounded-xl" />;

export default function Dashboard() {
    const { user, daily_users, daily_attempts, hourly_attempts, today_hourly_attempts, weekly_attempts } = usePage<DashboardProps>().props;
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard'),
            href: '/dashboard',
        },
    ];

    const attempts = user.attempts ?? [];
    const attemptScores = attempts.map((a) => a.score ?? a.ai_score_avg ?? 0).filter((s) => s > 0);
    const maxScore = attemptScores.length > 0 ? Math.max(...attemptScores).toFixed(1) : '—';
    const lastScore = user.last_attempt?.score ?? user.last_attempt?.ai_score_avg;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.dashboard')} />

            <div className="flex min-h-0 w-full flex-grow flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Unified Hero Welcome & Action Card */}
                <div className="border-border bg-card flex flex-col items-start justify-between gap-4 rounded-xl border p-5 shadow-sm sm:flex-row sm:items-center sm:p-6 dark:shadow-none">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="border-border h-12 w-12 rounded-xl border object-cover" />
                            ) : (
                                <div className="bg-surface-2 text-primary border-border flex h-12 w-12 items-center justify-center rounded-xl border">
                                    <LucideUserCircle className="h-7 w-7" />
                                </div>
                            )}
                            <span className="border-card bg-success absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h1 className="text-foreground text-xl leading-tight font-bold tracking-tight sm:text-2xl">
                                {t('welcome_back')}, {user.name.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-muted-foreground text-xs sm:text-sm">
                                {t('dashboard.next_step_desc', 'Speaking darajangizni muntazam oshirib boring')}
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-full rounded-lg px-5 text-xs font-semibold shadow-sm transition-all sm:w-auto"
                    >
                        <Link href="/test" className="flex items-center gap-1.5">
                            <span>{t('dashboard.start_test', 'Testni boshlash')}</span>
                            <LucideChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* 4-Stat Grid: 12px label muted, 28px Space Grotesk tabular-nums, CEFR badge */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {/* Stat 1: Total Attempts */}
                    <Card className="border-border bg-card rounded-xl border shadow-sm dark:shadow-none">
                        <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">{t('exam_attempts.title')}</span>
                                <LucideActivity className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="mt-1">
                                <div className="font-display text-foreground text-[28px] leading-tight font-bold tabular-nums">{attempts.length}</div>
                                <div className="bg-secondary text-muted-foreground mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs">
                                    <span>{t('completedTests')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat 2: Last Attempt Score */}
                    <Card className="border-border bg-card rounded-xl border shadow-sm dark:shadow-none">
                        <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">{t('lastAttempt')}</span>
                                <LucideTrendingUp className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="mt-1">
                                <div className="font-display text-foreground text-[28px] leading-tight font-bold tabular-nums">
                                    {lastScore != null ? Number(lastScore).toFixed(1) : '—'}
                                </div>
                                <div className="mt-1 inline-flex items-center gap-1">
                                    {lastScore != null ? (
                                        <CefrBadge score={Number(lastScore)} />
                                    ) : (
                                        <span className="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-xs">{t('latest_result')}</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat 3: Best Score */}
                    <Card className="border-border bg-card rounded-xl border shadow-sm dark:shadow-none">
                        <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">{t('dashboard.best_score', 'Eng yuqori ball')}</span>
                                <LucideAward className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="mt-1">
                                <div className="font-display text-foreground text-[28px] leading-tight font-bold tabular-nums">{maxScore}</div>
                                <div className="bg-secondary text-muted-foreground mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs">
                                    <span>CEFR Max</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat 4: Account Status */}
                    <Card className="border-border bg-card rounded-xl border shadow-sm dark:shadow-none">
                        <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">{t('dashboard.status', 'Holat')}</span>
                                <LucideUserCheck className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="mt-1">
                                <div className="font-display text-foreground text-[28px] leading-tight font-bold tabular-nums">
                                    {attempts.length > 0 ? 'Faol' : 'Yangi'}
                                </div>
                                <div className="bg-secondary text-muted-foreground mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs">
                                    <span>{t('dashboard.member', 'A‘zo')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="min-w-0 lg:col-span-8">
                        <Suspense fallback={<ChartFallback />}>
                            <AttemptsChart attempts={attempts} className="h-full" />
                        </Suspense>
                    </div>
                    <div className="min-w-0 lg:col-span-4">
                        <Suspense fallback={<ChartFallback />}>
                            <SkillsRadarChart className="h-full" />
                        </Suspense>
                    </div>
                </div>

                {/* Recent Attempts List */}
                {attempts.length > 0 && (
                    <div className="border-border bg-card rounded-xl border p-6 shadow-sm dark:shadow-none">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-foreground text-base font-bold">{t('recent_attempts', 'So‘nggi urinishlar')}</h2>
                            <Link href="/attempt" className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline">
                                <span>{t('view_all', 'Barchasini ko‘rish')}</span>
                                <LucideChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="divide-border divide-y">
                            {attempts.slice(0, 5).map((attempt) => {
                                const score = attempt.score ?? attempt.ai_score_avg;
                                return (
                                    <div key={attempt.id} className="flex items-center justify-between gap-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {score != null ? (
                                                <CefrBadge score={Number(score)} />
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                            <div>
                                                <p className="text-foreground text-sm font-semibold">
                                                    {attempt.test?.name || `Attempt #${attempt.id}`}
                                                </p>
                                                <p className="text-muted-foreground text-xs tabular-nums">
                                                    {new Date(attempt.finished_at || attempt.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/attempt/${attempt.id}`}>{t('view', 'Ko‘rish')}</Link>
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Daily Stats Chart (admin-level data) */}
                {(daily_users?.length > 0 || daily_attempts?.length > 0) && (
                    <div className="min-w-0">
                        <Suspense fallback={<ChartFallback />}>
                            <DailyStatsChart daily_users={daily_users ?? []} daily_attempts={daily_attempts ?? []} />
                        </Suspense>
                    </div>
                )}

                {/* Hourly Charts */}
                {(today_hourly_attempts?.length > 0 || hourly_attempts?.length > 0) && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="min-w-0">
                            <Suspense fallback={<ChartFallback />}>
                                <HourlyAttemptsChart
                                    data={today_hourly_attempts ?? []}
                                    title={t('stats.today_hourly', "Today's hourly stats")}
                                    className="h-full"
                                />
                            </Suspense>
                        </div>
                        <div className="min-w-0">
                            <Suspense fallback={<ChartFallback />}>
                                <HourlyAttemptsChart
                                    data={hourly_attempts ?? []}
                                    title={t('stats.alltime_hourly', 'All-time hourly stats')}
                                    className="h-full"
                                />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* Weekly Chart */}
                {weekly_attempts?.length > 0 && (
                    <div className="min-w-0">
                        <Suspense fallback={<ChartFallback />}>
                            <WeeklyAttemptsChart data={weekly_attempts} title={t('stats.weekly', 'Weekly attempt distribution')} />
                        </Suspense>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
