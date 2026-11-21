package dev.jongamer.bastionalbor.logica

fun parsearKaggleJson(texto: String): Pair<String, String>? {
    fun campo(nombre: String): String? =
        Regex(""""$nombre"\s*:\s*"([^"]+)"""").find(texto)?.groupValues?.get(1)?.trim()?.ifBlank { null }
    val usuario = campo("username") ?: campo("user") ?: return null
    val llave = campo("key") ?: return null
    return usuario to llave
}

fun faseKernel(status: String): String {
    val s = status.lowercase()
    return when {
        s.contains("error") || s.contains("fail") -> "error"
        s.contains("complete") || s.contains("success") -> "completo"
        s.contains("queue") || s.contains("pending") -> "cola"
        s.contains("cancel") -> "apagado"
        s.contains("run") -> "corriendo"
        else -> "corriendo"
    }
}

fun mensajeKaggle(codigo: Int, cuerpo: String): String {
    val t = cuerpo.lowercase()
    if (codigo == 401 || t.contains("unauthorized") || t.contains("invalid credentials") || t.contains("unauthenticated")) {
        return "La llave de Kaggle no sirve. Vuelve a pegar el kaggle.json."
    }
    if (t.contains("phone") || t.contains("verif")) {
        return "Kaggle pide verificar el teléfono antes de usar la GPU. En kaggle.com → Settings → Phone Verification."
    }
    if (t.contains("quota") || (t.contains("gpu") && (t.contains("exceed") || t.contains("limit") || t.contains("remaining") || t.contains("agot")))) {
        return "Se agotó la cuota de GPU de Kaggle (unas 30 horas por semana)."
    }
    val detalle = Regex(""""(?:message|failureMessage)"\s*:\s*"([^"]+)"""").find(cuerpo)?.groupValues?.get(1).orEmpty()
    if (detalle.isNotBlank() && detalle != cuerpo) return mensajeKaggle(codigo, detalle)
    return cuerpo.ifBlank { "Kaggle respondió $codigo." }.take(280)
}
