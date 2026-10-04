import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import AudioEqualizer from '@/components/ui/audio-equalizer';

interface AudioRecorderProps {
    onRecorded: (audioUrl: string, audioBlob: Blob) => void;
}

export default function AudioRecorder({ onRecorded }: AudioRecorderProps) {
    const [micAllowed, setMicAllowed] = useState<boolean | null>(null);
    const [recording, setRecording] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const { t } = useTranslation();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    const checkMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicAllowed(true);
            stream.getTracks().forEach((t) => t.stop());
            toast.success(t('audio_recorder.mic_found'));
        } catch {
            setMicAllowed(false);
            toast.error(t('audio_recorder.mic_denied'));
        }
    };

    const getSupportedMimeType = () => {
        const types = [
            'audio/mp4',
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mpeg',
            'audio/ogg;codecs=opus',
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) return type;
        }
        return '';
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedMimeType();
            const options = mimeType ? { mimeType } : {};
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            mediaRecorder.onstop = () => {
                const finalMimeType = mediaRecorder.mimeType || mimeType || 'audio/webm';
                const blob = new Blob(audioChunksRef.current, { type: finalMimeType });
                const url = URL.createObjectURL(blob);
                onRecorded(url, blob);
                setHasRecorded(true);
                stream.getTracks().forEach((t) => t.stop());
                audioContextRef.current?.close();
            };

            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            toast.error(t('audio_recorder.could_not_start'));
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
            {micAllowed === null ? (
                <Button
                    type="button"
                    onClick={checkMic}
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold transition-colors"
                >
                    <Mic className="mr-2 h-3.5 w-3.5" />
                    {t('audio_recorder.verify_microphone')}
                </Button>
            ) : !micAllowed ? (
                <div className="flex items-center gap-2 text-destructive bg-destructive-bg p-3 rounded-xl border border-destructive/20">
                    <MicOff className="h-4 w-4 shrink-0" />
                    <p className="text-xs font-medium leading-tight">{t('audio_recorder.mic_access_denied_desc')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {recording ? t('audio_recorder.live_level') : t('audio_recorder.ready_to_test')}
                        </span>
                        {hasRecorded && !recording && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-success uppercase">
                                <CheckCircle2 className="h-3 w-3" /> {t('audio_recorder.tested')}
                            </div>
                        )}
                    </div>

                    {/* Equalizer Box */}
                    <div className={`h-11 w-full rounded-xl flex items-center justify-center border border-dashed transition-colors ${recording ? 'border-primary/40 bg-primary/5' : 'border-border bg-secondary/50'}`}>
                        {recording ? (
                            <AudioEqualizer analyser={analyserRef.current} active={recording} />
                        ) : (
                            <span className="text-xs font-medium text-muted-foreground italic">{t('audio_recorder.monitor_inactive')}</span>
                        )}
                    </div>

                    {!recording ? (
                        <Button
                            type="button"
                            onClick={startRecording}
                            className="w-full h-10 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-semibold border border-primary/20 transition-colors"
                        >
                            <Mic className="mr-2 h-3.5 w-3.5" />
                            {hasRecorded ? t('audio_recorder.record_again') : t('audio_recorder.record_test_clip')}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={stopRecording}
                            className="w-full h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold animate-pulse"
                        >
                            <Square className="mr-2 h-3.5 w-3.5 fill-current" />
                            {t('audio_recorder.stop_recording')}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
