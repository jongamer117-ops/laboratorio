"""Servidor personal de Bastión de Albor para Colab (GPU T4 gratuita).

Una sola GPU, poca RAM: nunca hay dos modelos cargados a la vez.
La API es por trabajos (enviar, consultar, recoger) para que un túnel
corto no corte una generación larga.

El modelo de texto por defecto es el abliterado. No se añade un filtro
NSFW encima de Illustrious. El bloqueo de menores sí es fijo: el
servidor rechaza esos prompts y siempre añade el negativo.
"""

from __future__ import annotations

import base64
import gc
import hmac
import io
import json
import os
import queue
import re
import secrets
import threading
import time
import unicodedata
import urllib.request
from dataclasses import dataclass, field
from typing import Callable, Optional

REPO_IMAGEN = "OnomaAIResearch/Illustrious-xl-early-release-v0"
ARCHIVO_IMAGEN = "Illustrious-XL-v0.1.safetensors"
REPO_TEXTO_ABLIT = "huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2"
REPO_TEXTO_OFICIAL = "Qwen/Qwen2.5-7B-Instruct"
REPOS_TEXTO = {
    "abliterado": REPO_TEXTO_ABLIT,
    "oficial": REPO_TEXTO_OFICIAL,
}

# Términos que siempre se añaden al negativo de imagen. No se pueden quitar.
NEGATIVO_FORZADO = "child, loli, shota, young, underage"

# Se buscan en el prompt positivo (palabra o forma compacta, sin acentos).
TERMINOS_IMAGEN = (
    "child",
    "children",
    "loli",
    "lolita",
    "shota",
    "shotacon",
    "young",
    "underage",
    "underaged",
    "preteen",
    "toddler",
    "kid",
    "kids",
    "nino",
    "nina",
    "ninos",
    "ninas",
    "infantil",
    "menores",
    "menordeedad",
)

# En relatos, "young" solo no bloquea (un caballero joven es fantasía normal).
# Sí se rechaza si hay un término de menor Y uno sexual/romántico explícito.
MENORES_RELATO = (
    "child",
    "children",
    "loli",
    "lolita",
    "shota",
    "shotacon",
    "underage",
    "underaged",
    "preteen",
    "toddler",
    "kid",
    "kids",
    "nino",
    "nina",
    "ninos",
    "ninas",
    "infantil",
    "menores",
    "menordeedad",
)
SEXUAL_RELATO = (
    "nsfw",
    "porn",
    "porno",
    "sex",
    "sexual",
    "sexo",
    "erotico",
    "erotica",
    "desnudo",
    "desnuda",
    "nude",
    "hentai",
    "penetracion",
    "rape",
    "violacion",
    "incest",
    "incesto",
)

ANCHO_MAX = 1216
ALTO_MAX = 1216
PASOS_MAX = 40
CANTIDAD_MAX = 4
LARGO_MAX = 1200


class PromptBloqueado(ValueError):
    pass


