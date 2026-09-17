package uz.multitest.app.data.repository

import kotlinx.coroutines.flow.Flow
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.TestDto

interface TestRepository {
    fun getTests(page: Int = 1, search: String? = null, languageId: Long? = null): Flow<NetworkResult<List<TestDto>>>
    fun getTestDetail(id: Long): Flow<NetworkResult<TestDto>>
}
