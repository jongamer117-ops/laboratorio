package dev.jongamer.bastionalbor.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import dev.jongamer.bastionalbor.BuildConfig
import dev.jongamer.bastionalbor.logica.nombreModeloTexto

@Composable
fun PantallaAjustes(
    vm: AjustesViewModel,
    reducir: Boolean,
    onEscanear: () -> Unit,
) {
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Ajustes", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.semantics { heading() })
        Text("Servidor", style = MaterialTheme.typography.titleSmall)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ChipBastion(vm.servidor != "kaggle", { vm.elegirServidor("colab") }, "Colab")
            ChipBastion(vm.servidor == "kaggle", { vm.elegirServidor("kaggle") }, "Kaggle")
        }
        Text(
            "Imagen: Illustrious y Flux. Relatos: ${vm.modelosTexto.joinToString(" y ") { nombreModeloTexto(it) }}.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            estadoConexion(vm),
            style = MaterialTheme.typography.bodyMedium,
            color = if (vm.enLinea == true) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
        )
        MarcoOrnado(color = MaterialTheme.colorScheme.primary) {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Campo(vm.url, { vm.url = it }, "URL del túnel", unaLinea = true)
                Campo(vm.token, { vm.token = it }, "Token", unaLinea = true)
                Campo(vm.tema, { vm.tema = it }, "Tema ntfy", unaLinea = true)
                Text(
                    "El tema es un secreto: quien lo conozca puede leer el token.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        BotonOro("Escanear QR", true, onEscanear)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            TextButton(onClick = vm::descubrir, enabled = !vm.ocupado, modifier = Modifier.heightIn(min = 48.dp)) {
                Text("Buscar en ntfy")
            }
            TextButton(onClick = vm::guardarYProbar, enabled = !vm.ocupado, modifier = Modifier.heightIn(min = 48.dp)) {
                Text(if (vm.ocupado) "Probando…" else "Probar conexión")
            }
        }
        if (vm.mensaje.isNotBlank()) {
            Text(vm.mensaje, style = MaterialTheme.typography.bodyMedium)
        }
        Text("Actualización", style = MaterialTheme.typography.titleLarge)
        Text(
            "Versión ${BuildConfig.VERSION_NAME}. Busca el último Release de jongamer117-ops/laboratorio.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (vm.bajando) {
            BarraAvance(vm.avanceBaja, false, reducir)
        }
        BotonOro(
            texto = when {
                vm.bajando -> "Descargando…"
                vm.aviso != null -> "Descargar e instalar"
                vm.buscando -> "Buscando…"
                else -> "Buscar actualización"
            },
            enabled = !vm.buscando && !vm.bajando,
            onClick = {
                if (vm.aviso != null) vm.descargarEInstalar() else vm.buscarActualizacion()
            },
        )
        if (vm.mensajeUpdate.isNotBlank()) {
            Text(vm.mensajeUpdate, style = MaterialTheme.typography.bodyMedium)
        }
        Text("Para que funcione", style = MaterialTheme.typography.titleLarge)
        Text(
            "Deja abierta la pestaña de Colab: si se duerme, la URL deja de servir. Cada ejecución del notebook crea un túnel nuevo. Las imágenes van a Fotos/BastionAlbor y los relatos a Documentos/BastionAlbor. Para instalar una versión nueva, permite orígenes desconocidos.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(12.dp))
    }
}

private fun estadoConexion(vm: AjustesViewModel): String {
    val nombre = if (vm.servidor == "kaggle") "Kaggle" else "Colab"
    val estado = when {
        vm.guardada.url.isBlank() -> "sin servidor"
        vm.enLinea == true -> "en línea"
        vm.enLinea == false -> "apagado"
        else -> "guardado, sin probar"
    }
    return "$nombre · $estado"
}