def _plegar(texto: str) -> str:
    if not texto:
        return ""
    t = texto.lower().replace("\u200b", "").replace("\ufeff", "")
    t = unicodedata.normalize("NFD", t)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return t.translate(str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t"}))


def _palabras(texto: str) -> set[str]:
    return set(re.findall(r"[a-z]+", _plegar(texto)))


def _compacto(texto: str) -> str:
    return "".join(re.findall(r"[a-z]+", _plegar(texto)))


def _contiene(texto: str, terminos: tuple[str, ...]) -> Optional[str]:
    palabras = _palabras(texto)
    compacto = _compacto(texto)
    for termino in terminos:
        if termino in palabras or termino in compacto:
            return termino
    return None


def termino_imagen_bloqueado(prompt: str) -> Optional[str]:
    return _contiene(prompt or "", TERMINOS_IMAGEN)


def negativo_forzado(negativo: Optional[str]) -> str:
    """El negativo del usuario se conserva y el bloqueo se concatena al final."""
    base = (negativo or "").strip().strip(",")
    if base:
        return f"{base}, {NEGATIVO_FORZADO}"
    return NEGATIVO_FORZADO


def relato_bloqueado(sistema: str, pedido: str) -> Optional[str]:
    texto = f"{sistema or ''}\n{pedido or ''}"
    menor = _contiene(texto, MENORES_RELATO)
    sexual = _contiene(texto, SEXUAL_RELATO)
    if menor and sexual:
        return menor
    return None


def _entero(valor, defecto: int, minimo: int, maximo: int, nombre: str) -> int:
    if valor is None or valor == "":
        return defecto
    try:
        n = int(valor)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{nombre} tiene que ser un número entero.") from exc
    if n < minimo or n > maximo:
        raise ValueError(f"{nombre} debe estar entre {minimo} y {maximo}.")
    return n


def _flotante(valor, defecto: float, minimo: float, maximo: float, nombre: str) -> float:
    if valor is None or valor == "":
        return defecto
    try:
        n = float(valor)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{nombre} tiene que ser un número.") from exc
    if n < minimo or n > maximo:
        raise ValueError(f"{nombre} debe estar entre {minimo} y {maximo}.")
    return n


def _multiplo_8(n: int, nombre: str) -> int:
    if n % 8 != 0:
        raise ValueError(f"{nombre} tiene que ser múltiplo de 8.")
    return n


@dataclass
class Trabajo:
    id: str
    tipo: str
    payload: dict
    estado: str = "en_cola"
    avance: float = 0.0
    mensaje: str = "En cola"
    error: Optional[str] = None
    resultado: Optional[dict] = None
    creado: float = field(default_factory=time.time)

    def publico(self) -> dict:
        return {
            "id": self.id,
            "tipo": self.tipo,
            "estado": self.estado,
            "avance": round(self.avance, 4),
            "mensaje": self.mensaje,
            "error": self.error,
        }


class GestorModelos:
    """Carga Illustrious o Qwen, nunca los dos. Al cambiar, suelta el anterior."""

    def __init__(self) -> None:
        self.modo: Optional[str] = None
        self.pipe = None
        self.modelo_texto = None
        self.tokenizer = None
        self.id_texto: Optional[str] = None
        self._lock = threading.Lock()

    def soltar(self) -> None:
        with self._lock:
            self.pipe = None
            self.modelo_texto = None
            self.tokenizer = None
            self.modo = None
            self.id_texto = None
        gc.collect()
        try:
            import torch

            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.ipc_collect()
        except Exception:
            pass

    def asegurar_imagen(self, cache: str, reportar: Callable[[float, str], None]) -> None:
        if self.modo == "imagen" and self.pipe is not None:
            return
        if self.modo is not None:
            reportar(0.02, "Liberando la GPU del modelo de texto…")
            self.soltar()
        import torch
        from diffusers import StableDiffusionXLPipeline

        if not torch.cuda.is_available():
            raise RuntimeError(
                "No hay GPU. En Colab: Entorno de ejecución → Cambiar tipo de entorno → T4 GPU."
            )
        reportar(0.04, "Buscando Illustrious (si no está en Drive, se descarga)…")
        ruta = _ruta_ilustrious(cache)
        reportar(0.08, "Cargando Illustrious en la GPU (fp16)…")
        pipe = StableDiffusionXLPipeline.from_single_file(
            ruta,
            torch_dtype=torch.float16,
            use_safetensors=True,
        )
        # Illustrious es SDXL: no trae el checker de SD 1.5. Igual lo apagamos
        # si la versión de diffusers lo expone. El bloqueo de menores no depende de esto.
        if hasattr(pipe, "safety_checker"):
            pipe.safety_checker = None
        if hasattr(pipe, "requires_safety_checker"):
            pipe.requires_safety_checker = False
        pipe = pipe.to("cuda")
        if hasattr(pipe, "enable_vae_slicing"):
            pipe.enable_vae_slicing()
        if hasattr(pipe, "enable_attention_slicing"):
            pipe.enable_attention_slicing()
        self.pipe = pipe
        self.modo = "imagen"

    def asegurar_texto(self, cual: str, cache: str, reportar: Callable[[float, str], None]) -> None:
        repo = REPOS_TEXTO[cual]
        if self.modo == "texto" and self.id_texto == repo and self.modelo_texto is not None:
            return
        if self.modo is not None:
            reportar(0.02, "Liberando la GPU del modelo de imagen…")
            self.soltar()
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

        if not torch.cuda.is_available():
            raise RuntimeError(
                "No hay GPU. En Colab: Entorno de ejecución → Cambiar tipo de entorno → T4 GPU."
            )
        reportar(0.06, f"Cargando {repo} en 4-bit… la primera vez son varios GB.")
        cuant = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
        )
        tok = AutoTokenizer.from_pretrained(repo, cache_dir=cache)
        # device_map fijo a la GPU: el offload a CPU no cabe en los ~12 GB de RAM de la T4.
        modelo = AutoModelForCausalLM.from_pretrained(
            repo,
            quantization_config=cuant,
            device_map={"": 0},
            cache_dir=cache,
            torch_dtype=torch.float16,
        )
        self.tokenizer = tok
        self.modelo_texto = modelo
        self.id_texto = repo
        self.modo = "texto"


