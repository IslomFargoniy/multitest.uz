package uz.multitest.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import uz.multitest.app.core.network.FlexibleBooleanSerializer

@Serializable
data class StartAttemptRequest(
    @SerialName("test_id") val testId: Long,
    @SerialName("part_ids") val partIds: List<Long>? = null
)

@Serializable
data class JoinMockRequest(
    @SerialName("pin") val pin: String
)

@Serializable
data class AttemptDto(
    @SerialName("id") val id: Long,
    @SerialName("name") val name: String? = null,
    @SerialName("test_id") val testId: Long? = null,
    @SerialName("mock_id") val mockId: Long? = null,
    @SerialName("started_at") val startedAt: String? = null,
    @SerialName("finished_at") val finishedAt: String? = null,
    @SerialName("evaluated_at") val evaluatedAt: String? = null,
    @SerialName("score") val score: Double? = null,
    @SerialName("ai_score_avg") val aiScoreAvg: Double? = null,
    @SerialName("tab_switch_count") val tabSwitchCount: Int = 0,
    @SerialName("review") val review: String? = null,
    @SerialName("test") val test: TestDto? = null,
    @SerialName("mock") val mock: MockDto? = null,
    @SerialName("attempt_parts") val attemptParts: List<AttemptPartDto> = emptyList()
)

@Serializable
data class AttemptPartDto(
    @SerialName("id") val id: Long,
    @SerialName("attempt_id") val attemptId: Long? = null,
    @SerialName("part_id") val partId: Long? = null,
    @SerialName("part") val part: PartDto? = null,
    @SerialName("answers") val answers: List<AttemptAnswerDto> = emptyList(),
    @SerialName("attempt_answers") val attemptAnswers: List<AttemptAnswerDto> = emptyList()
) {
    val allAnswers: List<AttemptAnswerDto> get() = if (attemptAnswers.isNotEmpty()) attemptAnswers else answers
}

@Serializable
data class AttemptAnswerDto(
    @SerialName("id") val id: Long? = null,
    @SerialName("attempt_part_id") val attemptPartId: Long? = null,
    @SerialName("question_id") val questionId: Long? = null,
    @SerialName("question") val question: QuestionDto? = null,
    @SerialName("audio_path") val audioPath: String? = null,
    @SerialName("audio_second") val audioSecond: Double? = null,
    @SerialName("transcript") val transcript: String? = null,
    @SerialName("review_ai") val reviewAi: String? = null,
    @SerialName("review") val review: String? = null,
    @SerialName("score_ai") val scoreAi: Double? = null,
    @SerialName("score") val score: Double? = null,
    @SerialName("started_at") val startedAt: String? = null,
    @SerialName("finished_at") val finishedAt: String? = null
)

@Serializable
data class MockDto(
    @SerialName("id") val id: Long,
    @SerialName("name") val name: String,
    @SerialName("code") val code: String? = null,
    @SerialName("slug") val slug: String? = null,
    @Serializable(with = FlexibleBooleanSerializer::class)
    @SerialName("is_active") val isActive: Boolean = true
)
