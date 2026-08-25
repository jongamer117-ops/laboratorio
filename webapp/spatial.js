/**
 * spatial.js — capa espacial mínima (laboratorio).
 * Pura + determinista: f(seed, zoneId, era, archId).
 * NO escribe el World. Solo propone POIs y resuelve intenciones de lugar.
 * D1/D2/D3: el motor sigue aplicando vía choiceLog; esto es query + resolución de texto.
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

  const _dispatch = Engine._dispatchAction.bind(Engine);
  Engine._dispatchAction = function (worldState, action) {
    if (action && action.type === "travel") {
      const agent = worldState.agents && worldState.agents[0];
      if (!agent || !action.zoneId) return { logs: [] };
      const u = worldState.universe;
      const dest = u && u.zones && u.zones.find((z) => z.id === action.zoneId);
      if (!dest) return { logs: [{ text: "No hay camino hacia ese territorio.", kind: "system" }] };
      const from = agent.zoneId;
      agent.zoneId = dest.id;
      worldState.choiceLog = worldState.choiceLog || [];
      worldState.choiceLog.push({
        tick: worldState.tick,
        choice: "travel",
        from: from,
        to: dest.id,
        dir: action.dir || null,
        text: action.text || null
      });
      if (typeof this.materializeZone === "function") {
        this.materializeZone(worldState, dest.id, 2);
      }
      return {
        logs: [{
          text: "Dejas " + (this.zoneName ? this.zoneName(u, from) : from) + " y marchas hacia " + dest.name + ".",
          kind: "exploration"
        }]
      };
    }
    return _dispatch(worldState, action);
  };

})();
