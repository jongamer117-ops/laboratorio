"""Valida que el notebook sea JSON, que sus celdas compilen y que el servidor coincida."""

from __future__ import annotations

import json
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent


def _fuente(celda: dict) -> str:
    source = celda.get("source", "")
    if isinstance(source, list):
        return "".join(source)
    return source


def _validar(ruta: Path, servidor: str, piezas_extra: tuple[str, ...]) -> int:
    notebook = json.loads(ruta.read_text(encoding="utf-8"))
    if notebook.get("nbformat") != 4:
        print("nbformat inesperado", ruta.name, notebook.get("nbformat"))
        return 1
    celdas = notebook.get("cells") or []
    codigos = [_fuente(c) for c in celdas if c.get("cell_type") == "code"]
    if len(codigos) < 4:
        print("faltan celdas de código", ruta.name, len(codigos))
        return 1
    for indice, codigo in enumerate(codigos):
        try:
            compile(codigo, f"{ruta.name}:celda{indice}", "exec")
        except SyntaxError as exc:
            print(f"sintaxis en {ruta.name} celda {indice}: {exc}")
            return 1
    normalizados = [c.replace("\r\n", "\n") for c in codigos]
    esperado = servidor.replace("\r\n", "\n")
    if not esperado.endswith("\n"):
        esperado += "\n"
    if esperado not in [c if c.endswith("\n") else c + "\n" for c in normalizados]:
        print("La celda del servidor no coincide", ruta.name)
        return 1
    unido = "\n".join(codigos) + "\n" + servidor
    for pieza in piezas_extra:
        if pieza not in unido:
            print("falta", pieza, "en", ruta.name)
            return 1
    if "enable_vae_tiling" in servidor or "compel" in servidor:
        print("el servidor no debe usar compel ni enable_vae_tiling")
        return 1
    if "Qwen/Qwen2.5-7B-Instruct\"" in servidor:
        print("el Qwen oficial no debe estar")
        return 1
    print("notebook ok", ruta.name, "celdas", len(celdas))
    return 0


def main() -> int:
    servidor = (AQUI / "bastion_server.py").read_text(encoding="utf-8")
    comunes = (
        "from_single_file",
        "tokenize=False",
        "model.generate(**enc",
        "apply_chat_template",
        "cloudflared",
        "huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2",
        "huihui-ai/Qwen2.5-32B-Instruct-abliterated",
        "sci4ai/Qwen2.5-14B-Instruct-Abliterated",
        "black-forest-labs/FLUX.1-schnell",
        "Illustrious-XL-v0.1.safetensors",
        "vae.enable_tiling",
        "max_sequence_length",
        "trocear_ids",
        "safety_checker",
        "NEGATIVO_FORZADO",
        "ntfy.sh",
    )
    if _validar(AQUI / "Servidor_Colab.ipynb", servidor, comunes + ("google.colab", "BASTION_BACKEND")):
        return 1
    kaggle = AQUI / "Servidor_Kaggle.ipynb"
    if _validar(kaggle, servidor, comunes + ("/kaggle/working", "BASTION_BACKEND")):
        return 1
    texto_kaggle = kaggle.read_text(encoding="utf-8")
    if "from google.colab" in texto_kaggle:
        print("el notebook de Kaggle no debe importar google.colab")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
