import SafeHtml from '@/components/safe-html';
import { cn } from '@/lib/utils';
import { htmlToPlainText } from '@/utils/html';
import { ChevronDown, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AudioPlayer } from './AudioPlayer';
import { AnswerStatus, StatusPill } from './StatusPill';

export interface AnswerData {
    id?: number | string;
    score_ai?: number | null;
    audio_path?: string | null;
    transcript?: string | null;
    review_ai?: string | null;
    question?: any;
    [key: string]: any;
}

export interface QuestionResultRowProps {
    index: number;
    question: string;
    answer: AnswerData;
    defaultExpanded?: boolean;
    className?: string;
}

export function parseAnswerReview(answer: AnswerData): {
    status: AnswerStatus;
    score: number | null;
    transcript: string | null;
    feedbackItems: { key: string; labelKey: string; comment: string; score: number | null }[];
    isAiError: boolean;
} {
    const rawReview = answer?.review_ai;
    const authoritativeScore = answer?.score_ai !== undefined && answer?.score_ai !== null ? Number(answer.score_ai) : null;

    if (!rawReview && authoritativeScore === null) {
        return {
            status: 'pending',
            score: null,
            transcript: answer?.transcript || null,
            feedbackItems: [],
            isAiError: false,
        };
    }

    if (typeof rawReview === 'string' && rawReview.trim().startsWith('AI Error')) {
        return {
            status: 'ai_error',
            score: authoritativeScore,
            transcript: answer?.transcript || null,
            feedbackItems: [],
            isAiError: true,
        };
    }

    let data: any = null;
    if (typeof rawReview === 'string') {
        try {
            data = JSON.parse(rawReview);
        } catch {
            data = null;
        }
    } else if (typeof rawReview === 'object' && rawReview !== null) {
        data = rawReview;
    }

    let status: AnswerStatus = 'graded';

    if (data?.override_reason === 'no_speech') {
        status = 'no_speech';
    } else if (data?.override_reason === 'wrong_language') {
        status = 'wrong_language';
    } else if (data?.override_reason === 'not_relevant') {
        status = 'off_topic';
    } else if (authoritativeScore === null && !data) {
        status = 'pending';
    }

    const transcript = answer?.transcript || data?.transcript || null;

    const criteriaKeys = [
        { key: 'fluency', labelKey: 'response_card.fluency' },
        { key: 'vocabulary', labelKey: 'response_card.vocabulary' },
        { key: 'grammar', labelKey: 'response_card.grammar' },
        { key: 'pronunciation', labelKey: 'response_card.pronunciation' },
        { key: 'interaction', labelKey: 'response_card.interaction' },
    ];

    const feedbackItems: { key: string; labelKey: string; comment: string; score: number | null }[] = [];

    if (data && status !== 'no_speech') {
        for (const c of criteriaKeys) {
            const rawText = data[c.key];
            if (typeof rawText === 'string' && rawText.trim().length > 0) {
                const scoreMatch = rawText.match(/(\d+(?:\.\d+)?)\s*\/\s*15/);
                const itemScore = scoreMatch ? parseFloat(scoreMatch[1]) : null;

                const cleanedText = rawText
                    .replace(/(?:^|\n)\s*Score:\s*\d+(?:\.\d+)?\s*\/\s*15[\s.:-]*/gi, '')
                    .replace(/\s*\(?Score:\s*\d+(?:\.\d+)?\s*\/\s*15\)?\s*$/gi, '')
                    .trim();

                feedbackItems.push({
                    key: c.key,
                    labelKey: c.labelKey,
                    comment: cleanedText,
                    score: itemScore,
                });
            }
        }
    }

    return {
        status,
        score: authoritativeScore,
        transcript,
        feedbackItems,
        isAiError: false,
    };
}

