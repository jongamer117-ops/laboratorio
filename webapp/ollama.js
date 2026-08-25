/**
 * Cliente mínimo para Ollama (Termux / local).
 * Capa 2: el LLM SOLO PROPONE. El motor aplica vía applyAction + choiceLog (D3).
 *
 * Default: http://127.0.0.1:11434  (Termux: ollama serve)
 * Modelo recomendado para móvil: llama3.2:1b / qwen2.5:1.5b / phi3:mini
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

  /**
   * Genera una propuesta de rama narrativa a partir del estado actual + texto libre del jugador.
   * Devuelve texto estructurado; NUNCA muta el World.
   */
  async proposeBranch(ctx) {
    const system = [
      'Eres el Director narrativo de un simulador determinista (estilo xianxia / life-sim).',
      'El motor ya tiene semilla, choiceLog e invariantes. TÚ SOLO PROPONES.',
      'Responde en español, 2-4 oraciones, tono de crónica.',
      'No inventes stats numéricos. No digas "el motor debería". Solo narra la consecuencia narrativa de la acción del jugador.',
      'Si el jugador escribe algo imposible, reencuádralo dentro del mundo (era, facción, némesis).'
    ].join(' ');

    const user = [
      `Era: ${ctx.era || '?'} | Año: ${ctx.year || 0} | Host: ${ctx.hostName || '?'}`,
      `Facción: ${ctx.faction || '—'} | Némesis: ${ctx.nemesis || '—'}`,
      `Últimos eventos:\n${(ctx.recentLogs || []).slice(-6).join('\n')}`,
      `Acción libre del jugador: "${ctx.playerText}"`,
      'Narra la consecuencia inmediata (sin menús, sin opciones numeradas).'
    ].join('\n\n');

    const body = {
      model: this.model,
      stream: false,
      options: { temperature: 0.7, num_predict: 180 },
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
    if (!r.ok) {
      const t = await r.text();
      throw new Error('Ollama error: ' + t);
    }
    const data = await r.json();
    return (data.message && data.message.content) || data.response || '';
  }
};
