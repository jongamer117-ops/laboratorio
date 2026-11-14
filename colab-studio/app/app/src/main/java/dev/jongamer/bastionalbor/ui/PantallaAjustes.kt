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
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
        Text(
            estadoConexion(vm),
            style = MaterialTheme.typography.bodyLarge,
            color = if (vm.enLinea == true) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (vm.mensaje.isNotBlank() && !vm.mensaje.startsWith("Conectado")) {
            Text(vm.mensaje, style = MaterialTheme.typography.bodyMedium)
        }
        Text("Estilo del retrato", style = MaterialTheme.typography.titleSmall)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ChipBastion(vm.modeloImagen != "flux", { vm.fijarModeloImagen("ilustrious") }, "Anime")
            ChipBastion(vm.modeloImagen == "flux", { vm.fijarModeloImagen("flux") }, "Realista")
        }
        Text(
            "Relatos: ${vm.modelosTexto.joinToString(" y ") { nombreModeloTexto(it) }}.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text("Modelo del relato", style = MaterialTheme.typography.titleSmall)
        Text(
            "Se elige en Historias. El servidor conectado decide cuáles caben.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        var avanzado by remember { mutableStateOf(false) }
        TextButton(onClick = { avanzado = !avanzado }, modifier = Modifier.heightIn(min = 48.dp)) {
            Text(if (avanzado) "Ocultar avanzado" else "Avanzado")
        }
        if (avanzado) {
            Text(
                "La app encuentra el notebook sola. Esto solo hace falta si ese canal no responde.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                Text("Usar conexión manual", modifier = Modifier.weight(1f))
                Switch(checked = vm.manual, onCheckedChange = vm::fijarManual)
            }
            Campo(vm.url, { vm.url = it }, "URL del túnel", unaLinea = true)
            Campo(vm.token, { vm.token = it }, "Token", unaLinea = true)
            BotonOro("Escanear QR", true, onEscanear)
            TextButton(onClick = vm::guardarYProbar, enabled = !vm.ocupado, modifier = Modifier.heightIn(min = 48.dp)) {
                Text(if (vm.ocupado) "Probando…" else "Guardar y probar")
            }
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
            "Deja abierta la pestaña del notebook: si se duerme, el túnel deja de servir. La app lo vuelve a encontrar sola. Las imágenes van a Fotos/BastionAlbor y los relatos a Documentos/BastionAlbor. Para instalar una versión nueva, permite orígenes desconocidos.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(12.dp))
    }
}

private fun estadoConexion(vm: AjustesViewModel): String = when {
    vm.manual && vm.guardada.url.isBlank() -> "Conexión manual, sin datos"
    vm.enLinea == true && vm.servidor == "kaggle" -> "Conectado a Kaggle"
    vm.enLinea == true -> "Conectado a Colab"
    else -> "Esperando al notebook…"
}
