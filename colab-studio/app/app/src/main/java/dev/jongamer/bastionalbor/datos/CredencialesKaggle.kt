package dev.jongamer.bastionalbor.datos

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

data class CredencialKaggle(val usuario: String, val llave: String)

class CredencialesKaggle(context: Context) {
    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "kaggle_credenciales",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    fun leer(): CredencialKaggle? {
        val usuario = prefs.getString("username", "").orEmpty()
        val llave = prefs.getString("key", "").orEmpty()
        if (usuario.isBlank() || llave.isBlank()) return null
        return CredencialKaggle(usuario, llave)
    }

    fun guardar(usuario: String, llave: String) {
        prefs.edit().putString("username", usuario.trim()).putString("key", llave.trim()).apply()
    }
}
