import { cn } from '@/lib/utils';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

export interface AudioPlayerProps {
    src: string;
    className?: string;
    height?: number;
}

const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function AudioPlayer({ src, className, height = 36 }: AudioPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current || !src) return;

        let isDestroyed = false;

        // WaveSurfer instance
        const ws = WaveSurfer.create({
            container: containerRef.current,
            height,
            waveColor: '#2A3557', // border-strong
            progressColor: '#7B86FF', // chart
            cursorWidth: 0,
            barWidth: 2,
            barGap: 3,
            barRadius: 2,
            url: src,
        });

        wavesurferRef.current = ws;

        ws.on('ready', (d) => {
            if (isDestroyed) return;
            setDuration(d);
            setIsReady(true);
        });

        ws.on('timeupdate', (t) => {
            if (isDestroyed) return;
            setCurrentTime(t);
        });

        ws.on('play', () => {
            if (!isDestroyed) setIsPlaying(true);
        });

        ws.on('pause', () => {
            if (!isDestroyed) setIsPlaying(false);
        });

        ws.on('finish', () => {
            if (!isDestroyed) {
                setIsPlaying(false);
                setCurrentTime(0);
            }
        });

        return () => {
            isDestroyed = true;
            try {
                ws.destroy();
            } catch {
                // Ignore destroy errors
            }
        };
    }, [src, height]);

    const togglePlay = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
        }
    };

    return (
        <div className={cn('bg-surface-sunken border-border flex w-full items-center gap-3 rounded-[10px] border p-3', className)}>
            {/* 40px round primary play button */}
            <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="bg-primary text-primary-foreground focus:ring-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
                {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
                ) : (
                    <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
                )}
            </button>

            {/* Waveform container */}
            <div ref={containerRef} className="flex-1 overflow-hidden" />

            {/* Duration Space Grotesk 13px muted */}
            <div className="font-display text-muted-foreground shrink-0 text-[13px] tabular-nums select-none">
                {isReady ? (
                    isPlaying || currentTime > 0 ? (
                        <span>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    ) : (
                        <span>{formatTime(duration)}</span>
                    )
                ) : (
                    <span>0:00</span>
                )}
            </div>
        </div>
    );
}

export default AudioPlayer;
