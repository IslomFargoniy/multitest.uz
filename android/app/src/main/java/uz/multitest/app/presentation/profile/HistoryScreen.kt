package uz.multitest.app.presentation.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.History
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import uz.multitest.app.core.theme.*
import uz.multitest.app.data.models.AttemptDto
import uz.multitest.app.presentation.components.CefrBadge
import uz.multitest.app.presentation.components.EmptyStateView
import uz.multitest.app.presentation.components.ErrorStateView
import uz.multitest.app.presentation.components.LoadingStateView
import uz.multitest.app.presentation.components.MultiTestCard
import uz.multitest.app.presentation.components.StatusPill

@Composable
fun HistoryScreen(
    onNavigateToResult: (Long) -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
    ) {
        Text(
            text = "Imtihonlar Tarixi",
            style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            ),
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
        )

        when {
            uiState.isLoading && uiState.attempts.isEmpty() -> {
                LoadingStateView(message = "Tarix yuklanmoqda...")
            }
            uiState.errorMessage != null && uiState.attempts.isEmpty() -> {
                ErrorStateView(
                    message = uiState.errorMessage!!,
                    onRetry = { viewModel.loadProfileAndHistory() }
                )
            }
            uiState.attempts.isEmpty() -> {
                EmptyStateView(
                    title = "Hozircha natijalar yo'q",
                    description = "Testlar bo'limidan test tanlab, o'z bilimingizni sinab ko'ring"
                )
            }
            else -> {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 90.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.attempts, key = { it.id }) { attempt ->
                        HistoryAttemptCard(
                            attempt = attempt,
                            onClick = { onNavigateToResult(attempt.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun HistoryAttemptCard(
    attempt: AttemptDto,
    onClick: () -> Unit
) {
    MultiTestCard(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = attempt.name ?: attempt.test?.name ?: "Speaking Test",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (attempt.mock != null) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = MaterialTheme.colorScheme.secondaryContainer
                        ) {
                            Text(
                                text = "MOCK",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                ),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = uz.multitest.app.presentation.components.formatExamDateTime(attempt.startedAt),
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            val displayScore = attempt.score ?: attempt.aiScoreAvg
            if (displayScore != null) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    CefrBadge(score = displayScore.toInt())
                    Text(
                        text = if (attempt.score != null) "${attempt.score}" else "${displayScore.toInt()} (AI)",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                }
            } else if (attempt.finishedAt != null) {
                StatusPill(status = "pending")
            } else {
                Surface(
                    shape = RoundedCornerShape(100.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.padding(horizontal = 4.dp)
                ) {
                    Text(
                        text = "Tugallanmagan",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}
