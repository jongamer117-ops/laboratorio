package dev.jongamer.bastionalbor.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Save
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import kotlinx.coroutines.launch
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import dev.jongamer.bastionalbor.tema.colorMarco

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PantallaImagen(
    vm: ImagenViewModel,
    conectado: Boolean,
    reducir: Boolean,
    snack: SnackbarHostState,
    modelo: String,
) {
    val contexto = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val scroll = rememberScrollState()
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(scroll)
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            "Forja un retrato",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.semantics { heading() },
        )
        Text(
            "Se guarda solo en Fotos. El fondo se quita en el servidor.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (!conectado) {
            Text(
                "Esperando al notebook… Ábrelo en Colab o Kaggle y deja la celda corriendo.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.primary,
            )
        }
        Campo(vm.prompt, { vm.prompt = it }, "Prompt", minLineas = 4)
        Text("Pasos ${vm.pasos.toInt()}", style = MaterialTheme.typography.titleSmall)
        Slider(value = vm.pasos, onValueChange = { vm.pasos = it }, valueRange = 10f..40f, steps = 29, colors = coloresSlider())
        Text("Guía ${"%.1f".format(vm.guia)}", style = MaterialTheme.typography.titleSmall)
        Slider(value = vm.guia, onValueChange = { vm.guia = it }, valueRange = 1f..12f, colors = coloresSlider())
        Text("Cantidad", style = MaterialTheme.typography.titleSmall)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            (1..4).forEach { n ->
                ChipBastion(
                    seleccionado = vm.cantidad == n,
                    onClick = { vm.cantidad = n },
                    texto = n.toString(),
                )
            }
        }
        Text(
            "En la T4 se pintan de una en una. Tres o cuatro tardan un buen rato.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Campo(
            vm.semillaTexto,
            { vm.semillaTexto = it.filter { c -> c.isDigit() }.take(10) },
            "Semilla (vacío = aleatoria)",
            unaLinea = true,
        )
        BotonOro(
            texto = if (vm.generando) "Forjando…" else "Generar",
            enabled = !vm.generando && vm.prompt.isNotBlank(),
            onClick = {
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                vm.generar(modelo)
            },
        )
        when {
            vm.error != null && !vm.generando -> MarcoOrnado(color = MaterialTheme.colorScheme.error) {
                Text(vm.error ?: "", style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.error)
            }
            vm.generando || vm.imagenes.isNotEmpty() -> ResultadoImagen(vm, reducir, snack, contexto)
        }
        Spacer(Modifier.height(12.dp))
    }
}

@Composable
private fun ResultadoImagen(
    vm: ImagenViewModel,
    reducir: Boolean,
    snack: SnackbarHostState,
    contexto: android.content.Context,
) {
    val yaHabia = remember { vm.imagenes.isNotEmpty() }
    var frente by remember { mutableStateOf(yaHabia) }
    LaunchedEffect(vm.imagenes, vm.generando) {
        frente = vm.imagenes.isNotEmpty() && !vm.generando
    }
    MarcoOrnado(color = colorMarco(vm.marco)) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Giro(
                frente = frente,
                reducir = reducir,
                reverso = {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Spacer(
                            Modifier
                                .fillMaxWidth()
                                .aspectRatio(3f / 4f)
                                .clip(RoundedCornerShape(4.dp))
                                .background(brochaShimmer(reducir)),
                        )
                        BarraAvance(vm.avance, vm.avance < 0.08f, reducir)
                        Text(vm.mensaje.ifBlank { "Trabajando en Colab…" }, style = MaterialTheme.typography.bodyMedium)
                    }
                },
                cara = {
                    if (vm.imagenes.isNotEmpty()) {
                        val pager = rememberPagerState(pageCount = { vm.imagenes.size })
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        HorizontalPager(state = pager) { pagina ->
                            val imagen = vm.imagenes[pagina]
                            val bitmap = imagen.bitmap
                            if (bitmap != null) {
                                Image(
                                    bitmap = bitmap.asImageBitmap(),
                                    contentDescription = "Retrato generado",
                                    modifier = Modifier.fillMaxWidth().aspectRatio(3f / 4f).clip(RoundedCornerShape(4.dp)),
                                    contentScale = ContentScale.Fit,
                                )
                            }
                        }
                        val actual = vm.imagenes.getOrNull(pager.currentPage)
                        val alcance = rememberCoroutineScope()
                        Text(
                            "Semilla ${actual?.semilla ?: "—"} · ${vm.mensaje}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Row {
                            TextButton(
                                onClick = {
                                    val uri = actual?.uri
                                    if (uri == null || uri == android.net.Uri.EMPTY) {
                                        alcance.launch { snack.showSnackbar("Nada que compartir todavía.") }
                                    } else {
                                        compartirImagen(contexto, uri)
                                    }
                                },
                                modifier = Modifier.heightIn(min = 48.dp),
                            ) {
                                Icon(Icons.Outlined.Share, contentDescription = null)
                                Text("Compartir", modifier = Modifier.padding(start = 8.dp))
                            }
                            TextButton(
                                onClick = {
                                    alcance.launch { snack.showSnackbar("Ya está en Fotos/BastionAlbor") }
                                },
                                modifier = Modifier.heightIn(min = 48.dp),
                            ) {
                                Icon(Icons.Outlined.Save, contentDescription = null)
                                Text("Guardar", modifier = Modifier.padding(start = 8.dp))
                            }
                        }
                        }
                    }
                },
            )
        }
    }
}
