import DeleteItemModal from '@/components/delete-item-modal';
import UpdatePartModal from '@/components/part/update-part-modal';
import QuestionTable from '@/components/question/question-table';
import { Part, Test } from '@/types';
import { useForm } from '@inertiajs/react';
import { AlignLeft, ChevronDown, Headphones, ListOrdered } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface PartAccordionProps {
    test: Test;
    isAdmin?: boolean;
    isTeacher?: boolean;
}

export default function PartAccordion({ test, isAdmin, isTeacher }: PartAccordionProps) {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const { delete: deletePart, reset, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        deletePart(route('part.destroy', id), {
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
        <div className="space-y-4">
            {test.parts?.map((item: Part, index: number) => {
                const isOpen = openIndex === index;
                const globalIndex = index + 1;

                return (
                    <div
                        key={item.id}
                        className={`overflow-hidden rounded-[1.5rem] border transition-all duration-300 ${
                            isOpen
                                ? 'border-indigo-200 bg-white shadow-xl shadow-indigo-500/5 dark:border-indigo-500/30 dark:bg-slate-900'
                                : 'border-slate-200 bg-slate-50/50 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40'
                        }`}
                    >
                        {/* Accordion Header */}
                        <button
                            type="button"
                            onClick={() => toggle(index)}
                            className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono text-sm font-black transition-colors ${
                                        isOpen
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                            : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    {globalIndex < 10 ? `0${globalIndex}` : globalIndex}
                                </div>
                                <div>
                                    <h3
                                        className={`text-lg font-bold transition-colors ${
                                            isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        {item.name}
                                    </h3>
                                    {!isOpen && item.description && (
                                        <p className="line-clamp-1 text-xs font-medium text-slate-400">{item.description}</p>
                                    )}
                                </div>
                            </div>
                            <ChevronDown
                                className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}
                            />
                        </button>

                        {/* Accordion Content */}
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <div className="space-y-8 px-6 pt-2 pb-8">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Description Block */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                <AlignLeft className="h-3 w-3" />
                                                {t('test_show.part_instructions')}
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800/50 dark:bg-slate-950/40 dark:text-slate-300">
                                                {item.description || t('common.no_description')}
                                            </div>
                                        </div>

                                        {/* Audio Block */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                <Headphones className="h-3 w-3" />
                                                {t('test_show.audio_prompt')}
                                            </div>
                                            {item.audio_path ? (
                                                <div className="flex h-[54px] items-center rounded-2xl border border-indigo-50 bg-indigo-50/30 px-3 dark:border-indigo-900/20 dark:bg-indigo-900/10">
                                                    <audio preload="none" controls className="h-8 w-full invert dark:invert-0">
                                                        <source src={item.audio_path} />
                                                    </audio>
                                                </div>
                                            ) : (
                                                <div className="flex h-[54px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs font-medium text-slate-400 dark:border-slate-800">
                                                    {t('test_show.no_audio_attached')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Question Table Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                <ListOrdered className="h-3 w-3" />
                                                {t('test_show.questions_list')}
                                            </div>

                                            {(isAdmin || isTeacher) && (
                                                <div className="flex items-center gap-2">
                                                    <UpdatePartModal part={item} />
                                                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
                                                    <DeleteItemModal item={item} onDelete={handleDelete} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/20">
                                            <QuestionTable part={item} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
