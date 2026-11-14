package dev.jongamer.bastionalbor.logica

import java.text.Normalizer
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

const val PRESET_AIGIS =
    "masterpiece, best quality, full art, medieval fantasy, anime, standing character, ornate armor, detailed face, full body, black background, simple background"

const val NEGATIVO_BASE = "lowres, bad anatomy, bad hands, extra digits, blurry, watermark, text, signature"

const val NEGATIVO_FORZADO = "child, loli, shota, young, underage"

const val SISTEMA_DEFAULT =
    "Eres el cronista de Bastión de Albor, un juego de defensa de torres de fantasía medieval. " +
        "Escribes en español de México, con frases claras y vívidas. Retratas héroes, bastiones y asedios. " +
        "No escribas contenido sexual ni romántico con menores de edad."

private val TERMINOS_IMAGEN = listOf(
    "child", "children", "loli", "lolita", "shota", "shotacon", "young", "underage", "underaged",
    "preteen", "toddler", "kid", "kids", "nino", "nina", "ninos", "ninas", "infantil", "menores",
    "menordeedad",
)

private val MENORES_RELATO = listOf(
    "child", "children", "loli", "lolita", "shota", "shotacon", "underage", "underaged",
    "preteen", "toddler", "kid", "kids", "nino", "nina", "ninos", "ninas", "infantil", "menores",
    "menordeedad",
)

private val SEXUAL_RELATO = listOf(
    "nsfw", "porn", "porno", "sex", "sexual", "sexo", "erotico", "erotica", "desnudo", "desnuda",
    "nude", "hentai", "penetracion", "rape", "violacion", "incest", "incesto",
)

data class DatosQr(val url: String, val token: String, val tema: String?)

fun plegar(texto: String): String {
    val sin = texto.lowercase().replace("\u200b", "").replace("\ufeff", "")
    val normal = Normalizer.normalize(sin, Normalizer.Form.NFD).replace(Regex("\\p{Mn}+"), "")
    return normal
        .replace('0', 'o')
        .replace('1', 'i')
        .replace('3', 'e')
        .replace('4', 'a')
        .replace('5', 's')
        .replace('7', 't')
}

fun terminoImagenBloqueado(prompt: String): String? = contiene(prompt, TERMINOS_IMAGEN)

fun relatoBloqueado(sistema: String, pedido: String): Boolean {
    val texto = "$sistema\n$pedido"
    return contiene(texto, MENORES_RELATO) != null && contiene(texto, SEXUAL_RELATO) != null
}

private fun contiene(texto: String, terminos: List<String>): String? {
    val plegado = plegar(texto)
    val palabras = Regex("[a-z]+").findAll(plegado).map { it.value }.toSet()
    val compacto = palabras.joinToString("")
    return terminos.firstOrNull { it in palabras || it in compacto }
}

fun negativoForzado(negativo: String): String {
    val base = negativo.trim().trim(',')
    return if (base.isEmpty()) NEGATIVO_FORZADO else "$base, $NEGATIVO_FORZADO"
}

fun quitarForzado(negativo: String?): String {
    if (negativo.isNullOrBlank()) return NEGATIVO_BASE
    val limpio = negativo.removeSuffix(", $NEGATIVO_FORZADO").removeSuffix(NEGATIVO_FORZADO).trim().trim(',')
    return limpio.ifBlank { NEGATIVO_BASE }
}

fun parsearQr(raw: String): DatosQr? {
    val texto = raw.trim()
    if (texto.startsWith("{")) {
        val u = extraerJson(texto, "u") ?: extraerJson(texto, "url")
        val t = extraerJson(texto, "t") ?: extraerJson(texto, "token")
        val n = extraerJson(texto, "n") ?: extraerJson(texto, "topic") ?: extraerJson(texto, "tema")
        if (!u.isNullOrBlank() && !t.isNullOrBlank()) return DatosQr(u, t, n)
    }
    if (texto.startsWith("bastion://")) {
        val consulta = texto.substringAfter("?", "")
        val mapa = consulta.split("&").mapNotNull { par ->
            val trozos = par.split("=", limit = 2)
            if (trozos.size == 2) {
                java.net.URLDecoder.decode(trozos[0], "UTF-8") to java.net.URLDecoder.decode(trozos[1], "UTF-8")
            } else {
                null
            }
        }.toMap()
        val u = mapa["url"] ?: mapa["u"]
        val t = mapa["token"] ?: mapa["t"]
        if (!u.isNullOrBlank() && !t.isNullOrBlank()) return DatosQr(u, t, mapa["tema"] ?: mapa["n"])
    }
    val lineas = texto.lines().map { it.trim() }.filter { it.isNotEmpty() }
    if (lineas.size >= 2 && lineas[0].startsWith("http")) {
        return DatosQr(lineas[0], lineas[1], lineas.getOrNull(2))
    }
    return null
}

private fun extraerJson(texto: String, clave: String): String? {
    val regex = Regex(""""$clave"\s*:\s*"([^"]*)"""")
    return regex.find(texto)?.groupValues?.getOrNull(1)?.let { unescape(it) }
}

private fun unescape(valor: String): String = valor
    .replace("\\/", "/")
    .replace("\\\"", "\"")
    .replace("\\\\", "\\")

fun esMasNueva(remota: String, local: String): Boolean {
    fun partes(v: String) = v.trim().removePrefix("v").removePrefix("V")
        .substringBefore("-")
        .split(".")
        .map { it.toIntOrNull() ?: 0 }
    val a = partes(remota)
    val b = partes(local)
    val n = maxOf(a.size, b.size)
    for (i in 0 until n) {
        val x = a.getOrElse(i) { 0 }
        val y = b.getOrElse(i) { 0 }
        if (x != y) return x > y
    }
    return false
}

fun formatoFecha(ms: Long): String {
    val fmt = DateTimeFormatter.ofPattern("d MMM yyyy, HH:mm", Locale.forLanguageTag("es-MX"))
    return Instant.ofEpochMilli(ms).atZone(ZoneId.systemDefault()).format(fmt)
}

fun nombreArchivo(prefijo: String, extension: String, ahora: Long = System.currentTimeMillis()): String {
    val fmt = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss", Locale.US)
    val sello = Instant.ofEpochMilli(ahora).atZone(ZoneId.systemDefault()).format(fmt)
    return "$prefijo-$sello.$extension"
}

fun relatoMarkdown(sistema: String, pedido: String, texto: String, modelo: String, ahora: Long = System.currentTimeMillis()): String =
    buildString {
        appendLine("# Bastión de Albor")
        appendLine()
        appendLine("Fecha: ${formatoFecha(ahora)}")
        appendLine("Modelo: $modelo")
        appendLine()
        appendLine("Sistema:")
        appendLine(sistema)
        appendLine()
        appendLine("Pedido:")
        appendLine(pedido)
        appendLine()
        appendLine("---")
        appendLine()
        appendLine(texto)
    }

fun extraerPedido(markdown: String): String {
    val marca = "Pedido:\n"
    val i = markdown.indexOf(marca)
    if (i < 0) {
        return markdown.lineSequence().firstOrNull { it.isNotBlank() && !it.startsWith("#") }.orEmpty()
    }
    val resto = markdown.substring(i + marca.length)
    val fin = resto.indexOf("\n---")
    return (if (fin >= 0) resto.substring(0, fin) else resto).trim()
}
