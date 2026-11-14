package dev.jongamer.bastionalbor.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.Save
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import dev.jongamer.bastionalbor.logica.nombreModeloTexto
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PantallaHistorias(
    vm: HistoriasViewModel,
    conectado: Boolean,
    reducir: Boolean,
    snack: SnackbarHostState,
    modelos: List<String>,
    onAjustes: () -> Unit,
) {
    LaunchedEffect(modelos) {
        if (modelos.isNotEmpty() && vm.modelo !in modelos) vm.modelo = modelos.first()
    }
    val contexto = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val alcance = rememberCoroutineScope()
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            "Escribe su historia",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.semantics { heading() },
        )
        Text(
            "Solo modelos sin censura. El relato se guarda solo en Documentos.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (!conectado) {
            BannerAviso(
                texto = "Esperando al notebook… Ábrelo en Colab o Kaggle y deja la celda corriendo.",
                accion = "Ver ajustes",
                onAccion = onAjustes,
            )
        }
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("Historia larga", style = MaterialTheme.typography.titleMedium)
            Switch(checked = vm.larga, onCheckedChange = { vm.larga = it })
        }
        if (vm.larga) {
            MarcoOrnado(color = MaterialTheme.colorScheme.primary) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Campo(vm.proyecto, vm::alCambiarProyecto, "Nombre del proyecto", minLineas = 1)
                    Campo(vm.biblia, { vm.biblia = it }, "Biblia", minLineas = 6)
                    Campo(vm.esquema, { vm.esquema = it }, "Esquema", minLineas = 4)
                }
            }
            Text("Capítulo ${vm.siguiente}", style = MaterialTheme.typography.titleSmall)
            Text("Capítulos seguidos ${vm.cantidadNovela}", style = MaterialTheme.typography.titleSmall)
            Slider(
                value = vm.cantidadNovela.toFloat(),
                onValueChange = { vm.cantidadNovela = it.toInt().coerceIn(1, 10) },
                valueRange = 1f..10f,
                steps = 8,
                colors = coloresSlider(),
            )
        } else {
            MarcoOrnado(color = MaterialTheme.colorScheme.primary) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Campo(vm.sistema, { vm.sistema = it }, "Voz del cronista", minLineas = 4)
                    Campo(vm.pedido, { vm.pedido = it }, "Qué quieres que cuente", minLineas = 4)
                }
            }
        }
        Text("Modelo", style = MaterialTheme.typography.titleSmall)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            modelos.forEach { id ->
                ChipBastion(vm.modelo == id, { vm.modelo = id }, nombreModeloTexto(id))
            }
        }
        Text(
            when (vm.modelo) {
                "32b" -> "Por defecto en Kaggle. Pide dos T4 y unos 65 GB de disco."
                "14b" -> "Cabe en una T4. En Kaggle úsalo si el 32B no entra."
                else -> "Por defecto en Colab. Cabe holgado en una T4."
            },
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (!vm.larga) {
            Text(etiquetaLargo(vm.largo), style = MaterialTheme.typography.titleSmall)
            Slider(value = vm.largo, onValueChange = { vm.largo = it }, valueRange = 200f..1000f, colors = coloresSlider())
            Text("Creatividad ${"%.1f".format(vm.creatividad)}", style = MaterialTheme.typography.titleSmall)
            Slider(value = vm.creatividad, onValueChange = { vm.creatividad = it }, valueRange = 0.2f..1.2f, colors = coloresSlider())
        }
        BotonOro(
            texto = when {
                vm.generando -> "Escribiendo…"
                vm.larga -> "Continuar"
                else -> "Escribir"
            },
            enabled = !vm.generando && (if (vm.larga) vm.proyecto.isNotBlank() else vm.pedido.isNotBlank()),
            onClick = {
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                if (vm.larga) vm.continuar() else vm.escribir()
            },
        )
        when {
            vm.error != null && !vm.generando -> MarcoOrnado(color = MaterialTheme.colorScheme.error) {
                Text(vm.error ?: "", style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.error)
            }
            vm.generando -> MarcoOrnado(color = MaterialTheme.colorScheme.primary) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Spacer(
                        Modifier
                            .fillMaxWidth()
                            .height(96.dp)
                            .background(brochaShimmer(reducir), MaterialTheme.shapes.small),
                    )
                    BarraAvance(vm.avance, vm.avance < 0.15f, reducir)
                    Text(vm.mensaje.ifBlank { "El cronista está pensando…" }, style = MaterialTheme.typography.bodyMedium)
                }
            }
            vm.resultado != null -> {
                val relato = vm.resultado!!
                MarcoOrnado(color = colorMarcoRelato()) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(relato.texto, style = MaterialTheme.typography.bodyLarge)
                        Text(
                            "Guardado en Documentos/BastionAlbor",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Row {
                            TextButton(
                                onClick = {
                                    copiarTexto(contexto, relato.texto)
                                    alcance.launch { snack.showSnackbar("Copiado") }
                                },
                                modifier = Modifier.heightIn(min = 48.dp),
                            ) {
                                Icon(Icons.Outlined.ContentCopy, contentDescription = null)
                                Text("Copiar", modifier = Modifier.padding(start = 8.dp))
                            }
                            TextButton(
                                onClick = { compartirTexto(contexto, relato.texto, relato.uri) },
                                modifier = Modifier.heightIn(min = 48.dp),
                            ) {
                                Icon(Icons.Outlined.Share, contentDescription = null)
                                Text("Compartir", modifier = Modifier.padding(start = 8.dp))
                            }
                            TextButton(
                                onClick = { alcance.launch { snack.showSnackbar("Ya está en Documentos/BastionAlbor") } },
                                modifier = Modifier.heightIn(min = 48.dp),
                            ) {
                                Icon(Icons.Outlined.Save, contentDescription = null)
                                Text("Guardar", modifier = Modifier.padding(start = 8.dp))
                            }
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
    }
}

@Composable
private fun colorMarcoRelato() = MaterialTheme.colorScheme.primary

private fun etiquetaLargo(valor: Float): String = when {
    valor < 400f -> "Extensión corta"
    valor < 750f -> "Extensión media"
    else -> "Extensión larga"
}
