package dev.jongamer.bastionalbor.datos

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Typeface
import android.net.Uri
import android.util.Base64
import android.util.Log
import androidx.room.Room
import dev.jongamer.bastionalbor.logica.PRESET_AIGIS
import dev.jongamer.bastionalbor.logica.PngTexto
import dev.jongamer.bastionalbor.logica.SISTEMA_DEFAULT
import dev.jongamer.bastionalbor.logica.extraerPedido
import dev.jongamer.bastionalbor.logica.nombreArchivo
import dev.jongamer.bastionalbor.logica.relatoMarkdown
import dev.jongamer.bastionalbor.logica.terminoImagenBloqueado
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.concurrent.TimeUnit

data class ImagenGuardada(
    val bitmap: Bitmap?,
    val uri: Uri,
    val semilla: Long,
    val nombre: String,
)

data class RelatoGuardado(
    val texto: String,
    val uri: Uri,
    val nombre: String,
    val modelo: String,
)

class Repositorio(context: Context) {
    private val app = context.applicationContext
    val ajustes = AjustesStore(app)
    val archivos = Archivos(app.contentResolver)
    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .writeTimeout(25, TimeUnit.SECONDS)
        .callTimeout(40, TimeUnit.SECONDS)
        .build()
    val cliente = ClienteColab(http, ajustes)
    val actualizador = Actualizador(app, http)
    private val db = Room.databaseBuilder(app, BastionDb::class.java, "bastion.db").build()
    val generaciones = db.generaciones().observar()
    val rehacerImagen = MutableStateFlow<Generacion?>(null)
    val rehacerRelato = MutableStateFlow<Generacion?>(null)

    var demoModo: String? = null
    var demoBitmap: Bitmap? = null

    suspend fun generarImagen(
        prompt: String,
        negativo: String,
        ancho: Int,
        alto: Int,
        cantidad: Int,
        semilla: Long?,
        pasos: Int,
        guia: Float,
        marco: String,
        onAvance: suspend (Float, String) -> Unit,
    ): List<ImagenGuardada> = withContext(Dispatchers.IO) {
        val bloqueo = terminoImagenBloqueado(prompt)
        if (bloqueo != null) {
            throw ErrorEstudio.Bloqueado(
                "Bloqueado por el término «$bloqueo». Cámbialo. El negativo de menores se aplica en el servidor y no se puede quitar.",
            )
        }
        val cuerpo = JSONObject()
            .put("tipo", "imagen")
            .put("prompt", prompt.trim())
            .put("negativo", negativo.trim())
            .put("ancho", ancho)
            .put("alto", alto)
            .put("cantidad", cantidad)
            .put("pasos", pasos)
            .put("guia", guia.toDouble())
        if (semilla != null) cuerpo.put("semilla", semilla)
        val resultado = cliente.esperar(cuerpo, onAvance)
        val imagenes = resultado.getJSONArray("imagenes")
        val negativoUsado = resultado.optString("negativo_usado")
        val modelo = resultado.optString("modelo")
        val ajustesJson = JSONObject()
            .put("ancho", ancho)
            .put("alto", alto)
            .put("pasos", pasos)
            .put("guia", guia.toDouble())
            .put("cantidad", cantidad)
            .put("marco", marco)
            .toString()
        buildList {
            for (i in 0 until imagenes.length()) {
                val item = imagenes.getJSONObject(i)
                val crudo = Base64.decode(item.getString("png_base64"), Base64.DEFAULT)
                val semillaReal = item.optLong("semilla")
                val nombre = item.optString("nombre").ifBlank { nombreArchivo("bastion", "png") }
                val png = PngTexto.insertar(
                    crudo,
                    linkedMapOf(
                        "prompt" to prompt.trim(),
                        "negative" to negativoUsado,
                        "seed" to semillaReal.toString(),
                        "steps" to pasos.toString(),
                        "guidance" to guia.toString(),
                        "model" to modelo,
                        "app" to "BastionAlbor",
                    ),
                )
                val uri = archivos.guardarPng(png, nombre)
                db.generaciones().insertar(
                    Generacion(
                        tipo = "imagen",
                        prompt = prompt.trim(),
                        negativo = negativoUsado,
                        sistema = null,
                        ajustesJson = ajustesJson,
                        semilla = semillaReal,
                        creadoEn = System.currentTimeMillis(),
                        uri = uri.toString(),
                        nombre = nombre,
                        modelo = modelo,
                        marco = marco,
                    ),
                )
                add(ImagenGuardada(android.graphics.BitmapFactory.decodeByteArray(png, 0, png.size), uri, semillaReal, nombre))
            }
        }
    }

