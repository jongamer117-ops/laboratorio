# Bastión de Albor — estudio en el celular

App personal de Jonathan para generar retratos y relatos de **Bastión de Albor** (defensa de torres, fantasía medieval, aire de Millennium War Aigis) con la **GPU T4 gratuita de Google Colab**. No usa APIs de pago.

La app vive en el teléfono. El notebook, abierto en Colab, es el servidor. Se hablan por un túnel de Cloudflare que no pide cuenta.

El motor de historias de `webapp/` no se toca. Todo esto está en `colab-studio/`.

## Cómo usarlo

### 1. Instalar la app

1. Entra a [Releases](https://github.com/jongamer117-ops/laboratorio/releases) de este repositorio.
2. Baja el APK `BastionAlbor.apk` (si todavía no hay secretos de firma, el archivo se llama `BastionAlbor-debug-firmado.apk`).
3. En el celular, abre el archivo. Android pide permiso para instalar apps de este origen: acéptalo.
4. Si más adelante firmas con otra llave, Android no deja actualizar encima. Hay que desinstalar antes. Por eso conviene crear el keystore **antes** de la primera instalación que quieras conservar.

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

Luego **Probar conexión**. Si responde con el nombre de la GPU, ya puedes generar.

La primera imagen o el primer relato tardan más: el modelo se carga en la GPU. Después, dentro de la misma sesión, va más rápido. Si cambias de imagen a texto (o al revés), el servidor suelta el modelo anterior para no quedarse sin memoria.

## Qué genera

**Imagen.** `OnomaAIResearch/Illustrious-xl-early-release-v0`, archivo `Illustrious-XL-v0.1.safetensors`, con diffusers `from_single_file` en fp16. No se añade un filtro NSFW encima del modelo.

**Texto, por defecto.** `huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2` en 4-bit (bitsandbytes, nf4). Comprobado en Hugging Face: el repo existe, es público y no está gated. Opción en la app: `Qwen/Qwen2.5-7B-Instruct` (el oficial).

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
| Historial | Room, en la app | prompt, ajustes, fecha y URI para reabrir o repetir |

Cada resultado se guarda solo. También hay botones de guardar, compartir, copiar y borrar. La galería lee esa carpeta aunque reinstales, mientras el archivo siga en el celular (el historial Room sí se borra con la app; al abrir Galería se vuelven a enlistar los archivos propios).

## La API es por trabajos

Un túnel gratuito se corta si la respuesta HTTP tarda demasiado. Por eso no hay una sola petición larga:

1. `POST /api/trabajos` con `Authorization: Bearer <token>` → `202` y un `id`
2. `GET /api/trabajos/{id}` → `en_cola`, `generando`, `listo` o `error`, más `avance`
3. `GET /api/trabajos/{id}/resultado` → el PNG en base64 o el texto

`GET /api/salud` no pide token y dice si hay GPU. La app hace polling cada 2 segundos, con reintentos si el túnel parpadea, y se rinde a los 15 minutos.

Imagen: `tipo`, `prompt`, `negativo`, `ancho`, `alto`, `cantidad` (1–4, en serie), `semilla`, `pasos` (hasta 40), `guia`. Texto: `tipo=relato`, `sistema`, `pedido`, `largo`, `creatividad`, `modelo` (`abliterado` u `oficial`).

## Límites que hay que conocer

### Colab gratuito

- La sesión dura como máximo unas **12 horas** y a menudo menos. Un corte de inactividad (pestaña cerrada o sin interacción, del orden de 90 minutos) apaga el runtime aunque el servidor esté corriendo.
- La **GPU no está garantizada**. A veces no hay T4, o Colab dice que ya tienes demasiadas sesiones activas. Hay que cerrar las otras o esperar.
- Las condiciones de Colab **no están pensadas para usar el plan gratuito como servidor o interfaz remota** para otras personas. Esto es una herramienta personal, de un solo usuario, con la pestaña abierta.
- Cada vez que se reinicia el entorno hay que volver a ejecutar el notebook. La URL del túnel cambia.

### T4: ~15 GB de VRAM y ~12 GB de RAM

Illustrious XL en fp16 y Qwen 7B en 4-bit **no caben juntos**. El servidor carga uno, y al pedir el otro lo suelta (`empty_cache`). Aun así, una resolución grande o varios pasos pueden llenar la VRAM: el trabajo falla con un mensaje pidiendo bajar tamaño o pasos. Lo seguro en esta GPU es **832×1216, una imagen, ~28 pasos**. Cantidad 3 o 4 se pinta en serie y tarda mucho. No se hace offload a CPU: la RAM del sistema no alcanza.

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

**Publica un Release solo cuando etiquetas `v*`** (por ejemplo `v0.1.0`). La app compara `versionName` con esa etiqueta.

Secretos del repositorio (Settings → Secrets and variables → Actions), los cuatro:

| Secreto | Qué es |
| --- | --- |
| `BASTION_KEYSTORE_BASE64` | El `.jks` codificado en base64, en una sola línea |
| `BASTION_KEYSTORE_PASSWORD` | Contraseña del almacén |
| `BASTION_KEY_ALIAS` | Alias de la llave |
| `BASTION_KEY_PASSWORD` | Contraseña de la llave |

Crear la llave una vez, en tu computadora, y no la subas al git:

```bash
keytool -genkeypair -v \
  -keystore bastion-upload.jks \
  -alias bastion \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Jonathan, OU=Bastion, O=Bastion, L=CDMX, ST=CDMX, C=MX"
base64 -w0 bastion-upload.jks
```

Guarda el `.jks` y las contraseñas fuera del repo. Sin los cuatro secretos, el workflow **igual construye** el APK, firmado con una llave de depuración **nueva en cada run**. Ese APK se instala, pero no actualiza una instalación anterior (la firma no coincide) y no sirve para Play. El artefacto se llama `BastionAlbor-debug-firmado.apk`.

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