def _ruta_ilustrious(cache: str) -> str:
    os.makedirs(cache, exist_ok=True)
    destino = os.path.join(cache, ARCHIVO_IMAGEN)
    if os.path.isfile(destino) and os.path.getsize(destino) > 1_000_000:
        return destino
    from huggingface_hub import hf_hub_download

    return hf_hub_download(
        repo_id=REPO_IMAGEN,
        filename=ARCHIVO_IMAGEN,
        local_dir=cache,
    )


def generar_imagen_real(payload: dict, reportar: Callable[[float, str], None], gestor: GestorModelos, cache: str) -> dict:
    import torch

    gestor.asegurar_imagen(cache, reportar)
    pipe = gestor.pipe
    cantidad = payload["cantidad"]
    pasos = payload["pasos"]
    imagenes = []
    for indice in range(cantidad):
        semilla = payload["semilla"]
        if semilla is None:
            semilla_i = secrets.randbelow(2**31 - 1)
        else:
            semilla_i = int(semilla) + indice

        def _cb(pipe, step_index, timestep, callback_kwargs, indice=indice, semilla_i=semilla_i):
            hecho = indice + (step_index + 1) / max(pasos, 1)
            reportar(
                hecho / cantidad,
                f"Imagen {indice + 1} de {cantidad} · paso {step_index + 1} de {pasos}",
            )
            return callback_kwargs

        generador = torch.Generator(device="cuda").manual_seed(semilla_i)
        kwargs = dict(
            prompt=payload["prompt"],
            negative_prompt=payload["negativo"],
            width=payload["ancho"],
            height=payload["alto"],
            num_inference_steps=pasos,
            guidance_scale=payload["guia"],
            generator=generador,
        )
        try:
            resultado = pipe(**kwargs, callback_on_step_end=_cb)
        except TypeError:
            resultado = pipe(**kwargs)
        buf = io.BytesIO()
        resultado.images[0].save(buf, format="PNG")
        nombre = time.strftime("bastion-%Y%m%d-%H%M%S") + f"-{indice + 1}.png"
        imagenes.append(
            {
                "png_base64": base64.b64encode(buf.getvalue()).decode("ascii"),
                "semilla": semilla_i,
                "nombre": nombre,
            }
        )
        del resultado
        gc.collect()
        torch.cuda.empty_cache()
    return {
        "tipo": "imagen",
        "imagenes": imagenes,
        "negativo_usado": payload["negativo"],
        "modelo": f"{REPO_IMAGEN}/{ARCHIVO_IMAGEN}",
    }


def generar_relato_real(payload: dict, reportar: Callable[[float, str], None], gestor: GestorModelos, cache: str) -> dict:
    gestor.asegurar_texto(payload["modelo"], cache, reportar)
    tok = gestor.tokenizer
    model = gestor.modelo_texto
    mensajes = []
    if payload.get("sistema"):
        mensajes.append({"role": "system", "content": payload["sistema"]})
    mensajes.append({"role": "user", "content": payload["pedido"]})
    # tokenize=True devolvía tensores y rompía en transformers recientes.
    texto = tok.apply_chat_template(mensajes, tokenize=False, add_generation_prompt=True)
    enc = tok(texto, return_tensors="pt")
    enc = {k: v.to(model.device) for k, v in enc.items()}
    largo = payload["largo"]
    creatividad = payload["creatividad"]
    reportar(0.2, "Escribiendo…")
    kwargs = dict(
        max_new_tokens=largo,
        do_sample=creatividad > 0.05,
        top_p=0.9,
        repetition_penalty=1.05,
    )
    if creatividad > 0.05:
        kwargs["temperature"] = creatividad
    salida = model.generate(**enc, **kwargs)
    nuevos = salida[0][enc["input_ids"].shape[-1] :]
    relato = tok.decode(nuevos, skip_special_tokens=True).strip()
    reportar(0.95, "Listo")
    return {
        "tipo": "relato",
        "texto": relato,
        "modelo": gestor.id_texto,
    }


