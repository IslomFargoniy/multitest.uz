import { Card } from '@/components/design/Card';
import { CriteriaBars } from '@/components/design/CriteriaBars';
import { NoticeBanner } from '@/components/design/NoticeBanner';
import { PageHeader } from '@/components/design/PageHeader';
import { parseAnswerReview, QuestionResultRow } from '@/components/design/QuestionResultRow';
import { ScoreSummary } from '@/components/design/ScoreSummary';
import { StatusPill } from '@/components/design/StatusPill';
import EvaluateAttemptModal from '@/components/attempt/evaluate-attempt-modal';
import ShareableCertificateModal from '@/components/attempt/ShareableCertificateModal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type Attempt, Auth, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, RefreshCw, Share2, Sparkles } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function AttemptShow() {
    const { attempt } = usePage<{ attempt: Attempt }>().props;
    const { t } = useTranslation();
    const { auth } = usePage().props as unknown as { auth?: Auth };
    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role) => role.name === 'Teacher');

    const testName = attempt.mock?.name || attempt.test?.name || attempt.name || t('sidebar.attempt');
    const partsCount = attempt.attempt_parts?.length || 1;

    // Gather all answers across parts
    const allAnswers = useMemo(() => {
        return (attempt.attempt_parts || []).flatMap((part) => part.attempt_answers || []);
    }, [attempt.attempt_parts]);

    // Parse answers, count no_speech, compute criteria averages
    const { processedAnswers, noSpeechCount, criteriaItems } = useMemo(() => {
        let noSpeech = 0;
        let firstGradedFound = false;

        const criteriaSums: Record<string, { sum: number; count: number; labelKey: string }> = {
            fluency: { sum: 0, count: 0, labelKey: 'response_card.fluency' },
            vocabulary: { sum: 0, count: 0, labelKey: 'response_card.vocabulary' },
            grammar: { sum: 0, count: 0, labelKey: 'response_card.grammar' },
            pronunciation: { sum: 0, count: 0, labelKey: 'response_card.pronunciation' },
            interaction: { sum: 0, count: 0, labelKey: 'response_card.interaction' },
        };

        const answers = allAnswers.map((ans) => {
            const parsed = parseAnswerReview(ans);
            if (parsed.status === 'no_speech') {
                noSpeech++;
            }
            if (parsed.status === 'graded') {
                parsed.feedbackItems.forEach((item) => {
                    if (item.score !== null && criteriaSums[item.key]) {
                        criteriaSums[item.key].sum += item.score;
                        criteriaSums[item.key].count += 1;
                    }
                });
            }

            const isFirstGraded = !firstGradedFound && parsed.status === 'graded';
            if (isFirstGraded) {
                firstGradedFound = true;
            }

            return {
                answer: ans,
                parsed,
                isFirstGraded,
            };
        });

        const items = Object.entries(criteriaSums)
            .filter(([_, v]) => v.count > 0)
            .map(([key, v]) => ({
                label: t(v.labelKey, key.charAt(0).toUpperCase() + key.slice(1)),
                value: Number((v.sum / v.count).toFixed(1)),
            }));

        return {
            processedAnswers: answers,
            noSpeechCount: noSpeech,
            criteriaItems: items,
        };
    }, [allAnswers, t]);

    // Determine overall score and source per §4.1
    const overallScore =
        attempt.score !== null && attempt.score !== undefined
            ? Math.round(Number(attempt.score))
            : attempt.ai_score_avg !== null && attempt.ai_score_avg !== undefined
              ? Math.round(Number(attempt.ai_score_avg))
              : null;

    const scoreSource: 'teacher' | 'ai' | 'pending' =
        attempt.score !== null && attempt.score !== undefined
            ? 'teacher'
            : attempt.ai_score_avg !== null && attempt.ai_score_avg !== undefined
              ? 'ai'
              : 'pending';

    // Format dates & durations
    const formattedDate = attempt.started_at
        ? new Date(attempt.started_at).toLocaleDateString()
        : new Date().toLocaleDateString();

    const durationText = useMemo(() => {
        if (!attempt.started_at || !attempt.finished_at) return '—';
        const start = new Date(attempt.started_at).getTime();
        const end = new Date(attempt.finished_at).getTime();
        const diffMs = end - start;
        if (diffMs <= 0) return '—';
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }, [attempt.started_at, attempt.finished_at]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.attempt', 'Urinishlar'),
            href: '/attempt',
        },
        {
            title: testName,
            href: '#',
        },
    ];

    const handleRetake = () => {
        if (attempt.mock_id) {
            router.visit(route('mock.show', { mock: attempt.mock_id }));
        } else if (attempt.test_id) {
            router.visit(route('test.show', { test: attempt.test_id }));
        } else {
            router.visit('/test');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${testName} — ${t('attempt_show.result', 'natija')}`} />

            <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 space-y-6">
                {/* 1. PageHeader */}
                <PageHeader
                    breadcrumbs={[
                        { label: t('sidebar.attempt', 'Urinishlar'), href: '/attempt' },
                        { label: testName },
                    ]}
                    title={`${testName} — ${t('attempt_show.result', 'natija')}`}
                    subtitle={`${formattedDate} · ${partsCount} ${t('attempt_show.parts', 'qism')} · ${allAnswers.length} ${t('attempt_show.questions_count', 'savol')}`}
                    actions={
                        <>
                            {overallScore !== null && attempt.id && (
                                <>
                                    <ShareableCertificateModal
                                        attempt={attempt}
                                        trigger={
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Share2 className="h-4 w-4" />
                                                <span>{t('certificate_modal.share_certificate', 'Ulashish')}</span>
                                            </Button>
                                        }
                                    />
                                    <a
                                        href={route('attempt.certificate', { attempt: attempt.id })}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button variant="default" size="sm" className="gap-2">
                                            <Download className="h-4 w-4" />
                                            <span>{t('attempt_show.certificate', 'Sertifikat')}</span>
                                        </Button>
                                    </a>
                                </>
                            )}
                            <Button variant="secondary" size="sm" onClick={handleRetake} className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                <span>{t('common.retake', 'Qayta topshirish')}</span>
                            </Button>
                            {(isAdmin || isTeacher) && (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => {
                                            if (confirm(t('common.are_you_sure'))) {
                                                router.post(route('attempt.re_evaluate', { attempt: attempt.id }));
                                            }
                                        }}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        <span>{t('attempt_details.re_evaluate', 'Qayta baholash')}</span>
                                    </Button>
                                    <EvaluateAttemptModal
                                        attempt={attempt}
                                        trigger={
                                            <Button variant="secondary" size="sm">
                                                {t('evaluation.evaluate', 'Baholash')}
                                            </Button>
                                        }
                                    />
                                </>
                            )}
                        </>
                    }
                />

                {/* 2. Grid (auto-fit, minmax(300px,1fr), gap 16) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* ScoreSummary + teacher-status pill */}
                    <div className="flex flex-col gap-3">
                        <ScoreSummary score={overallScore} max={75} source={scoreSource} />
                        {attempt.review && (
                            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground">
                                    {t('attempt_show.expert_feedback', "O'qituvchi izohi")}
                                </span>
                                <p className="text-sm font-medium text-foreground leading-relaxed italic">
                                    "{attempt.review}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* CriteriaBars card */}
                    {criteriaItems.length > 0 ? (
                        <CriteriaBars
                            title={t('attempt_show.sub_skills', "Ko'nikmalar tahlili")}
                            items={criteriaItems}
                            wrapInCard
                        />
                    ) : (
                        <Card className="flex flex-col justify-center items-center text-center p-6">
                            <span className="text-sm text-muted-foreground">
                                {t('attempt_show.no_criteria', 'Baholar hali hisoblanmagan')}
                            </span>
                        </Card>
                    )}

                    {/* Urinish haqida Card */}
                    <Card className="flex flex-col justify-between">
                        <h3 className="text-[18px] font-bold text-foreground mb-4">
                            {t('attempt_details.overview', 'Urinish haqida')}
                        </h3>
                        <dl className="divide-y divide-border text-sm flex-1 flex flex-col justify-around">
                            <div className="flex items-center justify-between py-2.5">
                                <dt className="text-muted-foreground">{t('attempt_details.questions_answered', 'Javob berilgan')}</dt>
                                <dd className="font-semibold text-foreground">{allAnswers.length} ta</dd>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <dt className="text-muted-foreground">{t('attempt_details.no_speech', 'Ovoz eshitilmagan')}</dt>
                                <dd className={cn('font-semibold', noSpeechCount > 0 ? 'text-warning' : 'text-foreground')}>
                                    {noSpeechCount} ta
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <dt className="text-muted-foreground">{t('attempt_details.tab_switch', 'Tab almashtirish')}</dt>
                                <dd className={cn('font-semibold', (attempt.tab_switch_count ?? 0) > 0 ? 'text-destructive' : 'text-foreground')}>
                                    {attempt.tab_switch_count ?? 0} marta
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <dt className="text-muted-foreground">{t('attempt_details.duration', 'Davomiyligi')}</dt>
                                <dd className="font-semibold text-foreground font-display">{durationText}</dd>
                            </div>
                        </dl>
                    </Card>
                </div>

                {/* 3. NoticeBanner (only if no_speech > 0) */}
                {noSpeechCount > 0 && (
                    <NoticeBanner
                        tone="warning"
                        title={`${noSpeechCount} ta savolda ovoz eshitilmadi`}
                    >
                        Keyingi safar mikrofon ruxsatini va ovoz balandligini tekshiring.
                    </NoticeBanner>
                )}

                {/* 4. H2 "Savollar" (22/700) then QuestionResultRow per answer */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-[22px] font-bold text-foreground">
                        {t('attempt_show.questions', 'Savollar')}
                    </h2>
                    <div className="space-y-3">
                        {processedAnswers.map(({ answer, isFirstGraded }, idx) => (
                            <QuestionResultRow
                                key={answer.id || idx}
                                index={idx + 1}
                                question={answer.question?.textarea ?? ''}
                                answer={answer}
                                defaultExpanded={isFirstGraded}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
