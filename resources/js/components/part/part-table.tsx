import DeleteItemModal from '@/components/delete-item-modal';
import CreatePartModal from '@/components/part/create-part-modal';
import UpdatePartModal from '@/components/part/update-part-modal';
import { Auth, Test } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface PartTableProps {
    test: Test;
}

const PartTable = ({ test }: PartTableProps) => {
    const { t } = useTranslation();

    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role) => role.name === 'Teacher');

    const { delete: deletePart, reset, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        deletePart(route('part.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                toast.success(t('deleted_successfully'));
            },
            onError: (err) => {
                const errorMessage = err?.error || t('delete_failed');
                toast.error(errorMessage);
            },
        });
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{t('part')}</h2>
                {(isAdmin || isTeacher) && <CreatePartModal test={test} />}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {test.parts?.map((item, index) => {
                    const globalIndex = index + 1;

                    return (
                        <div
                            key={item.id}
                            className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition hover:border-border-strong"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <h3 className="text-base font-bold text-foreground hover:text-primary">
                                    <Link href={`/part/${item.id}`}>{item.name}</Link>
                                </h3>
                                <span className="text-xs text-muted-foreground font-mono">#{globalIndex}</span>
                            </div>

                            {/* Comment */}
                            <p className="mt-2 text-sm text-muted-foreground">{item.description || t('no_description')}</p>

                            <div>
                                <audio preload="none" controls className="mt-4 w-full">
                                    <source src={item.audio_path} />
                                    {t('your_browser_does_not_support_audio')}
                                </audio>
                            </div>

                            {/* Actions */}
                            {(isAdmin || isTeacher) && (
                                <div className="mt-4 flex gap-2">
                                    <UpdatePartModal part={item} />
                                    <DeleteItemModal item={item} onDelete={handleDelete} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PartTable;