class Estado:
    def __init__(self, token: str, cache: Optional[str] = None) -> None:
        self.token = token
        self.cache = cache or os.environ.get("BASTION_CACHE") or "/content/bastion-modelos"
        self.gestor = GestorModelos()
        self.cola: queue.Queue = queue.Queue()
        self.trabajos: dict[str, Trabajo] = {}
        self.lock = threading.Lock()
        self._hilo: Optional[threading.Thread] = None
        self.generar_imagen = lambda payload, reportar: generar_imagen_real(
            payload, reportar, self.gestor, self.cache
        )
        self.generar_relato = lambda payload, reportar: generar_relato_real(
            payload, reportar, self.gestor, self.cache
        )

    def iniciar(self) -> None:
        if self._hilo and self._hilo.is_alive():
            return
        self._hilo = threading.Thread(target=self._bucle, name="bastion-gpu", daemon=True)
        self._hilo.start()

    def _bucle(self) -> None:
        while True:
            trabajo = self.cola.get()
            if trabajo is None:
                return
            self._correr(trabajo)

    def _correr(self, trabajo: Trabajo) -> None:
        def reportar(avance: float, mensaje: str) -> None:
            with self.lock:
                trabajo.avance = max(0.0, min(1.0, float(avance)))
                trabajo.mensaje = mensaje
                trabajo.estado = "generando"
            print(f"[{trabajo.id}] {mensaje}", flush=True)

        with self.lock:
            trabajo.estado = "generando"
            trabajo.mensaje = "Empezando…"
        try:
            if trabajo.tipo == "imagen":
                resultado = self.generar_imagen(trabajo.payload, reportar)
            else:
                resultado = self.generar_relato(trabajo.payload, reportar)
            with self.lock:
                trabajo.resultado = resultado
                trabajo.estado = "listo"
                trabajo.avance = 1.0
                trabajo.mensaje = "Listo"
        except PromptBloqueado as exc:
            with self.lock:
                trabajo.estado = "error"
                trabajo.error = str(exc)
        except Exception as exc:
            mensaje = str(exc) or exc.__class__.__name__
            bajo = mensaje.lower()
            if "out of memory" in bajo or "cuda" in bajo and "memory" in bajo:
                mensaje = (
                    "La GPU se quedó sin memoria. Baja el tamaño o los pasos. "
                    "El otro modelo se descarga solo antes de cargar este."
                )
                self.gestor.soltar()
            elif "no hay gpu" in bajo:
                pass
            else:
                self.gestor.soltar()
            with self.lock:
                trabajo.estado = "error"
                trabajo.error = mensaje
            print(f"[{trabajo.id}] error: {mensaje}", flush=True)

    def encolar(self, data: dict) -> Trabajo:
        tipo = (data.get("tipo") or "").strip().lower()
        if tipo == "imagen":
            payload = self._payload_imagen(data)
        elif tipo == "relato":
            payload = self._payload_relato(data)
        else:
            raise ValueError("El tipo tiene que ser «imagen» o «relato».")
        trabajo = Trabajo(id=secrets.token_hex(8), tipo=tipo, payload=payload)
        with self.lock:
            self.trabajos[trabajo.id] = trabajo
        self.cola.put(trabajo)
        return trabajo

    def _payload_imagen(self, data: dict) -> dict:
        prompt = (data.get("prompt") or "").strip()
        if not prompt:
            raise ValueError("Escribe un prompt.")
        if len(prompt) > 2000:
            raise ValueError("El prompt es demasiado largo (máximo 2000 caracteres).")
        termino = termino_imagen_bloqueado(prompt)
        if termino:
            raise PromptBloqueado(
                f"Bloqueado por el término «{termino}». "
                "Este servidor no genera imágenes con esos términos. "
                "El negativo de menores se aplica siempre y no se puede quitar."
            )
        ancho = _multiplo_8(_entero(data.get("ancho"), 832, 512, ANCHO_MAX, "Ancho"), "Ancho")
        alto = _multiplo_8(_entero(data.get("alto"), 1216, 512, ALTO_MAX, "Alto"), "Alto")
        if ancho * alto > ANCHO_MAX * ALTO_MAX:
            raise ValueError("Esa resolución no cabe con holgura en una T4. Usa 832×1216 o menos.")
        semilla = data.get("semilla")
        if semilla is None or semilla == "":
            semilla_val = None
        else:
            semilla_val = _entero(semilla, 0, 0, 2**31 - 1, "Semilla")
        return {
            "prompt": prompt,
            "negativo": negativo_forzado(data.get("negativo") or ""),
            "ancho": ancho,
            "alto": alto,
            "cantidad": _entero(data.get("cantidad"), 1, 1, CANTIDAD_MAX, "Cantidad"),
            "semilla": semilla_val,
            "pasos": _entero(data.get("pasos"), 28, 1, PASOS_MAX, "Pasos"),
            "guia": _flotante(data.get("guia"), 5.5, 1.0, 12.0, "Guía"),
        }

    def _payload_relato(self, data: dict) -> dict:
        pedido = (data.get("pedido") or "").strip()
        sistema = (data.get("sistema") or "").strip()
        if not pedido:
            raise ValueError("Escribe qué relato quieres.")
        if len(pedido) > 4000 or len(sistema) > 2000:
            raise ValueError("El texto es demasiado largo.")
        termino = relato_bloqueado(sistema, pedido)
        if termino:
            raise PromptBloqueado(
                "No puedo escribir eso: el pedido junta menores con contenido sexual o romántico."
            )
        modelo = (data.get("modelo") or "abliterado").strip().lower()
        if modelo not in REPOS_TEXTO:
            raise ValueError("El modelo tiene que ser «abliterado» u «oficial».")
        return {
            "pedido": pedido,
            "sistema": sistema,
            "largo": _entero(data.get("largo"), 700, 64, LARGO_MAX, "Extensión"),
            "creatividad": _flotante(data.get("creatividad"), 0.8, 0.0, 1.5, "Creatividad"),
            "modelo": modelo,
        }

    def obtener(self, id_trabajo: str) -> Optional[Trabajo]:
        with self.lock:
            return self.trabajos.get(id_trabajo)

    def salud(self) -> dict:
        gpu = None
        try:
            import torch

            if torch.cuda.is_available():
                gpu = torch.cuda.get_device_name(0)
        except Exception:
            gpu = None
        with self.lock:
            activos = sum(1 for t in self.trabajos.values() if t.estado in ("en_cola", "generando"))
        return {
            "ok": True,
            "nombre": "Bastión de Albor",
            "version": "0.1.0",
            "gpu": gpu,
            "modelo_cargado": self.gestor.modo,
            "cola": activos,
            "texto_por_defecto": REPO_TEXTO_ABLIT,
            "imagen": f"{REPO_IMAGEN}/{ARCHIVO_IMAGEN}",
            "negativo_forzado": NEGATIVO_FORZADO,
        }


