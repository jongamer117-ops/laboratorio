package dev.jongamer.bastionalbor

import android.app.Application
import dev.jongamer.bastionalbor.datos.Repositorio

class BastionAplicacion : Application() {
    lateinit var repositorio: Repositorio
        private set

    override fun onCreate() {
        super.onCreate()
        repositorio = Repositorio(this)
    }
}
