package uz.multitest.app.data.repository

import kotlinx.coroutines.flow.Flow
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.AttemptDto
import java.io.File

data class QuestionAnswerData(
    val questionId: Long,
    val audioFile: File?,
    val startedAt: String? = null,
    val finishedAt: String? = null
)

interface ExamRepository {
    fun startAttempt(testId: Long, partIds: List<Long>? = null): Flow<NetworkResult<AttemptDto>>
    fun getAttempt(id: Long): Flow<NetworkResult<AttemptDto>>
    fun joinMock(pin: String): Flow<NetworkResult<AttemptDto>>
    fun uploadPartAnswers(attemptPartId: Long, answers: List<QuestionAnswerData>): Flow<NetworkResult<Unit>>
    fun finishAttempt(id: Long): Flow<NetworkResult<AttemptDto>>
    fun recordViolation(id: Long, count: Int = 1): Flow<NetworkResult<Unit>>
    fun getMyAttempts(page: Int = 1): Flow<NetworkResult<List<AttemptDto>>>
}
