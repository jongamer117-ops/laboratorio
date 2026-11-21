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
import dev.jongamer.bastionalbor.logica.nombreSeguro
import dev.jongamer.bastionalbor.logica.PRESET_AIGIS
import dev.jongamer.bastionalbor.logica.PngTexto
import dev.jongamer.bastionalbor.logica.SISTEMA_DEFAULT
import dev.jongamer.bastionalbor.logica.extraerPedido
import dev.jongamer.bastionalbor.logica.nombreArchivo
import dev.jongamer.bastionalbor.logica.relatoMarkdown
import dev.jongamer.bastionalbor.logica.terminoImagenBloqueado
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
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

data class CapituloHecho(
    val numero: Int,
    val texto: String,
    val resumen: String,
    val nombre: String,
    val uri: String,
)

data class NovelaHecha(
    val proyecto: String,
    val biblia: String,
    val esquema: String,
    val resumenes: List<Pair<Int, String>>,
    val cola: String,
    val siguiente: Int,
    val capitulos: List<CapituloHecho>,
)

data class EstadoSesion(
    val quiere: Boolean = false,
    val fase: String = "apagado",
    val mensaje: String = "Apagado",
    val minutos: Int = 0,
    val minutosOcio: Int = 15,
    val usuario: String = "",
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
    private val credencialesKaggle = CredencialesKaggle(app)
    private val clienteKaggle = ClienteKaggle(
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(180, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .callTimeout(0, TimeUnit.SECONDS)
            .build(),
    )
    val sesion = MutableStateFlow(EstadoSesion())
    private val sesionMutex = Mutex()
    private var sesionInicio = 0L

    fun leerTexto(uri: android.net.Uri): String =
        app.contentResolver.openInputStream(uri)?.use { it.readBytes().toString(Charsets.UTF_8) }.orEmpty()

    fun usuarioKaggle(): String = credencialesKaggle.leer()?.usuario.orEmpty()

    fun guardarKaggle(usuario: String, llave: String) {
        credencialesKaggle.guardar(usuario, llave)
        sesion.value = sesion.value.copy(usuario = usuario)
    }

    suspend fun fijarSesion(quiere: Boolean, onAvance: suspend (Float, String) -> Unit = { _, _ -> }) {
        if (!quiere) {
            apagarSesion()
            return
        }
        sesion.value = sesion.value.copy(quiere = true, fase = "arrancando", mensaje = "Arrancando…")
        arrancarSesion(onAvance)
    }

    suspend fun fijarOcio(minutos: Int) {
        ajustes.fijarMinutosOcio(minutos)
        sesion.value = sesion.value.copy(minutosOcio = minutos.coerceIn(5, 120))
    }

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
        modelo: String,
        onAvance: suspend (Float, String) -> Unit,
    ): List<ImagenGuardada> = withContext(Dispatchers.IO) {
        val bloqueo = terminoImagenBloqueado(prompt)
        if (bloqueo != null) {
            throw ErrorEstudio.Bloqueado(
                "Bloqueado por el término «$bloqueo». Cámbialo. El negativo de menores se aplica en el servidor y no se puede quitar.",
            )
        }
        if (!quiereServidor(onAvance)) return@withContext loteImagen(prompt, negativo, cantidad, semilla, pasos, guia, marco, modelo, onAvance)
        val cuerpo = JSONObject()
            .put("tipo", "imagen")
            .put("prompt", prompt.trim())
            .put("negativo", negativo.trim())
            .put("ancho", ancho)
            .put("alto", alto)
            .put("cantidad", cantidad)
            .put("pasos", pasos)
            .put("guia", guia.toDouble())
            .put("modelo", modelo)
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
            .put("modelo", modelo)
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
        if (!quiereServidor(onAvance)) return@withContext loteRelato(sistema, pedido, largo, creatividad, modelo, onAvance)
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

    suspend fun continuarNovela(
        proyecto: String,
        biblia: String,
        esquema: String,
        resumenes: List<Pair<Int, String>>,
        cola: String,
        siguiente: Int,
        cantidad: Int,
        modelo: String,
        creatividad: Float,
        onAvance: suspend (Float, String) -> Unit,
    ): NovelaHecha = withContext(Dispatchers.IO) {
        if (!quiereServidor(onAvance)) {
            return@withContext loteNovela(proyecto, biblia, esquema, resumenes, cola, siguiente, cantidad, modelo, creatividad, onAvance)
        }
        if (!conectarSiHaceFalta()) throw ErrorEstudio.SinConexion()
        val cuerpo = JSONObject()
            .put("tipo", "novela")
            .put("proyecto", proyecto.trim())
            .put("biblia", biblia)
            .put("esquema", esquema)
            .put("cola", cola)
            .put("siguiente", siguiente)
            .put("cantidad", cantidad)
            .put("creatividad", creatividad.toDouble())
            .put("modelo", modelo)
        val lista = org.json.JSONArray()
        resumenes.takeLast(12).forEach { (n, texto) ->
            lista.put(JSONObject().put("n", n).put("texto", texto))
        }
        cuerpo.put("resumenes", lista)
        guardarNovelaLocal(
            proyecto,
            NovelaHecha(
                proyecto = nombreSeguro(proyecto),
                biblia = biblia,
                esquema = esquema,
                resumenes = resumenes.takeLast(12),
                cola = cola,
                siguiente = siguiente,
                capitulos = emptyList(),
            ),
        )
        val resultado = cliente.esperar(cuerpo, onAvance, minutos = 10 * cantidad)
        val carpeta = "Documents/BastionAlbor/${nombreSeguro(proyecto)}"
        val capitulosJson = resultado.getJSONArray("capitulos")
        val capitulos = buildList {
            for (i in 0 until capitulosJson.length()) {
                val item = capitulosJson.getJSONObject(i)
                val numero = item.getInt("numero")
                val texto = item.getString("texto")
                val nombre = item.optString("nombre", "capitulo-%03d.txt".format(numero))
                val archivo = "# Capítulo $numero\n\n$texto\n"
                val uri = archivos.guardarTextoEn(carpeta, nombre, archivo)
                db.generaciones().insertar(
                    Generacion(
                        tipo = "relato",
                        prompt = "Capítulo $numero · ${proyecto.trim()}",
                        negativo = null,
                        sistema = biblia,
                        ajustesJson = JSONObject().put("proyecto", nombreSeguro(proyecto)).put("capitulo", numero).toString(),
                        semilla = null,
                        creadoEn = System.currentTimeMillis(),
                        uri = uri.toString(),
                        nombre = nombre,
                        modelo = resultado.optString("modelo", modelo),
                        marco = "oro",
                    ),
                )
                add(CapituloHecho(numero, texto, item.optString("resumen"), nombre, uri.toString()))
            }
        }
        val bibliaNueva = resultado.optString("biblia", biblia)
        val esquemaNuevo = resultado.optString("esquema", esquema)
        val resumenesNuevos = mutableListOf<Pair<Int, String>>()
        val arr = resultado.optJSONArray("resumenes")
        if (arr != null) {
            for (i in 0 until arr.length()) {
                val r = arr.getJSONObject(i)
                resumenesNuevos += r.optInt("n") to r.optString("texto")
            }
        }
        archivos.guardarTextoEn(carpeta, "biblia.txt", bibliaNueva)
        archivos.guardarTextoEn(carpeta, "esquema.txt", esquemaNuevo)
        val hecha = NovelaHecha(
            proyecto = resultado.optString("proyecto", nombreSeguro(proyecto)),
            biblia = bibliaNueva,
            esquema = esquemaNuevo,
            resumenes = resumenesNuevos,
            cola = resultado.optString("cola"),
            siguiente = resultado.optInt("siguiente", siguiente + capitulos.size),
            capitulos = capitulos,
        )
        guardarNovelaLocal(proyecto, hecha)
        hecha
    }

    fun cargarNovelaLocal(nombre: String): NovelaHecha? {
        val archivo = archivoNovela(nombre)
        if (!archivo.exists()) return null
        return try {
            val json = JSONObject(archivo.readText())
            val resumenes = mutableListOf<Pair<Int, String>>()
            val arr = json.optJSONArray("resumenes")
            if (arr != null) {
                for (i in 0 until arr.length()) {
                    val r = arr.getJSONObject(i)
                    resumenes += r.optInt("n") to r.optString("texto")
                }
            }
            NovelaHecha(
                proyecto = json.optString("proyecto", nombreSeguro(nombre)),
                biblia = json.optString("biblia"),
                esquema = json.optString("esquema"),
                resumenes = resumenes,
                cola = json.optString("cola"),
                siguiente = json.optInt("siguiente", 1),
                capitulos = emptyList(),
            )
        } catch (_: Exception) {
            null
        }
    }

    private fun guardarNovelaLocal(nombre: String, hecha: NovelaHecha) {
        val arr = org.json.JSONArray()
        hecha.resumenes.forEach { (n, texto) -> arr.put(JSONObject().put("n", n).put("texto", texto)) }
        val json = JSONObject()
            .put("proyecto", hecha.proyecto)
            .put("biblia", hecha.biblia)
            .put("esquema", hecha.esquema)
            .put("cola", hecha.cola)
            .put("siguiente", hecha.siguiente)
            .put("resumenes", arr)
        archivoNovela(nombre).writeText(json.toString())
    }

    private fun archivoNovela(nombre: String): java.io.File {
        val dir = java.io.File(app.filesDir, "novelas").apply { mkdirs() }
        return java.io.File(dir, "${nombreSeguro(nombre)}.json")
    }

    private suspend fun quiereServidor(onAvance: suspend (Float, String) -> Unit): Boolean {
        val prefs = ajustes.leer()
        if (sesion.value.quiere) {
            if (sesion.value.fase != "listo") arrancarSesion(onAvance)
            if (!conectarSiHaceFalta()) throw ErrorEstudio.Servidor("La sesión no anunció el túnel. Espera un poco más o apágala.")
            return true
        }
        if (prefs.notebookPropio) {
            if (!conectarSiHaceFalta()) throw ErrorEstudio.SinConexion()
            return true
        }
        return false
    }

    private fun exigirKaggle(): CredencialKaggle =
        credencialesKaggle.leer() ?: throw ErrorEstudio.Servidor("Pega tu kaggle.json en Ajustes. Hace falta una sola vez.")

    suspend fun arrancarSesion(onAvance: suspend (Float, String) -> Unit = { _, _ -> }) = sesionMutex.withLock {
        val cred = exigirKaggle()
        val prefs = ajustes.leer()
        val idle = prefs.minutosOcio
        sesionInicio = System.currentTimeMillis()
        apagarPendiente = false
        sesion.value = EstadoSesion(true, "arrancando", "Arrancando…", 0, idle, cred.usuario)
        onAvance(0.05f, "Arrancando la sesión en Kaggle…")
        val codigo = PlantillaKernel.armar(app, "sesion", null, idle)
        clienteKaggle.empujar(cred, "bastion-sesion", codigo)
        val limite = System.currentTimeMillis() + 25 * 60_000L
        while (System.currentTimeMillis() < limite && sesion.value.quiere) {
            val minutos = ((System.currentTimeMillis() - sesionInicio) / 60_000L).toInt()
            sesion.value = sesion.value.copy(minutos = minutos, mensaje = "Arrancando…")
            onAvance(0.2f, "Arrancando… ${minutos} min de GPU")
            val avisos = runCatching { cliente.avisosDescubrimiento() }.getOrDefault(emptyList())
            val fresco = avisos.filter { it.backend == "kaggle" && it.en >= sesionInicio / 1000.0 - 30 }
                .maxByOrNull { it.en }
            if (fresco != null) {
                ajustes.guardarEn("kaggle", fresco.url, fresco.token, "kaggle")
                ajustes.elegir("kaggle")
                if (runCatching { cliente.saludEn(fresco.url, fresco.token) }.isSuccess) {
                    if (apagarPendiente) {
                        runCatching { cliente.apagar() }
                        sesion.value = sesion.value.copy(quiere = false, fase = "apagado", mensaje = "Apagado")
                        return
                    }
                    sesion.value = sesion.value.copy(fase = "listo", mensaje = "Listo", minutos = minutos)
                    onAvance(1f, "Sesión lista")
                    return
                }
            }
            delay(20_000)
        }
        if (sesion.value.quiere) {
            sesion.value = sesion.value.copy(fase = "apagado", quiere = false, mensaje = "No arrancó")
            throw ErrorEstudio.Servidor("La sesión no se anunció. Revisa teléfono verificado, GPU e internet en Kaggle.")
        }
    }

    suspend fun apagarSesion() {
        apagarPendiente = true
        runCatching { cliente.apagar() }
        sesion.value = sesion.value.copy(quiere = false, fase = "apagado", mensaje = "Apagado")
    }

    private var apagarPendiente = false

    private suspend fun loteImagen(
        prompt: String,
        negativo: String,
        cantidad: Int,
        semilla: Long?,
        pasos: Int,
        guia: Float,
        marco: String,
        modelo: String,
        onAvance: suspend (Float, String) -> Unit,
    ): List<ImagenGuardada> {
        val cred = exigirKaggle()
        val pedido = JSONObject()
            .put("tipo", "imagen")
            .put("prompt", prompt.trim())
            .put("negativo", negativo.trim())
            .put("ancho", 832)
            .put("alto", 1216)
            .put("cantidad", cantidad)
            .put("pasos", pasos)
            .put("guia", guia.toDouble())
            .put("modelo", modelo)
        if (semilla != null) pedido.put("semilla", semilla)
        val codigo = PlantillaKernel.armar(app, "imagen", pedido, 15)
        onAvance(0.05f, "Enviando el kernel a Kaggle…")
        clienteKaggle.empujar(cred, "bastion-imagenes", codigo)
        clienteKaggle.esperar(cred, "bastion-imagenes", 90, onAvance)
        val dir = java.io.File(app.cacheDir, "kaggle-imagen").apply { deleteRecursively(); mkdirs() }
        clienteKaggle.descargar(cred, "bastion-imagenes", dir)
        val pngs = dir.listFiles { f -> f.extension == "png" }?.sortedBy { it.name }.orEmpty()
        if (pngs.isEmpty()) throw ErrorEstudio.Servidor("Kaggle terminó sin imágenes.")
        return pngs.map { archivo ->
            val bytes = archivo.readBytes()
            val png = PngTexto.insertar(bytes, linkedMapOf("prompt" to prompt.trim(), "app" to "BastionAlbor", "model" to modelo))
            val uri = archivos.guardarPng(png, archivo.name)
            db.generaciones().insertar(
                Generacion(
                    tipo = "imagen",
                    prompt = prompt.trim(),
                    negativo = negativo,
                    sistema = null,
                    ajustesJson = pedido.toString(),
                    semilla = semilla,
                    creadoEn = System.currentTimeMillis(),
                    uri = uri.toString(),
                    nombre = archivo.name,
                    modelo = modelo,
                    marco = marco,
                ),
            )
            ImagenGuardada(android.graphics.BitmapFactory.decodeByteArray(png, 0, png.size), uri, semilla ?: 0L, archivo.name)
        }
    }

    private suspend fun loteRelato(
        sistema: String,
        pedido: String,
        largo: Int,
        creatividad: Float,
        modelo: String,
        onAvance: suspend (Float, String) -> Unit,
    ): RelatoGuardado {
        if (modelo == "32b") {
            throw ErrorEstudio.Servidor("El kernel automático tiene una sola GPU. Elige el 14B, o abre el notebook a mano con dos T4.")
        }
        val cred = exigirKaggle()
        val cuerpo = JSONObject()
            .put("tipo", "relato")
            .put("sistema", sistema)
            .put("pedido", pedido)
            .put("largo", largo)
            .put("creatividad", creatividad.toDouble())
            .put("modelo", modelo)
        return guardarTextoKaggle(cred, "bastion-historias", cuerpo, "relato.md", pedido, onAvance).let { (texto, uri, nombre) ->
            RelatoGuardado(texto, uri, nombre, modelo)
        }
    }

    private suspend fun loteNovela(
        proyecto: String,
        biblia: String,
        esquema: String,
        resumenes: List<Pair<Int, String>>,
        cola: String,
        siguiente: Int,
        cantidad: Int,
        modelo: String,
        creatividad: Float,
        onAvance: suspend (Float, String) -> Unit,
    ): NovelaHecha {
        if (modelo == "32b") {
            throw ErrorEstudio.Servidor("El kernel automático tiene una sola GPU. Elige el 14B, o abre el notebook a mano con dos T4.")
        }
        val cred = exigirKaggle()
        val cuerpo = JSONObject()
            .put("tipo", "novela")
            .put("proyecto", proyecto)
            .put("biblia", biblia)
            .put("esquema", esquema)
            .put("cola", cola)
            .put("siguiente", siguiente)
            .put("cantidad", cantidad)
            .put("modelo", modelo)
            .put("creatividad", creatividad.toDouble())
        val lista = org.json.JSONArray()
        resumenes.takeLast(12).forEach { (n, texto) -> lista.put(JSONObject().put("n", n).put("texto", texto)) }
        cuerpo.put("resumenes", lista)
        onAvance(0.05f, "Enviando el capítulo a Kaggle…")
        clienteKaggle.empujar(cred, "bastion-historias", PlantillaKernel.armar(app, "historia", cuerpo, 15))
        clienteKaggle.esperar(cred, "bastion-historias", 20 * cantidad, onAvance)
        val dir = java.io.File(app.cacheDir, "kaggle-historia").apply { deleteRecursively(); mkdirs() }
        clienteKaggle.descargar(cred, "bastion-historias", dir)
        val resultado = JSONObject(java.io.File(dir, "resultado.json").readText())
        val carpeta = "Documents/BastionAlbor/${nombreSeguro(proyecto)}"
        val capitulos = mutableListOf<CapituloHecho>()
        val arr = resultado.optJSONArray("capitulos")
        if (arr != null) {
            for (i in 0 until arr.length()) {
                val item = arr.getJSONObject(i)
                val nombre = item.optString("nombre")
                val texto = java.io.File(dir, nombre).takeIf { it.exists() }?.readText().orEmpty()
                val uri = archivos.guardarTextoEn(carpeta, nombre, texto)
                capitulos += CapituloHecho(item.optInt("numero"), texto, item.optString("resumen"), nombre, uri.toString())
            }
        }
        val resumenesNuevos = mutableListOf<Pair<Int, String>>()
        val res = resultado.optJSONArray("resumenes")
        if (res != null) {
            for (i in 0 until res.length()) {
                val r = res.getJSONObject(i)
                resumenesNuevos += r.optInt("n") to r.optString("texto")
            }
        }
        val hecha = NovelaHecha(
            proyecto = resultado.optString("proyecto", nombreSeguro(proyecto)),
            biblia = resultado.optString("biblia", biblia),
            esquema = resultado.optString("esquema", esquema),
            resumenes = resumenesNuevos,
            cola = resultado.optString("cola"),
            siguiente = resultado.optInt("siguiente", siguiente + capitulos.size),
            capitulos = capitulos,
        )
        archivos.guardarTextoEn(carpeta, "biblia.txt", hecha.biblia)
        guardarNovelaLocal(proyecto, hecha)
        return hecha
    }

    private suspend fun guardarTextoKaggle(
        cred: CredencialKaggle,
        slug: String,
        cuerpo: JSONObject,
        nombre: String,
        pedido: String,
        onAvance: suspend (Float, String) -> Unit,
    ): Triple<String, android.net.Uri, String> {
        onAvance(0.05f, "Enviando el relato a Kaggle…")
        clienteKaggle.empujar(cred, slug, PlantillaKernel.armar(app, "historia", cuerpo, 15))
        clienteKaggle.esperar(cred, slug, 40, onAvance)
        val dir = java.io.File(app.cacheDir, "kaggle-relato").apply { deleteRecursively(); mkdirs() }
        clienteKaggle.descargar(cred, slug, dir)
        val texto = java.io.File(dir, nombre).takeIf { it.exists() }?.readText()
            ?: JSONObject(java.io.File(dir, "resultado.json").readText()).optString("texto")
        val uri = archivos.guardarTexto(relatoMarkdown("", pedido, texto, cuerpo.optString("modelo")), nombre)
        return Triple(texto, uri, nombre)
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

    suspend fun conectarSiHaceFalta(): Boolean {
        val prefs = ajustes.leer()
        if (prefs.manual) return prefs.activa.url.isNotBlank() && prefs.activa.token.isNotBlank()
        if (conectarPorDescubrimiento()) return true
        val activa = ajustes.actual()
        return activa.url.isNotBlank() && activa.token.isNotBlank()
    }

    private suspend fun conectarPorDescubrimiento(): Boolean {
        val avisos = try {
            cliente.avisosDescubrimiento()
        } catch (_: Exception) {
            return false
        }
        val ahora = System.currentTimeMillis() / 1000.0
        val frescos = avisos.filter { ahora - it.en < 12 * 3600 }
        val porBackend = frescos.groupBy { it.backend }.mapValues { (_, lista) -> lista.maxBy { it.en } }
        for (backend in listOf("kaggle", "colab")) {
            val aviso = porBackend[backend] ?: continue
            try {
                cliente.saludEn(aviso.url, aviso.token)
                ajustes.elegir(backend)
                ajustes.guardarEn(backend, aviso.url, aviso.token, dev.jongamer.bastionalbor.logica.Descubrimiento.TOPIC)
                return true
            } catch (_: Exception) {
                continue
            }
        }
        return false
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
                    ajustesJson = """{"largo":700,"creatividad":0.8,"modelo":"7b"}""",
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
