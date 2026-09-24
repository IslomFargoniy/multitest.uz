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
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(bottom = 40.dp)
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
                                            .size(68.dp)
                                            .clip(CircleShape)
                                            .background(Color.White.copy(alpha = 0.2f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Rounded.EmojiEvents,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(38.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(14.dp))

                                    Text(
                                        text = if (attempt.score != null || attempt.aiScoreAvg != null) "Imtihon Natijasi" else "Muvaffaqiyatli Yakunlandi!",
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

                                    Spacer(modifier = Modifier.height(14.dp))

                                    val finalScore = attempt.score ?: attempt.aiScoreAvg
                                    if (finalScore != null) {
                                        Surface(
                                            shape = RoundedCornerShape(16.dp),
                                            color = Color.White.copy(alpha = 0.25f)
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(
                                                    text = if (attempt.score != null) "${attempt.score} Ball" else "${String.format("%.1f", finalScore)} Ball",
                                                    style = MaterialTheme.typography.headlineMedium.copy(
                                                        fontWeight = FontWeight.Black,
                                                        color = Color.White
                                                    )
                                                )
                                                if (attempt.score == null && attempt.aiScoreAvg != null) {
                                                    Spacer(modifier = Modifier.width(6.dp))
                                                    Surface(
                                                        shape = RoundedCornerShape(6.dp),
                                                        color = Color.White.copy(alpha = 0.3f)
                                                    ) {
                                                        Text(
                                                            text = "AI",
                                                            style = MaterialTheme.typography.labelSmall.copy(
                                                                color = Color.White,
                                                                fontWeight = FontWeight.Bold
                                                            ),
                                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        Surface(
                                            shape = RoundedCornerShape(14.dp),
                                            color = Color.White.copy(alpha = 0.2f)
                                        ) {
                                            Text(
                                                text = "⏳ Natija kutilmoqda (Tekshirilmoqda)",
                                                style = MaterialTheme.typography.labelLarge.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color.White
                                                ),
                                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(12.dp))

                                    Text(
                                        text = "Topshirildi: ${uz.multitest.app.presentation.components.formatExamDateTime(attempt.startedAt)}",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = Color.White.copy(alpha = 0.8f)
                                        )
                                    )
                                }
                            }
                        }
                    }

                    // Anti-Cheat or Teacher Review Notice
                    if (attempt.tabSwitchCount > 0) {
                        item {
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = RosePink.copy(alpha = 0.12f),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.Warning,
                                        contentDescription = null,
                                        tint = RosePink,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = "Imtihon paytida ${attempt.tabSwitchCount} marta oynadan chiqish holati qayd etildi.",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = RosePink,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    )
                                }
                            }
                        }
                    }

                    if (!attempt.review.isNullOrBlank()) {
                        item {
                            MultiTestCard(shape = RoundedCornerShape(18.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Rounded.RateReview,
                                        contentDescription = null,
                                        tint = IndigoPrimary,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "O'qituvchi Xulosasi:",
                                        style = MaterialTheme.typography.labelLarge.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = attempt.review,
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        color = MaterialTheme.colorScheme.onSurface,
                                        lineHeight = 22.sp
                                    )
                                )
                            }
                        }
                    }

                    // Answers Review Title
                    item {
                        Text(
                            text = "Savollar va Yozilgan Javoblar:",
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
    val answers = attemptPart.allAnswers

    MultiTestCard(shape = RoundedCornerShape(18.dp)) {
        Text(
            text = attemptPart.part?.name ?: "Bo'lim",
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        if (answers.isEmpty()) {
            Text(
                text = "Bu bo'limda yozib olingan javoblar topilmadi.",
                style = MaterialTheme.typography.bodySmall.copy(
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            )
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                answers.forEachIndexed { index, answer ->
                    val question = answer.question ?: attemptPart.part?.questions?.getOrNull(index)
                    val isCurrentAnswerPlaying = isPlaying && !answer.audioPath.isNullOrBlank() && currentAudioUrl?.contains(answer.audioPath) == true

                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.6f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            // Question header & score badge
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = IndigoPrimary.copy(alpha = 0.12f)
                                ) {
                                    Text(
                                        text = "Savol ${index + 1}",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = IndigoPrimary
                                        ),
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }

                                val answerScore = answer.score ?: answer.scoreAi
                                if (answerScore != null) {
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = EmeraldGreen.copy(alpha = 0.15f)
                                    ) {
                                        Text(
                                            text = "${answerScore} Ball",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontWeight = FontWeight.ExtraBold,
                                                color = EmeraldGreen
                                            ),
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                            }

                            // Question Text
                            if (!question?.textarea.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = uz.multitest.app.presentation.components.parseHtmlToPlainText(question?.textarea),
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        lineHeight = 22.sp
                                    )
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Candidate Audio Player
                            if (!answer.audioPath.isNullOrBlank()) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(IndigoPrimary.copy(alpha = 0.08f))
                                        .clickable { onPlayAudio(answer.audioPath) }
                                        .padding(horizontal = 12.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = if (isCurrentAnswerPlaying) Icons.Rounded.PauseCircle else Icons.Rounded.PlayCircle,
                                            contentDescription = null,
                                            tint = IndigoPrimary,
                                            modifier = Modifier.size(28.dp)
                                        )
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Text(
                                            text = if (isCurrentAnswerPlaying) "Ijro etilmoqda..." else "Ovozingizni tinglash",
                                            style = MaterialTheme.typography.bodyMedium.copy(
                                                color = MaterialTheme.colorScheme.onSurface,
                                                fontWeight = FontWeight.Medium
                                            )
                                        )
                                    }
                                    if (answer.audioSecond != null && answer.audioSecond > 0) {
                                        Text(
                                            text = "${answer.audioSecond.toInt()}s",
                                            style = MaterialTheme.typography.bodySmall.copy(
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        )
                                    }
                                }
                            }

                            // AI Speech Transcript
                            if (!answer.transcript.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Column {
                                    Text(
                                        text = "Nutq matni (Transkript):",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "\"${answer.transcript}\"",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                            lineHeight = 18.sp
                                        )
                                    )
                                }
                            }

                            // AI / Teacher Feedback
                            val reviewText = answer.review ?: answer.reviewAi
                            if (!reviewText.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = CoralOrange.copy(alpha = 0.08f),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(8.dp)) {
                                        Text(
                                            text = "Tahlil va Tavsiya:",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontWeight = FontWeight.Bold,
                                                color = CoralOrange
                                            )
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = reviewText,
                                            style = MaterialTheme.typography.bodySmall.copy(
                                                color = MaterialTheme.colorScheme.onSurface,
                                                lineHeight = 18.sp
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
