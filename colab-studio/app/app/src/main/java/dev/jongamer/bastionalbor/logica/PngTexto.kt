package dev.jongamer.bastionalbor.logica

import java.io.ByteArrayOutputStream
import java.util.zip.CRC32

/** Inserta metadatos UTF-8 en un PNG (chunk iTXt) sin recomprimir la imagen. */
object PngTexto {
    private val FIRMA = byteArrayOf(137.toByte(), 80, 78, 71, 13, 10, 26, 10)

    fun insertar(png: ByteArray, campos: Map<String, String>): ByteArray {
        require(png.size >= 8 && png.copyOfRange(0, 8).contentEquals(FIRMA)) { "No es un PNG." }
        val out = ByteArrayOutputStream()
        out.write(FIRMA)
        var i = 8
        while (i + 12 <= png.size) {
            val len = leerInt(png, i)
            require(len >= 0 && i + 12 + len <= png.size) { "PNG truncado." }
            val tipo = String(png, i + 4, 4, Charsets.US_ASCII)
            if (tipo == "IEND") {
                for ((clave, valor) in campos) {
                    if (clave.isNotBlank()) out.write(chunkITxt(clave, valor))
                }
            }
            out.write(png, i, 12 + len)
            i += 12 + len
            if (tipo == "IEND") break
        }
        return out.toByteArray()
    }

    fun leer(png: ByteArray): Map<String, String> {
        if (png.size < 8 || !png.copyOfRange(0, 8).contentEquals(FIRMA)) return emptyMap()
        val campos = linkedMapOf<String, String>()
        var i = 8
        while (i + 12 <= png.size) {
            val len = leerInt(png, i)
            if (len < 0 || i + 12 + len > png.size) break
            val tipo = String(png, i + 4, 4, Charsets.US_ASCII)
            if (tipo == "iTXt") {
                val data = png.copyOfRange(i + 8, i + 8 + len)
                val par = parsearITxt(data)
                if (par != null) campos[par.first] = par.second
            }
            i += 12 + len
            if (tipo == "IEND") break
        }
        return campos
    }

    private fun parsearITxt(data: ByteArray): Pair<String, String>? {
        val cero = data.indexOf(0)
        if (cero <= 0 || cero + 4 >= data.size) return null
        val clave = String(data, 0, cero, Charsets.ISO_8859_1)
        var p = cero + 1
        val comprimido = data[p].toInt() != 0
        p += 2
        if (comprimido || p >= data.size) return null
        val langFin = data.indexOfFrom(0, p)
        if (langFin < 0) return null
        val tradFin = data.indexOfFrom(0, langFin + 1)
        if (tradFin < 0) return null
        val texto = String(data, tradFin + 1, data.size - tradFin - 1, Charsets.UTF_8)
        return clave to texto
    }

    private fun chunkITxt(clave: String, texto: String): ByteArray {
        val data = ByteArrayOutputStream()
        data.write(clave.toByteArray(Charsets.ISO_8859_1))
        data.write(0)
        data.write(0)
        data.write(0)
        data.write(0)
        data.write(0)
        data.write(texto.toByteArray(Charsets.UTF_8))
        return chunk("iTXt", data.toByteArray())
    }

    private fun chunk(tipo: String, data: ByteArray): ByteArray {
        val out = ByteArrayOutputStream()
        escribirInt(out, data.size)
        val tipoBytes = tipo.toByteArray(Charsets.US_ASCII)
        out.write(tipoBytes)
        out.write(data)
        val crc = CRC32()
        crc.update(tipoBytes)
        crc.update(data)
        escribirInt(out, crc.value.toInt())
        return out.toByteArray()
    }

    private fun escribirInt(out: ByteArrayOutputStream, valor: Int) {
        out.write((valor ushr 24) and 0xFF)
        out.write((valor ushr 16) and 0xFF)
        out.write((valor ushr 8) and 0xFF)
        out.write(valor and 0xFF)
    }

    private fun leerInt(png: ByteArray, i: Int): Int =
        ((png[i].toInt() and 0xFF) shl 24) or
            ((png[i + 1].toInt() and 0xFF) shl 16) or
            ((png[i + 2].toInt() and 0xFF) shl 8) or
            (png[i + 3].toInt() and 0xFF)

    private fun ByteArray.indexOfFrom(byte: Byte, desde: Int): Int {
        for (i in desde until size) if (this[i] == byte) return i
        return -1
    }
}
