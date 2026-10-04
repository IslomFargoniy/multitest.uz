import AttemptAnswerComponent from '@/components/attempt/AttemptAnswer';
import { Button } from '@/components/ui/button';
import { AttemptPart } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronDown, Info, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PartAccordionProps {
    attempt_parts: AttemptPart[];
    isAdmin?: boolean;
    isTeacher?: boolean;
}

export default function AttemptPartAccordion({ attempt_parts, isAdmin, isTeacher }: PartAccordionProps) {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(0); // Default open first part

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {attempt_parts.map((item: AttemptPart, index: number) => {
                const isOpen = openIndex === index;
                const globalIndex = index + 1;
                const partScore = Number(item?.ai_score_avg ?? 0);
                const totalQuestions = item.attempt_answers?.length || 0;

                return (
                    <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:shadow-none transition-colors"
                    >
                        <button
                            type="button"
                            onClick={() => toggle(index)}
                            className="flex w-full items-center justify-between p-4 sm:p-5 text-left cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-display text-sm font-bold text-accent-text">
                                    {globalIndex.toString().padStart(2, '0')}
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        {item.part?.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {totalQuestions} {t('attempt_details.questions_answered', 'savol')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        {t('attempt_details.part_score', 'Qism bali')}
                                    </p>
                                    <p className="font-display text-lg font-bold text-foreground tabular-nums">
                                        {partScore > 0 ? partScore.toFixed(1) : '—'}
                                    </p>
                                </div>

                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-foreground' : ''}`}>
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </button>

                        {/* Re-evaluate row */}
                        {isOpen && (isAdmin || isTeacher) && (
                            <div className="flex justify-end border-t border-border px-4 py-2.5 bg-surface-sunken">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm(t('common.are_you_sure'))) {
                                            router.post(route('attempt_part.re_evaluate', { attempt_part: item.id }));
                                        }
                                    }}
                                    className="gap-2"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>{t('attempt_details.re_evaluate', 'Qayta baholash')}</span>
                                </Button>
                            </div>
                        )}

                        {/* Accordion Content */}
                        {isOpen && (
                            <div className="border-t border-border p-4 sm:p-6 space-y-4">
                                {item.part?.description && (
                                    <div className="flex gap-3 rounded-lg border border-border bg-surface-sunken p-3.5">
                                        <Info className="h-4 w-4 shrink-0 text-accent-text mt-0.5" />
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            {item.part.description}
                                        </p>
                                    </div>
                                )}

                                <AttemptAnswerComponent attempt_answers={item.attempt_answers ?? []} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
