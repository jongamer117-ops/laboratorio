# laboratorio

Repo experimental para pruebas de **historias interactivas + LLM local** sin tocar Fabrica-cimiento.

## Qué hay aquí

- `engine.js` — motor determinista completo (boot / step / act / query)
- `cards_db.js` — cartas / talentos / mutaciones
- `tech_db.js` — vocabulario tech + recursos por era

## Invariantes que NO se rompen

- **D1** — `applyAction` es la única puerta de entrada
- **D2** — misma semilla + same choiceLog → mismo World
- **D3** — choiceLog registra toda entrada del espectador
- Capas: 1 sim pura / 2 interacción autoritativa / 3 presentación

## Objetivo de este lab

Probar:
1. Pantalla de historias interactivas estilo Haci
2. Bifurcaciones generativas a partir de texto libre del jugador
3. Integración LLM local (Ollama en Termux / WebLLM fallback)

El LLM **propone** ramas (capa 2). El motor **aplica** vía `choiceLog` (D3).

## Cómo arrancar (mínimo)

```html
<script src="cards_db.js"></script>
<script src="tech_db.js"></script>
<script src="engine.js"></script>
```

```js
const world = Engine.boot("mi-semilla");
Engine.act(world, { type: "start", baseAgent: Engine.generateHost(world.seed, world.meta.era, world.universe), cards: [] });
const res = Engine.step(world);
console.log(res.logs);
```

## Próximos pasos

- [ ] index.html mínimo + chat de historia
- [ ] Cliente Ollama (Termux)
- [ ] Prompt de generación de ramas a partir de input libre
- [ ] pendingDecision extendido para texto libre → choiceLog