def _autorizado(estado: Estado, headers) -> bool:
    header = headers.get("Authorization", "") or ""
    token = ""
    if header.lower().startswith("bearer "):
        token = header[7:].strip()
    if not token:
        token = (headers.get("X-Token") or "").strip()
    if not token:
        return False
    return hmac.compare_digest(token, estado.token)


def create_app(estado: Estado):
    from flask import Flask, jsonify, request

    app = Flask(__name__)
    app.json.ensure_ascii = False

    @app.get("/")
    def raiz():
        return (
            "<!doctype html><meta charset='utf-8'><title>Bastión de Albor</title>"
            "<body style='background:#0e0c0a;color:#f6f0e6;font-family:sans-serif;padding:2rem'>"
            "<h1>Bastión de Albor</h1><p>El servidor está despierto. La app usa /api/salud.</p>"
            "</body>"
        )

    @app.get("/api/salud")
    def salud():
        return jsonify(estado.salud())

    @app.post("/api/trabajos")
    def crear():
        if not _autorizado(estado, request.headers):
            return jsonify({"error": "token", "mensaje": "El token no coincide."}), 401
        data = request.get_json(force=True, silent=True) or {}
        try:
            trabajo = estado.encolar(data)
        except PromptBloqueado as exc:
            return jsonify({"error": "prompt_bloqueado", "mensaje": str(exc)}), 400
        except ValueError as exc:
            return jsonify({"error": "solicitud", "mensaje": str(exc)}), 400
        return jsonify(trabajo.publico()), 202

    @app.get("/api/trabajos/<id_trabajo>")
    def consultar(id_trabajo: str):
        if not _autorizado(estado, request.headers):
            return jsonify({"error": "token", "mensaje": "El token no coincide."}), 401
        trabajo = estado.obtener(id_trabajo)
        if trabajo is None:
            return jsonify({"error": "no_existe", "mensaje": "Ese trabajo ya no está en memoria."}), 404
        return jsonify(trabajo.publico())

    @app.get("/api/trabajos/<id_trabajo>/resultado")
    def resultado(id_trabajo: str):
        if not _autorizado(estado, request.headers):
            return jsonify({"error": "token", "mensaje": "El token no coincide."}), 401
        trabajo = estado.obtener(id_trabajo)
        if trabajo is None:
            return jsonify({"error": "no_existe", "mensaje": "Ese trabajo ya no está en memoria."}), 404
        if trabajo.estado == "error":
            return jsonify({"error": "fallo", "mensaje": trabajo.error or "Falló la generación."}), 409
        if trabajo.estado != "listo" or trabajo.resultado is None:
            return jsonify({"error": "pendiente", "mensaje": "Todavía no está listo."}), 409
        return jsonify(trabajo.resultado)

    return app


