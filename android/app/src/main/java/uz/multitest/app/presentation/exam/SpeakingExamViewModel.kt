package uz.multitest.app.presentation.exam

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import uz.multitest.app.core.audio.AudioPlayerManager
import uz.multitest.app.core.audio.AudioRecorderManager
import uz.multitest.app.core.audio.PlayerState
import uz.multitest.app.core.audio.RecorderState
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.*
import uz.multitest.app.data.repository.ExamRepository
import uz.multitest.app.data.repository.QuestionAnswerData
import java.io.File
import javax.inject.Inject

enum class ExamPhase {
    LOADING,
    PART_INTRO,
    QUESTION_AUDIO,
    PREPARATION,
    RECORDING,
    UPLOADING,
    COMPLETED,
    ERROR
}

data class SpeakingExamUiState(
    val attempt: AttemptDto? = null,
    val currentPartIndex: Int = 0,
    val currentQuestionIndex: Int = 0,
    val phase: ExamPhase = ExamPhase.LOADING,
    val secondsRemaining: Int = 0,
    val totalSeconds: Int = 0,
    val recordingAmplitude: Float = 0f,
    val isAudioPromptPlaying: Boolean = false,
    val uploadProgressMessage: String = "",
    val errorMessage: String? = null,
    val violationCount: Int = 0
)

sealed interface SpeakingExamUiEvent {
    data class NavigateToResult(val attemptId: Long) : SpeakingExamUiEvent
}

