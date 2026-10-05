import { NoticeBanner } from '@/components/design/NoticeBanner';
import CircularTimer from '@/components/practice/CircularTimer';
import StepTabs from '@/components/practice/StepTabs';
import SafeHtml from '@/components/safe-html';
import { useHaptic, useTelegramBackButton } from '@/components/telegram-theme-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AttemptPart, Part, Question } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, Check, CloudUpload, Maximize, Minimize, ShieldAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const RETRY_DELAYS_MS = [1000, 3000, 9000];
const VIOLATION_DEBOUNCE_MS = 2000;
const RECORDER_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

interface RecordedAnswer {
    question_id: number;
    started_at: string;
    finished_at: string;
    audio: Blob;
    ext: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const csrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content || '';

/** POST with retries on network errors, 5xx, 408, 419 and 429. Returns the last response, or null if the network never worked. */
async function postWithRetry(url: string, buildBody: () => FormData): Promise<Response | null> {
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: buildBody(),
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            const retryable = response.status >= 500 || [408, 419, 429].includes(response.status);
            if (response.ok || !retryable) return response;
        } catch {
            // network error: retry below
        }

        if (attempt < RETRY_DELAYS_MS.length) await sleep(RETRY_DELAYS_MS[attempt]);
    }

    return null;
}

function pickRecorderMime(): string | undefined {
    return RECORDER_MIME_CANDIDATES.find((type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type));
}

function extensionFor(mime: string): string {
    if (mime.includes('webm')) return 'webm';
    if (mime.includes('mp4')) return 'm4a';
    if (mime.includes('ogg')) return 'ogg';
    return 'webm';
}

