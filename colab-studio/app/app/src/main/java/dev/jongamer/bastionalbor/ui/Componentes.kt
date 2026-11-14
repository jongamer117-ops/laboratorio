package dev.jongamer.bastionalbor.ui

import android.provider.Settings
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextFieldColors
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp

@Composable
fun recordarReducirMovimiento(): Boolean {
    val contexto = LocalContext.current
    val escala = Settings.Global.getFloat(
        contexto.contentResolver,
        Settings.Global.ANIMATOR_DURATION_SCALE,
        1f,
    )
    return escala == 0f
}

@Composable
fun brochaShimmer(reducir: Boolean): Brush {
    val base = MaterialTheme.colorScheme.surfaceContainerHigh
    val brillo = MaterialTheme.colorScheme.primary.copy(alpha = 0.35f)
    if (reducir) return Brush.linearGradient(listOf(base, base))
    val transicion = rememberInfiniteTransition(label = "shimmer")
    val x by transicion.animateFloat(
        initialValue = 0f,
        targetValue = 1200f,
        animationSpec = infiniteRepeatable(tween(1400, easing = LinearEasing)),
        label = "shimmer-x",
    )
    return Brush.linearGradient(
        colors = listOf(base, brillo, base),
        start = Offset(x - 500f, 0f),
        end = Offset(x, 700f),
    )
}

@Composable
fun MarcoOrnado(
    color: Color,
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit,
) {
    Box(
        modifier
            .drawBehind {
                val grosor = 1.5.dp.toPx()
                val inset = 7.dp.toPx()
                val esquina = 18.dp.toPx()
                drawRect(color.copy(alpha = 0.92f), style = Stroke(grosor))
                drawRect(
                    color.copy(alpha = 0.38f),
                    topLeft = Offset(inset, inset),
                    size = Size(size.width - inset * 2, size.height - inset * 2),
                    style = Stroke(1.dp.toPx()),
                )
                fun trazo(desde: Offset, hacia: Offset) {
                    drawLine(color, desde, hacia, strokeWidth = 2.4.dp.toPx(), cap = StrokeCap.Square)
                }
                trazo(Offset(0f, 0f), Offset(esquina, 0f))
                trazo(Offset(0f, 0f), Offset(0f, esquina))
                trazo(Offset(size.width, 0f), Offset(size.width - esquina, 0f))
                trazo(Offset(size.width, 0f), Offset(size.width, esquina))
                trazo(Offset(0f, size.height), Offset(esquina, size.height))
                trazo(Offset(0f, size.height), Offset(0f, size.height - esquina))
                trazo(Offset(size.width, size.height), Offset(size.width - esquina, size.height))
                trazo(Offset(size.width, size.height), Offset(size.width, size.height - esquina))
            }
            .padding(14.dp),
        content = content,
    )
}

@Composable
fun coloresCampo(): TextFieldColors = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = MaterialTheme.colorScheme.primary,
    unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
    cursorColor = MaterialTheme.colorScheme.primary,
    focusedLabelColor = MaterialTheme.colorScheme.primary,
    unfocusedLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
    focusedTextColor = MaterialTheme.colorScheme.onSurface,
    unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
    focusedContainerColor = MaterialTheme.colorScheme.surfaceContainerLow,
    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceContainerLow,
)

@Composable
fun Campo(
    valor: String,
    alCambiar: (String) -> Unit,
    etiqueta: String,
    modifier: Modifier = Modifier,
    minLineas: Int = 1,
    unaLinea: Boolean = false,
) {
    OutlinedTextField(
        value = valor,
        onValueChange = alCambiar,
        label = { Text(etiqueta) },
        modifier = modifier.fillMaxWidth(),
        minLines = if (unaLinea) 1 else minLineas,
        singleLine = unaLinea,
        textStyle = MaterialTheme.typography.bodyLarge,
        colors = coloresCampo(),
        shape = RoundedCornerShape(8.dp),
    )
}

@Composable
fun coloresSlider() = SliderDefaults.colors(
    thumbColor = MaterialTheme.colorScheme.primary,
    activeTrackColor = MaterialTheme.colorScheme.primary,
    inactiveTrackColor = MaterialTheme.colorScheme.surfaceVariant,
)

@Composable
fun ChipBastion(
    seleccionado: Boolean,
    onClick: () -> Unit,
    texto: String,
    modifier: Modifier = Modifier,
) {
    FilterChip(
        selected = seleccionado,
        onClick = onClick,
        label = { Text(texto) },
        modifier = modifier.heightIn(min = 48.dp),
        colors = FilterChipDefaults.filterChipColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh,
            labelColor = MaterialTheme.colorScheme.onSurface,
            selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
            selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer,
        ),
        border = FilterChipDefaults.filterChipBorder(
            enabled = true,
            selected = seleccionado,
            borderColor = MaterialTheme.colorScheme.outlineVariant,
            selectedBorderColor = MaterialTheme.colorScheme.primary,
        ),
    )
}

@Composable
fun BotonOro(
    texto: String,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.fillMaxWidth().heightIn(min = 52.dp),
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary,
            disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
            disabledContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
        ),
    ) {
        Text(texto, style = MaterialTheme.typography.labelLarge)
    }
}

@Composable
fun BannerAviso(texto: String, accion: String, onAccion: () -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.errorContainer, RoundedCornerShape(8.dp))
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        Text(texto, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onErrorContainer)
        TextButton(onClick = onAccion, modifier = Modifier.heightIn(min = 48.dp)) {
            Text(accion, style = MaterialTheme.typography.labelLarge)
        }
    }
}

@Composable
fun BarraAvance(avance: Float, indeterminado: Boolean, reducir: Boolean) {
    val animado by animateFloatAsState(
        targetValue = avance.coerceIn(0f, 1f),
        animationSpec = if (reducir) tween(0) else tween(400, easing = FastOutSlowInEasing),
        label = "avance",
    )
    if (indeterminado) {
        LinearProgressIndicator(
            modifier = Modifier.fillMaxWidth().heightIn(min = 4.dp).clip(RoundedCornerShape(99.dp)),
            color = MaterialTheme.colorScheme.primary,
            trackColor = MaterialTheme.colorScheme.surfaceVariant,
        )
    } else {
        LinearProgressIndicator(
            progress = { animado },
            modifier = Modifier.fillMaxWidth().heightIn(min = 4.dp).clip(RoundedCornerShape(99.dp)),
            color = MaterialTheme.colorScheme.primary,
            trackColor = MaterialTheme.colorScheme.surfaceVariant,
        )
    }
}

@Composable
fun Giro(
    frente: Boolean,
    reducir: Boolean,
    reverso: @Composable () -> Unit,
    cara: @Composable () -> Unit,
) {
    if (reducir) {
        if (frente) cara() else reverso()
        return
    }
    val rotacion by animateFloatAsState(
        targetValue = if (frente) 0f else 180f,
        animationSpec = tween(durationMillis = 700, easing = FastOutSlowInEasing),
        label = "giro",
    )
    val densidad = LocalDensity.current
    Box(
        Modifier.graphicsLayer {
            rotationY = rotacion
            cameraDistance = 16f * densidad.density
        },
    ) {
        if (rotacion <= 90f) {
            cara()
        } else {
            Box(Modifier.graphicsLayer { rotationY = 180f }) { reverso() }
        }
    }
}
