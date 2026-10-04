import DeleteItemModal from '@/components/delete-item-modal';
import CreateQuestionModal from '@/components/question/create-question-modal';
import UpdateQuestionModal from '@/components/question/update-question-modal';
import SafeHtml from '@/components/safe-html';
import { Auth, Part } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Headphones, MessageSquare, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface QuestionTableProps {
    part: Part;
}

const QuestionTable = ({ part }: QuestionTableProps) => {
    const { t } = useTranslation();
    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role) => role.name === 'Teacher');

    const { delete: deleteQuestion, reset, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        deleteQuestion(route('question.destroy', id), {
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

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-foreground border border-border">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">{t('test_show.questions')}</h2>
                        <p className="text-xs text-muted-foreground">
                            {part.questions?.length || 0} {t('common.items_total')}
                        </p>
                    </div>
                </div>
                {(isAdmin || isTeacher) && <CreateQuestionModal part={part} />}
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {part.questions?.map((item, index) => {
                    const globalIndex = index + 1;

                    return (
                        <div
                            key={item.id}
                            className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:shadow-none transition-colors hover:border-border-strong"
                        >
                            <div className="p-5">
                                {/* Top Badge & Index */}
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-muted-foreground border border-border">
                                        {globalIndex}
                                    </span>
                                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground border border-border">
                                        ID: {item.id}
                                    </span>
                                </div>

                                {/* Content Area */}
                                <SafeHtml
                                    className="max-w-none flex-1 text-sm leading-relaxed text-foreground"
                                    html={item?.textarea}
                                />

                                {/* Audio Player Section */}
                                {item.audio_path && (
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                            <Headphones className="h-3.5 w-3.5" />
                                            {t('test_show.audio_prompt')}
                                        </div>
                                        <div className="rounded-lg bg-surface-2 p-2 border border-border">
                                            <audio preload="none" controls className="h-8 w-full opacity-90 transition-opacity hover:opacity-100">
                                                <source src={item.audio_path} />
                                                {t('error.browser_audio_unsupported')}
                                            </audio>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Meta & Actions Bar */}
                            <div className="mt-auto flex items-center justify-between border-t border-border bg-surface-2 px-5 py-3">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5" title={t('test_show.preparation_time')}>
                                        <Timer className="h-3.5 w-3.5 text-warning" />
                                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{item.ready_second}s</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title={t('test_show.answering_time')}>
                                        <Timer className="h-3.5 w-3.5 text-success" />
                                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{item.answer_second}s</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {(isAdmin || isTeacher) && (
                                    <div className="flex items-center gap-2">
                                        <UpdateQuestionModal question={item} />
                                        <DeleteItemModal item={item} onDelete={handleDelete} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {part.questions?.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
                    <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">{t('test_show.no_questions_yet')}</p>
                </div>
            )}
        </div>
    );
};

export default QuestionTable;
