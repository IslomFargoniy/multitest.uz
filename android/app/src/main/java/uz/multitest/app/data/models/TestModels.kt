package uz.multitest.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TestDto(
    @SerialName("id") val id: Long,
    @SerialName("name") val name: String,
    @SerialName("description") val description: String? = null,
    @SerialName("is_public") val isPublic: Boolean = true,
    @SerialName("audio_path") val audioPath: String? = null,
    @SerialName("language") val language: LanguageDto? = null,
    @SerialName("parts") val parts: List<PartDto> = emptyList()
)

@Serializable
data class LanguageDto(
    @SerialName("id") val id: Long,
    @SerialName("name_uz") val nameUz: String? = null,
    @SerialName("name_ru") val nameRu: String? = null,
    @SerialName("name_en") val nameEn: String? = null,
    @SerialName("code") val code: String? = null,
    @SerialName("flag") val flag: String? = null
)

@Serializable
data class PartDto(
    @SerialName("id") val id: Long,
    @SerialName("test_id") val testId: Long,
    @SerialName("name") val name: String,
    @SerialName("description") val description: String? = null,
    @SerialName("audio_path") val audioPath: String? = null,
    @SerialName("questions") val questions: List<QuestionDto> = emptyList()
)

@Serializable
data class QuestionDto(
    @SerialName("id") val id: Long,
    @SerialName("part_id") val partId: Long,
    @SerialName("textarea") val textarea: String = "",
    @SerialName("audio_path") val audioPath: String? = null,
    @SerialName("ready_second") val readySecond: Int = 15,
    @SerialName("answer_second") val answerSecond: Int = 45
)
