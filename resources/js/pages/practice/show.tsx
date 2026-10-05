import { AppShell } from '@/components/app-shell';
import QuestionPlayer from '@/components/practice/QuestionPlayer';
import { AttemptPart } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';

export default function PracticeShow() {
    const { attempt_part } = usePage<{ attempt_part: AttemptPart }>().props;
    const { t } = useTranslation();

    return (
        <AppShell>
            <Toaster position="top-center" richColors />
            <Head title={`${attempt_part.part?.name || t('practice_show.part_label')} - CEFR Speaking`} />

            <div className="min-h-dvh bg-background text-foreground">
                <QuestionPlayer key={attempt_part.id} attempt_part={attempt_part} />
            </div>
        </AppShell>
    );
}
