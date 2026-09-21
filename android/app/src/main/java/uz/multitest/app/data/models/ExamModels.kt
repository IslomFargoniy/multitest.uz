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
    @SerialName("score") val score: Double? = null,
    @SerialName("test") val test: TestDto? = null,
    @SerialName("mock") val mock: MockDto? = null,
    @SerialName("attempt_parts") val attemptParts: List<AttemptPartDto> = emptyList()
)

@Serializable
data class AttemptPartDto(
    @SerialName("id") val id: Long,
    @SerialName("attempt_id") val attemptId: Long,
    @SerialName("part_id") val partId: Long,
    @SerialName("part") val part: PartDto? = null,
    @SerialName("answers") val answers: List<AttemptAnswerDto> = emptyList()
)

@Serializable
data class AttemptAnswerDto(
    @SerialName("id") val id: Long? = null,
    @SerialName("question_id") val questionId: Long,
    @SerialName("audio_path") val audioPath: String? = null,
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
