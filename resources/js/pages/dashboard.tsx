import AttemptsChart from '@/components/attempt/attempt-chart';
import DailyStatsChart from '@/components/dashboard/DailyStatsChart';
import HourlyAttemptsChart from '@/components/dashboard/HourlyAttemptsChart';
import SkillsRadarChart from '@/components/dashboard/SkillsRadarChart';
import WeeklyAttemptsChart from '@/components/dashboard/WeeklyAttemptsChart';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type HourlyStatItem, type StatItem, type User, type WeeklyStatItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { LucideActivity, LucideTrendingUp, LucideUserCircle } from 'lucide-react';
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

export default function Dashboard() {
    const { user, daily_users, daily_attempts, hourly_attempts, today_hourly_attempts, weekly_attempts } =
        usePage<DashboardProps>().props;
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard'),
            href: '/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.dashboard')} />

            <div className="flex min-h-0 w-full flex-grow flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:gap-8 lg:p-8">
                {/* 🌈 Welcome Header Section */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                            {t('welcome_back')}, {user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('check_your_progress_and_scores')}</p>
                    </div>
                    <div className="relative shrink-0">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-slate-200 dark:border-slate-800 object-cover shadow-sm"
                            />
                        ) : (
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                                <LucideUserCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                        )}
                        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500 dark:border-slate-900"></span>
                    </div>
                </div>

                {/* 📊 Top Stats Grid */}
                <div className="grid grid-cols-2 gap-3.5 sm:gap-6">
                    {/* Exam Attempts Card */}
                    <Card className="rounded-2xl border-border bg-card shadow-sm transition-all hover:shadow-md">
                        <CardContent className="flex flex-col justify-between h-full p-4">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">{t('exam_attempts.title')}</span>
                                <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                    <LucideActivity className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{user.attempts?.length ?? 0}</div>
                                <div className="mt-0.5 flex items-center gap-1 text-[9px] sm:text-xs font-black text-blue-500 uppercase">
                                    <span>{t('completedTests')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Last Attempt Card */}
                    <Card className="rounded-2xl border-border bg-card shadow-sm transition-all hover:shadow-md">
                        <CardContent className="flex flex-col justify-between h-full p-4">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">{t('lastAttempt')}</span>
                                <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                                    <LucideTrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {user.last_attempt?.score ?? user.last_attempt?.ai_score_avg ?? 0}
                                </div>
                                <div className="mt-0.5 flex items-center gap-1 text-[9px] sm:text-xs font-black text-emerald-500 uppercase">
                                    <span>{t('latest_result')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 📈 Attempts + Skills Charts */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                    <div className="min-w-0 lg:col-span-8">
                        <AttemptsChart attempts={user.attempts ?? []} className="h-full" />
                    </div>
                    <div className="min-w-0 lg:col-span-4">
                        <SkillsRadarChart className="h-full" />
                    </div>
                </div>

                {/* 📊 Daily Stats Chart (admin-level data) */}
                {(daily_users?.length > 0 || daily_attempts?.length > 0) && (
                    <div className="min-w-0">
                        <DailyStatsChart daily_users={daily_users ?? []} daily_attempts={daily_attempts ?? []} />
                    </div>
                )}

                {/* ⏰ Hourly Charts */}
                {(today_hourly_attempts?.length > 0 || hourly_attempts?.length > 0) && (
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                        <div className="min-w-0">
                            <HourlyAttemptsChart
                                data={today_hourly_attempts ?? []}
                                title={t('stats.today_hourly', "Today's hourly stats")}
                                className="h-full"
                            />
                        </div>
                        <div className="min-w-0">
                            <HourlyAttemptsChart
                                data={hourly_attempts ?? []}
                                title={t('stats.alltime_hourly', 'All-time hourly stats')}
                                className="h-full"
                            />
                        </div>
                    </div>
                )}

                {/* 📅 Weekly Chart */}
                {weekly_attempts?.length > 0 && (
                    <div className="min-w-0">
                        <WeeklyAttemptsChart
                            data={weekly_attempts}
                            title={t('stats.weekly', 'Weekly attempt distribution')}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
