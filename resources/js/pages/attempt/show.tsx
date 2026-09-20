import AttemptPartAccordion from '@/components/attempt/AttemptPartAccordion';
import EvaluateAttemptModal from '@/components/attempt/evaluate-attempt-modal';
import ShareableCertificateModal from '@/components/attempt/ShareableCertificateModal';
import AppLayout from '@/layouts/app-layout';
import { type Attempt, Auth, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AttemptShow() {
    const { attempt } = usePage<{ attempt: Attempt }>().props;
    const { t } = useTranslation();
    const { auth } = usePage().props as unknown as { auth?: Auth };
    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role) => role.name === 'Teacher');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${t('sidebar.attempt')} ( ${attempt.name || attempt.mock?.name || attempt.test?.name || ''} )`,
            href: '/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('sidebar.attempt')} - ${attempt.name || attempt.mock?.name || attempt.test?.name || ''}`} />

            <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-7xl space-y-4 p-1.5 duration-700 sm:space-y-8 sm:p-6">
                {/* 🎨 PREMIUM HEADER SECTION */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-4 text-white shadow-2xl sm:p-8 lg:p-10">
                    {/* Decorative Background Glows */}
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-500/20 blur-[100px]" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />

                        <div className="flex flex-col gap-4 sm:flex-row lg:items-end">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-blue-300 uppercase backdrop-blur-md">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                                    {t('attempt_show.assessment_report')}
                                </div>
                                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                                    {attempt?.mock?.name || attempt.test?.name}
                                </h1>
                                <p className="max-w-2xl text-base font-medium text-slate-400 italic sm:text-lg">
                                    "{attempt.name || attempt.mock?.name || attempt.test?.name || ''}" — {t('attempt_show.performance_analysis')}.
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3 flex-wrap">
                                {attempt.score !== null && attempt.id && (
                                    <>
                                        <ShareableCertificateModal attempt={attempt} />
                                        <a
                                            href={route('attempt.certificate', { attempt: attempt.id })}
                                            target="_blank"
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/20"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            {t('attempt_show.download_pdf')}
                                        </a>
                                    </>
                                )}
                                {(isAdmin || isTeacher) && (
                                    <button
                                        onClick={() => {
                                            if (confirm(t('common.are_you_sure'))) {
                                                router.post(route('attempt.re_evaluate', { attempt: attempt.id }), {}, {
                                                    onSuccess: () => {
                                                        // Success handled by toast/redirect
                                                    }
                                                 });
                                            }
                                        }}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500/10 px-6 py-3 text-sm font-bold text-blue-300 transition-all hover:bg-blue-500/20"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        {t('attempt_details.re_evaluate')} (All)
                                    </button>
                                )}
                                {(isAdmin || isTeacher) && <EvaluateAttemptModal attempt={attempt} />}
                            </div>
                        </div>
                </div>

                {/* 📊 SCORE & STATS GRID */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
                    {/* Main Score Card */}
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
                        <div className="relative z-10 flex flex-col items-center justify-center space-y-2 text-center">
                            <div className="text-xs font-black tracking-widest text-slate-400 uppercase">{t('attempt_show.final_score')}</div>
                            <div className="relative">
                                {/* SVG Circular Progress Background */}
                                <svg className="h-32 w-32 -rotate-90 transform">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-slate-100 dark:text-slate-800"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={364.4}
                                        strokeDashoffset={364.4 - (364.4 * (attempt.score ?? 0)) / 75}
                                        className="text-blue-600 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                                        {attempt?.score != null
                                            ? Number(attempt.score).toFixed(2)
                                            : attempt?.ai_score_avg != null
                                              ? Number(attempt.ai_score_avg).toFixed(2)
                                              : '—'}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">/ 75</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Metadata Card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                        <div className="grid h-full grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-8">
                            <MetaItem
                                label={t('attempt_show.started_at')}
                                value={attempt.started_at ? new Date(attempt.started_at).toLocaleDateString() : t('attempt_show.not_available')}
                                subValue={
                                    attempt.started_at
                                        ? new Date(attempt.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                                        : '--:--'
                                }
                                icon="🕒"
                            />
                            <MetaItem
                                label={t('attempt_show.finished_at')}
                                value={attempt.finished_at ? new Date(attempt.finished_at).toLocaleDateString() : t('attempt_show.not_available')}
                                subValue={
                                    attempt.finished_at
                                        ? new Date(attempt.finished_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                                        : '--:--'
                                }
                                icon="🏁"
                            />
                        </div>
                    </div>
                </div>

                {/* 💬 FEEDBACK SECTION */}
                {attempt.review && (
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-8">
                        <div className="absolute top-0 right-0 p-4 text-white/10 transition-transform group-hover:scale-110">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM14.017 11V14H21.017V11H14.017ZM14.017 1V4H21.017V1H14.017ZM3.0166 21V18C3.0166 16.8954 3.91203 16 5.0166 16H8.0166C9.12117 16 10.0166 16.8954 10.0166 18V21C10.0166 22.1046 9.12117 23 8.0166 23H5.0166C3.91203 23 3.0166 22.1046 3.0166 21ZM3.0166 11V14H10.0166V11H3.0166ZM3.0166 1V4H10.0166V1H3.0166Z" />
                            </svg>
                        </div>
                        <div className="relative">
                            <p className="mb-2 text-xs font-black tracking-[0.2em] text-blue-100 uppercase">{t('attempt_show.expert_feedback')}</p>
                            <p className="text-xl leading-relaxed font-medium italic">"{attempt.review}"</p>
                        </div>
                    </div>
                )}

                {/* 🧩 DETAILED ANSWERS SECTION */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 px-2">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('attempt_show.question_breakdown')}</h3>
                        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <AttemptPartAccordion
                        attempt_parts={attempt.attempt_parts ?? []}
                        isAdmin={isAdmin}
                        isTeacher={isTeacher}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

/* --- Helper Components --- */

export interface MetaItemProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: React.ReactNode;
    color?: string;
}

function MetaItem({ label, value, subValue, icon, color = 'text-slate-800' }: MetaItemProps) {
    return (
        <div className="flex flex-col items-start justify-center space-y-1 p-4">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                <span className="text-base">{icon}</span>
                {label}
            </div>
            <p className={`text-lg leading-tight font-bold dark:text-white ${color}`}>{value}</p>
            {subValue && <p className="text-xs font-medium tracking-tight text-slate-400">{subValue}</p>}
        </div>
    );
}
