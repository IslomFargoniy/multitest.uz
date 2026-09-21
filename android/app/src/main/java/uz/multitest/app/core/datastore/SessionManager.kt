package uz.multitest.app.core.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import uz.multitest.app.core.util.Constants
import uz.multitest.app.data.models.UserDto
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = Constants.DATASTORE_NAME)

@Singleton
class SessionManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val json: Json
) {
    private val tokenKey = stringPreferencesKey(Constants.KEY_AUTH_TOKEN)
    private val userKey = stringPreferencesKey(Constants.KEY_USER_DATA)

    val tokenFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[tokenKey]
    }

    val isLoggedIn: Flow<Boolean> = context.dataStore.data.map { preferences ->
        !preferences[tokenKey].isNullOrBlank()
    }

    val userFlow: Flow<UserDto?> = context.dataStore.data.map { preferences ->
        preferences[userKey]?.let { jsonStr ->
            try {
                json.decodeFromString<UserDto>(jsonStr)
            } catch (e: Exception) {
                null
            }
        }
    }

    suspend fun saveAuthToken(token: String) {
        context.dataStore.edit { preferences ->
            preferences[tokenKey] = token
        }
    }

    suspend fun saveUser(user: UserDto) {
        context.dataStore.edit { preferences ->
            preferences[userKey] = json.encodeToString(user)
        }
    }

    suspend fun saveAuth(token: String, user: UserDto) {
        context.dataStore.edit { preferences ->
            preferences[tokenKey] = token
            preferences[userKey] = json.encodeToString(user)
        }
    }

    suspend fun clearSession() {
        context.dataStore.edit { preferences ->
            preferences.remove(tokenKey)
            preferences.remove(userKey)
        }
    }
}
