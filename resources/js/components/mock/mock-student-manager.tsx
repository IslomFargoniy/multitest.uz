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
                toast.success(t('mock_students.added_success', "O'quvchilar ro'yxatga qo'shildi!"));
            },
            onError: (err: any) => {
                toast.error(err?.names || t('error.create_failed', "Xatolik yuz berdi"));
            },
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm(t('common.are_you_sure', "Haqiqatan ham bu nomzodni o'chirmoqchimisiz?"))) return;
        router.delete(route('mock-student.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success(t('mock_students.deleted_success', "O'quvchi o'chirildi!")),
            onError: () => toast.error(t('error.delete_failed', "O'chirishda xatolik yuz berdi")),
        });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`${t('common.copied', 'Nusxalandi')}: ${code}`);
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
                        <span class="code-label">${t('mock_exam.candidate_code_label', 'NOMZOD KODI')}:</span>
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
                <title>${mockName} - ${t('print_passes', 'Exam Passes')}</title>
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
                    [t('mock_exam.student_name', "O'quvchi Ismi")]: st.name,
                    [t('mock_exam.candidate_code', 'Nomzod Kodi')]: st.code,
                    [t('common.phone', 'Telefon')]: st.phone || '-',
                    [t('mock_exam.attendance', 'Davomat')]: st.attended ? (t('attended', 'Qatnashdi')) : (t('pending', 'Kutilmoqda')),
                    [t('overall_score', 'Umumiy Ball')]: att?.score != null ? att.score : (att?.ai_score_avg != null ? Number(att.ai_score_avg).toFixed(2) : '-'),
                    [t('tab_switches', 'Tab Almashtirish')]: att?.tab_switch_count ?? 0,
                    [t('status', 'Holati')]: att?.finished_at ? (t('finished', 'Yakunlangan')) : (att?.started_at ? (t('in_progress', 'Jarayonda')) : (t('not_started', 'Boshlanmagan'))),
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, t('mock_exam.candidates', 'Nomzodlar'));
            XLSX.writeFile(workbook, `Mock_${mockName.replace(/\s+/g, '_')}_Nomzodlar.xlsx`);
            toast.success(t('excel_export_success', "Excel fayl yuklab olindi!"));
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-surface-2 hover:bg-secondary rounded-lg transition-colors border border-border cursor-pointer"
                >
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{t('students', "O'quvchilar")} ({students.length})</span>
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl w-full p-0 overflow-hidden rounded-xl bg-card border border-border shadow-lg flex flex-col max-h-[88vh]">
                {/* Header */}
                <DialogHeader className="p-5 border-b border-border bg-surface-2 flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            {t('mock_students.management', "Mock O'quvchilari Boshqaruvi")}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {t('test', 'Test')}: <span className="font-semibold text-foreground">{mockName}</span>
                        </p>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-5 overflow-y-auto flex-1">
                    {/* Add Students Form */}
                    <form onSubmit={handleAddStudents} className="space-y-3 bg-surface-2 p-4 rounded-lg border border-border">
                        <Label htmlFor="names-input" className="text-xs font-semibold text-foreground">
                            {t('mock_students.add_names_label', "Yangi O'quvchilar Ismlarini Qo'shish (Har bir ismni yangi qatorga yozing)")}
                        </Label>
                        <textarea
                            id="names-input"
                            rows={3}
                            placeholder={t('mock_students.placeholder', "Masalan:\nAnvar Karimov\nMalika Aliyeva\nSardor Qodirov")}
                            className="w-full rounded-lg border border-border bg-card p-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                            value={data.names}
                            onChange={(e) => setData('names', e.target.value)}
                            required
                        />

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-muted-foreground">
                                {t('mock_students.code_generation_note', "* Tizim har biriga avtomatik MSXXXXXXXX formatida kod generatsiya qiladi.")}
                            </span>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing || !data.names.trim()}
                                className="font-semibold text-xs"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                {t('common.add', "Qo'shish")}
                            </Button>
                        </div>
                    </form>

                    {/* Students List Toolbar */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-muted-foreground">
                            {t('mock_students.registered_students', "Ro'yxatga Olinganlar")} ({students.length})
                        </h4>
                        {students.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportExcel}
                                    className="text-xs font-semibold flex items-center gap-1.5"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-success" />
                                    {t('excel', 'Excel')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrintPasses}
                                    className="text-xs font-semibold flex items-center gap-1.5"
                                >
                                    <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                                    {t('print_passes', "Chop Etish")}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    {students.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
                            {t('mock_students.no_students_yet', "Hali o'quvchilar qo'shilmagan. Yuqoridagi maydonga ismlarni kiriting.")}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-surface-2 text-muted-foreground font-semibold text-xs">
                                    <tr>
                                        <th className="px-3.5 py-2.5">{t('mock_exam.student_name', "O'quvchi Ismi")}</th>
                                        <th className="px-3.5 py-2.5">{t('mock_exam.candidate_code', "Nomzod Kodi (MSXXXXXXXX)")}</th>
                                        <th className="px-3.5 py-2.5 text-center">{t('mock_exam.attendance', "Davomat")}</th>
                                        <th className="px-3.5 py-2.5 text-right">{t('common.actions', "Amal")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {students.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-2/60 transition-colors">
                                            <td className="px-3.5 py-2.5 font-semibold text-foreground">
                                                {item.name}
                                            </td>
                                            <td className="px-3.5 py-2.5 font-mono font-semibold text-primary">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-border bg-surface-2">
                                                    <span>{item.code}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyCode(item.code)}
                                                        className="hover:text-foreground transition-colors cursor-pointer"
                                                        title={t('common.copy', "Nusxalash")}
                                                    >
                                                        {copiedCode === item.code ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                                                    item.attended
                                                        ? 'bg-success/10 text-success border border-success/20'
                                                        : 'bg-warning/10 text-warning border border-warning/20'
                                                }`}>
                                                    {item.attended ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {item.attended ? (t('attended', 'Qatnashdi')) : (t('pending', 'Kutilmoqda'))}
                                                </span>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                                                    title={t('delete', "O'chirish")}
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

                <DialogFooter className="p-4 border-t border-border bg-surface-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" size="sm">
                            {t('common.close', 'Yopish')}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
