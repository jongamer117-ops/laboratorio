/**
 * Laboratorio — capa 3 mínima.
 * Invariantes:
 *   D1  applyAction es la única puerta
 *   D2  misma semilla → mismo World
 *   D3  Mundo = f(semilla, choiceLog)
 * LLM propone (capa 2); motor aplica.
 */
(function () {
  const feed = document.getElementById('feed');
  const hud = document.getElementById('hud');
  const statusEl = document.getElementById('status');
  const decisionBox = document.getElementById('decision-box');
  const decisionPrompt = document.getElementById('decision-prompt');
  const decisionOptions = document.getElementById('decision-options');
  const freeInput = document.getElementById('free-input');

  let world = null;
  let recentLogs = [];

  function appendLog(text, kind) {
    const div = document.createElement('div');
    div.className = 'log' + (kind ? ' kind-' + kind : '');
    div.textContent = text;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
    recentLogs.push(text);
    if (recentLogs.length > 40) recentLogs.shift();
  }

  function refreshHud() {
    if (!world) { hud.textContent = 'sin mundo'; return; }
    const h = Engine.query(world, 'hud');
    if (!h) { hud.textContent = '—'; return; }
    hud.textContent = [
      h.name || '?',
      'año ' + h.year,
      h.era || '',
      h.rankLabel || h.rank || '',
      h.hp != null ? ('HP ' + h.hp + '/' + h.maxHp) : ''
    ].filter(Boolean).join(' · ');
  }

  function showDecision() {
    if (!world || !world.waitingForDecision || !world.pendingDecision) {
      decisionBox.classList.remove('visible');
      return;
    }
    const pd = world.pendingDecision;
    decisionBox.classList.add('visible');
    decisionPrompt.textContent = pd.type === 'duel'
      ? 'Juicio del Administrador'
      : (pd.type === 'inflexion' ? 'Punto de Inflexión' : 'Bifurcación');
    decisionOptions.innerHTML = '';
    (pd.options || []).forEach(opt => {
      const b = document.createElement('button');
      b.className = 'opt';
      b.textContent = opt.label || opt.id;
      if (opt.desc) b.title = opt.desc;
      b.onclick = () => {
        const res = Engine.act(world, { type: 'decision', optionId: opt.id });
        (res.logs || []).forEach(l => appendLog(l.text, l.kind));
        decisionBox.classList.remove('visible');
        refreshHud();
      };
      decisionOptions.appendChild(b);
    });
  }

  function boot() {
    feed.innerHTML = '';
    recentLogs = [];
    const seed = 'lab-' + Date.now().toString(36);
    world = Engine.boot(seed);
    // Host de génesis + mazo vacío (prueba mínima)
    const host = Engine.generateHost(seed, world.meta.era, world.universe);
    const res = Engine.act(world, { type: 'start', baseAgent: host, cards: [] });
    (res.logs || []).forEach(l => appendLog(l.text, l.kind));
    appendLog('[LAB] Semilla: ' + seed, 'intro');
    // Primer tick para afiliación / intro
    const step = Engine.step(world);
    (step.logs || []).forEach(l => appendLog(l.text, l.kind));
    refreshHud();
    showDecision();
  }

  function stepYear() {
    if (!world) return boot();
    if (world.waitingForDecision) {
      appendLog('[LAB] Hay una decisión pendiente. Elige o escribe texto libre.', 'decision');
      showDecision();
      return;
    }
    if (world.waitingForChoice) {
      appendLog('[LAB] La corrida terminó. Nueva partida para reiniciar.', 'death');
      return;
    }
    // Avanzar ~1 año (12 ticks de 30)
    for (let i = 0; i < 12; i++) {
      const res = Engine.step(world);
      (res.logs || []).forEach(l => appendLog(l.text, l.kind));
      if (res.stopped) break;
    }
    refreshHud();
    showDecision();
  }

  function showStory() {
    if (!world) return;
    const story = Engine.query(world, 'story');
    if (!story) {
      appendLog('[LAB] Aún no hay relato (el Host debe morir o cerrar).', 'intro');
      return;
    }
    appendLog('—— RELATO ——', 'intro');
    appendLog(story.epitaph || '', 'intro');
    (story.acts || []).forEach(a => {
      appendLog('Acto: ' + a.title, 'ascension');
      (a.beats || []).forEach(b => appendLog('  Año ' + b.year + ' — ' + b.text, b.kind));
    });
  }

  async function freeBranch() {
    const text = (freeInput.value || '').trim();
    if (!text) return;
    if (!world) boot();
    freeInput.value = '';

    appendLog('[JUGADOR] ' + text, 'decision');

    // 1) Intentar LLM (capa 2 propone)
    let proposal = null;
    try {
      statusEl.textContent = 'Ollama: generando…';
      statusEl.className = '';
      const h = Engine.query(world, 'hud') || {};
      const agent = world.agents && world.agents[0];
      proposal = await Ollama.proposeBranch({
        era: h.era,
        year: h.year,
        hostName: h.name,
        faction: agent && agent.faction,
        nemesis: agent && (agent.nemesisName || agent.nemesis),
        recentLogs: recentLogs,
        playerText: text
      });
      if (proposal) {
        appendLog('[LLM] ' + proposal, 'llm');
        statusEl.textContent = 'Ollama: ok';
        statusEl.className = 'ok';
      }
    } catch (e) {
      statusEl.textContent = 'Ollama: offline — rama local';
      statusEl.className = 'err';
      appendLog('[LAB] Ollama no disponible. Usando eco local.', 'intro');
      proposal = 'El mundo registró la voluntad de ' + (hName()) + ': «' + text + '». Las consecuencias aún no se han materializado en el simulador.';
      appendLog('[LOCAL] ' + proposal, 'llm');
    }

    // 2) Anotar en choiceLog como entrada de espectador (D3) — sin mutar stats a ciegas.
    //    Por ahora es un marcador; cuando diseñemos el action type "free_text" formal,
    //    el motor podrá usarlo para sesgar tables / abrir hilos.
    world.choiceLog = world.choiceLog || [];
    world.choiceLog.push({
      tick: world.tick,
      choice: 'free_text',
      text: text,
      llm: proposal || null
    });

    // 3) Avanzar un poco el simulador para que el río siga corriendo
    if (!world.waitingForDecision && !world.waitingForChoice) {
      const res = Engine.step(world);
      (res.logs || []).forEach(l => appendLog(l.text, l.kind));
    }
    refreshHud();
    showDecision();
  }

  function hName() {
    const h = Engine.query(world, 'hud');
    return (h && h.name) || 'el Anfitrión';
  }

  async function checkOllama() {
    statusEl.textContent = 'Ollama: comprobando…';
    statusEl.className = '';
    const ok = await Ollama.isAlive();
    if (!ok) {
      statusEl.textContent = 'Ollama: offline (¿ollama serve?)';
      statusEl.className = 'err';
      return;
    }
    try {
      const models = await Ollama.listModels();
      statusEl.textContent = 'Ollama: ok · ' + (models[0] || 'sin modelos');
      statusEl.className = 'ok';
      if (models.length) Ollama.model = models[0];
    } catch (e) {
      statusEl.textContent = 'Ollama: error';
      statusEl.className = 'err';
    }
  }

  document.getElementById('btn-boot').onclick = boot;
  document.getElementById('btn-step').onclick = stepYear;
  document.getElementById('btn-story').onclick = showStory;
  document.getElementById('btn-free').onclick = freeBranch;
  document.getElementById('btn-check-ollama').onclick = checkOllama;
  freeInput.addEventListener('keydown', e => { if (e.key === 'Enter') freeBranch(); });

  // Arranque
  checkOllama();
  boot();
})();
