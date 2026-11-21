package dev.jongamer.bastionalbor

import android.graphics.Color
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import dev.jongamer.bastionalbor.tema.BastionTema
import dev.jongamer.bastionalbor.ui.AppBastion
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
        )
        val repo = (application as BastionAplicacion).repositorio
        val demo = if (BuildConfig.DEBUG) intent?.getStringExtra("demo") else null
        if (demo.isNullOrBlank()) {
            mostrar(repo)
        } else {
            var listo = false
            splash.setKeepOnScreenCondition { !listo }
            lifecycleScope.launch {
                repo.prepararDemo(demo)
                listo = true
                mostrar(repo)
            }
        }
    }

    private fun mostrar(repo: dev.jongamer.bastionalbor.datos.Repositorio) {
        setContent {
            BastionTema {
                AppBastion(repo)
            }
        }
    }
}
