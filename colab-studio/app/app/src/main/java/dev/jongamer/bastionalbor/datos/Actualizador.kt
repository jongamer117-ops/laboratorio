package dev.jongamer.bastionalbor.datos

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.core.content.FileProvider
import dev.jongamer.bastionalbor.BuildConfig
import dev.jongamer.bastionalbor.logica.esMasNueva
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

data class AvisoVersion(val etiqueta: String, val urlApk: String, val notas: String)

class Actualizador(
    private val context: Context,
    private val http: OkHttpClient,
) {
    fun puedeInstalar(): Boolean = context.packageManager.canRequestPackageInstalls()

    fun abrirAjustesInstalacion() {
        val intent = Intent(
            Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
            Uri.parse("package:${context.packageName}"),
        ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    suspend fun buscar(): AvisoVersion? = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("https://api.github.com/repos/jongamer117-ops/laboratorio/releases/latest")
            .header("User-Agent", "BastionAlbor")
            .header("Accept", "application/vnd.github+json")
            .build()
        http.newCall(request).execute().use { resp ->
            if (resp.code == 404) return@withContext null
            if (resp.code == 403) throw java.io.IOException("GitHub limitó las consultas. Intenta más tarde.")
            if (!resp.isSuccessful) throw java.io.IOException("GitHub respondió ${resp.code}.")
            val json = JSONObject(resp.body?.string().orEmpty())
            val etiqueta = json.optString("tag_name")
            if (!esMasNueva(etiqueta, BuildConfig.VERSION_NAME)) return@withContext null
            val assets = json.optJSONArray("assets") ?: return@withContext null
            var url = ""
            for (i in 0 until assets.length()) {
                val asset = assets.getJSONObject(i)
                if (asset.optString("name").endsWith(".apk")) {
                    url = asset.optString("browser_download_url")
                    break
                }
            }
            if (url.isBlank()) return@withContext null
            AvisoVersion(etiqueta, url, json.optString("body").take(400))
        }
    }

    suspend fun descargar(url: String, onAvance: suspend (Float) -> Unit): File = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(url)
            .header("User-Agent", "BastionAlbor")
            .header("Accept", "application/octet-stream")
            .build()
        http.newCall(request).execute().use { resp ->
            if (!resp.isSuccessful) throw java.io.IOException("No se pudo bajar el APK (${resp.code}).")
            val body = resp.body ?: throw java.io.IOException("La descarga vino vacía.")
            val dir = File(context.cacheDir, "updates").apply { mkdirs() }
            val archivo = File(dir, "BastionAlbor-update.apk")
            val total = body.contentLength().coerceAtLeast(1L)
            body.byteStream().use { input ->
                FileOutputStream(archivo).use { output ->
                    val buffer = ByteArray(16 * 1024)
                    var leido = 0L
                    while (true) {
                        val n = input.read(buffer)
                        if (n < 0) break
                        output.write(buffer, 0, n)
                        leido += n
                        onAvance((leido.toFloat() / total).coerceIn(0f, 1f))
                    }
                }
            }
            archivo
        }
    }

    fun instalar(archivo: File) {
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", archivo)
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}
