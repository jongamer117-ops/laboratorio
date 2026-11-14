@file:OptIn(androidx.compose.ui.text.ExperimentalTextApi::class)

package dev.jongamer.bastionalbor.tema

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dev.jongamer.bastionalbor.R

private val Negro = Color(0xFF0E0C0A)
private val Superficie = Color(0xFF17130F)
private val SuperficieAlta = Color(0xFF241E18)
private val SuperficieMas = Color(0xFF31281F)
private val Oro = Color(0xFFD4B06A)
private val OroClaro = Color(0xFFF3E2B8)
private val Tinta = Color(0xFFF6F0E6)
private val TintaSuave = Color(0xFFDDD0BC)
private val Carmesi = Color(0xFFB33A3A)

private val Cinzel = FontFamily(
    Font(R.font.cinzel, FontWeight.Normal, variationSettings = FontVariation.Settings(FontVariation.weight(400))),
    Font(R.font.cinzel, FontWeight.Medium, variationSettings = FontVariation.Settings(FontVariation.weight(500))),
    Font(R.font.cinzel, FontWeight.SemiBold, variationSettings = FontVariation.Settings(FontVariation.weight(600))),
    Font(R.font.cinzel, FontWeight.Bold, variationSettings = FontVariation.Settings(FontVariation.weight(700))),
)

private val SourceSans = FontFamily(
    Font(R.font.source_sans_3, FontWeight.Normal, variationSettings = FontVariation.Settings(FontVariation.weight(400))),
    Font(R.font.source_sans_3, FontWeight.Medium, variationSettings = FontVariation.Settings(FontVariation.weight(500))),
    Font(R.font.source_sans_3, FontWeight.SemiBold, variationSettings = FontVariation.Settings(FontVariation.weight(600))),
)

private val Esquema = darkColorScheme(
    primary = Oro,
    onPrimary = Color(0xFF1A1408),
    primaryContainer = Color(0xFF3E3118),
    onPrimaryContainer = OroClaro,
    secondary = Carmesi,
    onSecondary = Color(0xFFFFF6F4),
    secondaryContainer = Color(0xFF4A1C1C),
    onSecondaryContainer = Color(0xFFFFD7D4),
    tertiary = Color(0xFFD5DEE8),
    onTertiary = Color(0xFF1A1E24),
    background = Negro,
    onBackground = Tinta,
    surface = Superficie,
    onSurface = Tinta,
    surfaceVariant = SuperficieAlta,
    onSurfaceVariant = TintaSuave,
    surfaceContainerLowest = Color(0xFF0A0908),
    surfaceContainerLow = Color(0xFF14110E),
    surfaceContainer = Superficie,
    surfaceContainerHigh = SuperficieAlta,
    surfaceContainerHighest = SuperficieMas,
    outline = Color(0xFF8A7350),
    outlineVariant = Color(0xFF4A3E2E),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF5C2424),
    onErrorContainer = Color(0xFFFFDAD6),
)

private val Tipografia = Typography(
    displaySmall = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.SemiBold, fontSize = 36.sp, lineHeight = 42.sp, letterSpacing = 0.2.sp),
    headlineMedium = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.SemiBold, fontSize = 28.sp, lineHeight = 34.sp, letterSpacing = 0.2.sp),
    headlineSmall = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Medium, fontSize = 22.sp, lineHeight = 28.sp),
    titleLarge = TextStyle(fontFamily = Cinzel, fontWeight = FontWeight.Medium, fontSize = 20.sp, lineHeight = 26.sp),
    titleMedium = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, lineHeight = 22.sp),
    titleSmall = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, lineHeight = 20.sp),
    bodyLarge = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 20.sp),
    bodySmall = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 16.sp),
    labelLarge = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, lineHeight = 20.sp),
    labelMedium = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.Medium, fontSize = 12.sp, lineHeight = 16.sp),
    labelSmall = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.Medium, fontSize = 11.sp, lineHeight = 14.sp),
)

private val Formas = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(6.dp),
    medium = RoundedCornerShape(10.dp),
    large = RoundedCornerShape(14.dp),
    extraLarge = RoundedCornerShape(18.dp),
)

fun colorMarco(marco: String): Color = when (marco) {
    "plata" -> Color(0xFFD5D8DE)
    "platino" -> Color(0xFFE7F2FA)
    "negro" -> Color(0xFFC45A4A)
    else -> Oro
}

@Composable
fun BastionTema(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = Esquema,
        typography = Tipografia,
        shapes = Formas,
        content = content,
    )
}
