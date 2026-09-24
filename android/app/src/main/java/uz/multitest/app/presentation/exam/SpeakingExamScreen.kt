package uz.multitest.app.presentation.exam

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import uz.multitest.app.core.theme.*
import uz.multitest.app.presentation.components.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SpeakingExamScreen(
    attemptId: Long,
    onNavigateToResult: (Long) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: SpeakingExamViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val lifecycleOwner = LocalLifecycleOwner.current

    // Mic Permission Check
    var hasMicPermission by remember { mutableStateOf(false) }
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasMicPermission = isGranted
    }

    LaunchedEffect(Unit) {
        permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
    }

    // Lifecycle anti-cheat detection
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_PAUSE || event == Lifecycle.Event.ON_STOP) {
                viewModel.onAppBackgrounded()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    LaunchedEffect(Unit) {
        viewModel.uiEvent.collect { event ->
            when (event) {
                is SpeakingExamUiEvent.NavigateToResult -> onNavigateToResult(event.attemptId)
            }
        }
    }

    val attempt = uiState.attempt
    val currentPart = attempt?.attemptParts?.getOrNull(uiState.currentPartIndex)?.part
    val currentQuestion = currentPart?.questions?.getOrNull(uiState.currentQuestionIndex)
    val totalParts = attempt?.attemptParts?.size ?: 0
    val totalQuestions = currentPart?.questions?.size ?: 0

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = attempt?.name ?: "Speaking Imtihon",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            maxLines = 1
                        )
                        if (totalParts > 0) {
                            Text(
                                text = "${uiState.currentPartIndex + 1} / $totalParts - Bo'lim",
                                style = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.primary)
                            )
                        }
                    }
                },
                actions = {
                    if (uiState.violationCount > 0) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = RosePink.copy(alpha = 0.15f),
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.Warning,
                                    contentDescription = null,
                                    tint = RosePink,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Ogohlantirish: ${uiState.violationCount}",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = RosePink,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            when (uiState.phase) {
                ExamPhase.LOADING -> {
                    LoadingStateView(message = "Imtihon savollari tayyorlanmoqda...")
                }

                ExamPhase.ERROR -> {
                    ErrorStateView(
                        message = uiState.errorMessage ?: "Xatolik yuz berdi",
                        onRetry = { viewModel.loadAttempt(attemptId) }
                    )
                }

                ExamPhase.PART_INTRO -> {
                    PartIntroView(
                        partName = currentPart?.name ?: "Bo'lim",
                        partDescription = currentPart?.description ?: "Ko'rsatmalarni diqqat bilan eshiting va tayyor bo'lganingizda 'Boshlash' tugmasini bosing.",
                        isPlayingAudio = uiState.isAudioPromptPlaying,
                        questionCount = totalQuestions,
                        onStart = { viewModel.proceedFromPartIntroToQuestions() }
                    )
                }

                ExamPhase.QUESTION_AUDIO -> {
                    QuestionActiveView(
                        questionIndex = uiState.currentQuestionIndex + 1,
                        totalQuestions = totalQuestions,
                        questionText = currentQuestion?.textarea ?: "",
                        isAudioPhase = true,
                        isPreparation = false,
                        isAudioPromptPlaying = true,
                        secondsRemaining = 0,
                        totalSeconds = 0,
                        amplitude = 0f,
                        onStartRecordingNow = { viewModel.startRecordingNow() },
                        onFinishEarly = {}
                    )
                }

                ExamPhase.PREPARATION -> {
                    QuestionActiveView(
                        questionIndex = uiState.currentQuestionIndex + 1,
                        totalQuestions = totalQuestions,
                        questionText = currentQuestion?.textarea ?: "",
                        isAudioPhase = false,
                        isPreparation = true,
                        isAudioPromptPlaying = false,
                        secondsRemaining = uiState.secondsRemaining,
                        totalSeconds = uiState.totalSeconds,
                        amplitude = 0f,
                        onStartRecordingNow = { viewModel.startRecordingNow() },
                        onFinishEarly = {}
                    )
                }

                ExamPhase.RECORDING -> {
                    QuestionActiveView(
                        questionIndex = uiState.currentQuestionIndex + 1,
                        totalQuestions = totalQuestions,
                        questionText = currentQuestion?.textarea ?: "",
                        isAudioPhase = false,
                        isPreparation = false,
                        isAudioPromptPlaying = false,
                        secondsRemaining = uiState.secondsRemaining,
                        totalSeconds = uiState.totalSeconds,
                        amplitude = uiState.recordingAmplitude,
                        onStartRecordingNow = {},
                        onFinishEarly = { viewModel.finishRecordingEarly() }
                    )
                }

                ExamPhase.UPLOADING, ExamPhase.COMPLETED -> {
                    LoadingStateView(message = uiState.uploadProgressMessage.ifBlank { "Saqlanmoqda..." })
                }
            }
        }
    }
}

