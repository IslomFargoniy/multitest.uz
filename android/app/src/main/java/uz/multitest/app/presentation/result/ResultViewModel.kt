package uz.multitest.app.presentation.result

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import uz.multitest.app.core.audio.AudioPlayerManager
import uz.multitest.app.core.audio.PlayerState
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.AttemptDto
import uz.multitest.app.data.repository.ExamRepository
import javax.inject.Inject

data class ResultUiState(
    val attempt: AttemptDto? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val currentlyPlayingAudioUrl: String? = null,
    val isPlaying: Boolean = false
)

@HiltViewModel
class ResultViewModel @Inject constructor(
    private val examRepository: ExamRepository,
    val audioPlayerManager: AudioPlayerManager,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val attemptId: Long = savedStateHandle.get<Long>("attemptId") ?: 0L

    private val _uiState = MutableStateFlow(ResultUiState())
    val uiState: StateFlow<ResultUiState> = _uiState.asStateFlow()

    init {
        if (attemptId > 0) {
            loadResult(attemptId)
        }
        observeAudioPlayer()
    }

    private fun observeAudioPlayer() {
        viewModelScope.launch {
            audioPlayerManager.playerState.collect { state ->
                when (state) {
                    is PlayerState.Playing -> {
                        _uiState.update { it.copy(isPlaying = true) }
                    }
                    is PlayerState.Paused, is PlayerState.Completed, is PlayerState.Idle, is PlayerState.Error -> {
                        _uiState.update { it.copy(isPlaying = false) }
                    }
                    else -> {}
                }
            }
        }
    }

    fun loadResult(id: Long) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            examRepository.getAttempt(id).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {
                        _uiState.update { it.copy(isLoading = true) }
                    }
                    is NetworkResult.Success -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                attempt = result.data
                            )
                        }
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = result.message ?: "Natijalarni yuklashda xatolik"
                            )
                        }
                    }
                }
            }
        }
    }

    fun togglePlayAudio(audioUrl: String) {
        val fullUrl = if (audioUrl.startsWith("http")) audioUrl else "https://multitest.uz/storage/$audioUrl"
        if (_uiState.value.currentlyPlayingAudioUrl == fullUrl && _uiState.value.isPlaying) {
            audioPlayerManager.pause()
        } else {
            _uiState.update { it.copy(currentlyPlayingAudioUrl = fullUrl) }
            audioPlayerManager.play(fullUrl)
        }
    }

    override fun onCleared() {
        super.onCleared()
        audioPlayerManager.release()
    }
}
