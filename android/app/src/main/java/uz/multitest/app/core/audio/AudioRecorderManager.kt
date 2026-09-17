package uz.multitest.app.core.audio

import android.content.Context
import android.media.MediaRecorder
import android.os.Build
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.io.File
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

sealed interface RecorderState {
    data object Idle : RecorderState
    data class Recording(val durationMs: Long, val amplitude: Float) : RecorderState
    data class Stopped(val outputFile: File, val durationMs: Long) : RecorderState
    data class Error(val message: String) : RecorderState
}

@Singleton
class AudioRecorderManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private var mediaRecorder: MediaRecorder? = null
    private var currentOutputFile: File? = null
    private var recordingStartTime: Long = 0L

    private val scope = CoroutineScope(Dispatchers.Default + Job())
    private var trackingJob: Job? = null

    private val _recorderState = MutableStateFlow<RecorderState>(RecorderState.Idle)
    val recorderState: StateFlow<RecorderState> = _recorderState.asStateFlow()

    @Suppress("DEPRECATION")
    private fun createRecorder(): MediaRecorder {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            MediaRecorder(context)
        } else {
            MediaRecorder()
        }
    }

    fun startRecording(fileNamePrefix: String = "voice_answer"): File? {
        stopRecordingInternal(emitState = false)

        return try {
            val audioDir = File(context.cacheDir, "recordings").apply {
                if (!exists()) mkdirs()
            }
            val outputFile = File(audioDir, "${fileNamePrefix}_${System.currentTimeMillis()}.m4a")
            currentOutputFile = outputFile

            val recorder = createRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioSamplingRate(44100)
                setAudioEncodingBitRate(128000)
                setOutputFile(outputFile.absolutePath)
                prepare()
                start()
            }

            mediaRecorder = recorder
            recordingStartTime = System.currentTimeMillis()

            startAmplitudeTracking()
            outputFile
        } catch (e: Exception) {
            _recorderState.value = RecorderState.Error(e.localizedMessage ?: "Failed to start recording")
            null
        }
    }

    fun stopRecording(): File? {
        return stopRecordingInternal(emitState = true)
    }

    private fun stopRecordingInternal(emitState: Boolean): File? {
        stopAmplitudeTracking()
        val file = currentOutputFile
        val duration = if (recordingStartTime > 0) System.currentTimeMillis() - recordingStartTime else 0L

        try {
            mediaRecorder?.apply {
                try {
                    stop()
                } catch (e: RuntimeException) {
                    // Happens if stop is called immediately after start
                }
                reset()
                release()
            }
        } catch (e: Exception) {
            // Ignore clean up errors
        } finally {
            mediaRecorder = null
        }

        if (emitState && file != null && file.exists() && file.length() > 0) {
            _recorderState.value = RecorderState.Stopped(file, duration)
        } else if (emitState) {
            _recorderState.value = RecorderState.Idle
        }

        currentOutputFile = null
        recordingStartTime = 0L
        return file
    }

    fun cancelRecording() {
        stopRecordingInternal(emitState = false)
        currentOutputFile?.let {
            if (it.exists()) it.delete()
        }
        currentOutputFile = null
        _recorderState.value = RecorderState.Idle
    }

    private fun startAmplitudeTracking() {
        trackingJob?.cancel()
        trackingJob = scope.launch {
            while (isActive) {
                try {
                    val maxAmp = mediaRecorder?.maxAmplitude ?: 0
                    // Normalize amplitude to 0.0 .. 1.0
                    val normalizedAmp = (maxAmp / 32767f).coerceIn(0f, 1f)
                    val duration = System.currentTimeMillis() - recordingStartTime

                    _recorderState.value = RecorderState.Recording(
                        durationMs = duration,
                        amplitude = normalizedAmp
                    )
                } catch (e: Exception) {
                    // Recorder might be releasing
                }
                delay(80L)
            }
        }
    }

    private fun stopAmplitudeTracking() {
        trackingJob?.cancel()
        trackingJob = null
    }

    fun release() {
        stopRecordingInternal(emitState = false)
    }
}
