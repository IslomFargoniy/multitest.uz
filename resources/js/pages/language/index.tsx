import React, { useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import AppLayout from '@/layouts/app-layout';
import CreateTestModal from '@/components/test/create-test-modal';
import TestTable from '@/components/test/test-table';
import PremiumFilters from '@/components/premium-filters';
import { type BreadcrumbItem, type TestPaginate, Language, SearchData, Auth } from '@/types';

export default function LanguageShow() {
    const { test, language, auth } = usePage<{
        test: TestPaginate;
        language: Language;
        auth?: Auth;
    }>().props;

    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role) => role.name === 'Teacher');
    const { t, i18n } = useTranslation();

    const langName =
        i18n.language === 'uz'
            ? language?.name_uz
            : i18n.language === 'ru'
              ? language?.name_ru
              : language?.name_en || 'Language';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.test', 'Testlar'),
            href: '/test',
        },
        {
            title: langName || 'Language',
            href: route('language.show', language.id),
        },
    ];

    const { data, setData } = useForm<SearchData>({
        search: '',
        from: '',
        to: '',
        per_page: test.per_page || 25,
        page: test.current_page || 1,
        total: test.total || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('language.show', language.id), data);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        setData((prevData) => ({
            ...prevData,
            search: urlParams.get('search') || '',
            from: urlParams.get('from') || '',
            to: urlParams.get('to') || '',
            per_page: Number(urlParams.get('per_page')) || test.per_page,
        }));
    }, [location.search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${langName || 'Language'} - ${t('nav.tests', 'Testlar')}`} />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 max-w-7xl mx-auto w-full">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            {language?.flag && <span className="text-2xl sm:text-3xl">{language.flag}</span>}
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                {langName} {t('nav.tests', 'Testlari')}
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('tests_description', "Mavjud barcha CEFR va IELTS Speaking testlari ro'yxati")}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {(isAdmin || isTeacher) && (
                            <CreateTestModal defaultLanguageId={language?.id} />
                        )}
                    </div>
                </div>

                {/* Unified Filters */}
                <div className="w-full">
                    <PremiumFilters
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                        isAdmin={isAdmin}
                        isTeacher={isTeacher}
                    />
                </div>

                {/* Cards Container */}
                <div className="w-full mt-2">
                    <TestTable {...test} searchData={data} />
                </div>
            </div>
        </AppLayout>
    );
}
