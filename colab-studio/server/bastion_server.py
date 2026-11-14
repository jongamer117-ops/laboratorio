"""Servidor personal de Bastión de Albor (Colab con una T4, o Kaggle con dos).

Nunca hay dos modelos cargados a la vez. La API es por trabajos para que
un túnel corto no corte una generación larga.

Texto: solo checkpoints abliterados. Imagen: Illustrious (anime) o Flux
Schnell (realista). No hay filtro NSFW extra. El bloqueo de menores es fijo.
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
import shutil
import threading
import time
import unicodedata
import urllib.request
from dataclasses import dataclass, field
from typing import Callable, Optional

REPO_IMAGEN = "OnomaAIResearch/Illustrious-xl-early-release-v0"
ARCHIVO_IMAGEN = "Illustrious-XL-v0.1.safetensors"
REPO_FLUX = "black-forest-labs/FLUX.1-schnell"
# 7B y 32B de huihui se bajan sin token. El 14B de huihui responde 401
# anónimo, así que el 14B es el safetensors público más cercano.
REPO_TEXTO_7B = "huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2"
REPO_TEXTO_14B = "sci4ai/Qwen2.5-14B-Instruct-Abliterated"
REPO_TEXTO_32B = "huihui-ai/Qwen2.5-32B-Instruct-abliterated"
REPO_TEXTO_ABLIT = REPO_TEXTO_7B
MODELOS_IMAGEN = ("ilustrious", "flux")
LARGO_TROZO = 75
# Canal fijo, el mismo en los dos notebooks y en la app. El mensaje va cifrado.
DISCOVERY_TOPIC = "bastion-albor-c7e1a94f6b2d4803e5a8c1f07d3b69e24a51f0c8"
DISCOVERY_KEY_B64 = "RTMuKJDbQrFucahtdaTVNo+7w+kS6UrYahOb6tzIs78="
DISCOVERY_AAD = b"bastion-albor"
PREFIJO_ANIME = "masterpiece, best quality, "
PREFIJO_REALISTA = "highly detailed, sharp focus, "

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


def backend_actual() -> str:
    valor = (os.environ.get("BASTION_BACKEND") or "colab").strip().lower()
    return "kaggle" if valor == "kaggle" else "colab"


def repos_texto() -> dict[str, str]:
    if backend_actual() == "kaggle":
        return {"32b": REPO_TEXTO_32B, "14b": REPO_TEXTO_14B}
    return {"7b": REPO_TEXTO_7B, "14b": REPO_TEXTO_14B}


def defecto_texto() -> str:
    return "32b" if backend_actual() == "kaggle" else "7b"


def cache_defecto() -> str:
    fijado = (os.environ.get("BASTION_CACHE") or "").strip()
    if fijado:
        return fijado
    if backend_actual() == "kaggle":
        return "/kaggle/working/BastionAlbor/modelos"
    return "/content/bastion-modelos"


def _token_hf() -> Optional[str]:
    token = (os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN") or "").strip()
    return token or None


def _mensaje_sin_gpu() -> str:
    if backend_actual() == "kaggle":
        return "No hay GPU. En Kaggle: Settings → Accelerator → GPU T4 x2, e Internet On."
    return "No hay GPU. En Colab: Entorno de ejecución → Cambiar tipo de entorno → T4 GPU."


def trocear_ids(ids: list[int], bos: int, eos: int, pad: int, largo: int = LARGO_TROZO) -> list[list[int]]:
    """Trozo de `largo` tokens de contenido, con BOS y EOS. Cada lista mide largo+2."""
    grupos = [ids[i : i + largo] for i in range(0, len(ids), largo)] if ids else [[]]
    trozos = []
    for grupo in grupos:
        pieza = list(grupo[:largo])
        pieza.extend([pad] * (largo - len(pieza)))
        trozos.append([bos, *pieza, eos])
    return trozos


def igualar_trozos(
    trozos: list[list[int]],
    cantidad: int,
    bos: int,
    eos: int,
    pad: int,
    largo: int = LARGO_TROZO,
) -> list[list[int]]:
    vacio = [bos, *([pad] * largo), eos]
    salida = [list(trozo) for trozo in trozos]
    while len(salida) < cantidad:
        salida.append(list(vacio))
    return salida


def _lista_ids(tokenizer, texto: str) -> list[int]:
    codificados = tokenizer(texto or "", add_special_tokens=False, truncation=False)["input_ids"]
    if codificados and isinstance(codificados[0], list):
        return list(codificados[0])
    return list(codificados)


def _preparar_par(tokenizer, positivo: str, negativo: str):
    bos = tokenizer.bos_token_id
    eos = tokenizer.eos_token_id if tokenizer.eos_token_id is not None else tokenizer.pad_token_id
    pad = tokenizer.pad_token_id if tokenizer.pad_token_id is not None else eos
    pos = trocear_ids(_lista_ids(tokenizer, positivo), bos, eos, pad)
    neg = trocear_ids(_lista_ids(tokenizer, negativo), bos, eos, pad)
    return pos, neg, bos, eos, pad


def _pasar_encoder(encoder, trozos: list[list[int]], querer_pooled: bool = False):
    import torch

    device = next(encoder.parameters()).device
    ocultos = []
    pooled = None
    for indice, trozo in enumerate(trozos):
        ids = torch.tensor([trozo], device=device)
        salida = encoder(ids, output_hidden_states=True)
        # Penúltimo estado oculto: el último es el de la capa final ya normalizado
        # de otra forma y diffusers usa el -2 en SDXL.
        ocultos.append(salida.hidden_states[-2])
        if querer_pooled and indice == 0:
            pooled = getattr(salida, "text_embeds", None)
            if pooled is None:
                pooled = salida[0]
    return torch.cat(ocultos, dim=1), pooled


def codificar_prompt_sdxl(pipe, positivo: str, negativo: str):
    """Prompt largo de SDXL con troceo propio. El negativo queda con los mismos trozos."""
    import torch

    p1, n1, bos1, eos1, pad1 = _preparar_par(pipe.tokenizer, positivo, negativo)
    p2, n2, bos2, eos2, pad2 = _preparar_par(pipe.tokenizer_2, positivo, negativo)
    cantidad = max(len(p1), len(p2), len(n1), len(n2))
    p1 = igualar_trozos(p1, cantidad, bos1, eos1, pad1)
    p2 = igualar_trozos(p2, cantidad, bos2, eos2, pad2)
    n1 = igualar_trozos(n1, cantidad, bos1, eos1, pad1)
    n2 = igualar_trozos(n2, cantidad, bos2, eos2, pad2)
    with torch.no_grad():
        h1, _ = _pasar_encoder(pipe.text_encoder, p1)
        h2, pooled = _pasar_encoder(pipe.text_encoder_2, p2, querer_pooled=True)
        nh1, _ = _pasar_encoder(pipe.text_encoder, n1)
        nh2, npooled = _pasar_encoder(pipe.text_encoder_2, n2, querer_pooled=True)
    return torch.cat([h1, h2], dim=-1), torch.cat([nh1, nh2], dim=-1), pooled, npooled


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
    """Un solo modelo en memoria. Cambiar de Illustrious, Flux o Qwen suelta el anterior."""

    def __init__(self) -> None:
        self.modo: Optional[str] = None
        self.variante: Optional[str] = None
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
            self.variante = None
            self.id_texto = None
        gc.collect()
        try:
            import torch

            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.ipc_collect()
        except Exception:
            pass

    def asegurar_imagen(self, cual: str, cache: str, reportar: Callable[[float, str], None]) -> None:
        if self.modo == "imagen" and self.variante == cual and self.pipe is not None:
            return
        if self.modo is not None:
            reportar(0.02, "Liberando la GPU…")
            self.soltar()
        import torch

        if not torch.cuda.is_available():
            raise RuntimeError(_mensaje_sin_gpu())
        if cual == "flux":
            self.pipe = _cargar_flux(cache, reportar)
        else:
            self.pipe = _cargar_ilustrious(cache, reportar)
        self.modo = "imagen"
        self.variante = cual

    def asegurar_texto(self, cual: str, cache: str, reportar: Callable[[float, str], None]) -> None:
        repo = repos_texto()[cual]
        if self.modo == "texto" and self.id_texto == repo and self.modelo_texto is not None:
            return
        if self.modo is not None:
            reportar(0.02, "Liberando la GPU del modelo de imagen…")
            self.soltar()
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

        if not torch.cuda.is_available():
            raise RuntimeError(_mensaje_sin_gpu())
        if cual == "32b":
            os.makedirs(cache, exist_ok=True)
            libres = shutil.disk_usage(cache).free
            if libres < 70 * (1024**3):
                raise RuntimeError(
                    "No cabe el Qwen 32B abliterado: la descarga pesa unos 65 GB y aquí hay "
                    f"{libres / (1024**3):.0f} GB libres. Elige el 14B."
                )
            if torch.cuda.device_count() < 2:
                raise RuntimeError("El 32B pide dos T4. En Kaggle elige GPU T4 x2, o usa el 14B.")
        reportar(0.06, f"Cargando {repo} en 4-bit… la primera vez son varios GB.")
        cuant = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
        )
        token = _token_hf()
        tok = AutoTokenizer.from_pretrained(repo, cache_dir=cache, token=token)
        kwargs = dict(
            quantization_config=cuant,
            cache_dir=cache,
            torch_dtype=torch.float16,
            token=token,
        )
        if cual == "32b":
            # Repartido en las dos T4. Lo que no quepa baja a CPU, con tope.
            kwargs["device_map"] = "auto"
            kwargs["max_memory"] = {0: "14GiB", 1: "14GiB", "cpu": "20GiB"}
        else:
            # Una T4: sin offload a CPU, porque la RAM del sistema no alcanza.
            kwargs["device_map"] = {"": 0}
        modelo = AutoModelForCausalLM.from_pretrained(repo, **kwargs)
        self.tokenizer = tok
        self.modelo_texto = modelo
        self.id_texto = repo
        self.modo = "texto"
        self.variante = cual


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
        token=_token_hf(),
    )


def _activar_tiling(pipe) -> None:
    # El tiling se pide al VAE. El atajo del pipeline no se usa.
    pipe.vae.enable_tiling()


def _error_flux(exc: Exception) -> Exception:
    texto = str(exc).lower()
    if "401" in texto or "gated" in texto or "authorized" in texto or "403" in texto:
        return RuntimeError(
            "Flux pide aceptar la licencia en huggingface.co/black-forest-labs/FLUX.1-schnell "
            "y un token de lectura. Pégalo en HF_TOKEN en la primera celda y vuelve a ejecutar."
        )
    return exc


def _cargar_ilustrious(cache: str, reportar: Callable[[float, str], None]):
    import torch
    from diffusers import StableDiffusionXLPipeline

    reportar(0.04, "Buscando Illustrious…")
    ruta = _ruta_ilustrious(cache)
    reportar(0.08, "Cargando Illustrious en la GPU (fp16)…")
    pipe = StableDiffusionXLPipeline.from_single_file(
        ruta,
        torch_dtype=torch.float16,
        use_safetensors=True,
    )
    if hasattr(pipe, "safety_checker"):
        pipe.safety_checker = None
    if hasattr(pipe, "requires_safety_checker"):
        pipe.requires_safety_checker = False
    pipe = pipe.to("cuda")
    from diffusers import EulerAncestralDiscreteScheduler

    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
    _activar_tiling(pipe)
    if hasattr(pipe, "enable_attention_slicing"):
        pipe.enable_attention_slicing()
    return pipe


def _cargar_flux(cache: str, reportar: Callable[[float, str], None]):
    import torch

    token = _token_hf()
    # La T4 no tiene bf16 nativo. NF4 con cálculo fp16, y si falla, fp16 con offload a CPU.
    reportar(0.05, "Cargando Flux Schnell en NF4…")
    try:
        from diffusers import FluxPipeline, FluxTransformer2DModel
        from transformers import BitsAndBytesConfig, T5EncoderModel

        nf4 = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
        )
        transformer = FluxTransformer2DModel.from_pretrained(
            REPO_FLUX,
            subfolder="transformer",
            quantization_config=nf4,
            torch_dtype=torch.float16,
            cache_dir=cache,
            token=token,
        )
        text_encoder_2 = T5EncoderModel.from_pretrained(
            REPO_FLUX,
            subfolder="text_encoder_2",
            quantization_config=nf4,
            torch_dtype=torch.float16,
            cache_dir=cache,
            token=token,
        )
        pipe = FluxPipeline.from_pretrained(
            REPO_FLUX,
            transformer=transformer,
            text_encoder_2=text_encoder_2,
            torch_dtype=torch.float16,
            cache_dir=cache,
            token=token,
        )
        pipe.enable_model_cpu_offload()
    except Exception as exc:
        envuelto = _error_flux(exc)
        if envuelto is not exc:
            raise envuelto from exc
        reportar(0.07, "NF4 no entró. Flux en fp16 con descarga a CPU…")
        try:
            from diffusers import FluxPipeline

            pipe = FluxPipeline.from_pretrained(
                REPO_FLUX,
                torch_dtype=torch.float16,
                cache_dir=cache,
                token=token,
            )
            pipe.enable_model_cpu_offload()
        except Exception as segundo:
            raise _error_flux(segundo) from segundo
    if hasattr(pipe, "vae"):
        _activar_tiling(pipe)
    return pipe


def _semilla_de(payload: dict, indice: int) -> int:
    semilla = payload["semilla"]
    if semilla is None:
        return secrets.randbelow(2**31 - 1)
    return int(semilla) + indice


def prompt_con_calidad(prompt: str, modelo: str) -> str:
    prefijo = PREFIJO_REALISTA if modelo == "flux" else PREFIJO_ANIME
    if prompt.lower().startswith(prefijo.strip().lower()):
        return prompt
    return prefijo + prompt


def separar_fondo(imagen):
    """rembg en CPU: PNG transparente y la misma figura sobre negro."""
    from PIL import Image
    from rembg import remove

    rgba = remove(imagen.convert("RGBA"))
    if rgba.mode != "RGBA":
        rgba = rgba.convert("RGBA")
    base = Image.new("RGBA", rgba.size, (0, 0, 0, 255))
    negro = Image.alpha_composite(base, rgba).convert("RGB")
    return rgba, negro


def _guardar_png(imagen) -> str:
    buf = io.BytesIO()
    imagen.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def generar_imagen_real(payload: dict, reportar: Callable[[float, str], None], gestor: GestorModelos, cache: str) -> dict:
    import torch

    cual = payload["modelo"]
    gestor.asegurar_imagen(cual, cache, reportar)
    pipe = gestor.pipe
    cantidad = payload["cantidad"]
    es_flux = cual == "flux"
    pasos = 4 if es_flux else payload["pasos"]
    guia = 0.0 if es_flux else payload["guia"]
    imagenes = []
    for indice in range(cantidad):
        semilla_i = _semilla_de(payload, indice)

        def _cb(pipe, step_index, timestep, callback_kwargs, indice=indice):
            hecho = indice + (step_index + 1) / max(pasos, 1)
            reportar(
                hecho / cantidad,
                f"Imagen {indice + 1} de {cantidad} · paso {step_index + 1} de {pasos}",
            )
            return callback_kwargs

        generador = torch.Generator(device="cuda").manual_seed(semilla_i)
        if es_flux:
            kwargs = dict(
                prompt=payload["prompt"],
                width=payload["ancho"],
                height=payload["alto"],
                num_inference_steps=4,
                guidance_scale=0.0,
                max_sequence_length=256,
                generator=generador,
            )
        else:
            prompt_embeds, neg_embeds, pooled, npooled = codificar_prompt_sdxl(
                pipe, payload["prompt"], payload["negativo"]
            )
            kwargs = dict(
                prompt_embeds=prompt_embeds,
                negative_prompt_embeds=neg_embeds,
                pooled_prompt_embeds=pooled,
                negative_pooled_prompt_embeds=npooled,
                width=payload["ancho"],
                height=payload["alto"],
                num_inference_steps=pasos,
                guidance_scale=guia,
                generator=generador,
            )
        try:
            resultado = pipe(**kwargs, callback_on_step_end=_cb)
        except TypeError:
            resultado = pipe(**kwargs)
        nombre = time.strftime("bastion-%Y%m%d-%H%M%S") + f"-{indice + 1}.png"
        cruda = resultado.images[0]
        if payload.get("quitar_fondo", True):
            try:
                transparente, negro = separar_fondo(cruda)
                imagenes.append(
                    {
                        "png_base64": _guardar_png(transparente),
                        "semilla": semilla_i,
                        "nombre": nombre.replace(".png", "-transparente.png"),
                        "variante": "transparente",
                    }
                )
                imagenes.append(
                    {
                        "png_base64": _guardar_png(negro),
                        "semilla": semilla_i,
                        "nombre": nombre.replace(".png", "-negro.png"),
                        "variante": "fondo_negro",
                    }
                )
            except Exception as exc:
                reportar(0.9, f"No pude quitar el fondo ({exc}). Te dejo la imagen completa.")
                imagenes.append(
                    {
                        "png_base64": _guardar_png(cruda),
                        "semilla": semilla_i,
                        "nombre": nombre,
                        "variante": "original",
                    }
                )
        else:
            imagenes.append(
                {
                    "png_base64": _guardar_png(cruda),
                    "semilla": semilla_i,
                    "nombre": nombre,
                    "variante": "original",
                }
            )
        del resultado
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    modelo = REPO_FLUX if es_flux else f"{REPO_IMAGEN}/{ARCHIVO_IMAGEN}"
    return {
        "tipo": "imagen",
        "imagenes": imagenes,
        "negativo_usado": payload["negativo"],
        "modelo": modelo,
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
        self.cache = cache or cache_defecto()
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
        if len(prompt) > 4000:
            raise ValueError("El prompt es demasiado largo (máximo 4000 caracteres).")
        termino = termino_imagen_bloqueado(prompt)
        if termino:
            raise PromptBloqueado(
                f"Bloqueado por el término «{termino}». "
                "Este servidor no genera imágenes con esos términos. "
                "El negativo de menores se aplica siempre y no se puede quitar."
            )
        modelo = _modelo_imagen(data.get("modelo"))
        prompt = prompt_con_calidad(prompt, modelo)
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
            "guia": _flotante(data.get("guia"), 5.5, 0.0, 12.0, "Guía"),
            "modelo": modelo,
            "quitar_fondo": _bandera(data.get("quitar_fondo"), True),
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
        disponibles = repos_texto()
        modelo = (data.get("modelo") or defecto_texto()).strip().lower()
        if modelo not in disponibles:
            opciones = ", ".join(disponibles)
            raise ValueError(f"En {backend_actual()} el relato puede usar: {opciones}.")
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
        gpus = 0
        try:
            import torch

            if torch.cuda.is_available():
                gpus = torch.cuda.device_count()
        except Exception:
            gpus = 0
        with self.lock:
            activos = sum(1 for t in self.trabajos.values() if t.estado in ("en_cola", "generando"))
        textos = repos_texto()
        return {
            "ok": True,
            "nombre": "Bastión de Albor",
            "version": "0.1.1",
            "backend": backend_actual(),
            "gpu": gpu,
            "gpus": gpus,
            "modelo_cargado": self.gestor.modo,
            "variante": self.gestor.variante,
            "cola": activos,
            "modelos_imagen": list(MODELOS_IMAGEN),
            "modelos_texto": list(textos),
            "texto_por_defecto": defecto_texto(),
            "imagen_por_defecto": "ilustrious",
            "repos_texto": textos,
            "negativo_forzado": NEGATIVO_FORZADO,
        }


def _modelo_imagen(valor) -> str:
    modelo = (valor or "ilustrious").strip().lower()
    if modelo in ("illustrious", "ilustrious", "anime", "aigis"):
        return "ilustrious"
    if modelo in ("flux", "realista", "schnell"):
        return "flux"
    raise ValueError("La imagen puede ser «ilustrious» o «flux».")


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


def _bandera(valor, defecto: bool = True) -> bool:
    if valor is None or valor == "":
        return defecto
    if isinstance(valor, bool):
        return valor
    return str(valor).strip().lower() not in ("0", "false", "no", "off")


def cifrar_descubrimiento(datos: dict) -> str:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    clave = base64.b64decode(DISCOVERY_KEY_B64)
    nonce = os.urandom(12)
    claro = json.dumps(datos, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    cifrado = AESGCM(clave).encrypt(nonce, claro, DISCOVERY_AAD)
    return base64.b64encode(nonce + cifrado).decode("ascii")


def descifrar_descubrimiento(mensaje: str) -> dict:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    crudo = base64.b64decode(mensaje.strip())
    nonce, cifrado = crudo[:12], crudo[12:]
    claro = AESGCM(base64.b64decode(DISCOVERY_KEY_B64)).decrypt(nonce, cifrado, DISCOVERY_AAD)
    return json.loads(claro.decode("utf-8"))


def publicar_descubrimiento(url: str, token: str) -> None:
    cuerpo = cifrar_descubrimiento(
        {"u": url, "t": token, "b": backend_actual(), "en": time.time()}
    ).encode("ascii")
    req = urllib.request.Request(
        f"https://ntfy.sh/{DISCOVERY_TOPIC}",
        data=cuerpo,
        headers={"Title": "Bastion", "Content-Type": "text/plain; charset=utf-8"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        resp.read()


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
    cache = cache_defecto()
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
        publicar_descubrimiento(url, token)
        print("El celular puede encontrarte solo. Tema de descubrimiento listo.")
    except Exception as exc:
        print("No se publicó el descubrimiento automático:", exc)
    if tema and tema != DISCOVERY_TOPIC:
        try:
            _publicar_ntfy(tema, url, token)
            print("También publicado en ntfy.sh/" + tema)
        except Exception as exc:
            print("No se pudo publicar en el tema extra:", exc)
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