export function QuestionResultRow({ index, question, answer, defaultExpanded = false, className }: QuestionResultRowProps) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const parsed = parseAnswerReview(answer);

    // Strip HTML for the header preview snippet
    const questionSnippet = htmlToPlainText(question);

    return (
        <div className={cn('border-border bg-card overflow-hidden rounded-xl border transition-colors', className)}>
            {/* Collapsible Header Button */}
            <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-secondary/40 focus-visible:ring-ring flex w-full items-center justify-between gap-3 p-4 text-left transition-colors focus:outline-none focus-visible:ring-2"
            >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    {/* 32px number chip */}
                    <div className="bg-secondary text-accent-text font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold select-none">
                        {index.toString().padStart(2, '0')}
                    </div>

                    {/* Question 15/600 */}
                    <div className="text-foreground min-w-0 flex-1 truncate text-[15px] font-semibold">
                        {questionSnippet || `${t('question_result.question', 'Savol')} ${index}`}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <StatusPill status={parsed.status} />

                    {/* Score Space Grotesk */}
                    <span className="font-display text-foreground min-w-[54px] text-right text-[14px] font-semibold tabular-nums select-none">
                        {parsed.score !== null ? `${parsed.score} / 75` : '— / 75'}
                    </span>

                    <ChevronDown
                        className={cn('text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')}
                        aria-hidden="true"
                    />
                </div>
            </button>

            {/* Collapsible Body: 2 columns ≥ 720px */}
            {isExpanded && (
                <div className="border-border bg-card grid grid-cols-1 gap-6 border-t p-5 md:grid-cols-2">
                    {/* LEFT COLUMN: Question HTML, Audio Player & Transcript */}
                    <div className="space-y-4">
                        {/* Question Content */}
                        <div className="space-y-1.5">
                            <span className="text-muted-foreground text-[13px] font-semibold">{t('question_result.question', 'Savol')}</span>
                            <div className="bg-surface-sunken border-border text-foreground rounded-lg border p-3 text-[14px] leading-relaxed">
                                <SafeHtml html={question} />
                            </div>
                        </div>

                        {/* Audio Player */}
                        <div className="space-y-1.5">
                            {answer?.audio_path ? (
                                <AudioPlayer src={answer.audio_path} />
                            ) : (
                                <div className="bg-surface-sunken border-border text-muted-foreground flex items-center gap-2.5 rounded-[10px] border p-3 text-[14px]">
                                    <VolumeX className="h-4 w-4" aria-hidden="true" />
                                    <span>{t('question_result.no_audio', 'Ovoz yozilmagan')}</span>
                                </div>
                            )}
                        </div>

                        {/* Transcript Box */}
                        {parsed.transcript && (
                            <div className="space-y-1.5">
                                <span className="text-muted-foreground text-[13px] font-semibold">
                                    {t('question_result.transcript', 'Transkript')}
                                </span>
                                <div className="bg-surface-sunken border-border text-foreground rounded-lg border p-3 text-[14px] leading-relaxed select-text">
                                    {parsed.transcript}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: AI Feedback List */}
                    <div className="space-y-2">
                        <span className="text-foreground text-[14px] font-semibold">{t('question_result.ai_feedback', 'AI izohi')}</span>

                        {parsed.status === 'no_speech' ? (
                            <div className="bg-surface-sunken border-border rounded-lg border p-3">
                                <p className="text-muted-foreground text-[14px] leading-relaxed">
                                    {t('question_result.no_speech_text', 'Javob yozilmadi yoki ovoz eshitilmadi.')}
                                </p>
                            </div>
                        ) : parsed.feedbackItems.length > 0 ? (
                            <ul className="space-y-2.5">
                                {parsed.feedbackItems.map((item) => (
                                    <li key={item.key} className="bg-surface-sunken border-border rounded-lg border p-3">
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <span className="text-accent-text text-[13px] font-semibold">{t(item.labelKey, item.key)}</span>
                                            {item.score !== null && (
                                                <span className="font-display text-muted-foreground text-[13px] font-semibold tabular-nums">
                                                    {item.score} / 15
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-foreground text-[14px] leading-relaxed">{item.comment}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : parsed.isAiError ? (
                            <div className="bg-danger-bg border-danger/20 text-danger-text rounded-lg border p-3 text-[14px]">{answer.review_ai}</div>
                        ) : (
                            <div className="bg-surface-sunken border-border text-muted-foreground rounded-lg border p-3 text-[14px]">
                                {t('score_summary.pending', 'Baholanmoqda')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuestionResultRow;
