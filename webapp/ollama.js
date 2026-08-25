/**
 * Cliente Ollama — capa 2: SOLO PROPONE.
 * Motor aplica vía applyAction + choiceLog (D3).
 */
const Ollama = {
  baseUrl: 'http://127.0.0.1:11434',
  model: 'llama3.2:1b',

  async isAlive() {
    try {
      const r = await fetch(this.baseUrl + '/api/tags', { method: 'GET' });
      return r.ok;
    } catch (_) {
      return false;
    }
  },

  async listModels() {
    const r = await fetch(this.baseUrl + '/api/tags');
    if (!r.ok) throw new Error('Ollama no responde');
    const data = await r.json();
    return (data.models || []).map(m => m.name);
  },

  async _chat(system, user, opts) {
    opts = opts || {};
    const body = {
      model: this.model,
      stream: false,
      options: {
        temperature: opts.temperature != null ? opts.temperature : 0.7,
        num_predict: opts.num_predict != null ? opts.num_predict : 180
      },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    };
    const r = await fetch(this.baseUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error('Ollama error: ' + (await r.text()));
    const data = await r.json();
    return ((data.message && data.message.content) || data.response || '').trim();
  },

  /**
   * Propone exactamente 3 acciones cortas para el menú.
   * Devuelve array de 3 strings. Nunca muta el World.
   */
  async proposeChoices(ctx) {
    const system = [
      'Eres el Director de una aventura interactiva (xianxia / life-sim).',
      'Devuelve EXACTAMENTE 3 acciones posibles para el protagonista.',
      'Formato: una línea por acción, sin numerar, sin guiones, sin comillas.',
      'Cada acción: máximo 12 palabras, en español, concreta y jugable.',
      'Deben ser distintas entre sí y coherentes con era, facción y últimos eventos.',
      'No inventes stats. No expliques. Solo las 3 líneas.'
    ].join(' ');

    const user = [
      `Era: ${ctx.era || '?'} | Año: ${ctx.year || 0} | Host: ${ctx.hostName || '?'}`,
      `Facción: ${ctx.faction || '—'} | Némesis: ${ctx.nemesis || '—'}`,
      `Contexto reciente:\n${(ctx.recentLogs || []).slice(-5).join('\n')}`,
      'Tres acciones:'
    ].join('\n\n');

    const raw = await this._chat(system, user, { temperature: 0.8, num_predict: 100 });
    const lines = raw
      .split(/\n+/)
      .map(l => l.replace(/^\s*[\d\-\*\•\.\)\]]+\s*/, '').trim())
      .filter(l => l.length >= 3 && l.length <= 80)
      .slice(0, 3);

    while (lines.length < 3) {
      const fallbacks = [
        'Seguir el camino principal',
        'Investigar los alrededores',
        'Descansar y recuperar fuerzas'
      ];
      lines.push(fallbacks[lines.length]);
    }
    return lines;
  },

  /**
   * Valida texto libre del jugador contra la escena actual.
   * Devuelve: { ok, action, reason, narrative }
   *  - ok=true  → acción aceptada (quizá reencuadrada en `action`)
   *  - ok=false → rechazada; `reason` para mostrar al jugador
   * Nunca muta el World.
   */
  async validateFreeText(ctx) {
    const system = [
      'Eres el árbitro narrativo de un simulador determinista.',
      'El jugador escribió una acción libre. Debes validarla.',
      'Responde SOLO con un JSON válido, sin markdown, sin texto extra:',
      '{"ok":true|false,"action":"acción limpia en infinitivo o 1ª persona","reason":"si ok=false, por qué","narrative":"si ok=true, 2-3 oraciones de consecuencia en tono crónica"}',
      'Reglas:',
      '- ok=false si: vacío de sentido, meta ("sube mi ATK"), rompe la era, teletransporta sin medio, mata al némesis al instante sin base, o pide stats/números al motor.',
      '- ok=true si es una acción de personaje plausible en este mundo; puedes reencuadrar levemente en "action".',
      '- "narrative" solo si ok=true. No inventes números de stats.',
      '- Español.'
    ].join(' ');

    const user = [
      `Era: ${ctx.era || '?'} | Año: ${ctx.year || 0} | Host: ${ctx.hostName || '?'}`,
      `Facción: ${ctx.faction || '—'} | Némesis: ${ctx.nemesis || '—'}`,
      `HP: ${ctx.hp != null ? ctx.hp + '/' + ctx.maxHp : '—'}`,
      `Contexto:\n${(ctx.recentLogs || []).slice(-6).join('\n')}`,
      `Texto del jugador: "${ctx.playerText}"`,
      'JSON:'
    ].join('\n\n');

    const raw = await this._chat(system, user, { temperature: 0.3, num_predict: 220 });
    return this._parseValidation(raw, ctx.playerText);
  },

  _parseValidation(raw, original) {
    try {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start >= 0 && end > start) {
        const obj = JSON.parse(raw.slice(start, end + 1));
        return {
          ok: !!obj.ok,
          action: String(obj.action || original || '').trim(),
          reason: String(obj.reason || '').trim(),
          narrative: String(obj.narrative || '').trim()
        };
      }
    } catch (_) {}
    // Fallback si el modelo no devolvió JSON: aceptar y usar el texto como narración mínima
    return {
      ok: true,
      action: original,
      reason: '',
      narrative: ''
    };
  },

  /**
   * Narra consecuencia de una acción ya validada (sin re-validar).
   */
  async proposeBranch(ctx) {
    const system = [
      'Eres el Director narrativo de un simulador determinista (estilo xianxia / life-sim).',
      'TÚ SOLO PROPONES. Responde en español, 2-4 oraciones, tono de crónica.',
      'No inventes stats numéricos. Solo narra la consecuencia de la acción.'
    ].join(' ');

    const user = [
      `Era: ${ctx.era || '?'} | Año: ${ctx.year || 0} | Host: ${ctx.hostName || '?'}`,
      `Facción: ${ctx.faction || '—'} | Némesis: ${ctx.nemesis || '—'}`,
      `Últimos eventos:\n${(ctx.recentLogs || []).slice(-6).join('\n')}`,
      `Acción: "${ctx.playerText}"`,
      'Narra la consecuencia inmediata.'
    ].join('\n\n');

    return this._chat(system, user, { temperature: 0.7, num_predict: 180 });
  }
};
