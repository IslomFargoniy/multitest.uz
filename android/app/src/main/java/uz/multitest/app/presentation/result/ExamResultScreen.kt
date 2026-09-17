package uz.multitest.app.presentation.result

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import uz.multitest.app.core.theme.*
import uz.multitest.app.data.models.AttemptPartDto
import uz.multitest.app.presentation.components.ErrorStateView
import uz.multitest.app.presentation.components.GradientButton
import uz.multitest.app.presentation.components.LoadingStateView
import uz.multitest.app.presentation.components.MultiTestCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExamResultScreen(
    attemptId: Long,
    onNavigateToMain: () -> Unit,
    onRetryTest: (Long) -> Unit,
    viewModel: ResultViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val attempt = uiState.attempt

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Imtihon Natijasi",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { innerPadding ->
        when {
            uiState.isLoading && attempt == null -> {
                LoadingStateView(message = "Natijalar hisoblanmoqda...")
            }
            uiState.errorMessage != null && attempt == null -> {
                ErrorStateView(
                    message = uiState.errorMessage!!,
                    onRetry = { viewModel.loadResult(attemptId) }
                )
            }
            attempt != null -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .padding(horizontal = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Hero Score Card
                    item {
                        Card(
                            shape = RoundedCornerShape(24.dp),
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.Transparent)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        Brush.linearGradient(
                                            listOf(IndigoPrimary, IndigoAccent, RosePink)
                                        )
                                    )
                                    .padding(24.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(72.dp)
                                            .clip(CircleShape)
                                            .background(Color.White.copy(alpha = 0.2f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Rounded.EmojiEvents,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(42.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(16.dp))

                                    Text(
                                        text = "Muvaffaqiyatli Yakunlandi!",
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.ExtraBold,
                                            color = Color.White
                                        )
                                    )

                                    Spacer(modifier = Modifier.height(6.dp))

                                    Text(
                                        text = attempt.name ?: attempt.test?.name ?: "Speaking Test",
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            color = Color.White.copy(alpha = 0.9f)
                                        ),
                                        textAlign = TextAlign.Center
                                    )

                                    if (attempt.score != null) {
                                        Spacer(modifier = Modifier.height(16.dp))
                                        Surface(
                                            shape = RoundedCornerShape(16.dp),
                                            color = Color.White.copy(alpha = 0.25f)
                                        ) {
                                            Text(
                                                text = "${attempt.score} Ball",
                                                style = MaterialTheme.typography.headlineMedium.copy(
                                                    fontWeight = FontWeight.Black,
                                                    color = Color.White
                                                ),
                                                modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Answers Review Title
                    item {
                        Text(
                            text = "Yozib olingan javoblar:",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                        )
                    }

                    // Parts and Questions
                    items(attempt.attemptParts) { attemptPart ->
                        AttemptPartReviewCard(
                            attemptPart = attemptPart,
                            isPlaying = uiState.isPlaying,
                            currentAudioUrl = uiState.currentlyPlayingAudioUrl,
                            onPlayAudio = { audioPath -> viewModel.togglePlayAudio(audioPath) }
                        )
                    }

                    // Bottom Action Buttons
                    item {
                        Spacer(modifier = Modifier.height(8.dp))
                        GradientButton(
                            text = "Bosh Sahifaga Qaytish",
                            onClick = onNavigateToMain,
                            icon = Icons.Rounded.Home
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        if (attempt.testId != null) {
                            OutlinedButton(
                                onClick = { onRetryTest(attempt.testId) },
                                modifier = Modifier.fillMaxWidth().height(52.dp),
                                shape = RoundedCornerShape(16.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.Refresh,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Qayta Topshirish")
                            }
                        }
                        Spacer(modifier = Modifier.height(30.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun AttemptPartReviewCard(
    attemptPart: AttemptPartDto,
    isPlaying: Boolean,
    currentAudioUrl: String?,
    onPlayAudio: (String) -> Unit
) {
    MultiTestCard(shape = RoundedCornerShape(18.dp)) {
        Text(
            text = attemptPart.part?.name ?: "Bo'lim",
            style = MaterialTheme.typography.titleSmall.copy(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        )

        Spacer(modifier = Modifier.height(10.dp))

        attemptPart.answers.forEachIndexed { index, answer ->
            val isCurrentAnswerPlaying = isPlaying && currentAudioUrl?.contains(answer.audioPath ?: "---") == true

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Mic,
                        contentDescription = null,
                        tint = IndigoAccent,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Savol ${index + 1} ovozli javobi",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                }

                if (!answer.audioPath.isNullOrBlank()) {
                    IconButton(
                        onClick = { onPlayAudio(answer.audioPath) }
                    ) {
                        Icon(
                            imageVector = if (isCurrentAnswerPlaying) Icons.Rounded.PauseCircle else Icons.Rounded.PlayCircle,
                            contentDescription = "Tinglash",
                            tint = IndigoPrimary,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }
            }
        }
    }
}
