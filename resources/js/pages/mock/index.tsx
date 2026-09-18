import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem, type MockPaginate, SearchData, Test, User } from '@/types';
import MockTable from '@/components/mock/mock-table';
import FindMockModal from '@/components/mock/find-mock-modal';
import CreateMockModal from '@/components/mock/create-mock-modal';
import PremiumFilters from '@/components/premium-filters';
import { useTranslation } from 'react-i18next';

export default function Mock() {
    const { mock, tests = [], users = [], teachers = [], filters, isAdmin, auth } = usePage<{
        mock: MockPaginate;
        tests: Test[];
        users: User[];
        teachers?: User[];
        filters: any;
        isAdmin: boolean;
        auth?: any;
    }>().props;

    const isTeacher = auth?.user?.roles?.some((role: any) => role.name === 'Teacher');
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('mock') || 'Mock Testlar',
            href: '/dashboard',
        },
    ];

    const { data, setData } = useForm<SearchData>({
        search: filters?.search || '',
        teacher_id: filters?.teacher_id || '',
        user_id: filters?.user_id || '',
        test_id: filters?.test_id || '',
        from: filters?.from || '',
        to: filters?.to || '',
        per_page: filters?.per_page || mock.per_page,
        page: mock.current_page,
        total: mock.total,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('mock.index'), data);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('mock') || 'Mock Testlar'} />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 max-w-7xl mx-auto w-full">
                {/* Header with Title and Find Mock Modal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            {t('mock') || 'Mock Testlar'}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('mock_exam.subtitle') || "Mock imtihonlarni tashkil qilish, o'quvchilarga kod berish va natijalarni nazorat qilish"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <FindMockModal />
                        {(isAdmin || isTeacher) && (
                            <CreateMockModal tests={tests} />
                        )}
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="w-full">
                    <PremiumFilters
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                        isAdmin={isAdmin}
                        users={users}
                        teachers={teachers}
                        tests={tests}
                    />
                </div>

                {/* Cards / Table */}
                <div className="mt-2">
                    <MockTable
                        {...mock}
                        searchData={data}
                        tests={tests}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
