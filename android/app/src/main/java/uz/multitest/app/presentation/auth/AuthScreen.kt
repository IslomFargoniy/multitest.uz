package uz.multitest.app.presentation.auth

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Send
import androidx.compose.material.icons.rounded.Key
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import uz.multitest.app.MainActivity
import uz.multitest.app.core.theme.*
import uz.multitest.app.core.util.Constants
import uz.multitest.app.presentation.components.MultiTestCard
import uz.multitest.app.presentation.components.OtpInputField
import uz.multitest.app.presentation.components.PrimaryButton

@Composable
fun AuthScreen(
    onNavigateToMain: () -> Unit,
    onNavigateToExam: (Long) -> Unit = {},
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val activity = context as? MainActivity

    // Listen to deep links (both initial and onNewIntent)
    val deepLinkOtp by activity?.deepLinkOtp?.collectAsStateWithLifecycle() ?: remember { mutableStateOf(null) }

    LaunchedEffect(deepLinkOtp) {
        deepLinkOtp?.let { otp ->
            if (otp.isNotBlank()) {
                viewModel.onOtpChanged(otp.trim())
                activity?.consumeDeepLinkOtp()
            }
        }
    }

    LaunchedEffect(Unit) {
        viewModel.uiEvent.collect { event ->
            when (event) {
                is AuthUiEvent.NavigateToMain -> onNavigateToMain()
                is AuthUiEvent.NavigateToExam -> onNavigateToExam(event.attemptId)
                is AuthUiEvent.ShowToast -> Toast.makeText(context, event.message, Toast.LENGTH_SHORT).show()
            }
        }
    }

    val openTelegramBot = {
        try {
            val tgIntent = Intent(Intent.ACTION_VIEW, Uri.parse("tg://resolve?domain=${Constants.TELEGRAM_BOT_USERNAME}&start=code")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(tgIntent)
        } catch (e: Exception) {
            try {
                val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse(Constants.TELEGRAM_BOT_URL)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(webIntent)
            } catch (e2: Exception) {
                Toast.makeText(context, "Telegram ilovasi yoki brauzer topilmadi", Toast.LENGTH_SHORT).show()
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Branding Logo
            Image(
                painter = androidx.compose.ui.res.painterResource(id = uz.multitest.app.R.drawable.ic_logo),
                contentDescription = "MultiTest Logo",
                modifier = Modifier.size(80.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "MultiTest ga xush kelibsiz",
                style = MaterialTheme.typography.headlineSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = when (uiState.selectedTab) {
                    AuthTab.TELEGRAM_OTP -> "Telegram bot orqali 6 xonali tasdiqlash kodini oling"
                    AuthTab.CANDIDATE_CODE -> "O'qituvchi bergan 8 xonali nomzod kodi orqali imtihonga ulaning"
                },
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Segmented Tab Switcher
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    val isOtpTab = uiState.selectedTab == AuthTab.TELEGRAM_OTP
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isOtpTab) MaterialTheme.colorScheme.primary else Color.Transparent)
                            .clickable { viewModel.onTabSelected(AuthTab.TELEGRAM_OTP) }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Telegram OTP",
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = if (isOtpTab) FontWeight.Bold else FontWeight.Medium,
                                color = if (isOtpTab) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        )
                    }

                    val isCandidateTab = uiState.selectedTab == AuthTab.CANDIDATE_CODE
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isCandidateTab) MaterialTheme.colorScheme.primary else Color.Transparent)
                            .clickable { viewModel.onTabSelected(AuthTab.CANDIDATE_CODE) }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Mock Kodi",
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = if (isCandidateTab) FontWeight.Bold else FontWeight.Medium,
                                color = if (isCandidateTab) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            if (uiState.selectedTab == AuthTab.TELEGRAM_OTP) {
                // Telegram Bot Card
                MultiTestCard(
                    onClick = openTelegramBot,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF229ED9)), // Telegram Blue
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Rounded.Send,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "@MultitestUzBot",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            )
                            Text(
                                text = "Kodni olish uchun bosing",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.primary
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // OTP Input
                Text(
                    text = "6 xonali kodni kiriting",
                    style = MaterialTheme.typography.labelLarge.copy(
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                OtpInputField(
                    otpValue = uiState.otp,
                    onOtpChange = { viewModel.onOtpChanged(it) },
                    onComplete = { viewModel.loginWithOtp(it) }
                )

                if (uiState.errorMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = uiState.errorMessage!!,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = NightDestructive,
                            fontWeight = FontWeight.Medium
                        ),
                        textAlign = TextAlign.Center
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                PrimaryButton(
                    text = "Tasdiqlash va Kirish",
                    onClick = { viewModel.loginWithOtp() },
                    isLoading = uiState.isLoading,
                    enabled = uiState.otp.length == 6
                )
            } else {
                // Mock Candidate Code Entry
                MultiTestCard(
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Key,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(28.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "Mock Imtihonga Ulanish",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            ),
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "O'qituvchi bergan kodni kiriting",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            ),
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        OutlinedTextField(
                            value = uiState.candidateCode,
                            onValueChange = { viewModel.onCandidateCodeChanged(it) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            placeholder = {
                                Text(
                                    text = "MS12345678",
                                    modifier = Modifier.fillMaxWidth(),
                                    textAlign = TextAlign.Center
                                )
                            },
                            textStyle = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center,
                                letterSpacing = 2.sp
                            ),
                            keyboardOptions = KeyboardOptions(
                                capitalization = KeyboardCapitalization.Characters,
                                keyboardType = KeyboardType.Ascii,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(
                                onDone = {
                                    if (uiState.candidateCode.length >= 8) {
                                        viewModel.loginWithCandidateCode()
                                    }
                                }
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )

                        if (uiState.errorMessage != null) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = uiState.errorMessage!!,
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = NightDestructive,
                                    fontWeight = FontWeight.Medium
                                ),
                                textAlign = TextAlign.Center
                            )
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        PrimaryButton(
                            text = "Imtihonni Boshlash",
                            onClick = { viewModel.loginWithCandidateCode() },
                            isLoading = uiState.isLoading,
                            enabled = uiState.candidateCode.length >= 8
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))
        }
    }
}
