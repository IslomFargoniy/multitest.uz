/**
 * Global persistent media stream manager to prevent re-requesting microphone permissions
 * during page transitions (e.g., from Part 1 to Part 4) on iOS Safari & Telegram Mini App.
 */

let cachedStream: MediaStream | null = null;

export async function getPersistentAudioStream(): Promise<MediaStream> {
    if (cachedStream && cachedStream.active) {
        const liveTracks = cachedStream.getAudioTracks().filter((t) => t.readyState === 'live');
        if (liveTracks.length > 0) {
            // Unmute tracks if disabled
            liveTracks.forEach((t) => {
                t.enabled = true;
            });
            return cachedStream;
        }
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
        });
        cachedStream = stream;
        return stream;
    } catch (error) {
        cachedStream = null;
        throw error;
    }
}

export function pauseAudioTracks() {
    if (cachedStream) {
        cachedStream.getAudioTracks().forEach((track) => {
            track.enabled = false;
        });
    }
}

export function resumeAudioTracks() {
    if (cachedStream) {
        cachedStream.getAudioTracks().forEach((track) => {
            track.enabled = true;
        });
    }
}

export function releasePersistentAudioStream() {
    if (cachedStream) {
        cachedStream.getTracks().forEach((track) => {
            track.stop();
        });
        cachedStream = null;
    }
}

export function getOptimalAudioMimeType(): { mimeType: string; extension: string } {
    const types = [
        { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
        { mimeType: 'audio/webm', extension: 'webm' },
        { mimeType: 'audio/mp4', extension: 'mp4' },
        { mimeType: 'audio/aac', extension: 'aac' },
        { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
    ];

    for (const item of types) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(item.mimeType)) {
            return item;
        }
    }

    return { mimeType: '', extension: 'webm' };
}
