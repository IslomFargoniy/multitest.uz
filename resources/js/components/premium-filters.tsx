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

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
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

    const getRoleName = () => data.role;
    const getTeacherName = () => teachers.find((tc) => String(tc.id) === String(data.teacher_id))?.name || data.teacher_id;
    const getUserName = () => users.find((u) => String(u.id) === String(data.user_id))?.name || data.user_id;
    const getTestName = () => tests.find((ts) => String(ts.id) === String(data.test_id))?.name || data.test_id;

    return (
        <div className="w-full space-y-2.5">
            {/* MOBILE VIEW */}
            <div className="block md:hidden">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-card border border-border shadow-sm dark:shadow-none">
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={placeholder || t('search_placeholder')}
                                value={data.search || ''}
                                onChange={(e) => setData('search', e.target.value)}
                                className="w-full h-10 pl-9 pr-7 text-sm font-medium bg-transparent border-0 focus:outline-hidden text-foreground placeholder:text-muted-foreground"
                            />
                            {data.search && (
                                <button
                                    type="button"
                                    onClick={() => setData('search', '')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={`relative h-10 px-3 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                                        activeFiltersCount > 0 ? 'bg-secondary text-foreground' : ''
                                    }`}
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                                    <span>{t('filter')}</span>
                                    {activeFiltersCount > 0 && (
                                        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="bottom"
                                className="rounded-t-2xl max-h-[88vh] overflow-y-auto px-4 pb-6 pt-2 bg-card border-border"
                            >
                                <div className="mx-auto my-1.5 h-1.5 w-12 rounded-full bg-muted" />

                                <SheetHeader className="p-0 pb-3 border-b border-border flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-surface-2 text-foreground">
                                            <SlidersHorizontal className="h-4 w-4" />
                                        </div>
                                        <SheetTitle className="text-base font-bold text-foreground">
                                            {t('filters')}
                                        </SheetTitle>
                                    </div>
                                    {activeFiltersCount > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            {t('clear')}
                                        </Button>
                                    )}
                                </SheetHeader>

                                <div className="space-y-4 py-4">
                                    {roles && roles.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <Shield className="h-3.5 w-3.5" /> {t('role')}
                                            </label>
                                            <Select
                                                value={String(data.role || '0')}
                                                onValueChange={(val) => setData('role', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface-2 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg bg-card border-border">
                                                    <SelectItem value="0">{t('all')}</SelectItem>
                                                    {roles.map((r) => (
                                                        <SelectItem key={r.id} value={r.name}>
                                                            {r.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {isAdmin && teachers && teachers.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <GraduationCap className="h-3.5 w-3.5" /> {t('teacher')}
                                            </label>
                                            <Select
                                                value={String(data.teacher_id || '0')}
                                                onValueChange={(val) => setData('teacher_id', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface-2 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg bg-card border-border">
                                                    <SelectItem value="0">{t('all')}</SelectItem>
                                                    {teachers.map((tItem) => (
                                                        <SelectItem key={tItem.id} value={String(tItem.id)}>
                                                            {tItem.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {isAdmin && users && users.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <UserIcon className="h-3.5 w-3.5" /> {t('user')}
                                            </label>
                                            <Select
                                                value={String(data.user_id || '0')}
                                                onValueChange={(val) => setData('user_id', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface-2 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg bg-card border-border">
                                                    <SelectItem value="0">{t('all')}</SelectItem>
                                                    {users.map((u) => (
                                                        <SelectItem key={u.id} value={String(u.id)}>
                                                            {u.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {tests && tests.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <BookOpen className="h-3.5 w-3.5" /> {t('test')}
                                            </label>
                                            <Select
                                                value={String(data.test_id || '0')}
                                                onValueChange={(val) => setData('test_id', val === '0' ? '' : val)}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface-2 text-sm font-semibold">
                                                    <SelectValue placeholder={t('all')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg bg-card border-border">
                                                    <SelectItem value="0">{t('all')}</SelectItem>
                                                    {tests.map((tItem) => (
                                                        <SelectItem key={tItem.id} value={String(tItem.id)}>
                                                            {tItem.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" /> {t('date_range')}
                                        </label>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-surface-2 border border-border">
                                                <span className="text-xs font-semibold text-muted-foreground shrink-0">
                                                    {t('from_date')}
                                                </span>
                                                <input
                                                    type="date"
                                                    value={data.from || ''}
                                                    onChange={(e) => setData('from', e.target.value)}
                                                    className="h-8 px-2 text-xs font-medium rounded border border-border bg-card text-foreground focus:outline-hidden"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-surface-2 border border-border">
                                                <span className="text-xs font-semibold text-muted-foreground shrink-0">
                                                    {t('to_date')}
                                                </span>
                                                <input
                                                    type="date"
                                                    value={data.to || ''}
                                                    onChange={(e) => setData('to', e.target.value)}
                                                    className="h-8 px-2 text-xs font-medium rounded border border-border bg-card text-foreground focus:outline-hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                            <ListOrdered className="h-3.5 w-3.5" /> {t('per_page')}
                                        </label>
                                        <Select value={String(data.per_page || '10')} onValueChange={(val) => setData('per_page', Number(val))}>
                                            <SelectTrigger className="h-11 w-full rounded-lg border-border bg-surface-2 text-foreground text-sm font-semibold">
                                                <SelectValue placeholder="10" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg bg-card border-border">
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="25">25</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <SheetFooter className="p-0 pt-2">
                                    <Button
                                        type="button"
                                        onClick={handleMobileSubmit}
                                        className="w-full h-11 rounded-lg"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        <span>{t('apply_filters')}</span>
                                    </Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>

                        <Button
                            type="submit"
                            size="sm"
                            className="h-10 px-3.5 rounded-lg shrink-0"
                        >
                            <Search className="h-3.5 w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">{t('search')}</span>
                        </Button>
                    </div>
                </form>

                {/* Active Filter Chips Scrollable Row */}
                {activeFiltersCount > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
                        {data.role && data.role !== '0' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-medium shrink-0 border border-border">
                                <Shield className="h-3 w-3" />
                                {getRoleName()}
                                <button
                                    type="button"
                                    onClick={() => setData('role', '')}
                                    className="p-0.5 hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {data.teacher_id && data.teacher_id !== '0' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-medium shrink-0 border border-border">
                                <GraduationCap className="h-3 w-3" />
                                {getTeacherName()}
                                <button
                                    type="button"
                                    onClick={() => setData('teacher_id', '')}
                                    className="p-0.5 hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {data.user_id && data.user_id !== '0' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-medium shrink-0 border border-border">
                                <UserIcon className="h-3 w-3" />
                                {getUserName()}
                                <button
                                    type="button"
                                    onClick={() => setData('user_id', '')}
                                    className="p-0.5 hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {data.test_id && data.test_id !== '0' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-medium shrink-0 border border-border">
                                <BookOpen className="h-3 w-3" />
                                {getTestName()}
                                <button
                                    type="button"
                                    onClick={() => setData('test_id', '')}
                                    className="p-0.5 hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {(data.from || data.to) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-medium shrink-0 border border-border">
                                <Calendar className="h-3 w-3" />
                                {data.from || '...'} → {data.to || '...'}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('from', '');
                                        setData('to', '');
                                    }}
                                    className="p-0.5 hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs text-destructive font-medium hover:underline shrink-0 px-1 cursor-pointer"
                        >
                            {t('clear_all')}
                        </button>
                    </div>
                )}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:block">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative flex items-center gap-2 p-2 rounded-xl bg-card border border-border shadow-sm dark:shadow-none">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={placeholder || t('search_placeholder')}
                                value={data.search || ''}
                                onChange={(e) => setData('search', e.target.value)}
                                className="w-full h-11 pl-11 pr-8 text-sm font-medium bg-transparent border-0 focus:outline-hidden text-foreground placeholder:text-muted-foreground"
                            />
                            {data.search && (
                                <button
                                    type="button"
                                    onClick={() => setData('search', '')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {roles && roles.length > 0 && (
                                <Select
                                    value={String(data.role || '0')}
                                    onValueChange={(val) => setData('role', val === '0' ? '' : val)}
                                >
                                    <SelectTrigger className="h-10 w-auto min-w-[120px] rounded-lg border-border bg-surface-2 text-sm font-semibold px-3">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <SelectValue placeholder={t('role')} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg bg-card border-border">
                                        <SelectItem value="0">{t('all')}</SelectItem>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={r.name}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {isAdmin && teachers && teachers.length > 0 && (
                                <Select
                                    value={String(data.teacher_id || '0')}
                                    onValueChange={(val) => setData('teacher_id', val === '0' ? '' : val)}
                                >
                                    <SelectTrigger className="h-10 w-auto min-w-[130px] max-w-[180px] rounded-lg border-border bg-surface-2 text-sm font-semibold px-3">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <SelectValue placeholder={t('teacher')} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg bg-card border-border">
                                        <SelectItem value="0">{t('all')}</SelectItem>
                                        {teachers.map((tItem) => (
                                            <SelectItem key={tItem.id} value={String(tItem.id)}>
                                                {tItem.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {isAdmin && users && users.length > 0 && (
                                <Select
                                    value={String(data.user_id || '0')}
                                    onValueChange={(val) => setData('user_id', val === '0' ? '' : val)}
                                >
                                    <SelectTrigger className="h-10 w-auto min-w-[130px] max-w-[180px] rounded-lg border-border bg-surface-2 text-sm font-semibold px-3">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <SelectValue placeholder={t('user')} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg bg-card border-border">
                                        <SelectItem value="0">{t('all')}</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {tests && tests.length > 0 && (
                                <Select
                                    value={String(data.test_id || '0')}
                                    onValueChange={(val) => setData('test_id', val === '0' ? '' : val)}
                                >
                                    <SelectTrigger className="h-10 w-auto min-w-[130px] max-w-[180px] rounded-lg border-border bg-surface-2 text-sm font-semibold px-3">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <SelectValue placeholder={t('test')} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg bg-card border-border">
                                        <SelectItem value="0">{t('all')}</SelectItem>
                                        {tests.map((tItem) => (
                                            <SelectItem key={tItem.id} value={String(tItem.id)}>
                                                {tItem.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
                                className={`h-10 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                                    isDesktopExpanded || data.from || data.to ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                                }`}
                            >
                                <Filter className="h-4 w-4 mr-1.5" />
                                <span>{t('filters')}</span>
                                {isDesktopExpanded ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
                            </Button>

                            <Button
                                type="submit"
                                size="sm"
                                className="h-10 px-5 rounded-lg font-semibold text-sm"
                            >
                                {t('search')}
                            </Button>

                            {hasAnyActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-10 px-3 text-destructive hover:bg-destructive/10 rounded-lg text-sm cursor-pointer"
                                    title={t('clear_filters')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {isDesktopExpanded && (
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm dark:shadow-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-in fade-in duration-200">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" /> {t('date_range')}
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border bg-surface-2">
                                        <span className="text-xs font-semibold text-muted-foreground">{t('from_date')}</span>
                                        <input
                                            type="date"
                                            value={data.from || ''}
                                            onChange={(e) => setData('from', e.target.value)}
                                            className="h-8 px-2 text-xs font-medium rounded border border-border bg-card text-foreground focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border bg-surface-2">
                                        <span className="text-xs font-semibold text-muted-foreground">{t('to_date')}</span>
                                        <input
                                            type="date"
                                            value={data.to || ''}
                                            onChange={(e) => setData('to', e.target.value)}
                                            className="h-8 px-2 text-xs font-medium rounded border border-border bg-card text-foreground focus:outline-hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                    <ListOrdered className="h-4 w-4" /> {t('per_page')}
                                </label>
                                <Select value={String(data.per_page || '10')} onValueChange={(val) => setData('per_page', Number(val))}>
                                    <SelectTrigger className="h-10 rounded-lg border-border bg-surface-2 text-foreground text-sm font-semibold">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg bg-card border-border">
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
