package uz.multitest.app.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import uz.multitest.app.core.datastore.SessionManager
import uz.multitest.app.core.network.ApiService
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.GoogleLoginRequest
import uz.multitest.app.data.models.LoginOtpRequest
import uz.multitest.app.data.models.UserDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val sessionManager: SessionManager
) : AuthRepository {

    override fun loginWithOtp(otp: String): Flow<NetworkResult<UserDto>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.loginWithOtp(LoginOtpRequest(otp = otp.trim()))
            if (response.isSuccessful && response.body()?.data != null) {
                val user = response.body()!!.data!!
                user.token?.let { token ->
                    sessionManager.saveAuthToken(token)
                }
                sessionManager.saveUser(user)
                emit(NetworkResult.Success(user))
            } else {
                val errorMsg = response.body()?.message ?: "Login failed. Invalid OTP code."
                emit(NetworkResult.Error(errorMsg, response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Network connection error"))
        }
    }.flowOn(Dispatchers.IO)

    override fun loginWithGoogle(idToken: String): Flow<NetworkResult<UserDto>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.loginWithGoogle(GoogleLoginRequest(idToken = idToken))
            if (response.isSuccessful && response.body()?.data != null) {
                val user = response.body()!!.data!!
                user.token?.let { token ->
                    sessionManager.saveAuthToken(token)
                }
                sessionManager.saveUser(user)
                emit(NetworkResult.Success(user))
            } else {
                val errorMsg = response.body()?.message ?: "Google authentication failed"
                emit(NetworkResult.Error(errorMsg, response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Network connection error"))
        }
    }.flowOn(Dispatchers.IO)

    override fun getProfile(): Flow<NetworkResult<UserDto>> = flow {
        emit(NetworkResult.Loading)
        try {
            val response = apiService.getProfile()
            if (response.isSuccessful && response.body()?.data != null) {
                val user = response.body()!!.data!!
                sessionManager.saveUser(user)
                emit(NetworkResult.Success(user))
            } else {
                emit(NetworkResult.Error(response.body()?.message ?: "Failed to fetch profile", response.code()))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.localizedMessage ?: "Network connection error"))
        }
    }.flowOn(Dispatchers.IO)

    override fun logout(): Flow<NetworkResult<Unit>> = flow {
        emit(NetworkResult.Loading)
        try {
            apiService.logout()
        } catch (e: Exception) {
            // Ignore API logout error, always clear local session
        }
        sessionManager.clearSession()
        emit(NetworkResult.Success(Unit))
    }.flowOn(Dispatchers.IO)

    override fun isLoggedIn(): Flow<Boolean> = sessionManager.isLoggedIn

    override fun getSavedUser(): Flow<UserDto?> = sessionManager.userFlow
}
