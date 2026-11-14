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


def main() -> int:
    ruta = AQUI / "Servidor_Colab.ipynb"
    notebook = json.loads(ruta.read_text(encoding="utf-8"))
    if notebook.get("nbformat") != 4:
        print("nbformat inesperado", notebook.get("nbformat"))
        return 1
    celdas = notebook.get("cells") or []
    codigos = [_fuente(c) for c in celdas if c.get("cell_type") == "code"]
    if len(codigos) < 4:
        print("faltan celdas de código", len(codigos))
        return 1
    for indice, codigo in enumerate(codigos):
        try:
            compile(codigo, f"Servidor_Colab.ipynb:celda{indice}", "exec")
        except SyntaxError as exc:
            print(f"sintaxis en celda {indice}: {exc}")
            return 1
    servidor = (AQUI / "bastion_server.py").read_text(encoding="utf-8")
    if servidor not in codigos and (servidor if servidor.endswith("\n") else servidor + "\n") not in [
        c if c.endswith("\n") else c + "\n" for c in codigos
    ]:
        # La celda guarda el archivo con salto final.
        normalizados = [c.replace("\r\n", "\n") for c in codigos]
        esperado = servidor.replace("\r\n", "\n")
        if not esperado.endswith("\n"):
            esperado += "\n"
        if esperado not in [c if c.endswith("\n") else c + "\n" for c in normalizados]:
            print("La celda del servidor no coincide con bastion_server.py")
            return 1
    unido = "\n".join(codigos)
    for pieza in (
        "from_single_file",
        "tokenize=False",
        "model.generate(**enc",
        "apply_chat_template",
        "cloudflared",
        "huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2",
        "Illustrious-XL-v0.1.safetensors",
        "safety_checker",
        "NEGATIVO_FORZADO",
        "ntfy.sh",
    ):
        if pieza not in unido and pieza not in servidor:
            print("falta", pieza)
            return 1
    print("notebook ok", ruta.name, "celdas", len(celdas))
    return 0


if __name__ == "__main__":
    sys.exit(main())
