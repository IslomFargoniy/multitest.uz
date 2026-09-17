package uz.multitest.app.presentation.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.AttemptDto
import uz.multitest.app.data.models.UserDto
import uz.multitest.app.data.repository.AuthRepository
import uz.multitest.app.data.repository.ExamRepository
import javax.inject.Inject

data class ProfileUiState(
    val user: UserDto? = null,
    val attempts: List<AttemptDto> = emptyList(),
    val isLoading: Boolean = false,
    val isLoggingOut: Boolean = false,
    val errorMessage: String? = null
)

sealed interface ProfileUiEvent {
    data object NavigateToAuth : ProfileUiEvent
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val examRepository: ExamRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    private val _uiEvent = MutableSharedFlow<ProfileUiEvent>()
    val uiEvent: SharedFlow<ProfileUiEvent> = _uiEvent.asSharedFlow()

    init {
        loadProfileAndHistory()
    }

    fun loadProfileAndHistory() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            authRepository.getProfile().collect { result ->
                if (result is NetworkResult.Success) {
                    _uiState.update { it.copy(user = result.data) }
                }
            }

            examRepository.getMyAttempts(page = 1).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {}
                    is NetworkResult.Success -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                attempts = result.data ?: emptyList()
                            )
                        }
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = result.message ?: "Tarixni yuklashda xatolik"
                            )
                        }
                    }
                }
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoggingOut = true) }
            authRepository.logout().collect {
                _uiState.update { it.copy(isLoggingOut = false) }
                _uiEvent.emit(ProfileUiEvent.NavigateToAuth)
            }
        }
    }
}
