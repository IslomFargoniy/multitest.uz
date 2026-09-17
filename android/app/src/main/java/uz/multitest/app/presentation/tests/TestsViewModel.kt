package uz.multitest.app.presentation.tests

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.TestDto
import uz.multitest.app.data.repository.ExamRepository
import uz.multitest.app.data.repository.TestRepository
import javax.inject.Inject

data class TestsUiState(
    val tests: List<TestDto> = emptyList(),
    val currentTest: TestDto? = null,
    val selectedPartIds: Set<Long> = emptySet(),
    val searchQuery: String = "",
    val selectedLanguageId: Long? = null,
    val isLoading: Boolean = false,
    val isStartingTest: Boolean = false,
    val errorMessage: String? = null
)

sealed interface TestsUiEvent {
    data class NavigateToExam(val attemptId: Long) : TestsUiEvent
}

@HiltViewModel
class TestsViewModel @Inject constructor(
    private val testRepository: TestRepository,
    private val examRepository: ExamRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _uiState = MutableStateFlow(TestsUiState())
    val uiState: StateFlow<TestsUiState> = _uiState.asStateFlow()

    private val _uiEvent = MutableSharedFlow<TestsUiEvent>()
    val uiEvent: SharedFlow<TestsUiEvent> = _uiEvent.asSharedFlow()

    private var searchJob: Job? = null

    init {
        val testId = savedStateHandle.get<Long>("testId")
        if (testId != null && testId > 0) {
            loadTestDetail(testId)
        } else {
            loadTests()
        }
    }

    fun loadTests() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            testRepository.getTests(
                search = _uiState.value.searchQuery.ifBlank { null },
                languageId = _uiState.value.selectedLanguageId
            ).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {
                        _uiState.update { it.copy(isLoading = true) }
                    }
                    is NetworkResult.Success -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                tests = result.data ?: emptyList()
                            )
                        }
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = result.message ?: "Testlarni yuklashda xatolik"
                            )
                        }
                    }
                }
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(400L)
            loadTests()
        }
    }

    fun onLanguageSelected(langId: Long?) {
        _uiState.update { it.copy(selectedLanguageId = langId) }
        loadTests()
    }

    fun loadTestDetail(testId: Long) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            testRepository.getTestDetail(testId).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {
                        _uiState.update { it.copy(isLoading = true) }
                    }
                    is NetworkResult.Success -> {
                        val test = result.data
                        val allPartIds = test?.parts?.map { it.id }?.toSet() ?: emptySet()
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                currentTest = test,
                                selectedPartIds = allPartIds
                            )
                        }
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = result.message ?: "Test ma'lumotlarini yuklashda xatolik"
                            )
                        }
                    }
                }
            }
        }
    }

    fun togglePartSelection(partId: Long) {
        _uiState.update { state ->
            val current = state.selectedPartIds.toMutableSet()
            if (current.contains(partId)) {
                if (current.size > 1) current.remove(partId) // At least 1 part required
            } else {
                current.add(partId)
            }
            state.copy(selectedPartIds = current)
        }
    }

    fun startTest(testId: Long) {
        val selectedParts = _uiState.value.selectedPartIds.toList().ifEmpty { null }
        viewModelScope.launch {
            examRepository.startAttempt(testId, selectedParts).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {
                        _uiState.update { it.copy(isStartingTest = true, errorMessage = null) }
                    }
                    is NetworkResult.Success -> {
                        _uiState.update { it.copy(isStartingTest = false) }
                        result.data?.id?.let { attemptId ->
                            _uiEvent.emit(TestsUiEvent.NavigateToExam(attemptId))
                        }
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isStartingTest = false,
                                errorMessage = result.message ?: "Imtihonni boshlashda xatolik"
                            )
                        }
                    }
                }
            }
        }
    }
}
