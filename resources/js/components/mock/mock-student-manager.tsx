import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Users, Plus, Copy, Check, Trash2, Printer, CheckCircle2, Clock, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface MockStudentItem {
    id: number;
    name: string;
    code: string;
    attended: boolean;
    phone?: string | null;
    attempt?: any;
}

interface MockStudentManagerProps {
    mockId: number;
    mockName: string;
    students?: MockStudentItem[];
}

export default function MockStudentManager({ mockId, mockName, students = [] }: MockStudentManagerProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        mock_id: mockId,
        names: '',
        phone: '',
    });

    const handleAddStudents = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('mock-student.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('names', 'phone');
                toast.success(t('mock_students.added_success') || "O'quvchilar ro'yxatga qo'shildi!");
            },
            onError: (err: any) => {
                toast.error(err?.names || t('error.create_failed') || "Xatolik yuz berdi");
            },
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm(t('common.are_you_sure') || "Haqiqatan ham bu nomzodni o'chirmoqchimisiz?")) return;
        router.delete(route('mock-student.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success(t('mock_students.deleted_success') || "O'quvchi o'chirildi!"),
            onError: () => toast.error(t('error.delete_failed') || "O'chirishda xatolik yuz berdi"),
        });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`${t('common.copied') || 'Nusxalandi'}: ${code}`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handlePrintPasses = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const passesHtml = students
            .map(
                (st) => `
                <div class="pass-card">
                    <div class="pass-header">
                        <div class="brand">MULTITEST</div>
                        <div class="type">EXAM PASS</div>
                    </div>
                    <div class="test-name">${mockName}</div>
                    <div class="student-name">${st.name}</div>
                    <div class="code-box">
                        <span class="code-label">${t('mock_exam.candidate_code_label') || 'NOMZOD KODI'}:</span>
                        <span class="code-value">${st.code}</span>
                    </div>
                    <div class="pass-footer">
                        <span>https://multitest.uz</span>
                        <span>MultiTest Assessment</span>
                    </div>
                </div>
            `,
            )
            .join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${mockName} - ${t('print_passes') || 'Exam Passes'}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #111827; }
                    .passes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                    .pass-card { border: 2px dashed #4F46E5; border-radius: 12px; padding: 18px; page-break-inside: avoid; background: #fafafa; }
                    .pass-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 10px; }
                    .brand { font-size: 14px; font-weight: 900; color: #4F46E5; letter-spacing: 1px; }
                    .type { font-size: 10px; font-weight: 700; background: #EEF2FF; color: #4338CA; padding: 2px 8px; border-radius: 6px; }
                    .test-name { font-size: 13px; font-weight: 700; color: #4B5563; margin-bottom: 4px; }
                    .student-name { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 12px; }
                    .code-box { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
                    .code-label { font-size: 11px; font-weight: 700; color: #4B5563; }
                    .code-value { font-family: monospace; font-size: 18px; font-weight: 900; color: #4338CA; letter-spacing: 2px; }
                    .pass-footer { display: flex; justify-content: space-between; font-size: 9px; color: #9CA3AF; margin-top: 10px; padding-top: 6px; border-top: 1px solid #f3f4f6; }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="passes-grid">${passesHtml}</div>
                <script>
                    window.onload = function() {
                        window.focus();
                        window.print();
                    };
                    window.onafterprint = function() {
                        window.close();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleExportExcel = () => {
        import('xlsx').then((XLSX) => {
            const dataToExport = students.map((st: any, index: number) => {
                const att = st.attempt;
                return {
                    '№': index + 1,
                    [t('mock_exam.student_name') || "O'quvchi Ismi"]: st.name,
                    [t('mock_exam.candidate_code') || 'Nomzod Kodi']: st.code,
                    [t('common.phone') || 'Telefon']: st.phone || '-',
                    [t('mock_exam.attendance') || 'Davomat']: st.attended ? (t('attended') || 'Qatnashdi') : (t('pending') || 'Kutilmoqda'),
                    [t('overall_score') || 'Umumiy Ball']: att?.score != null ? att.score : (att?.ai_score_avg != null ? Number(att.ai_score_avg).toFixed(2) : '-'),
                    [t('tab_switches') || 'Tab Almashtirish']: att?.tab_switch_count ?? 0,
                    [t('status') || 'Holati']: att?.finished_at ? (t('finished') || 'Yakunlangan') : (att?.started_at ? (t('in_progress') || 'Jarayonda') : (t('not_started') || 'Boshlanmagan')),
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, t('mock_exam.candidates') || 'Nomzodlar');
            XLSX.writeFile(workbook, `Mock_${mockName.replace(/\s+/g, '_')}_Nomzodlar.xlsx`);
            toast.success(t('excel_export_success') || "Excel fayl yuklab olindi!");
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 rounded-xl transition-all shadow-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                >
                    <Users className="w-3.5 h-3.5" />
                    <span>{t('students') || "O'quvchilar"} ({students.length})</span>
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl w-full p-0 overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col max-h-[88vh]">
                {/* Header */}
                <DialogHeader className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            {t('mock_students.management') || "Mock O'quvchilari Boshqaruvi"}
                        </DialogTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('test') || 'Test'}: <span className="font-semibold text-gray-800 dark:text-gray-200">{mockName}</span>
                        </p>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-5 overflow-y-auto flex-1">
                    {/* Add Students Form */}
                    <form onSubmit={handleAddStudents} className="space-y-3 bg-gray-50/80 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                        <Label htmlFor="names-input" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t('mock_students.add_names_label') || "Yangi O'quvchilar Ismlarini Qo'shish (Har bir ismni yangi qatorga yozing)"}
                        </Label>
                        <textarea
                            id="names-input"
                            rows={3}
                            placeholder={t('mock_students.placeholder') || "Masalan:\nAnvar Karimov\nMalika Aliyeva\nSardor Qodirov"}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-white"
                            value={data.names}
                            onChange={(e) => setData('names', e.target.value)}
                            required
                        />

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                {t('mock_students.code_generation_note') || "* Tizim har biriga avtomatik MSXXXXXX formatida kod generatsiya qiladi."}
                            </span>
                            <Button
                                type="submit"
                                disabled={processing || !data.names.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                {t('common.add') || "Qo'shish"}
                            </Button>
                        </div>
                    </form>

                    {/* Students List Toolbar */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                            {t('mock_students.registered_students') || "Ro'yxatga Olinganlar"} ({students.length})
                        </h4>
                        {students.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleExportExcel}
                                    className="rounded-xl text-xs font-semibold flex items-center gap-1.5 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                    {t('excel') || 'Excel'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrintPasses}
                                    className="rounded-xl text-xs font-semibold flex items-center gap-1.5 border-gray-200 dark:border-gray-700 cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5 text-indigo-500" />
                                    {t('print_passes') || "Chop Etish"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    {students.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-400">
                            {t('mock_students.no_students_yet') || "Hali o'quvchilar qo'shilmagan. Yuqoridagi maydonga ismlarni kiriting."}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px]">
                                    <tr>
                                        <th className="px-3.5 py-2.5">{t('mock_exam.student_name') || "O'quvchi Ismi"}</th>
                                        <th className="px-3.5 py-2.5">{t('mock_exam.candidate_code') || "Nomzod Kodi (MSXXXXXX)"}</th>
                                        <th className="px-3.5 py-2.5 text-center">{t('mock_exam.attendance') || "Davomat"}</th>
                                        <th className="px-3.5 py-2.5 text-right">{t('common.actions') || "Amal"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-gray-900">
                                    {students.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                            <td className="px-3.5 py-2.5 font-bold text-gray-900 dark:text-gray-100">
                                                {item.name}
                                            </td>
                                            <td className="px-3.5 py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40">
                                                    <span>{item.code}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyCode(item.code)}
                                                        className="hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors cursor-pointer"
                                                        title={t('common.copy') || "Nusxalash"}
                                                    >
                                                        {copiedCode === item.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    item.attended
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                }`}>
                                                    {item.attended ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {item.attended ? (t('attended') || 'Qatnashdi') : (t('pending') || 'Kutilmoqda')}
                                                </span>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                                    title={t('delete') || "O'chirish"}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="rounded-xl text-xs font-semibold cursor-pointer">
                            {t('common.close') || 'Yopish'}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
