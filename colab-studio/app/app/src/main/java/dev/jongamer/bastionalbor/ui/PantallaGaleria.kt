package dev.jongamer.bastionalbor.ui

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import dev.jongamer.bastionalbor.R
import dev.jongamer.bastionalbor.datos.Generacion
import dev.jongamer.bastionalbor.logica.formatoFecha
import dev.jongamer.bastionalbor.tema.colorMarco
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PantallaGaleria(
    vm: GaleriaViewModel,
    snack: SnackbarHostState,
    onIrAImagen: () -> Unit,
    onIrAHistorias: () -> Unit,
) {
    val contexto = LocalContext.current
    val alcance = rememberCoroutineScope()
    val piezas by vm.piezas.collectAsState()
    var pestana by remember { mutableIntStateOf(0) }
    var abierta by remember { mutableStateOf<Generacion?>(null) }
    var condenar by remember { mutableStateOf<Generacion?>(null) }
    val imagenes = piezas.filter { it.tipo == "imagen" }
    val relatos = piezas.filter { it.tipo == "relato" }

    Column(Modifier.fillMaxSize().padding(horizontal = 20.dp, vertical = 8.dp)) {
        Text("Galería", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.semantics { heading() })
        Text(
            "Lo que ya vive en el celular.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp, bottom = 12.dp),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 12.dp)) {
            Pestana("Imágenes", pestana == 0) { pestana = 0 }
            Pestana("Relatos", pestana == 1) { pestana = 1 }
        }
        Box(Modifier.weight(1f).fillMaxWidth()) {
            if (pestana == 0 && imagenes.isEmpty()) {
                Vacio("Todavía no hay retratos", "Cuando generes uno, aparece aquí y en Fotos/BastionAlbor.", "Forjar un retrato", onIrAImagen)
            } else if (pestana == 1 && relatos.isEmpty()) {
                Vacio("Todavía no hay relatos", "Los textos se guardan en Documentos/BastionAlbor.", "Escribir una historia", onIrAHistorias)
            } else if (pestana == 0) {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(148.dp),
                    contentPadding = PaddingValues(bottom = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(imagenes, key = { it.id }) { item ->
                        MarcoOrnado(color = colorMarco(item.marco), modifier = Modifier.clickable { abierta = item }) {
                            AsyncImage(
                                model = Uri.parse(item.uri),
                                contentDescription = item.prompt,
                                modifier = Modifier.fillMaxWidth().aspectRatio(3f / 4f).clip(RoundedCornerShape(2.dp)),
                                contentScale = ContentScale.Crop,
                            )
                        }
                    }
                }
            } else {
                LazyColumn(contentPadding = PaddingValues(bottom = 24.dp)) {
                    items(relatos, key = { it.id }) { item ->
                        Column(Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                            Text(item.prompt, style = MaterialTheme.typography.titleMedium, maxLines = 2)
                            Text(
                                formatoFecha(item.creadoEn),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            Row {
                                IconButton(onClick = {
                                    val texto = leer(contexto, item.uri) ?: item.prompt
                                    copiarTexto(contexto, texto)
                                    alcance.launch { snack.showSnackbar("Copiado") }
                                }) { Icon(Icons.Outlined.ContentCopy, contentDescription = "Copiar") }
                                IconButton(onClick = {
                                    compartirTexto(contexto, leer(contexto, item.uri) ?: item.prompt, Uri.parse(item.uri))
                                }) { Icon(Icons.Outlined.Share, contentDescription = "Compartir") }
                                IconButton(onClick = {
                                    vm.rehacer(item)
                                    onIrAHistorias()
                                }) { Icon(Icons.Outlined.Refresh, contentDescription = "Volver a escribir") }
                                IconButton(onClick = { condenar = item }) {
                                    Icon(Icons.Outlined.Delete, contentDescription = "Borrar")
                                }
                            }
                            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                        }
                    }
                }
            }
        }
    }

    val ficha = abierta
    if (ficha != null) {
        ModalBottomSheet(onDismissRequest = { abierta = null }, containerColor = MaterialTheme.colorScheme.surfaceContainer) {
            Column(Modifier.padding(horizontal = 20.dp).padding(bottom = 28.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                AsyncImage(
                    model = Uri.parse(ficha.uri),
                    contentDescription = ficha.prompt,
                    modifier = Modifier.fillMaxWidth().aspectRatio(3f / 4f),
                    contentScale = ContentScale.Fit,
                )
                Text(ficha.prompt, style = MaterialTheme.typography.bodyMedium)
                Text(
                    "Semilla ${ficha.semilla ?: "—"} · ${formatoFecha(ficha.creadoEn)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Row {
                    TextButton(onClick = { compartirImagen(contexto, Uri.parse(ficha.uri)) }, modifier = Modifier.heightIn(min = 48.dp)) {
                        Text("Compartir")
                    }
                    TextButton(
                        onClick = {
                            vm.rehacer(ficha)
                            abierta = null
                            onIrAImagen()
                        },
                        modifier = Modifier.heightIn(min = 48.dp),
                    ) { Text("Otra vez") }
                    TextButton(onClick = { condenar = ficha }, modifier = Modifier.heightIn(min = 48.dp)) { Text("Borrar") }
                }
            }
        }
    }
    val condenado = condenar
    if (condenado != null) {
        AlertDialog(
            onDismissRequest = { condenar = null },
            title = { Text(if (condenado.tipo == "imagen") "¿Borrar este retrato?" else "¿Borrar este relato?") },
            text = { Text("Se quita del celular y de esta galería.") },
            confirmButton = {
                TextButton(onClick = {
                    vm.borrar(condenado)
                    condenar = null
                    abierta = null
                }) { Text("Borrar") }
            },
            dismissButton = { TextButton(onClick = { condenar = null }) { Text("Cancelar") } },
        )
    }
}

@Composable
private fun Pestana(texto: String, activa: Boolean, onClick: () -> Unit) {
    TextButton(
        onClick = onClick,
        modifier = Modifier
            .heightIn(min = 48.dp)
            .background(
                if (activa) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainerHigh,
                RoundedCornerShape(8.dp),
            ),
    ) {
        Text(texto, color = if (activa) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface)
    }
}

@Composable
private fun Vacio(titulo: String, detalle: String, accion: String, onAccion: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(top = 36.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Icon(
            painter = painterResource(R.drawable.ic_marca),
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(72.dp),
        )
        Text(titulo, style = MaterialTheme.typography.headlineSmall)
        Text(detalle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        BotonOro(accion, true, onAccion)
    }
}

private fun leer(contexto: android.content.Context, uri: String): String? = try {
    contexto.contentResolver.openInputStream(Uri.parse(uri))?.use { it.readBytes().toString(Charsets.UTF_8) }
} catch (_: Exception) {
    null
}
