"""El lanzador sigue siendo Python válido cuando la app sustituye los marcadores."""
import base64
import pathlib
import unittest

LANZADOR = (pathlib.Path(__file__).resolve().parent / "kaggle" / "lanzador.py").read_text(encoding="utf-8")


class LanzadorTests(unittest.TestCase):
    def test_compila_con_el_pedido_incrustado(self):
        servidor = base64.b64encode(b"print('servidor')\n").decode("ascii")
        pedido = base64.b64encode(b'{"tipo":"imagen","prompt":"un caballero"}').decode("ascii")
        texto = (
            LANZADOR.replace("__MODO__", "imagen")
            .replace("__IDLE__", "15")
            .replace("__PEDIDO_B64__", pedido)
            .replace("__SERVIDOR_B64__", servidor)
        )
        self.assertNotIn("__MODO__", texto)
        compile(texto, "lanzador.py", "exec")
        self.assertIn("ejecutar_lote_imagen", texto)
        self.assertIn("arrancar", texto)


if __name__ == "__main__":
    unittest.main()
