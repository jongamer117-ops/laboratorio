package dev.jongamer.bastionalbor.ui

import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import dev.jongamer.bastionalbor.datos.AvisoVersion
import dev.jongamer.bastionalbor.datos.ErrorEstudio
import dev.jongamer.bastionalbor.datos.Conexion
import dev.jongamer.bastionalbor.datos.Generacion
import dev.jongamer.bastionalbor.datos.ImagenGuardada
import dev.jongamer.bastionalbor.datos.RelatoGuardado
import dev.jongamer.bastionalbor.datos.Repositorio
import dev.jongamer.bastionalbor.datos.textoAmigable
import dev.jongamer.bastionalbor.logica.NEGATIVO_BASE
import dev.jongamer.bastionalbor.logica.PRESET_AIGIS
import dev.jongamer.bastionalbor.logica.SISTEMA_DEFAULT
import dev.jongamer.bastionalbor.logica.modelosTextoDe
import dev.jongamer.bastionalbor.logica.parsearQr
import dev.jongamer.bastionalbor.logica.quitarForzado
import org.json.JSONArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class AjustesViewModel(private val repo: Repositorio) : ViewModel() {
    var guardada by mutableStateOfSafe(Conexion())
    var servidor by mutableStateOfSafe("colab")
    var manual by mutableStateOfSafe(false)
    var modeloImagen by mutableStateOfSafe("ilustrious")
    var modelosImagen by mutableStateOfSafe(listOf("ilustrious", "flux"))
    var modelosTexto by mutableStateOfSafe(listOf("7b", "14b"))
    var url by mutableStateOfSafe("")
    var token by mutableStateOfSafe("")
    var tema by mutableStateOfSafe("")
    var enLinea by mutableStateOfSafe<Boolean?>(null)
    var mensaje by mutableStateOfSafe("")
    var ocupado by mutableStateOfSafe(false)
    var aviso by mutableStateOfSafe<AvisoVersion?>(null)
    var buscando by mutableStateOfSafe(false)
    var bajando by mutableStateOfSafe(false)
    var avanceBaja by mutableStateOfSafe(0f)
    var mensajeUpdate by mutableStateOfSafe("")
    private var sincronizado = false

    init {
        viewModelScope.launch {
            repo.ajustes.preferencias.collect { prefs ->
                guardada = prefs.activa
                if (!sincronizado) {
                    servidor = prefs.servidor
                    manual = prefs.manual
                    modeloImagen = prefs.modeloImagen
                    url = prefs.activa.url
                    token = prefs.activa.token
                    tema = prefs.activa.tema
                    aplicarModelosEstaticos()
                    sincronizado = true
                }
            }
        }
        vigilar()
    }

    private fun vigilar() {
        viewModelScope.launch {
            var espera = 2_000L
            while (true) {
                if (!manual) {
                    val ok = runCatching { repo.conectarSiHaceFalta() }.getOrDefault(false)
                    if (ok && repo.ajustes.actual().url.isNotBlank()) {
                        enLinea = true
                        val prefs = repo.ajustes.leer()
                        servidor = prefs.servidor
                        guardada = prefs.activa
                        if (mensaje.isBlank() || mensaje.startsWith("Esperando")) {
                            mensaje = if (prefs.servidor == "kaggle") "Conectado a Kaggle" else "Conectado a Colab"
                        }
                        aplicarModelosEstaticos()
                        espera = 15_000L
                    } else {
                        enLinea = false
                        mensaje = "Esperando al notebook…"
                        kotlinx.coroutines.delay(espera)
                        espera = (espera * 2).coerceAtMost(20_000L)
                        continue
                    }
                }
                kotlinx.coroutines.delay(espera)
            }
        }
    }

    fun fijarManual(activo: Boolean) {
        manual = activo
        viewModelScope.launch { repo.ajustes.fijarManual(activo) }
    }

    fun fijarModeloImagen(modelo: String) {
        modeloImagen = if (modelo == "flux") "flux" else "ilustrious"
        viewModelScope.launch { repo.ajustes.fijarModeloImagen(modeloImagen) }
    }

    fun guardarYProbar() {
        viewModelScope.launch {
            ocupado = true
            mensaje = "Probando…"
            repo.ajustes.guardar(url, token, tema)
            try {
                val salud = repo.cliente.salud()
                enLinea = true
                aplicarSalud(salud)
            } catch (error: Exception) {
                enLinea = false
                mensaje = textoAmigable(error)
            } finally {
                ocupado = false
            }
        }
    }

    fun descubrir() {
        viewModelScope.launch {
            if (tema.isBlank()) {
                mensaje = "Escribe el tema ntfy que imprimió el notebook."
                return@launch
            }
            ocupado = true
            mensaje = "Buscando el servidor…"
            try {
                val hallado = repo.cliente.descubrir(tema.trim())
                if (hallado == null) {
                    mensaje = "ntfy no tiene un aviso reciente. Ejecuta el notebook y espera el QR."
                } else {
                    url = hallado.url
                    token = hallado.token
                    if (hallado.tema.isNotBlank()) tema = hallado.tema
                    repo.ajustes.guardar(url, token, tema)
                    enLinea = null
                    mensaje = "Encontré el servidor. Prueba la conexión."
                }
            } catch (error: Exception) {
                mensaje = "No pude leer ntfy. Revisa el tema o la red."
            } finally {
                ocupado = false
            }
        }
    }

    fun elegirServidor(nuevo: String) {
        val destino = if (nuevo == "kaggle") "kaggle" else "colab"
        if (destino == servidor) return
        viewModelScope.launch {
            repo.ajustes.guardarEn(servidor, url, token, tema)
            repo.ajustes.elegir(destino)
            val prefs = repo.ajustes.leer()
            servidor = prefs.servidor
            val perfil = prefs.activa
            url = perfil.url
            token = perfil.token
            tema = perfil.tema
            enLinea = null
            mensaje = ""
            aplicarModelosEstaticos()
        }
    }

    private fun aplicarModelosEstaticos() {
        modelosImagen = listOf("ilustrious", "flux")
        modelosTexto = modelosTextoDe(servidor)
    }

    private fun aplicarSalud(salud: org.json.JSONObject) {
        val textos = salud.optJSONArray("modelos_texto")
        val imagenes = salud.optJSONArray("modelos_imagen")
        if (textos != null && textos.length() > 0) modelosTexto = textos.aLista()
        if (imagenes != null && imagenes.length() > 0) modelosImagen = imagenes.aLista()
        val gpu = salud.optString("gpu")
        val gpus = salud.optInt("gpus")
        val backend = salud.optString("backend", servidor)
        val nombre = if (backend == "kaggle") "Kaggle" else "Colab"
        mensaje = buildString {
            append(nombre)
            append(" · En línea")
            if (gpu.isNotBlank() && gpu != "null") append(" · ").append(gpu)
            if (gpus > 0) append(" · ").append(gpus).append(" GPU")
        }
    }

    fun aplicarQr(raw: String): Boolean {
        val datos = parsearQr(raw) ?: return false
        url = datos.url
        token = datos.token
        if (!datos.tema.isNullOrBlank()) tema = datos.tema
        viewModelScope.launch { repo.ajustes.guardar(url, token, tema) }
        enLinea = null
        mensaje = "QR leído. Prueba la conexión."
        return true
    }

    fun buscarActualizacion() {
        viewModelScope.launch {
            buscando = true
            try {
                aviso = repo.actualizador.buscar()
                mensajeUpdate = if (aviso == null) "Estás en la última versión." else "Hay una versión ${aviso?.etiqueta}."
            } catch (error: Exception) {
                mensajeUpdate = textoAmigable(error)
            } finally {
                buscando = false
            }
        }
    }

    fun descargarEInstalar() {
        val actual = aviso ?: return
        viewModelScope.launch {
            if (!repo.actualizador.puedeInstalar()) {
                mensajeUpdate = "Permite instalar apps de Bastión de Albor y vuelve a tocar Descargar."
                repo.actualizador.abrirAjustesInstalacion()
                return@launch
            }
            bajando = true
            avanceBaja = 0f
            try {
                val archivo = repo.actualizador.descargar(actual.urlApk) { avance ->
                    withContext(Dispatchers.Main) { avanceBaja = avance }
                }
                bajando = false
                repo.actualizador.instalar(archivo)
            } catch (error: Exception) {
                bajando = false
                mensajeUpdate = textoAmigable(error)
            }
        }
    }

    companion object {
        fun fabrica(repo: Repositorio): ViewModelProvider.Factory = viewModelFactory {
            initializer { AjustesViewModel(repo) }
        }
    }
}

