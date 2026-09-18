import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search,
    Filter,
    Calendar,
    BookOpen,
    GraduationCap,
    User as UserIcon,
    X,
    ChevronDown,
    ChevronUp,
    ListOrdered,
    Shield,
    RotateCcw,
    SlidersHorizontal,
    Check,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { Test, User, Role } from '@/types';

interface PremiumFiltersProps {
    data: any;
    setData: (key: string, value: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isAdmin?: boolean;
    isTeacher?: boolean;
    users?: User[];
    teachers?: User[];
    tests?: Test[];
    roles?: Role[];
    placeholder?: string;
}

export default function PremiumFilters({
    data,
    setData,
    handleSubmit,
    isAdmin = false,
    isTeacher = false,
    users = [],
    teachers = [],
    tests = [],
    roles = [],
    placeholder,
}: PremiumFiltersProps) {
    const { t } = useTranslation();
    const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    // Count active non-search filters
    const activeFiltersCount = [
        data.role,
        data.teacher_id,
        data.user_id,
        data.test_id,
        data.from,
        data.to,
    ].filter((v) => Boolean(v) && v !== '0' && v !== '').length;

    const hasAnyActiveFilters = Boolean(
        activeFiltersCount > 0 || (data.search && data.search.trim() !== '')
    );

    const clearFilters = () => {
        setData('search', '');
        if (data.teacher_id !== undefined) setData('teacher_id', '');
        if (data.user_id !== undefined) setData('user_id', '');
        if (data.test_id !== undefined) setData('test_id', '');
        if (data.role !== undefined) setData('role', '');
        if (data.from !== undefined) setData('from', '');
        if (data.to !== undefined) setData('to', '');
    };

    const handleMobileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsMobileSheetOpen(false);
        handleSubmit(e);
    };

    // Helper to get selected name labels for active chips
    const getRoleName = () => data.role;
    const getTeacherName = () => teachers.find((tc) => String(tc.id) === String(data.teacher_id))?.name || data.teacher_id;
    const getUserName = () => users.find((u) => String(u.id) === String(data.user_id))?.name || data.user_id;
    const getTestName = () => tests.find((ts) => String(ts.id) === String(data.test_id))?.name || data.test_id;

