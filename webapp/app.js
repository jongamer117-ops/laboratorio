/**
 * Aventura: 3 elecciones + texto libre validado.
 * D1/D2/D3: LLM propone/valida; motor aplica vía choiceLog.
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
    return {
      era: h.era,
      year: h.year,
      hostName: h.name,
      faction: agent && agent.faction,
      nemesis: agent && (agent.nemesisName || agent.nemesis),
      hp: h.hp,
      maxHp: h.maxHp,
      recentLogs: recent.slice(-8)
    };
  }

  // ── Validación local (sin LLM) ──────────────────────────────────────────
  function validateBasic(text) {
    const t = String(text || '').trim().replace(/\s+/g, ' ');
    if (!t) return { ok: false, reason: 'Escribe algo.' };
    if (t.length < FREE_MIN) return { ok: false, reason: 'Demasiado corto.' };
    if (t.length > FREE_MAX) return { ok: false, reason: 'Máximo ' + FREE_MAX + ' caracteres.' };

    // Meta / comandos al motor (no son acciones de personaje)
    const meta = /\b(atk|def|hp|stat|seed|debug|console|json|choiceLog|applyAction)\b/i;
    if (meta.test(t)) {
      return { ok: false, reason: 'Eso no es una acción del personaje en este mundo.' };
    }

    // Solo símbolos / spam
    if (!/[a-záéíóúñü]/i.test(t)) {
      return { ok: false, reason: 'Necesito una acción en palabras.' };
    }

    return { ok: true, text: t };
  }

  /** Si el texto libre coincide con una de las 3 opciones, devolver su id */
  function matchChoice(text) {
    const low = text.toLowerCase();
    return currentChoices.find(c => {
      const lab = (c.label || '').toLowerCase();
      return lab === low || lab.includes(low) || low.includes(lab) || c.id === low;
    }) || null;
  }

  // ── Menú de 3 opciones ──────────────────────────────────────────────────
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

    // 1) Decisión autoritativa del motor (bifurcación / duelo / inflexión)
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
      // Si el motor trae menos de 3, rellenar no aplica: son decisiones cerradas
      renderChoices(list);
      return;
    }

    // 2) LLM propone 3 acciones de escena
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

    // Opción del motor → applyAction formal
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

    // Opción de escena (LLM/local) → tratar como texto libre ya “pre-validado”
    applyFreeAction(c.label, { preValidated: true });
  }

  // ── Avance del motor ────────────────────────────────────────────────────
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

  // ── Texto libre con validación ──────────────────────────────────────────
  async function applyFreeAction(rawText, opts) {
    opts = opts || {};
    if (busy || !world) return;

    // 1) Validación básica local
    const basic = validateBasic(rawText);
    if (!basic.ok) {
      write(basic.reason, 'muted');
      return;
    }
    const text = basic.text;

    // 2) ¿Coincide con una opción visible?
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

    // 3) Validación contextual (LLM), salvo si ya viene de un botón de escena
    if (!opts.preValidated) {
      try {
        validation = await Ollama.validateFreeText({
          ...ctxSnapshot(),
          playerText: text
        });
      } catch (_) {
        // Sin Ollama: aceptar con narración local
        validation = { ok: true, action: text, reason: '', narrative: '' };
      }

      if (!validation.ok) {
        write(validation.reason || 'Esa acción no encaja en este momento.', 'muted');
        // Re-ofrecer las mismas (o nuevas) opciones
        await offerChoices();
        busy = false;
        sendBtn.disabled = false;
        input.focus();
        return;
      }

      action = validation.action || text;
      narrative = validation.narrative || '';
    }

    // 4) Narración si el validador no la trajo
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

    // 5) Anotar en choiceLog (D3) — solo acciones validadas
    world.choiceLog = world.choiceLog || [];
    world.choiceLog.push({
      tick: world.tick,
      choice: 'free_text',
      text: text,
      action: action,
      validated: true,
      llm: narrative || null
    });

    // 6) Si había decisión de motor pendiente y el jugador se salió por texto libre,
    //    no la resolvemos por id (el motor sigue esperando). Solo avanzamos si no hay pausa.
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

    // Atajo numérico: 1 / 2 / 3 elige la opción del menú
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
