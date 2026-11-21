"""Kernel de Kaggle. La app sustituye __MODO__, __IDLE__, __PEDIDO_B64__ y __SERVIDOR_B64__."""
import base64
import json
import os
import pathlib
import subprocess
import sys

MODO = "__MODO__"
IDLE = __IDLE__
PEDIDO_B64 = "__PEDIDO_B64__"
SERVIDOR_B64 = "__SERVIDOR_B64__"
CONSTRAINTS = """
numpy==1.26.4
torch==2.4.1
pillow==10.4.0
scipy==1.13.1
scikit-image==0.24.0
opencv-python-headless==4.10.0.84
"""


def main() -> None:
    raiz = pathlib.Path("/kaggle/working")
    raiz.mkdir(parents=True, exist_ok=True)
    (raiz / "constraints.txt").write_text(CONSTRAINTS.strip() + "\n", encoding="utf-8")
    paquetes = [
        "diffusers>=0.32",
        "transformers>=4.46",
        "accelerate>=1.1",
        "bitsandbytes>=0.44",
        "safetensors",
        "huggingface_hub",
        "flask>=3.0",
        "pillow",
        "cryptography",
        "rembg",
        "onnxruntime",
        "qrcode[pil]",
    ]
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "-q", "-c", str(raiz / "constraints.txt"), *paquetes]
    )
    (raiz / "bastion_server.py").write_bytes(base64.b64decode(SERVIDOR_B64))
    sys.path.insert(0, str(raiz))
    os.environ["BASTION_BACKEND"] = "kaggle"
    os.environ["BASTION_CACHE"] = "/tmp/bastion-modelos"
    os.environ["BASTION_IDLE_MINUTES"] = str(IDLE if MODO == "sesion" else 0)
    import bastion_server as srv

    if MODO == "sesion":
        srv.arrancar()
        return
    pedido = json.loads(base64.b64decode(PEDIDO_B64))
    if MODO == "imagen":
        srv.ejecutar_lote_imagen(pedido)
    else:
        srv.ejecutar_lote_historia(pedido)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("BASTION_ERROR:", exc, flush=True)
        raise
