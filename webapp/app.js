/**
 * Aventura interactiva — solo relato + input.
 * D1/D2/D3 intactos: LLM propone, motor aplica vía choiceLog.
 */
(function () {
  const storyEl = document.getElementById('story');
  const choicesEl = document.getElementById('choices');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send');

  let world = null;
  let recent = [];
  let busy = false;

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
    return String(text || '')
      .replace(/^\[[^\]]+\]\s*/, '')
      .trim();
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

  function showChoices() {
    choicesEl.innerHTML = '';
    choicesEl.classList.remove('visible');
    if (!world || !world.waitingForDecision || !world.pendingDecision) return;

    const pd = world.pendingDecision;
    const title = pd.type === 'duel'
      ? 'El vencido está a tu merced'
      : (pd.type === 'inflexion' ? 'El destino exige un juicio' : 'El camino se bifurca');
    write(title, 'choice-title');

    choicesEl.classList.add('visible');
    (pd.options || []).forEach(opt => {
      const b = document.createElement('button');
      b.className = 'choice-btn';
      b.textContent = opt.label || opt.id;
      b.onclick = () => pickChoice(opt.id);
      choicesEl.appendChild(b);
    });
  }

  function pickChoice(optionId) {
    if (busy || !world) return;
    choicesEl.classList.remove('visible');
    choicesEl.innerHTML = '';
    const res = Engine.act(world, { type: 'decision', optionId: optionId });
    pushLogs(res.logs);
    if (!world.waitingForDecision && !world.waitingForChoice) {
      advance(2);
    } else {
      showChoices();
    }
  }

  function advance(years) {
    if (!world || world.waitingForDecision || world.waitingForChoice) return;
    const ticks = Math.max(1, (years || 1) * 12);
    for (let i = 0; i < ticks; i++) {
      const res = Engine.step(world);
      pushLogs(res.logs);
      if (res.stopped) break;
    }
    showChoices();
    if (world.waitingForChoice) {
      const story = Engine.query(world, 'story');
      if (story && story.epitaph) write(story.epitaph, 'danger');
      write('Fin de esta vida. Escribe «nueva» para volver a nacer.', 'muted');
    }
  }

  function boot() {
    storyEl.innerHTML = '';
    recent = [];
    choicesEl.innerHTML = '';
    choicesEl.classList.remove('visible');

    const seed = 'adv-' + Date.now().toString(36);
    world = Engine.boot(seed);
    const host = Engine.generateHost(seed, world.meta.era, world.universe);
    Engine.act(world, { type: 'start', baseAgent: host, cards: [] });

    // Intro + primeros años para entrar en la historia
    const first = Engine.step(world);
    pushLogs(first.logs);
    advance(3);
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

    input.value = '';
    write(text, 'you');
    busy = true;
    sendBtn.disabled = true;

    // Si hay decisión pendiente y el texto coincide con una opción, úsala
    if (world.waitingForDecision && world.pendingDecision) {
      const opts = world.pendingDecision.options || [];
      const match = opts.find(o =>
        (o.label && o.label.toLowerCase().includes(text.toLowerCase())) ||
        (o.id && o.id.toLowerCase() === text.toLowerCase())
      );
      if (match) {
        pickChoice(match.id);
        busy = false;
        sendBtn.disabled = false;
        input.focus();
        return;
      }
    }

    // LLM propone rama
    let proposal = null;
    try {
      const h = Engine.query(world, 'hud') || {};
      const agent = world.agents && world.agents[0];
      proposal = await Ollama.proposeBranch({
        era: h.era,
        year: h.year,
        hostName: h.name,
        faction: agent && agent.faction,
        nemesis: agent && (agent.nemesisName || agent.nemesis),
        recentLogs: recent.slice(-8),
        playerText: text
      });
    } catch (_) {
      proposal = null;
    }

    if (proposal) {
      write(proposal);
    } else {
      const name = (Engine.query(world, 'hud') || {}).name || 'El anfitrión';
      write(name + ' actúa según su voluntad: «' + text + '». El mundo toma nota y sigue su curso.');
    }

    world.choiceLog = world.choiceLog || [];
    world.choiceLog.push({
      tick: world.tick,
      choice: 'free_text',
      text: text,
      llm: proposal || null
    });

    if (!world.waitingForDecision) advance(1);
    else showChoices();

    busy = false;
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.onclick = onSend;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') onSend();
  });

  boot();
  input.focus();
})();
