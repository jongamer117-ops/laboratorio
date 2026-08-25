# Laboratorio

Clone experimental del motor de **Fabrica-cimiento** para probar:

- Pantalla de historias interactivas estilo Haci
- Bifurcaciones + texto libre del jugador
- Generación de ramas con LLM local (Ollama)

## Invariantes (no romper)

| Id | Regla |
|----|--------|
| **D1** | `Engine.applyAction` es la **única** puerta de escritura del World |
| **D2** | Misma semilla → mismo World (rng keyeado, cero `Math.random`) |
| **D3** | `Mundo = f(semilla, choiceLog)` — toda entrada del espectador se anota |

Arquitectura de 3 capas:

1. **Sim** (`engine.js`) — pura, determinista
2. **Interacción** — LLM propone; motor aplica vía `choiceLog`
3. **Presentación** — `index.html` / `app.js`

## Archivos

```
webapp/
  engine.js      ← núcleo (clone de cimiento)
  cards_db.js
  tech_db.js
  ollama.js      ← cliente REST mínimo
  app.js         ← UI de historias + free-text
  index.html
```

## Cómo probar (Android / Termux / Poco)

1. `ollama serve` (o el binario que uses)
2. `ollama pull llama3.2:1b` (o el modelo que quepa en RAM)
3. Servir la carpeta `webapp/` (cualquier static server)
4. Abrir `index.html` en el navegador del teléfono

### Flujo de prueba

1. **Nueva partida** → boot + intro
2. **Avanzar año** → ticks del motor
3. Cuando haya **Bifurcación / Juicio** → botones de decisión
4. **Escribe algo distinto** en el input → Ollama propone narración → se anota en `choiceLog` como `free_text`

## Próximos pasos experimentales

- [ ] Action type formal `free_text` en el motor (hoy solo se loguea)
- [ ] Sesgar `LIFE_ENCOUNTERS` / hilos C11 según el texto libre
- [ ] Vislumbre táctica de ramas generadas por LLM
- [ ] Portar patrones estables de vuelta a Fabrica-cimiento

## Offline-first

Todo corre en el dispositivo. Sin red no hay LLM, pero el motor determinista sigue vivo.
