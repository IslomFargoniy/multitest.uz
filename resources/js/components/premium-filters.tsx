import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Calendar, BookOpen, GraduationCap, User as UserIcon, X, ChevronDown, ChevronUp, ListOrdered, Shield, SlidersHorizontal, RotateCcw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Test, User, Role } from '@/types';
import { useHaptic } from '@/components/telegram-theme-provider';

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
    const { impact } = useHaptic();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    const activeFilterCount = [
        data.teacher_id,
        data.user_id,
        data.test_id,
        data.role,
        data.from,
        data.to,
    ].filter((v) => Boolean(v) && v !== '0').length;

    const hasActiveFilters = Boolean(
        activeFilterCount > 0 || (data.search && data.search.trim() !== '')
    );

    const clearFilters = () => {
        impact('light');
        setData('search', '');
        if (data.teacher_id !== undefined) setData('teacher_id', '');
        if (data.user_id !== undefined) setData('user_id', '');
        if (data.test_id !== undefined) setData('test_id', '');
        if (data.role !== undefined) setData('role', '');
        if (data.from !== undefined) setData('from', '');
        if (data.to !== undefined) setData('to', '');
    };

    return (
        <div className="w-full space-y-3">
            {/* Primary Filter Bar */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    {/* Search Input Box */}
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={placeholder || t('search_placeholder', 'Qidirish...')}
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

                    {/* Mobile Filter Button (Opens Bottom Sheet) */}
                    <div className="flex items-center gap-1.5 md:hidden pr-1">
                        <Dialog open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => impact('light')}
                                    className={`relative flex h-10 items-center gap-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        activeFilterCount > 0
                                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    <span>{t('filters', 'Filtr')}</span>
                                    {activeFilterCount > 0 && (
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-primary text-[10px] font-black">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </DialogTrigger>

                            <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 sm:top-[50%] sm:bottom-auto sm:translate-y-[-50%] sm:max-w-[460px] mx-auto overflow-hidden rounded-t-[2rem] sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
                                <div className="w-full flex justify-center pb-2 sm:hidden">
                                    <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                </div>

                                <DialogHeader className="pb-3 border-b border-border/50">
                                    <DialogTitle className="text-base font-black flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                                            {t('filters', 'Filtrlar')}
                                        </span>
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                                            >
                                                {t('clear_filters', 'Tozalash')}
                                            </button>
                                        )}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    {/* Role Select */}
                                    {roles && roles.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                {t('role', 'Rol')}
                                            </label>
                                            <Select
                                                value={String(data.role || '0')}
                                                onValueChange={(val) => setData('role', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all', 'Barchasi')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="0">{t('all', 'Barchasi')}</SelectItem>
                                                    {roles.map((r) => (
                                                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Teacher Select */}
                                    {isAdmin && teachers && teachers.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                {t('teacher', 'O‘qituvchi')}
                                            </label>
                                            <Select
                                                value={String(data.teacher_id || '0')}
                                                onValueChange={(val) => setData('teacher_id', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all', 'Barchasi')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="0">{t('all', 'Barchasi')}</SelectItem>
                                                    {teachers.map((tItem) => (
                                                        <SelectItem key={tItem.id} value={String(tItem.id)}>{tItem.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Date Range */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-primary" /> {t('date_range', 'Sana oralig‘i')}
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <DatePicker
                                                selected={data.from ? new Date(data.from) : null}
                                                onChange={(date: Date | null) => setData('from', date ? format(date, 'yyyy-MM-dd') : '')}
                                                placeholderText={t('from_date', 'Dan')}
                                                className="w-full h-11 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                            />
                                            <DatePicker
                                                selected={data.to ? new Date(data.to) : null}
                                                onChange={(date: Date | null) => setData('to', date ? format(date, 'yyyy-MM-dd') : '')}
                                                placeholderText={t('to_date', 'Gacha')}
                                                className="w-full h-11 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit inside Drawer */}
                                    <div className="pt-3">
                                        <Button
                                            type="submit"
                                            onClick={() => setIsMobileDrawerOpen(false)}
                                            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm uppercase shadow-sm"
                                        >
                                            {t('apply_filters', 'Filtrlarni Qo‘llash')}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            type="submit"
                            size="sm"
                            className="h-10 px-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs"
                        >
                            <Search className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {/* Desktop Filter Bar (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-2 px-1">
                        {roles && roles.length > 0 && (
                            <Select
                                value={String(data.role || '0')}
                                onValueChange={(val) => setData('role', val === '0' ? '' : val)}
                            >
                                <SelectTrigger className="h-10 w-auto min-w-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold px-3">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Shield className="h-4 w-4 text-primary shrink-0" />
                                        <SelectValue placeholder={t('role', 'Rol')} />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="0">{t('all', 'Barchasi')}</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {isAdmin && teachers && teachers.length > 0 && (
                            <Select
                                value={String(data.teacher_id || '0')}
                                onValueChange={(val) => setData('teacher_id', val === '0' ? '' : val)}
                            >
                                <SelectTrigger className="h-10 w-auto min-w-[130px] max-w-[180px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold px-3">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                                        <SelectValue placeholder={t('teacher', 'O‘qituvchi')} />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="0">{t('all', 'Barchasi')}</SelectItem>
                                    {teachers.map((tItem) => (
                                        <SelectItem key={tItem.id} value={String(tItem.id)}>{tItem.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`h-10 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                isExpanded || data.from || data.to
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <Filter className="h-4 w-4 mr-1.5" />
                            <span>{t('filters', 'Filtrlar')}</span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
                        </Button>

                        <Button
                            type="submit"
                            size="sm"
                            className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xs active:scale-95 cursor-pointer"
                        >
                            {t('search', 'Qidirish')}
                        </Button>

                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-10 px-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-sm cursor-pointer"
                                title={t('clear_filters', 'Filtrlarni tozalash')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Collapsible Extended Filters on Desktop */}
                {isExpanded && (
                    <div className="hidden md:grid bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-in fade-in duration-200">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-primary" /> {t('date_range', 'Sana oralig‘i')}
                            </label>
                            <div className="flex items-center gap-2">
                                <DatePicker
                                    selected={data.from ? new Date(data.from) : null}
                                    onChange={(date: Date | null) => setData('from', date ? format(date, 'yyyy-MM-dd') : '')}
                                    placeholderText={t('from_date', 'Dan')}
                                    className="w-full h-10 px-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white"
                                />
                                <DatePicker
                                    selected={data.to ? new Date(data.to) : null}
                                    onChange={(date: Date | null) => setData('to', date ? format(date, 'yyyy-MM-dd') : '')}
                                    placeholderText={t('to_date', 'Gacha')}
                                    className="w-full h-10 px-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <ListOrdered className="h-4 w-4 text-primary" /> {t('per_page', 'Sahifada')}
                            </label>
                            <Select value={String(data.per_page || '10')} onValueChange={(val) => setData('per_page', Number(val))}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-semibold">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
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
    );
}