class ImagenViewModel(private val repo: Repositorio) : ViewModel() {
    var prompt by mutableStateOfSafe(PRESET_AIGIS)
    var negativo by mutableStateOfSafe(NEGATIVO_BASE)
    var ancho by mutableStateOfSafe(832)
    var alto by mutableStateOfSafe(1216)
    var cantidad by mutableStateOfSafe(1)
    var semillaTexto by mutableStateOfSafe("")
    var pasos by mutableStateOfSafe(28f)
    var guia by mutableStateOfSafe(4.5f)
    private var perfilModelo by mutableStateOfSafe<String?>(null)
    var marco by mutableStateOfSafe("oro")
    var modeloImagen by mutableStateOfSafe("ilustrious")
    var generando by mutableStateOfSafe(false)
    var avance by mutableStateOfSafe(0f)
    var mensaje by mutableStateOfSafe("")
    var error by mutableStateOfSafe<String?>(null)
    var imagenes by mutableStateOfSafe<List<ImagenGuardada>>(emptyList())

    init {
        when (repo.demoModo) {
            "cargando" -> {
                generando = true
                avance = 0.42f
                mensaje = "Imagen 1 de 1 · paso 12 de 28"
            }
            "error" -> error = "La sesión de Colab está apagada o el túnel caducó. Abre el notebook, ejecútalo otra vez y vuelve a conectar."
            "resultado" -> {
                val bitmap = repo.demoBitmap
                if (bitmap != null) {
                    imagenes = listOf(ImagenGuardada(bitmap, android.net.Uri.EMPTY, 1, "vista-previa.png"))
                    mensaje = "Vista previa local. En el celular real, esto llega desde Colab y se guarda solo."
                }
            }
        }
        viewModelScope.launch {
            repo.rehacerImagen.collect { item ->
                if (item != null) {
                    aplicar(item)
                    repo.rehacerImagen.value = null
                }
            }
        }
    }

