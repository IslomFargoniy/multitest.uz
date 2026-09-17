package uz.multitest.app.presentation.splash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import uz.multitest.app.data.repository.AuthRepository
import javax.inject.Inject

sealed interface SplashDestination {
    data object Pending : SplashDestination
    data object Authenticated : SplashDestination
    data object Unauthenticated : SplashDestination
}

@HiltViewModel
class SplashViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _destination = MutableStateFlow<SplashDestination>(SplashDestination.Pending)
    val destination: StateFlow<SplashDestination> = _destination.asStateFlow()

    init {
        checkAuthStatus()
    }

    private fun checkAuthStatus() {
        viewModelScope.launch {
            delay(1200L) // Branding splash pause
            val isLoggedIn = authRepository.isLoggedIn().first()
            if (isLoggedIn) {
                _destination.value = SplashDestination.Authenticated
            } else {
                _destination.value = SplashDestination.Unauthenticated
            }
        }
    }
}
