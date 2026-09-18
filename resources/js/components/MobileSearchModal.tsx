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
            <button onClick={() => setIsOpen(true)} className="rounded-md bg-blue-600 px-4 py-1 text-white lg:hidden">
                {t('mobile_search.open_button')}
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black lg:hidden">
                    <div className="relative max-h-[90vh] w-11/12 overflow-y-auto rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 text-gray-700 hover:text-red-600 dark:text-white"
                            aria-label={t('navigation.close')}
                        >
                            <X size={24} />
                        </button>

                        <h1 className={'mb-3 text-center text-2xl font-bold dark:text-white'}>{t('mobile_search.filter_title')}</h1>

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
