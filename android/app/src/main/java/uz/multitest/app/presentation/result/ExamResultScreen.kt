package uz.multitest.app.presentation.result

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import uz.multitest.app.core.theme.*
import uz.multitest.app.data.models.AttemptAnswerDto
import uz.multitest.app.data.models.AttemptPartDto
import uz.multitest.app.presentation.components.*

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

    val testName = attempt?.name ?: attempt?.test?.name ?: "Speaking Test"
    val examDate = formatExamDateTime(attempt?.startedAt)

    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = {
                    IconButton(onClick = onNavigateToMain) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Rounded.ArrowBack,
                            contentDescription = "Orqaga",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                title = {
                    Column {
                        Text(
                            text = "Natija",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        )
                        if (attempt != null) {
                            Text(
                                text = "$testName • $examDate",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
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
                val finalScore = attempt.score?.toInt() ?: attempt.aiScoreAvg?.toInt()
                val isTeacherGraded = attempt.score != null

                // Answers & no_speech calculation per §4.1
                val allAnswers = remember(attempt) { attempt.attemptParts.flatMap { it.allAnswers } }
                val noSpeechCount = remember(allAnswers) {
                    allAnswers.count { answer ->
                        val eval = parseAiReview(answer.review ?: answer.reviewAi)
                        eval?.overrideReason == "no_speech" ||
                                (answer.audioPath.isNullOrBlank() && (answer.score ?: answer.scoreAi) == null)
                    }
                }

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .padding(horizontal = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(top = 8.dp, bottom = 40.dp)
                ) {
                    // Score Summary Card (§4 & §6.2)
                    item {
                        ScoreSummaryCard(
                            score = finalScore,
                            max = 75,
                            isTeacherGraded = isTeacherGraded
                        )
                    }

                    // Notice if AI evaluated and teacher hasn't graded yet
                    if (!isTeacherGraded && attempt.aiScoreAvg != null) {
                        item {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant,
                                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.Info,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = "AI bahosi · o'qituvchi hali baholamagan",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            fontWeight = FontWeight.Medium
                                        )
                                    )
                                }
                            }
                        }
                    }

                    // Warning banner if any no_speech per §4.1
                    if (noSpeechCount > 0) {
                        item {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = NightWarningBg,
                                border = androidx.compose.foundation.BorderStroke(1.dp, NightWarning.copy(alpha = 0.3f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.Warning,
                                        contentDescription = null,
                                        tint = NightWarning,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(
                                            text = "Ovoz eshitilmadi ($noSpeechCount ta javob)",
                                            style = MaterialTheme.typography.labelMedium.copy(
                                                fontWeight = FontWeight.Bold,
                                                color = NightWarning
                                            )
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = "Ba'zi savollarga javob yozilmadi yoki mikrofondan signal kelmadi.",
                                            style = MaterialTheme.typography.bodySmall.copy(
                                                color = MaterialTheme.colorScheme.onSurface
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Anti-Cheat notice
                    if (attempt.tabSwitchCount > 0) {
                        item {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = NightDestructiveBg,
                                border = androidx.compose.foundation.BorderStroke(1.dp, NightDestructive.copy(alpha = 0.3f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.Security,
                                        contentDescription = null,
                                        tint = NightDestructive,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = "Imtihon paytida ${attempt.tabSwitchCount} marta boshqa ilovaga o'tish holati qayd etildi.",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = NightDestructive,
                                            fontWeight = FontWeight.Medium
                                        )
                                    )
                                }
                            }
                        }
                    }

                    // Teacher General Review if available
                    if (!attempt.review.isNullOrBlank()) {
                        item {
                            val attemptEvaluation = remember(attempt.review) { parseAiReview(attempt.review) }
                            MultiTestCard(shape = RoundedCornerShape(12.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Rounded.RateReview,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "O'qituvchi xulosasi",
                                        style = MaterialTheme.typography.titleSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = attemptEvaluation?.rawText ?: attempt.review,
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        lineHeight = 22.sp
                                    )
                                )
                            }
                        }
                    }

                    // Section Title: "Savollar"
                    item {
                        Text(
                            text = "Savollar",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            ),
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    // Question Rows
                    var questionIndexCounter = 0
                    attempt.attemptParts.forEach { attemptPart ->
                        val answers = attemptPart.allAnswers
                        answers.forEach { answer ->
                            questionIndexCounter++
                            val currentIndex = questionIndexCounter
                            item(key = "answer_${answer.id ?: currentIndex}") {
                                QuestionResultRowItem(
                                    index = currentIndex,
                                    partName = attemptPart.part?.name,
                                    answer = answer,
                                    isPlaying = uiState.isPlaying,
                                    currentAudioUrl = uiState.currentlyPlayingAudioUrl,
                                    onPlayAudio = { audioPath -> viewModel.togglePlayAudio(audioPath) }
                                )
                            }
                        }
                    }

                    // Bottom Action Buttons
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                        if (attempt.testId != null) {
                            PrimaryButton(
                                text = "Qayta topshirish",
                                onClick = { onRetryTest(attempt.testId) },
                                icon = Icons.Rounded.Refresh
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                        }

                        OutlinedButton(
                            onClick = onNavigateToMain,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            shape = RoundedCornerShape(14.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.onSurface
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Home,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Bosh sahifaga qaytish", style = MaterialTheme.typography.labelLarge)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun QuestionResultRowItem(
    index: Int,
    partName: String?,
    answer: AttemptAnswerDto,
    isPlaying: Boolean,
    currentAudioUrl: String?,
    onPlayAudio: (String) -> Unit
) {
    var expanded by rememberSaveable { mutableStateOf(false) }

    val evaluation = remember(answer.review, answer.reviewAi) {
        parseAiReview(answer.review ?: answer.reviewAi)
    }

    val answerStatus = remember(answer, evaluation) {
        when {
            evaluation?.overrideReason == "no_speech" -> "no_speech"
            evaluation?.overrideReason == "wrong_language" -> "wrong_language"
            evaluation?.overrideReason in listOf("not_relevant", "off_topic") -> "off_topic"
            evaluation?.rawText?.startsWith("AI Error") == true -> "ai_error"
            answer.score != null || answer.scoreAi != null -> "graded"
            answer.audioPath.isNullOrBlank() -> "no_speech"
            else -> "pending"
        }
    }

    val score = answer.score?.toInt() ?: answer.scoreAi?.toInt()
    val isCurrentAudioPlaying = isPlaying && !answer.audioPath.isNullOrBlank() && currentAudioUrl?.contains(answer.audioPath) == true

    MultiTestCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        // Row Header (min 56dp)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .defaultMinSize(minHeight = 44.dp)
                .clickable { expanded = !expanded },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                // Number chip
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.secondaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "$index",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                    Text(
                        text = if (!partName.isNullOrBlank()) "$partName · Savol $index" else "Savol $index",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatusPill(status = answerStatus)

                if (score != null) {
                    Text(
                        text = "$score/15",
                        style = MaterialTheme.typography.labelLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    )
                }

                Icon(
                    imageVector = if (expanded) Icons.Rounded.ExpandLess else Icons.Rounded.ExpandMore,
                    contentDescription = if (expanded) "Yopish" else "Ochish",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        // Expandable Content
        AnimatedVisibility(
            visible = expanded,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 14.dp)
            ) {
                HorizontalDivider(
                    color = MaterialTheme.colorScheme.outlineVariant,
                    thickness = 1.dp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Question Text
                val questionText = answer.question?.textarea
                if (!questionText.isNullOrBlank()) {
                    Text(
                        text = parseHtmlToPlainText(questionText),
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 22.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Audio Player
                if (!answer.audioPath.isNullOrBlank()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(MaterialTheme.colorScheme.secondaryContainer)
                            .clickable { onPlayAudio(answer.audioPath) }
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isCurrentAudioPlaying) Icons.Rounded.PauseCircle else Icons.Rounded.PlayCircle,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = if (isCurrentAudioPlaying) "Ijro etilmoqda..." else "Javobingizni tinglash",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = MaterialTheme.colorScheme.onSurface,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                        }

                        if (answer.audioSecond != null && answer.audioSecond > 0) {
                            Text(
                                text = "${answer.audioSecond.toInt()}s",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Transcript
                if (!answer.transcript.isNullOrBlank()) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "Transkript:",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "\"${answer.transcript}\"",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.onSurface,
                                    lineHeight = 18.sp
                                )
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // AI feedback & criteria list
                if (evaluation != null) {
                    val hasCriteria = evaluation.fluency != null || evaluation.vocabulary != null ||
                            evaluation.grammar != null || evaluation.pronunciation != null || evaluation.interaction != null

                    if (hasCriteria) {
                        Text(
                            text = "AI izohi",
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            ),
                            modifier = Modifier.padding(bottom = 6.dp)
                        )

                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            evaluation.fluency?.let {
                                CriterionFeedbackRow(label = "Ravonlik (Fluency)", text = cleanCriterionText(it))
                            }
                            evaluation.vocabulary?.let {
                                CriterionFeedbackRow(label = "Lug'at boyligi (Vocabulary)", text = cleanCriterionText(it))
                            }
                            evaluation.grammar?.let {
                                CriterionFeedbackRow(label = "Grammatika (Grammar)", text = cleanCriterionText(it))
                            }
                            evaluation.pronunciation?.let {
                                CriterionFeedbackRow(label = "Talaffuz (Pronunciation)", text = cleanCriterionText(it))
                            }
                            evaluation.interaction?.let {
                                CriterionFeedbackRow(label = "Interaktivlik (Interaction)", text = cleanCriterionText(it))
                            }
                        }
                    }

                    if (!evaluation.feedback.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = evaluation.feedback,
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                lineHeight = 18.sp
                            )
                        )
                    }

                    if (!evaluation.rawText.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = evaluation.rawText,
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                lineHeight = 18.sp
                            )
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CriterionFeedbackRow(
    label: String,
    text: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Text(
            text = "• ",
            style = MaterialTheme.typography.bodySmall.copy(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        )
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            )
            if (text.isNotBlank()) {
                Text(
                    text = text,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 17.sp
                    )
                )
            }
        }
    }
}

fun cleanCriterionText(text: String?): String {
    if (text.isNullOrBlank()) return ""
    return text.replace(Regex("""(?i)score\s*:\s*\d+(\.\d+)?\s*/\s*15\.?\s*"""), "").trim()
}

data class AiEvaluationData(
    val score: String? = null,
    val level: String? = null,
    val fluency: String? = null,
    val vocabulary: String? = null,
    val grammar: String? = null,
    val pronunciation: String? = null,
    val interaction: String? = null,
    val detectedLanguage: String? = null,
    val overrideReason: String? = null,
    val feedback: String? = null,
    val rawText: String? = null
)

fun parseAiReview(review: String?): AiEvaluationData? {
    if (review.isNullOrBlank()) return null
    val trimmed = review.trim()
    if (!trimmed.startsWith("{")) {
        return AiEvaluationData(rawText = trimmed)
    }
    return try {
        val json = org.json.JSONObject(trimmed)
        val score = if (json.has("score") && !json.isNull("score")) json.get("score").toString() else null
        val level = json.optString("level").takeIf { it.isNotBlank() }
        val fluency = json.optString("fluency").takeIf { it.isNotBlank() }
        val vocabulary = json.optString("vocabulary").takeIf { it.isNotBlank() }
        val grammar = json.optString("grammar").takeIf { it.isNotBlank() }
        val pronunciation = json.optString("pronunciation").takeIf { it.isNotBlank() }
        val interaction = json.optString("interaction").takeIf { it.isNotBlank() }
        val detectedLanguage = json.optString("detected_language").takeIf { it.isNotBlank() }
        val overrideReason = json.optString("override_reason").takeIf { it.isNotBlank() }
        val feedback = json.optString("feedback").takeIf { it.isNotBlank() }

        AiEvaluationData(
            score = score,
            level = level,
            fluency = fluency,
            vocabulary = vocabulary,
            grammar = grammar,
            pronunciation = pronunciation,
            interaction = interaction,
            detectedLanguage = detectedLanguage,
            overrideReason = overrideReason,
            feedback = feedback
        )
    } catch (e: Exception) {
        AiEvaluationData(rawText = trimmed)
    }
}
