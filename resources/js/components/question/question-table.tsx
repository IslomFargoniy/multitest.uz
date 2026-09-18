import DeleteItemModal from '@/components/delete-item-modal';
import CreateQuestionModal from '@/components/question/create-question-modal';
import UpdateQuestionModal from '@/components/question/update-question-modal';
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
        <div className="space-y-6 p-1">
            {/* Header Section */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{t('test_show.questions')}</h2>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {part.questions?.length || 0} {t('common.items_total')}
                        </p>
                    </div>
                </div>
                {(isAdmin || isTeacher) && <CreateQuestionModal part={part} />}
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {part.questions?.map((item, index) => {
                    const globalIndex = index + 1;

                    return (
                        <div
                            key={item.id}
                            className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/30"
                        >
                            <div className="p-6">
                                {/* Top Badge & Index */}
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                        {globalIndex}
                                    </span>
                                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black tracking-widest text-indigo-600 uppercase dark:bg-indigo-900/30 dark:text-indigo-400">
                                        ID: {item.id}
                                    </span>
                                </div>

                                {/* Content Area */}
                                <div
                                    className="prose prose-slate dark:prose-invert prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-img:rounded-2xl prose-strong:text-indigo-600 max-w-none flex-1 text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: item?.textarea }}
                                />

                                {/* Audio Player Section */}
                                {item.audio_path && (
                                    <div className="mt-6 space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            <Headphones className="h-3 w-3" />
                                            {t('test_show.audio_prompt')}
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 p-2 dark:bg-slate-950/50">
                                            <audio preload="none" controls className="h-10 w-full opacity-80 transition-opacity hover:opacity-100">
                                                <source src={item.audio_path} />
                                                {t('error.browser_audio_unsupported')}
                                            </audio>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Meta & Actions Bar */}
                            <div className="mt-auto flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/30">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5" title={t('test_show.preparation_time')}>
                                        <Timer className="h-3.5 w-3.5 text-amber-500" />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.ready_second}s</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title={t('test_show.answering_time')}>
                                        <Timer className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.answer_second}s</span>
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
                <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 py-20 dark:border-slate-800">
                    <MessageSquare className="mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">{t('test_show.no_questions_yet')}</p>
                </div>
            )}
        </div>
    );
};

export default QuestionTable;
