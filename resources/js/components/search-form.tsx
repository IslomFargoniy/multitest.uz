import { Role, SearchData } from '@/types';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { ChangeEvent, FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';

interface SearchFormProps {
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    setData: <K extends keyof SearchData>(key: K, value: SearchData[K]) => void;
    data: SearchData;
    roles?: Role[];
}

const SearchForm = ({ handleSubmit, setData, data, roles }: SearchFormProps) => {
    const { t } = useTranslation();

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setData('search', e.target.value);
    };

    const handleMonth = (e: ChangeEvent<HTMLInputElement>) => {
        setData('month', e.target.value);
    };

    const handlePerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setData('per_page', parseInt(e.target.value, 10));
        setData('page', 1);

        const form = e.target.closest('form');
        if (form) {
            queueMicrotask(() => form.requestSubmit());
        }
    };

    const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setData('role', e.target.value);

        const form = e.target.closest('form');
        if (form) {
            queueMicrotask(() => form.requestSubmit());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full lg:w-auto">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={data.search}
                        onChange={handleSearch}
                        className="h-10 w-full rounded-xl border border-border bg-secondary pl-10 pr-4 text-sm font-medium text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        placeholder={t('search_form.search')}
                    />
                </div>

                {/* Per Page Select */}
                {typeof data.total === 'number' && (
                    <select
                        value={data.per_page}
                        onChange={handlePerPageChange}
                        className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={data.total}>{t('search_form.pagination_option_all')}</option>
                    </select>
                )}

                {/* Date Filters Container */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* From Date */}
                    {typeof data.from === 'string' && (
                        <DatePicker
                            id="from-date"
                            placeholderText={t('search_form.from')}
                            value={data.from}
                            onChange={(from) => {
                                setData('from', from ? format(from, 'yyyy-MM-dd') : '');
                            }}
                            className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:w-32"
                        />
                    )}

                    {/* To Date */}
                    {typeof data.to === 'string' && (
                        <DatePicker
                            id="to-date"
                            placeholderText={t('search_form.to')}
                            value={data.to}
                            onChange={(to) => {
                                setData('to', to ? format(to, 'yyyy-MM-dd') : '');
                            }}
                            className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:w-32"
                        />
                    )}
                </div>

                {/* Month Picker */}
                {typeof data.month === 'string' && (
                    <input
                        type="month"
                        value={data.month}
                        max={format(new Date(), 'yyyy-MM')}
                        onChange={handleMonth}
                        className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                )}

                {/* Specific Date Picker */}
                {typeof data.date === 'string' && (
                    <DatePicker
                        id="date"
                        placeholderText={t('search_form.date')}
                        value={data.date}
                        onChange={(date) => {
                            setData('date', date ? format(date, 'yyyy-MM-dd') : '');
                        }}
                        className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                )}

                {/* Role Filter */}
                {roles && (
                    <select
                        value={data.role || ''}
                        onChange={handleRoleChange}
                        className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                        <option value="0">{t('search_form.role')}</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.name}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-95"
                >
                    <Search className="h-4 w-4" />
                    <span className="lg:hidden">{t('search_form.search_button')}</span>
                </button>
            </div>
        </form>
    );
};

export default SearchForm;
