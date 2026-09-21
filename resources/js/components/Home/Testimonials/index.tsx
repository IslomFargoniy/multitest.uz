import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const Testimonial: React.FC = () => {
    const { t } = useTranslation();

    const testimonialData = [
        {
            initials: 'AB',
            bg: 'from-blue-600 to-indigo-600',
            name: 'Azizbek Rahimov',
            scoreBadge: 'CEFR C1 (71 ball)',
            comment: t('testimonials.comment_1') || "Multitest.uz simulyatori orqali 2 hafta ichida Speaking darajamni B2 dan C1 ga ko'tardim. AI baholash va tavsiyalar imtihonda 100% o'zini oqladi!",
            rating: 5,
        },
        {
            initials: 'MY',
            bg: 'from-purple-600 to-pink-600',
            name: 'Malika Yoqubova',
            scoreBadge: 'CEFR B2 (58 ball)',
            comment: t('testimonials.comment_2') || "Part 2 dagi rasmli topshiriqlar va vaqt me'yori xuddi haqiqiy UzBMB testidek. Natijani 1 daqiqada olish juda qulay.",
            rating: 5,
        },
        {
            initials: 'DU',
            bg: 'from-emerald-600 to-teal-600',
            name: 'Dilshod Umarov',
            scoreBadge: 'IELTS Speaking 7.5',
            comment: t('testimonials.comment_3') || "Grammatik va leksik xatolar tahlili aynan qayerda xato qilayotganimni ko'rsatib berdi. O'qituvchisiz tayyorlanish uchun zo'r vosita.",
            rating: 5,
        },
    ];

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStars = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStars;

        return (
            <div className="flex gap-1">
                {Array(fullStars)
                    .fill(0)
                    .map((_, i) => (
                        <Star key={`full-${i}`} className="text-yellow-500 fill-yellow-500 w-4 h-4" />
                    ))}
                {halfStars > 0 && <StarHalf className="text-yellow-500 fill-yellow-500 w-4 h-4" />}
                {Array(emptyStars)
                    .fill(0)
                    .map((_, i) => (
                        <Star key={`empty-${i}`} className="text-slate-300 dark:text-slate-700 fill-slate-300 dark:fill-slate-700 w-4 h-4" />
                    ))}
            </div>
        );
    };

    return (
        <section id="testimonial" className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300 mb-4">
                        <Icon icon="solar:chat-round-like-bold" className="text-sm" />
                        <span>Fikrlar va Natijalar</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('testimonials.title') || 'O\'quvchilarimiz Nima Deydi?'}
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300">
                        Multitest.uz yordamida orzusidagi CEFR B2/C1 yoki IELTS balliga erishgan nomzodlar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonialData.map((item, i) => (
                        <div
                            key={i}
                            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.bg} text-white font-black text-sm shadow-md`}
                                        >
                                            {item.initials}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                {item.scoreBadge}
                                            </p>
                                        </div>
                                    </div>
                                    {renderStars(item.rating)}
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
                                    "{item.comment}"
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <Icon icon="solar:verified-check-bold" className="text-sm" />
                                <span>Tasdiqlangan natija</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonial;
