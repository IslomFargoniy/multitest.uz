package uz.multitest.app.presentation.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.AttemptDto
import uz.multitest.app.data.models.TestDto
import uz.multitest.app.data.models.UserDto
import uz.multitest.app.data.repository.AuthRepository
import uz.multitest.app.data.repository.ExamRepository
import uz.multitest.app.data.repository.TestRepository
import javax.inject.Inject

data class DashboardUiState(
    val user: UserDto? = null,
    val recentTests: List<TestDto> = emptyList(),
    val recentAttempts: List<AttemptDto> = emptyList(),
    val isLoading: Boolean = false,
    val isJoiningMock: Boolean = false,
    val mockErrorMessage: String? = null,
    val isMockDialogOpen: Boolean = false,
    val joinedAttemptId: Long? = null,
    val errorMessage: String? = null
)

sealed interface DashboardUiEvent {
    data class NavigateToExam(val attemptId: Long) : DashboardUiEvent
    data class NavigateToTestDetail(val testId: Long) : DashboardUiEvent
}

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val testRepository: TestRepository,
    private val examRepository: ExamRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private val _uiEvent = MutableSharedFlow<DashboardUiEvent>()
    val uiEvent: SharedFlow<DashboardUiEvent> = _uiEvent.asSharedFlow()

    init {
        loadDashboardData()
        observeSavedUser()
    }

    private fun observeSavedUser() {
        viewModelScope.launch {
            authRepository.getSavedUser().collect { user ->
                _uiState.update { it.copy(user = user) }
            }
        }
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            // Fetch profile
            authRepository.getProfile().collect { result ->
                if (result is NetworkResult.Success) {
                    _uiState.update { it.copy(user = result.data) }
                }
            }

            // Fetch featured tests
            testRepository.getTests(page = 1).collect { result ->
                if (result is NetworkResult.Success) {
                    _uiState.update { it.copy(recentTests = result.data ?: emptyList()) }
                }
            }

            // Fetch recent attempts
            examRepository.getMyAttempts(page = 1).collect { result ->
                if (result is NetworkResult.Success) {
                    _uiState.update { it.copy(recentAttempts = result.data ?: emptyList(), isLoading = false) }
                } else if (result is NetworkResult.Error) {
                    _uiState.update { it.copy(isLoading = false) }
                }
            }
        }
    }

    fun openMockDialog() {
        _uiState.update { it.copy(isMockDialogOpen = true, mockErrorMessage = null) }
    }

    fun closeMockDialog() {
        _uiState.update { it.copy(isMockDialogOpen = false, mockErrorMessage = null) }
    }

    fun joinMock(pin: String) {
        viewModelScope.launch {
            examRepository.joinMock(pin).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {
                        _uiState.update { it.copy(isJoiningMock = true, mockErrorMessage = null) }
                    }
                    is NetworkResult.Success -> {
                        _uiState.update { it.copy(isJoiningMock = false, isMockDialogOpen = false) }
                        result.data?.id?.let { attemptId ->
                            _uiEvent.emit(DashboardUiEvent.NavigateToExam(attemptId))
                        }
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isJoiningMock = false,
                                mockErrorMessage = result.message ?: "PIN kod topilmadi yoki yaroqsiz"
                            )
                        }
                    }
                }
            }
        }
    }
}
