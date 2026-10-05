import { router, useForm } from '@inertiajs/react';
import { Check, CheckCircle2, Clock, Copy, FileSpreadsheet, Plus, Printer, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
                toast.error(err?.names || t('error.create_failed', 'Xatolik yuz berdi'));
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
                    [t('mock_exam.attendance', 'Davomat')]: st.attended ? t('attended', 'Qatnashdi') : t('pending', 'Kutilmoqda'),
                    [t('overall_score', 'Umumiy Ball')]:
                        att?.score != null ? att.score : att?.ai_score_avg != null ? Number(att.ai_score_avg).toFixed(2) : '-',
                    [t('tab_switches', 'Tab Almashtirish')]: att?.tab_switch_count ?? 0,
                    [t('status', 'Holati')]: att?.finished_at
                        ? t('finished', 'Yakunlangan')
                        : att?.started_at
                          ? t('in_progress', 'Jarayonda')
                          : t('not_started', 'Boshlanmagan'),
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, t('mock_exam.candidates', 'Nomzodlar'));
            XLSX.writeFile(workbook, `Mock_${mockName.replace(/\s+/g, '_')}_Nomzodlar.xlsx`);
            toast.success(t('excel_export_success', 'Excel fayl yuklab olindi!'));
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="text-foreground bg-surface-2 hover:bg-secondary border-border inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                    <Users className="text-muted-foreground h-3.5 w-3.5" />
                    <span>
                        {t('students', "O'quvchilar")} ({students.length})
                    </span>
                </button>
            </DialogTrigger>

            <DialogContent className="bg-card border-border flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl border p-0 shadow-lg sm:max-w-2xl">
                {/* Header */}
                <DialogHeader className="border-border bg-surface-2 flex items-center justify-between border-b p-5">
                    <div>
                        <DialogTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                            <Users className="text-primary h-5 w-5" />
                            {t('mock_students.management', "Mock O'quvchilari Boshqaruvi")}
                        </DialogTitle>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            {t('test', 'Test')}: <span className="text-foreground font-semibold">{mockName}</span>
                        </p>
                    </div>
                </DialogHeader>

                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                    {/* Add Students Form */}
                    <form onSubmit={handleAddStudents} className="bg-surface-2 border-border space-y-3 rounded-lg border p-4">
                        <Label htmlFor="names-input" className="text-foreground text-xs font-semibold">
                            {t('mock_students.add_names_label', "Yangi O'quvchilar Ismlarini Qo'shish (Har bir ismni yangi qatorga yozing)")}
                        </Label>
                        <textarea
                            id="names-input"
                            rows={3}
                            placeholder={t('mock_students.placeholder', 'Masalan:\nAnvar Karimov\nMalika Aliyeva\nSardor Qodirov')}
                            className="border-border bg-card text-foreground placeholder:text-muted-foreground w-full rounded-lg border p-3 text-xs font-medium focus:outline-hidden"
                            value={data.names}
                            onChange={(e) => setData('names', e.target.value)}
                            required
                        />

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-muted-foreground text-xs">
                                {t('mock_students.code_generation_note', '* Tizim har biriga avtomatik MSXXXXXXXX formatida kod generatsiya qiladi.')}
                            </span>
                            <Button type="submit" size="sm" disabled={processing || !data.names.trim()} className="text-xs font-semibold">
                                <Plus className="mr-1 h-3.5 w-3.5" />
                                {t('common.add', "Qo'shish")}
                            </Button>
                        </div>
                    </form>

                    {/* Students List Toolbar */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-muted-foreground text-xs font-semibold">
                            {t('mock_students.registered_students', "Ro'yxatga Olinganlar")} ({students.length})
                        </h4>
                        {students.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportExcel}
                                    className="flex items-center gap-1.5 text-xs font-semibold"
                                >
                                    <FileSpreadsheet className="text-success h-3.5 w-3.5" />
                                    {t('excel', 'Excel')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrintPasses}
                                    className="flex items-center gap-1.5 text-xs font-semibold"
                                >
                                    <Printer className="text-muted-foreground h-3.5 w-3.5" />
                                    {t('print_passes', 'Chop Etish')}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    {students.length === 0 ? (
                        <div className="border-border text-muted-foreground rounded-lg border border-dashed py-8 text-center text-xs">
                            {t('mock_students.no_students_yet', "Hali o'quvchilar qo'shilmagan. Yuqoridagi maydonga ismlarni kiriting.")}
                        </div>
                    ) : (
                        <div className="border-border overflow-x-auto rounded-lg border">
                            <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                                <thead className="bg-surface-2 text-muted-foreground text-xs font-semibold">
                                    <tr>
                                        <th className="px-3.5 py-2.5">{t('mock_exam.student_name', "O'quvchi Ismi")}</th>
                                        <th className="px-3.5 py-2.5">{t('mock_exam.candidate_code', 'Nomzod Kodi (MSXXXXXXXX)')}</th>
                                        <th className="px-3.5 py-2.5 text-center">{t('mock_exam.attendance', 'Davomat')}</th>
                                        <th className="px-3.5 py-2.5 text-right">{t('common.actions', 'Amal')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-border bg-card divide-y">
                                    {students.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-2/60 transition-colors">
                                            <td className="text-foreground px-3.5 py-2.5 font-semibold">{item.name}</td>
                                            <td className="text-primary px-3.5 py-2.5 font-mono font-semibold">
                                                <div className="border-border bg-surface-2 inline-flex items-center gap-1.5 rounded border px-2 py-0.5">
                                                    <span>{item.code}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyCode(item.code)}
                                                        className="hover:text-foreground cursor-pointer transition-colors"
                                                        title={t('common.copy', 'Nusxalash')}
                                                    >
                                                        {copiedCode === item.code ? (
                                                            <Check className="text-success h-3.5 w-3.5" />
                                                        ) : (
                                                            <Copy className="text-muted-foreground h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${
                                                        item.attended
                                                            ? 'bg-success/10 text-success border-success/20 border'
                                                            : 'bg-warning/10 text-warning border-warning/20 border'
                                                    }`}
                                                >
                                                    {item.attended ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                    {item.attended ? t('attended', 'Qatnashdi') : t('pending', 'Kutilmoqda')}
                                                </span>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-destructive hover:bg-destructive/10 cursor-pointer rounded p-1.5 transition-colors"
                                                    title={t('delete', "O'chirish")}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-border bg-surface-2 border-t p-4">
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
