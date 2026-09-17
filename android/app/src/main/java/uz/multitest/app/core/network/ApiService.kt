package uz.multitest.app.core.network

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*
import uz.multitest.app.data.models.*

interface ApiService {

    // 🔑 Auth
    @POST("v1/auth/login-otp")
    suspend fun loginWithOtp(
        @Body request: LoginOtpRequest
    ): Response<ApiResponse<UserDto>>

    @POST("v1/auth/google")
    suspend fun loginWithGoogle(
        @Body request: GoogleLoginRequest
    ): Response<ApiResponse<UserDto>>

    @GET("v1/auth/me")
    suspend fun getProfile(): Response<ApiResponse<UserDto>>

    @POST("v1/auth/logout")
    suspend fun logout(): Response<ApiResponse<Unit>>

    // 📚 Tests
    @GET("v1/tests")
    suspend fun getTests(
        @Query("page") page: Int = 1,
        @Query("search") search: String? = null,
        @Query("language_id") languageId: Long? = null
    ): Response<ApiResponse<List<TestDto>>>

    @GET("v1/tests/{id}")
    suspend fun getTestDetail(
        @Path("id") id: Long
    ): Response<ApiResponse<TestDto>>

    // 🏆 Mock Exam
    @POST("v1/mocks/join")
    suspend fun joinMock(
        @Body request: JoinMockRequest
    ): Response<ApiResponse<AttemptDto>>

    // 🎙️ Speaking Exam Attempts
    @POST("v1/attempts/start")
    suspend fun startAttempt(
        @Body request: StartAttemptRequest
    ): Response<ApiResponse<AttemptDto>>

    @GET("v1/attempts/{id}")
    suspend fun getAttempt(
        @Path("id") id: Long
    ): Response<ApiResponse<AttemptDto>>

    @Multipart
    @POST("v1/attempts/{attempt_part_id}/upload-answers")
    suspend fun uploadPartAnswers(
        @Path("attempt_part_id") attemptPartId: Long,
        @Part("answers") answers: RequestBody,
        @Part audioFiles: List<MultipartBody.Part>
    ): Response<ApiResponse<Unit>>

    @POST("v1/attempts/{id}/finish")
    suspend fun finishAttempt(
        @Path("id") id: Long
    ): Response<ApiResponse<AttemptDto>>

    @POST("v1/attempts/{id}/violation")
    suspend fun recordViolation(
        @Path("id") id: Long,
        @Query("count") count: Int = 1
    ): Response<ApiResponse<Unit>>

    @GET("v1/my-attempts")
    suspend fun getMyAttempts(
        @Query("page") page: Int = 1
    ): Response<ApiResponse<List<AttemptDto>>>
}