    return (
        <div className="w-full space-y-2.5">
            {/* ========================================================= */}
            {/* MOBILE VIEW (Compact Single Row + Mobile Drawer)         */}
            {/* ========================================================= */}
            <div className="block md:hidden">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        {/* Search Input Box */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={placeholder || t('search_placeholder') || 'Qidirish...'}
                                value={data.search || ''}
                                onChange={(e) => setData('search', e.target.value)}
                                className="w-full h-10 pl-9 pr-7 text-sm font-medium bg-transparent border-0 focus:outline-hidden focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                            {data.search && (
                                <button
                                    type="button"
                                    onClick={() => setData('search', '')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Mobile Filter Button (Triggers Bottom Sheet) */}
                        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={`relative h-10 px-3 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 shrink-0 transition-all cursor-pointer ${
                                        activeFiltersCount > 0
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400'
                                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                                    <span>{t('filters') || 'Filtr'}</span>
                                    {activeFiltersCount > 0 && (
                                        <span className="ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="bottom"
                                className="rounded-t-3xl max-h-[88vh] overflow-y-auto px-4 pb-6 pt-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            >
                                {/* Drag Pill */}
                                <div className="mx-auto my-1.5 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />

                                <SheetHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                            <SlidersHorizontal className="h-4 w-4" />
                                        </div>
                                        <SheetTitle className="text-base font-bold text-slate-900 dark:text-white">
                                            {t('filters') || 'Filtrlar'}
                                        </SheetTitle>
                                    </div>
                                    {activeFiltersCount > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-8 px-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            {t('clear') || 'Tozalash'}
                                        </Button>
                                    )}
                                </SheetHeader>

                                {/* Filter Controls Stack */}
                                <div className="space-y-4 py-4">
                                    {/* Role Select */}
                                    {roles && roles.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                                <Shield className="h-3.5 w-3.5 text-indigo-500" /> {t('role') || 'Rol'}
                                            </label>
                                            <Select
                                                value={String(data.role || '0')}
                                                onValueChange={(val) => setData('role', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all') || 'Barchasi'} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                    <SelectItem value="0">{t('all') || 'Barchasi'}</SelectItem>
                                                    {roles.map((r) => (
                                                        <SelectItem key={r.id} value={r.name}>
                                                            {r.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Teacher Select */}
                                    {isAdmin && teachers && teachers.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                                <GraduationCap className="h-3.5 w-3.5 text-indigo-500" /> {t('teacher') || "O'qituvchi"}
                                            </label>
                                            <Select
                                                value={String(data.teacher_id || '0')}
                                                onValueChange={(val) => setData('teacher_id', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all') || 'Barchasi'} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                    <SelectItem value="0">{t('all') || 'Barchasi'}</SelectItem>
                                                    {teachers.map((tItem) => (
                                                        <SelectItem key={tItem.id} value={String(tItem.id)}>
                                                            {tItem.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* User Select */}
                                    {isAdmin && users && users.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                                <UserIcon className="h-3.5 w-3.5 text-blue-500" /> {t('user') || 'Foydalanuvchi'}
                                            </label>
                                            <Select
                                                value={String(data.user_id || '0')}
                                                onValueChange={(val) => setData('user_id', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all') || 'Barchasi'} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                    <SelectItem value="0">{t('all') || 'Barchasi'}</SelectItem>
                                                    {users.map((u) => (
                                                        <SelectItem key={u.id} value={String(u.id)}>
                                                            {u.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Test Select */}
                                    {tests && tests.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                                <BookOpen className="h-3.5 w-3.5 text-emerald-500" /> {t('test') || 'Test'}
                                            </label>
                                            <Select
                                                value={String(data.test_id || '0')}
                                                onValueChange={(val) => setData('test_id', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all') || 'Barchasi'} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                    <SelectItem value="0">{t('all') || 'Barchasi'}</SelectItem>
                                                    {tests.map((tItem) => (
                                                        <SelectItem key={tItem.id} value={String(tItem.id)}>
                                                            {tItem.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Date Range */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-indigo-500" /> {t('date_range') || "Sana oralig'i"}
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <DatePicker
                                                selected={data.from ? new Date(data.from) : null}
                                                onChange={(date: Date | null) => setData('from', date ? format(date, 'yyyy-MM-dd') : '')}
                                                placeholderText={t('from_date') || 'Dan'}
                                                className="w-full h-11 px-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white"
                                            />
                                            <DatePicker
                                                selected={data.to ? new Date(data.to) : null}
                                                onChange={(date: Date | null) => setData('to', date ? format(date, 'yyyy-MM-dd') : '')}
                                                placeholderText={t('to_date') || 'Gacha'}
                                                className="w-full h-11 px-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Per Page */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                            <ListOrdered className="h-3.5 w-3.5 text-indigo-500" /> {t('per_page') || 'Sahifada'}
                                        </label>
                                        <Select value={String(data.per_page || '10')} onValueChange={(val) => setData('per_page', Number(val))}>
                                            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-semibold">
                                                <SelectValue placeholder="10" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="25">25</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Footer Apply Button */}
                                <SheetFooter className="p-0 pt-2">
                                    <Button
                                        type="button"
                                        onClick={handleMobileSubmit}
                                        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md active:scale-98 cursor-pointer transition-all"
                                    >
                                        <Check className="h-4 w-4 mr-1.5" />
                                        {t('apply_filters') || "Qo'llash va Qidirish"}
                                    </Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>

                        {/* Search Submit Action Button */}
                        <Button
                            type="submit"
                            size="sm"
                            className="h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-xs active:scale-95 cursor-pointer transition-all"
                        >
                            <Search className="h-3.5 w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">{t('search') || 'Qidirish'}</span>
                        </Button>
                    </div>
                </form>

                {/* Active Filter Chips Scrollable Row (Mobile) */}
                {activeFiltersCount > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
                        {data.role && data.role !== '0' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0 border border-indigo-200/60 dark:border-indigo-800/60">
                                <Shield className="h-3 w-3" />
                                {getRoleName()}
                                <button
                                    type="button"
                                    onClick={() => setData('role', '')}
                                    className="p-0.5 hover:text-indigo-900 cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {data.teacher_id && data.teacher_id !== '0' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0 border border-indigo-200/60 dark:border-indigo-800/60">
                                <GraduationCap className="h-3 w-3" />
                                {getTeacherName()}
                                <button
                                    type="button"
                                    onClick={() => setData('teacher_id', '')}
                                    className="p-0.5 hover:text-indigo-900 cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {data.user_id && data.user_id !== '0' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0 border border-blue-200/60 dark:border-blue-800/60">
                                <UserIcon className="h-3 w-3" />
                                {getUserName()}
                                <button
                                    type="button"
                                    onClick={() => setData('user_id', '')}
                                    className="p-0.5 hover:text-blue-900 cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {data.test_id && data.test_id !== '0' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                                <BookOpen className="h-3 w-3" />
                                {getTestName()}
                                <button
                                    type="button"
                                    onClick={() => setData('test_id', '')}
                                    className="p-0.5 hover:text-emerald-900 cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {(data.from || data.to) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shrink-0 border border-slate-200 dark:border-slate-700">
                                <Calendar className="h-3 w-3" />
                                {data.from || '...'} → {data.to || '...'}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('from', '');
                                        setData('to', '');
                                    }}
                                    className="p-0.5 hover:text-slate-900 cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs text-rose-500 font-semibold hover:underline shrink-0 px-1 cursor-pointer"
                        >
                            {t('clear_all') || 'Tozalash'}
                        </button>
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* DESKTOP VIEW (Full Inline Bar + Collapsible Extra)        */}
            {/* ========================================================= */}
            <div className="hidden md:block">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        {/* Search Input Box */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder={placeholder || t('search_placeholder') || 'Qidirish...'}
                                value={data.search || ''}
                                onChange={(e) => setData('search', e.target.value)}
                                className="w-full h-11 pl-11 pr-8 text-sm font-medium bg-transparent border-0 focus:outline-hidden focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                            {data.search && (
                                <button
                                    type="button"
                                    onClick={() => setData('search', '')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Quick Filter Selects */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Role Select */}
                            {roles && roles.length > 0 && (
                                <Select
                                    value={String(data.role || '0')}
                                    onValueChange={(val) => setData('role', val === '0' ? '' : val)}
                                >
                                    <SelectTrigger className="h-10 w-auto min-w-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold px-3">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Shield className="h-4 w-4 text-indigo-500 shrink-0" />
                                            <SelectValue placeholder={t('role') || 'Rol'} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <SelectItem value="0">{t('all') || 'Barchasi'}</SelectItem>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={r.name}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Teacher Select */}
                            {isAdmin && teachers && teachers.length > 0 && (
                                <Select
                                    value={String(data.teacher_id || '0')}
                                    onValueChange={(val) => setData('teacher_id', val === '0' ? '' : val)}
                                >
                                    <SelectTrigger className="h-10 w-auto min-w-[130px] max-w-[180px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold px-3">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <GraduationCap className="h-4 w-4 text-indigo-500 shrink-0" />
                                            <SelectValue placeholder={t('teacher') || "O'qituvchi"} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <SelectItem value="0">{t('all') || 'Barchasi'}</SelectItem>
                                        {teachers.map((tItem) => (
                                            <SelectItem key={tItem.id} value={String(tItem.id)}>
                                                {tItem.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* User Select */}
                            {isAdmin && users && users.length > 0 && (
                                <Select
                                    value={String(data.user_id || '0')}
                                    onValueChange={(val) => setData('user_id', val === '0' ? '' : val)}
                                >
                                    <SelectTrigger className="h-10 w-auto min-w-[130px] max-w-[180px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold px-3">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <UserIcon className="h-4 w-4 text-blue-500 shrink-0" />
                                            <SelectValue placeholder={t('user') || 'Foydalanuvchi'} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <SelectItem value="0">{t('all') || 'Barchasi'}</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Test Select */}
                            {tests && tests.length > 0 && (
                                <Select
                                    value={String(data.test_id || '0')}
                                    onValueChange={(val) => setData('test_id', val === '0' ? '' : val)}
                                >
                                    <SelectTrigger className="h-10 w-auto min-w-[130px] max-w-[180px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold px-3">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <BookOpen className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <SelectValue placeholder={t('test') || 'Test'} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <SelectItem value="0">{t('all') || 'Barchasi'}</SelectItem>
                                        {tests.map((tItem) => (
                                            <SelectItem key={tItem.id} value={String(tItem.id)}>
                                                {tItem.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Expand Extra Filters (Date Range, Per Page) */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
                                className={`h-10 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    isDesktopExpanded || data.from || data.to
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                <Filter className="h-4 w-4 mr-1.5" />
                                <span>{t('filters') || 'Filtrlar'}</span>
                                {isDesktopExpanded ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
                            </Button>

                            {/* Search Action Button */}
                            <Button
                                type="submit"
                                size="sm"
                                className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs active:scale-95 cursor-pointer transition-all"
                            >
                                {t('search') || 'Qidirish'}
                            </Button>

                            {/* Reset Filter Button */}
                            {hasAnyActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-10 px-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-sm cursor-pointer"
                                    title={t('clear_filters') || 'Filtrlarni tozalash'}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Collapsible Extended Filters (Dates, Per Page) */}
                    {isDesktopExpanded && (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-in fade-in duration-200">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-indigo-500" /> {t('date_range') || "Sana oralig'i"}
                                </label>
                                <div className="flex items-center gap-2">
                                    <DatePicker
                                        selected={data.from ? new Date(data.from) : null}
                                        onChange={(date: Date | null) => setData('from', date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholderText={t('from_date') || 'Dan'}
                                        className="w-full h-10 px-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white"
                                    />
                                    <DatePicker
                                        selected={data.to ? new Date(data.to) : null}
                                        onChange={(date: Date | null) => setData('to', date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholderText={t('to_date') || 'Gacha'}
                                        className="w-full h-10 px-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <ListOrdered className="h-4 w-4 text-indigo-500" /> {t('per_page') || 'Sahifada'}
                                </label>
                                <Select value={String(data.per_page || '10')} onValueChange={(val) => setData('per_page', Number(val))}>
                                    <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-semibold">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
