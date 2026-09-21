package uz.multitest.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.navigation.compose.rememberNavController
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import uz.multitest.app.core.theme.MultiTestTheme
import uz.multitest.app.presentation.navigation.MultiTestNavGraph

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val _deepLinkOtp = MutableStateFlow<String?>(null)
    val deepLinkOtp: StateFlow<String?> = _deepLinkOtp.asStateFlow()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIntent(intent)
        enableEdgeToEdge()
        setContent {
            MultiTestTheme {
                val navController = rememberNavController()
                MultiTestNavGraph(navController = navController)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val data = intent?.data ?: return
        val otp = data.getQueryParameter("otp") ?: data.getQueryParameter("code")
        if (!otp.isNullOrBlank()) {
            _deepLinkOtp.value = otp.trim()
        }
    }

    fun consumeDeepLinkOtp(): String? {
        val current = _deepLinkOtp.value
        _deepLinkOtp.value = null
        return current
    }
}
