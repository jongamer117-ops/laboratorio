package dev.jongamer.bastionalbor.ui

import androidx.activity.ComponentActivity
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.Collections
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.AutoStories
import androidx.compose.material.icons.outlined.Collections
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.width
import androidx.compose.ui.Alignment
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.jongamer.bastionalbor.R
import dev.jongamer.bastionalbor.datos.Repositorio

private data class Destino(
    val ruta: String,
    val etiqueta: String,
    val lleno: ImageVector,
    val contorno: ImageVector,
)

private val destinos = listOf(
    Destino("imagen", "Generar imagen", Icons.Filled.Image, Icons.Outlined.Image),
    Destino("historias", "Historias", Icons.Filled.AutoStories, Icons.Outlined.AutoStories),
    Destino("galeria", "Galería", Icons.Filled.Collections, Icons.Outlined.Collections),
    Destino("ajustes", "Ajustes", Icons.Filled.Settings, Icons.Outlined.Settings),
)

@Composable
fun AppBastion(repo: Repositorio) {
    val actividad = LocalContext.current as ComponentActivity
    val ajustes: AjustesViewModel = viewModel(viewModelStoreOwner = actividad, factory = AjustesViewModel.fabrica(repo))
    val nav = rememberNavController()
    val snack = remember { SnackbarHostState() }
    val reducir = recordarReducirMovimiento()
    val entrada = nav.currentBackStackEntryAsState()
    val ruta = entrada.value?.destination?.route ?: "imagen"
    val teclado = WindowInsets.ime.getBottom(LocalDensity.current) > 0
    val rail = LocalConfiguration.current.screenWidthDp >= 600
    val colores = NavigationBarItemDefaults.colors(
        selectedIconColor = MaterialTheme.colorScheme.onPrimary,
        selectedTextColor = MaterialTheme.colorScheme.primary,
        indicatorColor = MaterialTheme.colorScheme.primary,
        unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
        unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
    )

    fun ir(destino: String) {
        nav.navigate(destino) {
            popUpTo(nav.graph.findStartDestination().id) { saveState = true }
            launchSingleTop = true
            restoreState = true
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        snackbarHost = { SnackbarHost(snack) },
        topBar = {
            if (ruta != "qr") {
                Row(
                    Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        painter = painterResource(R.drawable.ic_marca),
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        "Bastión de Albor",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(start = 10.dp).weight(1f, fill = false).semantics { heading() },
                    )
                    Text(
                        when {
                            ajustes.guardada.url.isBlank() -> "Sin servidor"
                            ajustes.enLinea == true -> "En línea"
                            ajustes.enLinea == false -> "Apagado"
                            else -> "Guardado"
                        },
                        style = MaterialTheme.typography.labelMedium,
                        color = if (ajustes.enLinea == true) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(start = 12.dp),
                    )
                }
            }
        },
        bottomBar = {
            if (!rail && ruta != "qr" && !teclado) {
                NavigationBar(containerColor = MaterialTheme.colorScheme.surfaceContainer) {
                    destinos.forEach { destino ->
                        val seleccionado = ruta == destino.ruta
                        NavigationBarItem(
                            selected = seleccionado,
                            onClick = { ir(destino.ruta) },
                            icon = { Icon(if (seleccionado) destino.lleno else destino.contorno, contentDescription = destino.etiqueta) },
                            label = {
                                Text(destino.etiqueta, textAlign = TextAlign.Center, maxLines = 2, style = MaterialTheme.typography.labelMedium)
                            },
                            colors = colores,
                        )
                    }
                }
            }
        },
    ) { padding ->
        Row(Modifier.fillMaxSize().padding(padding)) {
            if (rail && ruta != "qr") {
                NavigationRail(containerColor = MaterialTheme.colorScheme.surfaceContainer, modifier = Modifier.width(88.dp)) {
                    destinos.forEach { destino ->
                        val seleccionado = ruta == destino.ruta
                        NavigationRailItem(
                            selected = seleccionado,
                            onClick = { ir(destino.ruta) },
                            icon = { Icon(if (seleccionado) destino.lleno else destino.contorno, contentDescription = destino.etiqueta) },
                            label = { Text(destino.etiqueta, maxLines = 2, textAlign = TextAlign.Center) },
                        )
                    }
                }
            }
            Box(Modifier.weight(1f)) {
                NavHost(
                    navController = nav,
                    startDestination = "imagen",
                    enterTransition = { if (reducir) EnterTransition.None else fadeIn(tween(180)) },
                    exitTransition = { if (reducir) ExitTransition.None else fadeOut(tween(140)) },
                ) {
                    composable("imagen") {
                        val vm: ImagenViewModel = viewModel(factory = ImagenViewModel.fabrica(repo))
                        PantallaImagen(vm, ajustes.guardada.url.isNotBlank(), reducir, snack) { ir("ajustes") }
                    }
                    composable("historias") {
                        val vm: HistoriasViewModel = viewModel(factory = HistoriasViewModel.fabrica(repo))
                        PantallaHistorias(vm, ajustes.guardada.url.isNotBlank(), reducir, snack) { ir("ajustes") }
                    }
                    composable("galeria") {
                        val vm: GaleriaViewModel = viewModel(factory = GaleriaViewModel.fabrica(repo))
                        PantallaGaleria(vm, snack, { ir("imagen") }, { ir("historias") })
                    }
                    composable("ajustes") {
                        PantallaAjustes(ajustes, reducir) { nav.navigate("qr") }
                    }
                    composable("qr") {
                        PantallaQr(
                            onCerrar = { nav.popBackStack() },
                            onTexto = { texto ->
                                if (ajustes.aplicarQr(texto)) nav.popBackStack()
                            },
                        )
                    }
                }
            }
        }
    }
}
