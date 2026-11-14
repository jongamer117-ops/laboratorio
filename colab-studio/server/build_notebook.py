"""Genera Servidor_Colab.ipynb a partir de bastion_server.py para que no se desfasen."""

from __future__ import annotations

import json
from pathlib import Path

AQUI = Path(__file__).resolve().parent
SERVIDOR = (AQUI / "bastion_server.py").read_text(encoding="utf-8")


def celda_md(texto: str) -> dict:
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [linea + "\n" for linea in texto.strip("\n").split("\n")],
    }


def celda_codigo(texto: str) -> dict:
    lineas = texto.strip("\n").split("\n")
    source = [linea + "\n" for linea in lineas[:-1]]
    source.append(lineas[-1] + "\n")
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": source,
    }


INTRO = """
# Bastión de Albor — servidor en Colab

App personal de Jonathan. Este notebook enciende un API en la GPU **T4 gratuita**, lo publica con un túnel de Cloudflare (sin cuenta) y enseña un **código QR** para el celular. También avisa a un tema de [ntfy.sh](https://ntfy.sh).

## Antes de ejecutar

1. **Entorno de ejecución → Cambiar tipo de entorno de ejecución → T4 GPU.**
2. Arriba, en la celda de configuración, deja el tema ntfy vacío (se crea uno secreto) o pega el mismo tema que guardaste en la app.
3. **Entorno de ejecución → Ejecutar todo.** La primera vez descarga Illustrious y Qwen: con Drive montado, las siguientes sesiones reutilizan los archivos.
4. Espera el QR. En el celular: Ajustes → escanear, o «Buscar en ntfy» si ya guardaste el tema.
5. Deja esta pestaña abierta. Si se corta, vuelve a ejecutar: la URL del túnel cambia.

## Qué hace

- **Imagen:** `OnomaAIResearch/Illustrious-xl-early-release-v0` / `Illustrious-XL-v0.1.safetensors` con diffusers `from_single_file`, fp16. Sin filtro NSFW extra.
- **Texto, por defecto:** `huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2` en 4-bit. Opción: `Qwen/Qwen2.5-7B-Instruct`.
- Solo un modelo en la GPU. Al cambiar, el otro se descarga de la memoria.
- Trabajos: `POST /api/trabajos` → `GET /api/trabajos/{id}` → `GET /api/trabajos/{id}/resultado`.
- Bloqueo fijo de menores en imágenes (no se puede quitar): rechaza el prompt y siempre añade `child, loli, shota, young, underage` al negativo.

Los límites de Colab, del túnel, de ntfy y de la T4 están en el README del repo (`colab-studio/README.md`). Esto es para uso personal: las condiciones de Colab gratuito no están pensadas para un servidor público.
"""

CONFIG = '''
# === Configura esto y luego ejecuta todo ===
NTFY_TOPIC = ""  # vacío = tema secreto nuevo. Cópialo a la app la primera vez.
USAR_GOOGLE_DRIVE = True  # guarda los pesos en tu Drive para no bajarlos cada sesión

import os
import secrets

tema = (NTFY_TOPIC or "").strip()
if not tema:
    tema = "bastion-" + secrets.token_hex(8)
os.environ["BASTION_NTFY_TOPIC"] = tema
os.environ["BASTION_USAR_DRIVE"] = "1" if USAR_GOOGLE_DRIVE else "0"
print("Tema ntfy (guárdalo en la app):", tema)
print("Drive:", "sí" if USAR_GOOGLE_DRIVE else "no, se usa el disco de la sesión")
'''

INSTALAR = '''
import subprocess
import sys

paquetes = [
    "diffusers>=0.32",
    "transformers>=4.46",
    "accelerate>=1.1",
    "bitsandbytes>=0.44",
    "safetensors",
    "huggingface_hub",
    "qrcode[pil]",
    "flask>=3.0",
    "pillow",
]
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", *paquetes])
print("Paquetes listos. Torch se deja como viene en Colab para no romper CUDA.")
'''

DRIVE = '''
import os

cache = "/content/bastion-modelos"
if os.environ.get("BASTION_USAR_DRIVE") == "1":
    try:
        from google.colab import drive

        drive.mount("/content/drive")
        cache = "/content/drive/MyDrive/BastionAlbor/modelos"
        print("Modelos en Drive:", cache)
    except Exception as exc:
        print("No se montó Drive. Se usa el disco de esta sesión (se borra al cerrar):", exc)
else:
    print("Drive desactivado. Los modelos se bajan de nuevo cada sesión.")
os.makedirs(cache, exist_ok=True)
os.environ["BASTION_CACHE"] = cache
'''

ARRANQUE = '''
# La celda anterior definió el servidor. Esta lo enciende y no termina:
# así Colab mantiene la sesión mientras el celular genera.
arrancar()
'''


def construir() -> dict:
    codigo_servidor = SERVIDOR if SERVIDOR.endswith("\n") else SERVIDOR + "\n"
    return {
        "nbformat": 4,
        "nbformat_minor": 5,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "pygments_lexer": "ipython3"},
            "accelerator": "GPU",
            "colab": {"provenance": [], "gpuType": "T4"},
        },
        "cells": [
            celda_md(INTRO),
            celda_codigo(CONFIG),
            celda_codigo(INSTALAR),
            celda_codigo(DRIVE),
            celda_md(
                "## Servidor\n\n"
                "Esta celda es `bastion_server.py`. No la edites a mano: "
                "cámbiala en el archivo y vuelve a generar el notebook."
            ),
            celda_codigo(codigo_servidor),
            celda_md("## Encender\n\nCuando aparezca el QR, escanéalo con la app. Esta celda se queda corriendo."),
            celda_codigo(ARRANQUE),
        ],
    }


def main() -> None:
    destino = AQUI / "Servidor_Colab.ipynb"
    destino.write_text(json.dumps(construir(), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Escrito", destino)


if __name__ == "__main__":
    main()
