package dev.jongamer.bastionalbor

import dev.jongamer.bastionalbor.logica.NEGATIVO_FORZADO
import dev.jongamer.bastionalbor.logica.esMasNueva
import dev.jongamer.bastionalbor.logica.extraerPedido
import dev.jongamer.bastionalbor.logica.nombreSeguro
import dev.jongamer.bastionalbor.logica.negativoForzado
import dev.jongamer.bastionalbor.logica.parsearQr
import dev.jongamer.bastionalbor.logica.quitarForzado
import dev.jongamer.bastionalbor.logica.relatoBloqueado
import dev.jongamer.bastionalbor.logica.relatoMarkdown
import dev.jongamer.bastionalbor.logica.terminoImagenBloqueado
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.Base64
import dev.jongamer.bastionalbor.logica.PngTexto

class ReglasTest {
    @Test
    fun bloqueaMenoresYDejaPasarUnCaballero() {
        assertNotNull(terminoImagenBloqueado("Young knight"))
        assertNotNull(terminoImagenBloqueado("l0li"))
        assertNotNull(terminoImagenBloqueado("un niño"))
        assertNull(terminoImagenBloqueado("masterpiece, knight in gold armor, black background"))
    }

    @Test
    fun elNegativoNoSeQuita() {
        val negativo = negativoForzado("lowres")
        for (termino in listOf("child", "loli", "shota", "young", "underage")) {
            assertTrue(negativo.contains(termino))
        }
        assertEquals(NEGATIVO_FORZADO, negativoForzado(""))
        assertTrue(quitarForzado(negativo).startsWith("lowres"))
        assertFalse(relatoBloqueado("Cronista", "El hijo del rey defiende el bastión."))
        assertTrue(relatoBloqueado("", "loli nude"))
    }

    @Test
    fun leeElQrYLaVersion() {
        val datos = parsearQr("""{"u":"https://x.trycloudflare.com","t":"abc","n":"bastion-1"}""")
        assertEquals("https://x.trycloudflare.com", datos?.url)
        assertEquals("abc", datos?.token)
        assertEquals("bastion-1", datos?.tema)
        assertTrue(esMasNueva("v0.2.0", "0.1.0"))
        assertFalse(esMasNueva("v0.1.0", "0.1.0"))
        assertFalse(esMasNueva("0.1.0", "0.2.0"))
    }

    @Test
    fun elNombreDelProyectoQuedaEnUnaCarpeta() {
        assertEquals("el-asedio", nombreSeguro("El Asedio!"))
        assertEquals("proyecto", nombreSeguro("   "))
    }

    @Test
    fun elMarkdownGuardaElPedido() {
        val md = relatoMarkdown("voz", "el asedio", "aguantó", "qwen", 0)
        assertEquals("el asedio", extraerPedido(md))
    }

    @Test
    fun elPngConservaElPrompt() {
        val crudo = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        )
        val conTexto = PngTexto.insertar(crudo, mapOf("prompt" to "Bastión de oro", "seed" to "7"))
        val leido = PngTexto.leer(conTexto)
        assertEquals("Bastión de oro", leido["prompt"])
        assertEquals("7", leido["seed"])
    }
}
