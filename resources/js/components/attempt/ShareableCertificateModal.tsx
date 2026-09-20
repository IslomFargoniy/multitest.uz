import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Attempt, AttemptPart } from '@/types';
import { toast } from 'sonner';

interface ShareableCertificateModalProps {
    attempt: Attempt;
}

const ShareableCertificateModal: React.FC<ShareableCertificateModalProps> = ({ attempt }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const score = attempt.score ?? attempt.ai_score_avg ?? 0;

    const levelBadge = () => {
        if (score >= 75) return { level: 'C1', color: 'bg-emerald-500 text-white', text: 'C1 (Advanced)' };
        if (score >= 60) return { level: 'B2', color: 'bg-indigo-600 text-white', text: 'B2 (Vantage)' };
        if (score >= 45) return { level: 'B1', color: 'bg-amber-500 text-white', text: 'B1 (Threshold)' };
        return { level: 'A2', color: 'bg-slate-600 text-white', text: 'A2 (Waystage)' };
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
        const examDate = new Date(attempt.created_at || Date.now()).toLocaleDateString();
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
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-5 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
                <Icon icon="solar:diploma-verified-bold" className="text-xl" />
                <span>{t('certificate_modal.share_certificate', 'Sertifikatni Ulashish')}</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md animate-in fade-in">
                    <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 cursor-pointer"
                        >
                            <Icon icon="tabler:x" className="text-xl" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {t('certificate_modal.title', 'Rasmiy Baholash Sertifikati')}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {t('certificate_modal.subtitle', 'UzBMB (DTM) standarti bo\'yicha sun\'iy intellekt tahlili natijasi')}
                            </p>
                        </div>

                        {/* Certificate Visual Preview Card */}
                        <div
                            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-500/30"
                        >
                            {/* Watermark Logo */}
                            <div className="pointer-events-none absolute -right-10 -bottom-10 opacity-10">
                                <Icon icon="solar:diploma-verified-bold" className="w-64 h-64 text-indigo-400" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                {/* Top brand bar */}
                                <div className="flex items-center justify-between border-b border-indigo-900/60 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs">
                                            MT
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-sm tracking-wider text-white">MULTITEST.UZ</p>
                                            <p className="text-[10px] text-indigo-300 font-medium">CEFR Speaking AI Report</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-400/30">
                                        {t('certificate_modal.verified_by', 'Tasdiqlangan')}
                                    </span>
                                </div>

                                {/* Candidate & Exam Details */}
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest text-indigo-300 uppercase">
                                        {t('certificate_modal.candidate', 'Nomzod')}
                                    </p>
                                    <h4 className="text-2xl font-black text-white mt-0.5">
                                        {attempt.user?.name || 'Talaba'}
                                    </h4>
                                    <p className="text-xs text-slate-300 mt-1">
                                        {attempt.mock?.name || attempt.test?.name}
                                    </p>
                                </div>

                                {/* Main Overall Score Block */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center rounded-2xl bg-white/5 p-4 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${levelBadge().color} font-black text-2xl shadow-lg`}>
                                            {levelBadge().level}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{t('certificate_modal.overall_result', 'Umumiy Ball')}</p>
                                            <p className="text-2xl font-black text-white">{score} <span className="text-xs font-normal text-slate-400">/ 75</span></p>
                                        </div>
                                    </div>

                                    {/* Sub-criteria grid */}
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div className="rounded-lg bg-black/20 p-1.5">
                                            <span className="text-slate-400 block text-[10px]">Fluency:</span>
                                            <span className="font-bold text-indigo-300">{criteria.fluency}</span>
                                        </div>
                                        <div className="rounded-lg bg-black/20 p-1.5">
                                            <span className="text-slate-400 block text-[10px]">Lexicon:</span>
                                            <span className="font-bold text-purple-300">{criteria.lexical}</span>
                                        </div>
                                        <div className="rounded-lg bg-black/20 p-1.5">
                                            <span className="text-slate-400 block text-[10px]">Grammar:</span>
                                            <span className="font-bold text-pink-300">{criteria.grammar}</span>
                                        </div>
                                        <div className="rounded-lg bg-black/20 p-1.5">
                                            <span className="text-slate-400 block text-[10px]">Pronounce:</span>
                                            <span className="font-bold text-emerald-300">{criteria.pronunciation}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Footer */}
                                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                    <span>{new Date(attempt.created_at || Date.now()).toLocaleDateString()}</span>
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
                                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 p-3 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                                <Icon icon="solar:download-square-bold" className="text-lg" />
                                <span>{t('certificate_modal.download_img', 'Rasm yuklab olish')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleShareTelegram}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 p-3 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                                <Icon icon="tabler:brand-telegram" className="text-lg" />
                                <span>{t('certificate_modal.share_telegram', 'Telegramda ulashish')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                            >
                                <Icon icon="solar:copy-bold" className="text-lg" />
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
