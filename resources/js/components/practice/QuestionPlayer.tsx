import CircularTimer from '@/components/practice/CircularTimer';
import { useTelegramBackButton, useHaptic } from '@/components/telegram-theme-provider';
import { router } from '@inertiajs/react';
import { CloudUpload, Info, Maximize, Mic, Minimize, Timer, Volume2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function QuestionPlayer({ attempt_part }: any) {
    const { t } = useTranslation();
    const questions = attempt_part.part.questions;

    const [index, setIndex] = useState(-1);
    const [phase, setPhase] = useState<'introduction' | 'audio' | 'ready' | 'recording' | 'uploading'>('introduction');
    const [timer, setTimer] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showViolationModal, setShowViolationModal] = useState(false);

    const { impact, selection, notification } = useHaptic();

    // Anti-Cheat: Record tab switch and focus loss
    useEffect(() => {
        const attemptId = attempt_part.attempt_id || attempt_part.attempt?.id;

        const reportViolation = () => {
            if (phase !== 'uploading') {
                setTabSwitchCount((prev) => prev + 1);
                setShowViolationModal(true);
                if (attemptId) {
                    axios.post(route('practice-attempt-violation', attemptId), { count: 1 }).catch(() => {});
                }
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden && phase !== 'uploading') {
                reportViolation();
            }
        };

        const handleBlur = () => {
            if (phase !== 'uploading' && phase !== 'introduction') {
                reportViolation();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
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
    const answersRef = useRef<any[]>([]);
    const recordingStartTimeRef = useRef<string>('');

    useEffect(() => {
        setIndex(-1);
        setPhase('introduction');
        answersRef.current = [];
        return () => stopAllMedia();
    }, [attempt_part.id]);

    const stopAllMedia = () => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const question = index >= 0 ? questions[index] : null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    /* Phase 0: Part Introduction */
    useEffect(() => {
        if (phase !== 'introduction') return;
        const audioPath = attempt_part.part.audio_path;
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
        const audioPath = question.audio_path;
        if (!audioPath) {
            const readySec = question.ready_second;
            setPhase('ready');
            setTimer(readySec);
            setTotalTime(readySec);
            return;
        }
        const audio = new Audio(audioPath);
        audio.play().catch(() => {
            setPhase('ready');
            setTimer(question.ready_second);
        });
        audio.onended = () => {
            const readySec = question.ready_second;
            setPhase('ready');
            setTimer(readySec);
            setTotalTime(readySec);
        };
        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [phase, index]);

    /* Fullscreen is now triggered by user click (toggleFullscreen) only */

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
        startSound.play()
            .then(() => { startSound.onended = () => startRecording(); })
            .catch(() => startRecording());
    };

    const startRecording = async () => {
        if (!question) return;
        try {
            stopAllMedia();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Check supported types (Chrome prefers webm, Safari prefers mp4/ogg)
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : 'audio/ogg';

            const recorder = new MediaRecorder(stream, { mimeType });
            recorderRef.current = recorder;
            chunksRef.current = [];
            recordingStartTimeRef.current = new Date().toISOString();

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const capturedBlob = new Blob(chunksRef.current, { type: recorder.mimeType });

                // Extract extension for the filename
                const extension = recorder.mimeType.includes('webm') ? 'webm' : 'ogg';

                answersRef.current.push({
                    question_id: question.id,
                    started_at: recordingStartTimeRef.current,
                    finished_at: new Date().toISOString(),
                    audio: capturedBlob,
                    ext: extension
                });

                chunksRef.current = [];
                stopAllMedia();
                goNext();
            };

            recorder.start();
            impact('medium');
            setPhase('recording');
            setTimer(question.answer_second);
            setTotalTime(question.answer_second);
        } catch (err) {
            alert(t('question_player.mic_error'));
        }
    };

    const submitAnswerIncremental = (answer: any) => {
        const form = new FormData();
        form.append(`answers[0][question_id]`, answer.question_id);
        form.append(`answers[0][started_at]`, answer.started_at);
        form.append(`answers[0][finished_at]`, answer.finished_at);
        form.append(`answers[0][audio_path]`, answer.audio, `q_${answer.question_id}.${answer.ext}`);

        // Use standard fetch for a silent "fire and forget" auto-save
        fetch(route('practice.save_answers', attempt_part.id), {
            method: 'POST',
            body: form,
            credentials: 'same-origin',
            headers: {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
        })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Auto-save failed:', response.statusText, errorData.errors || errorData);
                }
            })
            .catch(error => {
                console.error('Auto-save network error:', error);
            });
    };

    const goNext = () => {
        const lastAnswer = answersRef.current[answersRef.current.length - 1];
        if (lastAnswer) {
            submitAnswerIncremental(lastAnswer);
        }

        selection();

        if (index + 1 < questions.length) {
            setIndex((i) => i + 1);
            setPhase('audio');
        } else {
            setPhase('uploading');
            submit(); // Final submit to handle navigation
        }
    };

    const submit = () => {
        const form = new FormData();

        const next = attempt_part.attempt.attempt_parts.find((p: any) => p.id > attempt_part.id);
        if (next) form.append('next_attempt_part_id', next.id);

        // Use fetch to avoid BodyStreamBuffer abort, then navigate after upload completes
        fetch(route('practice.save_answers', attempt_part.id), {
            method: 'POST',
            body: form,
            credentials: 'same-origin',
            headers: {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
        })
            .then(async (response) => {
                if (response.ok) {
                    notification('success');
                    const data = await response.json().catch(() => ({}));
                    // Navigate to the next part or back to attempt page
                    if (data.redirect) {
                        router.visit(data.redirect);
                    } else if (next) {
                        router.visit(route('practice.show', next.id));
                    } else {
                        router.visit(route('attempt.show', attempt_part.attempt.id));
                    }
                } else {
                    console.error('Final submit failed:', response.statusText);
                    // Still navigate even if save failed
                    if (next) {
                        router.visit(route('practice.show', next.id));
                    } else {
                        router.visit(route('attempt.show', attempt_part.attempt.id));
                    }
                }
            })
            .catch((error) => {
                console.error('Final submit network error:', error);
                if (next) {
                    router.visit(route('practice.show', next.id));
                } else {
                    router.visit(route('attempt.show', attempt_part.attempt.id));
                }
            });
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
            className={`relative select-none mx-auto w-full overflow-hidden border border-border bg-card shadow-2xl transition-all duration-300 ${isFullscreen ? 'rounded-none' : 'rounded-2xl md:rounded-[2.5rem]'}`}
        >
            {/* Anti-Cheat Violation Warning Modal Overlay */}
            {showViolationModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="max-w-md w-full rounded-2xl bg-white dark:bg-gray-900 border-2 border-red-500 p-6 shadow-2xl text-center space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                            <ShieldAlert className="h-8 w-8 animate-bounce" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                ⚠️ Qoidabuzarlik Qayd Etildi!
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                Imtihon davomida boshqa oynaga (tab) o'tish yoki ilovani yashirish taqiqlanadi. 
                                Har bir holat tizim tomonidan qayd etilmoqda va o'qituvchiga ma'lum qilinadi.
                            </p>
                        </div>
                        <div className="py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300">
                            Buzilishlar soni: {tabSwitchCount} marta
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowViolationModal(false)}
                            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                            Tushundim, testni davom ettirish
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3 md:px-8 md:py-4">
                <div className="flex items-center gap-3">
                    <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
                        {t('question_player.part_label')}
                    </span>
                    <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">{attempt_part.part.title}</h1>
                </div>

                <div className="flex items-center gap-2">
                    {tabSwitchCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-bold border border-red-200 dark:border-red-800">
                            <AlertTriangle className="w-3 h-3" />
                            {tabSwitchCount} ta ogohlantirish
                        </span>
                    )}

                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        title={isFullscreen ? t('common.exit_fullscreen') : t('common.fullscreen')}
                    >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="grid min-h-[500px] grid-cols-1 md:grid-cols-12">
                <div className="border-r border-border p-4 md:p-10 md:col-span-8">

                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-[10px] md:text-[11px] font-black tracking-[0.15em] text-slate-400 dark:text-slate-500 uppercase leading-none">
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
                                <h2 className="text-2xl md:text-3xl font-extrabold leading-snug text-slate-800 dark:text-slate-100">{attempt_part.part.name}</h2>
                                <div
                                    className="text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300"
                                    dangerouslySetInnerHTML={{ __html: attempt_part.part.description }}
                                />
                            </div>
                        ) : phase === 'uploading' ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-4 py-20 text-center">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('question_player.uploading_title')}</h2>
                                <p className="text-slate-500 dark:text-slate-400">{t('question_player.uploading_desc')}</p>
                            </div>
                        ) : (
                            <div
                                className="tinymce-content prose prose-slate dark:prose-invert prose-p:text-slate-600 dark:prose-p:text-slate-200 prose-img:rounded-2xl prose-strong:text-indigo-600 max-w-none flex-1 text-lg md:text-xl leading-relaxed dark:text-slate-200"
                                dangerouslySetInnerHTML={{ __html: question?.textarea }}
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-muted/30 p-4 md:p-10 text-center md:col-span-4">

                    {/* Timer on top, larger and prominent */}
                    <div className="mb-4">
                        <CircularTimer timeLeft={timer} totalTime={totalTime} phase={phase} />
                    </div>
                    {/* Smaller mic pod below */}
                    <RecordingPod phase={phase} />
                    <div className="mt-6 w-full space-y-3">
                        <div className="rounded-xl border border-border bg-card p-2.5 shadow-sm">

                            <p className="mb-1 text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">{t('question_player.status')}</p>
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

// Sub-components (RecordingPod and PhaseBadge) stay the same as your original design
function RecordingPod({ phase }: { phase: string }) {
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
            <div className="flex flex-col items-center">
                <div className="relative mb-3">
                    <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20"></div>
                    <div className="absolute -inset-2 animate-pulse rounded-full bg-red-100 opacity-40"></div>
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-red-600 text-white shadow-xl">
                        <Mic size={28} strokeWidth={2.5} />
                    </div>
                </div>
                <span className="animate-pulse text-xs font-black tracking-[0.2em] text-red-600 uppercase">
                    {t('question_player.recording_live')}
                </span>
            </div>
        );
    }
    if (phase === 'ready') {
        return (
            <div className="flex flex-col items-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-amber-500 text-white shadow-xl">
                    <Timer size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-black tracking-[0.2em] text-amber-600 uppercase">{t('question_player.get_ready')}</span>
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
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground shadow-sm">

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
        <div className={`flex items-center gap-2 rounded-full border px-3 py-1 md:px-4 md:py-1.5 text-[10px] font-black tracking-widest uppercase ${styles[phase as keyof typeof styles]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${phase === 'recording' ? 'animate-pulse bg-red-600' : phase === 'uploading' ? 'animate-bounce bg-indigo-600' : 'bg-current'}`} />
            {phase === 'introduction' ? t('question_player.phase_intro') : phase === 'audio' ? t('question_player.phase_instruction') : phase === 'ready' ? t('question_player.phase_preparing') : phase === 'uploading' ? t('question_player.phase_saving') : t('question_player.phase_answering')}
        </div>
    );
}