    fun sincronizarModelo(modelo: String) {
        if (perfilModelo == modelo) return
        perfilModelo = modelo
        modeloImagen = modelo
        val (pasosPerfil, guiaPerfil) = dev.jongamer.bastionalbor.logica.perfilImagen(modelo)
        pasos = pasosPerfil
        guia = guiaPerfil
    }

    fun generar(modelo: String) {
        if (generando) return
        viewModelScope.launch {
            val listo = runCatching { repo.conectarSiHaceFalta() }.getOrDefault(false)
            if (!listo) {
                error = textoAmigable(ErrorEstudio.SinConexion())
                return@launch
            }
            generando = true
            error = null
            imagenes = emptyList()
            avance = 0.02f
            mensaje = "Enviando el trabajo…"
            try {
                val semilla = semillaTexto.trim().toLongOrNull()
                imagenes = repo.generarImagen(
                    prompt = prompt,
                    negativo = negativo,
                    ancho = 832,
                    alto = 1216,
                    cantidad = cantidad,
                    semilla = semilla,
                    pasos = pasos.toInt(),
                    guia = guia,
                    marco = "oro",
                    modelo = modelo,
                ) { valor, texto ->
                    withContext(Dispatchers.Main) {
                        avance = valor
                        if (texto.isNotBlank()) mensaje = texto
                    }
                }
                mensaje = "Guardada en Fotos/BastionAlbor"
            } catch (fallo: Exception) {
                error = textoAmigable(fallo)
            } finally {
                generando = false
            }
        }
    }

    fun rehacer(item: Generacion) {
        aplicar(item)
    }

    private fun aplicar(item: Generacion) {
        prompt = item.prompt
        negativo = quitarForzado(item.negativo)
        if (item.marco.isNotBlank()) marco = item.marco
        semillaTexto = item.semilla?.toString().orEmpty()
        runCatching {
            val json = JSONObject(item.ajustesJson)
            ancho = json.optInt("ancho", ancho)
            alto = json.optInt("alto", alto)
            pasos = json.optInt("pasos", pasos.toInt()).toFloat()
            guia = json.optDouble("guia", guia.toDouble()).toFloat()
            cantidad = json.optInt("cantidad", cantidad)
        }
    }

    companion object {
        fun fabrica(repo: Repositorio): ViewModelProvider.Factory = viewModelFactory {
            initializer { ImagenViewModel(repo) }
        }
    }
}

class HistoriasViewModel(private val repo: Repositorio) : ViewModel() {
    var sistema by mutableStateOfSafe(SISTEMA_DEFAULT)
    var pedido by mutableStateOfSafe("")
    var largo by mutableStateOfSafe(700f)
    var creatividad by mutableStateOfSafe(0.9f)
    var modelo by mutableStateOfSafe("7b")
    var generando by mutableStateOfSafe(false)
    var avance by mutableStateOfSafe(0f)
    var mensaje by mutableStateOfSafe("")
    var error by mutableStateOfSafe<String?>(null)
    var resultado by mutableStateOfSafe<RelatoGuardado?>(null)
    var larga by mutableStateOfSafe(false)
    var proyecto by mutableStateOfSafe("asedio")
    var biblia by mutableStateOfSafe("")
    var esquema by mutableStateOfSafe("")
    var siguiente by mutableStateOfSafe(1)
    var cantidadNovela by mutableStateOfSafe(1)
    private var resumenes by mutableStateOfSafe<List<Pair<Int, String>>>(emptyList())
    private var cola by mutableStateOfSafe("")

