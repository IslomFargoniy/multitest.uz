package uz.multitest.app.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.UserDto
import uz.multitest.app.data.repository.AuthRepository
import javax.inject.Inject

enum class AuthTab {
    TELEGRAM_OTP,
    CANDIDATE_CODE
}

data class AuthUiState(
    val selectedTab: AuthTab = AuthTab.TELEGRAM_OTP,
    val otp: String = "",
    val candidateCode: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isSuccess: Boolean = false
)

sealed interface AuthUiEvent {
    data object NavigateToMain : AuthUiEvent
    data class NavigateToExam(val attemptId: Long) : AuthUiEvent
    data class ShowToast(val message: String) : AuthUiEvent
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val _uiEvent = MutableSharedFlow<AuthUiEvent>()
    val uiEvent: SharedFlow<AuthUiEvent> = _uiEvent.asSharedFlow()

    fun onTabSelected(tab: AuthTab) {
        _uiState.update { it.copy(selectedTab = tab, errorMessage = null) }
    }

    fun onCandidateCodeChanged(newCode: String) {
        val filtered = newCode.uppercase().filter { it.isLetterOrDigit() }.take(12)
        _uiState.update { it.copy(candidateCode = filtered, errorMessage = null) }
    }

    fun loginWithCandidateCode(code: String = _uiState.value.candidateCode) {
        if (code.isBlank() || code.length < 8) {
            _uiState.update { it.copy(errorMessage = "Nomzod kodini to'liq kiriting (masalan: MS12345678)") }
            return
        }

        viewModelScope.launch {
            authRepository.loginWithCandidateCode(code).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {
                        _uiState.update { it.copy(isLoading = true, errorMessage = null) }
                    }
                    is NetworkResult.Success -> {
                        _uiState.update { it.copy(isLoading = false, isSuccess = true) }
                        val attemptId = result.data?.attemptId
                        if (attemptId != null) {
                            _uiEvent.emit(AuthUiEvent.NavigateToExam(attemptId))
                        } else {
                            _uiEvent.emit(AuthUiEvent.NavigateToMain)
                        }
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = result.message ?: "Nomzod kodi noto'g'ri yoki imtihon vaqti o'tgan"
                            )
                        }
                    }
                }
            }
        }
    }

    fun onOtpChanged(newOtp: String) {
        _uiState.update { it.copy(otp = newOtp, errorMessage = null) }
        if (newOtp.length == 6) {
            loginWithOtp(newOtp)
        }
    }

    fun loginWithOtp(otp: String = _uiState.value.otp) {
        if (otp.length < 6) {
            _uiState.update { it.copy(errorMessage = "6 xonali kodni to'liq kiriting") }
            return
        }

        viewModelScope.launch {
            authRepository.loginWithOtp(otp).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {
                        _uiState.update { it.copy(isLoading = true, errorMessage = null) }
                    }
                    is NetworkResult.Success -> {
                        _uiState.update { it.copy(isLoading = false, isSuccess = true) }
                        _uiEvent.emit(AuthUiEvent.NavigateToMain)
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = result.message ?: "Kod noto'g'ri yoki muddati o'tgan"
                            )
                        }
                    }
                }
            }
        }
    }

    fun loginWithGoogleToken(idToken: String) {
        viewModelScope.launch {
            authRepository.loginWithGoogle(idToken).collect { result ->
                when (result) {
                    is NetworkResult.Loading -> {
                        _uiState.update { it.copy(isLoading = true, errorMessage = null) }
                    }
                    is NetworkResult.Success -> {
                        _uiState.update { it.copy(isLoading = false, isSuccess = true) }
                        _uiEvent.emit(AuthUiEvent.NavigateToMain)
                    }
                    is NetworkResult.Error -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = result.message ?: "Google orqali kirishda xatolik yuz berdi"
                            )
                        }
                    }
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}
