package uz.multitest.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import uz.multitest.app.core.network.FlexibleBooleanSerializer

@Serializable
data class LoginOtpRequest(
    @SerialName("otp") val otp: String
)

@Serializable
data class GoogleLoginRequest(
    @SerialName("id_token") val idToken: String
)

@Serializable
data class ApiResponse<T>(
    @Serializable(with = FlexibleBooleanSerializer::class)
    @SerialName("success") val success: Boolean = false,
    @SerialName("data") val data: T? = null,
    @SerialName("message") val message: String? = null
)

@Serializable
data class UserDto(
    @SerialName("id") val id: Long,
    @SerialName("name") val name: String,
    @SerialName("username") val username: String? = null,
    @SerialName("email") val email: String? = null,
    @SerialName("phone") val phone: String? = null,
    @SerialName("avatar") val avatar: String? = null,
    @SerialName("roles") val roles: List<String> = emptyList(),
    @SerialName("token") val token: String? = null,
    @SerialName("stats") val stats: UserStatsDto? = null
)

@Serializable
data class UserStatsDto(
    @SerialName("total_attempts") val totalAttempts: Int = 0,
    @SerialName("completed_attempts") val completedAttempts: Int = 0,
    @SerialName("average_score") val averageScore: Double? = null
)