@HiltViewModel
class SpeakingExamViewModel @Inject constructor(
    private val examRepository: ExamRepository,
    val audioPlayerManager: AudioPlayerManager,
    val audioRecorderManager: AudioRecorderManager,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val attemptId: Long = savedStateHandle.get<Long>("attemptId") ?: 0L

    private val _uiState = MutableStateFlow(SpeakingExamUiState())
    val uiState: StateFlow<SpeakingExamUiState> = _uiState.asStateFlow()

    private val _uiEvent = MutableSharedFlow<SpeakingExamUiEvent>()
    val uiEvent: SharedFlow<SpeakingExamUiEvent> = _uiEvent.asSharedFlow()

    // Map: partId -> List of recorded answers
    private val partAnswersMap = mutableMapOf<Long, MutableList<QuestionAnswerData>>()
    private var currentQuestionStartTime: String? = null

    private var timerJob: Job? = null

    init {
        observeAudioEngine()
        if (attemptId > 0) {
            loadAttempt(attemptId)
        } else {
            _uiState.update { it.copy(phase = ExamPhase.ERROR, errorMessage = "Imtihon ID si topilmadi") }
        }
    }

    private fun observeAudioEngine() {
        viewModelScope.launch {
            audioRecorderManager.recorderState.collect { state ->
                when (state) {
                    is RecorderState.Recording -> {
                        _uiState.update { it.copy(recordingAmplitude = state.amplitude) }
                    }
                    else -> {}
                }
            }
        }

        viewModelScope.launch {
            audioPlayerManager.playerState.collect { state ->
                when (state) {
                    is PlayerState.Playing -> {
                        _uiState.update { it.copy(isAudioPromptPlaying = true) }
                    }
                    is PlayerState.Completed, is PlayerState.Error -> {
                        _uiState.update { it.copy(isAudioPromptPlaying = false) }
                        if (_uiState.value.phase == ExamPhase.QUESTION_AUDIO) {
                            onAudioFinishedOrSkipped()
                        }
                    }
                    else -> {
                        _uiState.update { it.copy(isAudioPromptPlaying = false) }
                    }
                }
            }
        }
    }

    fun loadAttempt(id: Long) {
        viewModelScope.launch {
            _uiState.update { it.copy(phase = ExamPhase.LOADING, errorMessage = null) }
            examRepository.getAttempt(id).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {
                        _uiState.update { it.copy(phase = ExamPhase.LOADING) }
                    }
                    is NetworkResult.Success -> {
                        val attempt = result.data
                        if (attempt != null && attempt.attemptParts.isNotEmpty()) {
                            _uiState.update {
                                it.copy(
                                    attempt = attempt,
                                    currentPartIndex = 0,
                                    currentQuestionIndex = 0
                                )
                            }
                            startCurrentPart()
                        } else {
                            _uiState.update {
                                it.copy(phase = ExamPhase.ERROR, errorMessage = "Imtihon ma'lumotlari topilmadi")
                            }
                        }
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(phase = ExamPhase.ERROR, errorMessage = result.message ?: "Xatolik yuz berdi")
                        }
                    }
                }
            }
        }
    }

    private fun getCurrentPart(): AttemptPartDto? {
        val parts = _uiState.value.attempt?.attemptParts ?: return null
        val idx = _uiState.value.currentPartIndex
        return if (idx in parts.indices) parts[idx] else null
    }

    private fun getCurrentQuestion(): QuestionDto? {
        val part = getCurrentPart()?.part ?: return null
        val idx = _uiState.value.currentQuestionIndex
        return if (idx in part.questions.indices) part.questions[idx] else null
    }

    private fun startCurrentPart() {
        val currentPart = getCurrentPart()
        if (currentPart == null) {
            finishExam()
            return
        }

        // Play part intro audio if available
        currentPart.part?.audioPath?.let { audioUrl ->
            if (audioUrl.isNotBlank()) {
                audioPlayerManager.play(audioUrl)
            }
        }

        _uiState.update {
            it.copy(
                phase = ExamPhase.PART_INTRO,
                currentQuestionIndex = 0
            )
        }
    }

    fun proceedFromPartIntroToQuestions() {
        audioPlayerManager.stop()
        startQuestionFlow()
    }

    private fun startQuestionFlow() {
        val question = getCurrentQuestion()
        if (question == null) {
            uploadCurrentPartAnswers()
            return
        }

        currentQuestionStartTime = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())

        val hasAudio = !question.audioPath.isNullOrBlank()

        if (hasAudio) {
            _uiState.update {
                it.copy(
                    phase = ExamPhase.QUESTION_AUDIO,
                    secondsRemaining = 0,
                    totalSeconds = 0,
                    isAudioPromptPlaying = true
                )
            }
            audioPlayerManager.play(question.audioPath!!)

            // Safety timeout (45s) in case audio stream fails to fire onComplete
            timerJob?.cancel()
            timerJob = viewModelScope.launch {
                delay(45_000L)
                if (_uiState.value.phase == ExamPhase.QUESTION_AUDIO) {
                    onAudioFinishedOrSkipped()
                }
            }
        } else {
            onAudioFinishedOrSkipped()
        }
    }

    private fun onAudioFinishedOrSkipped() {
        timerJob?.cancel()
        audioPlayerManager.stop()

        val question = getCurrentQuestion() ?: return
        val readySeconds = question.readySecond

        if (readySeconds > 0) {
            _uiState.update {
                it.copy(
                    phase = ExamPhase.PREPARATION,
                    secondsRemaining = readySeconds,
                    totalSeconds = readySeconds,
                    isAudioPromptPlaying = false
                )
            }

            timerJob = viewModelScope.launch {
                for (sec in readySeconds downTo 1) {
                    _uiState.update { it.copy(secondsRemaining = sec) }
                    delay(1000L)
                }
                startQuestionRecording()
            }
        } else {
            startQuestionRecording()
        }
    }

    fun startRecordingNow() {
        if (_uiState.value.phase == ExamPhase.QUESTION_AUDIO || _uiState.value.phase == ExamPhase.PREPARATION) {
            timerJob?.cancel()
            audioPlayerManager.stop()
            startQuestionRecording()
        }
    }

    private fun startQuestionRecording() {
        val question = getCurrentQuestion() ?: return
        audioPlayerManager.stop()
        val answerSeconds = question.answerSecond.coerceAtLeast(10)

        // Start voice recording
        audioRecorderManager.startRecording("q_${question.id}")

        _uiState.update {
            it.copy(
                phase = ExamPhase.RECORDING,
                secondsRemaining = answerSeconds,
                totalSeconds = answerSeconds,
                isAudioPromptPlaying = false
            )
        }

        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            for (sec in answerSeconds downTo 1) {
                _uiState.update { it.copy(secondsRemaining = sec) }
                delay(1000L)
            }
            stopRecordingAndNextQuestion()
        }
    }

    fun finishRecordingEarly() {
        if (_uiState.value.phase == ExamPhase.RECORDING) {
            timerJob?.cancel()
            stopRecordingAndNextQuestion()
        }
    }

    private fun stopRecordingAndNextQuestion() {
        val question = getCurrentQuestion() ?: return
        val currentPart = getCurrentPart() ?: return
        val audioFile = audioRecorderManager.stopRecording()

        val finishedTime = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())

        val answerData = QuestionAnswerData(
            questionId = question.id,
            audioFile = audioFile,
            startedAt = currentQuestionStartTime,
            finishedAt = finishedTime
        )

        val list = partAnswersMap.getOrPut(currentPart.id) { mutableListOf() }
        list.add(answerData)

        // Next question or next part
        val partQuestions = currentPart.part?.questions ?: emptyList()
        val nextQuestionIdx = _uiState.value.currentQuestionIndex + 1

        if (nextQuestionIdx < partQuestions.size) {
            _uiState.update { it.copy(currentQuestionIndex = nextQuestionIdx) }
            startQuestionFlow()
        } else {
            // Part finished -> Upload
            uploadCurrentPartAnswers()
        }
    }

    private fun uploadCurrentPartAnswers() {
        val currentPart = getCurrentPart() ?: return
        val recordedAnswers = partAnswersMap[currentPart.id] ?: emptyList()

        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    phase = ExamPhase.UPLOADING,
                    uploadProgressMessage = "${currentPart.part?.name ?: "Bo'lim"} javoblari yuklanmoqda..."
                )
            }

            examRepository.uploadPartAnswers(currentPart.id, recordedAnswers).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {}
                    is NetworkResult.Success -> {
                        // Move to next part
                        val nextPartIdx = _uiState.value.currentPartIndex + 1
                        val totalParts = _uiState.value.attempt?.attemptParts?.size ?: 0

                        if (nextPartIdx < totalParts) {
                            _uiState.update { it.copy(currentPartIndex = nextPartIdx) }
                            startCurrentPart()
                        } else {
                            finishExam()
                        }
                    }
                    is NetworkResult.Error -> {
                        // Retry or proceed
                        val nextPartIdx = _uiState.value.currentPartIndex + 1
                        val totalParts = _uiState.value.attempt?.attemptParts?.size ?: 0

                        if (nextPartIdx < totalParts) {
                            _uiState.update { it.copy(currentPartIndex = nextPartIdx) }
                            startCurrentPart()
                        } else {
                            finishExam()
                        }
                    }
                }
            }
        }
    }

    private fun finishExam() {
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    phase = ExamPhase.UPLOADING,
                    uploadProgressMessage = "Imtihon yakunlanmoqda..."
                )
            }

            examRepository.finishAttempt(attemptId).collect {
                _uiState.update { it.copy(phase = ExamPhase.COMPLETED) }
                _uiEvent.emit(SpeakingExamUiEvent.NavigateToResult(attemptId))
            }
        }
    }

    fun onAppBackgrounded() {
        if (_uiState.value.phase == ExamPhase.QUESTION_AUDIO || _uiState.value.phase == ExamPhase.PREPARATION || _uiState.value.phase == ExamPhase.RECORDING) {
            _uiState.update { it.copy(violationCount = it.violationCount + 1) }
            viewModelScope.launch {
                examRepository.recordViolation(attemptId)
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        timerJob?.cancel()
        audioPlayerManager.release()
        audioRecorderManager.release()
    }
}
