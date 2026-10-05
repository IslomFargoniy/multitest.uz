import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, CheckCircle2, Clock, FileText, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
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
            title: t('mock', 'Mock Testlar'),
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
        return formatDateTime(d);
    };

    const exportToExcel = () => {
        import('xlsx').then((XLSX) => {
            const dataToExport = students.map((st: any, index: number) => {
                const att = st.attempt || attempts.find((a: any) => a.mock_student_id === st.id);
                return {
                    '№': index + 1,
                    [t('mock_exam.student_name', "O'quvchi Ismi")]: st.name,
                    [t('mock_exam.candidate_code', 'Nomzod Kodi')]: st.code,
                    [t('common.phone', 'Telefon')]: st.phone || '-',
                    [t('mock_exam.attendance', 'Davomat')]: st.attended ? (t('attended', 'Qatnashdi')) : (t('pending', 'Kutilmoqda')),
                    [t('overall_score', 'Umumiy Ball')]: att?.score != null ? att.score : (att?.ai_score_avg != null ? Number(att.ai_score_avg).toFixed(2) : '-'),
                    [t('tab_switches', 'Tab Almashtirish (Buzilish)')]: att?.tab_switch_count ?? 0,
                    [t('status', 'Imtihon Holati')]: att?.finished_at ? (t('finished', 'Yakunlangan')) : (att?.started_at ? (t('in_progress', 'Jarayonda')) : (t('not_started', 'Boshlanmagan'))),
                    [t('started_at', 'Boshlangan Vaqt')]: att?.started_at ? formatSafeDate(att.started_at) : '-',
                    [t('finished_at', 'Tugagan Vaqt')]: att?.finished_at ? formatSafeDate(att.finished_at) : '-',
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, t('mock_exam.results', 'Natijalar'));

            XLSX.writeFile(workbook, `Mock_${mock.name.replace(/\s+/g, '_')}_${t('mock_exam.results', 'Natijalari')}.xlsx`);
            toast.success(t('excel_export_success', "Excel fayl muvaffaqiyatli yuklab olindi!"));
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mock.name} />

            <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                {/* Top Navigation & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('mock.index')}
                            className="p-2 rounded-lg bg-surface-2 border border-border text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-foreground">
                                    {mock.name}
                                </h1>
                                <span
                                    className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                                        isActive
                                            ? 'bg-success/10 text-success border-success/20'
                                            : 'bg-secondary text-muted-foreground border-border'
                                    }`}
                                >
                                    {isActive ? `● ${t('active', 'Faol')}` : `○ ${t('inactive', 'Nofaol')}`}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <span>{mock.test?.name || t('mock_exam.no_test_selected', 'Test tanlanmagan')}</span>
                                {mock.user && (
                                    <>
                                        <span>•</span>
                                        <span>{t('teacher', "O'qituvchi")}: {mock.user.name}</span>
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
                            size="sm"
                            className="flex items-center gap-1.5 font-semibold text-xs"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-success" />
                            {t('mock_exam.export_excel', 'Excelga Yuklash')}
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
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm dark:shadow-none flex items-center gap-3.5">
                        <div className="p-2.5 rounded-lg bg-surface-2 text-foreground border border-border">
                            <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground">
                                {t('mock_exam.total_students', "Jami O'quvchilar")}
                            </p>
                            <h3 className="font-display text-xl font-bold tabular-nums text-foreground mt-0.5">
                                {totalStudents} {t('common.count_suffix', 'ta')}
                            </h3>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm dark:shadow-none flex items-center gap-3.5">
                        <div className="p-2.5 rounded-lg bg-surface-2 text-foreground border border-border">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground">
                                {t('mock_exam.attended_students', 'Qatnashganlar')}
                            </p>
                            <h3 className="font-display text-xl font-bold tabular-nums text-success mt-0.5">
                                {attendedStudents} {t('common.count_suffix', 'ta')}
                            </h3>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm dark:shadow-none flex items-center gap-3.5">
                        <div className="p-2.5 rounded-lg bg-surface-2 text-foreground border border-border">
                            <Clock className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground">
                                {t('mock_exam.pending_students', 'Kutilayotganlar')}
                            </p>
                            <h3 className="font-display text-xl font-bold tabular-nums text-warning mt-0.5">
                                {pendingStudents} {t('common.count_suffix', 'ta')}
                            </h3>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm dark:shadow-none flex items-center gap-3.5">
                        <div className="p-2.5 rounded-lg bg-surface-2 text-foreground border border-border">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground">
                                {t('mock_exam.time_range', 'Vaqt Oralig\'i')}
                            </p>
                            <p className="font-mono text-xs font-medium text-foreground mt-0.5 tabular-nums">
                                {formatSafeDate(mock.started_at)} - {formatSafeDate(mock.finished_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-border">
                    <button
                        type="button"
                        onClick={() => setActiveTab('students')}
                        className={`px-5 py-3 font-semibold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                            activeTab === 'students'
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>{t('mock_exam.students_and_codes', "Mock O'quvchilari va Kodlar")} ({totalStudents})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('attempts')}
                        className={`px-5 py-3 font-semibold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                            activeTab === 'attempts'
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>{t('mock_exam.attempts_results', "Imtihon Urinishlari Natijalari")} ({attempts.length})</span>
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'students' && (
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-foreground">
                                {t('mock_exam.students_list', "O'quvchilar Ro'yxati va Kodlar (MSXXXXXXXX)")}
                            </h3>
                            <MockStudentManager
                                mockId={mock.id}
                                mockName={mock.name}
                                students={students}
                            />
                        </div>

                        {students.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-border rounded-lg text-xs text-muted-foreground space-y-2">
                                <Users className="w-8 h-8 mx-auto text-muted-foreground" />
                                <p>{t('mock_exam.no_students_yet', "Hali o'quvchilar biriktirilmagan.")}</p>
                                <p className="text-xs text-muted-foreground">{t('mock_exam.add_students_hint', "\"O'quvchilar\" tugmasini bosib, yangi nomzodlarni qo'shing.")}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-surface-2 text-muted-foreground font-semibold text-xs">
                                        <tr>
                                            <th className="px-4 py-3">#</th>
                                            <th className="px-4 py-3">{t('mock_exam.student_name', "O'quvchi Ismi")}</th>
                                            <th className="px-4 py-3">{t('mock_exam.candidate_code', "Nomzod Kodi (MSXXXXXXXX)")}</th>
                                            <th className="px-4 py-3 text-center">{t('mock_exam.attendance', "Davomat")}</th>
                                            <th className="px-4 py-3 text-right">{t('mock_exam.attempt', "Urinish")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-card">
                                        {students.map((st: any, idx: number) => (
                                            <tr key={st.id} className="hover:bg-surface-2/60 transition-colors">
                                                <td className="px-4 py-3 font-mono text-muted-foreground">{idx + 1}</td>
                                                <td className="px-4 py-3 font-semibold text-foreground">{st.name}</td>
                                                <td className="px-4 py-3 font-mono font-semibold text-primary">
                                                    <span className="px-2 py-0.5 rounded border border-border bg-surface-2">
                                                        {st.code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                                                            st.attended
                                                                ? 'bg-success/10 text-success border border-success/20'
                                                                : 'bg-warning/10 text-warning border border-warning/20'
                                                        }`}
                                                    >
                                                        {st.attended ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {st.attended ? (t('attended', 'Qatnashdi')) : (t('pending', 'Kutilmoqda'))}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {st.attempt ? (
                                                        <Link
                                                            href={route('attempt.show', st.attempt.id)}
                                                            className="text-primary hover:underline font-semibold"
                                                        >
                                                            {t('mock_exam.view_result', "Natijani Ko'rish →")}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">{t('not_started', 'Boshlanmagan')}</span>
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
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:shadow-none">
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
