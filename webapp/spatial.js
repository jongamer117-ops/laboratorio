/**
 * spatial.js — capa espacial mínima (laboratorio).
 * Pura + determinista: f(seed, zoneId, era, archId).
 * NO escribe el World. Solo propone POIs y resuelve intenciones de lugar.
 * D1/D2/D3: viajar, entrar y el texto libre entran por Engine.applyAction.
 */
(function () {
  if (typeof Engine === "undefined") {
    console.warn("[spatial] Engine no cargado; skip.");
    return;
  }

  // Tipos de POI y nombres por era (sabor). w = peso relativo al arquetipo.
  Engine.POI_CATALOG = {
    food: {
      w: 1.2,
      names: {
        FANTASIA: ["la Taberna del Jabalí", "el Comedor de Mercaderes", "la Posada del Dragón"],
        CULTIVACION: ["el Puesto de Fideos del Valle", "la Taberna de Qi", "el Comedor de la Secta"],
        MODERNO: ["el Restaurante del Centro", "la Cafetería 24h", "el Bar de la Esquina"],
        CYBERPUNK: ["el Puesto de Noodles del Nivel -2", "la Cantina de Chrome", "el Synth-Bar"],
        "SCI-FI": ["el Comedor Orbital", "la Cantina de la Estación", "el Bar de Gravedad Cero"],
        APOCALIPSIS: ["el Comedor del Búnker", "la Olla Común", "el Trueque de Raciones"]
      }
    },
    shop: {
      w: 1.0,
      names: {
        FANTASIA: ["el Bazar de Reliquias", "la Tienda del Alquimista", "el Puesto de Armas"],
        CULTIVACION: ["el Pabellón de Talismanes", "la Tienda de Píldoras", "el Mercado de Jade"],
        MODERNO: ["la Tienda de Conveniencia", "el Mercado Central", "la Armería Civil"],
        CYBERPUNK: ["el Mercado Negro de Implantes", "la Tienda de Chips", "el Puesto de Datos"],
        "SCI-FI": ["el Mercado Estelar", "la Tienda de Módulos", "el Bazar Xenotécnico"],
        APOCALIPSIS: ["el Trueque de Chatarra", "el Puesto de Munición", "la Tienda del Superviviente"]
      }
    },
    forge: {
      w: 0.8,
      names: {
        FANTASIA: ["la Forja del Enano", "el Taller de Runas"],
        CULTIVACION: ["la Forja de Espadas Espirituales", "el Taller de Talismanes"],
        MODERNO: ["el Taller Mecánico", "la Armería"],
        CYBERPUNK: ["el Taller de Ciber-extremidades", "la Forja de Plasma"],
        "SCI-FI": ["el Hangar de Reparación", "el Taller de Drones"],
        APOCALIPSIS: ["la Forja Improvisada", "el Taller de Chatarra"]
      }
    },
    temple: {
      w: 0.7,
      names: {
        FANTASIA: ["el Templo de la Luz", "el Santuario Antiguo"],
        CULTIVACION: ["el Templo de la Tribulación", "el Pabellón de Meditación"],
        MODERNO: ["la Iglesia del Barrio", "el Centro Comunitario"],
        CYBERPUNK: ["el Templo de la Red", "el Santuario de Datos"],
        "SCI-FI": ["la Capilla Orbital", "el Observatorio Sagrado"],
        APOCALIPSIS: ["el Santuario de los Supervivientes", "la Capilla del Cráter"]
      }
    },
    market: {
      w: 1.0,
      names: {
        FANTASIA: ["el Mercado Central", "la Plaza de Trueque"],
        CULTIVACION: ["el Mercado del Río", "la Plaza de las Bestias"],
        MODERNO: ["el Mercado Municipal", "la Plaza Comercial"],
        CYBERPUNK: ["el Mercado de Contrabando", "la Plaza Neon"],
        "SCI-FI": ["el Mercado de la Estación", "la Plaza de Intercambio"],
        APOCALIPSIS: ["el Mercado de Trueque", "la Plaza del Refugio"]
      }
    },
    gate: {
      w: 0.9,
      names: {
        FANTASIA: ["la Puerta Este", "la Puerta Oeste", "la Muralla Norte"],
        CULTIVACION: ["la Puerta del Valle", "el Paso de la Montaña"],
        MODERNO: ["la Salida Norte", "el Acceso Sur"],
        CYBERPUNK: ["el Checkpoint Este", "la Esclusa Oeste"],
        "SCI-FI": ["la Esclusa de Aire Este", "el Puerto de Acoplamiento"],
        APOCALIPSIS: ["la Barricada Este", "el Paso del Yermo"]
      }
    },
    barracks: {
      w: 0.6,
      names: {
        FANTASIA: ["el Cuartel de la Guardia", "el Campo de Entrenamiento"],
        CULTIVACION: ["el Patio de la Secta", "el Campo de Discípulos"],
        MODERNO: ["la Comisaría", "el Cuartel Militar"],
        CYBERPUNK: ["el Centro de Seguridad Corp", "el Dojo de Mercenarios"],
        "SCI-FI": ["el Hangar de la Guardia", "el Centro de Mando"],
        APOCALIPSIS: ["el Puesto de Vigilancia", "el Campamento Armado"]
      }
    }
  };

  Engine.POI_ARCH_BIAS = {
    capital:  { food: 1.4, shop: 1.3, temple: 1.2, market: 1.3, forge: 0.8, gate: 1.0, barracks: 1.1 },
    campos:   { food: 1.1, shop: 0.9, temple: 0.8, market: 1.0, forge: 0.7, gate: 0.8, barracks: 0.6 },
    frontera: { food: 0.8, shop: 0.7, temple: 0.5, market: 0.7, forge: 0.9, gate: 1.5, barracks: 1.4 },
    joya:     { food: 1.3, shop: 1.4, temple: 1.3, market: 1.2, forge: 1.0, gate: 0.9, barracks: 0.8 },
    selva:    { food: 0.9, shop: 0.7, temple: 0.6, market: 0.8, forge: 0.8, gate: 1.1, barracks: 0.9 },
    yermo:    { food: 0.6, shop: 0.5, temple: 0.4, market: 0.5, forge: 0.9, gate: 1.2, barracks: 1.0 },
    puerto:   { food: 1.3, shop: 1.4, temple: 0.7, market: 1.5, forge: 1.0, gate: 1.2, barracks: 0.8 },
    minas:    { food: 0.8, shop: 0.7, temple: 0.5, market: 0.7, forge: 1.5, gate: 1.0, barracks: 1.0 }
  };

  Engine.zonePOIs = function (seed, zoneId, era, archId) {
    const r = (salt) => this.rng(seed, "poi:" + zoneId + ":" + salt);
    const eraKey = era && this.POI_CATALOG.food.names[era] ? era : "MODERNO";
    const bias = this.POI_ARCH_BIAS[archId] || {};
    const types = Object.keys(this.POI_CATALOG);
    const count = 4 + Math.floor(r("n") * 4);
    const picked = [];
    const usedNames = {};
    const scored = types.map((t) => {
      const base = this.POI_CATALOG[t].w || 1;
      const b = bias[t] != null ? bias[t] : 1;
      return { type: t, score: base * b * (0.5 + r("sc:" + t)) };
    }).sort((a, b) => b.score - a.score);

    for (let i = 0; i < count && i < scored.length + 3; i++) {
      const entry = scored[i % scored.length];
      const cat = this.POI_CATALOG[entry.type];
      const names = (cat.names[eraKey] || cat.names.MODERNO || ["un lugar"]).slice();
      let nameIdx = Math.floor(r("nm:" + i) * names.length);
      let name = names[nameIdx];
      let tries = 0;
      while (usedNames[name] && tries < names.length) {
        nameIdx = (nameIdx + 1) % names.length;
        name = names[nameIdx];
        tries++;
      }
      usedNames[name] = true;
      const dirs = ["norte", "este", "sur", "oeste"];
      const dir = dirs[Math.floor(r("dir:" + i) * 4)];
      const x = Math.floor(r("x:" + i) * 100);
      const y = Math.floor(r("y:" + i) * 100);
      picked.push({
        id: zoneId + "_poi_" + i,
        type: entry.type,
        name: name,
        dir: dir,
        x: x,
        y: y
      });
    }
    return picked;
  };

  Engine.poisFor = function (worldState, zoneId) {
    if (!worldState || !worldState.universe) return [];
    const agent = worldState.agents && worldState.agents[0];
    const zid = zoneId || (agent && agent.zoneId);
    if (!zid) return [];
    const zone = (worldState.universe.zones || []).find((z) => z.id === zid);
    if (!zone) return [];
    const era = (worldState.meta && worldState.meta.era) || "MODERNO";
    return this.zonePOIs(worldState.seed, zone.id, era, zone.archId);
  };

  Engine.zoneNeighbors = function (worldState, zoneId) {
    const u = worldState && worldState.universe;
    if (!u || !u.zones || u.zones.length < 2) return { norte: null, este: null, sur: null, oeste: null };
    const zones = u.zones;
    const idx = zones.findIndex((z) => z.id === zoneId);
    if (idx < 0) return { norte: null, este: null, sur: null, oeste: null };
    const angles = zones.map((z, i) => ({
      z: z,
      a: this.rng(worldState.seed, "zpos:" + z.id) * Math.PI * 2
    })).sort((a, b) => a.a - b.a);
    const me = angles.find((e) => e.z.id === zoneId);
    if (!me) return { norte: null, este: null, sur: null, oeste: null };
    function nearestInSector(lo, hi) {
      let best = null;
      let bestD = 1e9;
      angles.forEach((e) => {
        if (e.z.id === zoneId) return;
        let d = e.a - me.a;
        while (d < 0) d += Math.PI * 2;
        while (d >= Math.PI * 2) d -= Math.PI * 2;
        if (d >= lo && d < hi && d < bestD) {
          bestD = d;
          best = e.z;
        }
      });
      return best;
    }
    return {
      norte: nearestInSector((7 * Math.PI) / 4, Math.PI * 2) || nearestInSector(0, Math.PI / 4),
      este: nearestInSector(Math.PI / 4, (3 * Math.PI) / 4),
      sur: nearestInSector((3 * Math.PI) / 4, (5 * Math.PI) / 4),
      oeste: nearestInSector((5 * Math.PI) / 4, (7 * Math.PI) / 4)
    };
  };

  const _query = Engine.query.bind(Engine);
  Engine.query = function (worldState, lens) {
    if (lens === "pois") {
      return this.poisFor(worldState);
    }
    if (lens === "spatial") {
      const agent = worldState && worldState.agents && worldState.agents[0];
      const zoneId = agent && agent.zoneId;
      const zone = zoneId && worldState.universe
        ? (worldState.universe.zones || []).find((z) => z.id === zoneId)
        : null;
      return {
        zoneId: zoneId || null,
        zoneName: zone ? zone.name : null,
        archId: zone ? zone.archId : null,
        pois: this.poisFor(worldState, zoneId),
        neighbors: zoneId ? this.zoneNeighbors(worldState, zoneId) : null
      };
    }
    return _query(worldState, lens);
  };

  // Artículo solo al inicio. "el Mercado de la Esquina" conserva el "la" interior.
  Engine.stripLeadingArticle = function (name) {
    return String(name || "").replace(/^(?:el|la|los|las)\s+/i, "");
  };

  // Hace falta un verbo de movimiento Y una dirección. "este" suelto ("quiero este cuchillo")
  // no es viajar. "adelante"/"atrás"/"arriba" tampoco, salvo con verbo.
  Engine.MOVE_VERB_RE = /\b(ir|voy|vamos|camina(?:r)?|dir[ií]gete|dirigirme|marcha(?:r)?|viaja(?:r)?|avanza(?:r)?|mu[eé]vete|mover(?:me)?|anda(?:r)?|encamina(?:r)?|cruza(?:r)?|sal(?:ir)?|rumbo)\b/i;
  Engine.TRAVEL_VERB_RE = /\b(viaja(?:r)?|marcha(?:r)?|sal(?:ir)?|cruza(?:r)?|rumbo)\b/i;
  Engine.DIR_WORD_RE = {
    norte: /\b(norte|adelante|arriba)\b/i,
    sur: /\b(sur|atr[aá]s|abajo)\b/i,
    este: /\b(este|derecha)\b/i,
    oeste: /\b(oeste|izquierda)\b/i
  };
  Engine.POI_TYPE_RE = {
    food: /restaurante|taberna|comedor|posada|inn|cafeter[ií]a|bar\b|cantina|fideos|noodles|comer|comida|cocina|olla|raciones/i,
    shop: /tienda|bazar|armer[ií]a|comprar|vender|chips?|implantes?|m[oó]dulos?/i,
    forge: /forja|taller|herrer[ií]a|reparaci[oó]n/i,
    temple: /templo|santuario|iglesia|capilla|pabell[oó]n de meditaci[oó]n|meditar/i,
    market: /mercado|plaza|trueque/i,
    gate: /puerta|muralla|salida|acceso|checkpoint|esclusa|barricada|paso\b/i,
    barracks: /cuartel|comisaría|comisaria|guardia|entrenamiento|vigilancia|campamento armado/i
  };

  /**
   * Pura: no escribe el World. Devuelve null si el texto no es una intención de lugar.
   * { ok, kind: 'poi'|'travel'|'dir', poi?, zone?, dir?, reason? }
   */
  Engine.resolveSpatialIntent = function (worldState, text) {
    const t = String(text || "").trim();
    if (!t || !worldState) return null;
    const spatial = this.query(worldState, "spatial") || {};
    const pois = spatial.pois || [];
    const neighbors = spatial.neighbors || {};
    const low = t.toLowerCase();
    const looking = /buscar|encontrar|localizar|entrar|voy\s+a|vamos\s+a|hacia/i.test(t);

    for (let i = 0; i < pois.length; i++) {
      const p = pois[i];
      const pn = String(p.name || "").toLowerCase();
      if (!pn) continue;
      const short = this.stripLeadingArticle(pn);
      const hitFull = low.indexOf(pn) !== -1;
      const dirWord = /^(norte|sur|este|oeste|adelante|atr[aá]s|arriba|abajo|derecha|izquierda)$/i.test(short);
      const hitShort = !dirWord && short.length >= 6 && short !== pn && low.indexOf(short) !== -1;
      if (hitFull || hitShort) {
        return {
          ok: true,
          kind: "poi",
          poi: p,
          action: "entrar en " + p.name
        };
      }
    }

    const typeKeys = Object.keys(this.POI_TYPE_RE);
    if (looking || typeKeys.some((k) => this.POI_TYPE_RE[k].test(t))) {
      for (let i = 0; i < typeKeys.length; i++) {
        const type = typeKeys[i];
        if (!this.POI_TYPE_RE[type].test(t)) continue;
        const found = pois.filter((p) => p.type === type);
        if (found.length) {
          return { ok: true, kind: "poi", poi: found[0], action: "buscar y entrar en " + found[0].name };
        }
        const lista = pois.length ? pois.map((p) => p.name).join(", ") : "ningún lugar destacado";
        return {
          ok: false,
          kind: "poi",
          reason: "En esta zona no hay ningún lugar de ese tipo. Aquí solo hay: " + lista + "."
        };
      }
    }

    if (!this.MOVE_VERB_RE.test(t)) return null;

    const dirs = Object.keys(this.DIR_WORD_RE);
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      if (!this.DIR_WORD_RE[dir].test(t)) continue;
      const travelVerb = this.TRAVEL_VERB_RE.test(t);
      if (!travelVerb) {
        const inDir = pois.filter((p) => p.dir === dir);
        if (inDir.length) {
          return { ok: true, kind: "poi", poi: inDir[0], action: "ir hacia el " + dir + " hasta " + inDir[0].name };
        }
      }
      const neigh = neighbors[dir];
      if (neigh) {
        return { ok: true, kind: "travel", zone: neigh, dir: dir, action: "viajar al " + dir + " hacia " + neigh.name };
      }
      return {
        ok: false,
        kind: "dir",
        dir: dir,
        reason: "Hacia el " + dir + " no hay un camino claro ni un lugar conocido desde aquí."
      };
    }
    return null;
  };

})();
