import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const FAQSection: React.FC = () => {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: t('landing_faq.q1', 'Multitest.uz orqali bepul mock test topshirsam bo\'ladimi?'),
            a: t('landing_faq.a1', 'Ha! Platformamizda ro\'yxatdan o\'tib, ochiq va bepul CEFR hamda IELTS Speaking mock testlaridan to\'g\'ridan-to\'g\'ri foydalanishingiz mumkin.'),
        },
        {
            q: t('landing_faq.q2', 'AI baholash tizimi natijalari real UzBMB (DTM) imtihoniga qanchalik yaqin?'),
            a: t('landing_faq.a2', 'Bizning AI modelimiz UzBMB va CEFR rasmiy rubrikalari asosida minglab imtihon topshiruvchilar audiosi bilan kalibrlangan. O\'rtacha aniqlik darajasi 95% dan yuqori.'),
        },
        {
            q: t('landing_faq.q3', 'Speaking testida Part 1, Part 2 va Part 3 qanday o\'tadi?'),
            a: t('landing_faq.a3', 'Xuddi real imtihondagi kabi: Part 1 da savol beriladi va darhol javob berasiz; Part 2 da savol va rasm chiqadi, 1 daqiqa o\'ylash uchun vaqt beriladi, so\'ng 2 daqiqa gapirasiz; Part 3 da esa munozara savollariga batafsil javob berasiz.'),
        },
        {
            q: t('landing_faq.q4', 'Natija va tahlillarni qachon olaman?'),
            a: t('landing_faq.a4', 'Ovozli yozuvlaringiz serverga yetib borgach, AI modelimiz 60-90 soniya ichida har bir qism bo\'yicha baholarni va tavsiyalarni hisoblab beradi.'),
        },
        {
            q: t('landing_faq.q5', 'Telegram bot orqali kirish mumkinmi?'),
            a: t('landing_faq.a5', 'Albatta! @MultitestUzBot orqali botga kirib /start bosing yoki veb-saytda Telegram orqali avtorizatsiyadan o\'ting.'),
        },
    ];

    return (
        <section id="faq" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300 mb-4">
                        <Icon icon="solar:question-circle-bold" className="text-sm" />
                        <span>{t('landing_faq.badge', 'Savollaringiz Bormi?')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('landing_faq.title', 'Ko\'p Beriladigan Savollar (FAQ)')}
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300">
                        {t('landing_faq.subtitle', 'CEFR Multi-level imtihonlari va platformamiz imkoniyatlari haqida barcha muhim ma\'lumotlar')}
                    </p>
                </div>

                {/* FAQ Accordion List */}
                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                                    isOpen
                                        ? 'border-indigo-300 bg-white shadow-md dark:border-indigo-700 dark:bg-slate-900'
                                        : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="flex w-full items-center justify-between p-5 text-left transition-colors"
                                >
                                    <span className="text-base font-bold text-slate-900 dark:text-white pr-4">
                                        {faq.q}
                                    </span>
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        <Icon icon="solar:alt-arrow-down-bold" className="text-base" />
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