export default function QuestionPlayer({ attempt_part }: { attempt_part: AttemptPart }) {
    const { t } = useTranslation();
    const part = attempt_part.part as Part;
    const questions: Question[] = part.questions ?? [];

    const [index, setIndex] = useState(-1);
    const [phase, setPhase] = useState<'introduction' | 'audio' | 'ready' | 'recording' | 'uploading'>('introduction');
    const [timer, setTimer] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [uploadError, setUploadError] = useState(false);

    const { impact, selection, notification } = useHaptic();

    const requestingMicRef = useRef(false);
    const lastViolationRef = useRef(0);

    // Anti-Cheat: count a real tab switch once (visibilitychange only), debounced, never while the mic prompt is open.
    useEffect(() => {
        const attemptId = attempt_part.attempt_id || attempt_part.attempt?.id;

        const handleVisibilityChange = () => {
            if (!document.hidden || phase === 'uploading' || phase === 'introduction' || requestingMicRef.current) return;

            const now = Date.now();
            if (now - lastViolationRef.current < VIOLATION_DEBOUNCE_MS) return;
            lastViolationRef.current = now;

            setTabSwitchCount((prev) => prev + 1);
            setShowViolationModal(true);
            if (attemptId) {
                axios.post(route('practice-attempt-violation', attemptId)).catch(() => {});
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [attempt_part, phase]);

    const handleExit = () => {
        if (confirm(t('question_player.exit_confirm', 'Haqiqatan ham testdan chiqmoqchimisiz? Natijalaringiz saqlanmasligi mumkin.'))) {
            router.visit('/dashboard');
        }
    };

    // Show native BackButton to exit test with confirmation
    useTelegramBackButton(phase !== 'uploading', handleExit);

    const playerRef = useRef<HTMLDivElement>(null);

    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<string>('');
    const uploadsRef = useRef<Map<number, Promise<boolean>>>(new Map());
    const failedAnswersRef = useRef<Map<number, RecordedAnswer>>(new Map());

    useEffect(() => {
        setIndex(-1);
        setPhase('introduction');
        uploadsRef.current = new Map();
        failedAnswersRef.current = new Map();
        return () => stopAllMedia();
    }, [attempt_part.id]);

    /** Stops the recorder only; the microphone stream stays open for the next question of the part. */
    const stopRecorder = () => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
        }
    };

    const stopAllMedia = () => {
        stopRecorder();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    /** The microphone is requested once per part and reused for every question. */
    const ensureStream = async (): Promise<MediaStream> => {
        const existing = streamRef.current;
        if (existing && existing.getAudioTracks().some((track) => track.readyState === 'live')) return existing;

        requestingMicRef.current = true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            return stream;
        } finally {
            // Give the browser a moment to restore focus before tab-switch detection is active again.
            setTimeout(() => (requestingMicRef.current = false), 1000);
        }
    };

    const question = index >= 0 ? questions[index] : null;

    /* Phase 0: Part Introduction */
    useEffect(() => {
        if (phase !== 'introduction') return;
        const audioPath = part.audio_path;
        if (!audioPath) {
            setIndex(0);
            setPhase('audio');
            return;
        }
        const introAudio = new Audio(audioPath);
        introAudio.play().catch(() => {
            setIndex(0);
            setPhase('audio');
        });
        introAudio.onended = () => {
            setIndex(0);
            setPhase('audio');
        };
        return () => {
            introAudio.pause();
            introAudio.src = '';
        };
    }, [phase, attempt_part.id]);

    /* Phase 1: Question Audio */
    useEffect(() => {
        if (phase !== 'audio' || !question) return;
        const readySec = Number(question.ready_second);
        const audioPath = question.audio_path;
        if (!audioPath) {
            setPhase('ready');
            setTimer(readySec);
            setTotalTime(readySec);
            return;
        }
        const audio = new Audio(audioPath);
        audio.play().catch(() => {
            setPhase('ready');
            setTimer(readySec);
            setTotalTime(readySec);
        });
        audio.onended = () => {
            setPhase('ready');
            setTimer(readySec);
            setTotalTime(readySec);
        };
        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [phase, index]);

    /* Phase 2 & 3: Timer Logic */
    useEffect(() => {
        if ((phase !== 'ready' && phase !== 'recording') || !question) return;
        if (timer <= 0) {
            if (phase === 'ready') {
                handleTransitionToRecording();
            } else if (phase === 'recording') {
                if (recorderRef.current && recorderRef.current.state === 'recording') {
                    recorderRef.current.stop();
                }
            }
            return;
        }
        const i = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(i);
    }, [phase, timer]);

    const handleTransitionToRecording = () => {
        const startSound = new Audio('/audio/begin-audio.m4a');
        startSound
            .play()
            .then(() => {
                startSound.onended = () => startRecording();
            })
            .catch(() => startRecording());
    };

    const startRecording = async () => {
        if (!question) return;
        try {
            const stream = await ensureStream();

            const mimeType = pickRecorderMime();
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            recorderRef.current = recorder;
            chunksRef.current = [];
            recordingStartTimeRef.current = new Date().toISOString();
            const recordedQuestionId = question.id;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const type = recorder.mimeType || mimeType || 'audio/webm';
                const answer: RecordedAnswer = {
                    question_id: recordedQuestionId,
                    started_at: recordingStartTimeRef.current,
                    finished_at: new Date().toISOString(),
                    audio: new Blob(chunksRef.current, { type }),
                    ext: extensionFor(type),
                };

                chunksRef.current = [];
                goNext(answer);
            };

            recorder.start();
            impact('medium');
            setPhase('recording');
            setTimer(Number(question.answer_second));
            setTotalTime(Number(question.answer_second));
        } catch {
            alert(t('question_player.mic_error'));
        }
    };

    const saveUrl = route('practice.save_answers', attempt_part.id);

    /** Uploads one recorded answer in the background (with retries); finalize() waits for all of them. */
    const startAnswerUpload = (answer: RecordedAnswer) => {
        const promise = postWithRetry(saveUrl, () => {
            const form = new FormData();
            form.append('answers[0][question_id]', String(answer.question_id));
            form.append('answers[0][started_at]', answer.started_at);
            form.append('answers[0][finished_at]', answer.finished_at);
            form.append('answers[0][audio_path]', answer.audio, `q_${answer.question_id}.${answer.ext}`);
            return form;
        }).then((response) => {
            const ok = !!response?.ok;
            if (ok) failedAnswersRef.current.delete(answer.question_id);
            else failedAnswersRef.current.set(answer.question_id, answer);
            return ok;
        });

        uploadsRef.current.set(answer.question_id, promise);
    };

    const goNext = (answer: RecordedAnswer) => {
        startAnswerUpload(answer);
        selection();

        if (index + 1 < questions.length) {
            setIndex((i) => i + 1);
            setPhase('audio');
        } else {
            stopAllMedia();
            void finalize();
        }
    };

    /** Waits for every answer upload, then closes the part. Navigation happens only after everything was saved. */
    const finalize = async () => {
        setPhase('uploading');
        setUploadError(false);

        // Re-send answers whose upload failed earlier (user pressed "retry").
        failedAnswersRef.current.forEach((answer) => startAnswerUpload(answer));
        await Promise.all(Array.from(uploadsRef.current.values()));

        if (failedAnswersRef.current.size > 0) {
            setUploadError(true);
            return;
        }

        const next = attempt_part.attempt?.attempt_parts?.find((p) => p.id > attempt_part.id);
        const response = await postWithRetry(saveUrl, () => {
            const form = new FormData();
            if (next) form.append('next_attempt_part_id', String(next.id));
            else form.append('finish', '1');
            return form;
        });

        if (!response?.ok) {
            setUploadError(true);
            return;
        }

        notification('success');
        const data = await response.json().catch(() => ({}));
        if (data.redirect) router.visit(data.redirect);
        else if (next) router.visit(route('practice.show', next.id));
        else router.visit(route('attempt.show', attempt_part.attempt_id));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div
            ref={playerRef}
            onContextMenu={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            className="bg-background text-foreground flex min-h-dvh w-full flex-col select-none"
        >
            {/* Anti-Cheat Violation Warning Modal Overlay */}
            {showViolationModal && (
                <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="border-border bg-card w-full max-w-md space-y-4 rounded-2xl border p-6 text-center shadow-sm dark:shadow-none">
                        <div className="bg-destructive/10 text-destructive mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-foreground text-[18px] font-bold">
                                {t('question_player.violation_title', 'Qoidabuzarlik qayd etildi')}
                            </h3>
                            <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                                {t(
                                    'question_player.violation_desc',
                                    "Imtihon davomida boshqa oynaga (tab) o'tish yoki ilovani yashirish taqiqlanadi. Har bir holat tizim tomonidan qayd etilmoqda.",
                                )}
                            </p>
                        </div>
                        <div className="bg-destructive/10 text-destructive border-destructive/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
                            <span>
                                {t('question_player.violations_count', 'Buzilishlar soni')}: {tabSwitchCount} marta
                            </span>
                        </div>
                        <div className="pt-2">
                            <Button type="button" variant="default" className="w-full" onClick={() => setShowViolationModal(false)}>
                                {t('question_player.continue_test', 'Tushundim, testni davom ettirish')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Bar (sunken, border-b): left {test} · {part} (700) + Savol {i}/{n} (13 muted), middle part progress, right exit button */}
            <header className="bg-surface-sunken border-border sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="text-foreground truncate text-sm font-bold">
                        {attempt_part.attempt?.mock?.name || attempt_part.attempt?.test?.name || 'CEFR Speaking'} · {part.name}
                    </span>
                    {index >= 0 && (
                        <span className="text-muted-foreground text-[13px] whitespace-nowrap">
                            Savol {index + 1} / {questions.length}
                        </span>
                    )}
                </div>

                <div className="hidden max-w-md flex-1 justify-center md:flex">
                    <StepTabs attempt_parts={attempt_part.attempt?.attempt_parts ?? []} active={attempt_part.id} />
                </div>

                <div className="flex items-center gap-2">
                    {tabSwitchCount > 0 && (
                        <span className="border-destructive/20 bg-destructive/10 text-destructive hidden items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold sm:inline-flex">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {tabSwitchCount} ta ogohlantirish
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="border-border-strong bg-surface-2 text-muted-foreground hover:text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-colors"
                        title={isFullscreen ? t('common.exit_fullscreen') : t('common.fullscreen')}
                    >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </button>
                    <Button variant="outline" size="sm" onClick={handleExit}>
                        {t('common.exit', 'Chiqish')}
                    </Button>
                </div>
            </header>

            {/* Main (max 1200, wrap) */}
            <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8">
                <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:gap-6">
                    {/* Left card (flex 999 1 520px, padding 40, vertically centered) */}
                    <div className="border-border bg-card flex w-full min-w-0 flex-col justify-center rounded-xl border p-4 shadow-sm sm:p-6 lg:min-h-[460px] lg:flex-[999_1_520px] lg:p-10 dark:shadow-none">
                        {phase === 'introduction' ? (
                            <div className="space-y-4">
                                <span className="text-muted-foreground block text-xs font-semibold">
                                    {t('question_player.introduction', 'Kirish')}
                                </span>
                                <h2 className="text-foreground text-[22px] leading-snug font-semibold tracking-tight break-words sm:text-[28px] lg:text-[36px] lg:leading-tight lg:font-bold">
                                    {part.name}
                                </h2>
                                <SafeHtml
                                    className="text-muted-foreground mt-4 min-w-0 text-base leading-relaxed break-words sm:text-lg"
                                    html={part.description}
                                />
                            </div>
                        ) : phase === 'uploading' ? (
                            uploadError ? (
                                <div role="alert" className="mx-auto flex max-w-md flex-col items-center justify-center space-y-6 py-12 text-center">
                                    <NoticeBanner tone="danger" title={t('question_player.upload_failed_title', 'Javoblar yuklanmadi')}>
                                        {t(
                                            'question_player.upload_failed_desc',
                                            'Internet aloqasini tekshiring. Javoblaringiz yo‘qolmaydi, qayta urinib ko‘ring.',
                                        )}
                                    </NoticeBanner>
                                    <Button type="button" variant="default" onClick={() => void finalize()} className="px-8">
                                        {t('question_player.retry', 'Qayta urinish')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
                                    <CloudUpload className="text-accent-text h-10 w-10 animate-pulse" />
                                    <h2 className="text-foreground text-2xl font-bold">
                                        {t('question_player.uploading_title', 'Javoblar saqlanmoqda')}
                                    </h2>
                                    <p className="text-muted-foreground max-w-sm text-sm">
                                        {t('question_player.uploading_desc', 'Iltimos, kuting. Natijalaringiz tizimga yuborilmoqda.')}
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="min-w-0 space-y-4">
                                <span className="text-muted-foreground block text-xs font-semibold">
                                    Savol {index + 1} / {questions.length}
                                </span>
                                <SafeHtml
                                    className="text-foreground min-w-0 text-[22px] leading-snug font-semibold tracking-tight break-words sm:text-[28px] lg:text-[36px] lg:leading-tight lg:font-bold"
                                    html={question?.textarea ?? ''}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right card (flex 1 1 340px, centered column, gap 24) */}
                    <div className="border-border bg-card sticky bottom-0 z-20 flex w-full flex-col items-center justify-center gap-3 rounded-xl border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-sm sm:p-4 lg:static lg:min-h-[460px] lg:flex-[1_1_340px] lg:gap-6 lg:p-8 lg:pb-8 dark:shadow-none">
                        {/* Phase chips grid(3): Tinglash / Tayyorlanish / Gapiring */}
                        <div className="grid w-full grid-cols-3 gap-2">
                            {/* Chip 1: Tinglash */}
                            <div
                                className={cn(
                                    'flex min-h-9 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-center text-xs leading-tight transition-colors',
                                    phase === 'audio' || phase === 'introduction'
                                        ? 'bg-primary text-primary-foreground font-bold'
                                        : phase === 'ready' || phase === 'recording' || phase === 'uploading'
                                          ? 'bg-secondary text-muted-foreground'
                                          : 'bg-surface-2 text-muted-foreground',
                                )}
                            >
                                {(phase === 'ready' || phase === 'recording' || phase === 'uploading') && <Check className="h-3 w-3" />}
                                <span>{t('question_player.phase_listen', 'Tinglash')}</span>
                            </div>

                            {/* Chip 2: Tayyorlanish */}
                            <div
                                className={cn(
                                    'flex min-h-9 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-center text-xs leading-tight transition-colors',
                                    phase === 'ready'
                                        ? 'bg-primary text-primary-foreground font-bold'
                                        : phase === 'recording' || phase === 'uploading'
                                          ? 'bg-secondary text-muted-foreground'
                                          : 'bg-surface-2 text-muted-foreground',
                                )}
                            >
                                {(phase === 'recording' || phase === 'uploading') && <Check className="h-3 w-3" />}
                                <span>{t('question_player.phase_prepare', 'Tayyorlanish')}</span>
                            </div>

                            {/* Chip 3: Gapiring */}
                            <div
                                className={cn(
                                    'flex min-h-9 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-center text-xs leading-tight transition-colors',
                                    phase === 'recording'
                                        ? 'bg-primary text-primary-foreground font-bold'
                                        : phase === 'uploading'
                                          ? 'bg-secondary text-muted-foreground'
                                          : 'bg-surface-2 text-muted-foreground',
                                )}
                            >
                                {phase === 'uploading' && <Check className="h-3 w-3" />}
                                <span>{t('question_player.phase_speak', 'Gapiring')}</span>
                            </div>
                        </div>

                        {/* Ring timer 220px: conic ring, inner circle card color, number Space Grotesk 56/700 */}
                        <div className="flex w-full items-center justify-center gap-4 lg:flex-col lg:gap-6">
                            <div className="hidden lg:block">
                                <CircularTimer timeLeft={timer} totalTime={totalTime} phase={phase} />
                            </div>
                            <div className="shrink-0 lg:hidden">
                                <CircularTimer timeLeft={timer} totalTime={totalTime} phase={phase} size={88} />
                            </div>

                            {/* Mic level meter 40px bars, green; above it ● Yozilmoqda */}
                            {phase === 'recording' && (
                                <div className="flex min-w-0 flex-1 flex-col items-center gap-3 lg:w-full lg:flex-none">
                                    <LiveAudioMeter stream={streamRef.current} />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => {
                                            if (recorderRef.current && recorderRef.current.state === 'recording') {
                                                recorderRef.current.stop();
                                            }
                                        }}
                                    >
                                        {t('question_player.finish_answer', 'Javobni yakunlash')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Last save status line 13 muted */}
                        {index > 0 && (
                            <span className="text-muted-foreground hidden text-center text-[13px] lg:block">{index}-savol javobi saqlandi ✓</span>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Sub-components: LiveAudioMeter
function LiveAudioMeter({ stream }: { stream: MediaStream | null }) {
    const { t } = useTranslation();
    const [level, setLevel] = useState(0);

    useEffect(() => {
        if (!stream) return;
        let audioCtx: AudioContext | null = null;
        let analyser: AnalyserNode | null = null;
        let source: MediaStreamAudioSourceNode | null = null;
        let animId: number;

        try {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
                if (!analyser) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                setLevel(Math.min(100, Math.round((avg / 128) * 100)));
                animId = requestAnimationFrame(checkVolume);
            };
            checkVolume();
        } catch (e) {
            console.error('AudioContext error:', e);
        }

        return () => {
            if (animId) cancelAnimationFrame(animId);
            if (source) source.disconnect();
            if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
        };
    }, [stream]);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="text-success flex items-center gap-1.5 text-xs font-semibold">
                <span className="bg-success h-2 w-2 animate-pulse rounded-full" />
                <span>{t('question_player.recording_now', 'Yozilmoqda')}</span>
            </div>
            {/* 40px bars */}
            <div className="bg-surface-2 border-border flex h-10 items-end gap-1 rounded-lg border px-3 py-1">
                {[15, 30, 45, 60, 75, 90, 100].map((threshold, idx) => {
                    const isActive = level >= threshold || (level > 8 && idx < 2);
                    const barHeight = isActive ? Math.max(12, Math.min(36, Math.round((level / 100) * 36) + (idx % 2 === 0 ? 4 : -2))) : 6;
                    return (
                        <div
                            key={idx}
                            className={cn('w-1.5 rounded-full transition-all duration-75', isActive ? 'bg-success' : 'bg-muted-foreground/30')}
                            style={{ height: `${barHeight}px` }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
