# Bastión de Albor — estudio en el celular

App personal de Jonathan para generar retratos y relatos de **Bastión de Albor** (defensa de torres, fantasía medieval, aire de Millennium War Aigis) con la **GPU T4 gratuita de Google Colab**. No usa APIs de pago.

La app vive en el teléfono. El notebook, abierto en Colab, es el servidor. Se hablan por un túnel de Cloudflare que no pide cuenta.

El motor de historias de `webapp/` no se toca. Todo esto está en `colab-studio/`.

## Cómo usarlo

### 1. Instalar la app

1. Entra a [Releases](https://github.com/jongamer117-ops/laboratorio/releases) de este repositorio.
2. Baja el APK `BastionAlbor-v0.1.2.apk`.
3. En el celular, abre el archivo. Android pide permiso para instalar apps de este origen: acéptalo.
4. A partir de 0.1.2 la firma es fija, así que la siguiente versión se instala encima. La 0.1.1 salió con una llave de depuración distinta: si esa está instalada, hay que desinstalarla una sola vez.

La app también puede buscar una versión nueva en Ajustes → Buscar actualización, bajar el APK y abrir el instalador.

### 2. Encender el servidor

1. Abre [`server/Servidor_Colab.ipynb`](server/Servidor_Colab.ipynb) en Colab (Archivo → Abrir notebook, o el botón de GitHub).
2. **Entorno de ejecución → Cambiar tipo de entorno de ejecución → T4 GPU.**
3. En la primera celda de código, deja `NTFY_TOPIC` vacío la primera vez (se crea un tema secreto) o pega el tema que ya guardaste en la app. `USAR_GOOGLE_DRIVE = True` guarda los pesos en tu Drive para no bajarlos en cada sesión.
4. **Entorno de ejecución → Ejecutar todo.**
5. Acepta el acceso a Drive si lo pediste. La primera vez descarga Illustrious (~6–7 GB) y Qwen (~5 GB en 4-bit). Con Drive, las siguientes sesiones reutilizan esos archivos.
6. Espera el **código QR**, la URL y el token. Deja esa pestaña abierta.

### 3. Conectar el celular

En la app, Ajustes:

- **Escanear QR** (lo más simple), o
- pegar la URL y el token a mano, o
- escribir el tema ntfy y tocar **Buscar en ntfy**.

No hace falta escanear el QR. Los dos notebooks publican la URL cifrada en un canal fijo de ntfy y la app la toma sola al abrirse y antes de cada pedido. Si Kaggle y Colab están vivos, usa Kaggle. Si todavía no hay notebook, verás «Esperando al notebook…». La URL y el token a mano quedan en Ajustes → Avanzado.

La primera imagen o el primer relato tardan más: el modelo se carga en la GPU. Después, dentro de la misma sesión, va más rápido. Si cambias de imagen a texto (o al revés), el servidor suelta el modelo anterior para no quedarse sin memoria.

### Kaggle, si quieres dos T4

1. Verifica el teléfono en la cuenta de Kaggle. Sin eso no hay GPU ni internet.
2. Nuevo notebook → pega o sube [`server/Servidor_Kaggle.ipynb`](server/Servidor_Kaggle.ipynb).
3. En Settings del notebook: **Internet On** y Accelerator **GPU T4 x2**.
4. Ejecuta todo. El cupo gratis es de unas **30 horas de GPU por semana**.
5. En la app elige **Kaggle**, escanea el QR y prueba la conexión.

Kaggle no monta Drive. Los pesos quedan en `/kaggle/working` y se borran al cerrar la sesión.

## Qué genera

**Imagen.** Por defecto Illustrious XL v2.0 (`OnomaAIResearch/Illustrious-XL-v2.0`, archivo `Illustrious-XL-v2.0.safetensors`, `from_single_file`, fp16). Euler ancestral sin Karras, 28 pasos, guía 4.5, 832×1216. El clip skip es el penúltimo estado oculto (`hidden_states[-2]`); no se pasa `clip_skip=2`. El servidor antepone `masterpiece, best quality, amazing quality, newest` y cierra con `highres, absurdres`. Los prompts largos se trocean a 75 tokens por encoder, con BOS y EOS, y el pooled de `text_encoder_2` del primer trozo. El negativo de anime añade `shiny, glossy, latex, plastic, specular highlight, oversaturated, high contrast, extra fingers, missing fingers, fused fingers, poorly drawn hands, extra arms` y siempre `child, loli, shota, young, underage, nude`. No se usa compel. Opción realista: `black-forest-labs/FLUX.1-schnell` en NF4 con offload a CPU y tiling del VAE; si no entra, el mismo camino con `unsloth/FLUX.1-schnell`. Flux va a 4 pasos, guía 0, `max_sequence_length` 256 y el prompt en lenguaje natural, sin etiquetas `masterpiece` ni `8k`, más `natural matte skin texture, visible pores, subtle film grain`. Los capítulos usan temperatura 0.9 (Creatividad), `min_p` 0.05, `top_p` 1, `top_k` apagado y `repetition_penalty` 1.03. Resúmenes y estado van a 0.3 con el mismo `min_p`. La caché KV de Qwen2.5 no se cuantiza. En la app, al cambiar Anime/Realista, Pasos y Guía se rellenan con ese perfil y se pueden editar. No hay filtro NSFW extra. Si Flux pide licencia, acepta el repo en Hugging Face y pega un token de lectura en `HF_TOKEN`.

**Texto, solo sin censura.** En Colab (una T4): por defecto `huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2`, y opción 14B. En Kaggle (dos T4): por defecto `huihui-ai/Qwen2.5-32B-Instruct-abliterated` en 4-bit NF4, repartido con `max_memory` de 14 GiB, 14 GiB y 20 GiB de CPU. El 14B de huihui responde 401 sin token, así que esa opción es el safetensors público `sci4ai/Qwen2.5-14B-Instruct-Abliterated`. No hay Qwen oficial.

El chat se arma así, porque devolver tensores directo de `apply_chat_template` rompe en transformers recientes:

```python
texto = tok.apply_chat_template(mensajes, tokenize=False, add_generation_prompt=True)
enc = tok(texto, return_tensors="pt")
salida = model.generate(**enc, ...)
```

**Bloqueo de menores, fijo.** No se puede quitar desde la app ni desde el cuerpo del request.

- El prompt positivo de imagen se rechaza si trae, entre otros: `child`, `loli`, `shota`, `young`, `underage`, y equivalentes (`niño`, `niña`, `lolita`, leet tipo `l0li`).
- Al negativo se le concatenan siempre `child, loli, shota, young, underage`.
- `young` también bloquea frases inocentes en inglés («young knight»). Está así a propósito.
- En relatos, un menor solo no se bloquea (un heredero en una crónica sí cabe). Sí se rechaza si el pedido junta un término de menor con uno sexual o romántico explícito.

## Dónde se guarda todo

Sin permiso amplio de almacenamiento (Android 13–16). La app escribe solo lo que ella crea:

| Qué | Dónde | Además |
| --- | --- | --- |
| PNG | `Fotos/BastionAlbor` (MediaStore) | texto iTXt con prompt, semilla, pasos, guía y modelo |
| Relato | `Documentos/BastionAlbor` (`.md`) | encabezado con fecha, voz y pedido |
| Capítulo de novela | `Documentos/BastionAlbor/<proyecto>/capitulo-001.txt` | biblia y esquema en la misma carpeta; copia local en la app |
| Historial | Room, en la app | prompt, ajustes, fecha y URI para reabrir o repetir |

Cada resultado se guarda solo. También hay botones de guardar, compartir, copiar y borrar. La galería lee esa carpeta aunque reinstales, mientras el archivo siga en el celular (el historial Room sí se borra con la app; al abrir Galería se vuelven a enlistar los archivos propios).

## La API es por trabajos

Un túnel gratuito se corta si la respuesta HTTP tarda demasiado. Por eso no hay una sola petición larga:

1. `POST /api/trabajos` con `Authorization: Bearer <token>` → `202` y un `id`
2. `GET /api/trabajos/{id}` → `en_cola`, `generando`, `listo` o `error`, más `avance`
3. `GET /api/trabajos/{id}/resultado` → el PNG en base64 o el texto

`GET /api/salud` no pide token y dice si hay GPU. La app hace polling cada 2 segundos, con reintentos si el túnel parpadea, y se rinde a los 15 minutos (una novela de varios capítulos espera más, unos 10 minutos por capítulo).

Imagen: `tipo`, `prompt`, `negativo`, `ancho`, `alto`, `cantidad` (1–4, en serie), `semilla`, `pasos` (hasta 40), `guia`. Texto de un tiro: `tipo=relato`, `sistema`, `pedido`, `largo`, `creatividad`, `modelo` (`7b`, `14b` o `32b`, solo sin censura). Novela: `tipo=novela`, `proyecto`, `biblia`, `esquema`, `resumenes`, `siguiente`, `cantidad` (1–10).

En Historias, **Historia larga** apagada escribe un relato de un tiro. Encendida, el servidor guarda el proyecto en `/kaggle/working/BastionAlbor/novelas/<proyecto>` o, en Colab, en Drive si está montado (`/content/drive/MyDrive/BastionAlbor/novelas`) y si no en `/content/BastionAlbor/novelas`. Cada **Continuar** escribe el siguiente capítulo (unas 1,300–1,600 palabras, con gancho), lo resume y actualiza la sección `## Estado` de la biblia. La biblia y el esquema se editan en el celular; esa copia es la que se manda. El bloqueo de menores sigue valiendo para la biblia y el esquema.

## Límites que hay que conocer

### Colab gratuito

- La sesión dura como máximo unas **12 horas** y a menudo menos. Un corte de inactividad (pestaña cerrada o sin interacción, del orden de 90 minutos) apaga el runtime aunque el servidor esté corriendo.
- La **GPU no está garantizada**. A veces no hay T4, o Colab dice que ya tienes demasiadas sesiones activas. Hay que cerrar las otras o esperar.
- Las condiciones de Colab **no están pensadas para usar el plan gratuito como servidor o interfaz remota** para otras personas. Esto es una herramienta personal, de un solo usuario, con la pestaña abierta.
- Cada vez que se reinicia el entorno hay que volver a ejecutar el notebook. La URL del túnel cambia.

### Kaggle gratuito

- Hace falta **teléfono verificado**, **Internet On** y **GPU T4 x2**. Sin internet no hay túnel ni descarga de modelos.
- El cupo de GPU es de unas **30 horas por semana**. La sesión también se puede cortar antes.
- El disco de `/kaggle/working` no guarda nada entre sesiones. El Qwen 32B pesa unos **65 GB** ya descargado: si no cabe, el servidor lo dice y en la app se elige el **14B**.
- Dos T4 son para el 32B. Flux e Illustrious usan una y sueltan la otra al cambiar de modelo.

### T4: ~15 GB de VRAM y ~12 GB de RAM

Illustrious XL en fp16 y un Qwen en 4-bit **no caben juntos**. El servidor carga uno, y al pedir el otro lo suelta. En Colab una sola T4 no corre el 32B. Lo seguro para pintar es **832×1216, una imagen, ~28 pasos** (Flux ignora eso y usa 4 pasos). Cantidad 3 o 4 se pinta en serie. El 7B y el 14B no hacen offload a CPU: la RAM de Colab no alcanza. El 32B, solo en Kaggle, sí puede dejar una parte en CPU.

### Descarga de modelos

Cada sesión fría baja varios gigas y puede tardar muchos minutos. Con `USAR_GOOGLE_DRIVE = True` se guardan en `Mi unidad/BastionAlbor/modelos`. Drive a veces falla al montar: el notebook avisa y usa el disco de la sesión, que se borra al cerrar.

### Túnel `cloudflared` (quick tunnel)

- No pide cuenta ni dominio.
- La URL es **aleatoria y distinta en cada ejecución**. No hay tiempo de actividad garantizado.
- Hay límites de tamaño, de peticiones y de cuánto puede durar una respuesta. Por eso la API es por trabajos y no por una sola descarga larga.
- Si el proceso de `cloudflared` muere, la celda lo dice: vuelve a ejecutar.

### ntfy

- Se publica el JSON `{u, t, n}` en `https://ntfy.sh/<tema>`.
- El tema es un secreto. Quien lo conozca puede leer el token. Usa el que genera el notebook (largo) y no lo compartas.
- ntfy.sh guarda los mensajes poco tiempo (del orden de 12 horas) y tiene límites de tamaño y de ritmo. El aviso es chico, pero si esperas demasiado, «Buscar en ntfy» no encuentra nada: escanea el QR.
- No hace falta cuenta. No se usa un Gist: ntfy no pide token de GitHub.

### Android

- Instalar una actualización pide el permiso de **orígenes desconocidos** (`REQUEST_INSTALL_PACKAGES`). La app abre ese ajuste si falta.
- No pide `READ_MEDIA_IMAGES` ni acceso amplio al almacenamiento. Escribe con MediaStore en sus carpetas. En Android 13–16 eso alcanza para lo que la propia app creó.
- Una generación puede durar minutos. La app no deja un HTTP abierto todo ese tiempo: manda el trabajo y consulta el estado. Si el túnel muere a la mitad, verás que Colab está apagado aunque el notebook, si sigue vivo, quizá todavía esté pintando.
- El QR usa la cámara. Si la niegas, puedes pegar URL y token.

### GitHub Actions y la firma

El workflow `.github/workflows/colab-studio-apk.yml` corre en cada push y en cada pull request que toque `colab-studio/`, y también a mano. Compila el APK y lo deja como artefacto del run.

**Publica un Release solo cuando etiquetas `v*`** (por ejemplo `v0.1.2`). La app compara `versionName` con esa etiqueta.

Cada imagen sale dos veces si `rembg` puede quitar el fondo: un PNG transparente y otro con fondo negro. Va activado por defecto. En Generar imagen solo se ven el prompt, los pasos, la guía, la cantidad y la semilla. El estilo anime o realista se elige en Ajustes. El servidor antepone etiquetas de calidad y el negativo de menores, y usa Euler a con Illustrious.

Secretos del repositorio (Settings → Secrets and variables → Actions), los cuatro:

| Secreto | Qué es |
| --- | --- |
| `BASTION_KEYSTORE_BASE64` | El `.jks` codificado en base64, en una sola línea |
| `BASTION_KEYSTORE_PASSWORD` | Contraseña del almacén |
| `BASTION_KEY_ALIAS` | Alias de la llave |
| `BASTION_KEY_PASSWORD` | Contraseña de la llave |

Si los cuatro secretos existen, el workflow firma con esa llave. Si faltan, usa el keystore fijo del repo, `colab-studio/app/keystore/bastion-release.jks` (alias `bastion`, contraseña `bastion-albor` en `gradle.properties`). Es una app personal y la llave va en el git a propósito: así cada APK trae el mismo certificado y Android deja instalar la versión nueva encima. El archivo publicado se llama `BastionAlbor-v0.1.2.apk`. Solo si tampoco está ese keystore, el workflow crea una llave de depuración nueva y el artefacto pasa a llamarse `BastionAlbor-debug-firmado.apk`.

Para publicar:

1. Sube `versionCode` y `versionName` en `colab-studio/app/app/build.gradle.kts`.
2. Etiqueta el commit: `git tag v0.2.0 && git push origin v0.2.0`.
3. El workflow deja el APK en el Release. La app, en Ajustes, ofrece bajarlo.

GitHub limita el tamaño de los Releases (el APK cabe de sobra), el ritmo de la API y cuántos artefactos de Actions se guardan (aquí, el tiempo por defecto del artefacto). Los Releases no caducan por ese reloj.

## Aspecto

Fondo casi negro, oro y carmesí, marcos de esquina en plata, oro, platino y negro. Títulos en Cinzel (OFL) y texto en Source Sans 3 (OFL); las dos van dentro del APK. Mientras Colab trabaja hay un shimmer; al llegar la imagen, la tarjeta gira. Si el sistema tiene las animaciones en cero, eso se queda quieto. La barra inferior dice Generar imagen, Historias, Galería y Ajustes; en pantalla ancha pasa a un riel. Los botones buscan 48 dp.

## Probar el servidor sin GPU

```bash
cd colab-studio/server
pip install flask
python -m unittest test_bastion_server.py
python check_notebook.py
```

Eso no descarga modelos. Revisa el filtro de menores, el negativo forzado, el token y el ciclo de trabajos con generadores falsos.
