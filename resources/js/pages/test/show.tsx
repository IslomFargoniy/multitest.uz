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

            <div className="flex flex-col gap-4 rounded-xl p-4 lg:gap-6 lg:p-6 max-w-7xl mx-auto w-full">
                {/* NAVIGATION & ACTIONS HEADER */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between sm:gap-6">
                    <div className="space-y-2">
                        <Link
                            href="/test"
                            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:underline"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            {t('common.back_to_library')}
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-surface-2 p-2 text-foreground border border-border">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{test.name}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <MobileSearchModal data={data} setData={setData} handleSubmit={handleSubmit} />
                        <div className="hidden w-72 lg:block">
                            <SearchForm handleSubmit={handleSubmit} setData={setData} data={data} />
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                <div className="relative rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm dark:shadow-none">
                    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:pb-6">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                                <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                                {t('test_table.test_sections')}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">{t('test_table.manage_parts_description')}</p>
                        </div>

                        {(isAdmin || isTeacher) && (
                            <div className="shrink-0">
                                <CreatePartModal test={test} />
                            </div>
                        )}
                    </div>

                    <div className="min-h-[400px]">
                        <PartAccordion test={test} isAdmin={isAdmin} isTeacher={isTeacher} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
