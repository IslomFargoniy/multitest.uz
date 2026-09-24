package uz.multitest.app.core.audio

import android.content.Context
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
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
import javax.inject.Inject
import javax.inject.Singleton

sealed interface PlayerState {
    data object Idle : PlayerState
    data object Buffering : PlayerState
    data class Playing(val currentPositionMs: Long, val totalDurationMs: Long) : PlayerState
    data class Paused(val currentPositionMs: Long, val totalDurationMs: Long) : PlayerState
    data object Completed : PlayerState
    data class Error(val message: String) : PlayerState
}

@Singleton
class AudioPlayerManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private var exoPlayer: ExoPlayer? = null
    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private var progressJob: Job? = null

    private val _playerState = MutableStateFlow<PlayerState>(PlayerState.Idle)
    val playerState: StateFlow<PlayerState> = _playerState.asStateFlow()

    private var currentMediaUrl: String? = null

    init {
        initPlayer()
    }

    private fun initPlayer() {
        if (exoPlayer == null) {
            exoPlayer = ExoPlayer.Builder(context).build().apply {
                addListener(object : Player.Listener {
                    override fun onPlaybackStateChanged(playbackState: Int) {
                        when (playbackState) {
                            Player.STATE_IDLE -> {
                                stopProgressTracking()
                                _playerState.value = PlayerState.Idle
                            }
                            Player.STATE_BUFFERING -> {
                                _playerState.value = PlayerState.Buffering
                            }
                            Player.STATE_READY -> {
                                if (playWhenReady) {
                                    startProgressTracking()
                                    _playerState.value = PlayerState.Playing(
                                        currentPositionMs = currentPosition,
                                        totalDurationMs = duration.coerceAtLeast(0L)
                                    )
                                } else {
                                    stopProgressTracking()
                                    _playerState.value = PlayerState.Paused(
                                        currentPositionMs = currentPosition,
                                        totalDurationMs = duration.coerceAtLeast(0L)
                                    )
                                }
                            }
                            Player.STATE_ENDED -> {
                                stopProgressTracking()
                                _playerState.value = PlayerState.Completed
                            }
                        }
                    }

                    override fun onIsPlayingChanged(isPlaying: Boolean) {
                        if (isPlaying) {
                            startProgressTracking()
                        } else {
                            stopProgressTracking()
                            if (exoPlayer?.playbackState == Player.STATE_READY) {
                                _playerState.value = PlayerState.Paused(
                                    currentPositionMs = exoPlayer?.currentPosition ?: 0L,
                                    totalDurationMs = (exoPlayer?.duration ?: 0L).coerceAtLeast(0L)
                                )
                            }
                        }
                    }

                    override fun onPlayerError(error: PlaybackException) {
                        stopProgressTracking()
                        _playerState.value = PlayerState.Error(error.localizedMessage ?: "Audio playback error")
                    }
                })
            }
        }
    }

    fun normalizeUrl(url: String): String {
        val trimmed = url.trim()
        if (trimmed.startsWith("http://", ignoreCase = true) || trimmed.startsWith("https://", ignoreCase = true)) {
            return trimmed
        }
        val cleanPath = if (trimmed.startsWith("/")) trimmed else "/$trimmed"
        return "https://multitest.uz$cleanPath"
    }

    fun play(url: String) {
        if (url.isBlank()) return
        initPlayer()
        val fullUrl = normalizeUrl(url)
        if (currentMediaUrl == fullUrl && exoPlayer?.playbackState == Player.STATE_READY) {
            exoPlayer?.play()
            return
        }

        currentMediaUrl = fullUrl
        val mediaItem = MediaItem.fromUri(fullUrl)
        exoPlayer?.apply {
            setMediaItem(mediaItem)
            prepare()
            playWhenReady = true
        }
    }

    fun pause() {
        exoPlayer?.pause()
    }

    fun resume() {
        exoPlayer?.play()
    }

    fun stop() {
        stopProgressTracking()
        exoPlayer?.stop()
        exoPlayer?.clearMediaItems()
        currentMediaUrl = null
        _playerState.value = PlayerState.Idle
    }

    fun seekTo(positionMs: Long) {
        exoPlayer?.seekTo(positionMs)
    }

    private fun startProgressTracking() {
        progressJob?.cancel()
        progressJob = scope.launch {
            while (isActive) {
                exoPlayer?.let { player ->
                    if (player.isPlaying) {
                        _playerState.value = PlayerState.Playing(
                            currentPositionMs = player.currentPosition,
                            totalDurationMs = player.duration.coerceAtLeast(0L)
                        )
                    }
                }
                delay(100L)
            }
        }
    }

    private fun stopProgressTracking() {
        progressJob?.cancel()
        progressJob = null
    }

    fun release() {
        stopProgressTracking()
        exoPlayer?.release()
        exoPlayer = null
        currentMediaUrl = null
        _playerState.value = PlayerState.Idle
    }
}
