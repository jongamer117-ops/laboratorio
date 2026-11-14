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

data class Preferencias(
    val servidor: String = "colab",
    val colab: Conexion = Conexion(),
    val kaggle: Conexion = Conexion(),
) {
    val activa: Conexion
        get() = if (servidor == "kaggle") kaggle else colab
}

private val Context.ajustesDataStore by preferencesDataStore(name = "ajustes")

class AjustesStore(private val context: Context) {
    private val claveServidor = stringPreferencesKey("servidor")
    private val colabUrl = stringPreferencesKey("colab_url")
    private val colabToken = stringPreferencesKey("colab_token")
    private val colabTema = stringPreferencesKey("colab_tema")
    private val kaggleUrl = stringPreferencesKey("kaggle_url")
    private val kaggleToken = stringPreferencesKey("kaggle_token")
    private val kaggleTema = stringPreferencesKey("kaggle_tema")
    private val legadoUrl = stringPreferencesKey("url")
    private val legadoToken = stringPreferencesKey("token")
    private val legadoTema = stringPreferencesKey("tema")

    val preferencias: Flow<Preferencias> = context.ajustesDataStore.data.map { prefs ->
        val colab = Conexion(
            url = prefs[colabUrl] ?: prefs[legadoUrl].orEmpty(),
            token = prefs[colabToken] ?: prefs[legadoToken].orEmpty(),
            tema = prefs[colabTema] ?: prefs[legadoTema].orEmpty(),
        )
        val kaggle = Conexion(
            url = prefs[kaggleUrl].orEmpty(),
            token = prefs[kaggleToken].orEmpty(),
            tema = prefs[kaggleTema].orEmpty(),
        )
        Preferencias(
            servidor = if (prefs[claveServidor] == "kaggle") "kaggle" else "colab",
            colab = colab,
            kaggle = kaggle,
        )
    }

    val conexion: Flow<Conexion> = preferencias.map { it.activa }

    suspend fun actual(): Conexion = conexion.first()

    suspend fun leer(): Preferencias = preferencias.first()

    suspend fun guardar(url: String, token: String, tema: String) {
        guardarEn(leer().servidor, url, token, tema)
    }

    suspend fun guardarEn(servidor: String, url: String, token: String, tema: String) {
        val limpioUrl = url.trim()
        val limpioToken = token.trim()
        val limpioTema = tema.trim()
        context.ajustesDataStore.edit { prefs ->
            if (servidor == "kaggle") {
                prefs[kaggleUrl] = limpioUrl
                prefs[kaggleToken] = limpioToken
                prefs[kaggleTema] = limpioTema
            } else {
                prefs[colabUrl] = limpioUrl
                prefs[colabToken] = limpioToken
                prefs[colabTema] = limpioTema
                prefs[legadoUrl] = limpioUrl
                prefs[legadoToken] = limpioToken
                prefs[legadoTema] = limpioTema
            }
        }
    }

    suspend fun elegir(servidor: String) {
        context.ajustesDataStore.edit { prefs ->
            prefs[claveServidor] = if (servidor == "kaggle") "kaggle" else "colab"
        }
    }
}
