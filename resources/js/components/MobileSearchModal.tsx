import SearchForm from '@/components/search-form';
import { Role, SearchData } from '@/types';
import { SlidersHorizontal, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    data: SearchData;
    setData: <K extends keyof SearchData>(key: K, value: SearchData[K]) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    roles?: Role[];
}

const MobileSearchModal = ({ data, setData, handleSubmit, roles }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            {/* Button to open modal - only visible on mobile */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-xs backdrop-blur-xs transition-all active:scale-95 hover:bg-indigo-100/80 dark:border-indigo-800/40 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/40 lg:hidden"
            >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>{t('mobile_search.open_button') || 'Filter'}</span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
                    <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                    <SlidersHorizontal className="h-4 w-4" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    {t('mobile_search.filter_title') || 'Filtrlar'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                aria-label={t('navigation.close')}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Search form instance */}
                        <SearchForm
                            handleSubmit={(e) => {
                                handleSubmit(e);
                                setIsOpen(false); // Close modal after submit
                            }}
                            data={data}
                            setData={setData}
                            roles={roles}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileSearchModal;

