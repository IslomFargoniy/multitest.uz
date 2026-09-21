package uz.multitest.app.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import uz.multitest.app.core.network.ApiService
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.AttemptDto
import uz.multitest.app.data.models.JoinMockRequest
import uz.multitest.app.data.models.StartAttemptRequest
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

@Singleton
class ExamRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val json: Json
) : ExamRepository {

    private fun extractErrorMessage(errorBody: String?): String? {
        if (errorBody.isNullOrBlank()) return null
        return try {
            val element = json.parseToJsonElement(errorBody)
            element.jsonObject["message"]?.jsonPrimitive?.content
        } catch (e: Exception) {
            null
        }
    }

    override fun startAttempt(testId: Long, partIds: List<Long>?): Flow<NetworkResult<AttemptDto>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.startAttempt(StartAttemptRequest(testId = testId, partIds = partIds))
            if (response.isSuccessful && response.body()?.data != null) {
                emit(NetworkResult.Success(response.body()!!.data!!))
            } else {
                val errorMsg = extractErrorMessage(response.errorBody()?.string())
                    ?: response.body()?.message
                    ?: "Imtihonni boshlashda xatolik"
                emit(NetworkResult.Error(errorMsg, response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Internet bilan aloqa yo'q"))
        }
    }.flowOn(Dispatchers.IO)

    override fun getAttempt(id: Long): Flow<NetworkResult<AttemptDto>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.getAttempt(id)
            if (response.isSuccessful && response.body()?.data != null) {
                emit(NetworkResult.Success(response.body()!!.data!!))
            } else {
                val errorMsg = extractErrorMessage(response.errorBody()?.string())
                    ?: response.body()?.message
                    ?: "Imtihon ma'lumotlarini yuklashda xatolik"
                emit(NetworkResult.Error(errorMsg, response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Internet bilan aloqa yo'q"))
        }
    }.flowOn(Dispatchers.IO)

    override fun joinMock(pin: String): Flow<NetworkResult<AttemptDto>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.joinMock(JoinMockRequest(pin = pin.trim()))
            if (response.isSuccessful && response.body()?.data != null) {
                emit(NetworkResult.Success(response.body()!!.data!!))
            } else {
                emit(NetworkResult.Error(response.body()?.message ?: "Invalid mock exam PIN code", response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Network connection error"))
        }
    }.flowOn(Dispatchers.IO)

    override fun uploadPartAnswers(
        attemptPartId: Long,
        answers: List<QuestionAnswerData>
    ): Flow<NetworkResult<Unit>> = flow {
        emit(NetworkResult.Loading)
        try {
            // Build JSON array for answers field
            val jsonArray = buildJsonArray {
                answers.forEach { item ->
                    add(buildJsonObject {
                        put("question_id", item.questionId)
                        item.startedAt?.let { put("started_at", it) }
                        item.finishedAt?.let { put("finished_at", it) }
                    })
                }
            }

            val answersRequestBody = jsonArray.toString().toRequestBody("application/json".toMediaTypeOrNull())

            // Build multipart files list
            val fileParts = mutableListOf<MultipartBody.Part>()
            answers.forEachIndexed { index, item ->
                item.audioFile?.let { file ->
                    if (file.exists() && file.length() > 0) {
                        val requestFile = file.asRequestBody("audio/mp4".toMediaTypeOrNull())
                        fileParts.add(MultipartBody.Part.createFormData("audio_${item.questionId}", file.name, requestFile))
                        fileParts.add(MultipartBody.Part.createFormData("answers.$index.audio", file.name, requestFile))
                    }
                }
            }

            val response = apiService.uploadPartAnswers(
                attemptPartId = attemptPartId,
                answers = answersRequestBody,
                audioFiles = fileParts
            )

            if (response.isSuccessful) {
                emit(NetworkResult.Success(Unit))
            } else {
                emit(NetworkResult.Error(response.body()?.message ?: "Failed to upload answers", response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Network connection error"))
        }
    }.flowOn(Dispatchers.IO)

    override fun finishAttempt(id: Long): Flow<NetworkResult<AttemptDto>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.finishAttempt(id)
            if (response.isSuccessful && response.body()?.data != null) {
                emit(NetworkResult.Success(response.body()!!.data!!))
            } else {
                emit(NetworkResult.Error(response.body()?.message ?: "Failed to finish attempt", response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Network connection error"))
        }
    }.flowOn(Dispatchers.IO)

    override fun recordViolation(id: Long, count: Int): Flow<NetworkResult<Unit>> = flow {
        try {
            apiService.recordViolation(id = id, count = count)
            emit(NetworkResult.Success(Unit))
        } catch (e: Exception) {
            // Silently complete violation reporting
            emit(NetworkResult.Success(Unit))
        }
    }.flowOn(Dispatchers.IO)

    override fun getMyAttempts(page: Int): Flow<NetworkResult<List<AttemptDto>>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.getMyAttempts(page = page)
            if (response.isSuccessful && response.body()?.data != null) {
                emit(NetworkResult.Success(response.body()!!.data!!))
            } else {
                emit(NetworkResult.Error(response.body()?.message ?: "Failed to fetch attempts", response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Network connection error"))
        }
    }.flowOn(Dispatchers.IO)
}
