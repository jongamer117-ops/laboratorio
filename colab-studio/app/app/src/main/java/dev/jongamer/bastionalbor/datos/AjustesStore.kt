package dev.jongamer.bastionalbor.datos

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

data class Conexion(
    val url: String = "",
    val token: String = "",
    val tema: String = "",
)

private val Context.ajustesDataStore by preferencesDataStore(name = "ajustes")

class AjustesStore(private val context: Context) {
    private val claveUrl = stringPreferencesKey("url")
    private val claveToken = stringPreferencesKey("token")
    private val claveTema = stringPreferencesKey("tema")

    val conexion: Flow<Conexion> = context.ajustesDataStore.data.map { prefs ->
        Conexion(
            url = prefs[claveUrl].orEmpty(),
            token = prefs[claveToken].orEmpty(),
            tema = prefs[claveTema].orEmpty(),
        )
    }

    suspend fun actual(): Conexion = conexion.first()

    suspend fun guardar(url: String, token: String, tema: String) {
        context.ajustesDataStore.edit { prefs ->
            prefs[claveUrl] = url.trim()
            prefs[claveToken] = token.trim()
            prefs[claveTema] = tema.trim()
        }
    }
}
