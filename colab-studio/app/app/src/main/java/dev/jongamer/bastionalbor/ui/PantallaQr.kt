package dev.jongamer.bastionalbor.ui

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.google.zxing.BinaryBitmap
import com.google.zxing.MultiFormatReader
import com.google.zxing.NotFoundException
import com.google.zxing.PlanarYUVLuminanceSource
import com.google.zxing.common.HybridBinarizer
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

@Composable
fun PantallaQr(onCerrar: () -> Unit, onTexto: (String) -> Unit) {
    val contexto = LocalContext.current
    var concedido by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(contexto, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED)
    }
    val pedir = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { concedido = it }
    androidx.compose.runtime.LaunchedEffect(Unit) {
        if (!concedido) pedir.launch(Manifest.permission.CAMERA)
    }
    Box(Modifier.fillMaxSize()) {
        if (concedido) {
            Visor(onTexto)
        } else {
            Text(
                "Se necesita la cámara para leer el QR del notebook.",
                modifier = Modifier.align(Alignment.Center).padding(24.dp),
                style = MaterialTheme.typography.bodyLarge,
            )
        }
        val oro = MaterialTheme.colorScheme.primary
        Canvas(Modifier.fillMaxSize()) {
            val lado = size.minDimension * 0.62f
            val izquierda = (size.width - lado) / 2f
            val arriba = (size.height - lado) / 2f
            drawRoundRect(
                color = oro,
                topLeft = Offset(izquierda, arriba),
                size = Size(lado, lado),
                cornerRadius = CornerRadius(12f, 12f),
                style = Stroke(width = 4.dp.toPx()),
            )
        }
        IconButton(onClick = onCerrar, modifier = Modifier.align(Alignment.TopStart).padding(8.dp).size(48.dp)) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver", tint = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable
private fun Visor(onTexto: (String) -> Unit) {
    val contexto = LocalContext.current
    val ciclo = LocalLifecycleOwner.current
    val entregado = remember { AtomicBoolean(false) }
    val ejecutor = remember { Executors.newSingleThreadExecutor() }
    DisposableEffect(Unit) { onDispose { ejecutor.shutdown() } }
    AndroidView(
        factory = { ctx ->
            val previewView = PreviewView(ctx)
            val futuro = ProcessCameraProvider.getInstance(ctx)
            val principal = ContextCompat.getMainExecutor(ctx)
            futuro.addListener({
                val proveedor = futuro.get()
                val preview = Preview.Builder().build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
                val analisis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                val lector = MultiFormatReader()
                analisis.setAnalyzer(ejecutor) { imagen ->
                    if (!entregado.get()) {
                        val texto = decodificar(imagen, lector)
                        if (texto != null && entregado.compareAndSet(false, true)) principal.execute { onTexto(texto) }
                    }
                    imagen.close()
                }
                proveedor.unbindAll()
                proveedor.bindToLifecycle(ciclo, CameraSelector.DEFAULT_BACK_CAMERA, preview, analisis)
            }, ContextCompat.getMainExecutor(ctx))
            previewView
        },
        modifier = Modifier.fillMaxSize(),
    )
}

private fun decodificar(imagen: ImageProxy, lector: MultiFormatReader): String? {
    return try {
        val (bytes, ancho, alto) = luminancia(imagen)
        val fuente = PlanarYUVLuminanceSource(bytes, ancho, alto, 0, 0, ancho, alto, false)
        val resultado = lector.decodeWithState(BinaryBitmap(HybridBinarizer(fuente)))
        lector.reset()
        resultado.text
    } catch (_: NotFoundException) {
        lector.reset()
        null
    } catch (_: Exception) {
        lector.reset()
        null
    }
}

private fun luminancia(imagen: ImageProxy): Triple<ByteArray, Int, Int> {
    val plano = imagen.planes[0]
    val buffer = plano.buffer
    val ancho = imagen.width
    val alto = imagen.height
    val rowStride = plano.rowStride
    val pixelStride = plano.pixelStride
    val recto = ByteArray(ancho * alto)
    var destino = 0
    for (fila in 0 until alto) {
        val inicio = fila * rowStride
        for (col in 0 until ancho) {
            val indice = inicio + col * pixelStride
            recto[destino++] = if (indice < buffer.limit()) buffer.get(indice) else 0
        }
    }
    val grados = imagen.imageInfo.rotationDegrees
    return rotar(recto, ancho, alto, grados)
}

private fun rotar(origen: ByteArray, ancho: Int, alto: Int, grados: Int): Triple<ByteArray, Int, Int> {
    val g = ((grados % 360) + 360) % 360
    if (g == 0) return Triple(origen, ancho, alto)
    val salida = ByteArray(origen.size)
    when (g) {
        90 -> {
            for (y in 0 until alto) {
                for (x in 0 until ancho) {
                    salida[x * alto + (alto - 1 - y)] = origen[y * ancho + x]
                }
            }
            return Triple(salida, alto, ancho)
        }
        180 -> {
            for (i in origen.indices) salida[origen.size - 1 - i] = origen[i]
            return Triple(salida, ancho, alto)
        }
        else -> {
            for (y in 0 until alto) {
                for (x in 0 until ancho) {
                    salida[(ancho - 1 - x) * alto + y] = origen[y * ancho + x]
                }
            }
            return Triple(salida, alto, ancho)
        }
    }
}
