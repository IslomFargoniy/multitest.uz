import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import AppearanceTabs from '@/components/appearance-tabs';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    const { t } = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('appearance.title', 'Ilova ko\'rinishi')} />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-border pb-3">
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                            {t('appearance.heading', 'Ilova ko\'rinishi')}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {t('appearance.description', 'Ilovaning yorug\' yoki qorong\'u mavzusini o\'zingizga moslang')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-xs font-semibold text-foreground">
                            {t('select_theme', 'Mavzuni tanlang:')}
                        </div>
                        <AppearanceTabs className="w-full sm:w-auto p-1.5 rounded-xl bg-secondary border border-border" />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
