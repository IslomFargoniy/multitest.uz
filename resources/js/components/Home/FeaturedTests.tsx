import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Test } from '@/types';
import CreateAttemptModal from '@/components/mock/create-attempt-modal';
import { Link } from '@inertiajs/react';

const FeaturedTests: React.FC = () => {
    const { t } = useTranslation();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let endpoint = '/landing-page-tests';
        try {
            if (typeof route === 'function' && route().has('landing-page-tests')) {
                endpoint = route('landing-page-tests');
            }
        } catch (_) {
            endpoint = '/landing-page-tests';
        }

        fetch(endpoint)
            .then((res) => res.json())
            .then((res) => {
                setTests(res.data ?? res ?? []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('getTest error:', err);
                setLoading(false);
            });
    }, []);

    return (
        <section id="featured-tests" className="py-16 md:py-24 bg-surface-2/40 border-y border-border">
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
                            <Icon icon="solar:fire-bold" className="text-sm text-warning" />
                            <span>Ommabop Mock Testlar</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                            Haqiqiy Imtihon Testlari
                        </h2>
                        <p className="mt-2 text-muted-foreground text-base">
                            UzBMB va IELTS Speaking bo'yicha eng ko'p topshirilayotgan mock namunalar
                        </p>
                    </div>

                    <Link
                        href="/test"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors group"
                    >
                        <span>Barcha testlarni ko'rish</span>
                        <Icon icon="solar:arrow-right-bold" className="text-lg transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Loading Skeleton or Tests Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 rounded-2xl bg-secondary animate-pulse" />
                        ))}
                    </div>
                ) : tests.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-2xl border border-border">
                        <Icon icon="solar:folder-open-bold" className="text-4xl text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">Testlar tez orada yuklanadi</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tests.slice(0, 6).map((item: any) => (
                            <div
                                key={item.id}
                                className="group relative rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-border-strong transition-colors flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Metadata */}
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <span className="rounded-full bg-secondary border border-border px-3 py-1 text-xs font-semibold text-foreground">
                                            {item.folder?.name || 'CEFR Multi-level'}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs font-semibold text-success-text bg-success-bg border border-success/20 px-2.5 py-0.5 rounded-full">
                                            <Icon icon="solar:check-read-bold" className="text-sm" />
                                            {t('landing.free', 'Bepul')}
                                        </span>
                                    </div>

                                    {/* Test Name */}
                                    <h3 className="text-base font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                        {item.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-6">
                                        {item.description || 'Rasmiy UzBMB formati bo\'yicha Speaking ko\'nikmalarini AI bilan tekshirish.'}
                                    </p>
                                </div>

                                <div>
                                    {/* Stats bar */}
                                    <div className="flex items-center justify-between border-t border-border pt-4 mb-5 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Icon icon="solar:layers-bold" className="text-primary text-sm" />
                                            <span>{item.types?.length || 3} qism</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Icon icon="solar:users-group-rounded-bold" className="text-primary text-sm" />
                                            <span>{item.attempts_count || 120}+ topshiruvchi</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-warning font-semibold">
                                            <Icon icon="solar:star-bold" className="text-sm" />
                                            <span>5.0</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="w-full">
                                        <CreateAttemptModal test={item} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedTests;
