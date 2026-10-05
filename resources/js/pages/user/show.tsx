import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, Phone, ShieldCheck, User as UserIcon, Zap, FileText, Layout, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BsTelegram } from 'react-icons/bs';
import { formatDateTime } from '@/lib/date';

export default function UserShow() {
    const { user } = usePage<{
        user: User;
    }>().props;
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('nav.users'),
            href: '/user',
        },
        {
            title: user.name,
            href: `/user/${user.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('user_management.user_profile')} - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:gap-6 sm:p-4 lg:gap-8 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/user"
                            className="group flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card transition-colors hover:border-border-strong hover:bg-accent"
                        >
                            <ArrowLeft className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{user.name}</h1>
                            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary">
                                    @{user.username}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-border"></span>
                                <span className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4" />
                                    {user.email || 'No email'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {user.roles?.map((role) => (
                            <span
                                key={role.id}
                                className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3.5 py-1 text-xs font-semibold tracking-wider text-foreground uppercase"
                            >
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                {role.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-xl border border-border bg-card shadow-xs">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('exam_attempts.title')}</p>
                                <div className="text-3xl font-bold font-mono text-primary tabular-nums mt-1">{user.attempts_count || 0}</div>
                            </div>
                            <div className="rounded-xl bg-primary/10 text-primary p-3">
                                <Zap className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border bg-card shadow-xs">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tests Created</p>
                                <div className="text-3xl font-bold font-mono text-foreground tabular-nums mt-1">{user.tests_count || 0}</div>
                            </div>
                            <div className="rounded-xl bg-warning/10 text-warning p-3">
                                <FileText className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border bg-card shadow-xs">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mocks Organized</p>
                                <div className="text-3xl font-bold font-mono text-foreground tabular-nums mt-1">{user.mocks_count || 0}</div>
                            </div>
                            <div className="rounded-xl bg-success/10 text-success p-3">
                                <Layout className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border bg-card shadow-xs">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Activity</p>
                                <div className="text-base font-bold text-foreground mt-2 font-mono tabular-nums">
                                    {user.last_attempt 
                                        ? formatDateTime(user.last_attempt.finished_at || user.last_attempt.created_at) 
                                        : 'No activity'}
                                </div>
                            </div>
                            <div className="rounded-xl bg-secondary text-muted-foreground p-3">
                                <Activity className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column: Profile Card */}
                    <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-secondary text-muted-foreground border border-border">
                                        <UserIcon size={56} />
                                    </div>
                                    <div className="absolute -right-1.5 -bottom-1.5 h-6 w-6 rounded-full border-2 border-card bg-success"></div>
                                </div>
                                <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
                                <p className="mt-1 text-sm font-medium text-muted-foreground">
                                    {t('user_management.member_since', { date: formatDateTime(user.created_at) })}
                                </p>
                            </div>

                            <div className="mt-6 space-y-4 border-t border-border pt-6">
                                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Contact Information</h4>
                                
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground border border-border">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase">Phone</div>
                                        <div className="text-sm font-semibold text-foreground">{user.phone || '—'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground border border-border">
                                        <BsTelegram className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase">Telegram</div>
                                        <div className="text-sm font-semibold text-foreground">
                                            {user.telegram_id ? `@${user.telegram_id}` : 'Not linked'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground border border-border">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase">Registered At</div>
                                        <div className="text-sm font-semibold text-foreground font-mono tabular-nums">
                                            {formatDateTime(user.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity / Last Attempt */}
                    <div className="lg:col-span-2 space-y-6">
                        {user.last_attempt ? (
                            <div className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-foreground">Latest Exam Performance</h3>
                                    <Link 
                                        href={route('attempt.show', user.last_attempt.id)}
                                        className="text-xs font-semibold tracking-tight text-primary hover:underline"
                                    >
                                        View Full Report →
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface-2 p-5">
                                        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Test Title</span>
                                        <span className="font-bold text-foreground">{user.last_attempt.test?.name || 'Mock Exam'}</span>
                                    </div>

                                    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface-2 p-5">
                                        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Score / Result</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold font-mono text-primary">
                                                {user.last_attempt.score || user.last_attempt.ai_score_avg || 0}
                                            </span>
                                            <span className="text-xs font-medium text-muted-foreground">overall</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
                                <div className="mb-4 rounded-xl bg-secondary p-4 text-muted-foreground">
                                    <Activity className="h-7 w-7" />
                                </div>
                                <h4 className="font-bold text-foreground">{t('user_management.no_recent_activity')}</h4>
                                <p className="mt-1 text-sm text-muted-foreground">This user hasn't attempted any tests yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
