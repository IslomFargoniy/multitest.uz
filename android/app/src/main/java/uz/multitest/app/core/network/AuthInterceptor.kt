package uz.multitest.app.core.network

import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import uz.multitest.app.core.datastore.SessionManager
import javax.inject.Inject

class AuthInterceptor @Inject constructor(
    private val sessionManager: SessionManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val token = runBlocking {
            sessionManager.tokenFlow.firstOrNull()
        }

        val requestBuilder = original.newBuilder()
            .header("Accept", "application/json")
            .header("X-Requested-With", "XMLHttpRequest")

        if (!token.isNullOrBlank()) {
            requestBuilder.header("Authorization", "Bearer $token")
        }

        return chain.proceed(requestBuilder.build())
    }
}
