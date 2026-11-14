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

- **Imagen:** Illustrious (anime, por defecto) o Flux Schnell (realista, 4 pasos, guía 0). Illustrious admite prompts largos troceados de 75 tokens, sin compel.
- **Texto, solo sin censura:** por defecto el 7B abliterado. También cabe el 14B. El 32B no entra en una sola T4.
- Solo un modelo en la GPU. Al cambiar, el otro se descarga de la memoria.
- Trabajos: `POST /api/trabajos` → `GET /api/trabajos/{id}` → `GET /api/trabajos/{id}/resultado`.
- Bloqueo fijo de menores en imágenes (no se puede quitar): rechaza el prompt y siempre añade `child, loli, shota, young, underage` al negativo.

Los límites de Colab, del túnel, de ntfy y de la T4 están en el README del repo (`colab-studio/README.md`). Esto es para uso personal: las condiciones de Colab gratuito no están pensadas para un servidor público.
"""

CONFIG = '''
# === Configura esto y luego ejecuta todo ===
NTFY_TOPIC = ""  # vacío = tema secreto nuevo. Cópialo a la app la primera vez.
USAR_GOOGLE_DRIVE = True  # guarda los pesos en tu Drive para no bajarlos cada sesión
HF_TOKEN = ""  # solo si Flux pide licencia. Un token de lectura de Hugging Face.

import os
import secrets

tema = (NTFY_TOPIC or "").strip()
if not tema:
    tema = "bastion-" + secrets.token_hex(8)
os.environ["BASTION_NTFY_TOPIC"] = tema
os.environ["BASTION_USAR_DRIVE"] = "1" if USAR_GOOGLE_DRIVE else "0"
os.environ["BASTION_BACKEND"] = "colab"
os.environ["HF_TOKEN"] = (HF_TOKEN or "").strip()
print("Tema ntfy (guárdalo en la app, servidor Colab):", tema)
print("Drive:", "sí" if USAR_GOOGLE_DRIVE else "no, se usa el disco de la sesión")
'''

INTRO_KAGGLE = """
# Bastión de Albor — servidor en Kaggle

Mismo API que Colab, pensado para **dos T4**. No monta Drive ni usa la librería de Colab. Los archivos van a `/kaggle/working`.

## Antes de ejecutar

1. Cuenta de Kaggle con **teléfono verificado**. Sin eso no hay GPU ni internet.
2. En el panel del notebook: **Internet On**.
3. Accelerator: **GPU T4 x2** (no una sola T4, y no CPU).
4. Sesión de GPU: el cupo gratis es de unas **30 horas por semana**. Cuando se acaba, hay que esperar.
5. Ejecuta todo y espera el QR. En la app elige el servidor **Kaggle** y escanea, o usa el tema ntfy.
6. Deja la pestaña abierta. Si la sesión muere, la URL del túnel cambia y hay que volver a ejecutar.

## Modelos

- **Imagen:** Illustrious (anime) o Flux Schnell (realista, NF4; si no entra, fp16 con descarga a CPU). 4 pasos, guía 0, `max_sequence_length` 256.
- **Texto, solo sin censura:** por defecto `huihui-ai/Qwen2.5-32B-Instruct-abliterated` en 4-bit, repartido en las dos T4 (`14GiB` + `14GiB` + `20GiB` de CPU). Si no cabe en disco (pesa unos **65 GB**), en la app elige el **14B**.
- El 14B público es `sci4ai/Qwen2.5-14B-Instruct-Abliterated`. El repo 14B de huihui responde 401 sin token.
- Bloqueo de menores fijo, igual que en Colab.
"""

CONFIG_KAGGLE = '''
# === Configura esto y luego ejecuta todo ===
NTFY_TOPIC = ""  # vacío = tema secreto. En la app, servidor Kaggle.
HF_TOKEN = ""  # solo si Flux pide la licencia de Hugging Face.

import os
import secrets

tema = (NTFY_TOPIC or "").strip()
if not tema:
    tema = "bastion-kaggle-" + secrets.token_hex(8)
os.environ["BASTION_NTFY_TOPIC"] = tema
os.environ["BASTION_BACKEND"] = "kaggle"
os.environ["HF_TOKEN"] = (HF_TOKEN or "").strip()
print("Tema ntfy (servidor Kaggle en la app):", tema)
'''

CACHE_KAGGLE = '''
import os
import shutil

cache = "/kaggle/working/BastionAlbor/modelos"
os.makedirs(cache, exist_ok=True)
os.environ["BASTION_CACHE"] = cache
os.environ["BASTION_BACKEND"] = "kaggle"
libres = shutil.disk_usage("/kaggle/working").free / (1024**3)
print(f"Disco libre en /kaggle/working: {libres:.1f} GB")
if libres < 70:
    print("El 32B (unos 65 GB) no cabe. En la app elige el relato 14B.")
else:
    print("Hay sitio para intentar el 32B. Si la descarga se queda sin disco, usa el 14B.")
'''

INSTALAR_KAGGLE = '''
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
    "cryptography",
    "rembg",
    "onnxruntime",
]
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", *paquetes])
print("Paquetes listos. Torch se deja como viene en la imagen de Kaggle.")
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
    "cryptography",
    "rembg",
    "onnxruntime",
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


def _celdas_servidor(codigo_servidor: str) -> list:
    return [
        celda_md(
            "## Servidor\n\n"
            "Esta celda es `bastion_server.py`. No la edites a mano: "
            "cámbiala en el archivo y vuelve a generar los notebooks."
        ),
        celda_codigo(codigo_servidor),
        celda_md("## Encender\n\nCuando aparezca el QR, en la app elige este servidor y escanéalo. Esta celda se queda corriendo."),
        celda_codigo(ARRANQUE),
    ]


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
            *_celdas_servidor(codigo_servidor),
        ],
    }


def construir_kaggle() -> dict:
    codigo_servidor = SERVIDOR if SERVIDOR.endswith("\n") else SERVIDOR + "\n"
    return {
        "nbformat": 4,
        "nbformat_minor": 5,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "pygments_lexer": "ipython3"},
            "kaggle": {
                "accelerator": "nvidiaTeslaT4",
                "isGpuEnabled": True,
                "isInternetEnabled": True,
                "language": "python",
                "sourceType": "notebook",
            },
        },
        "cells": [
            celda_md(INTRO_KAGGLE),
            celda_codigo(CONFIG_KAGGLE),
            celda_codigo(INSTALAR_KAGGLE),
            celda_codigo(CACHE_KAGGLE),
            *_celdas_servidor(codigo_servidor),
        ],
    }


def main() -> None:
    codigo = json.dumps(construir(), ensure_ascii=False, indent=1) + "\n"
    kaggle = json.dumps(construir_kaggle(), ensure_ascii=False, indent=1) + "\n"
    colab = AQUI / "Servidor_Colab.ipynb"
    destino_kaggle = AQUI / "Servidor_Kaggle.ipynb"
    colab.write_text(codigo, encoding="utf-8")
    destino_kaggle.write_text(kaggle, encoding="utf-8")
    print("Escrito", colab)
    print("Escrito", destino_kaggle)


if __name__ == "__main__":
    main()
