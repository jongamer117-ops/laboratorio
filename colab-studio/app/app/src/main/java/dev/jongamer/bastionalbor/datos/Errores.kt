package dev.jongamer.bastionalbor.datos

import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.net.ssl.SSLException

sealed class ErrorEstudio(message: String) : Exception(message) {
    class SinConexion : ErrorEstudio(
        "Falta la conexión. Escanea el QR del notebook o pega la URL y el token.",
    )

    class Apagado : ErrorEstudio(
        "La sesión de Colab está apagada o el túnel caducó. Abre el notebook, ejecútalo otra vez y vuelve a conectar.",
    )

    class Token : ErrorEstudio("El token no coincide. Escanéalo de nuevo desde el notebook.")
    class Bloqueado(mensaje: String) : ErrorEstudio(mensaje)
    class Servidor(mensaje: String) : ErrorEstudio(mensaje)
}

fun textoAmigable(error: Throwable): String = when (error) {
    is ErrorEstudio -> error.message ?: "Algo falló."
    is SocketTimeoutException, is UnknownHostException, is ConnectException, is SSLException ->
        ErrorEstudio.Apagado().message!!
    else -> {
        val msg = error.message.orEmpty()
        if (msg.contains("failed to connect", true) || msg.contains("timeout", true) || msg.contains("unreachable", true)) {
            ErrorEstudio.Apagado().message!!
        } else {
            msg.ifBlank { "No se pudo completar." }
        }
    }
}
