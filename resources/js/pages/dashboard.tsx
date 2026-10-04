import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CefrBadge } from '@/components/design/CefrBadge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type HourlyStatItem, type StatItem, type User, type WeeklyStatItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { LucideActivity, LucideAward, LucideChevronRight, LucideCompass, LucideTrendingUp, LucideUserCheck, LucideUserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { lazy, Suspense } from 'react';

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
                {/* Hero / Welcome Banner: No gradients, clean bg-card */}
                <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl sm:text-[32px] font-bold text-foreground leading-tight tracking-tight">
                            {t('welcome_back')}, {user.name.split(' ')[0]}!
                        </h1>
                        <p className="text-sm text-muted-foreground">{t('check_your_progress_and_scores')}</p>
                    </div>
                    <div className="relative shrink-0">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-12 w-12 rounded-full border border-border object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground border border-border">
                                <LucideUserCircle className="h-7 w-7" />
                            </div>
                        )}
                        <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
                    </div>
                </div>

                {/* Keyingi qadam (Next Step Card): bg-surface-2 border border-border-strong */}
                <div className="rounded-lg border border-border-strong bg-surface-2 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <LucideCompass className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                {t('dashboard.next_step_title', 'Keyingi testni topshiring')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('dashboard.next_step_desc', 'Speaking darajangizni muntazam oshirib boring')}
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="default" size="default">
                        <Link href="/tests">
                            {t('dashboard.start_test', 'Testni boshlash')}
                        </Link>
                    </Button>
                </div>

                {/* 4-Stat Grid: 12px label muted, 28px Space Grotesk tabular-nums, 12px trend chip */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {/* Stat 1: Total Attempts */}
                    <Card className="rounded-xl border border-border bg-card shadow-sm dark:shadow-none">
                        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {t('exam_attempts.title')}
                                </span>
                                <LucideActivity className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="mt-1">
                                <div className="font-display text-[28px] font-bold tabular-nums text-foreground leading-tight">
                                    {attempts.length}
                                </div>
                                <div className="mt-1 inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                                    <span>{t('completedTests')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat 2: Last Attempt Score */}
                    <Card className="rounded-xl border border-border bg-card shadow-sm dark:shadow-none">
                        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {t('lastAttempt')}
                                </span>
                                <LucideTrendingUp className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="mt-1">
                                <div className="font-display text-[28px] font-bold tabular-nums text-foreground leading-tight">
                                    {lastScore != null ? Number(lastScore).toFixed(1) : '—'}
                                </div>
                                <div className="mt-1 inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                                    <span>{t('latest_result')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat 3: Best Score */}
                    <Card className="rounded-xl border border-border bg-card shadow-sm dark:shadow-none">
                        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {t('dashboard.best_score', 'Eng yuqori ball')}
                                </span>
                                <LucideAward className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="mt-1">
                                <div className="font-display text-[28px] font-bold tabular-nums text-foreground leading-tight">
                                    {maxScore}
                                </div>
                                <div className="mt-1 inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                                    <span>CEFR Max</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat 4: Account Status */}
                    <Card className="rounded-xl border border-border bg-card shadow-sm dark:shadow-none">
                        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {t('dashboard.status', 'Holat')}
                                </span>
                                <LucideUserCheck className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="mt-1">
                                <div className="font-display text-[28px] font-bold tabular-nums text-foreground leading-tight">
                                    {attempts.length > 0 ? 'Faol' : 'Yangi'}
                                </div>
                                <div className="mt-1 inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
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
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-foreground">
                                {t('recent_attempts', 'So‘nggi urinishlar')}
                            </h2>
                            <Link href="/attempts" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                                <span>{t('view_all', 'Barchasini ko‘rish')}</span>
                                <LucideChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="divide-y divide-border">
                            {attempts.slice(0, 5).map((attempt) => {
                                const score = attempt.score ?? attempt.ai_score_avg;
                                return (
                                    <div key={attempt.id} className="py-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            {score != null ? (
                                                <CefrBadge score={Number(score)} />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {attempt.test?.name || `Attempt #${attempt.id}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground tabular-nums">
                                                    {new Date(attempt.finished_at || attempt.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/attempts/${attempt.id}`}>
                                                {t('view', 'Ko‘rish')}
                                            </Link>
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
