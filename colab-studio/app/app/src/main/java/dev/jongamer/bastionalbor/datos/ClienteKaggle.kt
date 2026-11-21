package dev.jongamer.bastionalbor.datos

import dev.jongamer.bastionalbor.logica.faseKernel
import dev.jongamer.bastionalbor.logica.mensajeKaggle
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import okhttp3.Credentials
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.zip.ZipInputStream

class ClienteKaggle(private val http: OkHttpClient) {
    suspend fun empujar(cred: CredencialKaggle, slug: String, codigo: String) = withContext(Dispatchers.IO) {
        val cuerpo = JSONObject()
            .put("slug", "${cred.usuario}/$slug")
            .put("newTitle", slug)
            .put("text", codigo)
            .put("language", "python")
            .put("kernelType", "script")
            .put("isPrivate", true)
            .put("enableGpu", true)
            .put("enableTpu", false)
            .put("enableInternet", true)
            .put("datasetDataSources", JSONArray())
            .put("competitionDataSources", JSONArray())
            .put("kernelDataSources", JSONArray())
            .put("modelDataSources", JSONArray())
            .put("categoryIds", JSONArray())
            .put("dockerImagePinningType", "latest")
        val (codigoHttp, texto) = pedir(cred, "$BASE/kernels/push", cuerpo)
        if (codigoHttp !in 200..299) throw ErrorEstudio.Servidor(mensajeKaggle(codigoHttp, texto))
    }

    suspend fun esperar(
        cred: CredencialKaggle,
        slug: String,
        minutos: Int,
        onAvance: suspend (Float, String) -> Unit,
    ) {
        val limite = System.currentTimeMillis() + minutos.coerceAtLeast(20) * 60_000L
        while (System.currentTimeMillis() < limite) {
            val (codigoHttp, texto) = pedir(
                cred,
                "$BASE/kernels/status?userName=${cred.usuario}&kernelSlug=$slug",
                null,
            )
            if (codigoHttp !in 200..299) throw ErrorEstudio.Servidor(mensajeKaggle(codigoHttp, texto))
            val json = JSONObject(texto)
            val crudo = json.optString("status")
            val fase = faseKernel(crudo)
            val fallo = json.optString("failureMessage")
            when (fase) {
                "cola" -> onAvance(0.12f, "En cola en Kaggle…")
                "corriendo" -> onAvance(0.45f, "Corriendo en Kaggle…")
                "completo" -> {
                    onAvance(0.9f, "Listo. Bajando el resultado…")
                    return
                }
                "error", "apagado" -> throw ErrorEstudio.Servidor(
                    mensajeKaggle(0, fallo.ifBlank { "El kernel de Kaggle falló." }),
                )
            }
            delay(20_000)
        }
        throw ErrorEstudio.Servidor("El kernel sigue en Kaggle después de $minutos minutos.")
    }

    suspend fun descargar(cred: CredencialKaggle, slug: String, destino: File) = withContext(Dispatchers.IO) {
        destino.mkdirs()
        val urls = listOf(
            "$BASE/kernels/output/download/${cred.usuario}/$slug",
            "$BASE/kernels/output?userName=${cred.usuario}&kernelSlug=$slug",
        )
        var ultimo = "Kaggle no devolvió archivos."
        for (url in urls) {
            val (codigoHttp, bytes) = pedirBytes(cred, url)
            if (codigoHttp !in 200..299) {
                ultimo = mensajeKaggle(codigoHttp, bytes.toString(Charsets.UTF_8))
                continue
            }
            if (bytes.size > 3 && bytes[0] == 'P'.code.toByte() && bytes[1] == 'K'.code.toByte()) {
                ZipInputStream(bytes.inputStream()).use { zip ->
                    generateSequence { zip.nextEntry }.forEach { entry ->
                        if (entry.isDirectory) return@forEach
                        val nombre = File(entry.name).name
                        if (nombre.endsWith(".png") || nombre.endsWith(".txt") || nombre.endsWith(".md") || nombre.endsWith(".json")) {
                            File(destino, nombre).outputStream().use { zip.copyTo(it) }
                        }
                    }
                }
                return@withContext
            }
            val texto = bytes.toString(Charsets.UTF_8)
            if (texto.trim().startsWith("{") || texto.trim().startsWith("[")) {
                ultimo = mensajeKaggle(codigoHttp, texto)
            }
        }
        if (destino.listFiles().isNullOrEmpty()) throw ErrorEstudio.Servidor(ultimo)
    }

    private fun pedir(cred: CredencialKaggle, url: String, cuerpo: JSONObject?): Pair<Int, String> {
        val (codigo, bytes) = pedirBytes(cred, url, cuerpo)
        return codigo to bytes.toString(Charsets.UTF_8)
    }

    private fun pedirBytes(cred: CredencialKaggle, url: String, cuerpo: JSONObject? = null): Pair<Int, ByteArray> {
        val builder = Request.Builder()
            .url(url)
            .header("Authorization", Credentials.basic(cred.usuario, cred.llave))
            .header("User-Agent", "BastionAlbor")
        if (cuerpo != null) {
            builder.post(cuerpo.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
        }
        return http.newCall(builder.build()).execute().use { resp ->
            resp.code to (resp.body?.bytes() ?: ByteArray(0))
        }
    }

    companion object {
        private const val BASE = "https://www.kaggle.com/api/v1"
    }
}
