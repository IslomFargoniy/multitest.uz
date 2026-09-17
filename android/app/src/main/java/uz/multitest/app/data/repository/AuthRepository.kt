package uz.multitest.app.data.repository

import kotlinx.coroutines.flow.Flow
import uz.multitest.app.core.network.NetworkResult
import uz.multitest.app.data.models.UserDto

interface AuthRepository {
    fun loginWithOtp(otp: String): Flow<NetworkResult<UserDto>>
    fun loginWithGoogle(idToken: String): Flow<NetworkResult<UserDto>>
    fun getProfile(): Flow<NetworkResult<UserDto>>
    fun logout(): Flow<NetworkResult<Unit>>
    fun isLoggedIn(): Flow<Boolean>
    fun getSavedUser(): Flow<UserDto?>
}
