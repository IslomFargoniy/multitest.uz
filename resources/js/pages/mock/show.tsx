import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, CheckCircle2, Clock, Activity, FileText, ArrowLeft, FileSpreadsheet, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import MockStudentManager from '@/components/mock/mock-student-manager';
import AttemptTable from '@/components/attempt/attempt-table';

export default function MockShow() {
    const { mock, isAdmin } = usePage<{
        mock: any;
        isAdmin: boolean;
    }>().props;

    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'students' | 'attempts'>('students');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('mock') || 'Mock Testlar',
            href: route('mock.index'),
        },
        {
            title: mock.name,
            href: '#',
        },
    ];

    const students = mock.students ?? [];
    const attempts = mock.attempts ?? [];
    const totalStudents = students.length;
    const attendedStudents = students.filter((s: any) => s.attended).length;
    const pendingStudents = totalStudents - attendedStudents;
    const isActive = mock.active === 1 || mock.active === true;

    const formatSafeDate = (d?: string | null) => {
        if (!d) return '-';
        try {
            return format(new Date(d), 'dd.MM.yyyy HH:mm');
        } catch {
            return '-';
        }
    };

    const exportToExcel = () => {
        import('xlsx').then((XLSX) => {
            const dataToExport = students.map((st: any, index: number) => {
                const att = st.attempt || attempts.find((a: any) => a.mock_student_id === st.id);
                return {
                    '№': index + 1,
                    [t('mock_exam.student_name') || "O'quvchi Ismi"]: st.name,
                    [t('mock_exam.candidate_code') || 'Nomzod Kodi']: st.code,
                    [t('common.phone') || 'Telefon']: st.phone || '-',
                    [t('mock_exam.attendance') || 'Davomat']: st.attended ? (t('attended') || 'Qatnashdi') : (t('pending') || 'Kutilmoqda'),
                    [t('overall_score') || 'Umumiy Ball']: att?.score != null ? att.score : (att?.ai_score_avg != null ? Number(att.ai_score_avg).toFixed(2) : '-'),
                    [t('tab_switches') || 'Tab Almashtirish (Buzilish)']: att?.tab_switch_count ?? 0,
                    [t('status') || 'Imtihon Holati']: att?.finished_at ? (t('finished') || 'Yakunlangan') : (att?.started_at ? (t('in_progress') || 'Jarayonda') : (t('not_started') || 'Boshlanmagan')),
                    [t('started_at') || 'Boshlangan Vaqt']: att?.started_at ? formatSafeDate(att.started_at) : '-',
                    [t('finished_at') || 'Tugagan Vaqt']: att?.finished_at ? formatSafeDate(att.finished_at) : '-',
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, t('mock_exam.results') || 'Natijalar');

            XLSX.writeFile(workbook, `Mock_${mock.name.replace(/\s+/g, '_')}_${t('mock_exam.results') || 'Natijalari'}.xlsx`);
            toast.success(t('excel_export_success') || "Excel fayl muvaffaqiyatli yuklab olindi!");
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mock.name} />

            <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Top Navigation & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('mock.index')}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                    {mock.name}
                                </h1>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        isActive
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {isActive ? `● ${t('active') || 'Faol'}` : `○ ${t('inactive') || 'Nofaol'}`}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                                <span>{mock.test?.name || t('mock_exam.no_test_selected') || 'Test tanlanmagan'}</span>
                                {mock.user && (
                                    <>
                                        <span>•</span>
                                        <span>{t('teacher') || "O'qituvchi"}: {mock.user.name}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={exportToExcel}
                            variant="outline"
                            className="flex items-center gap-1.5 rounded-xl border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-xs cursor-pointer"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            {t('mock_exam.export_excel') || 'Excelga Yuklash'}
                        </Button>

                        <MockStudentManager
                            mockId={mock.id}
                            mockName={mock.name}
                            students={students}
                        />
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('mock_exam.total_students') || "Jami O'quvchilar"}
                            </p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                                {totalStudents} {t('common.count_suffix') || 'ta'}
                            </h3>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('mock_exam.attended_students') || 'Qatnashganlar'}
                            </p>
                            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {attendedStudents} {t('common.count_suffix') || 'ta'}
                            </h3>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('mock_exam.pending_students') || 'Kutilayotganlar'}
                            </p>
                            <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                                {pendingStudents} {t('common.count_suffix') || 'ta'}
                            </h3>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('mock_exam.time_range') || 'Vaqt Oralig\'i'}
                            </p>
                            <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                                {formatSafeDate(mock.started_at || mock.starts_at)} - {formatSafeDate(mock.finished_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-5 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'students'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>{t('mock_exam.students_and_codes') || "Mock O'quvchilari va Kodlar"} ({totalStudents})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('attempts')}
                        className={`px-5 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'attempts'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>{t('mock_exam.attempts_results') || "Imtihon Urinishlari Natijalari"} ({attempts.length})</span>
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'students' && (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                {t('mock_exam.students_list') || "O'quvchilar Ro'yxati va Kodlar (MSXXXXXX)"}
                            </h3>
                            <MockStudentManager
                                mockId={mock.id}
                                mockName={mock.name}
                                students={students}
                            />
                        </div>

                        {students.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-400 space-y-3">
                                <Users className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
                                <p>{t('mock_exam.no_students_yet') || "Hali o'quvchilar biriktirilmagan."}</p>
                                <p className="text-[11px]">{t('mock_exam.add_students_hint') || "\"O'quvchilar\" tugmasini bosib, yangi nomzodlarni qo'shing."}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px]">
                                        <tr>
                                            <th className="px-4 py-3">#</th>
                                            <th className="px-4 py-3">{t('mock_exam.student_name') || "O'quvchi Ismi"}</th>
                                            <th className="px-4 py-3">{t('mock_exam.candidate_code') || "Nomzod Kodi (MSXXXXXX)"}</th>
                                            <th className="px-4 py-3 text-center">{t('mock_exam.attendance') || "Davomat"}</th>
                                            <th className="px-4 py-3 text-right">{t('mock_exam.attempt') || "Urinish"}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                        {students.map((st: any, idx: number) => (
                                            <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                                <td className="px-4 py-3 font-mono text-gray-400">{idx + 1}</td>
                                                <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{st.name}</td>
                                                <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40">
                                                        {st.code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            st.attended
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                        }`}
                                                    >
                                                        {st.attended ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {st.attended ? (t('attended') || 'Qatnashdi') : (t('pending') || 'Kutilmoqda')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {st.attempt ? (
                                                        <Link
                                                            href={route('attempt.show', st.attempt.id)}
                                                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                                                        >
                                                            {t('mock_exam.view_result') || "Natijani Ko'rish →"}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400 italic">{t('not_started') || 'Boshlanmagan'}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'attempts' && (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
                        <AttemptTable
                            data={attempts}
                            search=""
                            current_page={1}
                            last_page={1}
                            per_page={100}
                            total={attempts.length}
                            from={1}
                            to={attempts.length}
                            links={[]}
                            searchData={{ search: '', user_id: '', mock_id: '', test_id: '', from: '', to: '', per_page: 100, page: 1, total: attempts.length }}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