    init {
        repo.cargarNovelaLocal(proyecto)?.let { aplicarNovela(it) }
        if (repo.demoModo == "cargando") {
            generando = true
            mensaje = "Escribiendo…"
            avance = 0.35f
            pedido = "El primer asedio del bastión."
        }
        viewModelScope.launch {
            repo.rehacerRelato.collect { item ->
                if (item != null) {
                    pedido = item.prompt
                    if (!item.sistema.isNullOrBlank()) sistema = item.sistema
                    runCatching {
                        val json = JSONObject(item.ajustesJson)
                        largo = json.optInt("largo", 700).toFloat()
                        creatividad = json.optDouble("creatividad", 0.8).toFloat()
                        modelo = json.optString("modelo", "7b")
                    }
                    repo.rehacerRelato.value = null
                }
            }
        }
    }

    fun escribir() {
        if (generando) return
        viewModelScope.launch {
            val listo = runCatching { repo.conectarSiHaceFalta() }.getOrDefault(false)
            if (!listo) {
                error = textoAmigable(ErrorEstudio.SinConexion())
                return@launch
            }
            generando = true
            error = null
            resultado = null
            avance = 0.05f
            mensaje = "Enviando el trabajo…"
            try {
                resultado = repo.generarRelato(
                    sistema = sistema,
                    pedido = pedido,
                    largo = largo.toInt(),
                    creatividad = creatividad,
                    modelo = modelo,
                ) { valor, texto ->
                    withContext(Dispatchers.Main) {
                        avance = valor
                        if (texto.isNotBlank()) mensaje = texto
                    }
                }
                mensaje = "Guardado en Documentos/BastionAlbor"
            } catch (fallo: Exception) {
                error = textoAmigable(fallo)
            } finally {
                generando = false
            }
        }
    }

    fun alCambiarProyecto(nombre: String) {
        proyecto = nombre
        if (biblia.isBlank() && esquema.isBlank()) {
            repo.cargarNovelaLocal(nombre)?.let { aplicarNovela(it) }
        }
    }

    fun continuar() {
        if (generando) return
        viewModelScope.launch {
            val listo = runCatching { repo.conectarSiHaceFalta() }.getOrDefault(false)
            if (!listo) {
                error = textoAmigable(ErrorEstudio.SinConexion())
                return@launch
            }
            generando = true
            error = null
            resultado = null
            avance = 0.05f
            mensaje = "Capítulo $siguiente…"
            try {
                val hecha = repo.continuarNovela(
                    proyecto = proyecto,
                    biblia = biblia,
                    esquema = esquema,
                    resumenes = resumenes,
                    cola = cola,
                    siguiente = siguiente,
                    cantidad = cantidadNovela,
                    modelo = modelo,
                    creatividad = creatividad,
                ) { valor, texto ->
                    withContext(Dispatchers.Main) {
                        avance = valor
                        if (texto.isNotBlank()) mensaje = texto
                    }
                }
                aplicarNovela(hecha)
                val ultimo = hecha.capitulos.lastOrNull()
                if (ultimo != null) {
                    resultado = RelatoGuardado(
                        texto = ultimo.texto,
                        uri = android.net.Uri.parse(ultimo.uri),
                        nombre = ultimo.nombre,
                        modelo = modelo,
                    )
                }
                mensaje = "Capítulo ${siguiente - 1} guardado en Documentos/BastionAlbor/${hecha.proyecto}"
            } catch (fallo: Exception) {
                error = textoAmigable(fallo)
            } finally {
                generando = false
            }
        }
    }

    private fun aplicarNovela(hecha: dev.jongamer.bastionalbor.datos.NovelaHecha) {
        if (hecha.biblia.isNotBlank()) biblia = hecha.biblia
        if (hecha.esquema.isNotBlank()) esquema = hecha.esquema
        resumenes = hecha.resumenes
        cola = hecha.cola
        if (hecha.siguiente > 0) siguiente = hecha.siguiente
    }

    companion object {
        fun fabrica(repo: Repositorio): ViewModelProvider.Factory = viewModelFactory {
            initializer { HistoriasViewModel(repo) }
        }
    }
}

class GaleriaViewModel(private val repo: Repositorio) : ViewModel() {
    val piezas = repo.generaciones.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
    var mensaje by mutableStateOfSafe<String?>(null)

    init {
        viewModelScope.launch { repo.reconciliar() }
    }

    fun borrar(item: Generacion) {
        viewModelScope.launch {
            repo.borrar(item)
            mensaje = "Borrado del celular."
        }
    }

    fun rehacer(item: Generacion) {
        if (item.tipo == "imagen") repo.rehacerImagen.value = item else repo.rehacerRelato.value = item
    }

    companion object {
        fun fabrica(repo: Repositorio): ViewModelProvider.Factory = viewModelFactory {
            initializer { GaleriaViewModel(repo) }
        }
    }
}

private fun <T> mutableStateOfSafe(valor: T) = androidx.compose.runtime.mutableStateOf(valor)

private fun JSONArray.aLista(): List<String> = List(length()) { getString(it) }
