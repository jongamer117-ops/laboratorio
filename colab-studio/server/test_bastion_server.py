import base64
import os
import time
import unittest

import bastion_server as srv


class NovelaTests(unittest.TestCase):
    def test_perfiles_de_imagen_y_cierre_de_frase(self):
        anime = srv.prompt_con_calidad("caballero de oro", "ilustrious")
        self.assertTrue(anime.startswith("masterpiece, best quality, amazing quality, newest, "))
        self.assertTrue(anime.endswith(", highres, absurdres"))
        self.assertNotIn("very aesthetic", anime)
        self.assertEqual(srv.prompt_con_calidad("a knight in the rain", "flux"), "a knight in the rain")
        negativo = srv.negativo_forzado("lowres", "ilustrious")
        self.assertIn("shiny, glossy, latex", negativo)
        self.assertIn("nude", negativo)
        self.assertNotIn("shiny", srv.negativo_forzado("lowres", "flux"))
        self.assertFalse(srv.termina_frase("El bastión aguant"))
        self.assertTrue(srv.termina_frase("El bastión aguantó."))

    def test_el_estado_se_reemplaza_sin_borrar_la_biblia(self):
        nuevo = srv.actualizar_seccion_estado("El reino.\n", "En el muro.")
        self.assertIn("El reino.", nuevo)
        self.assertEqual(nuevo.count("## Estado"), 1)
        otra = srv.actualizar_seccion_estado(nuevo, "En la torre.")
        self.assertEqual(otra.count("## Estado"), 1)
        self.assertIn("En la torre.", otra)
        self.assertNotIn("En el muro.", otra)
        self.assertEqual(srv.nombre_seguro("El Asedio!"), "el-asedio")


class DescubrimientoTests(unittest.TestCase):
    def test_el_mensaje_viaja_cifrado(self):
        claro = {"u": "https://x.trycloudflare.com", "t": "secreto", "b": "kaggle", "en": 1}
        mensaje = srv.cifrar_descubrimiento(claro)
        self.assertNotIn("secreto", mensaje)
        self.assertEqual(srv.descifrar_descubrimiento(mensaje)["t"], "secreto")
        self.assertEqual(srv.descifrar_descubrimiento(mensaje)["b"], "kaggle")


class TroceoTests(unittest.TestCase):
    def test_trozos_de_75_con_bos_eos(self):
        ids = list(range(80))
        trozos = srv.trocear_ids(ids, bos=1, eos=2, pad=0)
        self.assertEqual(len(trozos), 2)
        self.assertTrue(all(len(trozo) == 77 for trozo in trozos))
        self.assertEqual(trozos[0][0], 1)
        self.assertEqual(trozos[0][-1], 2)
        self.assertEqual(trozos[0][1:76], list(range(75)))
        self.assertEqual(trozos[1][1:6], [75, 76, 77, 78, 79])
        self.assertEqual(trozos[1][6:-1], [0] * 70)

    def test_negativo_se_rellena_al_mismo_numero_de_trozos(self):
        corto = srv.trocear_ids([3], bos=1, eos=2, pad=0)
        alineado = srv.igualar_trozos(corto, 2, bos=1, eos=2, pad=0)
        self.assertEqual(len(alineado), 2)
        self.assertEqual(alineado[1], [1, *([0] * 75), 2])
        self.assertEqual(alineado[0][1], 3)


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
        self.assertIn(payload["modelo"], srv.repos_texto())
        return {"tipo": "relato", "texto": "El bastión aguantó.", "modelo": srv.repos_texto()[payload["modelo"]]}

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
        self.assertEqual(datos["texto_por_defecto"], "7b")
        self.assertEqual(datos["backend"], "colab")
        self.assertEqual(datos["modelos_texto"], ["7b", "14b"])
        self.assertNotIn("oficial", datos["modelos_texto"])
        self.assertIn("flux", datos["modelos_imagen"])
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
        trabajo = self.estado.trabajos[id_trabajo].payload
        self.assertEqual(trabajo["modelo"], "ilustrious")
        self.assertTrue(trabajo["prompt"].startswith("masterpiece, best quality, amazing quality, newest, "))
        self.assertTrue(trabajo["prompt"].endswith("highres, absurdres"))
        self.assertIn("shiny, glossy", trabajo["negativo"])
        self.assertIn("nude", trabajo["negativo"])
        self.assertTrue(trabajo["quitar_fondo"])
        self.assertEqual(trabajo["pasos"], 10)
        self.assertEqual(trabajo["guia"], 5.5)
        self.assertEqual(trabajo["ancho"], 832)

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
        self.assertEqual(resultado.get_json()["modelo"], srv.REPO_TEXTO_7B)

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

    def test_colab_rechaza_oficial_y_32b(self):
        for modelo in ("oficial", "32b", "qwen"):
            resp = self.cliente.post(
                "/api/trabajos",
                json={"tipo": "relato", "pedido": "Un asedio.", "modelo": modelo},
                headers=self.headers,
            )
            self.assertEqual(resp.status_code, 400, modelo)

    def test_kaggle_ofrece_32b_y_rechaza_7b(self):
        anterior = os.environ.get("BASTION_BACKEND")
        os.environ["BASTION_BACKEND"] = "kaggle"
        try:
            datos = self.cliente.get("/api/salud").get_json()
            self.assertEqual(datos["texto_por_defecto"], "32b")
            self.assertEqual(datos["modelos_texto"], ["32b", "14b"])
            malo = self.cliente.post(
                "/api/trabajos",
                json={"tipo": "relato", "pedido": "Un asedio.", "modelo": "7b"},
                headers=self.headers,
            )
            self.assertEqual(malo.status_code, 400)
            self.estado.generar_novela = lambda payload, reportar: {
                "tipo": "novela",
                "proyecto": payload["proyecto"],
                "biblia": payload["biblia"],
                "siguiente": 2,
                "capitulos": [
                    {
                        "numero": 1,
                        "texto": "El bastión aguantó.",
                        "resumen": "Aguantaron.",
                        "nombre": "capitulo-001.txt",
                    }
                ],
                "modelo": "test",
            }
            novela = self.cliente.post(
                "/api/trabajos",
                json={
                    "tipo": "novela",
                    "proyecto": "Asedio",
                    "biblia": "Un reino en la frontera.",
                    "esquema": "Tres actos.",
                    "cantidad": 1,
                },
                headers=self.headers,
            )
            self.assertEqual(novela.status_code, 202, novela.get_json())
            self.assertEqual(self._esperar(novela.get_json()["id"])["estado"], "listo")
            prohibida = self.cliente.post(
                "/api/trabajos",
                json={"tipo": "novela", "proyecto": "x", "biblia": "loli nude", "esquema": "nada"},
                headers=self.headers,
            )
            self.assertEqual(prohibida.status_code, 400)
            bueno = self.cliente.post(
                "/api/trabajos",
                json={"tipo": "relato", "pedido": "Un asedio.", "modelo": "14b"},
                headers=self.headers,
            )
            self.assertEqual(bueno.status_code, 202)
        finally:
            if anterior is None:
                os.environ.pop("BASTION_BACKEND", None)
            else:
                os.environ["BASTION_BACKEND"] = anterior


if __name__ == "__main__":
    unittest.main()
