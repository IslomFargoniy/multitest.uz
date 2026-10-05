import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Attempt, AttemptPart } from '@/types';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/date';

interface ShareableCertificateModalProps {
    attempt: Attempt;
    trigger?: React.ReactNode;
}

const ShareableCertificateModal: React.FC<ShareableCertificateModalProps> = ({ attempt, trigger }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const score = attempt.score ?? attempt.ai_score_avg ?? 0;

    const levelBadge = () => {
        if (score >= 65) return { level: 'C1', color: 'bg-emerald-600 text-white', text: 'C1 (Advanced / 65-75)' };
        if (score >= 51) return { level: 'B2', color: 'bg-primary text-primary-foreground', text: 'B2 (Vantage / 51-64)' };
        if (score >= 38) return { level: 'B1', color: 'bg-amber-600 text-white', text: 'B1 (Threshold / 38-50)' };
        return { level: 'A2', color: 'bg-secondary text-foreground', text: 'A2 (Below B1 / <38)' };
    };

    // Calculate sub-criteria averages if available in attempt_parts
    const criteriaScores = () => {
        let fluency = 0, lexical = 0, grammar = 0, pronunciation = 0, count = 0;
        attempt.attempt_parts?.forEach((p: AttemptPart) => {
            if (p.ai_fluency_score) fluency += Number(p.ai_fluency_score);
            if (p.ai_lexical_score) lexical += Number(p.ai_lexical_score);
            if (p.ai_grammar_score) grammar += Number(p.ai_grammar_score);
            if (p.ai_pronunciation_score) pronunciation += Number(p.ai_pronunciation_score);
            if (p.ai_fluency_score) count++;
        });

        if (count > 0) {
            return {
                fluency: Math.round(fluency / count),
                lexical: Math.round(lexical / count),
                grammar: Math.round(grammar / count),
                pronunciation: Math.round(pronunciation / count),
            };
        }

        // Default proportional estimate based on overall score
        return {
            fluency: Math.min(75, Math.round(score * 1.02)),
            lexical: Math.min(75, Math.round(score * 0.96)),
            grammar: Math.min(75, Math.round(score * 0.98)),
            pronunciation: Math.min(75, Math.round(score * 1.04)),
        };
    };

    const criteria = criteriaScores();

    const handleShareTelegram = () => {
        const shareUrl = window.location.href;
        const text = `🎯 Men Multitest.uz da CEFR Speaking sinovida ${levelBadge().level} (${score} ball) to'pladim! Siz ham darajangizni tekshirib ko'ring:`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success(t('certificate_modal.copied_link', 'Havola nusxalandi!'));
    };

    const handleDownloadCanvas = () => {
        setIsGenerating(true);
        // Create canvas image
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 700;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setIsGenerating(false);
            return;
        }

        // Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 1200, 700);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 700);

        // Border
        ctx.strokeStyle = '#4338ca';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, 1160, 660);

        // Header Title
        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('MULTITEST.UZ — CEFR SPEAKING AI ASSESSMENT', 60, 80);

        // Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.fillText('Official UzBMB / DTM Format Verification Report', 60, 115);

        // Candidate Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px sans-serif';
        const candidateName = attempt.user?.name || 'Candidate';
        ctx.fillText(candidateName, 60, 190);

        // Test Name
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '22px sans-serif';
        const testName = attempt.mock?.name || attempt.test?.name || 'CEFR Speaking Mock';
        ctx.fillText(testName, 60, 230);

        // Score Badge Box
        ctx.fillStyle = '#312e81';
        ctx.fillRect(60, 280, 480, 140);
        ctx.strokeStyle = '#6366f1';
        ctx.strokeRect(60, 280, 480, 140);

        ctx.fillStyle = '#e0e7ff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('OVERALL CEFR RESULT', 90, 325);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px sans-serif';
        ctx.fillText(`${levelBadge().level}  (${score} / 75)`, 90, 390);

        // Criteria List
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('Sub-skills Breakdown:', 600, 290);

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`• Fluency & Coherence:  ${criteria.fluency} / 75`, 600, 335);
        ctx.fillText(`• Lexical Resource:  ${criteria.lexical} / 75`, 600, 375);
        ctx.fillText(`• Grammatical Accuracy:  ${criteria.grammar} / 75`, 600, 415);
        ctx.fillText(`• Pronunciation:  ${criteria.pronunciation} / 75`, 600, 455);

        // Date & Verification footer
        const examDate = formatDateTime(attempt.created_at || Date.now());
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Date: ${examDate}  •  Verified at: multitest.uz`, 60, 630);

        // Download link
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `multitest-certificate-${attempt.id}.png`;
        link.href = dataUrl;
        link.click();
        setIsGenerating(false);
        toast.success(t('certificate_modal.download_img', 'Sertifikat yuklab olindi!'));
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-border-strong bg-transparent hover:bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground transition-colors cursor-pointer"
                >
                    <Icon icon="solar:diploma-verified-bold" className="text-lg" />
                    <span>{t('certificate_modal.share_certificate', 'Sertifikatni Ulashish')}</span>
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
                    <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-card p-6 shadow-sm dark:shadow-none border border-border">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <Icon icon="tabler:x" className="text-lg" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-[18px] font-bold text-foreground">
                                {t('certificate_modal.title', 'Rasmiy Baholash Sertifikati')}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('certificate_modal.subtitle', "UzBMB (DTM) standarti bo'yicha sun'iy intellekt tahlili natijasi")}
                            </p>
                        </div>

                        {/* Certificate Visual Preview Card */}
                        <div
                            className="relative overflow-hidden rounded-xl bg-surface-sunken p-6 text-foreground border border-border-strong"
                        >
                            <div className="relative z-10 space-y-4">
                                {/* Top brand bar */}
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                                            MT
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight text-foreground">MULTITEST.UZ</p>
                                            <p className="text-xs text-muted-foreground">CEFR Speaking AI Report</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground border border-border">
                                        {t('certificate_modal.verified_by', 'Tasdiqlangan')}
                                    </span>
                                </div>

                                {/* Candidate & Exam Details */}
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        {t('certificate_modal.candidate', 'Nomzod')}
                                    </p>
                                    <h4 className="text-xl font-bold text-foreground mt-0.5">
                                        {attempt.user?.name || 'Talaba'}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {attempt.mock?.name || attempt.test?.name}
                                    </p>
                                </div>

                                {/* Main Overall Score Block */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center rounded-lg bg-card p-4 border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${levelBadge().color} font-bold text-xl`}>
                                            {levelBadge().level}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">{t('certificate_modal.overall_result', 'Umumiy Ball')}</p>
                                            <p className="text-xl font-bold text-foreground font-display">{score} <span className="text-xs font-normal text-muted-foreground">/ 75</span></p>
                                        </div>
                                    </div>

                                    {/* Sub-criteria grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="rounded-md bg-secondary p-1.5">
                                            <span className="text-muted-foreground block text-xs">Fluency:</span>
                                            <span className="font-semibold text-foreground font-display">{criteria.fluency}</span>
                                        </div>
                                        <div className="rounded-md bg-secondary p-1.5">
                                            <span className="text-muted-foreground block text-xs">Lexicon:</span>
                                            <span className="font-semibold text-foreground font-display">{criteria.lexical}</span>
                                        </div>
                                        <div className="rounded-md bg-secondary p-1.5">
                                            <span className="text-muted-foreground block text-xs">Grammar:</span>
                                            <span className="font-semibold text-foreground font-display">{criteria.grammar}</span>
                                        </div>
                                        <div className="rounded-md bg-secondary p-1.5">
                                            <span className="text-muted-foreground block text-xs">Pronounce:</span>
                                            <span className="font-semibold text-foreground font-display">{criteria.pronunciation}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Footer */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 font-mono tabular-nums">
                                    <span>{formatDateTime(attempt.created_at || Date.now())}</span>
                                    <span>multitest.uz/attempt/{attempt.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={handleDownloadCanvas}
                                disabled={isGenerating}
                                className="flex items-center justify-center gap-2 rounded-[10px] bg-primary hover:bg-primary/90 p-2.5 text-xs font-semibold text-primary-foreground transition-colors cursor-pointer"
                            >
                                <Icon icon="solar:download-square-bold" className="text-base" />
                                <span>{t('certificate_modal.download_img', 'Rasm yuklab olish')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleShareTelegram}
                                className="flex items-center justify-center gap-2 rounded-[10px] bg-surface-2 border border-border-strong hover:bg-secondary p-2.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                            >
                                <Icon icon="tabler:brand-telegram" className="text-base" />
                                <span>{t('certificate_modal.share_telegram', 'Telegramda ulashish')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="flex items-center justify-center gap-2 rounded-[10px] border border-border-strong bg-transparent hover:bg-surface-2 p-2.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                            >
                                <Icon icon="solar:copy-bold" className="text-base" />
                                <span>Havolani nusxalash</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShareableCertificateModal;
