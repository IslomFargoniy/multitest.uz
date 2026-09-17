package uz.multitest.app.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import uz.multitest.app.core.network.ApiService
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.TestDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TestRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : TestRepository {

    override fun getTests(page: Int, search: String?, languageId: Long?): Flow<NetworkResult<List<TestDto>>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.getTests(page = page, search = search, languageId = languageId)
            if (response.isSuccessful && response.body()?.data != null) {
                emit(NetworkResult.Success(response.body()!!.data!!))
            } else {
                emit(NetworkResult.Error(response.body()?.message ?: "Failed to fetch tests", response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Network connection error"))
        }
    }.flowOn(Dispatchers.IO)

    override fun getTestDetail(id: Long): Flow<NetworkResult<TestDto>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.getTestDetail(id)
            if (response.isSuccessful && response.body()?.data != null) {
                emit(NetworkResult.Success(response.body()!!.data!!))
            } else {
                emit(NetworkResult.Error(response.body()?.message ?: "Failed to fetch test detail", response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Network connection error"))
        }
    }.flowOn(Dispatchers.IO)
}
