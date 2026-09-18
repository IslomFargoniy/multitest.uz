import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, StarHalf, BookOpen, Users } from 'lucide-react';
import { Test } from '@/types';
import CreateAttemptModal from '@/components/mock/create-attempt-modal';

const Courses: React.FC = () => {
    const { t } = useTranslation();
    const [tests, setTests] = useState<Test[]>([]);

    useEffect(() => {
        fetch(route('landing-page-tests'))
            .then(res => res.json())
            .then(res => setTests(res.data ?? res))
            .catch(err => console.error('getTest error:', err));
    }, []);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStars = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStars;

        return (
            <>
                {Array.from({ length: fullStars }, (_, i) => (
                    <Star key={`full-${i}`} className="text-yellow-500 fill-yellow-500 w-5 h-5 inline-block" />
                ))}
                {halfStars > 0 && (
                    <StarHalf key="half" className="text-yellow-500 fill-yellow-500 w-5 h-5 inline-block" />
                )}
                {Array.from({ length: emptyStars }, (_, i) => (
                    <Star key={`empty-${i}`} className="text-gray-400 dark:text-gray-600 fill-gray-400 dark:fill-gray-600 w-5 h-5 inline-block" />
                ))}
            </>
        );
    };

    return (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 hide-scrollbar py-4 px-2">
            {tests.map((items: any) => (
                <div key={items.id} className="min-w-[320px] sm:min-w-[380px] snap-center flex-shrink-0">
                    <div className="bg-white dark:bg-gray-900 px-3 pt-3 pb-8 shadow-md dark:shadow-gray-800/50 rounded-2xl h-full border border-gray-100 dark:border-gray-800">
                        <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100">
                            <img
                                src={`/images/courses/coursethree.png`}
                                alt="course"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute right-4 -bottom-4">
                                <CreateAttemptModal test={items} />
                            </div>
                        </div>
                        <div className="px-3 pt-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[56px]">
                            {items.folder?.name ? `${items.folder.name} : ` : ''}{items.name}
                            </h3>

                            <div className="flex justify-between items-center py-5 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-1">{renderStars(5)}</div>
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('landing.free')}</h3>
                            </div>

                            <div className="flex justify-between pt-5">
                                <div className="flex gap-2 items-center text-primary">
                                    <BookOpen className="w-5 h-5" />
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">{items.types?.length || 0} {t('landing.steps')}</h3>
                                </div>
                                <div className="flex gap-2 items-center text-primary">
                                    <Users className="w-5 h-5" />
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">{items.attempts_count || 0} {t('landing.students')}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Courses;
