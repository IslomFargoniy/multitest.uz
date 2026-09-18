import React, { useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import AppLayout from '@/layouts/app-layout';
import AttemptTable from '@/components/attempt/attempt-table';
import PremiumFilters from '@/components/premium-filters';
import { type AttemptPaginate, type BreadcrumbItem, Role, SearchData } from '@/types';

export default function Attempt() {
    const { attempt, roles, auth } = usePage<{
        attempt: AttemptPaginate;
        roles: Role[];
        auth: any;
    }>().props;

    const { t } = useTranslation();
    const isAdmin = auth?.user?.roles?.some((role: any) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role: any) => role.name === 'Teacher');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.attempt') || 'Urinishlar',
            href: route('attempt.index'),
        },
    ];

    const { data, setData } = useForm<SearchData>({
        search: '',
        role: '',
        from: '',
        to: '',
        per_page: attempt.per_page || 10,
        page: attempt.current_page || 1,
        total: attempt.total || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('attempt.index'),
            {
                search: data.search,
                role: data.role,
                from: data.from,
                to: data.to,
                per_page: data.per_page,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setData((prevData) => ({
            ...prevData,
            search: urlParams.get('search') || '',
            role: urlParams.get('role') || '',
            from: urlParams.get('from') || '',
            to: urlParams.get('to') || '',
            per_page: Number(urlParams.get('per_page')) || attempt.per_page,
        }));
    }, [window.location.search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('exam_attempts.title') || 'Imtihon Urinishlari'} />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {t('exam_attempts.title') || 'Imtihon Urinishlari'}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('exam_attempts.subtitle') || "Barcha topshirilgan imtihonlar, baholar va natijalar tahlili"}
                    </p>
                </div>

                {/* Unified Filters */}
                <div className="w-full">
                    <PremiumFilters
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                        isAdmin={isAdmin}
                        isTeacher={isTeacher}
                        roles={roles}
                    />
                </div>

                {/* Results Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                    <AttemptTable {...attempt} searchData={data} />
                </div>
            </div>
        </AppLayout>
    );
}
