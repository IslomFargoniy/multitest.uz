import { useEffect, useRef } from 'react';

interface AudioEqualizerProps {
    analyser: AnalyserNode | null;
    active: boolean;
}

export default function AudioEqualizer({
    analyser,
    active,
}: AudioEqualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!analyser || !active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2;
            const gap = 3;
            let x = 0;

            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#2563eb');
            gradient.addColorStop(1, '#3b82f6');

            for (let i = 0; i < bufferLength; i++) {
                const amplitude = dataArray[i] / 255;
                const barHeight = amplitude * canvas.height * 0.8;
                const minHeight = 6;
                const finalHeight = Math.max(barHeight, minHeight);

                ctx.fillStyle = gradient;

                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(
                        x,
                        (canvas.height / 2) - (finalHeight / 2),
                        barWidth - gap,
                        finalHeight,
                        10
                    );
                } else {
                    ctx.fillRect(x, (canvas.height / 2) - (finalHeight / 2), barWidth - gap, finalHeight);
                }
                ctx.fill();

                x += barWidth;
            }
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [analyser, active]);

    if (!active) return null;

    return (
        <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-2 px-6">
            <canvas
                ref={canvasRef}
                width={1000}
                height={120}
                className="h-12 w-full"
            />
            <div className="absolute inset-0 animate-pulse bg-primary/5 pointer-events-none" />
        </div>
    );
}
