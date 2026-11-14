package dev.jongamer.bastionalbor.datos

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class ClienteColab(
    private val http: OkHttpClient,
    private val ajustes: AjustesStore,
) {
    suspend fun salud(): JSONObject {
        val (base, token) = credenciales()
        val (codigo, cuerpo) = pedir("$base/api/salud", token, null)
        if (codigo == 401) throw ErrorEstudio.Token()
        if (codigo !in 200..299) throw ErrorEstudio.Apagado()
        return JSONObject(cuerpo)
    }

    suspend fun descubrir(tema: String): Conexion? = withContext(Dispatchers.IO) {
        val url = "https://ntfy.sh/${tema.trim()}/json?poll=1&since=24h"
        val request = Request.Builder().url(url).header("User-Agent", "BastionAlbor").build()
        val texto = http.newCall(request).execute().use { resp ->
            if (!resp.isSuccessful) throw IOException("ntfy respondió ${resp.code}")
            resp.body?.string().orEmpty()
        }
        texto.lineSequence().map { it.trim() }.filter { it.startsWith("{") }.toList().asReversed().forEach { linea ->
            val aviso = try {
                JSONObject(linea)
            } catch (_: Exception) {
                return@forEach
            }
            val mensaje = aviso.optString("message")
            val datos = try {
                JSONObject(mensaje)
            } catch (_: Exception) {
                return@forEach
            }
            val hallada = datos.optString("u")
            val token = datos.optString("t")
            if (hallada.startsWith("http") && token.isNotBlank()) {
                return@withContext Conexion(hallada, token, datos.optString("n", tema))
            }
        }
        null
    }

    suspend fun esperar(cuerpo: JSONObject, onAvance: suspend (Float, String) -> Unit): JSONObject {
        val (base, token) = credenciales()
        val (codigo, respuesta) = pedir("$base/api/trabajos", token, cuerpo)
        if (codigo == 401) throw ErrorEstudio.Token()
        if (codigo !in 200..299) throw interpretar(codigo, respuesta)
        val id = JSONObject(respuesta).getString("id")
        val limite = System.currentTimeMillis() + 15 * 60_000L
        var fallos = 0
        while (System.currentTimeMillis() < limite) {
            try {
                val (estadoCodigo, estadoCuerpo) = pedir("$base/api/trabajos/$id", token, null)
                if (estadoCodigo == 401) throw ErrorEstudio.Token()
                if (estadoCodigo == 404) {
                    throw ErrorEstudio.Servidor("El trabajo ya no está en el servidor. Si el notebook se reinició, genera otra vez.")
                }
                if (estadoCodigo !in 200..299) throw interpretar(estadoCodigo, estadoCuerpo)
                fallos = 0
                val estado = JSONObject(estadoCuerpo)
                onAvance(estado.optDouble("avance", 0.0).toFloat(), estado.optString("mensaje"))
                when (estado.optString("estado")) {
                    "listo" -> {
                        val (resCodigo, resCuerpo) = pedir("$base/api/trabajos/$id/resultado", token, null)
                        if (resCodigo !in 200..299) throw interpretar(resCodigo, resCuerpo)
                        return JSONObject(resCuerpo)
                    }
                    "error" -> throw ErrorEstudio.Servidor(estado.optString("error", "Falló la generación."))
                }
            } catch (error: ErrorEstudio) {
                throw error
            } catch (_: IOException) {
                fallos += 1
                if (fallos >= 4) throw ErrorEstudio.Apagado()
            }
            delay(2000)
        }
        throw ErrorEstudio.Servidor(
            "Pasaron 15 minutos. El túnel pudo caducar; si el notebook sigue abierto, el trabajo quizá sigue ahí.",
        )
    }

    private suspend fun credenciales(): Pair<String, String> {
        val conexion = ajustes.actual()
        if (conexion.url.isBlank() || conexion.token.isBlank()) throw ErrorEstudio.SinConexion()
        var base = conexion.url.trim().trimEnd('/')
        if (base.endsWith("/api")) base = base.removeSuffix("/api")
        if (!base.startsWith("http://") && !base.startsWith("https://")) {
            throw ErrorEstudio.Servidor("La URL tiene que empezar con http:// o https://.")
        }
        return base to conexion.token
    }

    private suspend fun pedir(url: String, token: String, cuerpo: JSONObject?): Pair<Int, String> =
        withContext(Dispatchers.IO) {
            val builder = Request.Builder()
                .url(url)
                .header("Authorization", "Bearer $token")
                .header("Accept", "application/json")
                .header("User-Agent", "BastionAlbor")
            if (cuerpo != null) {
                builder.post(cuerpo.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
            }
            http.newCall(builder.build()).execute().use { resp ->
                resp.code to resp.body?.string().orEmpty()
            }
        }

    private fun interpretar(codigo: Int, cuerpo: String): ErrorEstudio {
        val json = try {
            JSONObject(cuerpo)
        } catch (_: Exception) {
            null
        }
        if (json == null && (codigo in 500..599 || codigo == 404 || codigo == 0)) {
            return ErrorEstudio.Apagado()
        }
        val mensaje = json?.optString("mensaje").orEmpty().ifBlank { "El servidor respondió $codigo." }
        return when {
            codigo == 401 || json?.optString("error") == "token" -> ErrorEstudio.Token()
            json?.optString("error") == "prompt_bloqueado" -> ErrorEstudio.Bloqueado(mensaje)
            else -> ErrorEstudio.Servidor(mensaje)
        }
    }
}
