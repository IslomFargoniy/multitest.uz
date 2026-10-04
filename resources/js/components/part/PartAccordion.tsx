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
                        className={`overflow-hidden rounded-xl border transition-colors ${
                            isOpen
                                ? 'border-border-strong bg-card shadow-sm dark:shadow-none'
                                : 'border-border bg-card/60 hover:bg-card'
                        }`}
                    >
                        {/* Accordion Header */}
                        <button
                            type="button"
                            onClick={() => toggle(index)}
                            className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-hidden cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm font-bold transition-colors ${
                                        isOpen
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-surface-2 text-muted-foreground'
                                    }`}
                                >
                                    {globalIndex < 10 ? `0${globalIndex}` : globalIndex}
                                </div>
                                <div>
                                    <h3
                                        className={`text-base font-bold transition-colors ${
                                            isOpen ? 'text-foreground' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {item.name}
                                    </h3>
                                    {!isOpen && item.description && (
                                        <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                                    )}
                                </div>
                            </div>
                            <ChevronDown
                                className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-foreground' : ''}`}
                            />
                        </button>

                        {/* Accordion Content */}
                        <div
                            className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <div className="space-y-6 px-6 pt-2 pb-6">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Description Block */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                                <AlignLeft className="h-3.5 w-3.5" />
                                                {t('test_show.part_instructions')}
                                            </div>
                                            <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm leading-relaxed text-foreground">
                                                {item.description || t('common.no_description')}
                                            </div>
                                        </div>

                                        {/* Audio Block */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                                <Headphones className="h-3.5 w-3.5" />
                                                {t('test_show.audio_prompt')}
                                            </div>
                                            {item.audio_path ? (
                                                <div className="flex h-12 items-center rounded-lg border border-border bg-surface-2 px-3">
                                                    <audio preload="none" controls className="h-8 w-full">
                                                        <source src={item.audio_path} />
                                                    </audio>
                                                </div>
                                            ) : (
                                                <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                                                    {t('test_show.no_audio_attached')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Question Table Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                                <ListOrdered className="h-3.5 w-3.5" />
                                                {t('test_show.questions_list')}
                                            </div>

                                            {(isAdmin || isTeacher) && (
                                                <div className="flex items-center gap-2">
                                                    <UpdatePartModal part={item} />
                                                    <div className="h-4 w-[1px] bg-border" />
                                                    <DeleteItemModal item={item} onDelete={handleDelete} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="rounded-xl border border-border bg-card overflow-hidden">
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
