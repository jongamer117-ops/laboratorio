package dev.jongamer.bastionalbor.logica

import android.util.Base64
import org.json.JSONObject
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * Mismo canal y la misma llave que bastion_server.py.
 * El aviso va cifrado para que ntfy no muestre el token en claro.
 */
object Descubrimiento {
    const val TOPIC = "bastion-albor-c7e1a94f6b2d4803e5a8c1f07d3b69e24a51f0c8"
    const val KEY_B64 = "RTMuKJDbQrFucahtdaTVNo+7w+kS6UrYahOb6tzIs78="
    private val AAD = "bastion-albor".toByteArray(Charsets.UTF_8)

    fun descifrar(mensaje: String): JSONObject {
        val crudo = Base64.decode(mensaje.trim(), Base64.DEFAULT)
        require(crudo.size > 12) { "Aviso incompleto" }
        val iv = crudo.copyOfRange(0, 12)
        val cifrado = crudo.copyOfRange(12, crudo.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(
            Cipher.DECRYPT_MODE,
            SecretKeySpec(Base64.decode(KEY_B64, Base64.DEFAULT), "AES"),
            GCMParameterSpec(128, iv),
        )
        cipher.updateAAD(AAD)
        val claro = cipher.doFinal(cifrado)
        return JSONObject(String(claro, Charsets.UTF_8))
    }
}
