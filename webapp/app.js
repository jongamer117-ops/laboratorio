/**
 * Aventura: 3 elecciones + texto libre validado.
 * D1/D2/D3: LLM propone/valida; motor aplica vía choiceLog.
 * Spatial: resolveSpatialIntent consulta POIs reales de la zona (spatial.js).
 */
(function () {
  const storyEl = document.getElementById('story');
  const choicesEl = document.getElementById('choices');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send');

  const FREE_MIN = 3;
  const FREE_MAX = 160;

  let world = null;
  let recent = [];
  let busy = false;
  /** @type {{ id: string, label: string, source: 'motor'|'llm'|'local' }[]} */
  let currentChoices = [];

  function write(text, cls) {
    if (!text) return;
    const p = document.createElement('p');
    p.className = 'beat' + (cls ? ' ' + cls : '');
    p.textContent = text;
    storyEl.appendChild(p);
    storyEl.scrollTop = storyEl.scrollHeight;
    recent.push(text);
    if (recent.length > 50) recent.shift();
  }

  function cleanLog(text) {
    return String(text || '').replace(/^\[[^\]]+\]\s*/, '').trim();
  }

  function pushLogs(logs) {
    (logs || []).forEach(l => {
      const t = cleanLog(l.text);
      if (!t) return;
      let cls = '';
      if (l.kind === 'death' || l.kind === 'calamity' || l.kind === 'ambush') cls = 'danger';
      else if (l.kind === 'decision') cls = 'choice-title';
      else if (l.kind === 'downtime' || l.kind === 'exploration') cls = 'muted';
      write(t, cls);
    });
  }

  function ctxSnapshot() {
    const h = Engine.query(world, 'hud') || {};
    const agent = world && world.agents && world.agents[0];
    const spatial = Engine.query(world, 'spatial') || {};
    return {
      era: h.era,
      year: h.year,
      hostName: h.name,
      faction: agent && agent.faction,
      nemesis: agent && (agent.nemesisName || agent.nemesis),
      hp: h.hp,
      maxHp: h.maxHp,
      recentLogs: recent.slice(-8),
      zoneName: spatial.zoneName || null,
      pois: spatial.pois || [],
      neighbors: spatial.neighbors || null
    };
  }

  const TYPE_RE = {
    food: /restaurante|taberna|comedor|posada|inn|cafeter[ií]a|bar\b|cantina|fideos|noodles|comer|comida|cocina|olla|raciones/i,
    shop: /tienda|bazar|armer[ií]a|comprar|vender|chips?|implantes?|m[oó]dulos?/i,
    forge: /forja|taller|herrer[ií]a|reparaci[oó]n/i,
    temple: /templo|santuario|iglesia|capilla|pabell[oó]n de meditaci[oó]n|meditar/i,
    market: /mercado|plaza|trueque/i,
    gate: /puerta|muralla|salida|acceso|checkpoint|esclusa|barricada|paso\b/i,
    barracks: /cuartel|comisaría|comisaria|guardia|entrenamiento|vigilancia|campamento armado/i
  };

  const DIR_RE = {
    norte: /\b(norte|adelante|arriba)\b/i,
    sur: /\b(sur|atr[aá]s|abajo)\b/i,
    este: /\b(este|derecha|right)\b/i,
    oeste: /\b(oeste|izquierda|left)\b/i
  };

  function resolveSpatialIntent(text) {
    const t = String(text || '').trim();
    if (!t || !world) return null;

    const spatial = Engine.query(world, 'spatial') || {};
    const pois = spatial.pois || [];
    const neighbors = spatial.neighbors || {};
    const looking = /buscar|encontrar|localizar|ir\s+a|entrar|voy\s+a|vamos\s+a|dir[ií]gete|camina\s+hacia|hacia/i.test(t);

    const low = t.toLowerCase();
    for (const p of pois) {
      const pn = (p.name || '').toLowerCase();
      const short = pn.replace(/^el |la |los |las /i, '');
      if (pn && (low.includes(pn) || low.includes(short))) {
        return {
          ok: true,
          kind: 'poi',
          poi: p,
          action: 'entrar en ' + p.name,
          narrative: 'Encuentras ' + p.name + ' hacia el ' + p.dir + ' de esta zona. El lugar es real en este mundo.'
        };
      }
    }

    if (looking || Object.keys(TYPE_RE).some(k => TYPE_RE[k].test(t))) {
      for (const type of Object.keys(TYPE_RE)) {
        if (!TYPE_RE[type].test(t)) continue;
        const found = pois.filter(p => p.type === type);
        if (found.length) {
          const p = found[0];
          return {
            ok: true,
            kind: 'poi',
            poi: p,
            action: 'buscar y entrar en ' + p.name,
            narrative: 'Tras recorrer la zona, das con ' + p.name + ' (al ' + p.dir + '). No es invento: está anclado a este territorio.'
          };
        }
        const lista = pois.length
          ? pois.map(p => p.name).join(', ')
          : 'ningún lugar destacado';
        return {
          ok: false,
          kind: 'poi',
          reason: 'En esta zona no hay ningún lugar de ese tipo. Aquí solo hay: ' + lista + '.'
        };
      }
    }

    for (const dir of Object.keys(DIR_RE)) {
      if (!DIR_RE[dir].test(t)) continue;
      const inDir = pois.filter(p => p.dir === dir);
      if (inDir.length) {
        const p = inDir[0];
        return {
          ok: true,
          kind: 'poi',
          poi: p,
          action: 'ir hacia el ' + dir + ' hasta ' + p.name,
          narrative: 'Tomas el camino al ' + dir + ' y llegas a ' + p.name + '.'
        };
      }
      const neigh = neighbors[dir];
      if (neigh) {
        return {
          ok: true,
          kind: 'travel',
          zone: neigh,
          dir: dir,
          action: 'viajar al ' + dir + ' hacia ' + neigh.name,
          narrative: 'Dejas esta zona y tomas el camino al ' + dir + '. A lo lejos se alza ' + neigh.name + '.'
        };
      }
      return {
        ok: false,
        kind: 'dir',
        reason: 'Hacia el ' + dir + ' no hay un camino claro ni un lugar conocido desde aquí.'
      };
    }

    return null;
  }

  function validateBasic(text) {
    const t = String(text || '').trim().replace(/\s+/g, ' ');
    if (!t) return { ok: false, reason: 'Escribe algo.' };
    if (t.length < FREE_MIN) return { ok: false, reason: 'Demasiado corto.' };
    if (t.length > FREE_MAX) return { ok: false, reason: 'Máximo ' + FREE_MAX + ' caracteres.' };
    const meta = /\b(atk|def|hp|stat|seed|debug|console|json|choiceLog|applyAction)\b/i;
    if (meta.test(t)) {
      return { ok: false, reason: 'Eso no es una acción del personaje en este mundo.' };
    }
    if (!/[a-záéíóúñü]/i.test(t)) {
      return { ok: false, reason: 'Necesito una acción en palabras.' };
    }
    return { ok: true, text: t };
  }

  function matchChoice(text) {
    const low = text.toLowerCase();
    return currentChoices.find(c => {
      const lab = (c.label || '').toLowerCase();
      return lab === low || lab.includes(low) || low.includes(lab) || c.id === low;
    }) || null;
  }

  function renderChoices(list) {
    currentChoices = list || [];
    choicesEl.innerHTML = '';
    if (!currentChoices.length) {
      choicesEl.classList.remove('visible');
      return;
    }
    choicesEl.classList.add('visible');
    currentChoices.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'choice-btn';
      b.textContent = (i + 1) + '. ' + c.label;
      b.onclick = () => onPickChoice(c);
      choicesEl.appendChild(b);
    });
  }

  async function offerChoices() {
    if (!world || world.waitingForChoice) {
      renderChoices([]);
      return;
    }

    if (world.waitingForDecision && world.pendingDecision) {
      const pd = world.pendingDecision;
      const title = pd.type === 'duel'
        ? 'El vencido está a tu merced'
        : (pd.type === 'inflexion' ? 'El destino exige un juicio' : 'El camino se bifurca');
      write(title, 'choice-title');
      const list = (pd.options || []).slice(0, 3).map(o => ({
        id: o.id,
        label: o.label || o.id,
        source: 'motor'
      }));
      renderChoices(list);
      return;
    }

    write('¿Qué haces?', 'choice-title');
    let labels = null;
    try {
      labels = await Ollama.proposeChoices(ctxSnapshot());
    } catch (_) {
      labels = null;
    }

    if (!labels || labels.length < 3) {
      labels = [
        'Seguir adelante',
        'Investigar los alrededores',
        'Descansar un momento'
      ];
    }

    renderChoices(labels.map((label, i) => ({
      id: 'scene_' + i,
      label: label,
      source: labels === null ? 'local' : 'llm'
    })));
  }

  function onPickChoice(c) {
    if (busy || !world) return;

    if (c.source === 'motor') {
      choicesEl.classList.remove('visible');
      choicesEl.innerHTML = '';
      currentChoices = [];
      write(c.label, 'you');
      const res = Engine.act(world, { type: 'decision', optionId: c.id });
      pushLogs(res.logs);
      if (!world.waitingForDecision && !world.waitingForChoice) {
        advance(2).then(() => offerChoices());
      } else {
        offerChoices();
      }
      return;
    }

    applyFreeAction(c.label, { preValidated: true });
  }

  async function advance(years) {
    if (!world || world.waitingForDecision || world.waitingForChoice) return;
    const ticks = Math.max(1, (years || 1) * 12);
    for (let i = 0; i < ticks; i++) {
      const res = Engine.step(world);
      pushLogs(res.logs);
      if (res.stopped) break;
    }
    if (world.waitingForChoice) {
      const story = Engine.query(world, 'story');
      if (story && story.epitaph) write(story.epitaph, 'danger');
      write('Fin de esta vida. Escribe «nueva» para volver a nacer.', 'muted');
      renderChoices([]);
    }
  }

  function boot() {
    storyEl.innerHTML = '';
    recent = [];
    currentChoices = [];
    choicesEl.innerHTML = '';
    choicesEl.classList.remove('visible');

    const seed = 'adv-' + Date.now().toString(36);
    world = Engine.boot(seed);
    const host = Engine.generateHost(seed, world.meta.era, world.universe);
    Engine.act(world, { type: 'start', baseAgent: host, cards: [] });

    const first = Engine.step(world);
    pushLogs(first.logs);

    busy = true;
    sendBtn.disabled = true;
    advance(3).then(() => offerChoices()).finally(() => {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    });
  }

  async function applyFreeAction(rawText, opts) {
    opts = opts || {};
    if (busy || !world) return;

    const basic = validateBasic(rawText);
    if (!basic.ok) {
      write(basic.reason, 'muted');
      return;
    }
    const text = basic.text;

    const matched = matchChoice(text);
    if (matched && matched.source === 'motor') {
      onPickChoice(matched);
      return;
    }

    busy = true;
    sendBtn.disabled = true;
    input.value = '';
    choicesEl.classList.remove('visible');

    write(text, 'you');

    let action = text;
    let narrative = '';
    let validation = { ok: true, action: text, reason: '', narrative: '' };
    let spatialHit = null;

    if (!opts.preValidated) {
      spatialHit = resolveSpatialIntent(text);
      if (spatialHit) {
        if (!spatialHit.ok) {
          write(spatialHit.reason || 'No encuentras eso aquí.', 'muted');
          await offerChoices();
          busy = false;
          sendBtn.disabled = false;
          input.focus();
          return;
        }
        action = spatialHit.action || text;
        narrative = spatialHit.narrative || '';

        if (spatialHit.kind === 'travel' && spatialHit.zone) {
          const res = Engine.act(world, {
            type: 'travel',
            zoneId: spatialHit.zone.id,
            dir: spatialHit.dir,
            text: text
          });
          pushLogs(res.logs);
        }
      }
    }

    if (!opts.preValidated && !spatialHit) {
      try {
        validation = await Ollama.validateFreeText({
          ...ctxSnapshot(),
          playerText: text
        });
      } catch (_) {
        validation = { ok: true, action: text, reason: '', narrative: '' };
      }

      if (!validation.ok) {
        write(validation.reason || 'Esa acción no encaja en este momento.', 'muted');
        await offerChoices();
        busy = false;
        sendBtn.disabled = false;
        input.focus();
        return;
      }

      action = validation.action || text;
      narrative = validation.narrative || '';
    }

    if (!narrative) {
      try {
        narrative = await Ollama.proposeBranch({
          ...ctxSnapshot(),
          playerText: action
        });
      } catch (_) {
        const name = (Engine.query(world, 'hud') || {}).name || 'El anfitrión';
        narrative = name + ' actúa: «' + action + '». El mundo toma nota y el hilo sigue.';
      }
    }

    if (narrative) write(narrative);

    if (!(spatialHit && spatialHit.kind === 'travel')) {
      world.choiceLog = world.choiceLog || [];
      const entry = {
        tick: world.tick,
        choice: spatialHit && spatialHit.kind === 'poi' ? 'enter_poi' : 'free_text',
        text: text,
        action: action,
        validated: true,
        llm: narrative || null
      };
      if (spatialHit && spatialHit.poi) {
        entry.poiId = spatialHit.poi.id;
        entry.poiType = spatialHit.poi.type;
      }
      world.choiceLog.push(entry);
    }

    if (!world.waitingForDecision && !world.waitingForChoice) {
      await advance(1);
    }

    await offerChoices();
    busy = false;
    sendBtn.disabled = false;
    input.focus();
  }

  async function onSend() {
    const text = (input.value || '').trim();
    if (!text || busy) return;

    if (/^(nueva|reiniciar|reset)$/i.test(text)) {
      input.value = '';
      boot();
      return;
    }

    if (!world) { boot(); return; }

    if (world.waitingForChoice) {
      write('Esta vida terminó. Escribe «nueva» para empezar otra.', 'muted');
      input.value = '';
      return;
    }

    if (/^[123]$/.test(text) && currentChoices.length) {
      const idx = parseInt(text, 10) - 1;
      if (currentChoices[idx]) {
        input.value = '';
        onPickChoice(currentChoices[idx]);
        return;
      }
    }

    await applyFreeAction(text);
  }

  sendBtn.onclick = onSend;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') onSend();
  });

  boot();
})();
