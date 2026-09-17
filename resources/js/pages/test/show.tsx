import MobileSearchModal from '@/components/MobileSearchModal';
import CreatePartModal from '@/components/part/create-part-modal';
import PartAccordion from '@/components/part/PartAccordion';
import SearchForm from '@/components/search-form';
import AppLayout from '@/layouts/app-layout';
import { Auth, type BreadcrumbItem, SearchData, Test } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { BookOpen, ChevronLeft, LayoutGrid } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function TestShow() {
    const { test } = usePage<{ test: Test }>().props;
    const { t } = useTranslation();
    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role) => role.name === 'Teacher');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('nav.tests'),
            href: '/test',
        },
        {
            title: test.name,
            href: '#',
        },
    ];

    const { data, setData } = useForm<SearchData>({
        search: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('test.show', test.id), data);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get('search') || '';
        setData('search', searchQuery);
    }, [location.search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${test.name} | ${t('nav.test_details')}`} />

            <div className="animate-in fade-in mx-auto flex w-full max-w-7xl flex-col gap-4 p-2 duration-500 sm:gap-6 sm:p-4 lg:p-6">
                {/* 🧭 NAVIGATION & ACTIONS HEADER */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                        <Link
                            href="/test"
                            className="group inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            {t('common.back_to_library') || 'Testlar ro\'yxatiga qaytish'}
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:shadow-none">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl lg:text-3xl dark:text-white">
                                {test.name}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <MobileSearchModal data={data} setData={setData} handleSubmit={handleSubmit} />
                        <div className="hidden w-72 lg:block">
                            <SearchForm handleSubmit={handleSubmit} setData={setData} data={data} />
                        </div>
                    </div>
                </div>

                {/* 📂 CONTENT SECTION */}
                <div className="relative rounded-2xl border border-slate-200/80 bg-white/70 p-3.5 shadow-xs backdrop-blur-xs sm:p-6 dark:border-slate-800/80 dark:bg-slate-900/60">
                    <div className="mb-4 flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:mb-6 sm:flex-row sm:items-center sm:pb-5 dark:border-slate-800">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 sm:text-xl dark:text-slate-100">
                                <LayoutGrid className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                {t('test_table.test_sections')}
                            </h2>
                            <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                                {t('test_table.manage_parts_description')}
                            </p>
                        </div>

                        {(isAdmin || isTeacher) && (
                            <div className="shrink-0">
                                <CreatePartModal test={test} />
                            </div>
                        )}
                    </div>

                    <div className="min-h-[350px]">
                        <PartAccordion test={test} isAdmin={isAdmin} isTeacher={isTeacher} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