    suspend fun generarRelato(
        sistema: String,
        pedido: String,
        largo: Int,
        creatividad: Float,
        modelo: String,
        onAvance: suspend (Float, String) -> Unit,
    ): RelatoGuardado = withContext(Dispatchers.IO) {
        val cuerpo = JSONObject()
            .put("tipo", "relato")
            .put("sistema", sistema.trim())
            .put("pedido", pedido.trim())
            .put("largo", largo)
            .put("creatividad", creatividad.toDouble())
            .put("modelo", modelo)
        val resultado = cliente.esperar(cuerpo, onAvance)
        val texto = resultado.optString("texto")
        val modeloUsado = resultado.optString("modelo", modelo)
        val nombre = nombreArchivo("relato", "md")
        val archivo = relatoMarkdown(sistema.trim(), pedido.trim(), texto, modeloUsado)
        val uri = archivos.guardarTexto(archivo, nombre)
        db.generaciones().insertar(
            Generacion(
                tipo = "relato",
                prompt = pedido.trim(),
                negativo = null,
                sistema = sistema.trim(),
                ajustesJson = JSONObject()
                    .put("largo", largo)
                    .put("creatividad", creatividad.toDouble())
                    .put("modelo", modelo)
                    .toString(),
                semilla = null,
                creadoEn = System.currentTimeMillis(),
                uri = uri.toString(),
                nombre = nombre,
                modelo = modeloUsado,
                marco = "oro",
            ),
        )
        RelatoGuardado(texto, uri, nombre, modeloUsado)
    }

    suspend fun borrar(item: Generacion) {
        archivos.borrar(Uri.parse(item.uri))
        db.generaciones().borrar(item.id)
    }

    suspend fun reconciliar() = withContext(Dispatchers.IO) {
        try {
            for (medio in archivos.listarImagenes()) {
                if (db.generaciones().porUri(medio.uri.toString()) != null) continue
                val bytes = archivos.leerBytes(medio.uri)
                val meta = bytes?.let { PngTexto.leer(it) }.orEmpty()
                db.generaciones().insertar(
                    Generacion(
                        tipo = "imagen",
                        prompt = meta["prompt"] ?: medio.nombre,
                        negativo = meta["negative"],
                        sistema = null,
                        ajustesJson = "{}",
                        semilla = meta["seed"]?.toLongOrNull(),
                        creadoEn = medio.fechaMs,
                        uri = medio.uri.toString(),
                        nombre = medio.nombre,
                        modelo = meta["model"],
                        marco = "oro",
                    ),
                )
            }
            for (medio in archivos.listarTextos()) {
                if (db.generaciones().porUri(medio.uri.toString()) != null) continue
                val texto = archivos.leerTexto(medio.uri).orEmpty()
                db.generaciones().insertar(
                    Generacion(
                        tipo = "relato",
                        prompt = extraerPedido(texto).ifBlank { medio.nombre },
                        negativo = null,
                        sistema = null,
                        ajustesJson = "{}",
                        semilla = null,
                        creadoEn = medio.fechaMs,
                        uri = medio.uri.toString(),
                        nombre = medio.nombre,
                        modelo = null,
                        marco = "oro",
                    ),
                )
            }
        } catch (error: Exception) {
            Log.w("Bastion", "No se pudo reconciliar la galería", error)
        }
    }

