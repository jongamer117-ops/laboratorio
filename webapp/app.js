/**
 * Aventura: elecciones + texto libre.
 * D1: el World solo cambia por Engine.applyAction (act) y por el reloj Engine.step.
 * D3: la narración del LLM es presentación; no entra al choiceLog.
 * Misma semilla y el mismo choiceLog reconstruyen el World (Engine.replay).
 */
(function () {
  const storyEl = document.getElementById('story');
  const choicesEl = document.getElementById('choices');
  const captionEl = document.getElementById('choice-caption');
  const statusEl = document.getElementById('status');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send');
  const form = document.getElementById('composer');
  const nameEl = document.getElementById('hud-name');
  const metaEl = document.getElementById('hud-meta');
  const seedEl = document.getElementById('hud-seed');
  const hpText = document.getElementById('hp-text');
  const hpFill = document.getElementById('hp-fill');
  const newBtn = document.getElementById('new-game');
  const advanceBtn = document.getElementById('advance');

  const FREE_MIN = 3;
  const FREE_MAX = 160;
  const SAVE_KEY = 'laboratorio-aventura-v1';
  const SCENE_FALLBACK = [
    'Seguir adelante',
    'Investigar los alrededores',
    'Descansar un momento'
  ];

  let world = null;
  let recent = [];
  let busy = false;
  let opGen = 0;
  let transcript = [];
  let currentChoices = [];
  let yearN = null;
  let yearHost = null;
  let worldFold = null;
  let lastBody = '';

  function findCard(id) {
    if (!id || typeof CardsDB === 'undefined') return null;
    for (const cat in CardsDB) {
      const found = (CardsDB[cat] || []).find(c => c.id === id);
      if (found) return found;
    }
    return null;
  }

  function resetStoryState() {
    yearN = null;
    yearHost = null;
    worldFold = null;
    lastBody = '';
  }

  function scrollStory() {
    storyEl.scrollTop = storyEl.scrollHeight;
  }

  function parseTag(text) {
    const m = String(text || '').match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
    if (!m) return { tag: '', body: String(text || '').trim() };
    return { tag: m[1], body: (m[2] || '').trim() || String(text).trim() };
  }

  function chipTone(kind) {
    if (kind === 'death' || kind === 'calamity' || kind === 'ambush' || kind === 'anomaly' || kind === 'invasion' || kind === 'corruption') return 'danger';
    if (kind === 'decision') return 'choice';
    if (kind === 'world' || kind === 'travel' || kind === 'exploration') return 'world';
    if (kind === 'intro' || kind === 'act_break' || kind === 'presagio') return 'info';
    if (kind === 'downtime' || kind === 'system') return 'muted';
    if (kind === 'ascension' || kind === 'social' || kind === 'loot' || kind === 'encounter' || kind === 'desire' || kind === 'settlement' || kind === 'combat_win' || kind === 'thread_payoff') return 'good';
    return 'muted';
  }

  function ensureYear(year) {
    if (yearN === year && yearHost) return;
    yearN = year;
    worldFold = null;
    lastBody = '';
    const sec = document.createElement('section');
    sec.className = 'year-block';
    const h = document.createElement('h2');
    h.className = 'year-title';
    h.textContent = 'Año ' + year;
    sec.appendChild(h);
    yearHost = document.createElement('div');
    sec.appendChild(yearHost);
    storyEl.appendChild(sec);
  }

  function appendBeat(parent, parsed, kind, who, live) {
    const p = document.createElement('p');
    const cls = ['beat'];
    if (who === 'you') cls.push('you');
    else if (who === 'flavor') cls.push('flavor');
    else if (kind === 'death' || kind === 'calamity' || kind === 'ambush') cls.push('danger');
    else if (kind === 'system' || kind === 'downtime') cls.push('muted');
    if (live) cls.push('is-new');
    p.className = cls.join(' ');
    if (parsed.tag && who !== 'you' && who !== 'flavor') {
      const chip = document.createElement('span');
      chip.className = 'chip chip-' + chipTone(kind);
      chip.textContent = parsed.tag;
      p.appendChild(chip);
      p.appendChild(document.createTextNode(parsed.body));
    } else {
      p.textContent = parsed.body || parsed.tag;
    }
    parent.appendChild(p);
  }

  function isWorldNotice(entry, parsed) {
    if (entry.who) return false;
    if (entry.kind === 'world') return true;
    const tag = String(parsed.tag || '').toUpperCase();
    return tag === 'MUNDO' || tag === 'COSMOS' || tag === 'ZONA';
  }

  function paint(entry, live) {
    const text = String(entry.text || '').trim();
    if (!text) return;
    const year = entry.year != null ? entry.year : 0;
    const parsed = parseTag(text);
    const body = parsed.body;
    if (body && body === lastBody && year === yearN) return;
    ensureYear(year);
    lastBody = body;
    if (isWorldNotice(entry, parsed)) {
      if (!worldFold || !worldFold.isConnected) {
        worldFold = document.createElement('details');
        worldFold.className = 'world-fold';
        const sum = document.createElement('summary');
        sum.textContent = 'Sucesos del mundo';
        const bodyEl = document.createElement('div');
        bodyEl.className = 'world-body';
        worldFold.appendChild(sum);
        worldFold.appendChild(bodyEl);
        worldFold._count = 0;
        yearHost.appendChild(worldFold);
      }
      worldFold._count += 1;
      worldFold.querySelector('summary').textContent = 'Sucesos del mundo (' + worldFold._count + ')';
      appendBeat(worldFold.querySelector('.world-body'), parsed, entry.kind, '', live);
    } else {
      worldFold = null;
      appendBeat(yearHost, parsed, entry.kind || '', entry.who || '', live);
    }
    if (live) scrollStory();
  }

  function pushEntry(entry) {
    transcript.push(entry);
    if (transcript.length > 500) transcript.shift();
    paint(entry, true);
    if (entry.who !== 'you' && entry.text) {
      recent.push(parseTag(entry.text).body);
      if (recent.length > 50) recent.shift();
    }
  }

  function writePlayer(text) {
    const year = (Engine.query(world, 'hud') || {}).year || 0;
    pushEntry({ year: year, kind: '', who: 'you', text: text });
  }

  function writeFlavor(text) {
    const year = (Engine.query(world, 'hud') || {}).year || 0;
    pushEntry({ year: year, kind: '', who: 'flavor', text: text });
  }

  function pushLogs(logs) {
    (logs || []).forEach(l => {
      const text = String(l.text || '').trim();
      if (!text) return;
      const year = l.year != null ? l.year : ((Engine.query(world, 'hud') || {}).year || 0);
      pushEntry({ year: year, kind: l.kind || '', who: '', text: text });
    });
  }

  function note(msg) {
    statusEl.textContent = msg;
    const year = world ? ((Engine.query(world, 'hud') || {}).year || 0) : 0;
    pushEntry({ year: year, kind: 'system', who: '', text: msg });
  }

  function setThinking(on) {
    statusEl.textContent = on ? 'El mundo piensa…' : '';
  }

  function setCaption(text) {
    if (!text) {
      captionEl.hidden = true;
      captionEl.textContent = '';
      return;
    }
    captionEl.hidden = false;
    captionEl.textContent = text;
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

  function updateHud() {
    const h = world ? (Engine.query(world, 'hud') || {}) : {};
    const s = world ? (Engine.query(world, 'spatial') || {}) : {};
    nameEl.textContent = h.name || 'Sin nombre';
    const hp = h.hp != null ? Math.max(0, Math.round(h.hp)) : 0;
    const max = h.maxHp ? Math.round(h.maxHp) : 0;
    hpText.textContent = max ? (hp + '/' + max) : '—';
    const ratio = max ? Math.max(0, Math.min(1, hp / max)) : 0;
    hpFill.style.setProperty('--hp', String(ratio));
    hpFill.classList.toggle('is-ok', ratio >= 0.55);
    hpFill.classList.toggle('is-mid', ratio >= 0.3 && ratio < 0.55);
    const era = h.tipoLabel || h.era || '—';
    const zone = s.zoneName || '—';
    metaEl.textContent = 'Año ' + (h.year != null ? h.year : 0) + ' · ' + era + ' · ' + zone;
    const seed = world && world.seed ? world.seed : '—';
    seedEl.textContent = seed;
    seedEl.title = seed;
    const alive = world && world.agents && world.agents[0] && world.agents[0].hp > 0;
    const paused = !world || world.waitingForDecision || world.waitingForChoice || !alive;
    advanceBtn.disabled = busy || paused;
    newBtn.disabled = busy;
  }

  function persist() {
    if (!world) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        seed: world.seed,
        choiceLog: world.choiceLog || [],
        transcript: transcript.slice(-500)
      }));
    } catch (_) {}
  }

  function validateBasic(text) {
    const t = String(text || '').trim().replace(/\s+/g, ' ');
    if (!t) return { ok: false, reason: 'Escribe algo.' };
    if (t.length < FREE_MIN) return { ok: false, reason: 'Demasiado corto.' };
    if (t.length > FREE_MAX) return { ok: false, reason: 'Máximo ' + FREE_MAX + ' caracteres.' };
    const meta = /\b(atk|def|hp|stat|seed|debug|console|json|choiceLog|applyAction)\b/i;
    if (meta.test(t)) return { ok: false, reason: 'Eso no es una acción del personaje en este mundo.' };
    if (!/[a-záéíóúñü]/i.test(t)) return { ok: false, reason: 'Necesito una acción en palabras.' };
    return { ok: true, text: t };
  }

  function norm(s) {
    return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function matchChoice(text) {
    const low = norm(text);
    return currentChoices.find(c => norm(c.label) === low || norm(c.id) === low) || null;
  }

  function costInfo(cost, agent) {
    if (!cost) return { text: '', ok: true };
    const needs = [];
    const lacks = [];
    if (cost.will) {
      needs.push(cost.will + ' de Voluntad');
      if ((agent.will || 0) < cost.will) lacks.push('Voluntad ' + (agent.will || 0) + '/' + cost.will);
    }
    if (cost.luck) {
      needs.push(cost.luck + ' de Fortuna');
      if ((agent.luck || 0) < cost.luck) lacks.push('Fortuna ' + (agent.luck || 0) + '/' + cost.luck);
    }
    if (!needs.length) return { text: '', ok: true };
    if (lacks.length) return { text: 'No alcanza: ' + lacks.join(', ') + '.', ok: false };
    return { text: 'Cuesta ' + needs.join(' y ') + '.', ok: true };
  }

  function decisionChoices(pd) {
    const agent = (world.agents && world.agents[0]) || {};
    return (pd.options || []).slice(0, 3).map(o => {
      const full = Engine.DECISION_OPTIONS.find(d => d.id === o.id) || o;
      const bits = [];
      if (pd.type === 'inflexion') {
        bits.push('Juicio de ' + String(pd.stat || '').toUpperCase() + ': ' + pd.playerStat + '/' + pd.reqValue + '.');
      }
      if (o.desc) bits.push(o.desc);
      else if (full.cardId) {
        const card = findCard(full.cardId);
        if (card && card.desc) bits.push(card.desc);
      }
      const cost = costInfo(o.cost, agent);
      if (cost.text) bits.push(cost.text);
      return {
        id: o.id,
        label: o.label || o.id,
        detail: bits.join(' '),
        disabled: !cost.ok,
        source: 'motor'
      };
    });
  }

  function captionFor(pd) {
    if (pd.type === 'duel') return 'El vencido está a tu merced';
    if (pd.type === 'inflexion') return 'El destino exige un juicio';
    return 'El camino se bifurca';
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
      b.type = 'button';
      b.className = 'choice-btn' + (c.disabled ? ' is-disabled' : '');
      b.disabled = !!c.disabled;
      const lab = document.createElement('span');
      lab.className = 'choice-label';
      lab.textContent = (i + 1) + '. ' + c.label;
      b.appendChild(lab);
      if (c.detail) {
        const d = document.createElement('span');
        d.className = 'choice-detail';
        d.textContent = c.detail;
        b.appendChild(d);
      }
      b.addEventListener('click', () => onPickChoice(c));
      choicesEl.appendChild(b);
    });
  }

  async function offerChoices() {
    const gen = ++opGen;
    if (!world) return;
    if (world.waitingForChoice) {
      setCaption('');
      renderChoices([]);
      return;
    }
    if (world.waitingForDecision && world.pendingDecision) {
      setCaption(captionFor(world.pendingDecision));
      renderChoices(decisionChoices(world.pendingDecision));
      return;
    }
    setCaption('');
    renderChoices([]);
    setThinking(true);
    let labels = null;
    let fromLlm = false;
    try {
      labels = await Ollama.proposeChoices(ctxSnapshot());
      fromLlm = true;
    } catch (_) {
      labels = null;
      fromLlm = false;
    }
    if (gen !== opGen) return;
    setThinking(false);
    if (!world || world.waitingForDecision || world.waitingForChoice) return;
    if (!labels || labels.length < 3) {
      fromLlm = false;
      labels = SCENE_FALLBACK.slice();
    }
    renderChoices(labels.map((label, i) => ({
      id: 'scene_' + i,
      label: label,
      source: fromLlm ? 'llm' : 'local'
    })));
  }

  function showDeath() {
    setCaption('');
    renderChoices([]);
    const story = Engine.query(world, 'story');
    if (story && story.epitaph) {
      const year = (Engine.query(world, 'hud') || {}).year || 0;
      const already = transcript.some(t => t.text === story.epitaph);
      if (!already) pushEntry({ year: year, kind: 'death', who: '', text: story.epitaph });
    }
    statusEl.textContent = 'Fin de esta vida. Pulsa «Nueva partida» para volver a nacer.';
  }

  async function narrate(actionText, preset) {
    let narrative = preset || '';
    if (!narrative) {
      setThinking(true);
      try {
        narrative = await Ollama.proposeBranch(Object.assign({}, ctxSnapshot(), { playerText: actionText }));
      } catch (err) {
        narrative = '';
        if (err && err.name === 'AbortError') {
          statusEl.textContent = 'El modelo local no respondió a tiempo. La crónica sigue sin él.';
        }
      }
      if (statusEl.textContent === 'El mundo piensa…') setThinking(false);
    }
    if (!narrative) {
      const name = (Engine.query(world, 'hud') || {}).name || 'El anfitrión';
      narrative = name + ' actúa: «' + actionText + '». El mundo toma nota y el hilo sigue.';
    }
    writeFlavor(narrative);
  }

  async function finishBeat() {
    persist();
    updateHud();
    if (world.waitingForChoice) {
      showDeath();
      return;
    }
    if (world.waitingForDecision) {
      await offerChoices();
      return;
    }
    const res = Engine.act(world, { type: 'advance_year' });
    pushLogs(res.logs);
    persist();
    updateHud();
    if (world.waitingForChoice) showDeath();
    else await offerChoices();
  }

  async function runScene(text, trusted) {
    const spatialHit = Engine.resolveSpatialIntent(world, text);
    if (spatialHit && !spatialHit.ok) {
      note(spatialHit.reason || 'No encuentras eso aquí.');
      await offerChoices();
      return;
    }
    if (spatialHit && spatialHit.kind === 'travel' && spatialHit.zone) {
      const res = Engine.act(world, {
        type: 'travel',
        zoneId: spatialHit.zone.id,
        dir: spatialHit.dir,
        text: text
      });
      pushLogs(res.logs);
      updateHud();
      if (res.refused) {
        persist();
        await offerChoices();
        return;
      }
      await finishBeat();
      return;
    }
    if (spatialHit && spatialHit.kind === 'poi' && spatialHit.poi) {
      const res = Engine.act(world, {
        type: 'enter_poi',
        text: text,
        poiId: spatialHit.poi.id,
        poiType: spatialHit.poi.type,
        poiName: spatialHit.poi.name
      });
      pushLogs(res.logs);
      if (!res.refused) await narrate(spatialHit.action || text);
      await finishBeat();
      return;
    }

    let preset = '';
    if (!trusted) {
      setThinking(true);
      let validation = { ok: true, action: text, reason: '', narrative: '' };
      try {
        validation = await Ollama.validateFreeText(Object.assign({}, ctxSnapshot(), { playerText: text }));
      } catch (err) {
        validation = { ok: true, action: text, reason: '', narrative: '' };
        if (err && err.name === 'AbortError') {
          statusEl.textContent = 'El modelo local no respondió a tiempo. La crónica sigue sin él.';
        }
      }
      if (statusEl.textContent === 'El mundo piensa…') setThinking(false);
      if (!validation.ok) {
        note(validation.reason || 'Esa acción no encaja en este momento.');
        await offerChoices();
        return;
      }
      preset = validation.narrative || '';
    }

    const res = Engine.act(world, { type: 'free_text', text: text });
    if (res.refused) {
      note('Ahora no puedes actuar.');
      await offerChoices();
      return;
    }
    await narrate(text, preset);
    await finishBeat();
  }

  async function runChoice(c) {
    if (c.source === 'motor') {
      if (c.disabled) {
        note(c.detail || 'No puedes pagar esa senda.');
        await offerChoices();
        return;
      }
      input.value = '';
      writePlayer(c.label);
      setCaption('');
      renderChoices([]);
      const res = Engine.act(world, { type: 'decision', optionId: c.id });
      pushLogs(res.logs);
      updateHud();
      if (world.waitingForChoice) {
        showDeath();
        persist();
        return;
      }
      if (world.waitingForDecision) {
        persist();
        await offerChoices();
        return;
      }
      await finishBeat();
      return;
    }
    input.value = '';
    writePlayer(c.label);
    renderChoices([]);
    await runScene(c.label, true);
  }

  function begin() {
    if (busy || !world) return false;
    busy = true;
    opGen++;
    sendBtn.disabled = true;
    input.disabled = true;
    choicesEl.querySelectorAll('button').forEach(b => { b.disabled = true; });
    updateHud();
    return true;
  }

  function end() {
    busy = false;
    sendBtn.disabled = false;
    input.disabled = false;
    const buttons = choicesEl.querySelectorAll('button');
    buttons.forEach((b, i) => {
      const c = currentChoices[i];
      b.disabled = !!(c && c.disabled);
    });
    updateHud();
  }

  async function onPickChoice(c) {
    if (!begin()) return;
    try {
      await runChoice(c);
    } finally {
      end();
      if (world && !world.waitingForChoice) input.focus();
    }
  }

  async function applyFreeAction(raw) {
    if (!begin()) return;
    try {
      const basic = validateBasic(raw);
      if (!basic.ok) {
        note(basic.reason);
        input.focus();
        return;
      }
      const text = basic.text;
      const matched = matchChoice(text);
      if (matched) {
        await runChoice(matched);
        return;
      }
      if (world.waitingForChoice) {
        note('Esta vida terminó. Pulsa «Nueva partida» para empezar otra.');
        input.value = '';
        return;
      }
      if (world.waitingForDecision) {
        note('Elige una de las sendas que tienes delante.');
        input.value = '';
        await offerChoices();
        return;
      }
      input.value = '';
      writePlayer(text);
      await runScene(text, false);
    } finally {
      end();
      if (world && !world.waitingForChoice) input.focus();
    }
  }

  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
  }

  async function bootFromSeed(seed, save) {
    if (busy) return;
    busy = true;
    opGen++;
    sendBtn.disabled = true;
    input.disabled = true;
    updateHud();
    try {
      storyEl.innerHTML = '';
      resetStoryState();
      recent = [];
      currentChoices = [];
      renderChoices([]);
      setCaption('');
      statusEl.textContent = '';
      if (save && Array.isArray(save.choiceLog)) {
        world = Engine.replay(seed, save.choiceLog);
        transcript = [];
        const lines = Array.isArray(save.transcript) && save.transcript.length
          ? save.transcript
          : (world.timeline || []).map(b => ({ year: b.year, kind: b.kind, who: '', text: b.text }));
        lines.forEach(line => {
          transcript.push(line);
          paint(line, false);
        });
        recent = transcript.map(t => parseTag(t.text).body).filter(Boolean).slice(-50);
      } else {
        world = Engine.boot(seed);
        const host = Engine.generateHost(seed, world.meta.era, world.universe);
        Engine.act(world, { type: 'start', baseAgent: host, cards: [] });
        transcript = [];
        const opened = Engine.openLife(world);
        pushLogs(opened.logs);
      }
      updateHud();
      persist();
      scrollStory();
      if (world.waitingForChoice) showDeath();
      else await offerChoices();
    } finally {
      end();
      if (world && !world.waitingForChoice) input.focus();
    }
  }

  function newGame(ask) {
    if (busy) return;
    if (ask && world && !window.confirm('¿Abandonar esta vida y empezar otra?')) return;
    clearSave();
    const seed = 'adv-' + Date.now().toString(36);
    bootFromSeed(seed, null);
  }

  async function onAdvance() {
    if (!begin()) return;
    try {
      if (world.waitingForDecision || world.waitingForChoice) return;
      setCaption('');
      renderChoices([]);
      const res = Engine.act(world, { type: 'advance_year' });
      if (res.refused) {
        note('El año no puede avanzar ahora.');
        await offerChoices();
        return;
      }
      pushLogs(res.logs);
      persist();
      updateHud();
      if (world.waitingForChoice) showDeath();
      else await offerChoices();
    } finally {
      end();
    }
  }

  async function onSend(e) {
    if (e) e.preventDefault();
    const text = (input.value || '').trim();
    if (!text || busy) return;
    if (/^(nueva|reiniciar|reset)$/i.test(text)) {
      input.value = '';
      newGame(true);
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

  form.addEventListener('submit', onSend);
  newBtn.addEventListener('click', () => newGame(true));
  advanceBtn.addEventListener('click', () => { onAdvance(); });

  let save = null;
  try { save = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (_) { save = null; }
  if (save && save.seed && Array.isArray(save.choiceLog)) bootFromSeed(save.seed, save);
  else newGame(false);
})();
