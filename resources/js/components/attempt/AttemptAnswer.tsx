import AudioWaveform from '@/components/AudioWaveform';
import SafeHtml from '@/components/safe-html';
import { AttemptAnswer } from '@/types';
import { AlertCircle, BrainCircuit, Clock, FileText, Mic, Sparkles, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuestionTableProps {
    attempt_answers: AttemptAnswer[];
}

const AttemptAnswerComponent = ({ attempt_answers }: QuestionTableProps) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-8">
            {attempt_answers?.map((item, index) => {
                const globalIndex = index + 1;

                return (
                    <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-1 shadow-sm transition-all hover:shadow-xl sm:rounded-[2.5rem] dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="flex flex-col lg:flex-row">
                            {/* 📝 LEFT SIDE: THE QUESTION */}
                            <div className="flex-1 p-3.5 sm:p-6 lg:border-r lg:border-slate-100 dark:lg:border-slate-800">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500 dark:bg-slate-800">
                                            {globalIndex.toString().padStart(2, '0')}
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                            {t('response_card.question_details')}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Badge
                                            icon={<Clock className="h-3 w-3" />}
                                            label={`${item.question?.ready_second}${t('common.seconds_short')}`}
                                            title={t('response_card.preparation_time')}
                                        />
                                        <Badge
                                            icon={<Mic className="h-3 w-3" />}
                                            label={`${item.question?.answer_second}${t('common.seconds_short')}`}
                                            title={t('response_card.speaking_time')}
                                        />
                                    </div>
                                </div>

                                <SafeHtml
                                    className="prose prose-slate dark:prose-invert prose-p:leading-relaxed prose-img:rounded-3xl prose-p:text-slate-700 dark:prose-p:text-slate-300 max-w-none"
                                    html={item.question?.textarea ?? ''}
                                />
                            </div>

                            {/* 🎙️ RIGHT SIDE: THE RESPONSE */}
                            <div className="flex-1 bg-slate-50/30 p-3.5 sm:p-6 dark:bg-slate-900/40">
                                <div className="mb-6 flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-[10px] font-black tracking-widest text-blue-500 uppercase">
                                        <Volume2 className="h-3.5 w-3.5" />
                                        {t('response_card.student_response')}
                                    </span>

                                    {/* AI Score Badge */}
                                    <div className="flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-3 py-1.5 shadow-sm dark:border-purple-900/30 dark:bg-slate-800">
                                        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                                            {t('response_card.ai_score')}: {item.score_ai ?? '0.0'}
                                        </span>
                                    </div>
                                </div>

                                {/* Audio Player */}
                                {item.audio_path ? (
                                    <div className="mb-6">
                                        <AudioWaveform audioUrl={item.audio_path} />
                                    </div>
                                ) : (
                                    <div className="mb-6 flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
                                        <AlertCircle className="h-4 w-4" />
                                        {t('response_card.no_audio')}
                                    </div>
                                )}

                                {/* Transcript & Feedback */}
                                <div className="space-y-5">
                                    {item.transcript && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                <FileText className="h-3 w-3" />
                                                {t('response_card.transcript')}
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm leading-relaxed text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-slate-950/50 dark:text-slate-300">
                                                {item.transcript}
                                            </div>
                                        </div>
                                    )}

                                    {item.review_ai && (
                                        <div className="group/ai relative space-y-2">
                                            <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-purple-500 uppercase">
                                                <BrainCircuit className="h-3 w-3" />
                                                {t('response_card.ai_analysis')}
                                            </div>
                                            <AIReviewHelper review={item.review_ai} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* --- AI Review Helper --- */
function AIReviewHelper({ review }: { review: string }) {
    const { t } = useTranslation();

    try {
        const data = JSON.parse(review);
        if (typeof data !== 'object' || data === null) throw new Error('Not an object');

        const criteria = [
            { key: 'fluency', label: t('response_card.fluency'), icon: '✨' },
            { key: 'vocabulary', label: t('response_card.vocabulary'), icon: '📚' },
            { key: 'grammar', label: t('response_card.grammar'), icon: '🛠️' },
            { key: 'pronunciation', label: t('response_card.pronunciation'), icon: '🗣️' },
            { key: 'interaction', label: t('response_card.interaction'), icon: '🎯' },
        ];

        return (
            <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/20 dark:bg-slate-900">
                {/* Score & Level Header */}
                {(data.score || data.level) && (
                    <div className="flex items-center justify-between border-b border-purple-50 bg-purple-50/30 px-4 py-3 dark:border-purple-900/30 dark:bg-purple-900/20">
                        <div className="flex items-center gap-3">
                            {data.level && <span className="rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-black text-white">{data.level}</span>}
                            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">{t('response_card.estimated_level')}</span>
                        </div>
                        {data.score && <span className="text-lg font-black text-purple-600 dark:text-purple-400">{data.score} / 75</span>}
                    </div>
                )}

                {/* Criteria Details */}
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {criteria.map(
                        (c) =>
                            data[c.key] && (
                                <div key={c.key} className="p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="text-xs">{c.icon}</span>
                                        <span className="text-[10px] leading-tight font-black tracking-wider break-words text-slate-400 uppercase">
                                            {c.label}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{data[c.key]}</p>
                                </div>
                            ),
                    )}
                </div>

                {/* Fallback for general feedback if exists */}
                {data.feedback && (
                    <div className="border-t border-purple-50 bg-slate-50/30 p-4 dark:border-purple-900/30 dark:bg-slate-800/30">
                        <div className="mb-1 text-[10px] font-black tracking-wider text-purple-400 uppercase">
                            {t('response_card.general_feedback')}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600 italic dark:text-slate-300">{data.feedback}</p>
                    </div>
                )}
            </div>
        );
    } catch (e) {
        // Fallback for non-JSON content
        return (
            <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white p-4 text-sm leading-relaxed text-purple-900/80 shadow-sm dark:border-purple-900/20 dark:from-purple-900/10 dark:to-slate-900 dark:text-purple-300">
                <div className="relative z-10 italic">{review}</div>
                <Sparkles className="absolute -right-2 -bottom-2 h-12 w-12 rotate-12 text-purple-500/5" />
            </div>
        );
    }
}

/* --- UI Helper --- */
function Badge({ icon, label, title }: { icon: React.ReactNode; label: string; title?: string }) {
    return (
        <div
            title={title}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
        >
            {icon}
            {label}
        </div>
    );
}

export default AttemptAnswerComponent;
