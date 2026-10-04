// components/MobileSearchModal.tsx
import SearchForm from '@/components/search-form';
import { Role, SearchData } from '@/types';
import { X } from 'lucide-react';
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
            <button onClick={() => setIsOpen(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground lg:hidden">
                {t('mobile_search.open_button')}
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 lg:hidden">
                    <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card border border-border p-6 shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                            aria-label={t('navigation.close')}
                        >
                            <X size={20} />
                        </button>

                        <h2 className="mb-4 text-center text-xl font-bold text-foreground">{t('mobile_search.filter_title')}</h2>

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