    suspend fun prepararDemo(modo: String) {
        demoModo = modo
        ajustes.guardar("https://demo.trycloudflare.com", "demo-token", "bastion-demo")
        val bmp = dibujarRetratoDemo()
        demoBitmap = bmp
        if (db.generaciones().porNombre("bastion-demo.png") != null) return
        try {
            val stream = ByteArrayOutputStream()
            bmp.compress(Bitmap.CompressFormat.PNG, 100, stream)
            val png = PngTexto.insertar(
                stream.toByteArray(),
                mapOf("prompt" to PRESET_AIGIS, "seed" to "1", "app" to "BastionAlbor"),
            )
            val uri = archivos.guardarPng(png, "bastion-demo.png")
            db.generaciones().insertar(
                Generacion(
                    tipo = "imagen",
                    prompt = PRESET_AIGIS,
                    negativo = "lowres, child, loli, shota, young, underage",
                    sistema = null,
                    ajustesJson = """{"ancho":832,"alto":1216,"pasos":28,"guia":5.5,"cantidad":1,"marco":"oro"}""",
                    semilla = 1,
                    creadoEn = System.currentTimeMillis(),
                    uri = uri.toString(),
                    nombre = "bastion-demo.png",
                    modelo = "vista-previa",
                    marco = "oro",
                ),
            )
            val md = relatoMarkdown(
                SISTEMA_DEFAULT,
                "El primer asedio del bastión.",
                "La muralla aguantó hasta el alba. El oro de las almenas seguía frío.",
                "vista-previa",
            )
            val uriTxt = archivos.guardarTexto(md, "relato-demo.md")
            db.generaciones().insertar(
                Generacion(
                    tipo = "relato",
                    prompt = "El primer asedio del bastión.",
                    negativo = null,
                    sistema = SISTEMA_DEFAULT,
                    ajustesJson = """{"largo":700,"creatividad":0.8,"modelo":"abliterado"}""",
                    semilla = null,
                    creadoEn = System.currentTimeMillis(),
                    uri = uriTxt.toString(),
                    nombre = "relato-demo.md",
                    modelo = "vista-previa",
                    marco = "oro",
                ),
            )
        } catch (error: Exception) {
            Log.w("Bastion", "La vista previa no se pudo guardar en el almacenamiento", error)
        }
    }

    private fun dibujarRetratoDemo(): Bitmap {
        val ancho = 832
        val alto = 1216
        val bitmap = Bitmap.createBitmap(ancho, alto, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawColor(Color.parseColor("#100E0C"))
        val oro = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#D4B06A")
            style = Paint.Style.STROKE
            strokeWidth = 10f
        }
        canvas.drawRect(72f, 72f, ancho - 72f, alto - 72f, oro)
        oro.strokeWidth = 4f
        canvas.drawRect(96f, 96f, ancho - 96f, alto - 96f, oro)
        val relleno = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#D4B06A")
            style = Paint.Style.FILL
        }
        val torre = Path().apply {
            moveTo(300f, 860f)
            lineTo(300f, 560f)
            lineTo(250f, 560f)
            lineTo(250f, 500f)
            lineTo(330f, 500f)
            lineTo(330f, 450f)
            lineTo(390f, 450f)
            lineTo(390f, 500f)
            lineTo(450f, 500f)
            lineTo(450f, 450f)
            lineTo(510f, 450f)
            lineTo(510f, 500f)
            lineTo(580f, 500f)
            lineTo(580f, 560f)
            lineTo(532f, 560f)
            lineTo(532f, 860f)
            close()
        }
        canvas.drawPath(torre, relleno)
        val carmesi = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.parseColor("#B33A3A") }
        canvas.drawCircle(416f, 680f, 26f, carmesi)
        val titulo = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#F6F0E6")
            textAlign = Paint.Align.CENTER
            textSize = 72f
            typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
        }
        canvas.drawText("Bastión", ancho / 2f, 980f, titulo)
        titulo.textSize = 42f
        titulo.color = Color.parseColor("#D4B06A")
        canvas.drawText("de Albor", ancho / 2f, 1040f, titulo)
        return bitmap
    }
}
