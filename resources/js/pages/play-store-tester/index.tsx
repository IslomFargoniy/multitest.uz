import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
    Check, 
    Copy, 
    Download, 
    ExternalLink, 
    Mail, 
    MailCheck, 
    MailX, 
    Play, 
    RefreshCw, 
    Search, 
    Send, 
    ShieldCheck, 
    Smartphone, 
    Sparkles, 
    Users 
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import TablePagination from '@/components/ui/table-pagination';
import UserAvatarWithPreview from '@/components/user/UserAvatarWithPreview';
import { formatDateTime } from '@/lib/date';
import { BreadcrumbItem } from '@/types';

interface UserItem {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    created_at: string;
    tester_invited_at?: string | null;
    tester_invite_count?: number;
}

interface PageProps {
    users: {
        data: UserItem[];
        current_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    stats: {
        total_with_email: number;
        total_gmail: number;
        total_invited: number;
        total_uninvited_gmail: number;
    };
    filters: {
        filter: string;
        search: string;
    };
    allGmailAddresses: string[];
    defaultTestingUrl: string;
    auth: any;
    [key: string]: any;
}

export default function PlayStoreTesterIndex() {
    const { t } = useTranslation();
    const { 
        users, 
        stats, 
        filters, 
        allGmailAddresses = [], 
        defaultTestingUrl = 'https://play.google.com/apps/testing/uz.multitest.app',
        auth 
    } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [copiedAll, setCopiedAll] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Invitation Form
    const { data: form, setData: setForm, post: sendInvite, processing, reset: resetForm } = useForm({
        target: 'uninvited_gmail', // 'all_gmail' | 'uninvited_gmail' | 'selected' | 'test_single'
        selected_ids: [] as number[],
        test_email: auth?.user?.email || '',
        limit: 50,
        subject: "🚀 MultiTest ilovasi Google Play'da — Rasmiy sinovchi bo'ling!",
        message: "MultiTest rasmiy mobil ilovasi Android uchun Google Play Store'da e'lon qilindi! Biz sizni eng birinchi rasmiy sinovchilarimiz (Closed Beta Testers) safida ko'rishdan mamnunmiz.",
        testing_url: defaultTestingUrl,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('sidebar.dashboard', 'Boshqaruv paneli'), href: '/dashboard' },
        { title: 'Play Store Testerlar', href: '/play-store-testers' },
    ];

    // Handle Filter Switch
    const handleFilterChange = (newFilter: string) => {
        router.get('/play-store-testers', {
            filter: newFilter,
            search,
        }, { preserveState: true, replace: true });
    };

    // Handle Search Submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/play-store-testers', {
            filter: filters.filter,
            search,
        }, { preserveState: true, replace: true });
    };

    // 1-Click Copy All Gmail Addresses
    const handleCopyAllGmails = async () => {
        if (!allGmailAddresses.length) {
            toast.error("Nusxa olish uchun Gmail manzillar topilmadi");
            return;
        }

        try {
            const textToCopy = allGmailAddresses.join(', ');
            await navigator.clipboard.writeText(textToCopy);
            setCopiedAll(true);
            toast.success(`Jami ${allGmailAddresses.length} ta Gmail manzili buferga nusxalandi!`, {
                description: "Google Play Console -> Closed Testing -> Testers bo'limiga joylashtirishingiz mumkin.",
            });
            setTimeout(() => setCopiedAll(false), 3000);
        } catch (err) {
            toast.error("Nusxalashda xatolik yuz berdi");
        }
    };

    // Copy single email
    const handleCopySingle = async (email: string) => {
        try {
            await navigator.clipboard.writeText(email);
            toast.success(`${email} nusxalandi`);
        } catch (err) {
            toast.error("Nusxalashda xatolik");
        }
    };

    // Toggle Select Row
    const toggleSelectRow = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Toggle Select All Visible
    const toggleSelectAllVisible = () => {
        const visibleIds = users.data.map(u => u.id);
        const allSelected = visibleIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
        }
    };

    // Submit Invitation
    const handleSendInvitations = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...form,
            selected_ids: selectedIds,
        };

        sendInvite(route('play-store-testers.send_email'), {
            data: payload,
            preserveScroll: true,
            onSuccess: () => {
                setIsInviteModalOpen(false);
                setSelectedIds([]);
                toast.success("Taklifnomalar muvaffaqiyatli jo'natildi!");
            },
            onError: (errors) => {
                const firstErr = Object.values(errors)[0] as string;
                toast.error(firstErr || "Xat yuborishda xatolik yuz berdi");
            },
        });
    };

    // Quick single invite
    const handleQuickInviteSingle = (user: UserItem) => {
        setForm({
            target: 'selected',
            selected_ids: [user.id],
            test_email: '',
            limit: 1,
            subject: "🚀 MultiTest ilovasi Google Play'da — Rasmiy sinovchi bo'ling!",
            message: "MultiTest rasmiy mobil ilovasi Android uchun Google Play Store'da e'lon qilindi! Biz sizni eng birinchi rasmiy sinovchilarimiz (Closed Beta Testers) safida ko'rishdan mamnunmiz.",
            testing_url: defaultTestingUrl,
        });
        setSelectedIds([user.id]);
        setIsInviteModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Google Play Testerlar — Boshqaruv" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 sm:p-6 max-w-7xl mx-auto w-full">
                
                {/* Header & Quick Action Buttons */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
                                <div className="h-full w-full bg-background rounded-[10px] flex items-center justify-center">
                                    <Smartphone className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                    Google Play Testerlar
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Closed Testing (14 kunlik talab) uchun foydalanuvchilar ro'yxati va xat yuborish
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Download CSV */}
                        <a
                            href={route('play-store-testers.export', { scope: 'gmail' })}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground shadow-xs transition-all"
                        >
                            <Download className="h-4 w-4 text-emerald-500" />
                            Google Play CSV yuklab olish
                        </a>

                        {/* Copy All Gmails */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCopyAllGmails}
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold rounded-xl border-border bg-card shadow-xs"
                        >
                            {copiedAll ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Copy className="h-4 w-4 text-sky-500" />
                            )}
                            {copiedAll ? 'Nusxalandi!' : `Barcha Gmail'larni nusxalash (${allGmailAddresses.length})`}
                        </Button>

                        {/* Send Invites Modal Trigger */}
                        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-sm hover:opacity-95">
                                    <Send className="h-4 w-4" />
                                    Taklifnoma yuborish
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                        <Sparkles className="h-5 w-5 text-indigo-500" />
                                        Testerlikka taklifnoma xati yuborish
                                    </DialogTitle>
                                    <DialogDescription>
                                        Google Play yopiq test havolasi ko'rsatilgan rasmiy elektron xat yuboring.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSendInvitations} className="space-y-4 py-2">
                                    {/* Target Selection */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Qabul qiluvchilar auditoriyasi:
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.target === 'uninvited_gmail' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:bg-accent/50'}`}>
                                                <input
                                                    type="radio"
                                                    name="target"
                                                    value="uninvited_gmail"
                                                    checked={form.target === 'uninvited_gmail'}
                                                    onChange={e => setForm('target', e.target.value)}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <div className="font-semibold text-foreground">Hali yuborilmaganlarga</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {stats.total_uninvited_gmail} ta yangi Gmail
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.target === 'all_gmail' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:bg-accent/50'}`}>
                                                <input
                                                    type="radio"
                                                    name="target"
                                                    value="all_gmail"
                                                    checked={form.target === 'all_gmail'}
                                                    onChange={e => setForm('target', e.target.value)}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <div className="font-semibold text-foreground">Barcha Gmail'larga</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Jami {stats.total_gmail} ta foydalanuvchi
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.target === 'selected' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:bg-accent/50'}`}>
                                                <input
                                                    type="radio"
                                                    name="target"
                                                    value="selected"
                                                    checked={form.target === 'selected'}
                                                    onChange={e => setForm('target', e.target.value)}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <div className="font-semibold text-foreground">Jadvalda tanlanganlarga</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {selectedIds.length} ta foydalanuvchi tanlandi
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.target === 'test_single' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:bg-accent/50'}`}>
                                                <input
                                                    type="radio"
                                                    name="target"
                                                    value="test_single"
                                                    checked={form.target === 'test_single'}
                                                    onChange={e => setForm('target', e.target.value)}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <div className="font-semibold text-foreground">Sinov uchun (Test)</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        O'z pochtangizga bitta xat
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Test Email Input */}
                                    {form.target === 'test_single' && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">
                                                Sinov pochtasi (Sizning email manzilingiz):
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="admin@gmail.com"
                                                value={form.test_email}
                                                onChange={e => setForm('test_email', e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}

                                    {/* Batch Limit */}
                                    {form.target !== 'test_single' && form.target !== 'selected' && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">
                                                Bir martada yuborish chegarasi (Limit):
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={500}
                                                    value={form.limit}
                                                    onChange={e => setForm('limit', Number(e.target.value))}
                                                    className="w-32"
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    Gmail serveriga ortiqcha yuk tushmasligi uchun 30-50 tadan yuborish tavsiya etiladi.
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Subject */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground">
                                            Xat mavzusi (Subject):
                                        </label>
                                        <Input
                                            value={form.subject}
                                            onChange={e => setForm('subject', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Testing URL */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground">
                                            Google Play Sinov havolasi (Join URL):
                                        </label>
                                        <Input
                                            value={form.testing_url}
                                            onChange={e => setForm('testing_url', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Message preview / custom note */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground">
                                            Xat matni (Izoh):
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={form.message}
                                            onChange={e => setForm('message', e.target.value)}
                                        />
                                    </div>

                                    <DialogFooter className="pt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsInviteModalOpen(false)}
                                            disabled={processing}
                                        >
                                            Bekor qilish
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing || (form.target === 'selected' && selectedIds.length === 0)}
                                            className="gap-2"
                                        >
                                            {processing ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    Yuborilmoqda...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Xatni yuborish
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Gmail */}
                    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Jami Gmail Akkauntlar
                            </span>
                            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                                <Mail className="h-5 w-5" />
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black tracking-tight text-foreground">
                                {stats.total_gmail}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                                / {stats.total_with_email} ta email
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Platformaga Gmail orqali ulanganlar
                        </div>
                    </div>

                    {/* Card 2: Invited Users */}
                    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Taklif Yuborilganlar
                            </span>
                            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                <MailCheck className="h-5 w-5" />
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black tracking-tight text-foreground">
                                {stats.total_invited}
                            </span>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {stats.total_gmail > 0 ? `${Math.round((stats.total_invited / stats.total_gmail) * 100)}%` : '0%'}
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Google Play sinov xati jo'natilgan
                        </div>
                    </div>

                    {/* Card 3: Uninvited Users */}
                    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Hali Yuborilmaganlar
                            </span>
                            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                <MailX className="h-5 w-5" />
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black tracking-tight text-foreground">
                                {stats.total_uninvited_gmail}
                            </span>
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                ta navbatda
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Sinovga taklif qilishga tayyor
                        </div>
                    </div>

                    {/* Card 4: Google Play Requirement */}
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                Google Play Talabi
                            </span>
                            <span className="p-2 rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck className="h-5 w-5" />
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black tracking-tight text-foreground">
                                12 - 20 ta
                            </span>
                            <span className="text-xs font-bold text-primary">
                                faol tester
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            14 kun davomida ilovada ro'yxatda turishi kerak
                        </div>
                    </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('gmail')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filters.filter === 'gmail' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent'}`}
                        >
                            Faqat Gmail ({stats.total_gmail})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('uninvited')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filters.filter === 'uninvited' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent'}`}
                        >
                            Yuborilmaganlar ({stats.total_uninvited_gmail})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('invited')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filters.filter === 'invited' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent'}`}
                        >
                            Yuborilganlar ({stats.total_invited})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filters.filter === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent'}`}
                        >
                            Barcha pochtalar ({stats.total_with_email})
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Ism yoki email bo'yicha..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-3 h-9 text-xs rounded-xl"
                        />
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-4 py-3.5 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={users.data.length > 0 && users.data.every(u => selectedIds.includes(u.id))}
                                            onChange={toggleSelectAllVisible}
                                            className="rounded border-border"
                                        />
                                    </th>
                                    <th className="px-4 py-3.5">Foydalanuvchi</th>
                                    <th className="px-4 py-3.5">Email Manzili</th>
                                    <th className="px-4 py-3.5">Ro'yxatdan o'tgan</th>
                                    <th className="px-4 py-3.5">Taklif Holati</th>
                                    <th className="px-4 py-3.5 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {users.data.length > 0 ? (
                                    users.data.map(item => {
                                        const isSelected = selectedIds.includes(item.id);
                                        const isGmail = item.email.toLowerCase().endsWith('@gmail.com');
                                        const isInvited = !!item.tester_invited_at;

                                        return (
                                            <tr 
                                                key={item.id} 
                                                className={`transition-colors hover:bg-accent/40 ${isSelected ? 'bg-primary/5' : ''}`}
                                            >
                                                <td className="px-4 py-3.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectRow(item.id)}
                                                        className="rounded border-border"
                                                    />
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatarWithPreview
                                                            src={item.avatar}
                                                            name={item.name}
                                                            id={item.id}
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-foreground">
                                                                {item.name}
                                                            </div>
                                                            {item.phone && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {item.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-foreground">
                                                            {item.email}
                                                        </span>
                                                        {isGmail ? (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5">
                                                                Gmail
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                                                                Boshqa
                                                            </Badge>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopySingle(item.email)}
                                                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                                            title="Emailni nusxalash"
                                                        >
                                                            <Copy className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                                    {formatDateTime(item.created_at)}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {isInvited ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <Badge className="w-fit bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium gap-1">
                                                                <Check className="h-3 w-3" />
                                                                Yuborilgan {item.tester_invite_count && item.tester_invite_count > 1 ? `(${item.tester_invite_count}x)` : ''}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {formatDateTime(item.tester_invited_at)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[11px] font-medium border-border text-muted-foreground bg-muted/30">
                                                            Yuborilmagan
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleQuickInviteSingle(item)}
                                                        className="h-8 px-2.5 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <Send className="h-3.5 w-3.5" />
                                                        Xat yuborish
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                                            Foydalanuvchilar topilmadi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <TablePagination
                        from={users.from}
                        to={users.to}
                        total={users.total}
                        per_page={users.per_page}
                        links={users.links}
                        searchParams={{
                            filter: filters.filter,
                            search: filters.search,
                        }}
                    />
                </div>

                {/* Helpful Instruction Box */}
                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 mt-0.5">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                            <div className="font-bold text-foreground text-sm sm:text-base">
                                Google Play Closed Testing bo'yicha qo'llanma:
                            </div>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>
                                    Yuqoridagi <strong>«Google Play CSV yuklab olish»</strong> yoki <strong>«Barcha Gmail'larni nusxalash»</strong> tugmasini bosing.
                                </li>
                                <li>
                                    Google Play Console $\rightarrow$ <strong>Testing</strong> $\rightarrow$ <strong>Closed testing</strong> $\rightarrow$ <strong>Testers</strong> sahifasiga o'ting.
                                </li>
                                <li>
                                    <strong>«Create email list»</strong> tugmasini bosib, ro'yxatni yuklang va saqlang.
                                </li>
                                <li>
                                    Admin panelimizdagi <strong>«Taklifnoma yuborish»</strong> tugmasi orqali foydalanuvchilar pochtasiga havola yuboring. Ular pochtani ochib <em>«Become a tester»</em> tugmasini bosishi va ilovani yuklab olishi kifoya!
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
