import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Calendar, BookOpen, GraduationCap, User as UserIcon, X, ChevronDown, ChevronUp, ListOrdered, Shield } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    const [isExpanded, setIsExpanded] = useState(false);

    const hasActiveFilters = Boolean(
        data.teacher_id || data.user_id || data.test_id || data.role || data.from || data.to || (data.search && data.search.trim() !== '')
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

    return (
        <div className="w-full space-y-3">
            {/* Primary Filter Bar */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative flex flex-col md:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    {/* Search Input Box */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={placeholder || t('search_placeholder') || 'Qidirish...'}
                            value={data.search || ''}
                            onChange={(e) => setData('search', e.target.value)}
                            className="w-full h-11 pl-11 pr-4 text-sm font-medium bg-transparent border-0 focus:outline-hidden focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
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

                    {/* Quick Filter Badges / Selects */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto px-1 md:px-0">
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

                        {/* Expand Filter Button (Date Range, Per Page) */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`h-10 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                isExpanded || data.from || data.to
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <Filter className="h-4 w-4 mr-1.5" />
                            <span>{t('filters') || 'Filtrlar'}</span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
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
                        {hasActiveFilters && (
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
                {isExpanded && (
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
    );
}