@Composable
private fun PartIntroView(
    partName: String,
    partDescription: String,
    isPlayingAudio: Boolean,
    questionCount: Int,
    onStart: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(IndigoPrimary.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Rounded.Headset,
                contentDescription = null,
                tint = IndigoPrimary,
                modifier = Modifier.size(44.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = partName,
            style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            ),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "$questionCount ta savol mavjud",
            style = MaterialTheme.typography.bodyMedium.copy(
                color = IndigoAccent,
                fontWeight = FontWeight.SemiBold
            )
        )

        Spacer(modifier = Modifier.height(20.dp))

        MultiTestCard(shape = RoundedCornerShape(20.dp)) {
            Text(
                text = "Yo'riqnoma:",
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = parseHtmlToPlainText(partDescription),
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 22.sp
                )
            )
        }

        if (isPlayingAudio) {
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    color = IndigoPrimary,
                    strokeWidth = 2.dp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Audio ko'rsatma eshitilmoqda...",
                    style = MaterialTheme.typography.bodySmall.copy(color = IndigoPrimary)
                )
            }
        }

        Spacer(modifier = Modifier.height(36.dp))

        GradientButton(
            text = "Savollarga O'tish",
            onClick = onStart,
            icon = Icons.Rounded.PlayArrow
        )
    }
}

@Composable
private fun QuestionActiveView(
    questionIndex: Int,
    totalQuestions: Int,
    questionText: String,
    isAudioPhase: Boolean,
    isPreparation: Boolean,
    isAudioPromptPlaying: Boolean,
    secondsRemaining: Int,
    totalSeconds: Int,
    amplitude: Float,
    onStartRecordingNow: () -> Unit,
    onFinishEarly: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Question Badge & Phase Indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Text(
                        text = "Savol $questionIndex / $totalQuestions",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        ),
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                    )
                }

                if (isAudioPhase) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = IndigoPrimary.copy(alpha = 0.15f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(12.dp),
                                color = IndigoPrimary,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Savol o'qilmoqda...",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = IndigoPrimary,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
                } else if (isPreparation) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = CoralOrange.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = "Tayyorgarlik",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = CoralOrange,
                                fontWeight = FontWeight.Bold
                            ),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                } else {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = RosePink.copy(alpha = 0.15f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(RosePink)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Yozilmoqda",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = RosePink,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Timer / Audio Center Element
            if (isAudioPhase) {
                AudioListeningCircle()
            } else {
                CountdownTimerCircle(
                    currentSeconds = secondsRemaining,
                    totalSeconds = totalSeconds,
                    isPreparation = isPreparation
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Question Box
            MultiTestCard(shape = RoundedCornerShape(20.dp)) {
                if (questionText.isNotBlank()) {
                    HtmlContentView(
                        html = questionText,
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    Text(
                        text = "Savolni tinglang va javob bering",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 26.sp
                        ),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Bottom Controls / Waveform
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (!isAudioPhase && !isPreparation) {
                AudioWaveformVisualizer(
                    amplitude = amplitude,
                    isRecording = true
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedButton(
                    onClick = onFinishEarly,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = RosePink
                    ),
                    modifier = Modifier.fillMaxWidth().height(50.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Stop,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Javob berishni yakunlash",
                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
                    )
                }
            } else {
                FilledTonalButton(
                    onClick = onStartRecordingNow,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = IndigoPrimary.copy(alpha = 0.15f),
                        contentColor = IndigoPrimary
                    ),
                    modifier = Modifier.fillMaxWidth().height(50.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Mic,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Javob berishni boshlash",
                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = if (isAudioPhase) "Savol o'qilmoqda. Tayyor bo'lsangiz to'g'ridan-to'g'ri boshlashingiz mumkin." else "Tayyorgarlik vaqti tugagach ovozingiz avtomatik yozib olinadi",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                )
            }
        }
    }
}
