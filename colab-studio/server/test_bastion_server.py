import base64
import time
import unittest

import bastion_server as srv


class FiltroTests(unittest.TestCase):
    def test_bloquea_terminos_del_dueno_y_evasiones(self):
        for prompt in (
            "a child in armor",
            "loli portrait",
            "shota",
            "Young knight",
            "underage",
            "l0li",
            "l.o.l.i",
            "niño",
            "nina pequena",
        ):
            self.assertIsNotNone(srv.termino_imagen_bloqueado(prompt), prompt)

    def test_permite_un_caballero_adulto(self):
        self.assertIsNone(srv.termino_imagen_bloqueado("masterpiece, knight in gold armor, black background"))

    def test_negativo_no_se_puede_quitar(self):
        for base in ("", "lowres, bad hands", "young"):
            negativo = srv.negativo_forzado(base)
            for termino in ("child", "loli", "shota", "young", "underage"):
                self.assertIn(termino, negativo)

    def test_relato_permite_herencia_y_bloquea_mezcla(self):
        self.assertIsNone(srv.relato_bloqueado("Cronista", "El hijo del rey defiende el bastión."))
        self.assertIsNone(srv.relato_bloqueado("", "A young knight holds the gate."))
        self.assertIsNotNone(srv.relato_bloqueado("", "loli nude portrait story"))
        self.assertIsNotNone(srv.relato_bloqueado("escribe nsfw", "un niño"))


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.estado = srv.Estado(token="secreto", cache="/tmp/bastion-test-cache")
        self.estado.generar_imagen = self._imagen_falsa
        self.estado.generar_relato = self._relato_falso
        self.estado.iniciar()
        self.cliente = srv.create_app(self.estado).test_client()
        self.headers = {"Authorization": "Bearer secreto"}

    def _imagen_falsa(self, payload, reportar):
        reportar(0.5, "Paso 1 de 1")
        self.assertIn("child", payload["negativo"])
        self.assertIn("loli", payload["negativo"])
        png = base64.b64encode(b"\x89PNG\r\n").decode("ascii")
        return {
            "tipo": "imagen",
            "imagenes": [{"png_base64": png, "semilla": 7, "nombre": "x.png"}],
            "negativo_usado": payload["negativo"],
            "modelo": "test",
        }

    def _relato_falso(self, payload, reportar):
        reportar(0.4, "Escribiendo…")
        self.assertEqual(payload["modelo"], "abliterado")
        return {"tipo": "relato", "texto": "El bastión aguantó.", "modelo": srv.REPO_TEXTO_ABLIT}

    def _esperar(self, id_trabajo):
        ultimo = None
        for _ in range(50):
            resp = self.cliente.get(f"/api/trabajos/{id_trabajo}", headers=self.headers)
            ultimo = resp.get_json()
            if ultimo["estado"] in ("listo", "error"):
                return ultimo
            time.sleep(0.02)
        self.fail(f"el trabajo no terminó: {ultimo}")

    def test_salud_sin_token(self):
        datos = self.cliente.get("/api/salud").get_json()
        self.assertTrue(datos["ok"])
        self.assertEqual(datos["texto_por_defecto"], srv.REPO_TEXTO_ABLIT)
        self.assertIn("young", datos["negativo_forzado"])

    def test_rechaza_token(self):
        resp = self.cliente.post("/api/trabajos", json={"tipo": "imagen", "prompt": "knight"})
        self.assertEqual(resp.status_code, 401)

    def test_rechaza_menor_antes_de_encolar(self):
        resp = self.cliente.post(
            "/api/trabajos",
            json={"tipo": "imagen", "prompt": "a loli knight"},
            headers=self.headers,
        )
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.get_json()["error"], "prompt_bloqueado")

    def test_trabajo_de_imagen(self):
        resp = self.cliente.post(
            "/api/trabajos",
            json={
                "tipo": "imagen",
                "prompt": "masterpiece, knight, black background",
                "negativo": "lowres",
                "ancho": 832,
                "alto": 1216,
                "cantidad": 1,
                "pasos": 10,
                "guia": 5.5,
            },
            headers=self.headers,
        )
        self.assertEqual(resp.status_code, 202)
        id_trabajo = resp.get_json()["id"]
        estado = self._esperar(id_trabajo)
        self.assertEqual(estado["estado"], "listo")
        resultado = self.cliente.get(f"/api/trabajos/{id_trabajo}/resultado", headers=self.headers)
        self.assertEqual(resultado.status_code, 200)
        cuerpo = resultado.get_json()
        self.assertEqual(cuerpo["imagenes"][0]["semilla"], 7)
        self.assertIn("underage", cuerpo["negativo_usado"])

    def test_trabajo_de_relato_abliterado_por_defecto(self):
        resp = self.cliente.post(
            "/api/trabajos",
            json={"tipo": "relato", "pedido": "Cuenta el asedio del bastión.", "largo": 200, "creatividad": 0.7},
            headers=self.headers,
        )
        self.assertEqual(resp.status_code, 202)
        estado = self._esperar(resp.get_json()["id"])
        self.assertEqual(estado["estado"], "listo")
        resultado = self.cliente.get(
            f"/api/trabajos/{resp.get_json()['id']}/resultado",
            headers=self.headers,
        )
        self.assertIn("bastión", resultado.get_json()["texto"])
        self.assertEqual(resultado.get_json()["modelo"], srv.REPO_TEXTO_ABLIT)

    def test_resultado_antes_de_tiempo(self):
        self.estado.generar_relato = lambda payload, reportar: time.sleep(0.3) or {"tipo": "relato", "texto": "x", "modelo": "m"}
        resp = self.cliente.post(
            "/api/trabajos",
            json={"tipo": "relato", "pedido": "Una frase."},
            headers=self.headers,
        )
        id_trabajo = resp.get_json()["id"]
        pronto = self.cliente.get(f"/api/trabajos/{id_trabajo}/resultado", headers=self.headers)
        self.assertIn(pronto.status_code, (409, 200))


if __name__ == "__main__":
    unittest.main()
