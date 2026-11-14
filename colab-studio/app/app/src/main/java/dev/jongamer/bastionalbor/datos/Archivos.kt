package dev.jongamer.bastionalbor.datos

import android.content.ContentUris
import android.content.ContentValues
import android.net.Uri
import android.provider.MediaStore

data class Medio(val uri: Uri, val nombre: String, val fechaMs: Long)

class Archivos(private val resolver: android.content.ContentResolver) {
    fun guardarPng(bytes: ByteArray, nombre: String): Uri {
        val valores = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, nombre)
            put(MediaStore.Images.Media.MIME_TYPE, "image/png")
            put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/BastionAlbor")
            put(MediaStore.Images.Media.IS_PENDING, 1)
        }
        val coleccion = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        val uri = resolver.insert(coleccion, valores) ?: error("No se pudo crear la imagen en Fotos.")
        try {
            resolver.openOutputStream(uri)?.use { it.write(bytes) } ?: error("No se pudo escribir la imagen.")
            valores.clear()
            valores.put(MediaStore.Images.Media.IS_PENDING, 0)
            resolver.update(uri, valores, null, null)
        } catch (error: Exception) {
            resolver.delete(uri, null, null)
            throw error
        }
        return uri
    }

    fun guardarTexto(texto: String, nombre: String): Uri {
        val coleccion = MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        val valores = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, nombre)
            put(MediaStore.MediaColumns.MIME_TYPE, "text/markdown")
            put(MediaStore.MediaColumns.RELATIVE_PATH, "Documents/BastionAlbor")
            put(MediaStore.MediaColumns.IS_PENDING, 1)
        }
        var uri = resolver.insert(coleccion, valores)
        if (uri == null) {
            valores.put(MediaStore.MediaColumns.MIME_TYPE, "text/plain")
            uri = resolver.insert(coleccion, valores)
        }
        val destino = uri ?: error("No se pudo crear el relato en Documentos.")
        try {
            resolver.openOutputStream(destino)?.use { it.write(texto.toByteArray(Charsets.UTF_8)) }
                ?: error("No se pudo escribir el relato.")
            valores.clear()
            valores.put(MediaStore.MediaColumns.IS_PENDING, 0)
            resolver.update(destino, valores, null, null)
        } catch (error: Exception) {
            resolver.delete(destino, null, null)
            throw error
        }
        return destino
    }

    fun borrar(uri: Uri) {
        resolver.delete(uri, null, null)
    }

    fun existe(uri: Uri): Boolean = try {
        resolver.openFileDescriptor(uri, "r")?.use { true } ?: false
    } catch (_: Exception) {
        false
    }

    fun leerTexto(uri: Uri): String? = try {
        resolver.openInputStream(uri)?.use { it.readBytes().toString(Charsets.UTF_8) }
    } catch (_: Exception) {
        null
    }

    fun leerBytes(uri: Uri): ByteArray? = try {
        resolver.openInputStream(uri)?.use { it.readBytes() }
    } catch (_: Exception) {
        null
    }

    fun listarImagenes(): List<Medio> = listar(
        MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY),
        "${MediaStore.Images.Media.RELATIVE_PATH} LIKE ?",
        arrayOf("Pictures/BastionAlbor%"),
    )

    fun listarTextos(): List<Medio> = listar(
        MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY),
        "${MediaStore.MediaColumns.RELATIVE_PATH} LIKE ? AND ${MediaStore.MediaColumns.MIME_TYPE} IN (?, ?)",
        arrayOf("Documents/BastionAlbor%", "text/markdown", "text/plain"),
    )

    private fun listar(coleccion: Uri, seleccion: String, args: Array<String>): List<Medio> {
        val salida = mutableListOf<Medio>()
        resolver.query(
            coleccion,
            arrayOf(MediaStore.MediaColumns._ID, MediaStore.MediaColumns.DISPLAY_NAME, MediaStore.MediaColumns.DATE_ADDED),
            seleccion,
            args,
            "${MediaStore.MediaColumns.DATE_ADDED} DESC",
        )?.use { cursor ->
            val idCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
            val nombreCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME)
            val fechaCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_ADDED)
            while (cursor.moveToNext()) {
                val id = cursor.getLong(idCol)
                salida += Medio(
                    uri = ContentUris.withAppendedId(coleccion, id),
                    nombre = cursor.getString(nombreCol) ?: "archivo",
                    fechaMs = cursor.getLong(fechaCol) * 1000L,
                )
            }
        }
        return salida
    }
}
