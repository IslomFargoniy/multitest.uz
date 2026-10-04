import CircularTimer from '@/components/practice/CircularTimer';
import SafeHtml from '@/components/safe-html';
import { useHaptic, useTelegramBackButton } from '@/components/telegram-theme-provider';
import type { AttemptPart, Part, Question } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, CloudUpload, Info, Maximize, Mic, Minimize, ShieldAlert, Timer, Volume2 } from 'lucide-react';
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

    // Show native BackButton to exit test with confirmation
    useTelegramBackButton(phase !== 'uploading', () => {
        if (confirm(t('question_player.exit_confirm', 'Haqiqatan ham testdan chiqmoqchimisiz? Natijalaringiz saqlanmasligi mumkin.'))) {
            router.visit('/dashboard');
        }
    });

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
            className={`border-border bg-card relative mx-auto w-full overflow-hidden border shadow-2xl transition-all duration-300 select-none ${isFullscreen ? 'rounded-none' : 'rounded-2xl md:rounded-[2.5rem]'}`}
        >
            {/* Anti-Cheat Violation Warning Modal Overlay */}
            {showViolationModal && (
                <div className="animate-in fade-in absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md space-y-4 rounded-2xl border-2 border-red-500 bg-white p-6 text-center shadow-2xl dark:bg-gray-900">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                            <ShieldAlert className="h-8 w-8 animate-bounce" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">⚠️ Qoidabuzarlik Qayd Etildi!</h3>
                            <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                                Imtihon davomida boshqa oynaga (tab) o'tish yoki ilovani yashirish taqiqlanadi. Har bir holat tizim tomonidan qayd
                                etilmoqda va o'qituvchiga ma'lum qilinadi.
                            </p>
                        </div>
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                            Buzilishlar soni: {tabSwitchCount} marta
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowViolationModal(false)}
                            className="w-full cursor-pointer rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-red-700 active:scale-95"
                        >
                            Tushundim, testni davom ettirish
                        </button>
                    </div>
                </div>
            )}

            <div className="border-border bg-muted/50 flex items-center justify-between border-b px-4 py-3 md:px-8 md:py-4">
                <div className="flex items-center gap-3">
                    <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
                        {t('question_player.part_label')}
                    </span>
                    <h1 className="text-base font-bold tracking-tight text-slate-800 md:text-lg dark:text-slate-100">{part.name}</h1>
                </div>

                <div className="flex items-center gap-2">
                    {tabSwitchCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300">
                            <AlertTriangle className="h-3 w-3" />
                            {tabSwitchCount} ta ogohlantirish
                        </span>
                    )}

                    <button
                        onClick={toggleFullscreen}
                        className="flex cursor-pointer items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        title={isFullscreen ? t('common.exit_fullscreen') : t('common.fullscreen')}
                    >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="grid min-h-[500px] grid-cols-1 md:grid-cols-12">
                <div className="border-border border-r p-4 md:col-span-8 md:p-10">
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-[10px] leading-none font-black tracking-[0.15em] text-slate-400 uppercase md:text-[11px] dark:text-slate-500">
                            {phase === 'introduction'
                                ? t('question_player.introduction')
                                : phase === 'uploading'
                                  ? t('question_player.saving_results')
                                  : t('question_player.question_counter', { current: index + 1, total: questions.length })}
                        </span>
                        <PhaseBadge phase={phase} />
                    </div>
                    <div className="max-w-none">
                        {phase === 'introduction' ? (
                            <div className="space-y-4">
                                <h2 className="text-2xl leading-snug font-extrabold text-slate-800 md:text-3xl dark:text-slate-100">{part.name}</h2>
                                <SafeHtml
                                    className="text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300"
                                    html={part.description}
                                />
                            </div>
                        ) : phase === 'uploading' ? (
                            uploadError ? (
                                <div role="alert" className="flex h-full flex-col items-center justify-center space-y-4 py-20 text-center">
                                    <AlertTriangle className="h-10 w-10 text-red-500" />
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                        {t('question_player.upload_failed_title', 'Javoblar yuklanmadi')}
                                    </h2>
                                    <p className="max-w-md text-slate-500 dark:text-slate-400">
                                        {t(
                                            'question_player.upload_failed_desc',
                                            'Internet aloqasini tekshiring. Javoblaringiz yo‘qolmaydi, qayta urinib ko‘ring.',
                                        )}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => void finalize()}
                                        className="cursor-pointer rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95"
                                    >
                                        {t('question_player.retry', 'Qayta urinish')}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center space-y-4 py-20 text-center">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('question_player.uploading_title')}</h2>
                                    <p className="text-slate-500 dark:text-slate-400">{t('question_player.uploading_desc')}</p>
                                </div>
                            )
                        ) : (
                            <SafeHtml
                                className="tinymce-content prose prose-slate dark:prose-invert prose-p:text-slate-600 dark:prose-p:text-slate-200 prose-img:rounded-2xl prose-strong:text-indigo-600 max-w-none flex-1 text-lg leading-relaxed md:text-xl dark:text-slate-200"
                                html={question?.textarea}
                            />
                        )}
                    </div>
                </div>

                <div className="bg-muted/30 flex flex-col items-center justify-center p-4 text-center md:col-span-4 md:p-10">
                    {/* Timer on top, larger and prominent */}
                    <div className="mb-4">
                        <CircularTimer timeLeft={timer} totalTime={totalTime} phase={phase} />
                    </div>
                    {/* Smaller mic pod below */}
                    <RecordingPod phase={phase} stream={streamRef.current} />
                    <div className="mt-6 w-full space-y-3">
                        <div className="border-border bg-card rounded-xl border p-2.5 shadow-sm">
                            <p className="mb-1 text-[10px] font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                {t('question_player.status')}
                            </p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {phase === 'introduction'
                                    ? t('question_player.status_intro')
                                    : phase === 'audio'
                                      ? t('question_player.status_listening')
                                      : phase === 'ready'
                                        ? t('question_player.status_preparing')
                                        : phase === 'uploading'
                                          ? t('question_player.status_uploading')
                                          : t('question_player.status_capturing')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components (RecordingPod and PhaseBadge)
function LiveAudioMeter({ stream }: { stream: MediaStream | null }) {
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
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 dark:border-emerald-800 dark:bg-emerald-950/40">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Mikrofon:</span>
            <div className="flex h-3 items-center gap-0.5">
                {[20, 40, 60, 80, 100].map((threshold, idx) => (
                    <div
                        key={idx}
                        className={`w-1 rounded-full transition-all duration-75 ${
                            level >= threshold || (level > 10 && idx === 0) ? 'h-3 bg-emerald-500' : 'h-1.5 bg-slate-200 dark:bg-slate-700'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

function RecordingPod({ phase, stream }: { phase: string; stream?: MediaStream | null }) {
    const { t } = useTranslation();
    if (phase === 'uploading') {
        return (
            <div className="flex flex-col items-center">
                <div className="relative mb-3">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-400 opacity-20"></div>
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-xl">
                        <CloudUpload size={28} className="animate-bounce" strokeWidth={2.5} />
                    </div>
                </div>
                <span className="animate-pulse text-xs font-black tracking-[0.2em] text-indigo-600 uppercase">
                    {t('question_player.uploading_live')}
                </span>
            </div>
        );
    }
    if (phase === 'recording') {
        return (
            <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20"></div>
                    <div className="absolute -inset-2 animate-pulse rounded-full bg-red-100 opacity-40"></div>
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-red-600 text-white shadow-xl">
                        <Mic size={28} strokeWidth={2.5} />
                    </div>
                </div>
                <span className="animate-pulse text-xs font-black tracking-[0.2em] text-red-600 uppercase">
                    {t('simulator.recording_phase', 'OVOZ YOZILMOQDA (GAPIRING)')}
                </span>
                <LiveAudioMeter stream={stream || null} />
            </div>
        );
    }
    if (phase === 'ready') {
        return (
            <div className="flex flex-col items-center space-y-1.5">
                <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-amber-500 text-white shadow-xl">
                    <Timer size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-black tracking-[0.2em] text-amber-600 uppercase">
                    {t('simulator.prep_phase', 'TAYYORGARLIK VAQTI')}
                </span>
                <p className="max-w-[200px] text-[11px] leading-tight text-slate-500">
                    {t('simulator.prep_hint', 'Fikrlaringizni tartibga soling va qoralamaga yozing.')}
                </p>
            </div>
        );
    }
    if (phase === 'introduction') {
        return (
            <div className="flex flex-col items-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-xl">
                    <Info size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-black tracking-[0.2em] text-indigo-600 uppercase">{t('question_player.part_intro')}</span>
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center">
            <div className="border-border bg-card text-muted-foreground mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-sm">
                <Volume2 size={28} />
            </div>
            <span className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">{t('question_player.playing_audio')}</span>
        </div>
    );
}

function PhaseBadge({ phase }: { phase: string }) {
    const { t } = useTranslation();
    const styles = {
        introduction: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        audio: 'bg-blue-50 text-blue-600 border-blue-100',
        ready: 'bg-amber-50 text-amber-600 border-amber-100',
        recording: 'bg-red-50 text-red-600 border-red-100',
        uploading: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };
    return (
        <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase md:px-4 md:py-1.5 ${styles[phase as keyof typeof styles]}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${phase === 'recording' ? 'animate-pulse bg-red-600' : phase === 'uploading' ? 'animate-bounce bg-indigo-600' : 'bg-current'}`}
            />
            {phase === 'introduction'
                ? t('question_player.phase_intro')
                : phase === 'audio'
                  ? t('question_player.phase_instruction')
                  : phase === 'ready'
                    ? t('question_player.phase_preparing')
                    : phase === 'uploading'
                      ? t('question_player.phase_saving')
                      : t('question_player.phase_answering')}
        </div>
    );
}