def _publicar_ntfy(tema: str, url: str, token: str) -> None:
    if not tema:
        return
    cuerpo = json.dumps({"u": url, "t": token, "n": tema, "en": time.time()}, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        f"https://ntfy.sh/{tema}",
        data=cuerpo,
        headers={
            "Title": "Bastion de Albor",
            "Content-Type": "text/plain; charset=utf-8",
            "Tags": "castle",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        resp.read()


def _mostrar_qr(url: str, token: str, tema: str) -> None:
    payload = json.dumps({"u": url, "t": token, "n": tema}, ensure_ascii=False, separators=(",", ":"))
    print("\n" + "=" * 64)
    print("BASTIÓN DE ALBOR — conéctate desde el celular")
    print("URL   ", url)
    print("TOKEN ", token)
    print("NTFY  ", tema or "(no configurado)")
    print("QR JSON:", payload)
    print("=" * 64 + "\n", flush=True)
    try:
        import qrcode
        from IPython.display import display

        img = qrcode.make(payload)
        display(img)
    except Exception as exc:
        print("No pude dibujar el QR en el notebook:", exc)
        print("Copia la URL y el token a mano.")


def _esperar_tunel(proceso, timeout: int = 90) -> str:
    patron = re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com")
    inicio = time.time()
    assert proceso.stdout is not None
    for linea in proceso.stdout:
        print(linea, end="")
        hallado = patron.search(linea)
        if hallado:
            return hallado.group(0)
        if time.time() - inicio > timeout:
            break
    raise RuntimeError(
        "cloudflared no entregó una URL. En la T4 gratuita a veces falla el túnel: "
        "vuelve a ejecutar esta celda. Si Colab dice que hay demasiadas sesiones, cierra las otras."
    )


def asegurar_cloudflared() -> str:
    candidatos = ["/content/cloudflared", "/usr/local/bin/cloudflared", "/tmp/cloudflared"]
    for ruta in candidatos:
        if os.path.isfile(ruta) and os.access(ruta, os.X_OK):
            return ruta
    destino = "/content/cloudflared" if os.path.isdir("/content") else "/tmp/cloudflared"
    url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
    print("Descargando cloudflared…", flush=True)
    urllib.request.urlretrieve(url, destino)
    os.chmod(destino, 0o755)
    return destino


def arrancar(puerto: int = 7860) -> None:
    """Arranca Flask, abre el túnel, muestra el QR y publica en ntfy. Bloquea la celda."""
    import subprocess

    token = secrets.token_urlsafe(24)
    tema = (os.environ.get("BASTION_NTFY_TOPIC") or "").strip()
    if not tema:
        tema = "bastion-" + secrets.token_hex(8)
        print("Tema ntfy generado:", tema)
    cache = os.environ.get("BASTION_CACHE") or "/content/bastion-modelos"
    os.makedirs(cache, exist_ok=True)
    estado = Estado(token=token, cache=cache)
    estado.iniciar()
    app = create_app(estado)
    hilo = threading.Thread(
        target=lambda: app.run(host="127.0.0.1", port=puerto, threaded=True, use_reloader=False),
        name="bastion-http",
        daemon=True,
    )
    hilo.start()
    time.sleep(1.2)
    binario = asegurar_cloudflared()
    proceso = subprocess.Popen(
        [binario, "tunnel", "--url", f"http://127.0.0.1:{puerto}", "--no-autoupdate"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    url = _esperar_tunel(proceso)
    try:
        _publicar_ntfy(tema, url, token)
        print("Publicado en ntfy.sh/" + tema)
    except Exception as exc:
        print("No se pudo publicar en ntfy (la app igual puede escanear el QR):", exc)
    _mostrar_qr(url, token, tema)
    print("Deja esta celda corriendo. Si el túnel se cae, vuelve a ejecutarla.", flush=True)
    try:
        while True:
            time.sleep(20)
            if proceso.poll() is not None:
                print("El túnel de Cloudflare se cerró. Vuelve a ejecutar el notebook.")
                break
    except KeyboardInterrupt:
        print("Servidor detenido.")
