package dev.jongamer.bastionalbor.datos

import android.content.Context
import android.util.Base64
import org.json.JSONObject

object PlantillaKernel {
    fun armar(context: Context, modo: String, pedido: JSONObject?, idle: Int): String {
        val plantilla = context.assets.open("kaggle/lanzador.py").bufferedReader().readText()
        val servidor = context.assets.open("kaggle/bastion_server.py").readBytes()
        val pedidoB64 = if (pedido == null) {
            ""
        } else {
            Base64.encodeToString(pedido.toString().toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
        }
        return plantilla
            .replace("__MODO__", modo)
            .replace("__IDLE__", idle.coerceIn(5, 120).toString())
            .replace("__PEDIDO_B64__", pedidoB64)
            .replace("__SERVIDOR_B64__", Base64.encodeToString(servidor, Base64.NO_WRAP))
    }
}
