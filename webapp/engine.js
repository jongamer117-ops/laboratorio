const SpriteEngine = {
    palettes: {
        host: { '#': '#111', '1': '#fca5a5', '2': '#ef4444', '3': '#4f46e5', '4': '#9ca3af', '5': '#1f2937' },
        comp1: { '#': '#111', '1': '#c4b5fd', '2': '#8b5cf6', '3': '#10b981', '4': '#cbd5e1', '5': '#334155' },
        comp2: { '#': '#111', '1': '#fde047', '2': '#eab308', '3': '#be123c', '4': '#cbd5e1', '5': '#475569' },
        pet: { '#': '#111', '1': '#67e8f9', '2': '#06b6d4', '3': '#0891b2' },
        enemy: { '#': '#111', '1': '#dc2626', '2': '#991b1b', '3': '#fef08a' },
        tree: { '#': '#111', '1': '#4ade80', '2': '#22c55e', '3': '#166534', '4': '#8B4513', '5': '#a16207' },
        loot: { '#': '#111', '1': '#fbbf24', '2': '#d97706', '3': '#fef3c7' },
        fx: { '1': '#fef08a', '2': '#ffffff' },

        // Paletas contextuales por era, para el avatar de la Sala de Preparación (mismo sprite
        // base recoloreado según Engine.ERAS, igual patrón que comp1/comp2 para compañeros).
        pal_CYBERPUNK: { '#': '#111', '1': '#fdf4ff', '2': '#f0abfc', '3': '#c026d3', '4': '#2dd4bf', '5': '#0f766e' },
        pal_CULTIVACION: { '#': '#111', '1': '#fefce8', '2': '#fde047', '3': '#a16207', '4': '#86efac', '5': '#166534' },
        pal_FANTASIA: { '#': '#111', '1': '#f8fafc', '2': '#94a3b8', '3': '#334155', '4': '#fca5a5', '5': '#b91c1c' },
        "pal_SCI-FI": { '#': '#111', '1': '#f0f9ff', '2': '#7dd3fc', '3': '#0284c7', '4': '#cbd5e1', '5': '#475569' },
        pal_APOCALIPSIS: { '#': '#111', '1': '#fef08a', '2': '#d97706', '3': '#78350f', '4': '#a3e635', '5': '#4d7c0f' },
        pal_MODERNO: { '#': '#111', '1': '#ffedd5', '2': '#fdba74', '3': '#c2410c', '4': '#1e293b', '5': '#000000' }
    },
    sprites: {
        host_hd: [ "      ####      ", "     ##11##     ", "    ##1111##    ", "    ##2112##    ", "     ##11##     ", "   ###3333###   ", "  ##4#3333#4##  ", "  #44#3333#44#  ", "  #44#3333#44#  ", "   ## 3333 ##   ", "      5555      ", "     ##  ##     ", "    ##    ##    ", "   ##      ##   ", "   ###    ###   ", "                " ],
        enemy_hd: [ "                ", "   ##      ##   ", "  #11#    #11#  ", "  #11######11#  ", "  #1222222221#  ", "  #2322222232#  ", "  #2222222222#  ", "   #21111112#   ", "   ##111111##   ", "    #1#  #1#    ", "    #1#  #1#    ", "    #2#  #2#    ", "   ###    ###   ", "                ", "                ", "                " ],
        tree_hd: [ "        ########        ", "      ###111111###      ", "    ###1112222111###    ", "   ##11122333322111##   ", "  ##1122333333332211##  ", "  ##1223333113333221##  ", " ##112333111111333211## ", " ##122333112211333221## ", " ##123333122221333321## ", "  ##1233332222333321##  ", "  ##1123333333333211##  ", "   ##11223333332211##   ", "    ###1122222211###    ", "      ###111111###      ", "        ###44###        ", "         ##44##         ", "         ##45##         ", "         ##54##         ", "        ##4444##        ", "       ##44##44##       ", "      ##44#  #44##      ", "     ###4##  ##4###     ", "                        ", "                        " ],
        pet_hd: [ "            ", "    ####    ", "  ##1111##  ", " #11111111# ", " #12211221# ", " #12311231# ", "  ##1111##  ", "    ####    " ],
        chest_hd: [ "          ", " ######## ", " #111111# ", " #33##33# ", " #222222# ", " ######## " ],
        fx_slash: [ "   22       ", "    2211    ", "     2211   ", "      2211  ", "       22   " ],

        // Avatar de la Sala de Preparación, 3 capas (base + atuendo por clase + cabeza por era) que
        // se dibujan apiladas en el mismo canvas, cada una con su propia paleta contextual.
        ava_base: [
            "                   ", "                   ", "      #######      ", "    ##1111111##    ", "   #11111111111#   ", "  #1111111111111#  ", " #112211111112211# ", " #112311111112311# ", "  #1111111111111#  ", "  #11111#####111#  ", "   ##111111111##   ", "      #######      ", "                   ", "                   ", "                   ", "                   "
        ],
        outfit_Mercenario: [
            "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "    ###########    ", "   ##44#####44##   ", "  ##4444###4444##  ", " ##44444#4#44444## "
        ],
        outfit_Cultivador: [
            "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "    ##4444444##    ", "   #44445554444#   ", "  #4444555554444#  ", " #444455555554444# "
        ],
        outfit_Sobreviviente: [
            "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "       #####       ", "    ###55555###    ", "   ##445555544##   ", "  ##44445554444##  ", " ##4444445444444## "
        ],
        head_CYBERPUNK: [
            "      #######      ", "    ##4444444##    ", "   #44444444444#   ", "  #4444444444444#  ", " #445555555555544# ", " #445555555555544# ", "  #4444444444444#  ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   "
        ],
        head_FANTASIA: [
            "        ###        ", "      ##444##      ", "    ##4444444##    ", "   #44444444444#   ", "  #444       444#  ", " #444         444# ", " #444         444# ", " #444         444# ", "  #444       444#  ", "  #444       444#  ", "   ##44     44##   ", "     ##     ##     ", "                   ", "                   ", "                   ", "                   "
        ],
        head_CULTIVACION: [
            "        ###        ", "       ##4##       ", "      ##444##      ", "     ##44544##     ", "    ##4444444##    ", "   ##444   444##   ", "   #444     444#   ", "   #444     444#   ", "   #444     444#   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   "
        ],
        "head_SCI-FI": [
            "      #######      ", "    ##5555555##    ", "   #55555555555#   ", "  #5544444444455#  ", " #5544       4455# ", " #554         455# ", "  #55         55#  ", "  #55         55#  ", "   #55       55#   ", "    ##       ##    ", "                   ", "                   ", "                   ", "                   ", "                   ", "                   "
        ],
        head_APOCALIPSIS: [
            "                   ", "      #######      ", "    ##4444444##    ", "   #44444444444#   ", "  #4444     4444#  ", " #444         444# ", " #444         444# ", "  #444       444#  ", "   ##44     44##   ", "     ###   ###     ", "       #####       ", "      ##555##      ", "                   ", "                   ", "                   ", "                   "
        ],
        head_MODERNO: [
            "      #######      ", "    ##4444444##    ", "   #44444444444#   ", "  #4444     4444#  ", " #444         444# ", " #444         444# ", "  #44         44#  ", "                   ", "      ##   ##      ", "     #5#   #5#     ", "      ##   ##      ", "                   ", "                   ", "                   ", "                   ", "                   "
        ]
    },
    drawSprite: function(ctx, spriteName, startX, startY, pixelSize, flip = false, overridePalette = null) {
        const matrix = this.sprites[spriteName];
        if(!matrix) return;

        // Asignación de paleta: overridePalette permite recolorear un mismo sprite (ej. host_hd
        // reusado para compañeros con paleta comp1/comp2, sin necesitar dibujos nuevos por unidad).
        let palette = this.palettes[overridePalette];
        if (!palette) {
            palette = this.palettes.host;
            if(spriteName.includes('tree')) palette = this.palettes.tree;
            if(spriteName.includes('enemy')) palette = this.palettes.enemy;
            if(spriteName.includes('pet')) palette = this.palettes.pet;
            if(spriteName.includes('chest')) palette = this.palettes.loot;
            if(spriteName.includes('fx')) palette = this.palettes.fx;
        }

        for(let y = 0; y < matrix.length; y++) {
            for(let x = 0; x < matrix[y].length; x++) {
                const renderX = flip ? (matrix[y].length - 1 - x) : x;
                const char = matrix[y][x];
                if (char !== ' ' && palette[char]) {
                    ctx.fillStyle = palette[char];
                    ctx.fillRect(startX + (renderX * pixelSize), startY + (y * pixelSize), pixelSize, pixelSize);
                }
            }
        }
    }
};

const Engine = {
    // Convierte el texto de semilla en un número estable (estilo Minecraft): mismo texto → mismo
    // número siempre, así la UI puede mostrar/compartir un ID numérico sin perder el invariante D2.
    hashCode: function(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },

    // ── NÚCLEO ──────────────────────────────────────────────────────────
    // El motor verdadero. La UI no escribe el World; solo boot / step / act / query.
    // Sistemas y tablas viven abajo. Misma semilla → mismo World (D2).
    NUCLEO: { tick: 30, yearTicks: 360 },

    boot: function(seed, opts) {
        opts = opts || {};
        const meta = this.generateWorldMeta(seed);
        const universe = this.generateUniverse(seed, meta);
        return {
            seed: seed,
            meta: meta,
            universe: universe,
            tick: 0,
            agents: [],
            waitingForChoice: false,
            waitingForDecision: false,
            choiceLog: [],
            eventQueue: [],
            timeline: []
        };
    },
    step: function(worldState) {
        return this.runTicks(worldState);
    },
    act: function(worldState, action) {
        return this.applyAction(worldState, action);
    },
    query: function(worldState, lens) {
        if (!worldState) return null;
        const agent = worldState.agents && worldState.agents[0];
        const meta = worldState.meta || {};
        const u = worldState.universe;
        if (lens === "hud") {
            const zone = (agent && u && u.zones) ? u.zones.find(z => z.id === agent.zoneId) : null;
            const ceil = (zone && zone.rank) ? zone.rank : (meta.tierId || "F");
            const reg = (u && u.regime && this.REGIMES[u.regime]) ? this.REGIMES[u.regime] : null;
            return {
                year: Math.floor((worldState.tick || 0) / 360),
                era: meta.era || null,
                tipo: this.worldTypeOf(meta),
                tipoLabel: this.WORLD_TYPE_LABELS[this.worldTypeOf(meta)] || this.worldTypeOf(meta),
                epoch: this.epochOf(meta),
                epochLabel: (this.WORLD_EPOCHS[this.epochOf(meta)] || {}).label || this.epochOf(meta),
                rank: ceil,
                rankLabel: this.tierLabel(this.worldTypeOf(meta), ceil),
                regime: u ? u.regime : null,
                regimeLabel: reg ? reg.label : null,
                reach: this.impactReach(worldState, meta),
                hp: agent ? agent.hp : null,
                maxHp: agent ? agent.maxHp : null,
                name: agent ? agent.name : null,
                age: agent ? agent.age : null,
                lifespan: agent ? agent.lifespan : null
            };
        }
        if (lens === "ficha") return agent ? this.soulSheet(worldState, agent.originSoulId || agent.id) : null;
        if (lens === "harvest") return this.harvestKeep(worldState);
        if (lens === "crawl") return this.openingCrawl(worldState);
        if (lens === "story") return this.siftLifeStory(worldState);
        return null;
    },
    // El anhelo es fondo, pero PESA las tablas (no escribe el World por su cuenta).
    DESIRE_BIAS: {
        gloria:     { maestro: 1.55, iluminacion: 1.4, hallazgo: 1.25, tesoro: 1.15, traicion: 1.2 },
        hogar:      { aliado: 1.55, benefactor: 1.35, legado: 1.25, traicion: 0.7, cazador: 0.75 },
        cima:       { maestro: 1.45, tesoro: 1.35, reliquia: 1.3, veta: 1.25, plaga: 0.8 },
        linaje:     { aliado: 1.5, legado: 1.45, fruto: 1.2, traicion: 0.75 },
        longevidad: { elixir: 1.55, fruto: 1.45, legado: 1.3, plaga: 0.55, desviacion: 0.5, maldicion: 0.55 }
    },
    desireBias: function(agent, encId) {
        const id = agent && agent.desire && agent.desire.id;
        if (!id || !encId) return 1;
        const m = this.DESIRE_BIAS[id];
        if (!m) return 1;
        const v = m[encId];
        return v != null ? v : 1;
    },
    HOST_ROLES_BY_ERA: {
        CULTIVACION: ["El Héroe Verdadero", "El Villano Destinado", "Carne de Cañón", "El Extraño sin Destino"],
        FANTASIA:    ["El Héroe", "El Usurpador", "Carne de Cañón", "El Extraño"],
        CYBERPUNK:   ["El Runner", "El Traidor", "Carne de Cañón", "El Extraño"],
        "SCI-FI":    ["El Capitán", "El Disidente", "Carne de Cañón", "El Extraño"],
        APOCALIPSIS: ["El Superviviente", "El Tirano", "Carne de Cañón", "El Extraño"],
        MODERNO:     ["El Protagonista", "El Rival", "Carne de Cañón", "El Extraño"]
    },

    AGENT_NAMES: ["Zeke", "Lara", "Jin", "Kael", "Nova", "Rurik", "Sable", "Vex", "Ada", "Corvo", "Yara", "Drex"],
    AGENT_EPITHETS: ["el Sombrío", "de Hierro", "la Veloz", "sin Nombre", "el Errante", "de la Ceniza", "Ojo de Halcón", "el Tercero", "la Indómita", "de las Ruinas"],
    // Piezas, no catálogo: el nombre se FORJA (onset+coda × epíteto). 36×24×~40 ≈ 30k.
    NAME_ONSET: ["Ka","Ru","Ve","Sa","Li","Dra","Mor","Ash","Tal","Sen","Ner","Val","Har","Sel","Bri","Tor","Min","Cae","Rin","Fen","Jor","Kas","Lor","Ves","Dal","Ren","Shu","Nim","The","Iri","Nao","Kest","Or","Yl","Sol","Ael"],
    NAME_CODA:  ["el","in","or","ath","une","ara","en","os","iel","eth","is","an","ir","yn","as","ek","ia","um","or","ael","ost","een","iel","arn"],
    NAME_ONSET_BY_TYPE: {
        FANTASIA: ["Thal","Eld","Gwyn","Aer"],
        CYBERPUNK: ["Nyx","Kro","Zed","Vex"],
        CULTIVACION: ["Lan","Wei","Xun","Mei"],
        "SCI-FI": ["Aex","Ion","Syl","Qir"],
        APOCALIPSIS: ["Ash","Rust","Dreg","Marrow"],
        MODERNO: ["Mar","Cal","Jen","Rob"]
    },
    EPITHET_NOUNS: [
        { n: "Ceniza", g: "f" }, { n: "Hierro", g: "m" }, { n: "Niebla", g: "f" },
        { n: "Sal", g: "f" }, { n: "Hueso", g: "m" }, { n: "Marea", g: "f" },
        { n: "Carbón", g: "m" }, { n: "Viento", g: "m" }, { n: "Raíz", g: "f" },
        { n: "Polvo", g: "m" }, { n: "Vidrio", g: "m" }, { n: "Hielo", g: "m" },
        { n: "Sombra", g: "f" }, { n: "Cobre", g: "m" }, { n: "Espina", g: "f" },
        { n: "Limo", g: "m" }, { n: "Roca", g: "f" }, { n: "Brezal", g: "m" }
    ],
    EPITHET_ADJ: {
        m: ["Sombrío","Errante","Roto","Tercero","Breve","Mudo","Seco","Lejano"],
        f: ["Veloz","Indómita","Rota","Tercera","Breve","Muda","Seca","Lejana"]
    },
    BEAST_NAMES: ["Nube", "Hollín", "Diente", "Marea", "Lumen", "Carbón", "Niebla", "Quilla", "Eco", "Boreal"],
    SHIP_NAMES: ["Relámpago", "Cisne", "Última Milla", "Hueso", "Vespre", "Nadir", "Quilla Rota", "Sirena"],
    AGENT_CLASSES: ["Sobreviviente", "Cultivador", "Mercenario"],
    ERAS: ["FANTASIA", "CYBERPUNK", "CULTIVACION", "SCI-FI", "APOCALIPSIS", "MODERNO"],
    WORLD_TYPES: ["FANTASIA", "CYBERPUNK", "CULTIVACION", "SCI-FI", "APOCALIPSIS", "MODERNO"],
    WORLD_TYPE_LABELS: {
        FANTASIA: "Fantasía", CYBERPUNK: "Neón", CULTIVACION: "Cultivo",
        "SCI-FI": "Órbita", APOCALIPSIS: "Yermo", MODERNO: "Mundano"
    },
    // ERA = tiempo del mundo, NO el tipo. Un neón puede estar en Alba o en Ruinas.
    WORLD_EPOCHS: {
        ALBA:   { label: "Alba",   prose: "al alba de su historia" },
        AUGE:   { label: "Auge",   prose: "en el auge de sus potencias" },
        OCASO:  { label: "Ocaso",  prose: "en el ocaso de las leyes viejas" },
        RUINAS: { label: "Ruinas", prose: "entre las ruinas de lo que fue" }
    },
    worldTypeOf: function(meta) {
        return (meta && (meta.worldType || meta.era)) || "MODERNO";
    },
    epochOf: function(meta) {
        return (meta && meta.epoch) || "AUGE";
    },
    ERA_IN_PROSE: {
        FANTASIA: "leyenda", CYBERPUNK: "neón", CULTIVACION: "cultivo",
        "SCI-FI": "las estrellas", APOCALIPSIS: "el yermo", MODERNO: "este siglo"
    },

    // PERFILES DE ERA (pedido de Taco: los TIPOS de mundo no son iguales — y sus ejemplos eran GUÍA,
    // no reglas absolutas). Calibrado contra la práctica real del género (v1.17.1): en los gacha los
    // PERSONAJES son el corazón del pool en TODOS los settings (Punishing: Gray Raven / Zenless Zone
    // Zero son sci-fi y viven de compañeras sintéticas), y la doctrina de loot tables es "pesos
    // sesgados por tema, no gates absolutos" (smart loot: el contexto SUMA peso, no excluye).
    // `w` = peso de aparición en génesis (antiguos dominan el género; futuristas/apocalipsis raros).
    // `cardTypes` = pesos por TIPO al forjar: TECNOLOGÍA pesa fuerte en futuristas y existe como
    // rareza en antiguos (reliquia precursora, trope clásico); COMPAÑERO pesa en TODAS las eras con
    // el sabor local (`followers`). `techNative` decide si la TECNOLOGÍA forjada es local o reliquia.
    // Todo SESGA tablas keyeadas por semilla (D2, mismo principio que la Fortuna): cero azar nuevo.
    // v1.18.0 (Taco): el catálogo por mundo no es solo compañeras y reliquias — también HABILIDAD
    // (artes/técnicas), MASCOTA (bestias espirituales, familiares, drones) y NAVE (barcos del tesoro
    // xianxia, cruceros de guerra sci-fi). Cada era pesa TODOS los tipos con su sabor: `pets` y
    // `ships` nombran la variante local (misma mecánica que `followers`).
    ERA_PROFILES: {
        FANTASIA:    { w: 3.0, cardTypes: { "OBJETO": 4, "TALENTO": 3, "COMPAÑERO": 3, "MASCOTA": 2,   "HABILIDAD": 2,   "NAVE": 0.5, "TECNOLOGÍA": 0.5 },
                       followers: ["Escudera", "Escudero", "Aprendiz"], pets: ["Familiar", "Bestia del Bosque"], ships: ["Navío Volador"] },
        CULTIVACION: { w: 3.0, cardTypes: { "OBJETO": 3, "TALENTO": 3, "COMPAÑERO": 4, "MASCOTA": 2.5, "HABILIDAD": 3,   "NAVE": 0.5, "TECNOLOGÍA": 0.5 },
                       followers: ["Discípula", "Discípulo", "Dao-Compañera"], pets: ["Bestia Espiritual", "Ave del Trueno"], ships: ["Barco del Tesoro"] },
        MODERNO:     { w: 2.0, cardTypes: { "OBJETO": 4, "TALENTO": 3, "COMPAÑERO": 3, "MASCOTA": 1,   "HABILIDAD": 2,   "NAVE": 1,   "TECNOLOGÍA": 2 },
                       followers: ["Agente", "Contacto", "Guardaespaldas"], pets: ["Perro de Combate", "Halcón Adiestrado"], ships: ["Vehículo Blindado", "Helicóptero de Asalto"], techNative: true },
        CYBERPUNK:   { w: 1.5, cardTypes: { "OBJETO": 3, "TALENTO": 2, "COMPAÑERO": 4, "MASCOTA": 1,   "HABILIDAD": 2,   "NAVE": 1.5, "TECNOLOGÍA": 4 },
                       followers: ["Compañera Sintética", "Androide", "Runner"], pets: ["Dron Mascota", "Gato Sintético"], ships: ["AV de Combate", "Deslizador"], techNative: true },
        "SCI-FI":    { w: 1.5, cardTypes: { "OBJETO": 3, "TALENTO": 2, "COMPAÑERO": 4, "MASCOTA": 0.5, "HABILIDAD": 1.5, "NAVE": 3,   "TECNOLOGÍA": 4 },
                       followers: ["Androide", "IA Encarnada", "Unidad de Combate"], pets: ["Dron de Compañía", "Simbionte"], ships: ["Crucero de Guerra", "Fragata", "Corbeta de Asalto"], techNative: true },
        APOCALIPSIS: { w: 1.0, cardTypes: { "OBJETO": 4, "TALENTO": 3, "COMPAÑERO": 3, "MASCOTA": 1.5, "HABILIDAD": 2,   "NAVE": 0.5, "TECNOLOGÍA": 2 },
                       followers: ["Rastreadora", "Superviviente", "Compañera del Yermo"], pets: ["Bestia Mutante", "Sabueso del Yermo"], ships: ["Carguero Blindado", "Zepelín de Chatarra"], techNative: true }
    },

    // Selección ponderada determinista: `roll` ∈ [0,1) ya viene del rng keyeado — esta función NO
    // consume azar propio, solo reparte ese roll sobre los pesos (D2 intacto).
    pickWeighted: function(items, roll) {
        const total = items.reduce((s, it) => s + it.w, 0);
        let r = roll * total;
        for (const it of items) { if (r < it.w) return it.v; r -= it.w; }
        return items[items.length - 1].v;
    },
    fitsEra: function(entry, era) {
        if (!entry || !era) return true;
        const e = entry.eras;
        return !e || e.length === 0 || e.indexOf(era) !== -1;
    },
    classesFor: function(era) {
        return this.CLASSES_BY_ERA[era] || this.AGENT_CLASSES;
    },
    tierLabel: function(era, id) {
        const m = this.WORLD_TIER_LABELS[era];
        if (m && m[id]) return m[id];
        return (this.WORLD_TIERS[id] && this.WORLD_TIERS[id].desc) || id || "—";
    },

    // Progresión innata del Anfitrión por año sobrevivido (Ascenso). Antes el Host arrancaba en
    // atk/def 10 y solo crecía por botín al azar, mientras el poder enemigo escala garantizado
    // (año·4·suerte·rango): una carrera que el Host perdía por diseño. El Ascenso le da crecimiento
    // determinista con identidad de clase, escalado por el Rango del mundo (un mundo más denso forja
    // más rápido — lógica xianxia). Es capa 1 pura: aritmética de clase/rango/año, sin rng.
    CLASS_ARCHETYPES: {
        tanque: { atk: 3, def: 6, hp: 10 },
        filo:   { atk: 8, def: 3, hp: 4 },
        via:    { atk: 6, def: 5, hp: 6 }
    },
    CLASS_OF: {
        Sobreviviente: "tanque", Errante: "tanque", Nomada: "tanque", Colono: "tanque", Chatarra: "tanque", Civil: "tanque",
        Mercenario: "filo", Guerrero: "filo", Chrome: "filo", Marine: "filo", Saqueador: "filo", Cazador: "filo",
        Cultivador: "via", Mago: "via", Netrunner: "via", Piloto: "via", Medico: "via", Agente: "via"
    },
    CLASS_GROWTH: {
        "Sobreviviente": { atk: 3, def: 6, hp: 10 },
        "Cultivador":    { atk: 6, def: 5, hp: 6 },
        "Mercenario":    { atk: 8, def: 3, hp: 4 }
    },
    classGrowth: function(cls) {
        const key = this.CLASS_OF[cls];
        if (key && this.CLASS_ARCHETYPES[key]) return this.CLASS_ARCHETYPES[key];
        return this.CLASS_GROWTH[cls] || this.CLASS_ARCHETYPES.filo;
    },
    CLASSES_BY_ERA: {
        CULTIVACION: ["Cultivador", "Mercenario", "Sobreviviente"],
        FANTASIA:    ["Guerrero", "Mago", "Errante"],
        CYBERPUNK:   ["Chrome", "Netrunner", "Nomada"],
        "SCI-FI":    ["Marine", "Piloto", "Colono"],
        APOCALIPSIS: ["Saqueador", "Medico", "Chatarra"],
        MODERNO:     ["Cazador", "Agente", "Civil"]
    },

    WORLD_TIERS: {
        "F": { mult: 0.5, desc: "Menor" },
        "E": { mult: 0.8, desc: "Bajo" },
        "D": { mult: 1.0, desc: "Estándar" },
        "C": { mult: 1.5, desc: "Hostil" },
        "B": { mult: 2.5, desc: "Crítico" },
        "A": { mult: 4.0, desc: "Extremo" },
        "S": { mult: 8.0, desc: "Absoluto" }
    },
    // El techo F–S es el mismo número. El NOMBRE es del mundo: un cyberpunk no es Dominio Divino.
    WORLD_TIER_LABELS: {
        CULTIVACION: { F: "Mundano", E: "Qi escaso", D: "Estándar", C: "Núcleo", B: "Nascente", A: "Trascendental", S: "Dominio" },
        FANTASIA:    { F: "Aldea", E: "Condado", D: "Reino", C: "Imperio", B: "Leyenda", A: "Mito", S: "Épica" },
        CYBERPUNK:   { F: "Calle", E: "Barrio", D: "Metro", C: "Megacorp", B: "Arco", A: "Órbita", S: "La Red" },
        "SCI-FI":    { F: "Colonia", E: "Sistema", D: "Sector", C: "Flota", B: "Núcleo", A: "Hegemonía", S: "Galaxia" },
        APOCALIPSIS: { F: "Campamento", E: "Zona", D: "Páramo", C: "Horda", B: "Fortaleza", A: "Yermo", S: "El Fin" },
        MODERNO:     { F: "Pueblo", E: "Ciudad", D: "Nación", C: "Potencia", B: "Bloque", A: "Orden", S: "Hegemonía" }
    },

    // NODE_TIERS (Fase 1 del diseño macro-escala, ver docs/diseno-macro-escala-jerarquia-v1.0.md §4):
    // capacidad demográfica por ESCALA de nodo. La masa (crowd) es un agregado {count,avgAge,avgPower}
    // de aritmética O(1), así que sostener 10^7 cuesta lo mismo que 200 (medido en
    // tools/bench-world-size.js). `cap` es la capacidad de carga base del tier; la riqueza del nodo la
    // modula. Reemplaza el freno viejo `wealth*2` (que topeaba TODA zona a ≤200 y aplastaba cualquier
    // población — medido). Estos números son la BASE que el mundo "ya simulado" implica (§1-bis): una
    // ciudad implica ~10^7 almas, no 60 que crecen. Numéricamente 10^7 (y hasta 10^12) queda muy por
    // debajo de 2^53, sin pérdida de precisión (la integridad a escala planeta se afina en Fase 5).
    // `child` = tier de los hijos al expandir (LOD, Fase 2 §3); `fanout` = cuántos hijos deterministas
    // se crean. `null` en child = hoja (la ZONA es la unidad DETAILED donde corre la capa 2 social).
    NODE_TIERS: {
        ZONA:       { cap: 1e3,  label: "barrio",     child: null,         fanout: 0 },
        CIUDAD:     { cap: 1e7,  label: "ciudad",     child: "ZONA",       fanout: 4 },
        CONTINENTE: { cap: 1e8,  label: "continente", child: "CIUDAD",     fanout: 4 },
        PLANETA:    { cap: 1e12, label: "planeta",    child: "CONTINENTE", fanout: 3 },
        UNIVERSO:   { cap: 1e15, label: "universo",   child: "PLANETA",    fanout: 3 }
    },

    // `curve` (C13 / Director de tensión): la FORMA de la curva de intensidad de esta trama — cada plot
    // sube y baja distinto (xianxia "arco de reino" = climb; apocalipsis = caída larga; exploración =
    // mesetas con picos; regresión/locura = dientes de sierra). Ver STORY_CURVES / storyPhase.
    WORLD_PLOTS: [
        { id: "PLOT_APOCALYPSE", title: "Cuenta Regresiva", desc: "Calamidades periódicas patrocinadas por constelaciones.", curve: "decline", eras: ["APOCALIPSIS", "MODERNO", "FANTASIA", "SCI-FI"] },
        { id: "PLOT_PLAYERS", title: "Invasión 4ta Pared", desc: "Forasteros de otro hilo descienden a saquear este universo.", curve: "climb" },
        { id: "PLOT_MADNESS", title: "Corrupción Eldritch", desc: "Dioses Exteriores vigilan. El poder cuesta cordura.", curve: "sawtooth", eras: ["FANTASIA", "SCI-FI", "CULTIVACION", "APOCALIPSIS"] },
        { id: "PLOT_REGRESSION", title: "Bucle Temporal", desc: "Un regresor altera el destino constantemente.", curve: "sawtooth" },
        { id: "NMS_EXPLORATION", title: "El Atlas Infinito", desc: "Universo fractal de portales procedimentales.", curve: "plateau", eras: ["SCI-FI", "CYBERPUNK", "FANTASIA"] },
        { id: "NMS_SENTINEL", title: "Justicia Centinela", desc: "Máquinas eternas purgan la vida avanzada.", curve: "climb", eras: ["SCI-FI", "CYBERPUNK", "MODERNO"] },
        { id: "NMS_ANOMALY", title: "Desviación del Vacío", desc: "El centro del universo está colapsando.", curve: "decline", eras: ["SCI-FI", "CYBERPUNK", "APOCALIPSIS", "FANTASIA"] }
    ],

    // RÉGIMEN del mundo (§6.3, Ladrillo 3): el carácter de una era — pacífico / en conflicto /
    // pos-cataclismo. Estado DERIVADO determinista (no azar nuevo): sale del plot, la era, el grado y la
    // tensión de guerra, y puede TRANSICIONAR (la Calamidad del PLOT_APOCALYPSE vuelve el mundo un páramo).
    // En la fase 3a es NARRATIVO (sabor + transición); modular tasas macro es la fase 3b.
    REGIMES: {
        pacifico:  { label: "Paz",            desc: "un tiempo de paz",           color: "text-green" },
        conflicto: { label: "Conflicto",      desc: "una era de conflicto",       color: "text-yellow" },
        posapo:    { label: "Post-Cataclismo", desc: "un páramo tras el cataclismo", color: "text-red" },
        // — B3b (densidad): 3 regímenes que CRISTALIZAN con el tiempo (no en génesis) según el carácter
        // sostenido del mundo — paz prolongada → edad dorada/despertar; guerra sin fin → decadencia. —
        prosperidad: { label: "Edad Dorada",   desc: "una edad dorada",            color: "text-gold" },
        despertar:   { label: "Despertar",     desc: "un despertar del mundo",     color: "text-cyan" },
        decadencia:  { label: "Decadencia",    desc: "una era que se apaga",       color: "text-red" }
    },

    // Efectos MECÁNICOS del régimen (§6.3, fase 3b): la paz aquieta las guerras y multiplica la vida; el
    // conflicto enciende las guerras; el pos-cataclismo desangra la natalidad (el mundo se vacía). `war`
    // multiplica warChance; `birth` multiplica la natalidad (masa y nacimientos nombrados). Neutro = 1.
    REGIME_EFFECTS: {
        pacifico:  { war: 0.55, birth: 1.20 },
        conflicto: { war: 1.60, birth: 1.00 },
        posapo:    { war: 1.05, birth: 0.60 },
        // B3b: la edad dorada florece (poca guerra, mucha vida); el despertar es paz con chispa; la
        // decadencia se apaga (mucha guerra, poca natalidad, pero no el páramo total del pos-cataclismo).
        prosperidad: { war: 0.40, birth: 1.30 },
        despertar:   { war: 0.80, birth: 1.15 },
        decadencia:  { war: 1.35, birth: 0.75 }
    },

    // Fase 4 (§6.3 tabla de régimen + §7 "régimen → tipo"): el carácter del mundo TIÑE lo que se
    // deriva. Sabor de CONTENIDO, NO de balance — la súper-fórmula del stat (+N ATK) queda intacta;
    // el régimen sólo cambia el TIPO y el NOMBRE del objeto forjado y le pega una etiqueta temática.
    // La paz vuelca el excedente en oficio y utilidad (artesanía); el conflicto forja armas de guerra;
    // el pos-cataclismo sólo deja carroña mutada (una fracción se forja como MUTACIÓN asimilable).
    // `typeChance` > 0 reemplaza el tipo OBJETO por `type` en esa fracción de las forjas.
    // Fase 9 (§10.2, branching derivado): multiplicador de FANOUT sobre la cifra nominal del tier
    // (NODE_TIERS.*.fanout) — "una zona en conflicto no sostiene 100 ciudades; una pacífica sin
    // infraestructura tampoco". Sin régimen conocido, `deriveFanout` no aplica ningún multiplicador
    // (queda en el nominal, D8: sin regresión). Con régimen, la paz favorece más subdivisión, el
    // conflicto la reduce, el pos-cataclismo la aplasta.
    FANOUT_REGIME_MULT: { pacifico: 1.25, conflicto: 0.7, posapo: 0.45, prosperidad: 1.4, despertar: 1.2, decadencia: 0.6 },

    REGIME_FLAVOR: {
        pacifico:  { tag: "ARTESANAL", type: "OBJETO",   typeChance: 0,   affix: ["del Artesano", "de la Cosecha Dorada", "del Gremio", "de la Prosperidad", "del Maestro Herrero"] },
        conflicto: { tag: "DE GUERRA", type: "OBJETO",   typeChance: 0,   affix: ["de Guerra", "del Frente", "del Conquistador", "de las Trincheras", "del Verdugo"] },
        posapo:    { tag: "MUTÁGENO",  type: "MUTACIÓN", typeChance: 0.5, affix: ["de la Carroña", "Mutágeno/a", "de las Cenizas", "del Erial", "de la Plaga"] },
        // B3b: la edad dorada refina el oficio; el despertar destila reliquias espirituales; la decadencia
        // suelta lo que una era moribunda deja atrás. Ninguno cambia el TIPO (typeChance 0) — solo sabor.
        prosperidad: { tag: "DE LA EDAD DORADA", type: "OBJETO", typeChance: 0, affix: ["del Esplendor", "de la Corte", "del Loto Dorado", "de la Abundancia", "del Cénit"] },
        despertar:   { tag: "DEL DESPERTAR",     type: "OBJETO", typeChance: 0, affix: ["del Alba", "del Qi Naciente", "de la Vena Espiritual", "del Renacer", "del Presagio"] },
        decadencia:  { tag: "CREPUSCULAR",       type: "OBJETO", typeChance: 0, affix: ["del Ocaso", "de la Ruina", "del Último Bastión", "de la Ceniza Fría", "del Réquiem"] }
    },

    // Deriva el régimen del MUNDO del Host (determinista). El plot/era mandan; la tensión de guerra
    // desempata en los mundos "neutros". La Calamidad del PLOT_APOCALYPSE (año 10/20/30) transiciona el
    // mundo a pos-cataclismo — un mundo puede cambiar de carácter con el tiempo.
    deriveRegime: function(meta, universe, year) {
        if (meta.era === "APOCALIPSIS") return "posapo";
        if (meta.plot.id === "PLOT_APOCALYPSE") return year >= 10 ? "posapo" : "conflicto";
        if (meta.plot.id === "NMS_ANOMALY") return "posapo";
        if (["PLOT_PLAYERS", "PLOT_REGRESSION", "PLOT_MADNESS", "NMS_SENTINEL"].includes(meta.plot.id)) return "conflicto";
        if (meta.plot.id === "NMS_EXPLORATION") return "pacifico";
        const wars = universe && universe.counters ? (universe.counters.wars || 0) : 0;
        const ratio = wars / Math.max(1, year);
        // B3b: los regímenes de carácter CRISTALIZAN con el tiempo (year ≥ 8) — un mundo joven o la
        // génesis (universe null, year 0) quedan en el eje pacifico/conflicto de siempre (sin regresión
        // en los años tempranos que miden T1/T3/T5). Con historia sostenida: paz casi total → Edad Dorada,
        // paz con chispa → Despertar, guerra sin fin → Decadencia. Determinista (sólo lee wars/year, D2).
        if (year >= 8) {
            if (ratio > 1.0) return "decadencia";
            if (ratio < 0.06) return "prosperidad";
            if (ratio < 0.20) return "despertar";
        }
        return ratio > 0.5 ? "conflicto" : "pacifico";
    },

    HOST_ROLES: ["El Héroe Verdadero", "El Villano Destinado", "Carne de Cañón", "El Extraño sin Destino"],

    // Checks narrativos guionados en años fijos (10/20/30) por trama; DEFAULT cubre las tramas sin
    // entrada propia (NMS_EXPLORATION/SENTINEL/ANOMALY). `fatal: true` termina la corrida en un fallo.
    FIXED_EVENTS: {
        "PLOT_APOCALYPSE": {
            10: { stat: "def", baseReq: 40, tagWin: "fix_apo_10_win", tagLose: "fix_apo_10_lose", fatal: true, bossDrop: "boss_apo_10" },
            30: { stat: "atk", baseReq: 150, tagWin: "fix_apo_30_win", tagLose: "fix_apo_30_lose", fatal: true, bossDrop: "boss_apo_30" }
        },
        "PLOT_PLAYERS": {
            5:  { stat: "atk", baseReq: 25, tagWin: "fix_pla_5_win", tagLose: "fix_pla_5_lose", fatal: false, dmg: 50 },
            20: { stat: "atk", baseReq: 120, tagWin: "fix_pla_20_win", tagLose: "fix_pla_20_lose", fatal: true, bossDrop: "boss_pla_20" }
        },
        "PLOT_MADNESS": {
            10: { stat: "hp", baseReq: 200, tagWin: "fix_mad_10_win", tagLose: "fix_mad_10_lose", fatal: true, bossDrop: "boss_mad_10" }
        },
        "PLOT_REGRESSION": {
            15: { stat: "def", baseReq: 80, tagWin: "fix_reg_15_win", tagLose: "fix_reg_15_lose", fatal: true, bossDrop: "boss_reg_15" }
        },
        "DEFAULT": {
            10: { stat: "atk", baseReq: 35, tagWin: "fix_def_10_win", tagLose: "fix_def_10_lose", fatal: false, dmg: 70 }
        }
    },

    // Punto de Bifurcación (capa 2, interacción autoritativa): una vez por corrida, en el año listado
    // por trama, el Admin elige un rumbo entre DECISION_OPTIONS. El motor NO tira nada al azar acá —
    // solo pausa (worldState.waitingForDecision) y expone las opciones; el efecto se aplica recién en
    // Engine.resolveDecision cuando llega la elección del espectador (Mundo = f(semilla, choiceLog)).
    DECISION_YEARS: {
        "PLOT_APOCALYPSE": 5,
        "PLOT_PLAYERS": 12,
        "PLOT_MADNESS": 5,
        "PLOT_REGRESSION": 7,
        "DEFAULT": 5
    },

    // Cada rumbo entrega un Talento real (carta de cards_db.js, misma regla "+N ATK/DEF/HP") en vez
    // de un número invisible: el jugador ve y conserva lo que ganó, igual que cualquier otra carta.
    DECISION_OPTIONS: [
        { id: "loyalist", label: "Lealtad a la facción", cardId: "t_path_loyalist", milestone: "path_loyalist", tag: "decision_loyalist" },
        { id: "lonewolf", label: "Camino en solitario", cardId: "t_path_lonewolf", milestone: "path_lonewolf", tag: "decision_lonewolf" },
        { id: "opportunist", label: "Doble juego calculado", cardId: "t_path_opportunist", milestone: "path_opportunist", tag: "decision_opportunist" }
    ],

    NARRATIVE_MILESTONES: {
        FANTASIA: { factions: ["el Gremio de Aventureros", "la Academia Mágica", "la Orden del Grifo", "los Herejes Oscuros"], nemeses: ["el Rey Demonio", "un Dragón Ancestral", "el Archimago Corrupto", "el Culto del Abismo"], bonds: ["una elfa exiliada", "la princesa del reino", "un mercenario veterano", "un espíritu del bosque"] },
        CYBERPUNK: { factions: ["la Mega-Corporación", "los Nómadas del Yermo", "el Sindicato de Hackers", "la Policía Privada"], nemeses: ["el CEO de Alfa-Corp", "una IA Rebelde Evolucionada", "el Escuadrón Cibernético", "el Cártel de Implantes"], bonds: ["una netrunner misteriosa", "un androide médico", "un traficante de datos", "un ex-policía cyborg"] },
        CULTIVACION: { factions: ["la Secta de la Espada Antigua", "el Clan Imperial", "el Pabellón de la Alquimia", "el Valle Demoníaco"], nemeses: ["un Joven Maestro Arrogante", "el Anciano Traidor", "el Patriarca Demoníaco", "la Tribu Celestial"], bonds: ["la Santa de Hielo", "una bestia espiritual ancestral", "un alma atrapada en un anillo", "una asesina reformada"] },
        "SCI-FI": { factions: ["la Federación Galáctica", "los Piratas del Vórtice", "el Imperio Estelar", "los Recolectores de Chatarra"], nemeses: ["el Almirante Oscuro", "la Mente Colmena Alienígena", "el Devorador de Planetas", "la IA de Defensa Planetaria"], bonds: ["una contrabandista espacial", "la IA táctica de la nave", "un alienígena renegado", "un cazarrecompensas"] },
        APOCALIPSIS: { factions: ["el Campamento de Supervivientes", "los Saqueadores del Yermo", "la Zona Segura Militar", "los Cultistas del Fin"], nemeses: ["el Avatar del Fin", "el Rey Zombi Mutante", "el Señor de las Bestias", "la Inteligencia Enjambre"], bonds: ["un huérfano con poderes latentes", "un francotirador solitario", "un científico enloquecido", "un perro mutante leal"] },
        MODERNO: { factions: ["la Organización Secreta", "la Mafia del Submundo", "el Departamento de Cazadores", "los Iluminati"], nemeses: ["el Asesino Sombra", "el Monarca Clandestino", "un Ente Paranormal", "el Sindicato de Sombras"], bonds: ["un detective privado", "una estudiante con doble vida", "un informante anónimo", "un exorcista a sueldo"] },
        UNIVERSAL: { factions: ["los Supervivientes Errantes", "la Resistencia Dimensional"], nemeses: ["una Entidad Desconocida", "un Tirano Interdimensional", "el Guardián del Vórtice"], bonds: ["un viajero misterioso", "su guardaespaldas jurado", "una anomalía amigable"] }
    },

    PROCEDURAL_DICT: {
        FANTASIA: { bases: ["Espada", "Grimorio", "Amuleto"], prefijos: ["Maldito/a", "Divino/a"], sufijos: ["del Rey Caído", "del Dragón"] },
        CYBERPUNK: { bases: ["Implante", "Exoesqueleto", "Visor"], prefijos: ["Prototipo", "Militar"], sufijos: ["con IA inestable", "MK-IV"] },
        CULTIVACION: { bases: ["Píldora", "Talisman", "Túnica"], prefijos: ["Celestial", "Demoníaco/a"], sufijos: ["purificador/a", "del Loto"] },
        "SCI-FI": { bases: ["Ráser", "Sable de Luz", "Núcleo"], prefijos: ["de Plasma", "Gravitacional"], sufijos: ["sobrecargado", "cuántico/a"] },
        // Fase 4 (§6.1): APOCALIPSIS y MODERNO tenían el hueco marcado en el diseño — caían al pool
        // UNIVERSAL y forjaban "Cuerpo/Aura/Técnica" fuera de tono. Ahora derivan con sabor propio.
        APOCALIPSIS: { bases: ["Chatarra", "Injerto", "Máscara Antigás"], prefijos: ["Irradiado/a", "Oxidado/a"], sufijos: ["del Yermo", "de la Zona Muerta"] },
        MODERNO: { bases: ["Pistola", "Prototipo", "Gadget"], prefijos: ["Militar", "Clasificado/a"], sufijos: ["de contrabando", "Serie-0"] },
        UNIVERSAL: { bases: ["Cuerpo", "Aura", "Técnica"], prefijos: ["Mutante", "Supremo/a"], sufijos: ["de supervivencia", "inquebrantable"] }
    },

    // Motor micro-Tracery: cada tag (#ctx_batalla# etc.) se resuelve a una de sus variantes por rng,
    // y puede anidar otros tags dentro del texto elegido (expandGrammar se llama a sí mismo sobre
    // ellos). Reemplaza a STORY_TEMPLATES/formatStory con mucha más variedad combinatoria.
    CFG_DICTIONARY: {
        "story_combat_win": [
            "#ctx_batalla# {name} #act_ataque# #nemesis_desc#, #cons_victoria#.",
            "Durante #tiempo_duracion# {name} resistió el asedio de #nemesis_desc#. #climax_batalla#, #cons_victoria#.",
            "#ctx_batalla# {name} enfrentó a #nemesis_desc#. #climax_batalla#, #cons_victoria#.",
            "Lo que empezó como una escaramuza se volvió leyenda: {name} #act_ataque# #nemesis_desc#, #cons_victoria#.",
            "#nemesis_desc# creyó tener acorralado a {name}. Se equivocó: #climax_batalla#, #cons_victoria#."
        ],
        "story_combat_lose": [
            "#ctx_peligro# {name} #act_defensa_fallida# #nemesis_desc#, #cons_derrota#.",
            "Las defensas colapsaron ante #nemesis_desc#. {name} #cons_derrota#.",
            "#ctx_peligro# el golpe de #nemesis_desc# alcanzó a {name}. {name} #cons_derrota#.",
            "{name} subestimó a #nemesis_desc# y #cons_derrota#."
        ],
        "story_exploration": [
            "#ctx_viaje# {name} descubrió #lugar_ruina# perteneciente a #faction_desc#. #descubrimiento#.",
            "Guiado por #motivo_viaje#, {name} y {bond} se infiltraron en #lugar_ruina#. #descubrimiento#.",
            "#ctx_viaje# {name} se adentró en #lugar_ruina#. #descubrimiento#.",
            "{name} siguió #motivo_viaje# hasta #lugar_ruina#, hogar de #faction_desc#. #descubrimiento#.",
            "#ctx_viaje# el rastro llevó a {name} a #lugar_ruina#. #descubrimiento#."
        ],
        "story_downtime": [
            "Buscando paz mental, {name} se refugió con {bond}. Ambos reflexionaron sobre el peso de sobrevivir.",
            "{name} pasó los meses #act_descanso#, lejos del fragor de {faction}.",
            "Sin batallas a la vista, {name} #act_descanso# y escuchó las historias de {bond}.",
            "{name} consolidó su poder dentro de {faction}, #act_descanso# entre susurros de intriga.",
            "Un raro respiro: {name} #act_descanso#, midiendo en silencio su distancia con {nemesis}.",
            "Los caminos quedaron tranquilos. {name} #act_descanso# junto a {bond}."
        ],
        "act_descanso": ["afilando sus técnicas", "curando viejas heridas", "reforjando su equipo", "tejiendo alianzas", "estudiando mapas y augurios", "entrenando sin descanso", "meditando junto a una vena de poder", "poniendo en orden viejas deudas", "leyendo manuscritos prohibidos", "forjando lazos con los suyos", "templando su voluntad en soledad"],

        "ctx_batalla": ["En un páramo teñido de cenizas,", "Desatando un aura abrumadora,", "Bajo una lluvia torrencial,", "Aprovechando una brecha en la vanguardia,", "Al filo del amanecer,", "En medio de una tormenta de arena,", "Con el cielo partido por rayos,", "Sobre un campo sembrado de estandartes rotos,", "Cuando las campanas de guerra callaron de golpe,", "Rodeado y sin rutas de escape,", "A la sombra de una montaña que ardía,"],
        "tiempo_duracion": ["tres días y tres noches", "un ciclo lunar completo", "un combate que pareció eterno", "unas breves pero sangrientas horas", "toda una estación", "un instante que decidió todo", "siete asaltos sin tregua", "lo que dura un suspiro y una vida", "una vigilia entera bajo las estrellas"],
        "act_ataque": ["despedazó sin piedad a", "ejecutó una técnica prohibida contra", "rompió las formaciones de", "incineró las líneas de", "atravesó las filas de", "hizo añicos el orgullo de", "desarticuló la estrategia de", "quebró la moral de", "barrió del campo a", "selló el destino de"],
        "nemesis_desc": ["las tropas de {nemesis}", "los lugartenientes de {nemesis}", "la élite asesina de {nemesis}", "las abominaciones de {nemesis}", "la vanguardia de {nemesis}", "los campeones jurados de {nemesis}", "la horda al servicio de {nemesis}", "los verdugos enviados por {nemesis}"],
        "climax_batalla": ["Al final, el poder de {name} fue absoluto", "Un último golpe devastador decidió el destino", "La desesperación consumió al enemigo", "El campo entero contuvo el aliento", "Ni las leyendas preveían semejante furia", "El suelo mismo cedió ante el choque", "Cuando el polvo bajó, solo uno seguía en pie", "La técnica final no dejó lugar a la duda"],
        "cons_victoria": ["dejando un cráter humeante a su paso", "tiñendo la tierra de un rojo intenso", "imponiendo un silencio sepulcral", "reclamando el dominio de la zona", "grabando su nombre en el miedo ajeno", "sin dejar un solo enemigo en pie", "sembrando su leyenda en cada testigo", "cobrando un precio que el rival recordaría por generaciones", "plantando su estandarte sobre las ruinas"],

        "ctx_peligro": ["Superado por una emboscada repentina,", "Debido a un error táctico crítico,", "Bajo el fuego concentrado enemigo,", "Traicionado por un aliado en quien confiaba,", "Agotado tras días sin dormir,", "Cercado en terreno desconocido,", "Con las provisiones agotadas,", "Cuando el augurio se volvió en su contra,", "Herido antes de que empezara el verdadero combate,"],
        "act_defensa_fallida": ["no pudo repeler el embate de", "fue acorralado sin piedad por", "perdió terreno rápidamente ante", "quedó a merced de", "no vio venir el golpe de", "cedió posición tras posición ante", "agotó sus últimas reservas frente a"],
        "act_ataque_enemigo": ["lanzó un ataque sorpresivo", "desató un poder catastrófico", "rompió los escudos protectores", "tendió una trampa perfecta", "cerró todas las salidas", "envenenó el terreno de antemano", "atacó donde menos se esperaba"],
        "cons_derrota": ["sufrió heridas letales, forzando una retirada", "dejó un rastro de sangre tras de sí", "quemó su fuerza vital para escapar de una muerte segura", "cayó de rodillas jurando venganza", "apenas logró arrastrarse hasta las sombras", "pagó con carne y hueso su arrogancia", "escapó dejando atrás todo lo que había ganado"],

        "ctx_viaje": ["Ignorando las leyendas locales,", "Siguiendo extrañas señales energéticas,", "En busca de recursos vitales,", "Empujado por un presentimiento,", "Tras el rumor de un tesoro,", "Guiado por una estrella que no figuraba en mapa alguno,", "Huyendo de un pasado que lo perseguía,", "Persiguiendo el eco de una voz conocida,"],
        "motivo_viaje": ["un mapa en ruinas", "una visión perturbadora", "los consejos de {bond}", "una voz en sus sueños", "el eco de una vieja profecía", "la promesa de una técnica perdida", "una deuda que debía saldar", "el rastro de un maestro desaparecido"],
        "lugar_ruina": ["un búnker olvidado", "un templo subterráneo", "una fortaleza abandonada", "un laboratorio en cuarentena", "una cripta sellada por siglos", "una ciudad tragada por la arena", "una torre suspendida en el vacío", "un santuario devorado por la selva", "un pecio varado entre dimensiones", "una mina donde el aire mismo brillaba"],
        "faction_desc": ["{faction}", "los antiguos líderes de {faction}", "los desertores de {faction}", "una secta olvidada", "un imperio que ya no existe", "un culto que adoraba a algo dormido", "una dinastía borrada de los registros"],
        "descubrimiento": ["Allí desenterraron secretos de otra edad", "Encontraron pistas sobre su destino como {role}", "El lugar guardaba reliquias inestables", "Entre el polvo hallaron un arma que no debía existir", "Las paredes susurraban nombres de muertos", "Algo antiguo despertó con su llegada", "El eco de una civilización caída aún guardaba su poder", "Un guardián olvidado exigió una prueba de valía", "Lo que hallaron no debía volver a ver la luz"],

        "fix_apo_10_win": ["El cielo se agrietó soltando la Primera Calamidad. Contra todo pronóstico, {name} se alzó y desvió el desastre con pura fuerza bruta, alterando el destino del mundo."],
        "fix_apo_10_lose": ["El cielo se agrietó. La Primera Calamidad cayó implacable. {name} intentó detenerla, pero sus defensas se hicieron polvo. Todo se redujo a cenizas."],
        "fix_apo_30_win": ["El Avatar del Fin descendió personalmente. En un choque que fracturó los continentes, {name} logró ejecutar al dios caído."],
        "fix_apo_30_lose": ["El Avatar del Fin descendió. La brecha de poder era insalvable. {name} fue borrado de la existencia con un solo pensamiento."],
        "fix_pla_5_win": ["El primer grupo de forasteros descendió. Subestimaron a los nativos. {name} masacró al escuadrón completo, sembrando el terror más allá de este hilo."],
        "fix_pla_5_lose": ["El primer grupo de forasteros emboscó la zona. {name} fue tratado como un simple peón y recibió una paliza letal antes de lograr huir."],
        "fix_pla_20_win": ["Un gremio de otro hilo organizó una incursión masiva contra {name}. Usando el terreno, aniquiló a cientos y se volvió leyenda en este mundo."],
        "fix_pla_20_lose": ["La incursión masiva acorraló a {name}. Las reservas enemigas no se agotaban. Eventualmente, cayó agotado."],
        "fix_mad_10_win": ["El Ojo Exterior parpadeó. La cordura de miles colapsó, pero la vitalidad de {name} le permitió soportar la mirada cósmica."],
        "fix_mad_10_lose": ["El Ojo Exterior parpadeó. La mente de {name} no pudo procesar la verdad. Su cuerpo mutó violentamente hasta perder la consciencia."],
        "fix_reg_15_win": ["El bucle se tensó al límite. {name} rompió la cadena causal a fuerza de voluntad, estabilizando la línea temporal."],
        "fix_reg_15_lose": ["El bucle se tensó al límite. {name} no pudo sostener la paradoja y el tiempo colapsó a su alrededor."],
        "fix_def_10_win": ["El Destino exigió un tributo de sangre. {name} masacró a los verdugos enviados por el mundo."],
        "fix_def_10_lose": ["El Destino exigió su tributo. {name} no estaba preparado para la prueba de la década y sufrió heridas paralizantes."],

        "decision_loyalist": ["{name} jura lealtad absoluta a {faction}, fortaleciendo su posición a costa de su libertad."],
        "decision_lonewolf": ["{name} rompe con {faction} y decide forjar su propio destino, ganando poder crudo a costa de su seguridad."],
        "decision_opportunist": ["{name} juega ambos lados sin comprometerse del todo, repartiendo su lealtad entre {faction} y {bond}."],

        // Narración del río de fondo (advanceUniverse, capa 1 ABSTRACT — Crónica del Universo y logs
        // "[MUNDO]"). Antes cada evento tenía UNA sola frase fija: con años de historia simulada, la
        // Crónica repetía literalmente la misma oración en cada guerra/muerte/nacimiento. Mismo motor
        // de variantes por rng que el resto de CFG_DICTIONARY (pickTemplate/fillVars, no expandGrammar:
        // estos placeholders son propios del evento — {a}/{b}/{winner}, no {name}/{nemesis} del Host).
        "world_war": [
            "Guerra: {a} chocó contra {b}. {winner} prevaleció y absorbió su poder.",
            "Guerra: las huestes de {a} y {b} se enfrentaron sin cuartel. {winner} se quedó con el dominio del campo.",
            "Guerra: {a} desafió a {b} por el control del territorio. {winner} impuso su bandera sobre el rival.",
            "Guerra: el conflicto entre {a} y {b} se saldó a favor de {winner}, que sumó las fuerzas vencidas a las propias.",
            "Guerra: {a} y {b} chocaron sin cuartel. {winner} quebró la resistencia enemiga y absorbió sus filas.",
            "Guerra: {a} y {b} sangraron durante estaciones enteras; al final {winner} plantó su estandarte sobre las ruinas.",
            "Guerra: la ambición de {a} chocó con el orgullo de {b}. {winner} salió del fuego con el doble de poder.",
            "Guerra: pocos recuerdan quién dio el primer golpe entre {a} y {b}; todos recuerdan que {winner} dio el último."
        ],
        "world_faction_fall": [
            "{loser} fue borrada de la historia. Su territorio quedó a merced de {winner}.",
            "{loser} se desmoronó tras la derrota. {winner} reclamó lo que quedaba de sus tierras.",
            "Sin poder para sostenerse, {loser} desapareció del mapa. {winner} heredó sus dominios.",
            "{loser} cayó definitivamente ante {winner}, que no dejó vestigio de su antiguo rival."
        ],
        "world_schism": [
            "{branch} se escindió de {parent} y plantó su estandarte en {zone}.",
            "Divisiones internas quebraron a {parent}: nació {branch}, que se asentó en {zone}.",
            "{branch} rompió con {parent} y reclamó {zone} como territorio propio.",
            "Ante el vacío de poder, {branch} se alzó desde las filas de {parent} y tomó {zone}."
        ],
        "world_death_notable_visible": [
            "{name}, de {fac}, halló su fin en {zone}. El equilibrio se desplaza.",
            "{name}, de {fac}, cayó en {zone}. Su facción siente el vacío que deja.",
            "La muerte alcanzó a {name}, de {fac}, en {zone}. Otro nombre se suma a la historia.",
            "{name}, de {fac}, se apagó en {zone} tras años de disputas por el territorio."
        ],
        "world_death_notable_quiet": [
            "{name}, de {fac}, halló su fin en {zone}.",
            "{name}, de {fac}, cayó en {zone}.",
            "La muerte alcanzó a {name}, de {fac}, en {zone}.",
            "{name}, de {fac}, se apagó en {zone}."
        ],
        "world_birth_notable": [
            "{name} se alzó entre las filas de {fac}. Una nueva potencia despierta.",
            "{name} emergió en las filas de {fac}, con un poder que no pasa desapercibido.",
            "Un nuevo nombre resuena en {fac}: {name} muestra ya la fuerza de un notable.",
            "{name} nació entre los suyos de {fac} y desde temprano destaca sobre el resto."
        ],
        "world_migration": [
            "{name} llegó a {zone}. Los locales murmuran su nombre.",
            "{name} se instaló en {zone}, y su reputación lo precede.",
            "{name} cruzó las fronteras hasta {zone}, donde ya se habla de él.",
            "La llegada de {name} a {zone} no pasó inadvertida entre los locales."
        ],
        // ACTOS DE IMPULSO (C21): el POR QUÉ detrás de cada acto queda escrito en la crónica.
        // Ampliables por ai_forge/lore inyectado, como todo el diccionario.
        "drive_act_codicia": [
            "Movido por el oro, {name} amasó una fortuna en {zone}; el comercio floreció a su paso.",
            "{name} no da un paso sin cobrarlo: sus tratos engordaron las arcas de {zone}.",
            "La codicia de {name} convirtió a {zone} en un mercado que no duerme."
        ],
        "drive_act_ambicion": [
            "{name} escaló otro peldaño hacia el poder; en {fac} ya se habla de su sombra.",
            "Cada favor que {name} concede es una deuda que cobra en influencia. {fac} lo sabe.",
            "La ambición de {name} no descansa: su nombre pesa cada vez más dentro de {fac}."
        ],
        "drive_act_caos": [
            "{name} no quería oro ni trono: solo ver arder el mundo. {zone} pagó el incendio.",
            "Nadie entendió el porqué: {name} sembró el desorden en {zone} y sonrió entre las cenizas.",
            "{name} prendió la mecha en {zone} sin pedir nada a cambio. El caos era el premio."
        ],
        "drive_act_lealtad": [
            "{name} dio el año por los suyos: {fac} salió fortalecida de sus desvelos.",
            "Sin buscar gloria, {name} sostuvo a {fac} cuando más lo necesitaba.",
            "La lealtad de {name} es el cimiento silencioso de {fac}."
        ],
        "world_zone_control": [
            "{faction} tomó el control de {zone}{prev_clause}.",
            "{faction} extendió su dominio sobre {zone}{prev_clause}.",
            "El estandarte de {faction} ondea ahora sobre {zone}{prev_clause}.",
            "{zone} cayó bajo el dominio de {faction}{prev_clause}."
        ],
        "world_zone_control_unclaimed": [
            "{zone} quedó sin regente: tierra de nadie.",
            "{zone} se sumió en el vacío de poder: ninguna facción la reclama.",
            "Sin un regente claro, {zone} queda a la deriva."
        ],

        // Fondo cósmico (advanceCosmos): historia lejana a escala continental/planetaria. Es sabor de
        // profundidad — el universo respira más allá de la región del Host, aunque él no llegue (todavía).
        "world_cosmos_rise": [
            "En {place}, un mundo de rango {rank}, florece una edad de prosperidad; su nombre resuena hasta estos confines.",
            "Se cuentan historias de {place} ({grade}): sus gentes prosperan y su poder crece en la distancia.",
            "Desde {place} llegan ecos de una era dorada; algo grande se gesta en ese mundo de rango {rank}.",
            "{place} vive un auge que altera el equilibrio de poder del universo conocido."
        ],
        "world_cosmos_war": [
            "Una gran guerra desangra {place}, un mundo de rango {rank}; su resplandor se apaga en la lejanía.",
            "Llegan rumores de catástrofe en {place} ({grade}): legiones enteras se consumen allá lejos.",
            "{place} arde en un conflicto que ni el Sistema alcanza a narrar por completo.",
            "Un cataclismo sacude {place}, de rango {rank}; su otrora orgullo se hunde en la sombra."
        ],

        // ASCENSO anual del Host — antes UNA frase fija que salía idéntica cada año (lo más repetitivo del
        // relato). Ahora varía por AÑO y por RÉGIMEN del mundo, para que el crecimiento se lea como parte
        // de la simulación viva y no como un contador. {name}/{atk}/{def}/{hp} son los deltas del año.
        "world_ascension_pacifico": [
            "En la calma de un año más, {name} pulió su arte sin prisa: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "Sin guerras que lo distrajeran, {name} entrenó cada día: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "La paz le dio a {name} tiempo para dominar su técnica: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "{name} pasó el año en estudio y meditación, y el poder llegó solo: +{atk} ATK, +{def} DEF, +{hp} HP máx."
        ],
        "world_ascension_conflicto": [
            "La guerra sin tregua forjó a {name} como a un arma: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "Cada batalla del año dejó su marca en {name}: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "{name} creció al filo de mil combates este año: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "Sobrevivir a un año de conflicto templó a {name} en acero: +{atk} ATK, +{def} DEF, +{hp} HP máx."
        ],
        "world_ascension_posapo": [
            "Arrancarle un año más al páramo endureció a {name}: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "En un mundo muerto, {name} aprendió a ser más letal para vivir: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "El hambre y la ruina afilaron a {name} este año: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "{name} mutó y se adaptó a las cenizas del mundo: +{atk} ATK, +{def} DEF, +{hp} HP máx."
        ],
        // B4/B3b: ascenso temático de los regímenes de carácter nuevos (antes caían al pool de conflicto).
        "world_ascension_prosperidad": [
            "En plena edad dorada, los mejores maestros pulieron a {name}: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "La abundancia del mundo nutrió el cultivo de {name} este año: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "Rodeado de esplendor y recursos, {name} floreció sin freno: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "Un año de prosperidad regaló a {name} tiempo y medios para crecer: +{atk} ATK, +{def} DEF, +{hp} HP máx."
        ],
        "world_ascension_despertar": [
            "Con el mundo despertando, el poder afluyó hacia {name}: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "El qi naciente de la era encontró en {name} un cauce: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "Algo se agitaba bajo el mundo, y {name} lo bebió entero este año: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "El alba de una nueva era encendió el cultivo de {name}: +{atk} ATK, +{def} DEF, +{hp} HP máx."
        ],
        "world_ascension_decadencia": [
            "Mientras la era se apagaba, {name} rapiñó cada brizna de poder: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "En un mundo que moría, {name} se aferró a la fuerza para no caer con él: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "El crepúsculo del mundo endureció a {name} este año: +{atk} ATK, +{def} DEF, +{hp} HP máx.",
            "De las ruinas de una edad que acababa, {name} extrajo su ascenso: +{atk} ATK, +{def} DEF, +{hp} HP máx."
        ]
    },

    // Elige una variante determinista del pool (mismo mecanismo que expandGrammar, sin recursión ni
    // acople al Host: usado por advanceUniverse para narrar el mundo de fondo) y reemplaza {vars} planas.
    pickTemplate: function(seed, salt, pool) {
        if (!pool || pool.length === 0) return "";
        const roll = this.rng(seed, salt);
        return pool[Math.floor(roll * pool.length)];
    },

    fillVars: function(str, vars) {
        const raw = Object.keys(vars).reduce((s, k) => s.split(`{${k}}`).join(vars[k]), str);
        return this.polishEs(raw);
    },
    polishEs: function(s) {
        if (!s) return s;
        return String(s)
            .replace(/\bde el /g, "del ")
            .replace(/\ba el /g, "al ")
            .replace(/\bDe el /g, "Del ")
            .replace(/\bA el /g, "Al ");
    },

    expandGrammar: function(tag, worldSeed, tick, agent, meta) {
        let pool = this.CFG_DICTIONARY[tag];
        if (!pool) return tag;

        const roll = this.rng(worldSeed, `cfg_${tick}_${tag}`);
        let template = pool[Math.floor(roll * pool.length)];

        let resolvedText = template;
        const tagRegex = /#([a-zA-Z0-9_-]+)#/g;

        let match;
        while ((match = tagRegex.exec(resolvedText)) !== null) {
            const innerTag = match[1];
            const innerReplacement = this.expandGrammar(innerTag, worldSeed, tick + 1, agent, meta);
            resolvedText = resolvedText.replace(`#${innerTag}#`, innerReplacement);
            tagRegex.lastIndex = 0;
        }

        return this.polishEs(resolvedText
            .replace(/{name}/g, agent.name)
            .replace(/{nemesis}/g, agent.nemesis || "las sombras")
            .replace(/{faction}/g, agent.faction || "los locales")
            .replace(/{bond}/g, agent.bond || "sus aliados")
            .replace(/{role}/g, meta.hostRole)
            .replace(/{era}/g, (this.ERA_IN_PROSE && this.ERA_IN_PROSE[meta.era]) || (meta.era || "").toLowerCase()));
    },

    rng: function(seed, salt) {
        let h = 0xdeadbeef; let str = seed + salt;
        for(let i=0; i<str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 2654435761); }
        return ((h ^ h >>> 16) >>> 0) / 4294967296;
    },

    // Conteos legibles para la narrativa: la masa es de millones (Fase 1), y "10691574" se lee tosco.
    // Es formato de prosa (la crónica ya es texto humano), determinista: mismo número → mismo string.
    // billón = 10^12 (escala larga, español).
    formatCount: function(n) {
        n = Math.round(n);
        if (n < 1000) return "" + n;
        const fmt = (v, u) => (v.toFixed(1).replace(/\.0$/, "")) + " " + u;
        if (n < 1e6) return fmt(n / 1e3, "mil");
        if (n < 1e9) return fmt(n / 1e6, "millones");
        if (n < 1e12) return fmt(n / 1e9, "mil millones");
        return fmt(n / 1e12, "billones");
    },

    generateWorldMeta: function(seed) {
        const era = this.pickWeighted(this.ERAS.map(e => ({ v: e, w: (this.ERA_PROFILES[e] || { w: 1 }).w })), this.rng(seed, "era"));
        const tierKeys = Object.keys(this.WORLD_TIERS);
        const selectedTier = tierKeys[Math.floor(this.rng(seed, "tier") * tierKeys.length)];
        const plots = this.WORLD_PLOTS.filter(p => this.fitsEra(p, era));
        const plotPool = plots.length ? plots : this.WORLD_PLOTS;
        const plot = plotPool[Math.floor(this.rng(seed, "plot") * plotPool.length)];
        const traitKeys = Object.keys(this.WORLD_TRAITS).filter(k => this.fitsEra(this.WORLD_TRAITS[k], era));
        const pool = traitKeys.length ? traitKeys : Object.keys(this.WORLD_TRAITS);
        const traits = [pool[Math.floor(this.rng(seed, "trait:0") * pool.length)]];
        if (this.rng(seed, "trait#") < 0.45) {
            const rest = pool.filter(k => k !== traits[0]);
            if (rest.length) traits.push(rest[Math.floor(this.rng(seed, "trait:1") * rest.length)]);
        }
        const roles = this.HOST_ROLES_BY_ERA[era] || this.HOST_ROLES;
        const desc = this.tierLabel(era, selectedTier);
        const epochKeys = Object.keys(this.WORLD_EPOCHS);
        const epoch = epochKeys[Math.floor(this.rng(seed, "epoch") * epochKeys.length)];
        return {
            traits: traits,
            era: era,
            worldType: era,
            epoch: epoch,
            plot: plot,
            hostRole: roles[Math.floor(this.rng(seed, "role") * roles.length)],
            planetLuck: 0.7 + (this.rng(seed, "luck") * 0.7),
            tierId: selectedTier,
            tierData: { ...this.WORLD_TIERS[selectedTier], desc: desc }
        };
    },

    // Transforma un ALMA REAL de la población (o cualquier NPC) en el bloque de Host, de forma
    // determinista (sin rng nuevo: nemesis/bond salen del id del alma). Es la puerta común del "Host
    // orgánico": conserva NOMBRE y CLASE del alma y deja anotado su ORIGEN (originSoulId/Faction/Zone)
    // para que la afiliación pueda honrarlo (Pieza 2 — Continuidad). `opts.scaleStats` deriva los stats
    // del `power` (un notable fuerte arranca fuerte — god-deploy del Admin); sin él, arranca en la
    // línea base de novato (100/10/10), que es el default del Sistema. `opts.promoted` deja el rastro
    // `promotedFrom` que la entrada `start` usa como ancla de reproducción (D3).
    hostFromSoul: function(soul, era, opts) {
        opts = opts || {};
        const dict = this.NARRATIVE_MILESTONES[era] || this.NARRATIVE_MILESTONES.UNIVERSAL;
        const idNum = parseInt(String(soul.id).replace(/\D/g, ""), 10) || 0;
        const p = Math.max(0, soul.power || 0);
        const scaled = !!opts.scaleStats;
        // C5: root stats derivados y anotados. La constitución NO toca el HP base (el novato arranca
        // 100/10/10 — invariante de balance con test propio); su efecto se activa en C8 (longevidad).
        const root = this.deriveRoot(opts.seed || 0, soul.id);
        const hp = scaled ? 100 + p * 2 : 100;
        const host = {
            id: "agent_0", name: soul.name, class: soul.class || this.AGENT_CLASSES[0],
            hp: hp, maxHp: hp, atk: scaled ? 10 + p : 10, def: scaled ? 10 + Math.floor(p / 2) : 10,
            constitution: root.constitution, insight: root.insight,
            innateTalents: this.deriveInnateTalents(opts.seed || 0, soul.id, root.insight), // C4
            lifespan: 60 + Math.round((root.constitution - 50) * 0.6), // C8: techo de años por 根骨
            discoveredCards: [], deck: [],
            faction: null,
            nemesis: (function() {
                const u = opts.universe;
                if (u && u.population) {
                    const others = u.population.filter(p => p.alive && p.id !== soul.id && p.factionId !== soul.factionId);
                    if (others.length) return others[idNum % others.length].name;
                }
                return dict.nemeses[idNum % dict.nemeses.length];
            })(),
            bond: (function() {
                const u = opts.universe;
                if (u && u.population) {
                    const allies = u.population.filter(p => p.alive && p.id !== soul.id && p.factionId === soul.factionId);
                    if (allies.length) return allies[idNum % allies.length].name;
                }
                return dict.bonds[idNum % dict.bonds.length];
            })(),
            luck: this.deriveLuck(opts.seed || 0, soul.id),
            will: this.deriveWill(opts.seed || 0, soul.id), willMax: this.deriveWill(opts.seed || 0, soul.id),
            // LA RAMA LEE LA BASE: el anhelo y la edad vienen del alma (nació con ellos en la base) —
            // la rama no deriva nada nuevo, hereda y continúa. Un alma sin anhelo (overlay
            // materializado de versiones previas) lo deriva acá con el MISMO generador determinista.
            age: soul.age || 16,
            desire: soul.desire ? JSON.parse(JSON.stringify(soul.desire)) : this.deriveDesire(opts.seed || 0, soul, opts.universe || null),
            drive: soul.drive || this.deriveDrive(opts.seed || 0, soul),
            milestones: {},
            originSoulId: soul.id, originFactionId: soul.factionId || null, originZoneId: soul.zoneId || null
        };
        if (opts.promoted) host.promotedFrom = soul.id;
        return host;
    },

    // C2 FORTUNA / 气运 (Parte 10.3): la fortuna innata de un alma, acotada [20,80] (50 = neutra),
    // determinista por semilla+id. Algunas almas nacen afortunadas: la Fortuna SESGA (no crea) las tablas
    // de 奇遇 y el botín — inclina el gate y el reparto fortuna/calamidad, sin introducir azar nuevo (D2).
    deriveLuck: function(seed, soulId) {
        return 20 + Math.floor(this.rng(seed, "luck:" + soulId) * 61); // 20..80
    },

    // C5 ATRIBUTOS DE RAÍZ (根骨/悟性): dos stats innatos del alma, acotados [20,80] (50 = neutro),
    // deterministas por semilla+id (mismo patrón que la Fortuna). `constitution` (根骨) engorda el HP
    // base de forma acotada; `insight` (悟性) abre un poco más el gate de 奇遇 — un alma perspicaz vive
    // más hallazgos. NO crean azar: sesgan umbrales/aritmética determinista (D2). Streams propios.
    deriveRoot: function(seed, soulId) {
        return {
            constitution: 20 + Math.floor(this.rng(seed, "root:con:" + soulId) * 61), // 20..80
            insight:      20 + Math.floor(this.rng(seed, "root:ins:" + soulId) * 61)  // 20..80
        };
    },

    // VOLUNTAD (fusión acotada del prototipo Grok, ver docs/handoff-fusion-voluntad-v1.45.0.md): techo
    // innato [20,80], mismo patrón determinista que Fortuna/raíz — un alma resuelta nace con más margen
    // para torcer un Punto de Inflexión. `agent.will` (corriente) arranca igual al techo y se gasta en
    // resolveInflexion; regenera +1 por año (capa 1 pura, sin rng nuevo — ver runTicks).
    deriveWill: function(seed, soulId) {
        return 20 + Math.floor(this.rng(seed, "will:" + soulId) * 61); // 20..80
    },

    // Costos fijos de intervenir un Punto de Inflexión — constante compartida por motor y UI (capa 3
    // los lee para mostrar el precio y decidir si el botón se ve deshabilitado, nunca los inventa).
    INFLEXION_COST: { reject: { will: 10 }, force: { will: 25, luck: 5 } },

    // C4 TALENTOS INNATOS / 天赋: eje PRE-sim (distinto del Mazo=equipo). Cada alma nace con UN talento
    // innato de esta tabla, con tiers N→Divino. Determinista por semilla+id; el 悟性 (insight, C5) sesga
    // hacia tiers altos (alma perspicaz → mejor don). Los fx se aplican al MATERIALIZAR el agente
    // (assembleAgentForSim, al `start`), como rasgos de nacimiento — nunca tocan el molde novato 100/10/10.
    INNATE_TALENTS: [
        { id: "tenaz",            name: "Tenaz",            tier: "N",      w: 6,   fx: { hpMul: 1.05 },                                 desc: "Cuerpo resistente (+5% HP)." },
        { id: "agil",             name: "Ágil",             tier: "N",      w: 6,   fx: { atkMul: 1.05 },                                desc: "Reflejos afilados (+5% ATK)." },
        { id: "diligencia",       name: "Diligencia",       tier: "R",      w: 4,   fx: { ascensoMul: 1.25 },                            desc: "El Ascenso anual rinde +25%." },
        { id: "perspicaz",        name: "Perspicaz",        tier: "R",      w: 4,   fx: { insightBonus: 15 },                            desc: "悟性 elevado: más 奇遇." },
        { id: "cuerpo_hierro",    name: "Cuerpo de Hierro", tier: "SR",     w: 2,   fx: { hpMul: 1.18 },                                 desc: "+18% HP máx al nacer." },
        { id: "estrella_marcial", name: "Estrella Marcial", tier: "SR",     w: 2,   fx: { atkMul: 1.18 },                                desc: "+18% ATK base." },
        { id: "bendecido",        name: "Bendecido",        tier: "SR",     w: 2,   fx: { luckBonus: 15 },                               desc: "Fortuna elevada (+15)." },
        { id: "prodigio",         name: "Prodigio",         tier: "SSR",    w: 1,   fx: { ascensoMul: 1.5, insightBonus: 10 },           desc: "Genio marcial: Ascenso +50% y más 奇遇." },
        { id: "reencarnado",      name: "Alma Reencarnada", tier: "Divino", w: 0.3, fx: { hpMul: 1.15, atkMul: 1.15, ascensoMul: 1.3 }, desc: "Vidas pasadas: +15% HP/ATK, Ascenso +30%." }
    ],

    // Deriva el/los talento(s) innato(s) del alma (1 por ahora). Determinista (stream `innate:pick:`).
    // El insight (C5) engorda el peso de los tiers altos sin crear azar (D2, principio de la Fortuna).
    deriveInnateTalents: function(seed, soulId, insight) {
        const ins = (((insight != null) ? insight : 50) - 50) / 50; // -0.6..+0.6
        const boost = { N: 1, R: 1 + ins * 0.4, SR: 1 + ins * 0.8, SSR: 1 + ins * 1.2, Divino: 1 + ins * 1.6 };
        const table = this.INNATE_TALENTS;
        const wOf = (t) => Math.max(0.001, t.w * (boost[t.tier] || 1));
        const total = table.reduce((s, t) => s + wOf(t), 0);
        let roll = this.rng(seed, "innate:pick:" + soulId) * total, pick = table[0];
        for (const t of table) { const w = wOf(t); if (roll < w) { pick = t; break; } roll -= w; }
        return [{ id: pick.id, name: pick.name, tier: pick.tier, desc: pick.desc, fx: pick.fx }];
    },

    // Aplica los fx de un talento innato al agente materializado (capa 1). Acotado y determinista; se
    // llama en assembleAgentForSim (al `start`), nunca sobre el molde baseline del novato.
    applyInnateTalent: function(agent, t) {
        const fx = t.fx || {};
        if (fx.hpMul) { agent.maxHp = Math.round(agent.maxHp * fx.hpMul); agent.hp = agent.maxHp; }
        if (fx.atkMul) agent.atk = Math.round(agent.atk * fx.atkMul);
        if (fx.luckBonus != null && agent.luck != null) agent.luck = Math.min(100, agent.luck + fx.luckBonus);
        if (fx.insightBonus != null && agent.insight != null) agent.insight = Math.min(100, agent.insight + fx.insightBonus);
        if (fx.ascensoMul) agent.ascensoMul = (agent.ascensoMul || 1) * fx.ascensoMul;
    },

    // C6 COSECHA CON COSTO (sink): al morir, cada carta cuesta ESENCIA según su tier. La esencia se
    // acumula durante el run (ver runTicks) — es el presupuesto que frena la inflación del Compendio:
    // ya no se puede extraer todo gratis (cierra la deuda C6 / inflación que marcó el balance-oracle).
    HARVEST_COST: { N: 1, R: 3, SR: 8, SSR: 15 },

    // ANHELO (la base le da a la rama con qué trabajar): toda alma notable NACE queriendo algo, y es
    // la SIMULACIÓN BASE quien lo evalúa y lo registra en la crónica — la rama después LEE ese anhelo
    // (y la biografía del alma) al seleccionar un agente, y continúa con esas variables. Determinista
    // por semilla+id (D2, mismo patrón que la Fortuna). El anhelo ancla el contexto REAL del alma al
    // derivarse (`facId`/`zoneId` natales), así sobrevive a migraciones y re-afiliaciones sin mentir.
    SOUL_DESIRES: ["gloria", "hogar", "cima", "linaje", "longevidad"],
    deriveDesire: function(seed, soul, universeLike) {
        const u = universeLike || null;
        const pool = this.SOUL_DESIRES.filter(d => {
            if (d === "hogar") return !!(u && soul.zoneId && soul.factionId);
            if (d === "cima" || d === "linaje") return !!(u && soul.factionId);
            return true;
        });
        const id = pool[Math.floor(this.rng(seed, "anhelo:" + soul.id) * pool.length)];
        const desire = { id: id, text: "", fulfilled: false, year: null };
        switch (id) {
            case "gloria":
                if (soul.factionId) desire.facId = soul.factionId;
                desire.text = "que su nombre pese más que su facción entera"; break;
            case "hogar":
                desire.zoneId = soul.zoneId; desire.facId = soul.factionId;
                desire.text = `ver ${this.zoneName(u, soul.zoneId)} bajo el estandarte de los suyos`; break;
            case "cima":
                desire.facId = soul.factionId;
                desire.text = `llevar a ${this.facName(u, soul.factionId)} a la cima de las potencias`; break;
            case "linaje":
                desire.facId = soul.factionId;
                desire.text = "ver alzarse a un heredero de su sangre y su casa"; break;
            case "longevidad":
                desire.text = "cruzar los sesenta inviernos con los ojos abiertos"; break;
        }
        return desire;
    },

    // IMPULSO (C21): el POR QUÉ actúa un alma — distinto del anhelo (el QUÉ quiere lograr). Dos
    // almas pueden anhelar lo mismo y perseguirlo por motivos opuestos. Taxonomía verificada contra
    // psicología real: McClelland (nAch→codicia, nPow→ambición, nAff→lealtad) + la "Need for Chaos"
    // (Petersen et al., APSR 2023: la minoría real y medible que quiere "quemar el orden" — el
    // "ver arder el mundo" de Taco es ciencia publicada). En juegos: RimWorld pyromaniac / CK3
    // greedy-ambitious. El caos es MINORÍA (~12%, como en el estudio); la lealtad es lo que
    // estabiliza el mundo (sin nAff todo es villanos). Determinista por semilla+id (D2).
    SOUL_DRIVES: {
        codicia:  { name: "Codicia",  text: "hace las cosas por el oro",          weight: 30 },
        ambicion: { name: "Ambición", text: "hace las cosas por el poder",        weight: 28 },
        lealtad:  { name: "Lealtad",  text: "hace las cosas por los suyos",       weight: 30 },
        caos:     { name: "Caos",     text: "solo quiere ver arder el mundo",     weight: 12 }
    },
    deriveDrive: function(seed, soul) {
        const ids = Object.keys(this.SOUL_DRIVES);
        const total = ids.reduce((s, k) => s + this.SOUL_DRIVES[k].weight, 0);
        let roll = this.rng(seed, "impulso:" + soul.id) * total;
        for (let i = 0; i < ids.length; i++) {
            roll -= this.SOUL_DRIVES[ids[i]].weight;
            if (roll < 0) return ids[i];
        }
        return ids[ids.length - 1];
    },

    // Evalúa si el anhelo de un ser se cumplió ESTE año — lectura PURA del estado del universo, sin
    // rng (D2 trivial). Sirve igual para un alma de la base (advanceUniverse) que para el Host en la
    // rama (runTicks): `being` necesita {desire, factionId, power, age}.
    desireFulfilled: function(u, being, year) {
        const d = being.desire;
        if (!d || d.fulfilled || !u) return false;
        if (year < 4 && d.id !== "longevidad") return false;
        switch (d.id) {
            case "gloria": {
                const fac = u.factions.find(f => f.id === (d.facId || being.factionId));
                return (being.power || 0) >= Math.max(60, (fac && fac.alive) ? fac.power : 60);
            }
            case "hogar": {
                const z = (u.zones || []).find(z => z.id === d.zoneId);
                const facId = d.facId || being.factionId;
                return !!(z && facId && z.rulerFacId === facId);
            }
            case "cima": {
                const own = u.factions.find(f => f.id === (d.facId || being.factionId));
                if (!own || !own.alive) return false;
                return u.factions.filter(f => f.alive).every(f => f.id === own.id || f.power < own.power);
            }
            case "linaje": {
                // Un nacimiento nombrado de su casa mientras vive (el nacido del año lleva id por año).
                const born = u.population.find(p => p.id === "npc_b" + year);
                return !!(born && born.factionId === (d.facId || being.factionId));
            }
            case "longevidad": return (being.age || 0) >= 60;
        }
        return false;
    },

    // LA RAMA LEE UNA PARTE: la base registra las crónicas del mundo entero; esta lectura devuelve la
    // parte que nombra a UN alma (su biografía) — lo que la rama hereda al seleccionarla. Derivación
    // pura de solo lectura: no muta nada.
    soulBiography: function(universe, soulId) {
        if (!universe || !soulId) return [];
        return (universe.chronicle || []).filter(e => e.soulId === soulId);
    },

    // El biógrafo de la BASE (mundo-primero): relata a cualquier alma SOLO desde la crónica del
    // mundo — sin Host, sin timeline. Es la semilla del C20-a (la Ficha universal) y el insumo de
    // las "vidas notables" de siftWorldChronicle.
    siftSoulStory: function(universe, soulId) {
        if (!universe || !soulId) return null;
        const soul = (universe.population || []).find(p => p.id === soulId) || null;
        const lines = [];
        (universe.chronicle || []).forEach((e, i) => {
            if (e.soulId === soulId) lines.push({ year: e.year, kind: e.kind, text: e.text, ref: i });
        });
        if (!soul && lines.length === 0) return null;
        const desire = soul && soul.desire ? { id: soul.desire.id, text: soul.desire.text, fulfilled: !!soul.desire.fulfilled, year: soul.desire.year } : null;
        return { soulId: soulId, name: soul ? soul.name : "(alma de la crónica)", alive: soul ? !!soul.alive : null, desire: desire, lines: lines };
    },

    // C20-a — LA FICHA UNIVERSAL (Parte 10.3/`diseno-historia-completa-v1.0.md` §3-ter, deuda cerrada):
    // "toda alma del mundo es inspeccionable, no solo el Host" — reusa `siftSoulStory` (v1.19.0) tal
    // cual y la ENRIQUECE con las capas de memoria construidas después (C11 hilos, C12 némesis, C17
    // lazos): si hay un Host vivo, se agrega SU relación con esta alma (bond clasificado, si es su
    // némesis, hilos abiertos que la involucran). Derivación 100% pura — solo lectura, ninguna mutación.
    soulSheet: function(worldState, soulId) {
        const u = worldState && worldState.universe;
        const base = this.siftSoulStory(u, soulId);
        if (!base) return null;
        const soul = (u.population || []).find(p => p.id === soulId) || null;
        const fac = (soul && u.factions) ? u.factions.find(f => f.id === soul.factionId) : null;
        const zone = (soul && u.zones) ? u.zones.find(z => z.id === soul.zoneId) : null;
        const agent = worldState.agents && worldState.agents[0];
        let relationToHost = null;
        if (agent) {
            const isNemesis = agent.nemesisId === soulId;
            const bond = this.classifyBond(agent, soulId);
            if (isNemesis || bond) relationToHost = { type: isNemesis ? "némesis" : bond.type, level: bond ? bond.level : null, strength: bond ? bond.strength : null };
        }
        const threads = (u.threads || []).filter(t => t.npcId === soulId).map(t => ({ kind: t.kind, openedYear: t.openedYear, state: t.state }));
        return {
            soulId: soulId, name: base.name, alive: base.alive, desire: base.desire, lines: base.lines,
            class: soul ? soul.class : null, power: soul ? soul.power : null, age: soul ? soul.age : null,
            factionName: fac ? fac.name : null, zoneName: zone ? zone.name : null,
            parentId: soul ? (soul.parentId || null) : null,
            relationToHost: relationToHost, threads: threads
        };
    },

    // ============ LA CRÓNICA COMPLETA DEL MUNDO (la base entrega su resumen) ============
    // Pipeline NLG clásico (Reiter & Dale, estado del arte data-to-text) hecho determinista, sin
    // LLM ni red — offline-first:
    //   1. PLAN DE DOCUMENTO: qué contar — las EDADES se cortan en los quiebres REALES de la
    //      historia (cambios de régimen, caídas de potencias, cismas), no en años arbitrarios;
    //      después arcos de facciones, vidas notables (reusa siftSoulStory) y epílogo.
    //   2. MICROPLANIFICACIÓN: agregación (lo tranquilo se cuenta por número: "3 guerras, 12
    //      nacimientos"), selección con regla de variedad (cap por kind), re-orden cronológico.
    //   3. REALIZACIÓN SUPERFICIAL: plantillas con datos reales — la MISMA regla anti-invención
    //      del Cronista: cada evento citado lleva `ref` a la entrada real de la crónica; los
    //      agregados salen de CONTAR entradas (verificable, T41).
    // Derivación PURA sobre universe.chronicle: corre en un mundo SIN Host (la base es el producto;
    // las ramas leerán esto). `fullText` es [{t, k}] — la capa 3 estiliza por `k`, jamás por texto.
    WORLD_AGE_PRIORITY: { regime_shift: 10, faction_fall: 9, schism: 8, war: 7, host_death: 6, cosmos: 5, drive: 5, zone_control: 4, anhelo: 4, legend: 4, death: 3, duel_death: 3, duel_spared: 3, birth: 2, migration: 1, genesis: 1 },
    WORLD_AGE_ORDINALS: ["Primera", "Segunda", "Tercera", "Cuarta", "Quinta", "Sexta", "Séptima", "Octava"],

    siftWorldChronicle: function(worldState) {
        const u = worldState.universe;
        if (!u || !worldState.meta) return null;
        const meta = worldState.meta;
        const chron = u.chronicle || [];
        const endYear = Math.max(1, Math.floor(worldState.tick / 360));

        // ---- 1. PLAN: quiebres de edad = donde la historia dobló de verdad ----
        let breaks = [];
        chron.forEach(e => {
            if ((e.kind === "regime_shift" || e.kind === "faction_fall" || e.kind === "schism") &&
                e.year > 0 && e.year < endYear) breaks.push(e.year);
        });
        breaks = Array.from(new Set(breaks)).sort((a, b) => a - b);
        const merged = [];
        breaks.forEach(y => { if (!merged.length || y - merged[merged.length - 1] >= 6) merged.push(y); });
        while (merged.length > 5) { // acota a 6 edades: cae el corte que crea la edad más corta
            let idx = 0, gap = Infinity;
            for (let i = 0; i < merged.length; i++) {
                const prev = i === 0 ? 0 : merged[i - 1];
                if (merged[i] - prev < gap) { gap = merged[i] - prev; idx = i; }
            }
            merged.splice(idx, 1);
        }
        const bounds = [0].concat(merged, [endYear + 1]);

        // ---- 2. MICRO por edad: agregación + selección con variedad ----
        const prio = this.WORLD_AGE_PRIORITY;
        const ages = [];
        for (let i = 0; i + 1 < bounds.length; i++) {
            const from = bounds[i], to = bounds[i + 1] - 1;
            if (to < from) continue;
            const win = [];
            chron.forEach((e, idx) => { if (e.year >= from && e.year <= to) win.push({ e: e, idx: idx }); });
            const count = (k) => win.filter(w => w.e.kind === k).length;
            const stats = { wars: count("war"), falls: count("faction_fall"), schisms: count("schism"), births: count("birth"), deaths: count("death"), cosmos: count("cosmos"), shifts: count("regime_shift"), anhelos: count("anhelo") };
            let title = "la Edad Serena";
            if (stats.falls > 0) title = "la Edad del Colapso";
            else if (stats.wars >= 3) title = "la Edad de la Sangre";
            else if (stats.wars > 0) title = "la Edad de las Espadas";
            else if (stats.schisms > 0) title = "la Edad del Cisma";
            else if (stats.cosmos > 0) title = "la Edad de las Maravillas";
            const guerra = [];
            if (stats.wars) guerra.push(`${stats.wars} guerra${stats.wars > 1 ? "s" : ""}`);
            if (stats.falls) guerra.push(`${stats.falls} potencia${stats.falls > 1 ? "s" : ""} caída${stats.falls > 1 ? "s" : ""}`);
            if (stats.schisms) guerra.push(`${stats.schisms} cisma${stats.schisms > 1 ? "s" : ""}`);
            if (stats.shifts) guerra.push(`${stats.shifts} cambio${stats.shifts > 1 ? "s" : ""} de régimen`);
            const vida = [];
            if (stats.births) vida.push(`${stats.births} nacimiento${stats.births > 1 ? "s" : ""} notable${stats.births > 1 ? "s" : ""}`);
            if (stats.deaths) vida.push(`${stats.deaths} muerte${stats.deaths > 1 ? "s" : ""} recordada${stats.deaths > 1 ? "s" : ""}`);
            if (stats.anhelos) vida.push(`${stats.anhelos} anhelo${stats.anhelos > 1 ? "s" : ""} saldado${stats.anhelos > 1 ? "s" : ""}`);
            const intro = `La ${this.WORLD_AGE_ORDINALS[ages.length] || (ages.length + 1) + "ª"} Edad (años ${from}–${to}), ${title}: ` +
                (guerra.length ? `el mundo conoció ${guerra.join(", ")}` : "ninguna espada marcó estos años") +
                (vida.length ? `; la crónica guardó ${vida.join(" y ")}.` : ".");
            win.sort((a, b) => (prio[b.e.kind] || 0) - (prio[a.e.kind] || 0) || a.e.year - b.e.year || a.idx - b.idx);
            const picked = [], kindSeen = {};
            for (let k = 0; k < win.length && picked.length < 6; k++) {
                const w = win[k];
                if ((kindSeen[w.e.kind] || 0) >= 2) continue;
                kindSeen[w.e.kind] = (kindSeen[w.e.kind] || 0) + 1;
                picked.push({ year: w.e.year, kind: w.e.kind, text: w.e.text, ref: w.idx });
            }
            picked.sort((a, b) => a.year - b.year || a.ref - b.ref);
            ages.push({ n: ages.length + 1, title: title, from: from, to: to, intro: intro, stats: stats, lines: picked });
        }

        // ---- Arcos de facciones (menciones contadas sobre la propia crónica generada) ----
        const factions = (u.factions || []).map(f => {
            let mentions = 0, fallRef = null;
            chron.forEach((e, idx) => {
                if (e.text.indexOf(f.name) !== -1) {
                    mentions++;
                    if (e.kind === "faction_fall" && fallRef === null) fallRef = idx;
                }
            });
            const zone = this.zoneName(u, f.zoneId);
            return {
                name: f.name, alive: !!f.alive, power: f.power, zone: zone, mentions: mentions, fallRef: fallRef,
                text: f.alive
                    ? `${f.name} (${zone}): en pie, poder ${f.power} — la crónica la nombra ${mentions} ${mentions === 1 ? "vez" : "veces"}.`
                    : `${f.name}: CAÍDA${fallRef !== null ? ` en el año ${chron[fallRef].year}` : ""} — la crónica la nombró ${mentions} ${mentions === 1 ? "vez" : "veces"}.`
            };
        });

        // ---- Vidas notables: las almas más nombradas, contadas con el biógrafo de la base ----
        const bioCount = {};
        chron.forEach(e => { if (e.soulId) bioCount[e.soulId] = (bioCount[e.soulId] || 0) + 1; });
        const topSouls = Object.keys(bioCount).sort((a, b) => bioCount[b] - bioCount[a] || (a < b ? -1 : 1)).slice(0, 4);
        const lives = topSouls.map(sid => this.siftSoulStory(u, sid)).filter(Boolean);

        // ---- Epílogo: el estado del mundo HOY, en números reales ----
        const living = (u.factions || []).filter(f => f.alive).sort((a, b) => b.power - a.power || (a.name < b.name ? -1 : 1));
        const notables = (u.population || []).filter(p => p.alive && !p.fromCrowd).length;
        const masa = (u.zones || []).reduce((s, z) => s + (z.crowd ? z.crowd.count : 0), 0);
        const pending = (u.population || []).filter(p => p.alive && !p.fromCrowd && p.desire && !p.desire.fulfilled).length;
        const c = u.counters || {};
        // Microplanificación de números: los contadores incluyen la MASA (millones) — a escala
        // humana se leen como magnitud ("~62,7 millones"), no como dígitos crudos (ilegible, audit).
        const fmtBig = (n) => {
            if (n >= 1e9) return "~" + (Math.round(n / 1e8) / 10).toString().replace(".", ",") + " mil millones de";
            if (n >= 1e6) return "~" + (Math.round(n / 1e5) / 10).toString().replace(".", ",") + " millones de";
            if (n >= 1e4) return "~" + Math.round(n / 1e3) + " mil";
            return String(n);
        };
        const epilogue = {
            regime: u.regime || null, dominant: living.length ? living[0].name : null, factionsAlive: living.length,
            notables: notables, masa: masa, pendingDesires: pending,
            counters: { wars: c.wars || 0, deaths: c.deaths || 0, births: c.births || 0, factionsFallen: c.factionsFallen || 0 },
            text: `Al cierre del año ${endYear}, el mundo respira bajo un régimen de ${u.regime || "equilibrio"}. ` +
                (living.length ? `${living[0].name} domina entre ${living.length} potencia${living.length > 1 ? "s" : ""} viva${living.length > 1 ? "s" : ""}. ` : "Ninguna potencia sigue en pie. ") +
                `Lo habitan ${fmtBig(masa + notables)} almas (${notables} con nombre propio). El saldo de toda la historia: ${c.wars || 0} guerras, ${c.factionsFallen || 0} potencias caídas, ${fmtBig(c.births || 0)} nacimientos y ${fmtBig(c.deaths || 0)} muertes. ` +
                (pending ? `${pending} anhelo${pending > 1 ? "s" : ""} sigue${pending > 1 ? "n" : ""} abierto${pending > 1 ? "s" : ""} — el mundo todavía quiere cosas.` : "Ningún anhelo queda abierto.")
        };

        // ---- Génesis (portada) ----
        const genesis = {
            era: meta.era, plot: meta.plot ? meta.plot.title : null, tierId: meta.tierId,
            factions: (u.factions || []).map(f => ({ name: f.name, zone: this.zoneName(u, f.zoneId) })),
            text: `En el principio, la semilla tejió un mundo de rango [${meta.tierId}] en la era ${meta.era}, bajo la trama «${meta.plot ? meta.plot.title : "sin trama"}». ` +
                `${(u.factions || []).length} potencias se alzaron: ${(u.factions || []).map(f => `${f.name} (${this.zoneName(u, f.zoneId)})`).join(", ")}.`
        };

        // ---- 3. SUPERFICIE: el resumen completo como líneas tipadas ({t, k}) ----
        const fullText = [];
        fullText.push({ t: `CRÓNICA DEL MUNDO [${meta.tierId}] — ERA ${meta.era}`, k: "title" });
        fullText.push({ t: genesis.text, k: "para" });
        ages.forEach(a => {
            fullText.push({ t: a.intro, k: "age" });
            a.lines.forEach(l => fullText.push({ t: `Año ${l.year} — ${l.text}`, k: "event" }));
        });
        fullText.push({ t: "LAS POTENCIAS", k: "section" });
        factions.forEach(f => fullText.push({ t: f.text, k: "para" }));
        if (lives.length) {
            fullText.push({ t: "VIDAS QUE EL MUNDO RECUERDA", k: "section" });
            lives.forEach(b => {
                const estado = b.desire ? ` Anhelaba ${b.desire.text}${b.desire.fulfilled ? " — y lo cumplió" : ""}.` : "";
                fullText.push({ t: `${b.name}${b.alive === false ? " (finada)" : ""}.${estado}`, k: "para" });
                b.lines.slice(0, 3).forEach(l => fullText.push({ t: `Año ${l.year} — ${l.text}`, k: "event" }));
            });
        }
        fullText.push({ t: "EPÍLOGO", k: "section" });
        fullText.push({ t: epilogue.text, k: "para" });

        return { title: fullText[0].t, endYear: endYear, genesis: genesis, ages: ages, factions: factions, lives: lives, epilogue: epilogue, fullText: fullText };
    },

    // C13 / DIRECTOR DE TENSIÓN (diseno-historia-completa-v1.0 §3, cierra F2). La vida ya no tiene una
    // intensidad plana-creciente: corre por ARCOS de 12–15 años (el "arco de reino" xianxia), cada uno con
    // 4 fases — preludio (valle) → ascenso → clímax (pico) → respiro. Cada trama sube y baja con su propia
    // FORMA (`curve`). Es f(semilla, plot, año): D2 puro — jamás lee la observación ni el estado vivo (la
    // curva se puede calcular sin correr el mundo). Si el Host sobrevive un arco, empieza otro (ciclo N+1).
    // Vector [preludio, ascenso, clímax, respiro] de intensidad ∈ [0,1] por familia de curva.
    STORY_CURVES: {
        climb:    [0.18, 0.48, 0.90, 0.38], // valle → clímax alto → respiro (arco de reino clásico)
        decline:  [0.85, 0.60, 0.42, 0.22], // empieza alto y cae largo (el mundo agonizante)
        plateau:  [0.45, 0.55, 0.82, 0.50], // meseta estable con un pico (exploración)
        sawtooth: [0.20, 0.62, 0.95, 0.12]  // dientes de sierra: oscilación violenta (regresión/locura)
    },
    STORY_PHASES: ["intro", "rise", "climax", "respite"],
    STORY_PHASE_LABEL: { intro: "Preludio", rise: "Ascenso", climax: "Clímax", respite: "Respiro" },
    STORY_PHASE_FLAVOR: {
        intro:   "un nuevo ciclo se abre en relativa calma",
        rise:    "la marea sube; los enemigos y las fortunas se multiplican",
        climax:  "todo converge hacia el filo: es la hora más peligrosa del arco",
        respite: "tras la tormenta, un respiro antes del próximo ciclo"
    },

    // Fase de la historia en un año dado: {arcIndex, phaseIdx, phase, intensity, curve, arcLen}. Puro
    // f(semilla, plot, año) — la longitud del arco y su desfase salen de la semilla (mismo principio que la
    // Fortuna: rng keyeado, cero azar nuevo, cero observación). La UI/derivación NUNCA alimenta esto.
    storyPhase: function(seed, plotId, year) {
        const plot = this.WORLD_PLOTS.find(p => p.id === plotId);
        const curve = (plot && plot.curve) || "climb";
        const arcLen = 12 + Math.floor(this.rng(seed, "arc:len") * 4); // 12..15, estable por semilla
        const shifted = year || 0;
        const arcIndex = Math.floor(shifted / arcLen);
        const t = (shifted % arcLen) / arcLen; // [0,1) dentro del arco
        let phaseIdx;
        if (t < 0.25) phaseIdx = 0; else if (t < 0.6) phaseIdx = 1; else if (t < 0.85) phaseIdx = 2; else phaseIdx = 3;
        const vec = this.STORY_CURVES[curve] || this.STORY_CURVES.climb;
        return { arcIndex: arcIndex, phaseIdx: phaseIdx, phase: this.STORY_PHASES[phaseIdx], intensity: vec[phaseIdx], curve: curve, arcLen: arcLen };
    },

    // Intensidad ∈ [0,1] del año (lo que el Director usa para modular gates/pesos). D2 puro.
    storyIntensity: function(seed, plotId, year) {
        return this.storyPhase(seed, plotId, year).intensity;
    },

    // C15 / EL CRONISTA (story sifting — diseno-historia-completa-v1.0 §3, cierra F7). La corrida
    // produce EVENTOS; una historia son eventos con forma. Estos kinds son el material narrativo del
    // tamiz: los que cambian el estado o la trama, no el relleno de clima (`downtime`/`exploration`).
    // `runTicks` los acumula en `worldState.timeline` a medida que corre (derivación pura de logs ya
    // deterministas → D2 intacto: misma semilla+rumbo → mismo timeline byte a byte). El Cronista los relee.
    STORY_KINDS: ["intro", "desire", "ascension", "combat_win", "loot", "social", "calamity",
        "world", "decision", "death", "invasion", "portal", "anomaly", "regression", "corruption",
        "sentinel", "ambush", "politics", "duel_death", "duel_spared", "encounter", "travel", "branch",
        "settlement", "thread_payoff", "presagio"],
    // Relato vivo (novela-sim): el feed es la VIDA del Anfitrión. El mundo sigue en crónica/LOG.
    HOST_FEED_KINDS: ["intro", "ascension", "combat_win", "loot", "social", "calamity",
        "decision", "death", "invasion", "portal", "anomaly", "regression", "corruption",
        "sentinel", "ambush", "politics", "duel_death", "duel_spared", "encounter", "travel",
        "thread_payoff", "presagio", "act_break", "settlement", "host_death"],

    // Prioridad narrativa para tamizar (más alto = más peso al elegir los beats de cada acto). No es
    // azar ni observación: es una tabla fija de "qué importa más en una vida". F7 del diseño.
    STORY_PRIORITY: {
        host_death: 100, death: 92, decision: 90, desire: 85, thread_payoff: 74, combat_win: 72, duel_death: 70,
        duel_spared: 68, corruption: 62, calamity: 60, anomaly: 56, world: 54, ascension: 50,
        sentinel: 48, invasion: 46, encounter: 44, portal: 40, loot: 38, social: 36, regression: 34,
        ambush: 32, politics: 28, presagio: 26, intro: 22
    },

    // EL CRONISTA (C15): al morir el Host, relee `timeline` (arco propio) + `chronicle` (lo que el
    // mundo anotó de su alma) + su anhelo, y devuelve la vida como RELATO ESTRUCTURADO — actos, cúspide,
    // caída, cabos, epitafio. DATOS, no HTML (la capa 3 lo pinta). Derivación 100% pura: no muta nada,
    // no usa rng → misma semilla → mismo relato byte a byte (T-C15). ANTI-INVENCIÓN: cada beat/cúspide/
    // caída/origen es el texto de una entrada REAL de timeline/chronicle (verificable por test); solo los
    // rótulos de acto y el epitafio son estructurales (derivados de números/anhelo, no eventos inventados).
    // NOTA DE ALCANCE (honestidad): los actos hoy se cortan por tercios de la vida — placeholder honrado
    // hasta que C13 (Director de tensión) dé la curva real; némesis (C12) y cabos de hilos (C11) van
    // vacíos pero declarados, para que esas piezas los llenen sin re-tocar este contrato.
    siftLifeStory: function(worldState) {
        if (!worldState || !worldState.agents || !worldState.agents[0]) return null;
        const agent = worldState.agents[0];
        const meta = worldState.meta || {};
        const u = worldState.universe || null;
        const timeline = (worldState.timeline || []).slice();
        const deathYear = Math.floor((worldState.tick || 0) / 360);
        const survived = agent.hp > 0; // corte por horizonte (no cayó) vs muerte real
        const prio = this.STORY_PRIORITY;

        // La biografía del alma en la BASE (su vida ANTES de ser Host — la rama la heredó y ahora la
        // cierra). Se excluye su propio `host_death`: "antes del hilo" es su pasado, no su final.
        const bio = (u && agent.originSoulId) ? this.soulBiography(u, agent.originSoulId).filter(e => e.kind !== "host_death") : [];
        const origin = bio.length ? bio[bio.length - 1].text : null;

        // Actos por la CURVA REAL del Director (C13): se agrupan los años por (arco, fase) contigua, así el
        // relato se corta donde la vida cambió de intensidad — no por tercios arbitrarios. Si no hay plot/
        // semilla (molde sin mundo), cae al corte por tercios como respaldo honesto.
        const span = Math.max(deathYear, 1);
        const plotId = (meta.plot && meta.plot.id) ? meta.plot.id : null;
        const seed = worldState.seed;
        let actDefs = [];
        if (plotId != null && seed != null && span >= 3) {
            let cur = null;
            for (let y = 0; y <= span; y++) {
                const ph = this.storyPhase(seed, plotId, y);
                const key = ph.arcIndex + ":" + ph.phase;
                if (!cur || cur.key !== key) {
                    cur = { key: key, n: actDefs.length + 1, title: this.STORY_PHASE_LABEL[ph.phase] + (ph.arcIndex > 0 ? ` (ciclo ${ph.arcIndex + 1})` : ""), from: y, to: y };
                    actDefs.push(cur);
                } else { cur.to = y; }
            }
        } else if (span < 3) {
            actDefs = [{ n: 1, title: "Una vida breve", from: 0, to: span }];
        } else {
            const cut1 = Math.max(1, Math.round(span / 3));
            const cut2 = Math.max(cut1 + 1, Math.round(span * 2 / 3));
            actDefs = [
                { n: 1, title: "Origen", from: 0, to: cut1 },
                { n: 2, title: "Ascenso", from: cut1 + 1, to: cut2 },
                { n: 3, title: "Clímax y ocaso", from: cut2 + 1, to: span }
            ];
        }

        const seen = new Set();
        const beatsPerAct = span < 3 ? 5 : 3;
        const acts = actDefs.map(a => {
            const inAct = timeline.filter(e => e.year >= a.from && e.year <= a.to && !seen.has(e.text));
            // Elegir los más notables del acto (prio desc, año asc como desempate estable)…
            const chosen = inAct.slice().sort((x, y) =>
                ((prio[y.kind] || 0) - (prio[x.kind] || 0)) || (x.year - y.year)
            ).slice(0, beatsPerAct);
            chosen.forEach(e => seen.add(e.text));
            // …y contarlos en orden cronológico (una historia se lee hacia adelante).
            chosen.sort((x, y) => x.year - y.year);
            return { title: a.title, span: [a.from, a.to], beats: chosen };
        }).filter(a => a.beats.length > 0).map((a, i) => ({ n: i + 1, ...a })); // renumerar tras filtrar vacíos

        // CÚSPIDE: el punto más alto de su poder (último ascenso/gesta/hazaña). Beat real, no inventado.
        const ascentKinds = new Set(["ascension", "world", "combat_win", "invasion"]);
        let peak = null;
        for (const e of timeline) if (ascentKinds.has(e.kind)) peak = e; // el último (más avanzado)

        // CAÍDA: el golpe que cerró la vida. Preferir el log de muerte real del timeline; si la corrida
        // se cortó por el Admin (abort: sin log de muerte en timeline), tomar el host_death de la crónica.
        let end = null;
        for (const e of timeline) if (e.kind === "death") end = e;
        if (!end && u && agent.originSoulId) {
            const hd = (u.chronicle || []).filter(c => c.kind === "host_death" && c.soulId === agent.originSoulId);
            if (hd.length) end = { year: hd[hd.length - 1].year, kind: "host_death", text: hd[hd.length - 1].text };
        }

        // Anhelo: estado final (cumplido/trunco) — el tema de la vida, ya heredado de la base (C14).
        const desire = agent.desire
            ? { text: agent.desire.text, fulfilled: !!agent.desire.fulfilled, year: agent.desire.year != null ? agent.desire.year : null }
            : null;

        // Epitafio ESTRUCTURAL (no inventa eventos: solo anhelo + años + destino).
        let epitaph;
        if (!desire) {
            epitaph = survived ? `Se retiró del hilo en el año ${deathYear}.` : `Cayó en el año ${deathYear}.`;
        } else if (desire.fulfilled) {
            epitaph = `Cumplió su anhelo${desire.year != null ? ` (año ${desire.year})` : ""} y ${survived ? "siguió su senda" : "cayó"} en el año ${deathYear}: ${desire.text}.`;
        } else {
            epitaph = `${survived ? "Dejó" : "Cayó dejando"} su anhelo trunco: ${desire.text}.`;
        }

        return {
            hostName: agent.name,
            hostClass: agent.class || null,
            faction: agent.faction || null,
            era: meta.era || null,
            plotTitle: (meta.plot && meta.plot.title) ? meta.plot.title : null,
            deathYear: deathYear,
            survived: survived,
            origin: origin,
            acts: acts,
            peak: peak,
            end: end,
            desire: desire,
            // C12: derivación pura sobre agent.nemesisId/bonds (cero invención) — si hubo némesis,
            // el desenlace sale de si sigue viva, murió a manos del Host, o lo venció a él.
            nemesis: (agent.nemesisId && u) ? (() => {
                const npc = u.population.find(p => p.id === agent.nemesisId);
                const bond = agent.bonds && agent.bonds[agent.nemesisId];
                const losses = bond ? bond.history.filter(h => h.kind === "duel_lost").length : 0;
                const resolution = (!npc || !npc.alive) ? "derrotada" : (!survived ? "sin resolver" : "viva");
                return { name: agent.nemesisName || (npc && npc.name) || "desconocida", since: agent.nemesisSince, resolution: resolution, timesLost: losses };
            })() : null,
            // C11: derivación pura sobre worldState.universe.threads (cero mutación, cero invención) —
            // todo hilo que seguía "open" al momento de tamizar es un cabo suelto real de ESTA vida.
            looseThreads: (u && u.threads) ? u.threads.filter(t => t.state === "open").map(t => ({ kind: t.kind, npcName: t.npcName, openedYear: t.openedYear })) : [],
            // C17: el vínculo más fuerte de la vida (mayor |strength|) — derivación pura sobre
            // agent.bonds vía classifyBond, para que el Cronista pueda cerrar el relato nombrando a
            // quien más pesó (aliado o rival), no solo a la némesis.
            strongestBond: (() => {
                if (!agent.bonds) return null;
                const ids = Object.keys(agent.bonds);
                if (!ids.length) return null;
                const strongestId = ids.reduce((best, id) => Math.abs(agent.bonds[id].strength) > Math.abs(agent.bonds[best].strength) ? id : best, ids[0]);
                return this.classifyBond(agent, strongestId);
            })(),
            epitaph: epitaph,
            beatCount: acts.reduce((s, a) => s + a.beats.length, 0)
        };
    },

    // ORIGEN (Pieza 1): el Host base ya no se FABRICA de la nada — el Sistema DESIGNA a un alma real de
    // la población (`universe.population`), determinista por semilla. "El Sistema no crea al héroe:
    // señala a uno de los que ya viven." Sin universo (o sin notables vivos) cae al molde histórico
    // fabricado, byte-idéntico al de antes (lo usan los tests y cualquier arranque sin mundo poblado).
    generateHost: function(worldSeed, era, universe) {
        if (universe && Array.isArray(universe.population)) {
            const notables = universe.population.filter(p => p.alive && !p.fromCrowd);
            if (notables.length > 0) {
                // El Sistema señala a un alma JOVEN si la hay (≤30): los protagonistas del género
                // empiezan jóvenes, y con mortalidad natural designar a un alma de 50 deja corridas
                // de 2-5 años — sin pista por delante no hay historia que contar (audit C15). Si el
                // mundo no tiene jóvenes, cualquiera. El god-deploy no se toca: el Admin elige libre.
                const young = notables.filter(p => (p.age || 16) <= 30);
                const pool = young.length > 0 ? young : notables;
                const soul = pool[Math.floor(this.rng(worldSeed, "host:designate") * pool.length)];
                return this.hostFromSoul(soul, era, { scaleStats: false, seed: worldSeed, universe: universe });
            }
        }
        const streamKey = `host_1`;
        const pick = (arr, salt) => arr[Math.floor(this.rng(worldSeed, streamKey + salt) * arr.length)];
        const storyDict = this.NARRATIVE_MILESTONES[era] || this.NARRATIVE_MILESTONES.UNIVERSAL;

        const root = this.deriveRoot(worldSeed, "agent_0"); // C5: root stats (HP baseline sin tocar, ver C8)
        return {
            id: `agent_0`, name: this.pickName(worldSeed, "host_1:n", era), class: pick(this.classesFor(era), ":c"),
            hp: 100, maxHp: 100, atk: 10, def: 10, discoveredCards: [], deck: [],
            constitution: root.constitution, insight: root.insight,
            innateTalents: this.deriveInnateTalents(worldSeed, "agent_0", root.insight), // C4
            lifespan: 60 + Math.round((root.constitution - 50) * 0.6), // C8: techo de años por 根骨
            faction: null, nemesis: this.pickName(worldSeed, "host_1:nem", era), bond: this.pickName(worldSeed, "host_1:bond", era),
            luck: this.deriveLuck(worldSeed, "agent_0"),
            will: this.deriveWill(worldSeed, "agent_0"), willMax: this.deriveWill(worldSeed, "agent_0"),
            // El molde fabricado también quiere algo (sin universo el pool cae a gloria/longevidad).
            age: 16,
            desire: this.deriveDesire(worldSeed, { id: "agent_0" }, null),
            milestones: {}
        };
    },

    // GOD-DEPLOY (Fase 10 §0-bis/§7-ter.2): promueve un NPC de la historia de la semilla a Anfitrión
    // desplegable. Determinista: mismo NPC → mismo bloque de Host. Conserva NOMBRE y CLASE del NPC;
    // deriva stats de su `power` (un notable fuerte arranca fuerte — "que domine todo si el Admin
    // quiere"). La afiliación a facción/zona la hace el intro normal de runTicks (no se toca la
    // maquinaria de materializeZone). `promotedFrom` deja rastro del origen (ancla de reproducción D3).
    promoteNpcToHost: function(npc, meta, seed) {
        return this.hostFromSoul(npc, meta.era, { scaleStats: true, promoted: true, seed: seed || 0 });
    },

    // C18 — SAGA COMO OPCIÓN (Parte 10.3/`diseno-historia-completa-v1.0.md`, deuda cerrada): al morir
    // el Host, además de re-correr la MISMA semilla (el bucle 模拟器 de siempre), la Cosecha puede
    // ofrecer continuar con un descendiente — el mundo NO se regenera (universe/tick/chronicle siguen
    // igual, D3 barato: es solo una anotación más en choiceLog). Herederos = hijos reales
    // (`parentId === originSoulId` del Host) si los hay; si no, cualquier notable vivo de su propia
    // facción (sucesión dinástica, patrón CK) — nunca inventa un heredero de la nada, solo lee
    // `universe.population` ya existente.
    findHeirs: function(worldState, agent) {
        const u = worldState.universe;
        if (!u || !agent) return [];
        const children = agent.originSoulId ? u.population.filter(p => p.alive && p.parentId === agent.originSoulId) : [];
        if (children.length) return children.sort((a, b) => b.power - a.power);
        if (!agent.factionId) return [];
        return u.population.filter(p => p.alive && p.factionId === agent.factionId).sort((a, b) => b.power - a.power);
    },

    // Nombre combinatorio determinista (nombre + epíteto): 12×10 = 120 combinaciones estables por
    // semilla+salt, suficiente para poblar el universo sin repetir de forma obvia.
    FACTION_KIND: {
        FANTASIA:    [{ art: "la", k: "Orden" }, { art: "el", k: "Gremio" }, { art: "la", k: "Casa" }, { art: "el", k: "Círculo" }],
        CYBERPUNK:   [{ art: "la", k: "Corp" }, { art: "el", k: "Sindicato" }, { art: "el", k: "Clan" }, { art: "el", k: "Sector" }],
        CULTIVACION: [{ art: "la", k: "Secta" }, { art: "el", k: "Clan" }, { art: "el", k: "Pabellón" }, { art: "el", k: "Valle" }],
        "SCI-FI":    [{ art: "la", k: "Flota" }, { art: "el", k: "Consorcio" }, { art: "los", k: "Piratas" }, { art: "el", k: "Enclave" }],
        APOCALIPSIS: [{ art: "el", k: "Campamento" }, { art: "los", k: "Saqueadores" }, { art: "la", k: "Zona" }, { art: "el", k: "Culto" }],
        MODERNO:     [{ art: "el", k: "Departamento" }, { art: "la", k: "Firma" }, { art: "el", k: "Cártel" }, { art: "la", k: "Oficina" }]
    },
    forgeGiven: function(seed, salt, worldType) {
        const type = worldType || "UNIVERSAL";
        const extra = this.NAME_ONSET_BY_TYPE[type] || [];
        const onsets = this.NAME_ONSET.concat(extra);
        const o = onsets[Math.floor(this.rng(seed, "nm:o:" + salt) * onsets.length)];
        let c = this.NAME_CODA[Math.floor(this.rng(seed, "nm:c:" + salt) * this.NAME_CODA.length)];
        let tries = 0;
        while (tries < 8 && o.slice(-1).toLowerCase() === c.charAt(0).toLowerCase()) {
            tries++;
            c = this.NAME_CODA[Math.floor(this.rng(seed, "nm:c:" + salt + ":r" + tries) * this.NAME_CODA.length)];
        }
        const given = o + c;
        return given.charAt(0).toUpperCase() + given.slice(1).toLowerCase();
    },
    pickName: function(seed, salt, worldType) {
        const givenC = this.forgeGiven(seed, salt, worldType);
        const nouns = this.EPITHET_NOUNS;
        const noun = nouns[Math.floor(this.rng(seed, "nm:n:" + salt) * nouns.length)];
        const form = this.rng(seed, "nm:f:" + salt);
        let epi;
        if (form < 0.38) {
            epi = noun.g === "f" ? ("de la " + noun.n) : ("del " + noun.n);
        } else if (form < 0.78) {
            const g = this.rng(seed, "nm:g:" + salt) < 0.5 ? "m" : "f";
            const adj = this.EPITHET_ADJ[g][Math.floor(this.rng(seed, "nm:a:" + salt) * this.EPITHET_ADJ[g].length)];
            epi = (g === "f" ? "la " : "el ") + adj;
        } else {
            epi = "sin " + noun.n;
        }
        return this.polishEs(givenC + " " + epi);
    },
    forgeFactionName: function(seed, salt, worldType) {
        const kinds = this.FACTION_KIND[worldType] || this.FACTION_KIND.MODERNO;
        const kind = kinds[Math.floor(this.rng(seed, "fk:" + salt) * kinds.length)];
        const who = this.forgeGiven(seed, "fn:" + salt, worldType);
        const art = kind.art ? (kind.art + " ") : "";
        if (kind.art === "los") return this.polishEs(art + kind.k + " de " + who);
        return this.polishEs(art + kind.k + " de " + who);
    },
    forgeBeastName: function(seed, salt, worldType) {
        return this.forgeGiven(seed, "bst:" + salt, worldType);
    },
    forgeShipName: function(seed, salt, worldType) {
        const a = this.forgeGiven(seed, "shp:a:" + salt, worldType);
        const noun = this.EPITHET_NOUNS[Math.floor(this.rng(seed, "shp:n:" + salt) * this.EPITHET_NOUNS.length)];
        return a + " " + noun.n;
    },

    // Arquetipos de zona (Parte 4 del doc maestro, eje DETAILED↔ABSTRACT): el universo se reparte
    // en territorios con perfiles de riesgo distintos. La zona donde vive el Host se simula DETAILED
    // (roll por habitante, social fino habilitado); las demás quedan ABSTRACT (estadística agregada,
    // un roll por zona). Sin Host mirando, todas las zonas son ABSTRACT — el río corre igual.
    // `danger` escala la mortalidad local; `baseWealth` es la riqueza inicial (la economía la
    // evoluciona año a año: estabilidad política suma, guerras y peligro drenan); `crowdBase` es
    // la masa anónima inicial del territorio (población estadística, no entidades nombradas).
    // `tier` (Fase 1) fija la ESCALA demográfica del territorio vía NODE_TIERS: hoy las tres son
    // CIUDAD (~10^7 almas c/u). La jerarquía anidada ciudad→continente→planeta llega en Fase 2; por
    // ahora el tier es una etiqueta plana que reemplaza el `crowdBase` chico. `danger` escala la
    // mortalidad; `baseWealth` la riqueza inicial (y modula capacidad/masa inicial).
    // v1.18.0 (pedido de Taco: "¿cómo van a tener aleatorio si solo hay 3 plantillas?"): el pool pasa
    // de 3 a 12 arquetipos y cada mundo SELECCIONA 3–5 (ponderado por `w`, sin repetir, determinista).
    // Calibrado contra la práctica real: RimWorld (bioma = eje recursos↔hostilidad: del bosque
    // templado "modo fácil" al hielo marino "lo peor"), No Man's Sky (~10 arquetipos por mundo, el
    // exuberante ideal es raro y el exótico también). Riqueza alta con peligro bajo = zona ideal y
    // ESCASA (w bajo); riqueza alta con peligro alto = "infierno verde" (ventaja + limitante juntos).
    // NOMBRES ENTENDIBLES POR ERA (pedido de Taco: "¿cómo sé qué es el Corazón del Poder?"). Cada
    // arquetipo conserva su IDENTIDAD MECÁNICA (id/danger/wealth/w — la dinámica no cambia), pero el
    // nombre visible sale de la ERA del mundo y dice QUÉ es el lugar: la misma zona segura y rica es
    // "la Capital del Reino" en fantasía y "el Distrito Corporativo" en cyberpunk. `name` queda como
    // respaldo universal (eras sin entrada). Las zonas guardan `archId` para tests/lógica.
    ZONE_ARCHETYPES: [
        { id: "capital",   name: "el Corazón del Poder",     tier: "CIUDAD", danger: 0.7,  baseWealth: 70, w: 3,
          names: { FANTASIA: "la Capital del Reino", CULTIVACION: "la Ciudad Imperial", MODERNO: "la Capital", CYBERPUNK: "el Distrito Corporativo", "SCI-FI": "la Estación Capital", APOCALIPSIS: "el Último Bastión" } },
        { id: "campos",    name: "las Tierras Medias",       tier: "CIUDAD", danger: 1.0,  baseWealth: 50, w: 4,
          names: { FANTASIA: "las Tierras de Labranza", CULTIVACION: "las Aldeas del Valle", MODERNO: "los Suburbios", CYBERPUNK: "los Bloques Residenciales", "SCI-FI": "las Colonias Agrícolas", APOCALIPSIS: "los Asentamientos del Cráter" } },
        { id: "frontera",  name: "la Frontera Salvaje",      tier: "CIUDAD", danger: 1.45, baseWealth: 30, w: 3,
          names: { FANTASIA: "la Frontera Bárbara", CULTIVACION: "las Tierras Fronterizas", MODERNO: "la Zona de Conflicto", CYBERPUNK: "los Barrios Bajos", "SCI-FI": "el Borde Exterior", APOCALIPSIS: "las Tierras Muertas" } },
        { id: "joya",      name: "la Capital Milenaria",     tier: "CIUDAD", danger: 0.55, baseWealth: 85, w: 1,
          names: { FANTASIA: "la Ciudad Dorada", CULTIVACION: "la Ciudad de los Ancestros", MODERNO: "la Metrópolis Dorada", CYBERPUNK: "la Torre Arcológica", "SCI-FI": "el Anillo Próspero", APOCALIPSIS: "la Bóveda Intacta" } },
        { id: "selva",     name: "la Selva Febril",          tier: "CIUDAD", danger: 1.5,  baseWealth: 45, w: 2,
          names: { FANTASIA: "la Selva de los Monstruos", CULTIVACION: "el Bosque de las Bestias", MODERNO: "la Jungla Minera", CYBERPUNK: "el Mercado Negro", "SCI-FI": "la Luna Selvática", APOCALIPSIS: "la Jungla Mutante" } },
        { id: "yermo",     name: "el Yermo Ceniciento",      tier: "CIUDAD", danger: 1.7,  baseWealth: 15, w: 1.5,
          names: { FANTASIA: "el Páramo Maldito", CULTIVACION: "las Tierras Desoladas", MODERNO: "el Desierto Contaminado", CYBERPUNK: "el Vertedero Tóxico", "SCI-FI": "el Planeta Yermo", APOCALIPSIS: "el Cráter del Impacto" } },
        { id: "puerto",    name: "el Archipiélago Mercante", tier: "CIUDAD", danger: 0.9,  baseWealth: 65, w: 2.5,
          names: { FANTASIA: "el Puerto de los Mercaderes", CULTIVACION: "la Ciudad del Gran Río", MODERNO: "el Puerto Franco", CYBERPUNK: "el Mercado de Contrabando", "SCI-FI": "el Puerto Estelar", APOCALIPSIS: "el Mercado de Trueque" } },
        { id: "minas",     name: "las Minas Profundas",      tier: "CIUDAD", danger: 1.25, baseWealth: 55, w: 2.5,
          names: { FANTASIA: "las Minas del Monte", CULTIVACION: "las Minas de Piedra Espiritual", MODERNO: "la Cuenca Minera", CYBERPUNK: "la Zona Industrial", "SCI-FI": "el Cinturón Minero", APOCALIPSIS: "las Minas Derrumbadas" } },
        { id: "templo",    name: "la Ciudadela Sagrada",     tier: "CIUDAD", danger: 0.8,  baseWealth: 60, w: 2,
          names: { FANTASIA: "el Gran Templo", CULTIVACION: "el Monasterio de la Montaña", MODERNO: "la Ciudad de los Templos", CYBERPUNK: "el Refugio de la Vieja Fe", "SCI-FI": "el Templo Orbital", APOCALIPSIS: "el Santuario de los Creyentes" } },
        { id: "ruinas",    name: "las Ruinas Precursoras",   tier: "CIUDAD", danger: 1.55, baseWealth: 40, w: 1,
          names: { FANTASIA: "las Ruinas del Imperio Caído", CULTIVACION: "las Ruinas Ancestrales", MODERNO: "la Ciudad Abandonada", CYBERPUNK: "los Laboratorios Abandonados", "SCI-FI": "la Nave Precursora Caída", APOCALIPSIS: "la Metrópolis en Ruinas" } },
        { id: "estepa",    name: "la Estepa Nómada",         tier: "CIUDAD", danger: 1.1,  baseWealth: 35, w: 2.5,
          names: { FANTASIA: "las Estepas de los Jinetes", CULTIVACION: "las Praderas Nómadas", MODERNO: "el Interior Rural", CYBERPUNK: "las Autopistas Nómadas", "SCI-FI": "la Flota Errante", APOCALIPSIS: "los Caminos de las Caravanas" } },
        { id: "abismo",    name: "el Abismo Fracturado",     tier: "CIUDAD", danger: 1.6,  baseWealth: 25, w: 1.5,
          names: { FANTASIA: "el Abismo de los Demonios", CULTIVACION: "la Grieta del Vacío", MODERNO: "la Falla Sísmica", CYBERPUNK: "los Subniveles Hundidos", "SCI-FI": "la Anomalía Espacial", APOCALIPSIS: "la Grieta Radiactiva" } }
    ],

    // RASGOS DE MUNDO (v1.18.0, estilo Stellaris "planet modifiers": hasta 2 por mundo, y los buenos
    // son MIXTOS — cada rasgo tiene ventaja Y limitante, nunca gratis). Traducción xianxia del canon:
    // densidad de qi, épocas desoladas, sellos de mundo. Los efectos (`fx`) modulan palancas que YA
    // existen (crecimiento, guerras, natalidad, botín, 奇遇, alcance, tipos de carta) de forma
    // determinista: sesgan, no crean azar (D2). `typeMult` multiplica los pesos del PERFIL DE ERA —
    // un rasgo puede suprimir o potenciar un tipo por razones del MUNDO (gate diegético, no de tabla).
    WORLD_TRAITS: {
        qi_denso:          { name: "Qi Denso",             ventaja: "crecimiento anual exuberante",            limitante: "las tribulaciones abundan",                fx: { growth: 1.25, calamityBias: 0.12 }, eras: ["CULTIVACION", "FANTASIA"] },
        epoca_desolada:    { name: "Época Desolada",       ventaja: "un mundo apagado guerrea poco",           limitante: "el qi escasea: crecimiento y 奇遇 menguan", fx: { growth: 0.85, war: 0.7, encounterGate: -0.08 }, eras: ["CULTIVACION", "FANTASIA", "APOCALIPSIS"] },
        sello_mundial:     { name: "Sello del Mundo",      ventaja: "la calma del aislamiento",                limitante: "ninguna leyenda cruza el vacío",           fx: { war: 0.7, reachCap: 2 } },
        tierras_fecundas:  { name: "Tierras Fecundas",     ventaja: "la vida brota por doquier",               limitante: "la abundancia atrae la codicia",           fx: { birth: 1.4, war: 1.2 }, eras: ["FANTASIA", "CULTIVACION", "MODERNO"] },
        guerra_eterna:     { name: "Guerra Eterna",        ventaja: "el botín de los campos de batalla",       limitante: "las potencias no conocen la paz",          fx: { war: 1.6, loot: 1.25 } },
        supresion_celeste: { name: "Supresión del Cielo",  ventaja: "el alma compensa: los talentos florecen", limitante: "el Cielo aplasta la tecnología",           fx: { typeMult: { "TECNOLOGÍA": 0, "TALENTO": 1.5 } }, eras: ["CULTIVACION", "FANTASIA"] },
        eco_precursor:     { name: "Eco Precursor",        ventaja: "ruinas de otra edad sueltan tecnología",  limitante: "sus guardianes siguen despiertos",         fx: { typeMult: { "TECNOLOGÍA": 2.5 }, calamityBias: 0.1 }, eras: ["SCI-FI", "CYBERPUNK", "APOCALIPSIS"] },
        velo_espiritual:   { name: "Velo Espiritual",      ventaja: "la vida se llena de encuentros",          limitante: "el velo también trae traiciones y plagas", fx: { encounterGate: 0.12, calamityBias: 0.08 }, eras: ["CULTIVACION", "FANTASIA"] },
        mundo_moribundo:   { name: "Mundo Moribundo",      ventaja: "la desesperación suelta reliquias",       limitante: "la tierra se agota y nacen pocos",         fx: { loot: 1.35, birth: 0.7, wealthDrift: -1 }, eras: ["APOCALIPSIS", "CULTIVACION"] },
        abundancia:        { name: "Abundancia Primordial", ventaja: "economía firme y tierras ricas",         limitante: "los notables se ablandan",                 fx: { wealthDrift: 1, growth: 0.9 }, eras: ["FANTASIA", "CULTIVACION", "MODERNO", "SCI-FI"] },
        reino_bestial:     { name: "Reino Bestial",        ventaja: "cazar bestias suelta buen botín",         limitante: "el mundo es salvaje y violento",           fx: { loot: 1.2, war: 1.15 }, eras: ["FANTASIA", "CULTIVACION", "APOCALIPSIS"] },
        cuna_inmortal:     { name: "Tierra Rica",          ventaja: "una tierra fértil nutre a quien vive aquí", limitante: "atrae buscavidas y encuentros peligrosos", fx: { growth: 1.15, encounterGate: 0.08 }, eras: ["CULTIVACION", "FANTASIA"] },
        fractura_dimensional: { name: "Fractura Dimensional", ventaja: "grietas a otra edad sueltan reliquias",  limitante: "por ellas se cuela la calamidad",          fx: { loot: 1.15, calamityBias: 0.15 }, eras: ["SCI-FI", "CYBERPUNK", "FANTASIA"] },
        edad_dorada:       { name: "Edad Dorada",          ventaja: "prosperidad y natalidad florecientes",    limitante: "la comodidad ablanda el filo",             fx: { birth: 1.25, wealthDrift: 1, growth: 0.92 } },
        maldicion_ancestral: { name: "Maldición Ancestral", ventaja: "la ruina obliga a forjar reliquias",     limitante: "la sombra pesa: pocos nacen y abundan calamidades", fx: { birth: 0.75, loot: 1.2, calamityBias: 0.12 }, eras: ["FANTASIA", "CULTIVACION"] },
        mar_de_estrellas:  { name: "Mar de Estrellas",     ventaja: "cielos serenos y crecimiento firme",      limitante: "la paz adormece las potencias",            fx: { growth: 1.12, war: 0.85 }, eras: ["SCI-FI", "CYBERPUNK"] }
    },

    // Combina los rasgos del mundo en un solo bloque de multiplicadores/deltas. Derivación pura y
    // barata (sin rng): se recalcula donde se necesita, nunca se cachea en el World (B7).
    traitFx: function(meta) {
        const fx = { growth: 1, war: 1, birth: 1, loot: 1, encounterGate: 0, calamityBias: 0, reachCap: 3, wealthDrift: 0, typeMult: {} };
        ((meta && meta.traits) || []).forEach((id) => {
            const t = this.WORLD_TRAITS[id];
            if (!t) return;
            const f = t.fx;
            if (f.growth) fx.growth *= f.growth;
            if (f.war) fx.war *= f.war;
            if (f.birth) fx.birth *= f.birth;
            if (f.loot) fx.loot *= f.loot;
            if (f.encounterGate) fx.encounterGate += f.encounterGate;
            if (f.calamityBias) fx.calamityBias += f.calamityBias;
            if (f.reachCap != null) fx.reachCap = Math.min(fx.reachCap, f.reachCap);
            if (f.wealthDrift) fx.wealthDrift += f.wealthDrift;
            if (f.typeMult) for (const k in f.typeMult) fx.typeMult[k] = (fx.typeMult[k] != null ? fx.typeMult[k] : 1) * f.typeMult[k];
        });
        return fx;
    },

    // Constantes del macro-tick en un solo lugar, para rebalancear sin cazar números mágicos.
    // warChance bajó de 0.35 a 0.22 y schismChance es nuevo: sin cisma, las guerras dejaban un
    // imperio único para el año ~12 y la historia se apagaba (medido en tests/run-tests.js).
    UNIVERSE_CONFIG: { initialPopulation: 12, birthChance: 0.55, warChance: 0.22, schismChance: 0.3, migrationChance: 0.12, graveyardPurgeInterval: 100 },

    // GÉNESIS DEL UNIVERSO (capa 1 pura, determinista). Antes la "génesis" solo devolvía etiquetas
    // (era/trama/rango) y creaba UN Host — el mundo estaba vacío. Ahora la semilla puebla un universo
    // real: facciones como entidades con poder/miembros e inhabitants (cast) con clase, facción y
    // poder propios. El mundo EXISTE antes de que el Host llegue, y seguirá existiendo cuando muera.
    generateUniverse: function(seed, meta) {
        const r = (salt) => this.rng(seed, "univ:" + salt);

        // Cada zona lleva, además de sus entidades nombradas, una MASA anónima (crowd): población
        // estadística {count, avgAge, avgPower} (Fase 5 §5.1: promedios, no sumatorios — el mismo
        // cimiento numérico de makeNode/tickNode) que vive, envejece y muere por agregados — los
        // MILLONES del mundo sin pagar una entidad por cabeza (Fase 1: la masa refleja la escala del
        // tier). Los notables (population) son la capa nombrada, delgada, encima de esa masa.
        // SELECCIÓN DE ZONAS (v1.18.0): el mundo ya no es siempre el mismo mapa de 3 — toma 3–5
        // arquetipos del pool de 12, ponderados por `w` y sin repetir, todo determinista por semilla.
        const zoneCount = 3 + Math.floor(r("zn") * 3); // 3..5
        const pool = this.ZONE_ARCHETYPES.slice();
        const picked = [];
        for (let k = 0; k < zoneCount && pool.length > 0; k++) {
            const arch = this.pickWeighted(pool.map(a => ({ v: a, w: a.w || 1 })), r("zpick:" + k));
            picked.push(arch);
            pool.splice(pool.indexOf(arch), 1);
        }

        const zones = picked.map((z, i) => {
            const wealth = Math.max(5, Math.min(100, z.baseWealth + Math.floor(r("zw:" + i) * 21) - 10));
            // La masa inicial refleja la ESCALA del nodo (la base ya implica su población: una ciudad
            // NO arranca en 60 y crece — ya está poblada), modulada por la riqueza y una variación
            // determinista por semilla, acotada por la capacidad de carga del tier.
            const tier = this.NODE_TIERS[z.tier] || this.NODE_TIERS.ZONA;
            const count = Math.max(50, Math.floor(tier.cap * (wealth / 100) * (0.6 + r("zc:" + i) * 0.5)));
            // GRADO de la zona (§6.4, fase 2): rank F→S derivado del rango GLOBAL (el del mundo del Host)
            // con sesgo por el ARQUETIPO — una zona segura (danger bajo, el Corazón) tiende a grado menor;
            // una frontera peligrosa (danger alto) a grado mayor — más variación leve por semilla. Es una
            // ETIQUETA de grado de mundo: NO altera `danger` ni la dinámica (D7 byte-idéntico; el techo de
            // poder por nodo en la derivación es la fase 2b, aún no aplicada).
            const rankKeys = Object.keys(this.WORLD_TIERS);
            const bias = z.danger < 0.85 ? -1 : z.danger > 1.2 ? 1 : 0;
            const varr = Math.floor(r("zrank:" + i) * 3) - 1; // -1..+1
            const rankIdx = Math.max(0, Math.min(rankKeys.length - 1, rankKeys.indexOf(meta.tierId) + bias + varr));
            const rankId = rankKeys[rankIdx];
            return {
                id: "zone_" + i,
                // El nombre visible es el de la ERA (entendible: dice qué ES el lugar); `archId`
                // conserva la identidad mecánica del arquetipo para lógica y tests.
                name: ((z.names && (z.names[meta.era] || z.names.UNIVERSAL)) || z.name)
                    + " de " + this.forgeGiven(seed, "zone:" + i, meta.era),
                archId: z.id,
                tier: z.tier,
                rank: rankId,
                grade: this.WORLD_TIERS[rankId].desc,
                danger: z.danger,
                wealth: wealth,
                rulerFacId: null,
                // ECONOMÍA REAL (Parte 8): producción cacheada UNA vez en génesis, como `danger` — es
                // f(semilla, nodeId, era) y no cambia con el tiempo; el comercio (zoneTradeBonus) la lee
                // en cada tick sin volver a tirar rng (D2 intacto).
                production: this.zoneProduction(seed, "zone_" + i, meta.era),
                crowd: { count: count, avgAge: 30, avgPower: Math.max(2, Math.floor(8 * meta.tierData.mult)) }
            };
        });

        const factions = [];
        for (let i = 0; i < 4; i++) {
            factions.push({
                id: "fac_" + i,
                name: this.forgeFactionName(seed, "fac:" + i, meta.era),
                power: Math.floor((40 + r("fpow:" + i) * 120) * meta.tierData.mult),
                members: Math.floor(20 + r("fmem:" + i) * 80),
                zoneId: zones[Math.floor(r("fzone:" + i) * zones.length)].id,
                alive: true
            });
        }

        const population = [];
        for (let i = 0; i < this.UNIVERSE_CONFIG.initialPopulation; i++) {
            const fac = factions[Math.floor(r("pf:" + i) * factions.length)];
            const soul = {
                id: "npc_" + i,
                name: this.pickName(seed, "cast:" + i, meta.era),
                class: this.classesFor(meta.era)[Math.floor(r("pc:" + i) * this.classesFor(meta.era).length)],
                factionId: fac.id,
                zoneId: fac.zoneId,
                power: Math.floor((10 + r("pp:" + i) * 40) * meta.tierData.mult),
                age: Math.floor(16 + r("pa:" + i) * 44),
                alive: true
            };
            // El anhelo nace CON el alma, en la base (la rama solo lo leerá al seleccionarla).
            soul.desire = this.deriveDesire(seed, soul, { zones: zones, factions: factions });
            // El impulso también nace CON el alma (C21): el por qué de sus actos, desde el génesis.
            soul.drive = this.deriveDrive(seed, soul);
            population.push(soul);
        }

        // Política de génesis: cada territorio arranca regido por la facción más fuerte asentada
        // en él (o sin regente si nadie plantó estandarte ahí — tierra de nadie).
        zones.forEach((zone) => {
            const seated = factions.filter(f => f.zoneId === zone.id);
            if (seated.length > 0) zone.rulerFacId = seated.slice().sort((a, b) => b.power - a.power)[0].id;
        });

        const totalCrowd = zones.reduce((s, z) => s + z.crowd.count, 0);
        const cosmos = this.generateCosmos(seed, meta);
        const cosmosCrowd = [...cosmos.otherContinents, ...cosmos.otherPlanets].reduce((s, n) => s + n.crowd.count, 0);
        // El planeta hermano de mayor GRADO (§6.4) se nombra en la génesis: da textura de "mil mundos".
        const rankKeys = Object.keys(this.WORLD_TIERS);
        const topSibling = cosmos.otherPlanets.slice().sort((a, b) => rankKeys.indexOf(b.rank) - rankKeys.indexOf(a.rank))[0];
        const siblingNote = topSibling ? `, entre ellos ${topSibling.name}, un ${topSibling.grade} de rango ${topSibling.rank}` : "";
        const regime = this.deriveRegime(meta, null, 0);
        const regimeDesc = this.REGIMES[regime].desc;
        return {
            zones,
            factions,
            population,
            cosmos,
            regime,
            nextNpcId: population.length,
            chronicle: [{ year: 0, kind: "genesis", text: `El universo ${meta.era} tomó forma bajo el signo de ${meta.plot.title}, en ${regimeDesc}: ${zones.length} territorios y ${factions.length} potencias en la región del Anfitrión (un ${meta.tierData.desc} de rango ${meta.tierId}), ${population.length} almas notables, y ${this.formatCount(totalCrowd + cosmosCrowd)} más entre las masas de este mundo y los ${cosmos.otherPlanets.length} planetas hermanos que orbitan en la lejanía${siblingNote}. Rasgos de este mundo: ${(meta.traits || []).map(t => this.WORLD_TRAITS[t] ? this.WORLD_TRAITS[t].name : t).join(" y ") || "ninguno"}.` }],
            counters: { births: 0, deaths: 0, wars: 0, factionsFallen: 0, schisms: 0, takeovers: 0 }
        };
    },

    // FONDO CÓSMICO (Fase 2 §3, LOD): el universo MÁS ALLÁ de la región del Host. La rama del Host (sus
    // zonas, capa fina) es lo DETAILED; el resto del cosmos —los otros continentes de su planeta y los
    // otros planetas del universo— queda como nodos AGREGADOS que evolucionan baratos con tickNode
    // (O(nodos), no O(población)). Son población ADICIONAL del universo (§1-bis: la base f(semilla) ya
    // implica que el mundo es enorme), sin doble-conteo con las zonas: representan lo que las zonas no
    // cubren. Determinista por semilla. Base para el Radio de Impacto (Ladrillo 4): cuando el Host sea
    // suficientemente poderoso, su diff alcanzará estos nodos.
    generateCosmos: function(seed, meta) {
        const r = (salt) => this.rng(seed, "cosmos:" + salt);
        const mkAgg = (idx, tier, kind, nameTpl) => {
            const t = this.NODE_TIERS[tier];
            // GRADO por nodo (§6.4): rank F→S con sesgo por el rango GLOBAL (= el del planeta del Host).
            // El peligro y el techo de poder (avgPower) del nodo salen de SU grado, no del global — un
            // mundo hermano de rango S alberga seres más fuertes que el del Host si éste es de grado menor.
            const rankId = this.deriveRank(seed, "cosmos:rank:" + kind + idx, meta.tierId);
            const rankData = this.WORLD_TIERS[rankId];
            const wealth = Math.max(5, Math.min(100, 25 + Math.floor(r(kind + ":w" + idx) * 60)));
            const danger = this.dangerFromRank(seed, "cosmos:dg:" + kind + idx, rankId);
            const count = Math.max(100, Math.floor(t.cap * (wealth / 100) * (0.5 + r(kind + ":c" + idx) * 0.6)));
            const node = this.makeNode(kind + "_" + idx, tier, { danger: danger, wealth: wealth, rank: rankId, grade: rankData.desc, count: count, avgAge: 30, avgPower: Math.max(2, Math.floor(8 * rankData.mult)) });
            node.name = nameTpl.replace("{n}", this.pickName(seed, "cosmos:name:" + kind + idx, meta.era));
            return node;
        };
        const otherContinents = [];
        for (let i = 0; i < (this.NODE_TIERS.PLANETA.fanout - 1); i++) otherContinents.push(mkAgg(i, "CONTINENTE", "cont", "las tierras de {n}"));
        const otherPlanets = [];
        for (let i = 0; i < (this.NODE_TIERS.UNIVERSO.fanout - 1); i++) otherPlanets.push(mkAgg(i, "PLANETA", "plan", "el mundo de {n}"));
        return { otherContinents: otherContinents, otherPlanets: otherPlanets };
    },

    // Evoluciona el fondo cósmico un año (barato: O(nodos agregados)). Cada nodo tick-ea su crowd; de
    // vez en cuando un nodo vive un evento MAJOR a gran escala (auge o cataclismo) que modula su riqueza
    // y entra a la Crónica como historia lejana. Determinista (todo el azar sale del `r` por-año de
    // advanceUniverse). No toca zonas/facciones/población → no puede violar D6.
    advanceCosmos: function(worldState, r, meta, record) {
        const u = worldState.universe;
        if (!u || !u.cosmos) return;
        const nodes = [...u.cosmos.otherContinents, ...u.cosmos.otherPlanets];
        const year = Math.floor(worldState.tick / 360);
        nodes.forEach((node) => this.tickNode(node, worldState.seed, "cosmos:y" + year + ":" + node.id, meta));
        if (nodes.length && r("cosmosevt") < 0.18) {
            const node = nodes[Math.floor(r("cosmoswho") * nodes.length)];
            const rise = r("cosmoskind") < 0.5;
            const vars = { place: node.name, rank: node.rank || "D", grade: node.grade || "Estándar" };
            if (rise) {
                node.wealth = Math.min(100, node.wealth + 6);
                const tpl = this.pickTemplate(worldState.seed, "cosmos_rise:y" + year, this.CFG_DICTIONARY.world_cosmos_rise);
                record("cosmos", `[COSMOS] ${this.fillVars(tpl, vars)}`, "text-cyan");
            } else {
                node.wealth = Math.max(5, node.wealth - 8);
                const tpl = this.pickTemplate(worldState.seed, "cosmos_war:y" + year, this.CFG_DICTIONARY.world_cosmos_war);
                record("cosmos", `[COSMOS] ${this.fillVars(tpl, vars)}`, "text-yellow");
            }
        }
    },

    // SNAPSHOT REAL (Parte 4, fase 3): al DETALLAR una zona, parte de su masa anónima se
    // materializa en almas nombradas coherentes con los agregados (edad/poder alrededor del promedio
    // de la masa, facción asentada en la zona) — determinista por semilla+tick+zona. Al ABSTRAER
    // (el Host se va), las almas nacidas de la masa que sigan vivas se disuelven de vuelta en ella.
    // Los notables de génesis y los que se alzaron por nacimiento nombrado NUNCA se disuelven.
    materializeZone: function(worldState, zoneId, k) {
        const u = worldState.universe;
        if (!u || !u.zones) return [];
        const zone = u.zones.find(z => z.id === zoneId);
        if (!zone || !zone.crowd) return [];
        const made = [];
        const seated = u.factions.filter(f => f.alive && f.zoneId === zoneId);
        const anyFacs = u.factions.filter(f => f.alive);
        for (let i = 0; i < k && zone.crowd.count > 0; i++) {
            const salt = "mat:" + zoneId + ":" + worldState.tick + ":" + i;
            const rr = (s) => this.rng(worldState.seed, salt + ":" + s);
            const avgAge = zone.crowd.avgAge;
            const avgPow = zone.crowd.avgPower;
            const pool = seated.length ? seated : anyFacs;
            const fac = pool.length ? pool[Math.floor(rr("f") * pool.length)] : null;
            const soul = {
                id: "npc_" + (u.nextNpcId++),
                name: this.pickName(worldState.seed, salt, worldState.meta && worldState.meta.era),
                class: this.classesFor(worldState.meta && worldState.meta.era)[Math.floor(rr("c") * this.classesFor(worldState.meta && worldState.meta.era).length)],
                factionId: fac ? fac.id : null,
                zoneId: zoneId,
                power: Math.max(1, Math.round(avgPow * (0.7 + rr("p") * 0.6))),
                age: Math.max(16, Math.round(avgAge * (0.8 + rr("a") * 0.4))),
                alive: true,
                fromCrowd: true
            };
            // avgAge/avgPower NO cambian: se extrae un alma "en la media" de la masa (mismo criterio
            // que la mortalidad agregada, §5.1 — sin sumatorios que ajustar).
            zone.crowd.count -= 1;
            u.population.push(soul);
            made.push(soul);
        }
        return made;
    },

    dissolveZone: function(worldState, zoneId) {
        const u = worldState.universe;
        if (!u || !u.zones) return;
        const zone = u.zones.find(z => z.id === zoneId);
        if (!zone || !zone.crowd) return;
        u.population = u.population.filter((p) => {
            if (p.fromCrowd && p.alive && p.zoneId === zoneId) {
                // Mezcla ponderada (§5.1, mismo criterio que un nacimiento en tickNode): el alma que
                // vuelve a la masa desplaza el promedio en proporción a 1/(count+1).
                zone.crowd.avgAge = (zone.crowd.count * zone.crowd.avgAge + p.age) / (zone.crowd.count + 1);
                zone.crowd.avgPower = (zone.crowd.count * zone.crowd.avgPower + p.power) / (zone.crowd.count + 1);
                zone.crowd.count += 1;
                return false;
            }
            return true;
        });
    },

    // COMPACTAR MUERTOS (Fase 2, cimiento numérico — diseño §5.2). La capa nombrada `population` nunca
    // purgaba a los muertos (`alive=false` pero seguían en el array): crece ~0.5/año y los escaneos por
    // zona (lifecycle/economía/política, todos O(P)) se vuelven cada vez más gordos → costo O(años²)
    // suave. Irrelevante en una partida (un Host vive décadas) pero real en la historia de fondo profunda
    // y a escala. Cada `graveyardPurgeInterval` años se descartan los muertos: la crónica ya guardó su
    // texto (no referencia objetos de `population`), así que no se pierde nada narrativo.
    //
    // DETERMINISMO (D2/D6): la purga NO usa rng y SOLO saca almas con `alive===false`. Todas las
    // selecciones globales del fondo (migración, natalidad, economía) filtran `p.alive` ANTES de elegir,
    // y `filter` preserva el orden de los vivos → el subarray vivo es idéntico byte a byte antes y
    // después. `nextNpcId` sigue monótono (jamás se decrementa), así que los ids no se reciclan y los
    // snapshots siguen siendo reproducibles. Se protege al objetivo de un duelo pendiente por si acaso.
    purgeGraveyard: function(worldState) {
        const u = worldState.universe;
        if (!u || !u.population) return 0;
        const protectedId = (worldState.pendingDecision && worldState.pendingDecision.npcId) || null;
        const before = u.population.length;
        u.population = u.population.filter(p => p.alive || p.id === protectedId);
        const removed = before - u.population.length;
        if (removed > 0) u.counters.purged = (u.counters.purged || 0) + removed;
        return removed;
    },

    // ─────────────────────────────────────────────────────────────────────────────────────────────
    // MOTOR DE NODOS AGREGADOS (Fase 2, corazón — diseño §2/§3). Todo nivel (universo→planeta→
    // continente→ciudad→zona) es el MISMO objeto: un nodo con demografía estadística (crowd) y una
    // lista de hijos perezosa. La subdivisión perezosa (LOD) mantiene el costo en O(nodos vivos), no
    // en la población (10¹²): solo la rama que ocupa el Host se expande; los hermanos quedan como UN
    // nodo agregado hasta que se visitan.
    //
    // CIMIENTO NUMÉRICO (§5.1, Fase 5 — v1.25.0): el crowd de un nodo guarda PROMEDIOS
    // {count, avgAge, avgPower}, NO sumatorios. A escala PLANETA/UNIVERSO (10¹²–10¹⁵) un
    // `ageSum = count×edad` se acercaría a 2⁵³ y perdería precisión entera; los promedios no crecen con
    // la escala. Las zonas planas (génesis, `advanceUniverse`) usan el MISMO modelo desde Fase 5 —
    // `materializeZone`/`dissolveZone` mezclan por promedio ponderado igual que un nacimiento acá.
    // Todo determinista: 1 roll de redondeo por nodo/zona (D2).
    // ─────────────────────────────────────────────────────────────────────────────────────────────
    makeNode: function(id, tier, o) {
        // `capacity` es ESTADO del nodo (no una constante de tier): el techo logístico de esta porción
        // concreta del mundo. Al expandir se reparte entre los hijos (su suma = la del padre), de modo
        // que la presión demográfica count/capacity se conserva al bajar de nivel — sin esto, los hijos
        // de un tier chico quedan crónicamente sobrepoblados y colapsan (viola D4). Un nodo raíz deriva
        // su capacity de la escala nominal del tier (NODE_TIERS.cap × riqueza).
        // `rank` (F→S) es el GRADO del nodo (§6.4): su techo de poder/peligro. tier × rank = grado de
        // mundo (mil-mundos con etiqueta occidental). `grade` es el nombre legible del rango.
        const nomCap = (this.NODE_TIERS[tier] || this.NODE_TIERS.ZONA).cap;
        return { id: id, tier: tier, rank: o.rank || null, grade: o.grade || null, danger: o.danger, wealth: o.wealth,
            capacity: o.capacity != null ? o.capacity : Math.max(10, Math.floor(nomCap * (o.wealth / 50))),
            crowd: { count: o.count, avgAge: o.avgAge, avgPower: o.avgPower }, children: null };
    },

    // GRADO DE MUNDO por nodo (§6.4, D7): deriva un rango F→S determinista con SESGO por el rango del
    // padre (un Dominio Divino engendra vecinos peligrosos; un mundo mundano, vecinos tranquilos) — misma
    // herencia de contexto que la era. Variación ±2 pasos alrededor del rango del padre. Devuelve la clave
    // ("F".."S"); WORLD_TIERS[clave].desc da el nombre legible y .mult el techo de poder ya decidido.
    deriveRank: function(seed, salt, parentRankId) {
        const keys = Object.keys(this.WORLD_TIERS);
        const base = Math.max(0, keys.indexOf(parentRankId));
        const off = Math.floor(this.rng(seed, salt) * 5) - 2; // -2..+2
        return keys[Math.max(0, Math.min(keys.length - 1, base + off))];
    },

    // El peligro de un nodo se DERIVA de su grado (§6.4): un grado mayor es intrínsecamente más letal, así
    // grado y peligro nunca se contradicen. F→~0.6 … S→~2.0, con leve variación determinista por semilla.
    dangerFromRank: function(seed, salt, rankId) {
        const keys = Object.keys(this.WORLD_TIERS);
        const idx = Math.max(0, keys.indexOf(rankId));
        return 0.6 + (idx / (keys.length - 1)) * 1.4 + (this.rng(seed, salt) * 0.2 - 0.1);
    },

    // Evoluciona el crowd agregado de UN nodo un año (O(1)): envejece, muere y nace por agregados con
    // la capacidad de carga PROPIA del nodo. Con promedios: las muertes no mueven el promedio (mueren
    // "en la media", igual que el modelo de zona resta cd×avgAge); los nacimientos (edad 16) mezclan de
    // forma ponderada. Un solo roll de redondeo por eje (D2). Devuelve {births, deaths}.
    tickNode: function(node, seed, salt, meta) {
        const c = node.crowd;
        if (!c || c.count <= 0) return { births: 0, deaths: 0 };
        const rr = (s) => this.rng(seed, salt + ":" + s);
        c.avgAge += 1;
        const mort = Math.min(0.85, ((c.avgAge / 130) + (meta.tierData.mult * 0.012)) * node.danger) * 0.35;
        const expDeaths = c.count * mort;
        let cd = Math.floor(expDeaths);
        if (rr("d") < (expDeaths - cd)) cd += 1;
        cd = Math.min(cd, c.count);
        c.count -= cd;
        const capacity = Math.max(10, node.capacity);
        const expBirths = c.count * 0.08 * (node.wealth / 50) * Math.max(0, 1 - c.count / capacity);
        let cb = Math.floor(expBirths);
        if (rr("b") < (expBirths - cb)) cb += 1;
        if (cb > 0) {
            const basePow = Math.max(2, Math.floor(6 * meta.tierData.mult));
            c.avgAge = (c.count * c.avgAge + cb * 16) / (c.count + cb);
            c.avgPower = (c.count * c.avgPower + cb * basePow) / (c.count + cb);
            c.count += cb;
        }
        return { births: cb, deaths: cd };
    },

    // BRANCHING DERIVADO (Fase 9 §10.2, D8): cuántos hijos sostiene REALMENTE un nodo al expandirse —
    // ya no el fanout fijo del tier, sino `f(semilla, régimen, recursos, infraestructura)`. La cifra
    // nominal (`NODE_TIERS.*.fanout`) es el punto de partida; el régimen la modula (paz favorece más
    // subdivisión, conflicto/pos-cataclismo la reduce — "una zona en conflicto no sostiene 100
    // ciudades") y la dotación de recursos reales del nodo (Fase 7, `nodeResources`) hace de proxy de
    // "infraestructura" (un nodo rico en su base sostiene más subdivisión que uno estéril). Acotado a
    // [1, 2×nominal] — nunca cero hijos en un tier que admite subdivisión, ni una explosión sin techo.
    // **Sin `ctx.regime` (o sin `ctx`), devuelve el nominal exacto** — D8: sin regresión, byte-idéntico
    // al modelo viejo cuando no hay contexto de mundo real (mismo patrón que D5/D7).
    deriveFanout: function(node, seed, meta, ctx) {
        const tier = this.NODE_TIERS[node.tier];
        const nominal = tier ? tier.fanout : 0;
        const regime = ctx && ctx.regime;
        if (!regime) return nominal;
        const regimeMult = this.FANOUT_REGIME_MULT[regime] != null ? this.FANOUT_REGIME_MULT[regime] : 1;
        const era = (meta && meta.era) || "MODERNO";
        const resTypes = (TechDB.RESOURCES && TechDB.RESOURCES[era]) || TechDB.RESOURCES.MODERNO;
        const present = this.nodeResources(seed, node.id, era).length;
        const resourceMult = 0.7 + 0.6 * (resTypes.length ? present / resTypes.length : 0); // [0.7, 1.3]
        const raw = Math.round(nominal * regimeMult * resourceMult);
        return Math.max(1, Math.min(nominal * 2, raw));
    },

    // EXPANDIR (LOD): reparte el crowd Y la capacidad del nodo en los hijos que le tocan (fanout
    // derivado, §10.2/D8 arriba) de forma determinista y coherente con el agregado del padre (§3).
    // `count` y `capacity` se reparten con los MISMOS pesos (el último hijo toma el resto → ambas sumas
    // conservan el total exacto), así el ratio count/capacity de cada hijo iguala al del padre y la
    // dinámica logística no se sesga. Los hijos heredan el promedio del padre y una variación LEVE y
    // determinista de riqueza/peligro (sub-regiones con carácter propio — el valor del LOD). Idempotente:
    // si ya está expandido, devuelve los hijos existentes. `ctx` es OPCIONAL (`{regime}`) — sin él, el
    // fanout es el nominal del tier, igual que antes de Fase 9 (sin regresión).
    splitNode: function(node, seed, meta, ctx) {
        const tier = this.NODE_TIERS[node.tier];
        if (!tier || !tier.child || node.children) return node.children;
        const K = this.deriveFanout(node, seed, meta, ctx), c = node.crowd;
        const raw = []; let sum = 0;
        for (let i = 0; i < K; i++) { const w = 0.5 + this.rng(seed, "split:" + node.id + ":w" + i); raw.push(w); sum += w; }
        const children = []; let allocCount = 0, allocCap = 0;
        for (let i = 0; i < K; i++) {
            const last = (i === K - 1);
            const cnt = last ? (c.count - allocCount) : Math.floor(c.count * raw[i] / sum);
            const cap = last ? (node.capacity - allocCap) : Math.floor(node.capacity * raw[i] / sum);
            if (!last) { allocCount += cnt; allocCap += cap; }
            const wv = Math.max(5, Math.min(100, Math.round(node.wealth + (this.rng(seed, "split:" + node.id + ":wl" + i) * 11 - 5))));
            const dv = Math.max(0.3, node.danger * (0.9 + this.rng(seed, "split:" + node.id + ":dg" + i) * 0.2));
            // Los hijos heredan el GRADO del padre (§6.4/D7): una sub-región no cambia de grado de mundo.
            children.push(this.makeNode(node.id + "-" + i, tier.child, { danger: dv, wealth: wv, rank: node.rank, grade: node.grade, count: Math.max(0, cnt), capacity: Math.max(10, cap), avgAge: c.avgAge, avgPower: c.avgPower }));
        }
        node.children = children;
        return children;
    },

    // COLAPSAR (LOD): suma los hijos de vuelta al padre — count y capacity por suma, edad/poder por
    // promedio ponderado (conservación exacta) — y descarta la subdivisión. Inversa de splitNode a
    // nivel agregado (D4): expandir → colapsar sin evolucionar deja el nodo byte-idéntico.
    mergeNode: function(node) {
        if (!node.children || !node.children.length) return;
        let count = 0, cap = 0, ageW = 0, powW = 0;
        for (const ch of node.children) { count += ch.crowd.count; cap += ch.capacity; ageW += ch.crowd.count * ch.crowd.avgAge; powW += ch.crowd.count * ch.crowd.avgPower; }
        node.capacity = cap;
        node.crowd = { count: count, avgAge: count > 0 ? ageW / count : node.crowd.avgAge, avgPower: count > 0 ? powW / count : node.crowd.avgPower };
        node.children = null;
    },

    // Materialización al detallar (Parte 4): cuando el Host llega a una zona, la escena se
    // reconstruye desde los AGREGADOS que la capa ABSTRACT mantuvo (riqueza, regente, alma más
    // fuerte del territorio) — determinista, sin inventar azar nuevo. Devuelve el log de lectura.
    describeZone: function(worldState, zoneId) {
        const u = worldState.universe;
        if (!u || !u.zones) return null;
        const zone = u.zones.find(z => z.id === zoneId);
        if (!zone) return null;
        const ruler = zone.rulerFacId ? this.facName(u, zone.rulerFacId) : null;
        const locals = u.population.filter(p => p.alive && p.zoneId === zoneId);
        const top = locals.slice().sort((a, b) => b.power - a.power)[0];
        const riqueza = zone.wealth >= 65 ? "próspera" : zone.wealth >= 35 ? "modesta" : "empobrecida";
        const souls = locals.length + (zone.crowd ? zone.crowd.count : 0);
        const gradoTxt = zone.grade ? `un ${zone.grade} de rango ${zone.rank}` : null;
        const regimeTxt = (u.regime && this.REGIMES[u.regime]) ? this.REGIMES[u.regime].desc : null;
        const parts = [`${zone.name}: tierra ${riqueza}${gradoTxt ? `, ${gradoTxt}` : ""}, hogar de ~${this.formatCount(souls)} almas`, ruler ? `bajo el estandarte de ${ruler}` : "sin regente que la reclame"];
        if (regimeTxt) parts.push(`el mundo vive ${regimeTxt}`);
        if (top) parts.push(`el alma más fuerte del territorio es ${top.name}`);
        // ECONOMÍA REAL (Parte 8): si esta zona es el hub de comercio del mundo (mayor producción de
        // recursos de todas), la crónica lo dice — lectura pura de `zone.production`, sin inventar azar.
        const maxProd = Math.max.apply(null, (u.zones || []).map(z => z.production || 0));
        if (maxProd > 0 && (zone.production || 0) === maxProd) parts.push("es el centro comercial del mundo, cruce de rutas y mercancías");
        return { text: `[ZONA] ${parts.join("; ")}.`, color: "text-cyan", kind: "world" };
    },

    facName: function(universe, id) {
        const f = universe.factions.find(x => x.id === id);
        return f ? f.name : "ninguna facción";
    },

    zoneName: function(universe, id) {
        const z = (universe.zones || []).find(x => x.id === id);
        return z ? z.name : "tierras sin nombre";
    },

    // MACRO-TICK DEL UNIVERSO (capa 1 ABSTRACT, determinista por semilla+año). El "río que corre solo"
    // de la Parte 0: evoluciona población, facciones e historia HAYA O NO Host mirando. Todo el azar
    // sale de rng(seed, "univ:y<año>:...") — reproducible y keyeado por año (se llama una vez por año,
    // así abstraer/re-detallar no inventa azar nuevo: Invariante D2). Devuelve logs con kind "world".
    advanceUniverse: function(worldState) {
        const u = worldState.universe;
        if (!u) return [];
        const meta = worldState.meta;
        const year = Math.floor(worldState.tick / 360);
        const r = (salt) => this.rng(worldState.seed, "univ:y" + year + ":" + salt);
        const logs = [];
        // La crónica (HistorySystem) se escribe SIEMPRE, la vea alguien o no. El log narrativo solo
        // sale si el evento es MAJOR (guerra/caída/cisma) o pasó en la zona DETAILED del Host — lo
        // lejano se cuenta grueso (Parte 4 del doc maestro).
        // `soulId` (opcional) etiqueta la entrada con el alma protagonista: es lo que vuelve la
        // crónica BIOGRÁFICA — la rama puede leer "la parte" de un alma con soulBiography().
        const chron = (kind, text, soulId) => {
            const e = { year: year, kind: kind, text: text };
            if (soulId) e.soulId = soulId;
            u.chronicle.push(e);
        };
        const record = (kind, text, color, soulId) => {
            logs.push({ text: text, color: color || "text-cyan", kind: "world" });
            chron(kind, text, soulId);
        };
        const host = worldState.agents && worldState.agents[0];
        const detailedZoneId = (host && host.hp > 0) ? host.zoneId : null;

        // RÉGIMEN del año (§6.3, fase 3b): se deriva al INICIO del año (con los contadores del año previo)
        // y modula las tasas macro de ESTE año — guerras y natalidad. La transición se narra al final,
        // comparando con el régimen guardado. Estado derivado determinista: no consume rng nuevo.
        const prevRegime = u.regime;
        const regime = this.deriveRegime(meta, u, year);
        const regimeFx = this.REGIME_EFFECTS[regime] || { war: 1, birth: 1 };
        // RASGOS DE MUNDO (v1.18.0): modulan las tasas macro igual que el régimen — multiplicadores
        // deterministas encima de las mismas palancas, cero azar nuevo.
        const tfx = this.traitFx(meta);

        // LIFECYCLE por zona — Fase 1.5 (D6, base ABSTRACT-autoritativa). La evolución de fondo corre
        // SIEMPRE por el modelo estadístico ABSTRACT, en TODA zona por igual: se suma la mortalidad
        // esperada y UN roll por zona resuelve el redondeo; caen primero los más viejos (determinista).
        // Antes la zona del Host corría un camino DETAILED con roll POR ALMA, que elegía un set de
        // muertes DISTINTO al ABSTRACT → la mera observación cambiaba el estado base de esa zona y, vía
        // selecciones globales (migración), el de las demás (medido, docs §1-ter). Ahora el DETALLE de
        // la zona del Host solo NARRA visiblemente las mismas muertes que el fondo produce; no elige un
        // set propio. Además el pool autoritativo EXCLUYE el overlay materializado (`fromCrowd`): esas
        // almas son la vista detallada del Host, no la base — no deben alterar el resultado del fondo.
        (u.zones || []).forEach((zone) => {
            const locals = u.population.filter(p => p.alive && !p.fromCrowd && p.zoneId === zone.id);
            const chanceOf = (p) => Math.min(0.85, ((p.age / 130) + (meta.tierData.mult * 0.012)) * zone.danger);
            let expected = 0;
            locals.forEach((p) => { p.age += 1; expected += chanceOf(p); });
            let toll = Math.floor(expected);
            if (r("ztoll:" + zone.id) < (expected - toll)) toll += 1;
            const visible = (zone.id === detailedZoneId);
            locals.slice().sort((a, b) => b.age - a.age).slice(0, toll).forEach((p) => {
                p.alive = false;
                u.counters.deaths++;
                if (p.power >= 45) {
                    const vars = { name: p.name, fac: this.facName(u, p.factionId), zone: zone.name };
                    // La muerte salda el anhelo del alma: la crónica lo deja escrito (cumplido o
                    // trunco) — es el cierre de su biografía, material directo para la rama.
                    const anheloClause = p.desire ? ` Murió con su anhelo ${p.desire.fulfilled ? "cumplido" : "trunco"}: ${p.desire.text}.` : "";
                    if (visible) {
                        const tpl = this.pickTemplate(worldState.seed, "death_text_" + p.id, this.CFG_DICTIONARY.world_death_notable_visible);
                        record("death", `[MUNDO] ${this.fillVars(tpl, vars)}${anheloClause}`, "text-muted", p.id);
                    } else {
                        const tpl = this.pickTemplate(worldState.seed, "death_text_" + p.id, this.CFG_DICTIONARY.world_death_notable_quiet);
                        chron("death", this.fillVars(tpl, vars) + anheloClause, p.id);
                    }
                }
            });

            // LA MASA (población estadística de la zona): envejece, muere y se reproduce por
            // agregados — aritmética + UN roll por zona para el redondeo (D2: cero azar por alma).
            // La mortalidad de la masa es más suave que la de los notables (vida anónima, sin
            // duelos ni gestas) y la fertilidad crece con la riqueza del territorio.
            // Fase 5 (§5.1): PROMEDIOS {count, avgAge, avgPower}, no sumatorios — mismo cimiento
            // numérico que makeNode/tickNode (ver ese comentario). Envejecer es `avgAge += 1` (la
            // masa entera envejece un año); las muertes se asumen "en la media" y no mueven el
            // promedio (igual que tickNode); los nacimientos mezclan por promedio ponderado.
            const crowd = zone.crowd;
            if (crowd && crowd.count > 0) {
                crowd.avgAge += 1;
                const mort = Math.min(0.85, ((crowd.avgAge / 130) + (meta.tierData.mult * 0.012)) * zone.danger) * 0.35;
                const expDeaths = crowd.count * mort;
                let cd = Math.floor(expDeaths);
                if (r("cdeath:" + zone.id) < (expDeaths - cd)) cd += 1;
                cd = Math.min(cd, crowd.count);
                crowd.count -= cd;
                u.counters.deaths += cd;
                // Capacidad de carga por TIER (Fase 1, NODE_TIERS): la escala del nodo fija cuánta
                // masa sostiene, modulada por la riqueza (una ciudad ~10^7, no ~200). Reemplaza el
                // freno viejo `wealth*2` que aplastaba todo a decenas. El freno logístico sigue
                // vigente (sin él la fertilidad compuesta explota): la masa se estabiliza cerca de la
                // capacidad del tier, no crece sin techo.
                const tierCap = (this.NODE_TIERS[zone.tier] || this.NODE_TIERS.ZONA).cap;
                const capacity = Math.max(10, Math.floor(tierCap * (zone.wealth / 50)));
                const expBirths = crowd.count * 0.08 * (zone.wealth / 50) * Math.max(0, 1 - crowd.count / capacity) * regimeFx.birth * tfx.birth;
                let cb = Math.floor(expBirths);
                if (r("cbirth:" + zone.id) < (expBirths - cb)) cb += 1;
                if (cb > 0) {
                    const newbornPower = Math.max(2, Math.floor(6 * meta.tierData.mult));
                    crowd.avgAge = (crowd.count * crowd.avgAge + cb * 16) / (crowd.count + cb);
                    crowd.avgPower = (crowd.count * crowd.avgPower + cb * newbornPower) / (crowd.count + cb);
                    crowd.count += cb;
                }
                u.counters.births += cb;
            }
        });

        // BIRTHS: el mundo se repuebla. El alma nueva nace en el territorio de su facción, y la
        // riqueza pesa: las facciones asentadas en tierras prósperas atraen más nacimientos
        // (selección por peso acumulado con el MISMO roll de siempre — determinista).
        const liveFacs = u.factions.filter(f => f.alive);
        const zoneWealth = (zid) => { const z = (u.zones || []).find(x => x.id === zid); return z ? z.wealth : 50; };
        if (liveFacs.length > 0 && r("birth") < this.UNIVERSE_CONFIG.birthChance * regimeFx.birth * tfx.birth) {
            const weights = liveFacs.map(f => 10 + zoneWealth(f.zoneId));
            const total = weights.reduce((s, w) => s + w, 0);
            let roll = r("bfac") * total;
            let fac = liveFacs[liveFacs.length - 1];
            for (let i = 0; i < liveFacs.length; i++) { roll -= weights[i]; if (roll < 0) { fac = liveFacs[i]; break; } }
            // ID/nombre del nacido derivados del AÑO (hay ≤1 nacimiento por año), NO del contador global
            // `nextNpcId`. Fase 1.5 (D6): materializar la zona del Host avanza nextNpcId, y si el id del
            // nacido dependiera de él, correría los ids/nombres de los nacimientos de TODAS las zonas —
            // la observación contaminaría la base. Con la clave por año, el nacimiento es idéntico haya
            // o no Host mirando.
            // C18 SAGA (Parte 10.3, deuda cerrada): filiación determinista — el nacido hereda un
            // `parentId` de un notable vivo YA asentado en la misma facción (si hay alguno), la base que
            // permite "continuar con los descendientes" en la Cosecha sin regenerar el mundo. Sin
            // notables vivos en la facción (mundo recién fundado), nace sin padre registrado (null,
            // honesto — no se inventa un progenitor que no existe).
            const facParents = u.population.filter(p => p.alive && p.factionId === fac.id);
            const parentId = facParents.length ? facParents[Math.floor(r("bparent") * facParents.length)].id : null;
            const soul = {
                id: "npc_b" + year, name: this.pickName(worldState.seed, "born:" + year, meta.era),
                class: this.classesFor(meta.era)[Math.floor(r("bclass") * this.classesFor(meta.era).length)],
                factionId: fac.id, zoneId: fac.zoneId, power: Math.floor((8 + r("bpow") * 30) * meta.tierData.mult), age: 16, alive: true,
                parentId: parentId
            };
            soul.desire = this.deriveDesire(worldState.seed, soul, u);
            soul.drive = this.deriveDrive(worldState.seed, soul);
            u.population.push(soul);
            u.counters.births++;
            if (soul.power >= 50) {
                const tpl = this.pickTemplate(worldState.seed, "birth_text:" + year, this.CFG_DICTIONARY.world_birth_notable);
                const text = `[MUNDO] ${this.fillVars(tpl, { name: soul.name, fac: fac.name })}`;
                if (soul.zoneId === detailedZoneId) record("birth", text, "text-green", soul.id);
                else chron("birth", text, soul.id);
            }
        }

        // MIGRACIÓN (MovementSystem en ABSTRACT, Parte 4: flujo estadístico, no pasos): de vez en
        // cuando un alma cambia de territorio. Solo hace ruido si llega a la zona del Host.
        // El pool EXCLUYE el overlay materializado (`fromCrowd`): es la vista detallada del Host, y si
        // entrara al pool cambiaría el largo/orden del array y desplazaría la selección de TODO el
        // mundo — Fase 1.5, D6 (la observación no debe alterar el fondo).
        const alivePop = u.population.filter(p => p.alive && !p.fromCrowd);
        if (alivePop.length > 0 && r("mig") < this.UNIVERSE_CONFIG.migrationChance && u.zones && u.zones.length > 1) {
            const mover = alivePop[Math.floor(r("migwho") * alivePop.length)];
            const dest = u.zones[Math.floor(r("migdest") * u.zones.length)];
            if (dest.id !== mover.zoneId) {
                mover.zoneId = dest.id;
                if (mover.power >= 45 && dest.id === detailedZoneId) {
                    const tpl = this.pickTemplate(worldState.seed, "mig_text:" + year, this.CFG_DICTIONARY.world_migration);
                    record("migration", `[MUNDO] ${this.fillVars(tpl, { name: mover.name, zone: dest.name })}`, "text-cyan", mover.id);
                }
            }
        }

        // FACCIONES: guerra determinista (evento MAJOR — siempre se narra). Dos potencias chocan; la
        // más fuerte (con algo de azar) prevalece, transfiere poder, y si la perdedora queda sin
        // poder, CAE de la historia.
        const warTornZones = new Set();
        if (liveFacs.length >= 2 && r("war") < this.UNIVERSE_CONFIG.warChance * regimeFx.war * tfx.war) {
            const a = liveFacs[Math.floor(r("wa") * liveFacs.length)];
            let b = liveFacs[Math.floor(r("wb") * liveFacs.length)];
            if (b.id === a.id) b = liveFacs[(liveFacs.indexOf(a) + 1) % liveFacs.length];
            if (a.id !== b.id) {
                const aWins = (a.power * (0.6 + r("wroll") * 0.8)) >= b.power;
                const winner = aWins ? a : b, loser = aWins ? b : a;
                const spoils = Math.floor(loser.power * 0.3) + 10;
                winner.power += spoils;
                loser.power = Math.max(0, loser.power - spoils);
                u.counters.wars++;
                const warTpl = this.pickTemplate(worldState.seed, "war_text:" + year, this.CFG_DICTIONARY.world_war);
                record("war", `[MUNDO] ${this.fillVars(warTpl, { a: a.name, b: b.name, winner: winner.name })}`, "text-yellow");
                // La guerra también drena la tierra: el territorio del perdedor pierde riqueza y
                // parte se la lleva el del vencedor como botín. Ambos quedan marcados como zonas
                // en guerra para la economía de este año.
                const lz = (u.zones || []).find(z => z.id === loser.zoneId);
                const wz = (u.zones || []).find(z => z.id === winner.zoneId);
                if (lz) { const sack = Math.max(2, Math.floor(lz.wealth * 0.15)); lz.wealth = Math.max(5, lz.wealth - sack); if (wz) wz.wealth = Math.min(100, wz.wealth + Math.floor(sack / 2)); warTornZones.add(lz.id); }
                if (wz) warTornZones.add(wz.id);
                if (loser.power <= 0) {
                    loser.alive = false;
                    u.counters.factionsFallen++;
                    const fallTpl = this.pickTemplate(worldState.seed, "fall_text:" + year, this.CFG_DICTIONARY.world_faction_fall);
                    record("faction_fall", `[CAÍDA] ${this.fillVars(fallTpl, { loser: loser.name, winner: winner.name })}`, "text-red");
                }
            }
        }

        // CISMA (evento MAJOR): cuando el mapa se consolida demasiado (≤2 potencias vivas), la
        // dominante puede fracturarse y una facción nueva se alza con parte de su poder. Es la
        // válvula de pluralidad: sin esto, las guerras dejaban un imperio único para el año ~12 y la
        // historia de fondo se apagaba para siempre.
        const standing = u.factions.filter(f => f.alive);
        if (standing.length > 0 && standing.length <= 2 && r("schism") < this.UNIVERSE_CONFIG.schismChance) {
            const parent = standing.slice().sort((a, b) => b.power - a.power)[0];
            if (parent.power >= 40) {
                const share = Math.max(20, Math.floor(parent.power * 0.4));
                parent.power -= share;
                const branch = {
                    id: "fac_" + u.factions.length,
                    name: "los Herederos de " + this.pickName(worldState.seed, "schism:" + year, meta.era),
                    power: share,
                    members: Math.max(5, Math.floor(parent.members * 0.3)),
                    zoneId: (u.zones && u.zones.length) ? u.zones[Math.floor(r("szone") * u.zones.length)].id : parent.zoneId,
                    alive: true
                };
                parent.members = Math.max(5, parent.members - branch.members);
                u.factions.push(branch);
                u.counters.schisms = (u.counters.schisms || 0) + 1;
                const schismTpl = this.pickTemplate(worldState.seed, "schism_text:" + year, this.CFG_DICTIONARY.world_schism);
                record("schism", `[CISMA] ${this.fillVars(schismTpl, { branch: branch.name, parent: parent.name, zone: this.zoneName(u, branch.zoneId) })}`, "text-yellow");
            }
        }

        // ECONOMÍA por zona (capa 1 ABSTRACT, aritmética pura — sin rng): la estabilidad política
        // y la mano de obra hacen crecer la riqueza; la guerra y el peligro crónico la drenan.
        // Acotada a [5, 100] — ninguna tierra queda en cero absoluto ni crece sin techo.
        (u.zones || []).forEach((zone) => {
            let delta = 0;
            if (zone.rulerFacId) { const ruler = u.factions.find(f => f.id === zone.rulerFacId); if (ruler && ruler.alive) delta += 2; }
            if (u.population.filter(p => p.alive && !p.fromCrowd && p.zoneId === zone.id).length >= 6) delta += 1;
            if (zone.danger > 1.2) delta -= 1;
            if (warTornZones.has(zone.id)) delta -= 3;
            delta += tfx.wealthDrift; // rasgo de mundo: la tierra florece o se agota (v1.18.0)
            // COMERCIO (Parte 8, cierra "no hay comercio ni recursos diferenciados"): la zona más
            // productiva del mundo es el hub y se queda con la ganancia de exportar; el resto importa
            // una fracción de lo que le falta. Pura sobre `zone.production` ya cacheado (D2 intacto).
            delta += this.zoneTradeBonus(u.zones, zone);
            zone.wealth = Math.max(5, Math.min(100, zone.wealth + delta));
        });

        // POLÍTICA por zona: el regente es la facción viva más fuerte asentada en el territorio.
        // Un cambio de dominio es historia MAYOR — entra a la crónica y se narra siempre.
        (u.zones || []).forEach((zone) => {
            const seated = u.factions.filter(f => f.alive && f.zoneId === zone.id);
            const top = seated.slice().sort((a, b) => b.power - a.power)[0] || null;
            const newRuler = top ? top.id : null;
            if (newRuler !== zone.rulerFacId) {
                const prev = zone.rulerFacId ? this.facName(u, zone.rulerFacId) : null;
                zone.rulerFacId = newRuler;
                u.counters.takeovers = (u.counters.takeovers || 0) + 1;
                if (newRuler) {
                    const prevClause = prev ? `, arrebatándoselo a ${prev}` : "";
                    const ctrlTpl = this.pickTemplate(worldState.seed, "zctrl_text:" + year + ":" + zone.id, this.CFG_DICTIONARY.world_zone_control);
                    record("zone_control", `[DOMINIO] ${this.fillVars(ctrlTpl, { faction: this.facName(u, newRuler), zone: zone.name, prev_clause: prevClause })}`, "text-yellow");
                } else {
                    const emptyTpl = this.pickTemplate(worldState.seed, "zctrl_empty:" + year + ":" + zone.id, this.CFG_DICTIONARY.world_zone_control_unclaimed);
                    record("zone_control", `[DOMINIO] ${this.fillVars(emptyTpl, { zone: zone.name })}`, "text-muted");
                }
            }
        });

        // ANHELOS de la base: el mundo salda los deseos de sus notables, mire alguien o no (Parte 0:
        // el río corre solo). Lectura pura del estado del año — sin rng nuevo. El cumplimiento es
        // historia: entra a la crónica etiquetado con el alma (biografía), y solo hace ruido visible
        // si pasa en la zona del Host. Corre DESPUÉS de guerras/política para saldar contra el estado
        // final del año.
        u.population.forEach((p) => {
            if (!p.alive || p.fromCrowd || !p.desire || p.desire.fulfilled) return;
            if (this.desireFulfilled(u, p, year)) {
                p.desire.fulfilled = true;
                p.desire.year = year;
                const text = `${p.name} cumplió el anhelo de su vida: ${p.desire.text}.`;
                if (p.zoneId === detailedZoneId) record("anhelo", `[MUNDO] ${text}`, "text-green", p.id);
                else chron("anhelo", text, p.id);
            }
        });

        // ACTOS DE IMPULSO (C21): un alma actúa según SU por qué — dinero, poder, los suyos, o ver
        // arder el mundo. Aprox. un acto cada dos años (r("drive") < 0.5), actor elegido con el
        // mismo roll de siempre (D2, cero azar por alma). Efectos ACOTADOS sobre los agregados que
        // ya existen (riqueza/peligro de zona, poder de alma/facción) — nada per-entity nuevo. El
        // motivo queda ESCRITO en la crónica (kind "drive", con soulId): las historias del mundo
        // ganan villanos y santos con razones legibles — insumo directo del Cronista y de C12.
        const drivers = u.population.filter(p => p.alive && !p.fromCrowd && p.drive);
        if (drivers.length > 0 && r("drive") < 0.5) {
            const actor = drivers[Math.floor(r("drivewho") * drivers.length)];
            const dz = (u.zones || []).find(z => z.id === actor.zoneId) || null;
            const vars = { name: actor.name, fac: this.facName(u, actor.factionId), zone: dz ? dz.name : "tierras sin nombre" };
            const tpl = this.pickTemplate(worldState.seed, "drive_text:" + year, this.CFG_DICTIONARY["drive_act_" + actor.drive] || this.CFG_DICTIONARY.drive_act_lealtad);
            switch (actor.drive) {
                case "codicia":
                    if (dz) dz.wealth = Math.min(100, dz.wealth + 2);
                    break;
                case "ambicion":
                    actor.power += 4;
                    break;
                case "caos":
                    if (dz) { dz.wealth = Math.max(5, dz.wealth - 3); dz.danger = Math.min(3, (dz.danger || 1) + 0.05); }
                    break;
                case "lealtad": {
                    const ownFac = u.factions.find(f => f.id === actor.factionId && f.alive);
                    if (ownFac) ownFac.power += 2;
                    break;
                }
            }
            const text = `[IMPULSO] ${this.fillVars(tpl, vars)}`;
            if (actor.zoneId === detailedZoneId) record("drive", text, actor.drive === "caos" ? "text-red" : "text-yellow", actor.id);
            else chron("drive", text, actor.id);
        }

        // RÉGIMEN: la transición se narra comparando con el régimen guardado del año previo (§6.3). El
        // `regime` de este año ya se calculó al inicio y moduló las tasas macro (3b).
        if (prevRegime && regime !== prevRegime) {
            record("regime_shift", `[ERA] El mundo entró en ${this.REGIMES[regime].desc}: nada volverá a ser como antes.`, this.REGIMES[regime].color);
        }
        u.regime = regime;

        // FONDO CÓSMICO (Fase 2 §3): el universo más allá de la región del Host evoluciona en agregado y
        // narra su historia lejana. Barato (O(nodos)) y aislado del estado fino → no toca D6.
        this.advanceCosmos(worldState, r, meta, record);

        // Compactar muertos cada N años (fondo profundo / escala): saca a los `alive===false` del array
        // nombrado. Determinista y sin tocar a los vivos (ver purgeGraveyard). Al año 0 no corre.
        if (year > 0 && year % this.UNIVERSE_CONFIG.graveyardPurgeInterval === 0) this.purgeGraveyard(worldState);

        return logs;
    },

    translateItem: function(card, era) {
        if (["SCI-FI", "CYBERPUNK", "MODERNO"].includes(card.era) && ["FANTASIA", "CULTIVACION"].includes(era)) {
            return { ...card, name: `Reliquia Ancestral: ${card.name}`, desc: `[TRADUCCIÓN] Los nativos la adoran como magia. ${card.desc}` };
        }
        if (["FANTASIA", "CULTIVACION"].includes(card.era) && ["SCI-FI", "CYBERPUNK"].includes(era)) {
            return { ...card, name: `Anomalía Cuántica: ${card.name}`, desc: `[TRADUCCIÓN] Desafía la física corporativa local. ${card.desc}` };
        }
        return card;
    },

    // `qualityMult` (§6.4 fase 2b): calidad del botín por GRADO de la zona del Host. Default 1 → byte-
    // idéntico al modelo previo (D7): sólo cuando la zona tiene un grado distinto al del mundo global el
    // botín forjado escala su poder. Se ancla al ratio zoneMult/globalMult (ver runTicks), así una zona
    // de grado muy superior al mundo suelta reliquias muy por encima de lo normal.
    forgeProceduralCard: function(worldSeed, streamKey, era, rarity, currentTick, planetLuck, qualityMult, regime, traitTypeMult) {
        let dict = this.PROCEDURAL_DICT[era] || this.PROCEDURAL_DICT.UNIVERSAL;
        // PERFIL DE ERA: el TIPO forjado sale de los pesos del mundo (futurista → TECNOLOGÍA pesa;
        // antiguo → COMPAÑERO pesa; un tipo sin clave = peso 0, gate real). Mismo salt `_t` de
        // siempre: UN roll repartido sobre los pesos — sin perfil cae al reparto histórico 70/30.
        const prof = this.ERA_PROFILES[era] || null;
        const typeWeights = prof ? prof.cardTypes : { "OBJETO": 7, "TALENTO": 3 };
        // Rasgos de mundo (v1.18.0): `traitTypeMult` multiplica los pesos del perfil — la Supresión
        // del Cielo anula TECNOLOGÍA por razón del MUNDO (gate diegético) y el Eco Precursor la
        // multiplica hasta en mundos antiguos. Peso final 0 = el tipo no existe en ese mundo.
        const tm = traitTypeMult || {};
        const wTyped = Object.keys(typeWeights)
            .map(t => ({ v: t, w: typeWeights[t] * (tm[t] != null ? tm[t] : 1) }))
            .filter(it => it.w > 0);
        let type = this.pickWeighted(wTyped.length ? wTyped : [{ v: "OBJETO", w: 1 }], this.rng(worldSeed, streamKey + "_t"));
        if (type === "TALENTO") dict = this.PROCEDURAL_DICT.UNIVERSAL;

        // Fase 4 (§7): el RÉGIMEN del mundo tiñe la derivación — TIPO y NOMBRE, no el stat. Sin `regime`
        // (null) el forjado es byte-idéntico al modelo previo (D7) y no consume rng nuevo. Los salts
        // `_rt`/`_r` son claves nuevas: el PRNG es keyeado (rng(seed,salt)), no un contador — agregarlas
        // NO desplaza ningún stream existente. El TIPO sólo cambia sobre un OBJETO (no pisa un TALENTO).
        const flavor = (regime && this.REGIME_FLAVOR[regime]) ? this.REGIME_FLAVOR[regime] : null;
        if (flavor && type === "OBJETO" && flavor.typeChance > 0 && this.rng(worldSeed, streamKey + "_rt") < flavor.typeChance) {
            type = flavor.type;
        }

        const pick = (arr, salt) => arr[Math.floor(this.rng(worldSeed, streamKey + salt) * arr.length)];
        let name;
        if (type === "COMPAÑERO" && prof) {
            // La compañía forjada es una PERSONA con el sabor local (Discípula/Androide/Runner…),
            // no un objeto con nombre de espada. pickName es el mismo generador de almas del mundo;
            // el rótulo sale de la lista del perfil (las eras tecnológicas también dan compañeras —
            // es el corazón del gacha en todo setting).
            name = `${pick(prof.followers, "_fl")}: ${this.pickName(worldSeed, streamKey + "_fn", era)}`;
        } else if (type === "MASCOTA" && prof && prof.pets) {
            // Las bestias también llevan nombre propio (una Bestia Espiritual con nombre es canon).
            name = pick(prof.pets, "_pt") + ": " + this.forgeBeastName(worldSeed, streamKey + "_pn", era);
        } else if (type === "NAVE" && prof && prof.ships) {
            // Las naves llevan nombre propio entre comillas, como toda nave que se respete.
            name = pick(prof.ships, "_sh") + ' "' + this.forgeShipName(worldSeed, streamKey + "_sn", era) + '"';
        } else if (type === "HABILIDAD") {
            // Las artes/técnicas se forjan con el diccionario de la era, en formato de habilidad.
            name = `[Arte ${pick(dict.prefijos, "_p")} ${pick(dict.sufijos, "_s")}]`;
        } else if (type === "TECNOLOGÍA" && prof && !prof.techNative) {
            // TECNOLOGÍA en un mundo antiguo = reliquia precursora (trope clásico del género): el
            // nombre sale del diccionario tecnológico, rotulado como hallazgo de otra edad.
            const techDict = this.PROCEDURAL_DICT["SCI-FI"];
            name = `Reliquia Precursora: ${pick(techDict.bases, "_b")} ${pick(techDict.prefijos, "_p")} ${pick(techDict.sufijos, "_s")}`;
        } else {
            name = `${pick(dict.bases, "_b")} ${pick(dict.prefijos, "_p")} ${pick(dict.sufijos, "_s")}`;
            if (flavor) name += ` ${pick(flavor.affix, "_r")}`;
        }

        // SÚPER-FÓRMULA (sin cambios — el régimen es sabor de contenido, no toca el balance)
        const yearLvl = Math.max(1, Math.floor(currentTick / 360));
        const rarityMult = { "N": 1, "R": 2.5, "SR": 6, "SSR": 15 }[rarity] || 1;
        const finalStat = Math.floor(((10 + (yearLvl * 2)) * rarityMult) * planetLuck * (qualityMult || 1));

        let effect = "";
        if (planetLuck > 1.25 && rarity === "SSR") effect = " [PROPIEDAD EXÓTICA]"; // umbral movido: planetLuck ahora [0.7,1.4)
        if (planetLuck < 0.85) effect = " [INESTABLE]";
        if ((qualityMult || 1) >= 2) effect += " [FORJADO EN UN MUNDO SUPERIOR]";
        if (flavor) effect += ` [${flavor.tag}]`;

        // F6 (botín no-solo-ATK): el STAT forjado ya no es siempre ATK — sale del TIPO con un roll de
        // desempate determinista (una armadura/objeto tiende a DEF, una mascota/compañero a HP, un
        // arma/nave a ATK). Es VARIEDAD sin tocar el PRESUPUESTO de poder: `finalStat` es la súper-fórmula
        // intacta y se usa TAL CUAL para ATK/DEF; HP escribe `finalStat×HP_MULT` (un punto de HP vale
        // menos, coherente con las cartas curadas: +40 HP R, +1000 HP SSR). El salt `_stat` es una clave
        // nueva keyeada (rng(seed,salt)) — NO desplaza ningún stream existente (D2). applyCardStats ya
        // parsea "+N ATK/DEF/HP", así que el botín DEF/HP se aplica de verdad al Host.
        const HP_MULT = 6;
        const statRoll = this.rng(worldSeed, streamKey + "_stat");
        let statKind;
        if (type === "NAVE" || type === "VEHÍCULO" || type === "HABILIDAD" || type === "TALENTO") {
            statKind = statRoll < 0.70 ? "ATK" : (statRoll < 0.88 ? "DEF" : "HP");   // ofensivo
        } else if (type === "MASCOTA" || type === "COMPAÑERO") {
            statKind = statRoll < 0.45 ? "ATK" : (statRoll < 0.72 ? "HP" : "DEF");   // vital/mixto
        } else {
            statKind = statRoll < 0.50 ? "ATK" : (statRoll < 0.82 ? "DEF" : "HP");   // OBJETO/MUTACIÓN/TECNOLOGÍA: defensivo-mixto
        }
        const statVal = statKind === "HP" ? finalStat * HP_MULT : finalStat;

        return { id: `proc_${worldSeed}_${streamKey}`, type: type, rarity: rarity, name: name, era: era, desc: `[iLvl: ${yearLvl} | Mod: ${planetLuck.toFixed(1)}x] Otorga +${statVal} ${statKind}.${effect}` };
    },

    // GATING POR REQUISITOS + CONTEXTO (Fase 6 §7-bis.3, D5): función PURA y determinista de
    // `seed + choiceLog + estado del nodo` (nunca `Math.random()` — nada de azar nuevo, sólo lee estado
    // ya existente). Sin `requires`/`contextTags` (undefined o `[]`) la carta se desbloquea SIEMPRE —
    // mismo patrón que D7: el CardsDB viejo (sin estos campos) queda byte-idéntico en su disponibilidad.
    // `requires` soporta hoy: `"power>=N"` (atk+def+maxHp del host), `"card:<id>"` (ya en deck o
    // descubiertas — encadena cartas), `"tech:<id>"` (Fase 7 §7-bis.2: la tech de la civilización del
    // nodo ya llegó a ese punto del calendario) y `"recurso:<key>"` (Fase 7 §7-bis.2-bis: el nodo tiene
    // esa dotación en su base). `tech:`/`recurso:` exigen `ctx.seed` (y `recurso:` además `ctx.nodeId`)
    // — sin ellos, cierran en falso (fail-closed: sin contexto de mundo real, nunca se desbloquean, así
    // que llamadas viejas sin esos campos no rompen nada porque ninguna carta vieja los usa). `era` cae
    // a `ctx.era` para `tech:`/`recurso:` (misma era del contexto, no la de la carta — una carta
    // UNIVERSAL gateada por tech consulta el árbol de la era en la que se está forjando). `contextTags`
    // soporta hoy: `"era:X"` y `"regime:Y"`, exigiendo coincidencia exacta con el contexto del nodo.
    puedeDesbloquear: function(card, host, contextoNodo) {
        const ctx = contextoNodo || {};
        const requires = card.requires || [];
        const hostPower = host ? (host.atk || 0) + (host.def || 0) + (host.maxHp || 0) : 0;
        const owned = host ? [...(host.deck || []), ...(host.discoveredCards || [])].map(c => c.id) : [];
        const reqOk = requires.every((r) => {
            if (r.indexOf("power>=") === 0) return hostPower >= parseFloat(r.slice(7));
            if (r.indexOf("card:") === 0) return owned.indexOf(r.slice(5)) !== -1;
            if (r.indexOf("tech:") === 0) return ctx.seed != null && this.techUnlockedAt(ctx.seed, ctx.era, r.slice(5), ctx.year || 0);
            if (r.indexOf("recurso:") === 0) return ctx.seed != null && ctx.nodeId != null && this.tieneRecurso(ctx.seed, ctx.nodeId, ctx.era, r.slice(8));
            return true;
        });
        if (!reqOk) return false;
        const tags = card.contextTags || [];
        return tags.every((t) => {
            const sep = t.indexOf(":");
            const k = t.slice(0, sep), v = t.slice(sep + 1);
            if (k === "era") return ctx.era === v;
            if (k === "regime") return ctx.regime === v;
            return true;
        });
    },

    // ÁRBOL TECNOLÓGICO (Fase 7 §7-bis.2): la tech de la civilización YA está simulada — se desbloquea
    // por el TIEMPO, no la investiga el agente. `TECH_DB.VOCAB[era]` (tech_db.js) da el CONTENIDO fijo
    // (nombre por posición, el "sabor" de la era); esta función deriva de la SEMILLA la FORMA del grafo
    // (a qué nodo se engancha cada tech — permutación + padre, Fisher-Yates keyeado) y el CALENDARIO (año
    // de desbloqueo, creciente con la profundidad del árbol + jitter). Dos mundos de la MISMA era tienen
    // formas/calendarios distintos: "el árbol de tech depende de la semilla" (decisión de Taco). Pura,
    // determinista, sin `Math.random()` (D2/D5): misma `seed+era` → mismo árbol byte a byte, siempre.
    // `id` = "<era>#<índiceDeVocab>" — identidad de CONTENIDO estable entre semillas (lo que referencian
    // las cartas con `requires:["tech:<id>"]`); `tier`/`parent`/`unlockYear` SÍ varían por semilla.
    techTree: function(seed, era) {
        const vocab = (TechDB.VOCAB && TechDB.VOCAB[era]) || TechDB.VOCAB.MODERNO;
        const n = vocab.length;
        const order = vocab.map((_, i) => i);
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(this.rng(seed, "tech_perm:" + era + ":" + i) * (i + 1));
            const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
        }
        const byId = {};
        const list = [];
        order.forEach((vocabIdx, pos) => {
            const id = era + "#" + vocabIdx;
            let parent = null, tier = 0, minYear = 0;
            if (pos > 0) {
                const parentPos = Math.floor(this.rng(seed, "tech_parent:" + era + ":" + pos) * pos);
                parent = byId[era + "#" + order[parentPos]];
                tier = parent.tier + 1;
                minYear = parent.unlockYear + 3;
            }
            const jitter = Math.floor(this.rng(seed, "tech_year:" + id) * 5);
            const node = { id: id, name: vocab[vocabIdx], era: era, tier: tier, parent: parent ? parent.id : null, unlockYear: Math.max(minYear, tier * 6) + jitter };
            byId[id] = node;
            list.push(node);
        });
        list.sort((a, b) => a.unlockYear - b.unlockYear || a.id.localeCompare(b.id));
        return list;
    },

    // Consulta "¿esta civilización, en este momento, ya tiene X?" (§7-bis.2) — evalúa la base derivada
    // en `(era, t)`, sin simular hacia adelante (D2). El agente ENCUENTRA el nivel de su momento.
    techUnlockedAt: function(seed, era, techId, year) {
        const node = this.techTree(seed, era).find(t => t.id === techId);
        return !!node && year >= node.unlockYear;
    },

    // Toda la tech que la civilización de `era` ya desbloqueó para el año `year` (§7-bis.2) — usado por
    // capa 3 para mostrar el árbol tecnológico sin recomputar cada nodo a mano.
    availableTechs: function(seed, era, year) {
        return this.techTree(seed, era).filter(t => t.unlockYear <= year);
    },

    // DOTACIÓN DE RECURSOS POR NODO (Fase 7 §7-bis.2-bis): "¿hay una mina?" es una consulta a la base
    // `f(semilla, nodeId)`, no un roll nuevo del agente — dos corridas con la misma semilla encuentran
    // el mismo depósito en el mismo nodo (D2). `TECH_DB.RESOURCES[era]` da el catálogo de claves
    // posibles por era (el sabor); cada nodo tiene ~40% de probabilidad independiente por clave de
    // tenerla en su base — perfil de abundancia/escasez, no un solo escalar.
    nodeResources: function(seed, nodeId, era) {
        const types = (TechDB.RESOURCES && TechDB.RESOURCES[era]) || TechDB.RESOURCES.MODERNO;
        return types.filter(k => this.rng(seed, "recurso:" + nodeId + ":" + k) < 0.4);
    },

    tieneRecurso: function(seed, nodeId, era, key) {
        return this.rng(seed, "recurso:" + nodeId + ":" + key) < 0.4;
    },

    // ECONOMÍA REAL (Parte 8 del doc maestro, deuda cerrada): `tieneRecurso` solo dice SI hay un depósito
    // (presencia booleana); esto le pone MAGNITUD — cada recurso presente tiene una abundancia 1..3 (traza/
    // rica/abundante), salt propio para no correlacionar con el roll de presencia. Pura, `f(semilla,nodeId,
    // clave)` (D2): dos corridas de la misma semilla encuentran la MISMA mina con la MISMA riqueza.
    resourceYield: function(seed, nodeId, era, key) {
        if (!this.tieneRecurso(seed, nodeId, era, key)) return 0;
        return 1 + Math.floor(this.rng(seed, "recurso_yield:" + nodeId + ":" + key) * 3); // 1..3
    },

    // Producción total de un nodo/zona: suma de magnitud de TODOS los recursos de su era que tenga en la
    // base. Es la cifra que alimenta el comercio (zoneTradeBonus) — "cuánto tiene esta tierra para vender".
    zoneProduction: function(seed, nodeId, era) {
        const types = (TechDB.RESOURCES && TechDB.RESOURCES[era]) || TechDB.RESOURCES.MODERNO;
        return types.reduce((sum, k) => sum + this.resourceYield(seed, nodeId, era, k), 0);
    },

    // COMERCIO entre zonas (Parte 8, cierra "no hay comercio ni recursos diferenciados"): pura aritmética
    // sobre `zone.production` YA cacheada en génesis (cero rng nuevo acá, D2 intacto) — la zona más
    // productiva del mundo es el HUB: exporta y se queda con una tajada de la ganancia; el resto IMPORTA
    // una fracción proporcional a la brecha con el hub. Nadie pierde por comerciar (positivo o cero),
    // acotado a [-0,+3] para no desestabilizar el freno [5,100] de wealth. Sin zonas o sin producción en
    // ninguna, el bono es 0 (fail-closed, byte-idéntico al modelo viejo sin economía).
    zoneTradeBonus: function(zones, zone) {
        if (!zones || zones.length < 2) return 0;
        const productions = zones.map(z => z.production || 0);
        const maxProd = Math.max.apply(null, productions);
        if (maxProd <= 0) return 0;
        const hub = zones.find(z => (z.production || 0) === maxProd);
        if (zone.id === hub.id) return Math.min(3, Math.floor(maxProd / 3)); // ganancia de exportar
        const gap = maxProd - (zone.production || 0);
        return Math.min(2, Math.floor(gap / 6)); // importa una fracción de lo que le falta
    },

    drawCard: function(worldSeed, streamKey, meta, currentTick, qualityMult, regime, host) {
        const roll = this.rng(worldSeed, streamKey);
        let targetRarity = roll > 0.98 ? "SSR" : roll > 0.85 ? "SR" : roll > 0.50 ? "R" : "N";

        const traitTM = this.traitFx(meta).typeMult;
        if (this.rng(worldSeed, streamKey + "_forge") < 0.6) {
            return this.forgeProceduralCard(worldSeed, streamKey, meta.era, targetRarity, currentTick, meta.planetLuck, qualityMult, regime, traitTM);
        } else {
            const allCards = [...(CardsDB.TALENTOS||[]), ...(CardsDB.COMPANEROS||[]), ...(CardsDB.OBJETOS||[]), ...(CardsDB.HABILIDADES||[])];
            // Fase 7: seed/year/nodeId se agregan al contexto para que `requires:["tech:..."]"` y
            // `["recurso:..."]"` (§7-bis.2/2-bis) puedan evaluarse — sin tocar el gate de era/regime ya
            // existente. `host` puede no tener zona todavía (tick 0); `nodeId` queda undefined y
            // cualquier `recurso:` cierra en falso (fail-closed), sin romper nada de lo previo.
            const contextoNodo = { era: meta.era, regime: regime, seed: worldSeed, year: Math.floor(currentTick / 360), nodeId: host && host.zoneId };
            const unlockable = allCards.filter(c => this.puedeDesbloquear(c, host, contextoNodo));
            const pool = unlockable.filter(c => c.era === meta.era || c.era === "UNIVERSAL");
            // Fallback (pre-existente): si no hay nada de la era, se abre a toda carta desbloqueable —
            // nunca al conjunto sin gatear (el gate es una regla dura, el filtro de era es blando).
            const rarityPool = (pool.length > 0 ? pool : unlockable).filter(c => c.rarity === targetRarity);

            if (rarityPool.length === 0) return this.forgeProceduralCard(worldSeed, streamKey, meta.era, targetRarity, currentTick, meta.planetLuck, qualityMult, regime, traitTM);
            // El pool curado también pesa por TIPO según el perfil de era (un mundo antiguo empuja
            // COMPAÑEROS; uno actual, OBJETOS). Tipos fuera del perfil (MASCOTA, HABILIDAD…) pesan 2
            // — presentes pero sin protagonismo. Mismo salt `_pick`: un roll repartido (D2).
            const eraProf = this.ERA_PROFILES[meta.era] || null;
            const wOf = (c) => ((eraProf && eraProf.cardTypes[c.type] != null) ? eraProf.cardTypes[c.type] : 2) * (traitTM[c.type] != null ? traitTM[c.type] : 1);
            const weighted = rarityPool.map(c => ({ v: c, w: wOf(c) })).filter(it => it.w > 0);
            if (weighted.length === 0) return this.forgeProceduralCard(worldSeed, streamKey, meta.era, targetRarity, currentTick, meta.planetLuck, qualityMult, regime, traitTM);
            let picked = this.pickWeighted(weighted, this.rng(worldSeed, streamKey + "_pick"));
            return this.translateItem(picked, meta.era);
        }
    },

    // GOD-PULL (Fase 10 §0-bis/§7-ter.2): el espacio de cartas que la semilla puede dar y que el Admin
    // —la ley— puede tomar sin restricción de era/desbloqueo. Es LECTURA de la base derivable f(semilla)
    // (§1-bis), determinista: misma semilla → mismo catálogo. No consume estado; sólo enumera. La carta
    // elegida se despliega por el loadout y queda anotada COMPLETA en choiceLog vía la acción `start`
    // (las forjadas proc_* no existen en CardsDB — se registra el objeto entero, D3). El Admin ignora el
    // gate de era (a diferencia de un agente): ve TODA carta curada, de cualquier era.
    buildGodPullCatalog: function(seed, meta) {
        const catalog = [];
        // 1) Todas las cartas curadas de CardsDB — todas las categorías y eras (el Admin no tiene gate).
        for (const cat in CardsDB) (CardsDB[cat] || []).forEach(c => catalog.push({ ...c }));
        // 2) Forjas representativas de lo que ESTA semilla puede forjar en su mundo (era + régimen del
        //    mundo), una tanda por rareza. streamKeys estables → ids proc_ estables y reproducibles.
        const regime = this.deriveRegime(meta, null, 0);
        const yearTick = 360 * 10; // año representativo (iLvl medio)
        ["N", "R", "SR", "SSR"].forEach((rarity) => {
            for (let i = 0; i < 3; i++) {
                catalog.push(this.forgeProceduralCard(seed, `godpull:${rarity}:${i}`, meta.era, rarity, yearTick, meta.planetLuck, 1, regime, this.traitFx(meta).typeMult));
            }
        });
        return catalog;
    },

    // Mult efectivo del GRADO de la zona actual del Host (§6.4 fase 2b): el techo de poder que rige la
    // derivación en vivo (enemigos, umbrales, botín) sale del grado de la ZONA, no del rango global.
    // Fallback al rango global si el Host aún no tiene zona (o la zona no tiene grado) → D7: idéntico al
    // modelo previo cuando el grado de la zona coincide con el global.
    hostZoneMult: function(worldState, meta) {
        const agent = worldState.agents && worldState.agents[0];
        const zones = worldState.universe && worldState.universe.zones;
        const zone = (agent && zones) ? zones.find(z => z.id === agent.zoneId) : null;
        const rankId = (zone && zone.rank) ? zone.rank : meta.tierId;
        return (this.WORLD_TIERS[rankId] || meta.tierData).mult;
    },
    // El techo del mundo es estático. El novato no pelea el cielo el año 1: el combate
    // se acerca al techo en 8 años. El botín sigue usando hostZoneMult (T22).
    hostCombatMult: function(worldState, meta) {
        const z = this.hostZoneMult(worldState, meta);
        const year = Math.floor((worldState.tick || 0) / 360);
        const t = Math.min(1, year / 5);
        return 1 + (z - 1) * t;
    },
    // La forja llega DESPUÉS del peligro: el techo se siente antes de que el cuerpo lo iguale.
    hostGrowthMult: function(worldState, meta) {
        const z = this.hostZoneMult(worldState, meta);
        const year = Math.floor((worldState.tick || 0) / 360);
        const t = Math.min(1, year / 10);
        return 1 + (z - 1) * t;
    },
    aLa: function(name) {
        if (!name) return "a lo desconocido";
        if (/^el /i.test(name)) return "al " + name.slice(3);
        if (/^los /i.test(name)) return "a los " + name.slice(4);
        if (/^la /i.test(name)) return "a la " + name.slice(3);
        if (/^las /i.test(name)) return "a las " + name.slice(4);
        return "a " + name;
    },
    pickFoe: function(worldState, agent, salt) {
        const locals = this.zoneOthers(worldState, agent);
        if (locals && locals.length) {
            return locals[Math.floor(this.rng(worldState.seed, salt) * locals.length)];
        }
        return null;
    },
    composeCombat: function(worldState, agent, opts) {
        const zone = (worldState.universe && agent.zoneId) ? this.zoneName(worldState.universe, agent.zoneId) : "estas tierras";
        const foe = opts.foe;
        const who = foe
            ? (foe.name + (foe.class ? " (" + foe.class + ")" : ""))
            : (agent.nemesisName || agent.nemesis || "un rival");
        if (opts.win) {
            return this.polishEs(agent.name + " venció a " + who + " en " + zone + ". Poder " + opts.enemyPower + ".");
        }
        return this.polishEs(agent.name + " cedió ante " + who + " en " + zone + ". Daño −" + opts.damage + " HP.");
    },
    composeExplore: function(worldState, agent, salt) {
        const zones = (worldState.universe && worldState.universe.zones) || [];
        const others = zones.filter(z => z.id !== agent.zoneId);
        const dest = others.length
            ? others[Math.floor(this.rng(worldState.seed, salt) * others.length)]
            : null;
        const destName = dest ? dest.name : "un territorio vecino";
        return this.polishEs(agent.name + " recorrió " + destName + " y volvió con lo hallado.");
    },

    // El techo F–S es estático. El Host NO sube el mundo; el mundo SÍ forja más duro.
    // Equilibrio (mercenario, año 8, suerte 1): victoria objetivo ≈ tabla. No es un idle ni una picadora.
    //   F ×0.5  aldea      ~80%  pez gordo
    //   E ×0.8  condado    ~70%
    //   D ×1.0  estándar   ~55%  partida
    //   C ×1.5  hostil     ~45%
    //   B ×2.5  guerra     ~38%
    //   A ×4.0  extremo    ~32%
    //   S ×8.0  absoluto   ~28%  forja letal
    // Ascenso: (1 + techo × 0.55). Combate: el novato arranca local y en 8 años siente el techo.
    hostStratum: function(worldState, meta) {
        return "F";
    },
    stratumAtLeast: function(worldState, meta, minKey) {
        return this.plotOpen(worldState, meta, 8, minKey);
    },
    plotOpen: function(worldState, meta, minYear, minWorldRank) {
        const year = Math.floor((worldState.tick || 0) / 360);
        const keys = Object.keys(this.WORLD_TIERS);
        const agent = worldState && worldState.agents && worldState.agents[0];
        const zones = worldState && worldState.universe && worldState.universe.zones;
        const zone = (agent && zones) ? zones.find(z => z.id === agent.zoneId) : null;
        const ceilKey = (zone && zone.rank) ? zone.rank : ((meta && meta.tierId) || "F");
        const worldIdx = Math.max(0, keys.indexOf(ceilKey));
        const need = Math.max(0, keys.indexOf(minWorldRank || "F"));
        return year >= (minYear || 0) && worldIdx >= need;
    },
    lowRaidText: function(era, name) {
        const t = {
            CULTIVACION: "Discípulos de un reino vecino pasaron cobrando ofrenda en la aldea de " + name,
            FANTASIA: "Soldados de un barón lejano saquearon el camino de " + name,
            "SCI-FI": "Corsarios de una órbita superior desembarcaron a reclutar carne; " + name + " quedó en medio",
            CYBERPUNK: "Un escuadrón corporativo bajó del arco a limpiar el barrio de " + name,
            APOCALIPSIS: "Saqueadores de una zona más podrida cruzaron el territorio de " + name,
            MODERNO: "Una milicia foránea ocupó el pueblo de " + name + " unas semanas"
        };
        return t[era] || ("Forasteros demasiado fuertes para este rincón pasaron cobrando peaje a " + name);
    },

    // Habitantes de la zona del Host, EXCEPTO el propio Host. RimWorld: un peón no se encuentra
    // consigo mismo. El alma designada sigue en population (origen); hay que sacarla del cast.
    zoneOthers: function(worldState, agent) {
        const u = worldState && worldState.universe;
        if (!u || !agent || !agent.zoneId) return [];
        const hid = {};
        if (agent.originSoulId) hid[agent.originSoulId] = true;
        if (agent.id) hid[agent.id] = true;
        return (u.population || []).filter(p => p.alive && p.zoneId === agent.zoneId && !hid[p.id] && p.name !== agent.name);
    },

    // Cap de un golpe al Host según el año de la corrida. Novela-sim: los primeros años hieren,
    // no ejecutan. El 0.55 (dos derrotas = muerte) queda para el clímax. f(año) pura — D1 intacto.
    hostHitCap: function(year) {
        if (year < 2) return 0.22;
        if (year < 5) return 0.35;
        return 0.50;
    },

    // RADIO DE IMPACTO (Ladrillo 4, §1-bis): hasta dónde llega la influencia del Host, medida por su
    // poder (ATK) contra el techo de su entorno (grado × año). Devuelve una ESCALA 0..3:
    //   0 = local (su territorio) — "no cambia de planeta si sólo tiene un caballo"
    //   1 = continente · 2 = planeta · 3 = cosmos (su leyenda cruza a los mundos hermanos)
    // El radio crece con la capacidad, no gratis: dominar el techo de su zona (ratio ≥1) es el primer
    // peldaño; alcanzar el vacío entre mundos exige ser una leyenda (ratio ≥8). Determinista: f(estado
    // del Host) = f(semilla, choiceLog). Ata la "ascensión de grado" del §6.4 al poder real del agente.
    impactReach: function(worldState, meta) {
        const agent = worldState.agents && worldState.agents[0];
        if (!agent) return 0;
        const year = Math.floor(worldState.tick / 360);
        // RimWorld: el colono no tiene alcance planetario el día 0. El piso manda.
        if (year < 4) return 0;
        const ref = (10 + year * 4) * this.hostZoneMult(worldState, meta);
        const ratio = agent.atk / Math.max(1, ref);
        // Rasgo "Sello del Mundo" (v1.18.0): un mundo sellado acota el alcance — la leyenda no cruza
        // el vacío por más poder que haya (limitante diegético, xianxia world-seal).
        const cap = this.traitFx(meta).reachCap;
        if (ratio < 1) return 0;
        if (ratio < 3) return Math.min(1, cap);
        if (ratio < 8) return Math.min(2, cap);
        return Math.min(3, cap);
    },

    // TRAVERSÍA GATEADA POR CAPACIDAD (Fase 8 §7-bis.4): moverse entre nodos de un mismo TIER (dos
    // ciudades del mismo continente, dos continentes del mismo planeta, dos planetas del mismo
    // universo…) exige una `capability` — no basta con poder, hace falta la CARTA que la otorga
    // (MONTURA/VEHÍCULO/TECNOLOGÍA con `capabilities` en su esquema, §7-bis.1). El caso testigo: con
    // un caballo (`travel:overland`) el Host se mueve entre CIUDADes, pero `puedeViajar(host,
    // "PLANETA")` es falso porque le falta `travel:orbital`+`travel:interstellar` — "no cambia de
    // planeta si solo tiene un caballo". `mode: "any"` = alcanza con UNA de las capacidades listadas
    // (barco O aeronave cruzan continentes); `mode: "all"` = hacen falta TODAS (órbita Y salto
    // interestelar para saltar de planeta). `caps: []` = sin gate, se mueve a pie (dentro de la misma
    // ciudad). El tier UNIVERSO ("sistema→sistema") queda documentado por completitud del esquema —
    // hoy el motor solo simula un universo, así que ese salto no tiene destino real todavía.
    TRAVEL_REQUIREMENTS: {
        ZONA:       { mode: "all", caps: [] },
        CIUDAD:     { mode: "all", caps: ["travel:overland"] },
        CONTINENTE: { mode: "any", caps: ["travel:sea", "travel:air"] },
        PLANETA:    { mode: "all", caps: ["travel:orbital", "travel:interstellar"] },
        UNIVERSO:   { mode: "all", caps: ["travel:interstellar"] }
    },

    // Las `capabilities` que el Host tiene DESPLEGADAS ahora mismo — las que otorgan las cartas que ya
    // posee (mazo + descubiertas, mismo criterio que `owned` en `puedeDesbloquear`). Pura, sin rng.
    hostCapabilities: function(host) {
        if (!host) return [];
        const cards = [...(host.deck || []), ...(host.discoveredCards || [])];
        const caps = [];
        cards.forEach(c => (c.capabilities || []).forEach(cap => { if (caps.indexOf(cap) === -1) caps.push(cap); }));
        return caps;
    },

    // ¿Puede el Host dar el salto de escala `nodeTier` (el tier de los DOS nodos que quiere conectar,
    // ej. "CIUDAD" para ciudad→ciudad)? Solo mira CAPACIDAD (D5-style, pura): sin `host` o sin cartas
    // con `capabilities`, cualquier salto que exija algo queda bloqueado — fail-closed, igual que
    // `tech:`/`recurso:` en `puedeDesbloquear`. Un tier desconocido o sin requisito (`caps: []`) nunca
    // bloquea (moverse dentro de la propia ciudad no exige nada).
    puedeViajar: function(host, nodeTier) {
        const req = this.TRAVEL_REQUIREMENTS[nodeTier];
        if (!req || req.caps.length === 0) return true;
        const owned = this.hostCapabilities(host);
        return req.mode === "any" ? req.caps.some(c => owned.indexOf(c) !== -1) : req.caps.every(c => owned.indexOf(c) !== -1);
    },

    // MOTIVO (Fase 8 §7-bis.4-bis): la segunda mitad del gate — capacidad SIN motivo no mueve al Host
    // ("si vive pacífico en una ciudad, ¿para qué se va a mudar?"). Estado DERIVADO determinista (D2,
    // mismo criterio que `deriveRegime`): lee el estado YA decidido del Host/mundo, no tira rng nuevo.
    // Orden de prioridad (el primero que aplica gana): peligro real (HP bajo o zona letal) empuja a
    // HUIR; un mundo en post-cataclismo arrastra a huir aunque el Host esté sano; un mundo en conflicto
    // empuja a BUSCAR oportunidad; escasez local (wealth bajo) jala a buscar recursos en otro lado; una
    // Bifurcación sin resolver arrastra por MISIÓN. Sin nada de eso: `null` — sin motivo, no se mueve.
    deriveMotivo: function(worldState, meta) {
        const agent = worldState.agents && worldState.agents[0];
        if (!agent || agent.hp <= 0) return null;
        const u = worldState.universe;
        const zone = (u && u.zones) ? u.zones.find(z => z.id === agent.zoneId) : null;
        const regime = u && u.regime;
        const hpRatio = agent.maxHp ? agent.hp / agent.maxHp : 1;
        if (hpRatio < 0.3 || (zone && zone.danger >= 1.5)) return { type: "huir", reason: "peligro inmediato" };
        if (regime === "posapo") return { type: "huir", reason: "el mundo se derrumba" };
        if (regime === "decadencia") return { type: "huir", reason: "la era se apaga y no hay futuro aquí" };
        if (regime === "conflicto") return { type: "buscar", reason: "la guerra abre y cierra oportunidades" };
        if (zone && zone.wealth < 25) return { type: "buscar", reason: "su territorio no alcanza" };
        if (worldState.waitingForDecision || (agent.milestones && !agent.milestones.decisionMade)) return { type: "mision", reason: "un rumbo aún por decidir" };
        return null;
    },

    // Combina las DOS condiciones del §7-bis.4-bis: capacidad Y motivo, ambas deterministas. El Admin
    // (§0-bis) ignora esta función por completo — la Sala de Despliegue mueve NPCs/agentes sin pasar
    // por acá, a propósito.
    puedeViajarAhora: function(worldState, meta, nodeTier) {
        const agent = worldState.agents && worldState.agents[0];
        const motivo = this.deriveMotivo(worldState, meta);
        return { capacidad: this.puedeViajar(agent, nodeTier), motivo: motivo, puede: this.puedeViajar(agent, nodeTier) && !!motivo };
    },

    // Las pasivas se leen del texto de la carta ("+N ATK/DEF/HP") respetando el número escrito:
    // así el Destructor Estelar (+200 ATK) o la SÚPER-FÓRMULA de las forjadas aplican su valor real,
    // no un +30 plano por mencionar la palabra. Se usa regex.exec en bucle (no matchAll) para no
    // romper en WebViews Android viejos (< Chromium 73).
    applyCardStats: function(agent, card) {
        const statRe = /\+(\d+)\s*(ATK|DEF|HP)\b/g;
        let m;
        while ((m = statRe.exec(card.desc)) !== null) {
            const value = parseInt(m[1], 10);
            if (m[2] === "ATK") agent.atk += value;
            else if (m[2] === "DEF") agent.def += value;
            else if (m[2] === "HP") { agent.hp += value; if (agent.maxHp != null) agent.maxHp += value; }
        }
    },

    assembleAgentForSim: function(baseAgent, loadout, era) {
        let agent = JSON.parse(JSON.stringify(baseAgent));
        // C4: los talentos innatos (nacidos con el alma) modifican al agente al materializarse, ANTES
        // del Mazo. Nunca tocaron el molde baseline (100/10/10): se activan sólo acá, en el `start`.
        (agent.innateTalents || []).forEach(t => this.applyInnateTalent(agent, t));
        agent.deck = loadout.map(c => this.translateItem(c, era));
        agent.deck.forEach(card => this.applyCardStats(agent, card));
        return agent;
    },

    // Busca una carta fija por id en todas las categorías de CardsDB (usado por bossDrop: la
    // recompensa de un Evento Fijo grave es una carta temática específica, no una forjada al azar).
    getCardById: function(id) {
        for (let cat in CardsDB) {
            const found = CardsDB[cat].find(c => c.id === id);
            if (found) return found;
        }
        return null;
    },

    // El inventario histórico no acumula duplicados: la Cosecha deduplica por id de todas formas,
    // y sin esto una sesión larga de auto-run crece sin límite (memoria + escaneos O(n) en WebView).
    discoverCard: function(agent, card) {
        if (!agent.discoveredCards.some(c => c.id === card.id)) {
            agent.discoveredCards.push(card);
        }
    },

    // PUERTA ÚNICA de la capa 2 (Invariante D1 del doc maestro): TODA acción del espectador con
    // efecto sobre el World entra por acá. Antes mutaba al toque; ahora se ENCOLA primero
    // (worldState.eventQueue, FIFO) y se drena en el mismo paso — EventBus formal (cierra la deuda
    // de arquitectura de la Parte 8): el contrato de la puerta única no cambia (sigue siendo la
    // ÚNICA entrada, sigue anotando choiceLog ANTES de mutar dentro de cada case), solo se explicita
    // el paso "encolar → drenar" para que la capa 2 pueda crecer (más tipos de acción, o pausar entre
    // ticks) sin tocar el contrato. Con un solo hilo y drenaje inmediato es EQUIVALENTE a antes
    // (D3 intacto, cero regresión — T59 lo verifica).
    applyAction: function(worldState, action) {
        if (!worldState || !action) return { logs: [] };
        worldState.eventQueue = worldState.eventQueue || [];
        worldState.eventQueue.push({ type: action.type, action: action, tick: worldState.tick });
        return this.drainEventQueue(worldState);
    },

    drainEventQueue: function(worldState) {
        let lastResult = { logs: [] };
        while (worldState.eventQueue && worldState.eventQueue.length > 0) {
            const ev = worldState.eventQueue.shift();
            lastResult = this._dispatchAction(worldState, ev.action);
        }
        return lastResult;
    },

    _dispatchAction: function(worldState, action) {
        switch (action.type) {
            // Inicio de la corrida: el MAZO es una entrada del espectador que afecta al mundo, así
            // que entra por la puerta y queda anotado COMPLETO (id+desc+tipo: las forjadas proc_*
            // no existen en CardsDB, sin el objeto no se puede reproducir la partida). Cierra el
            // hueco de D3 encontrado en la auditoría v1.9.0: Mundo = f(semilla, choiceLog) ahora
            // incluye de verdad todas las entradas.
            case "start": {
                if (!action.baseAgent || !worldState.meta) return { logs: [] };
                const cards = action.cards || [];
                worldState.choiceLog = worldState.choiceLog || [];
                // `deployNpcId`: si el baseAgent es un NPC promovido (god-deploy), se anota su origen — un
                // Host promovido NO es derivable sólo de la semilla (es una elección del Admin), así que el
                // npcId debe quedar para reproducir (D3). Un Host normal (generateHost) es f(semilla) y va
                // como null. Se registra ACÁ, no en la acción de promoción, para que el choiceLog refleje
                // lo que REALMENTE arrancó: si el Admin promueve y luego re-sintoniza, gana el Host real.
                // FASE D2 — DECRETOS: los modificadores opcionales elegidos por el Admin son una ENTRADA
                // que afecta la corrida → entran por la puerta y quedan anotados (D3, reproducible). Sin
                // decretos, `decrees` es [] y los mods son neutros → corrida byte-idéntica a la de siempre.
                const decrees = action.decrees || [];
                worldState.choiceLog.push({ tick: worldState.tick, choice: "start", cards: cards.map(c => ({ ...c })), deployNpcId: (action.baseAgent.promotedFrom || null), decrees: decrees.slice(), keptInnate: action.keptInnate || null });
                worldState.agents = [this.assembleAgentForSim(action.baseAgent, cards, worldState.meta.era)];
                worldState.decreeMods = this.aggregateDecrees(decrees);
                // El Decreto del Reloj acorta la longevidad (寿元) del Host de entrada (determinista).
                if (worldState.decreeMods.lifespanMult !== 1 && worldState.agents[0].lifespan) {
                    worldState.agents[0].lifespan = Math.max(20, Math.round(worldState.agents[0].lifespan * worldState.decreeMods.lifespanMult));
                }
                // Cosecha 三选一: un talento innato RETENIDO de la vida anterior entra por la puerta
                // (D3). Si el alma nueva ya nació con el mismo id, no se aplica dos veces.
                if (action.keptInnate) {
                    const t = this.INNATE_TALENTS.find(x => x.id === action.keptInnate);
                    const a = worldState.agents[0];
                    if (t && a && !(a.innateTalents || []).some(x => x.id === t.id)) {
                        a.innateTalents = (a.innateTalents || []).concat([{ id: t.id, name: t.name, tier: t.tier, desc: t.desc, fx: t.fx }]);
                        this.applyInnateTalent(a, t);
                    }
                }
                // FASE C — ECONOMÍA DE LA PRESCIENCIA (cierra F3): la Vislumbre TÁCTICA (proyectar el
                // desenlace de CADA senda de una Bifurcación/Juicio antes de elegir) deja de ser gratis.
                // Cada corrida arranca con un presupuesto de cargas; la Vislumbre COMPLETA de la Sala
                // (pre-run) sigue libre — es la "corrida gratis" institucional del género. Sin cargas, la
                // rama queda en niebla y hay que elegir a ciegas: la información perfecta ya no mata la
                // tensión (Life Restart: la incertidumbre ES la rejugabilidad). El Decreto de la Niebla
                // (foresightDelta muy negativo) deja el presupuesto en 0 — corrida a ciegas por elección.
                worldState.foresightCharges = Math.max(0, this.FORESIGHT_BUDGET + (worldState.decreeMods.foresightDelta || 0));
                return { logs: [] };
            }
            // GOD-DEPLOY (Fase 10 §0-bis/§7-ter.2): el Admin arranca un NPC de la historia de la semilla y
            // lo promueve a Anfitrión. Promoción determinista (promoteNpcToHost). NO escribe choiceLog acá:
            // el origen (npcId) se anota en la entrada `start` (arriba) para que el registro refleje lo que
            // REALMENTE arranca — igual que god-pull, la staging pre-run se captura por la puerta del start.
            // En replay se re-deriva el universo (f(semilla)) y se re-promueve el mismo NPC → D3 intacto.
            case "admin_deploy_npc": {
                const u = worldState.universe;
                if (!u || action.npcId == null) return { logs: [] };
                const npc = (u.population || []).find(p => p.id === action.npcId);
                if (!npc) return { logs: [] };
                const host = this.promoteNpcToHost(npc, worldState.meta, worldState.seed);
                worldState.deployedHost = host;
                return { logs: [{ text: `[DESPLIEGUE] El Admin arrancó a ${npc.name} de la historia y lo promovió a Anfitrión.`, color: "text-purple", kind: "world" }], host: host };
            }
            case "decision": {
                const pd = worldState.pendingDecision;
                if (pd && pd.type === "duel") return this.resolveDuelDecision(worldState, action.optionId);
                if (pd && pd.type === "inflexion") return this.resolveInflexion(worldState, action.optionId);
                return this.resolveDecision(worldState, action.optionId);
            }
            case "abort": {
                const agent = worldState.agents && worldState.agents[0];
                if (!agent || agent.hp <= 0) return { logs: [] };
                worldState.choiceLog = worldState.choiceLog || [];
                worldState.choiceLog.push({ tick: worldState.tick, choice: "abort" });
                agent.hp = 0;
                worldState.waitingForChoice = true;
                const year = Math.floor(worldState.tick / 360);
                if (worldState.universe) {
                    const anheloClause = agent.desire ? ` Se fue con su anhelo ${agent.desire.fulfilled ? "cumplido" : "trunco"}: ${agent.desire.text}.` : "";
                    const entry = { year: year, kind: "host_death", text: `${agent.name}, de ${agent.faction || "ninguna facción"}, se desvaneció en el año ${year}: el Admin cortó la conexión.${anheloClause} El universo prosigue sin él.` };
                    if (agent.originSoulId) entry.soulId = agent.originSoulId;
                    worldState.universe.chronicle.push(entry);
                }
                return { logs: [{ text: `[SISTEMA] Conexión cortada. Colapso inducido del Recipiente.`, color: "text-red", kind: "death" }] };
            }
            // C18 SAGA: continuar con un heredero real (`findHeirs`) EN VEZ de re-correr la semilla de
            // cero. El universo no se toca (mismo tick, mismo chronicle) — solo se anota la sucesión en
            // choiceLog (D3) y se arma un Host nuevo sobre el heredero, igual que god-deploy.
            case "continue_heir": {
                const u = worldState.universe;
                if (!u || action.heirId == null) return { logs: [] };
                const heir = u.population.find(p => p.id === action.heirId && p.alive);
                if (!heir) return { logs: [] };
                const oldAgent = worldState.agents && worldState.agents[0];
                const oldName = oldAgent ? oldAgent.name : null;
                const cards = action.cards || [];
                worldState.choiceLog = worldState.choiceLog || [];
                worldState.choiceLog.push({ tick: worldState.tick, choice: "continue_heir", heirId: action.heirId, cards: cards.map(c => ({ ...c })) });
                const host = this.promoteNpcToHost(heir, worldState.meta, worldState.seed);
                host.legacyOf = oldName;
                worldState.agents = [this.assembleAgentForSim(host, cards, worldState.meta.era)];
                worldState.waitingForChoice = false;
                worldState.foresightCharges = this.FORESIGHT_BUDGET;
                return { logs: [{ text: `[SAGA] ${host.name} recoge el manto de ${oldName || "quien vino antes"} y continúa la historia del mundo.`, color: "text-gold", kind: "world" }], host: host };
            }
            // C20-c — EL EDITOR: retocar un alma real EXISTENTE (rasgos/stats/anhelo) antes de entrar —
            // su historia ya existe y se respeta, solo se tuercen atributos. Whitelist fail-closed: solo
            // los campos declarados se tocan, nunca id/alive/parentId (la posición no se edita, la
            // persona sí — igual criterio que C20-e). Entra por la puerta única (D1/D3).
            case "edit_soul": {
                const u = worldState.universe;
                if (!u || action.soulId == null || !action.changes) return { logs: [] };
                const soul = u.population.find(p => p.id === action.soulId);
                if (!soul) return { logs: [] };
                const EDITABLE = ["power", "age", "class", "factionId", "zoneId"];
                const applied = {};
                EDITABLE.forEach(k => { if (action.changes[k] !== undefined) { applied[k] = action.changes[k]; soul[k] = action.changes[k]; } });
                if (action.changes.desireText != null && soul.desire) { soul.desire.text = action.changes.desireText; applied.desireText = action.changes.desireText; }
                worldState.choiceLog = worldState.choiceLog || [];
                worldState.choiceLog.push({ tick: worldState.tick, choice: "edit_soul", soulId: action.soulId, changes: applied });
                return { logs: [{ text: `[EDITOR] El Admin retocó a ${soul.name}.`, color: "text-purple", kind: "world" }] };
            }
            // C20-d — EL CREADOR CON PRESUPUESTO: diseñar un alma desde cero y sumarla a la población
            // real (no un molde de UI — desde ese momento es un alma más de `universe.population`, con
            // los mismos derechos que cualquier notable: puede tener anhelo, ser Host vía admin_deploy_npc,
            // acumular crónica). El Interruptor (`CHARGEN_BUDGET_ON`) decide si el presupuesto se aplica.
            case "create_soul": {
                const u = worldState.universe;
                if (!u || !action.build) return { logs: [] };
                const cost = this.chargenCost(action.build);
                if (this.CHARGEN_BUDGET_ON && cost > this.CHARGEN_BUDGET) {
                    return { logs: [{ text: `[CREADOR] Diseño rechazado: excede el presupuesto (${cost}/${this.CHARGEN_BUDGET}).`, color: "text-red", kind: "world" }] };
                }
                const id = "npc_custom" + u.population.length + "_" + worldState.tick;
                const soul = {
                    id: id, name: action.build.name || this.pickName(worldState.seed, "custom:" + id, worldState.meta && worldState.meta.era),
                    class: action.build.class || "Errante", factionId: action.build.factionId || null, zoneId: action.build.zoneId || null,
                    power: action.build.power != null ? action.build.power : this.CHARGEN_BASE.power,
                    age: action.build.age != null ? action.build.age : 20, alive: true, parentId: null, custom: true
                };
                soul.desire = this.deriveDesire(worldState.seed, soul, u);
                soul.drive = this.deriveDrive(worldState.seed, soul);
                worldState.choiceLog = worldState.choiceLog || [];
                worldState.choiceLog.push({ tick: worldState.tick, choice: "create_soul", build: { ...action.build }, soulId: id });
                u.population.push(soul);
                return { logs: [{ text: `[CREADOR] ${soul.name} entra al mundo, diseño del Admin.`, color: "text-purple", kind: "world" }], soulId: id };
            }
            // C20-e — LA PLANTILLA Y EL REEMPLAZO: reemplaza al alma seleccionada por una plantilla o
            // creación — CONSERVA su posición en el mundo (id, facción, zona, filiación: su rol en la
            // crónica y en los lazos de otros no se rompe), CAMBIA la persona (nombre/clase/stats/anhelo
            // propio, derivado de nuevo para la identidad que entra).
            case "replace_soul": {
                const u = worldState.universe;
                if (!u || action.soulId == null || !action.template) return { logs: [] };
                const soul = u.population.find(p => p.id === action.soulId);
                if (!soul) return { logs: [] };
                const oldName = soul.name;
                if (action.template.name) soul.name = action.template.name;
                if (action.template.class) soul.class = action.template.class;
                if (action.template.power != null) soul.power = action.template.power;
                if (action.template.age != null) soul.age = action.template.age;
                soul.desire = this.deriveDesire(worldState.seed, soul, u);
                worldState.choiceLog = worldState.choiceLog || [];
                worldState.choiceLog.push({ tick: worldState.tick, choice: "replace_soul", soulId: action.soulId, template: { ...action.template } });
                return { logs: [{ text: `[REEMPLAZO] ${soul.name} toma el lugar de ${oldName} — misma facción, mismo territorio, otra persona.`, color: "text-purple", kind: "world" }] };
            }
        }
        return { logs: [] };
    },

    // VÍNCULOS SOCIALES CON MEMORIA (Parte 8 del doc maestro, deuda cerrada): antes lo único que el
    // Host "recordaba" de un cruce social era un flag binario sobreescribible (`vendettaFacId`). Estas
    // dos funciones son la base de un grafo real por alma: `bonds` acumula fuerza + un historial
    // año-a-año por NPC concreto (aliados, deudas de vida, rivales conocidos); `vendettas` acumula
    // CUÁNTAS veces y CUÁNDO el Admin ejecutó campeones de cada facción, en vez de recordar solo la
    // última. Puras (sin rng): la escena ya decidió el número, esto solo lo archiva (Parte 5: "la
    // convivencia la cuenta el simulador; los vínculos los teje la escena").
    recordBond: function(agent, npc, kind, delta, year) {
        agent.bonds = agent.bonds || {};
        let b = agent.bonds[npc.id];
        if (!b) { b = { npcName: npc.name, factionId: npc.factionId, strength: 0, history: [] }; agent.bonds[npc.id] = b; }
        b.strength += delta;
        b.factionId = npc.factionId;
        b.history.push({ year: year, kind: kind, delta: delta });
        return b;
    },

    // C17 — LAZOS QUE EVOLUCIONAN (Parte 10.3/`diseno-historia-completa-v1.0.md`, deuda cerrada):
    // `bonds` (v1.42.0) ya daba fuerza+historial por alma, pero como un número crudo, no un TIPO
    // reconocible (Wildermyth: amigo/rival/amante/maestro, 5 niveles). Derivación pura sobre datos ya
    // existentes (cero mutación, cero rng): el TIPO sale del historial dominante (qué clase de
    // interacción pesa más) y de si el alma es la némesis (C12); el NIVEL, de la magnitud acotada a
    // 1..5. Nunca inventa: si no hay bond, no hay tipo.
    BOND_KIND_TO_TYPE: {
        training: "aliado", encounter: "conocido", spared: "deuda_de_vida",
        duel_won: "rival", duel_lost: "rival", maestro_encuentro: "maestro", maestro_pago: "maestro"
    },
    classifyBond: function(agent, npcId) {
        const b = agent.bonds && agent.bonds[npcId];
        if (!b || !b.history.length) return null;
        const weight = {};
        b.history.forEach(h => { const t = this.BOND_KIND_TO_TYPE[h.kind] || "conocido"; weight[t] = (weight[t] || 0) + Math.abs(h.delta); });
        let type = "conocido", best = -1;
        Object.keys(weight).forEach(t => { if (weight[t] > best) { best = weight[t]; type = t; } });
        if (agent.nemesisId === npcId) type = "némesis"; // la escalada (C12) siempre pesa más que el resto
        const level = Math.min(5, Math.max(1, Math.floor(Math.abs(b.strength) / 10) + 1));
        return { type: type, level: level, strength: b.strength, npcName: b.npcName };
    },

    // C11 — HILOS CAUSALES (Parte 10.3/`diseno-historia-completa-v1.0.md`, deuda cerrada): antes
    // "el maestro que reaparece" y "la traición que se cobra" eran flags abstractos (`encFlags`) sobre
    // TEXTO ("un maestro", "un aliado") — nadie real, nada que muriera o pudiera nombrarse. Un hilo
    // referencia un ALMA REAL de `universe.population` (mismo principio que T15 social: solo entidades
    // que existen) y paga citando el año en que se abrió — la causalidad que el motor no tenía. Aditivo:
    // el flag `encFlags`/la cadena reencuentro-ajuste siguen intactos (T51), esto agrega la capa rica
    // ENCIMA cuando hay un alma real disponible en la zona del Host.
    openThread: function(worldState, kind, npc, year) {
        const u = worldState.universe;
        if (!u || !npc) return null;
        u.threads = u.threads || [];
        const id = kind + ":" + npc.id + ":" + year;
        if (u.threads.some(t => t.id === id)) return null; // no duplicar el mismo hilo el mismo año
        const th = { id: id, kind: kind, npcId: npc.id, npcName: npc.name, openedYear: year, state: "open" };
        u.threads.push(th);
        return th;
    },

    // Se consulta UNA vez por año, ANTES de tirar 奇遇 (la continuación pesa más que un evento suelto):
    // si el alma referenciada murió, el hilo cierra solo (no puede pagar un muerto — la crónica ya lo
    // sabe); si sigue viva, la probabilidad de pago crece con los años abiertos, keyeada por
    // hilo+año (D2, cero azar nuevo por observación). El primer hilo que paga o muere en este chequeo
    // corta el resto (un solo evento de hilo por año, igual que un solo 奇遇).
    checkThreadPayoffs: function(worldState, agent, year) {
        const u = worldState.universe;
        if (!u || !u.threads || !u.threads.length) return null;
        for (const th of u.threads) {
            if (th.state !== "open") continue;
            const npc = u.population.find(p => p.id === th.npcId);
            if (!npc || !npc.alive) { th.state = "dead"; continue; }
            const yearsOpen = year - th.openedYear;
            if (yearsOpen < 2) continue; // distancia narrativa mínima: no paga al año siguiente
            const chance = Math.min(0.6, 0.08 * yearsOpen);
            if (this.rng(worldState.seed, "hilo:" + th.id + ":y" + year) < chance) {
                th.state = "paid";
                return this.resolveThreadPayoff(agent, npc, th, year);
            }
        }
        return null;
    },

    resolveThreadPayoff: function(agent, npc, thread, year) {
        if (thread.kind === "traidor") {
            const dmg = Math.max(1, Math.floor(agent.maxHp * 0.1));
            agent.hp = Math.max(1, agent.hp - dmg);
            // C12: la traición que vuelve a cobrar ES la "nueva ofensa" que promueve al traidor a némesis
            // (diseño: "traición pagada con nueva ofensa" — escalada diegética, no de la nada).
            const promo = this.promoteNemesis(agent, npc, year);
            const promoTxt = promo ? " " + promo.text : "";
            return { text: `[HILO] ${npc.name}, que traicionó a ${agent.name} en el año ${thread.openedYear}, volvió a cruzarse en su camino y cobró de nuevo (-${dmg} HP).${promoTxt}`, color: "text-red", kind: "thread_payoff" };
        }
        if (thread.kind === "maestro") {
            const gain = Math.max(2, Math.floor(agent.maxHp * 0.02));
            agent.atk += gain; agent.def += gain;
            this.recordBond(agent, npc, "maestro_pago", 10, year); // C17: el vínculo de maestro madura
            return { text: `[HILO] ${npc.name}, el maestro que guió a ${agent.name} en el año ${thread.openedYear}, reapareció para su última lección (+${gain} ATK, +${gain} DEF).`, color: "text-gold", kind: "thread_payoff" };
        }
        return null;
    },

    // C12 — NÉMESIS (Parte 10.3/`diseno-historia-completa-v1.0.md`, deuda cerrada): "designación
    // diegética, no de la nada" — un alma real de `universe.population` que YA escaló dos veces contra
    // el Host (dos derrotas en duelo, o una traición que volvió a cobrar por C11) se promueve a némesis
    // ÚNICA y permanente por vida (mismo criterio que el Host: emerge, no se fabrica). Investigado
    // contra el Nemesis System (Shadow of Mordor/War, GDC 2018): la clave de ese sistema no es solo
    // "un rival fuerte", es que CRECE por vencer al jugador y las apariciones siguientes SE REFIEREN a
    // los cruces anteriores — acá eso ya lo da gratis el hilo/bond que lo promovió (cita año y nombre).
    promoteNemesis: function(agent, npc, year) {
        if (agent.nemesisId) return null; // una sola némesis por vida (no se reemplaza)
        agent.nemesisId = npc.id;
        agent.nemesisName = npc.name;
        agent.nemesisSince = year;
        return { text: `[NÉMESIS] ${npc.name} emerge como el rival que perseguirá a ${agent.name} de aquí en más.`, color: "text-purple", kind: "social" };
    },

    recordVendetta: function(agent, factionId, year) {
        agent.vendettas = agent.vendettas || {};
        let v = agent.vendettas[factionId];
        if (!v) { v = { count: 0, firstYear: year, lastYear: year }; agent.vendettas[factionId] = v; }
        v.count += 1;
        v.lastYear = year;
        return v;
    },

    // JUICIO DEL ADMINISTRADOR sobre un duelo letal (llamar vía Engine.applyAction). Es la primera
    // acción social real de capa 2: el espectador decide el destino de un habitante concreto del
    // mundo, la elección queda en choiceLog (D3) y sus consecuencias entran al estado del universo.
    resolveDuelDecision: function(worldState, optionId) {
        const pd = worldState.pendingDecision;
        const agent = worldState.agents && worldState.agents[0];
        if (!pd || pd.type !== "duel" || !agent) return { logs: [] };
        const option = (pd.options || []).find(o => o.id === optionId);
        if (!option) return { logs: [] };
        const u = worldState.universe;
        const npc = u ? u.population.find(p => p.id === pd.npcId) : null;
        const year = Math.floor(worldState.tick / 360);

        worldState.choiceLog = worldState.choiceLog || [];
        worldState.choiceLog.push({ tick: worldState.tick, choice: option.id });
        worldState.waitingForDecision = false;
        worldState.pendingDecision = null;
        if (!npc || !npc.alive) return { logs: [] };

        const logs = [];
        if (option.id === "duel_execute") {
            npc.alive = false;
            u.counters.deaths++;
            agent.atk += 3;
            agent.vendettaFacId = npc.factionId;
            this.recordVendetta(agent, npc.factionId, year);
            const rivalFac = u.factions.find(f => f.id === npc.factionId);
            if (rivalFac && rivalFac.alive) rivalFac.power = Math.max(0, rivalFac.power - 15);
            u.chronicle.push({ year: year, kind: "duel_death", soulId: npc.id, text: `${npc.name} fue ejecutado por ${agent.name} tras un duelo, por juicio del Admin.` });
            logs.push({ text: `[JUICIO] ${agent.name} ejecutó a ${npc.name}. El trofeo pesa (+3 ATK), y ${rivalFac ? rivalFac.name : "la facción rival"} jura venganza.`, color: "text-red", kind: "social" });
        } else {
            npc.power = Math.max(5, npc.power);
            npc.lifeDebt = true;
            this.recordBond(agent, npc, "spared", 15, year);
            const ownFac = u.factions.find(f => f.id === agent.factionId);
            if (ownFac && ownFac.alive) ownFac.power += 10;
            u.chronicle.push({ year: year, kind: "duel_spared", soulId: npc.id, text: `${agent.name} perdonó la vida de ${npc.name} tras vencerlo en duelo.` });
            logs.push({ text: `[JUICIO] ${agent.name} perdonó a ${npc.name}, que juró pagarle la vida. El gesto honró a ${ownFac ? ownFac.name : "su facción"} (+10 de poder).`, color: "text-green", kind: "social" });
        }
        return { logs: logs };
    },

    // Aplica la elección del Admin en un Punto de Bifurcación (llamar vía Engine.applyAction). Nada
    // se tira al azar acá: la única entrada nueva es el `optionId` del espectador, que se anota en
    // worldState.choiceLog. El premio es un Talento real (carta) que entra al mazo Y al inventario
    // histórico (queda para la Cosecha como cualquier otra carta). Invariante D3: mismo seed + mismo
    // choiceLog -> mismo mundo, byte a byte.
    resolveDecision: function(worldState, optionId) {
        const agent = worldState.agents[0];
        const meta = worldState.meta;
        const option = this.DECISION_OPTIONS.find(o => o.id === optionId);
        if (!option) return { logs: [] };

        const card = (CardsDB.TALENTOS || []).find(c => c.id === option.cardId);
        if (card) {
            agent.deck.push(card);
            this.applyCardStats(agent, card);
            this.discoverCard(agent, card);
        }
        agent.milestones.decisionMade = true;
        agent.milestones[option.milestone] = true;

        worldState.choiceLog = worldState.choiceLog || [];
        worldState.choiceLog.push({ tick: worldState.tick, choice: option.id });
        worldState.waitingForDecision = false;
        worldState.pendingDecision = null;

        const text = this.expandGrammar(option.tag, worldState.seed, worldState.tick, agent, meta);
        const cardText = card ? ` Talento adquirido: ${card.name}.` : "";
        const logs = [{ text: `[RUMBO ELEGIDO] ${text}${cardText}`, color: "text-purple", kind: "decision" }];

        // El rumbo elegido reubica al Host en el mapa (sin rng — deriva solo de la elección, que ya
        // quedó anotada en choiceLog): el lobo solitario parte a la zona más peligrosa, el leal
        // vuelve al asiento de su facción, el oportunista se planta en el territorio intermedio.
        // Mover al Host cambia qué zona se simula DETAILED a partir de aquí.
        if (worldState.universe && worldState.universe.zones && agent.zoneId) {
            const u = worldState.universe;
            let dest = null;
            if (option.id === "lonewolf") dest = u.zones.slice().sort((a, b) => b.danger - a.danger)[0];
            else if (option.id === "opportunist") dest = u.zones.slice().sort((a, b) => Math.abs(a.danger - 1) - Math.abs(b.danger - 1))[0];
            else if (option.id === "loyalist") { const own = u.factions.find(f => f.id === agent.factionId); if (own) dest = u.zones.find(z => z.id === own.zoneId); }
            if (dest && dest.id !== agent.zoneId) {
                // Transición DETAILED↔ABSTRACT real: la zona que el Host abandona se ABSTRAE (sus
                // almas nacidas de la masa se disuelven de vuelta en los agregados) y la zona que
                // lo recibe se DETALLA (parte de su masa se materializa en almas con nombre).
                this.dissolveZone(worldState, agent.zoneId);
                agent.zoneId = dest.id;
                this.materializeZone(worldState, dest.id, 3);
                logs.push({ text: `[MIGRACIÓN] El rumbo elegido llevó a ${agent.name} hasta ${dest.name}.`, color: "text-cyan", kind: "world" });
                const zoneLog = this.describeZone(worldState, dest.id);
                if (zoneLog) logs.push(zoneLog);
            }
        }

        return { logs: logs };
    },

    // Aplica el desenlace (gana/pierde) de un Punto de Inflexión — extraído sin cambios del check que
    // antes resolvía inline en runTicks, para que resolveInflexion pueda invocarlo tanto en "aceptar"
    // (resultado tal cual) como en "rechazar" con éxito (mismo premio) o "forzar" (éxito garantizado).
    // Pura sobre worldState/agent ya mutados por el llamador — cero rng nuevo (D2).
    applyInflexionOutcome: function(worldState, agent, meta, fixedEvent, year, reqValue, success) {
        const zoneMult = this.hostZoneMult(worldState, meta);
        const decreeMods = worldState.decreeMods || { enemyMult: 1, lootMult: 1, essenceMult: 1 };
        const lootQuality = (zoneMult / (meta.tierData.mult || 1)) * this.traitFx(meta).loot * (decreeMods.lootMult || 1);
        const logs = [];
        if (success) {
            const text = this.expandGrammar(fixedEvent.tagWin, worldState.seed, worldState.tick, agent, meta);
            logs.push({ text: `[PUNTO DE INFLEXIÓN] ${text} (Check superado: ${agent[fixedEvent.stat]}/${reqValue} ${fixedEvent.stat.toUpperCase()})`, color: "text-purple", kind: "combat_win" });

            // Asimilación de Jefe: si el Evento Fijo tiene una carta temática asociada, esa
            // reemplaza a la forjada genérica -- más memorable que una SSR al azar.
            const bossCard = fixedEvent.bossDrop ? this.getCardById(fixedEvent.bossDrop) : null;
            const card = bossCard || this.forgeProceduralCard(worldState.seed, `epic_loot:${worldState.tick}`, meta.era, "SSR", worldState.tick, meta.planetLuck * 1.5, lootQuality, worldState.universe && worldState.universe.regime);
            const rewardLabel = bossCard ? "[ASIMILACIÓN]" : "[RELIQUIA DEL DESTINO]";
            logs.push({ text: `${rewardLabel} El universo alterado concedió: ${card.name}.`, color: "text-cyan", kind: "loot" });
            this.discoverCard(agent, card);
            agent.hp = agent.maxHp;

            // El Host como habitante: su hazaña reordena el mapa de poder. Su facción se fortalece
            // y la rival se debilita — sus actos entran al estado del mundo, no quedan en su burbuja.
            if (worldState.universe && agent.factionId) {
                const own = worldState.universe.factions.find(f => f.id === agent.factionId);
                if (own && own.alive) own.power += 40;
                const rival = worldState.universe.factions.find(f => f.id === agent.rivalFacId);
                if (rival && rival.alive) {
                    rival.power = Math.max(0, rival.power - 50);
                    if (rival.power <= 0) {
                        rival.alive = false;
                        worldState.universe.counters.factionsFallen++;
                        worldState.universe.chronicle.push({ year: year, kind: "faction_fall", text: `[CAÍDA] ${rival.name} colapsó ante la furia de ${agent.name}.` });
                        logs.push({ text: `[MUNDO] ${rival.name} colapsó ante la furia de ${agent.name}. La historia recordará su nombre.`, color: "text-red", kind: "world" });
                    }
                }
            }
        } else {
            const text = this.expandGrammar(fixedEvent.tagLose, worldState.seed, worldState.tick, agent, meta);
            logs.push({ text: `[JUICIO DEL SISTEMA] ${text} (Check fallido: Necesario ${reqValue} ${fixedEvent.stat.toUpperCase()})`, color: "text-red", kind: "death" });

            if (fixedEvent.fatal) agent.hp = 0;
            else agent.hp -= (fixedEvent.dmg || 50);
        }
        return logs;
    },

    // VOLUNTAD EN EL PUNTO DE INFLEXIÓN (fusión acotada del prototipo Grok — reject/force sobre una
    // tirada real, ver docs/handoff-fusion-voluntad-v1.45.0.md): el Admin decide antes de que el check
    // se resuelva. "aceptar" no gasta nada (el check corre tal cual ya estaba). "rechazar" cuesta
    // Voluntad y concede una segunda lectura con +15% al stat SOLO para este juicio (no altera el stat
    // permanente del agente). "forzar" cuesta más Voluntad + Fortuna y garantiza el éxito sin evaluar
    // el umbral — el Admin tuerce el destino, y eso se anota (D1/D3): entra por applyAction, queda en
    // choiceLog, jamás re-tira azar nuevo (D2).
    resolveInflexion: function(worldState, optionId) {
        const pd = worldState.pendingDecision;
        const agent = worldState.agents && worldState.agents[0];
        if (!pd || pd.type !== "inflexion" || !agent) return { logs: [] };
        const meta = worldState.meta;
        const plotEvents = this.FIXED_EVENTS[meta.plot.id] || this.FIXED_EVENTS["DEFAULT"];
        const fixedEvent = plotEvents[pd.year];
        if (!fixedEvent) return { logs: [] };

        let success = agent[pd.stat] >= pd.reqValue;
        const logs = [];
        if (optionId === "reject") {
            const cost = this.INFLEXION_COST.reject;
            if (agent.will >= cost.will) {
                agent.will -= cost.will;
                success = Math.floor(agent[pd.stat] * 1.15) >= pd.reqValue;
                logs.push({ text: `[VOLUNTAD] ${agent.name} rechaza el primer juicio y exige una segunda lectura (-${cost.will} Voluntad).`, color: "text-gold", kind: "decision" });
            } else {
                logs.push({ text: `[VOLUNTAD] ${agent.name} no tiene la Voluntad para rechazar el juicio (necesita ${cost.will}).`, color: "text-muted", kind: "decision" });
            }
        } else if (optionId === "force") {
            const cost = this.INFLEXION_COST.force;
            if (agent.will >= cost.will && agent.luck >= cost.luck) {
                agent.will -= cost.will;
                agent.luck -= cost.luck;
                success = true;
                logs.push({ text: `[VOLUNTAD] ${agent.name} fuerza el destino a su favor (-${cost.will} Voluntad, -${cost.luck} Fortuna).`, color: "text-gold", kind: "decision" });
            } else {
                logs.push({ text: `[VOLUNTAD] ${agent.name} no tiene Voluntad ni Fortuna suficientes para forzar el destino (necesita ${cost.will} Voluntad + ${cost.luck} Fortuna).`, color: "text-muted", kind: "decision" });
            }
        }

        worldState.choiceLog = worldState.choiceLog || [];
        worldState.choiceLog.push({ tick: worldState.tick, choice: "inflexion_" + optionId, year: pd.year });
        worldState.waitingForDecision = false;
        worldState.pendingDecision = null;

        return { logs: logs.concat(this.applyInflexionOutcome(worldState, agent, meta, fixedEvent, pd.year, pd.reqValue, success)) };
    },

    // C3 奇遇 / ENCUENTROS (Parte 10.3 del doc maestro): la tabla de eventos de vida fortuitos o
    // calamitosos que hace "leíble" cada corrida. Fortunas (hallazgo/maestro/legado/tesoro) y calamidades
    // (traición/plaga), con peso relativo `w`.
    // B1 (Fase densidad): tabla data-driven. Cada entrada lleva su efecto `fx(agent, c)` — c = {name,
    // zone, base, boon} (magnitudes ya deterministas, calculadas en applyLifeEncounter) — que muta al
    // Host y devuelve {text, color}. `boon` clasifica fortuna/calamidad (sesgo de Fortuna). `requires`
    // (opcional) gatea CADENAS: un 奇遇 solo elegible si el Host arrastra un flag de un evento previo
    // (encFlags), sembrado por otro 奇遇 — así "el maestro que reaparece" y "la traición que se cobra"
    // son eventos de dos pasos, no sucesos sueltos. Los 6 originales conservan id/tag/efecto EXACTOS
    // (comportamiento numérico idéntico cuando se los elige); el resto es densidad nueva, con magnitudes
    // en el mismo rango acotado (base/boon), sin azar propio (D2 — el único rng es el gate/pick de arriba).
    LIFE_ENCOUNTERS: [
        // — Fortunas base (originales, sin cambios de efecto) —
        { id: "hallazgo", tag: "HALLAZGO", w: 3, boon: true, fx: (a, c) => { a.atk += c.boon; return { text: `${c.name} desenterró una técnica olvidada en ${c.zone} (+${c.boon} ATK).`, color: "text-cyan" }; } },
        { id: "maestro",  tag: "MAESTRO",  w: 2, boon: true, fx: (a, c) => { a.def += c.boon; a.encFlags = a.encFlags || {}; a.encFlags.master = true; return { text: `Un maestro errante corrigió la senda de ${c.name} y prometió volver a probarlo (+${c.boon} DEF).`, color: "text-cyan" }; } },
        { id: "legado",   tag: "LEGADO",   w: 1, boon: true, fx: (a, c) => { const dH = c.boon * 5; a.maxHp += dH; a.hp = Math.min(a.maxHp, a.hp + dH); if (a.lifespan) a.lifespan += 3; return { text: `${c.name} heredó el legado de un caído de ${c.zone} (+${dH} HP máx, +3 años de vida).`, color: "text-green" }; } },
        { id: "tesoro",   tag: "TESORO",   w: 3, boon: true, fx: (a, c) => { const dH = Math.floor(a.maxHp * 0.12); const dA = Math.max(1, Math.floor(c.boon / 2)); a.hp = Math.min(a.maxHp, a.hp + dH); a.atk += dA; return { text: `${c.name} halló un tesoro entre ruinas (+${dH} HP, +${dA} ATK).`, color: "text-green" }; } },
        // — Fortunas nuevas (densidad) —
        { id: "reliquia", tag: "RELIQUIA", w: 2, boon: true, fx: (a, c) => { a.atk += c.boon; a.def += Math.max(1, Math.floor(c.boon / 2)); return { text: `${c.name} recuperó una reliquia intacta en ${c.zone} (+${c.boon} ATK, +${Math.max(1, Math.floor(c.boon / 2))} DEF).`, color: "text-cyan" }; } },
        { id: "elixir",   tag: "ELIXIR",   w: 2, boon: true, eras: ["CULTIVACION", "FANTASIA"], fx: (a, c) => { const dH = c.boon * 4; a.maxHp += dH; a.hp = Math.min(a.maxHp, a.hp + dH); return { text: `Un elíxir raro fortaleció el cuerpo de ${c.name} (+${dH} HP máx).`, color: "text-green" }; } },
        { id: "iluminacion", tag: "ILUMINACIÓN", w: 1, boon: true, eras: ["CULTIVACION", "FANTASIA"], fx: (a, c) => { const dA = c.boon; const dD = Math.max(1, Math.floor(c.boon / 2)); a.atk += dA; a.def += dD; return { text: `Una súbita comprensión abrió la senda de ${c.name} (+${dA} ATK, +${dD} DEF).`, color: "text-cyan" }; } },
        { id: "benefactor", tag: "BENEFACTOR", w: 2, boon: true, fx: (a, c) => { const dH = c.boon * 3; a.maxHp += dH; a.hp = Math.min(a.maxHp, a.hp + dH); return { text: `Un patrón de ${c.zone} tomó a ${c.name} bajo su ala (+${dH} HP máx).`, color: "text-green" }; } },
        { id: "veta",     tag: "VETA",     w: 2, boon: true, fx: (a, c) => { a.atk += c.boon; return { text: `${c.name} explotó una veta de materiales raros y forjó mejor equipo (+${c.boon} ATK).`, color: "text-cyan" }; } },
        { id: "fruto",    tag: "FRUTO",    w: 1, boon: true, eras: ["CULTIVACION", "FANTASIA"], fx: (a, c) => { a.def += c.boon; if (a.lifespan) a.lifespan += 2; return { text: `${c.name} comió un fruto espiritual madurado en un milenio (+${c.boon} DEF, +2 años de vida).`, color: "text-green" }; } },
        { id: "bestia",   tag: "BESTIA",   w: 2, boon: true, eras: ["FANTASIA", "CULTIVACION", "APOCALIPSIS"], fx: (a, c) => { a.atk += c.boon; return { text: `${c.name} domó a una bestia de ${c.zone} y la sumó a su senda (+${c.boon} ATK).`, color: "text-cyan" }; } },
        { id: "manuscrito", tag: "MANUSCRITO", w: 2, boon: true, fx: (a, c) => { a.def += c.boon; return { text: `Un manuscrito perdido enseñó a ${c.name} una defensa olvidada (+${c.boon} DEF).`, color: "text-cyan" }; } },
        { id: "aliado",   tag: "ALIADO",   w: 2, boon: true, fx: (a, c) => { const dD = Math.max(1, Math.floor(c.boon / 2)); a.def += dD; const dH = c.boon * 2; a.maxHp += dH; a.hp = Math.min(a.maxHp, a.hp + dH); return { text: `${c.name} juró hermandad con un errante de ${c.zone} (+${dD} DEF, +${dH} HP máx).`, color: "text-green" }; } },
        // — Cadena del MAESTRO: solo elegible si un 'maestro' previo sembró el flag. Paga fuerte y lo consume. —
        { id: "reencuentro", tag: "REENCUENTRO", w: 3, boon: true, requires: (a) => !!(a.encFlags && a.encFlags.master), fx: (a, c) => { if (a.encFlags) a.encFlags.master = false; const dA = c.boon * 2, dD = c.boon; a.atk += dA; a.def += dD; return { text: `El maestro que corrigió a ${c.name} reapareció y le entregó su técnica final (+${dA} ATK, +${dD} DEF).`, color: "text-gold" }; } },
        // — Calamidades base (originales, sin cambios de efecto) —
        { id: "traicion", tag: "TRAICIÓN", w: 2, boon: false, fx: (a, c) => { const dmg = c.base * 3; a.hp -= dmg; a.encFlags = a.encFlags || {}; a.encFlags.grudge = true; return { text: `Un aliado traicionó a ${c.name} y huyó con parte de su fortuna (-${dmg} HP).`, color: "text-red" }; } },
        { id: "plaga",    tag: "PLAGA",    w: 2, boon: false, fx: (a, c) => { const dmg = c.base * 2; a.hp -= dmg; return { text: `Una plaga asoló ${c.zone}; ${c.name} apenas sobrevivió (-${dmg} HP).`, color: "text-red" }; } },
        // — Calamidades nuevas (densidad) —
        { id: "emboscada", tag: "EMBOSCADA", w: 2, boon: false, fx: (a, c) => { const dmg = c.base * 2; a.hp -= dmg; return { text: `Bandidos emboscaron a ${c.name} en un paso de ${c.zone} (-${dmg} HP).`, color: "text-red" }; } },
        { id: "maldicion", tag: "MALDICIÓN", w: 1, boon: false, fx: (a, c) => { const dmg = c.base * 3; a.hp -= dmg; if (a.lifespan) a.lifespan = Math.max(a.age + 1, a.lifespan - 2); return { text: `Una maldición se prendió de ${c.name} y le carcomió los años (-${dmg} HP, -2 de longevidad).`, color: "text-red" }; } },
        { id: "robo",     tag: "ROBO",     w: 2, boon: false, fx: (a, c) => { const dmg = c.base * 2; a.hp -= dmg; return { text: `Ladrones despojaron a ${c.name} de sus provisiones en ${c.zone} (-${dmg} HP).`, color: "text-red" }; } },
        { id: "desviacion", tag: "DESVIACIÓN", w: 1, boon: false, eras: ["CULTIVACION", "FANTASIA"], fx: (a, c) => { const dmg = c.base * 3; a.hp -= dmg; return { text: `El Qi de ${c.name} se desvió a mitad de la senda y estuvo a punto de romperlo (-${dmg} HP).`, color: "text-red" }; } },
        { id: "catastrofe", tag: "CATÁSTROFE", w: 1, boon: false, fx: (a, c) => { const dmg = c.base * 3; a.hp -= dmg; return { text: `Una catástrofe natural arrasó ${c.zone} y ${c.name} quedó bajo los escombros (-${dmg} HP).`, color: "text-red" }; } },
        { id: "cazador",  tag: "CAZARRECOMPENSAS", w: 2, boon: false, fx: (a, c) => { const dmg = c.base * 2; a.hp -= dmg; return { text: `Un cazarrecompensas siguió el rastro de ${c.name} hasta ${c.zone} (-${dmg} HP).`, color: "text-red" }; } },
        // — Cadena de la TRAICIÓN: solo elegible si un 'traicion' previo sembró rencor. La saldás y lo consume. —
        { id: "ajuste",   tag: "AJUSTE DE CUENTAS", w: 3, boon: true, requires: (a) => !!(a.encFlags && a.encFlags.grudge), fx: (a, c) => { if (a.encFlags) a.encFlags.grudge = false; const dA = c.boon * 2; a.atk += dA; return { text: `${c.name} dio con el traidor que lo despojó y saldó la cuenta, quedándose con su técnica (+${dA} ATK).`, color: "text-gold" }; } }
    ],

    // Tira UN 奇遇 por año para el Host (capa 1 pura: corre la vea alguien o no). Determinista: rng
    // keyeado por `semilla+año` (D2), sin Math.random. La magnitud crece lento con el año y el grado del
    // mundo (`tierData.mult`); lo bueno escala con `lootQuality` (grado de la zona). Efecto = aritmética
    // acotada sobre el Host; el log lleva kind:"encounter" (la Vislumbre lo recoge). Auto-resuelto (sin
    // espectador); un 奇遇 CON decisión sería capa 2 (pieza futura). Devuelve el log o null (año sin evento).
    applyLifeEncounter: function(worldState, agent, meta, year, zoneMult, lootQuality) {
        const seed = worldState.seed;
        // C2 FORTUNA: la fortuna del Host [20,80] sesga el gate y el reparto fortuna/calamidad. lf ∈
        // [-0.6,+0.6] (afortunado ↔ maldito). NO crea azar: inclina umbrales deterministas (D2).
        const luck = (agent.luck != null) ? agent.luck : 50;
        const lf = (luck - 50) / 50;
        // Rasgos de mundo (v1.18.0): el Velo Espiritual abre el gate de 奇遇; la Época Desolada lo
        // cierra; el sesgo de calamidad (Qi Denso, Eco Precursor) engorda las tablas oscuras. Todo
        // determinista — mismos rolls, umbrales corridos (mismo principio que la Fortuna).
        const tfx = this.traitFx(meta);
        // C13 DIRECTOR: la intensidad del año modula el gate (años valle → menos 奇遇: el silencio también
        // narra; años clímax → más) y empuja las calamidades en la escalada. Determinista (f(semilla,plot,
        // año)); se suma a la Fortuna y a los rasgos sin crear azar nuevo.
        const si = this.storyIntensity(seed, meta.plot.id, year);
        // C5 悟性: la perspicacia del Host abre un poco más el gate de 奇遇 (aditivo a la Fortuna, acotado).
        const insight = (agent.insight != null) ? agent.insight : 50;
        const inf = (insight - 50) / 50;
        const gate = Math.min(0.92, Math.max(0.08, 0.4 + lf * 0.15 + inf * 0.10 + tfx.encounterGate + (si - 0.5) * 0.55)); // más fortuna/perspicacia/intensidad → más 奇遇
        if (this.rng(seed, "enc:gate:y" + year) >= gate) return null;
        const zoneName = (worldState.universe && agent.zoneId) ? this.zoneName(worldState.universe, agent.zoneId) : "tierras ignotas";
        // Elegibilidad: los 奇遇 de CADENA (`requires`) solo entran a la tabla si el Host arrastra su flag
        // (encFlags, sembrado por un evento previo) — deterministas por estado, no por azar nuevo (D2).
        const table = this.LIFE_ENCOUNTERS.filter(e => (!e.requires || e.requires(agent)) && this.fitsEra(e, meta.era));
        // Pesos sesgados por fortuna Y por la escalada del Director: el afortunado empuja las fortunas; el
        // clímax (si > 0.5) engorda las calamidades — la tensión del arco se hace daño real.
        const wOf = (e) => Math.max(0.01, e.w * (e.boon ? (1 + lf * 0.5) : (1 - lf * 0.5) * (1 + tfx.calamityBias * 2 + Math.max(0, si - 0.5) * 1.2)) * this.desireBias(agent, e.id));
        const total = table.reduce((s, e) => s + wOf(e), 0);
        let roll = this.rng(seed, "enc:pick:y" + year) * total, pick = table[0];
        for (const e of table) { const w = wOf(e); if (roll < w) { pick = e; break; } roll -= w; }
        const tierMul = meta.tierData.mult || 1;
        const base = Math.max(1, Math.floor(tierMul * (2 + year * 0.15)));
        // La fortuna también engorda el botín de las fortunas (+ hasta ~18%).
        const boon = Math.max(1, Math.floor(base * Math.max(1, lootQuality || 1) * (1 + Math.max(0, lf) * 0.3)));
        // El efecto vive en la propia entrada (data-driven, B1): muta al Host con magnitudes ya
        // deterministas (base/boon) y devuelve su texto/color. Cero rng dentro del fx.
        const res = pick.fx(agent, { name: agent.name, zone: zoneName, base: base, boon: boon });
        // C11 HILOS: además del flag abstracto de siempre (encFlags, T51 intacto), si hay un alma real
        // en la zona del Host, "maestro"/"traicion" abren un hilo con nombre propio — la cadena
        // reencuentro/ajuste sigue funcionando igual; esto es la capa rica ENCIMA, no un reemplazo.
        if ((pick.id === "maestro" || pick.id === "traicion") && worldState.universe && agent.zoneId) {
            const locals = this.zoneOthers(worldState, agent);
            if (locals.length) {
                const npc = locals[Math.floor(this.rng(seed, "enc:threadnpc:y" + year) * locals.length)];
                this.openThread(worldState, pick.id === "maestro" ? "maestro" : "traidor", npc, year);
                // C17: el hilo del maestro también siembra el vínculo (bonds) — la relación existe desde
                // el primer encuentro, no solo cuando el hilo paga.
                if (pick.id === "maestro") this.recordBond(agent, npc, "maestro_encuentro", 5, year);
            }
        }
        return { text: `[${pick.tag}] ${res.text}`, color: res.color, kind: "encounter" };
    },

    runTicks: function(worldState) {
        let agent = worldState.agents[0];
        let meta = worldState.meta;
        let logs = [];
        let storyDict = this.NARRATIVE_MILESTONES[meta.era] || this.NARRATIVE_MILESTONES.UNIVERSAL;

        worldState.tick += 30;
        const year = Math.floor(worldState.tick / 360);

        // C15 / EL CRONISTA — material del tamiz: cada tick vuelca al `timeline` del World los logs
        // narrativamente notables de ESTE año (los de `STORY_KINDS`; el clima puro no). Derivación pura
        // de logs ya deterministas → D2 intacto (misma semilla+rumbo → mismo timeline byte a byte). Se
        // llama justo antes de cada return (pausa de duelo, pausa de Bifurcación, y cierre del tick).
        const STORY = new Set(this.STORY_KINDS);
        const flushStory = () => {
            if (!worldState.timeline) worldState.timeline = [];
            const y = Math.floor(worldState.tick / 360);
            // C16 — RITMO ESCENA/SUMARIO (Parte 10.3, deuda cerrada): cada beat guarda su `weight`
            // (la intensidad C13 del año en que ocurrió) — capa 1 pura, f(semilla,plot,año), cero rng
            // nuevo. La capa 3 puede usarlo para comprimir años valle consecutivos y expandir el
            // clímax; acá solo se deja el dato, la presentación es trabajo futuro (motor antes que UI).
            const w = (meta.plot && meta.plot.id != null) ? this.storyIntensity(worldState.seed, meta.plot.id, y) : 0.5;
            logs.forEach(l => { if (STORY.has(l.kind)) worldState.timeline.push({ year: y, kind: l.kind, text: l.text, weight: w }); });
        };

        // HITOS NARRATIVOS — un ACTO, no un manual. Los hechos ya viven en meta/agent/universe
        // (FICHA los lee). El feed solo nombra el arranque.
        // Apertura al estilo Star Wars: prosa, no manual. Los hechos salen de openingCrawl.
        if (year === 1 && !agent.milestones.intro) {
            agent.milestones.intro = true;
            const crawl = this.openingCrawl(worldState);
            if (crawl) {
                logs.push({ text: crawl.farAway, color: "text-cyan", kind: "intro" });
                (crawl.crawl || []).forEach(p => logs.push({ text: p, color: "text-white", kind: "intro" }));
            }
            if (worldState.universe) {
                const facs = worldState.universe.factions.filter(f => f.alive);
                const fac = facs[Math.floor(this.rng(worldState.seed, "fac") * facs.length)];
                agent.faction = fac.name; agent.factionId = fac.id;
                agent.zoneId = fac.zoneId;
                const rivals = facs.filter(f => f.id !== fac.id);
                const rival = rivals[Math.floor(this.rng(worldState.seed, "rivalfac") * rivals.length)];
                if (rival) agent.rivalFacId = rival.id;
                const zoneTxt = agent.zoneId ? `, en ${this.zoneName(worldState.universe, agent.zoneId)}` : "";
                logs.push({ text: `[AFILIACIÓN] Ingresó ${this.aLa(agent.faction)}${zoneTxt}${rival ? `, jurando enemistad contra ${rival.name}` : ""}.`, color: "text-yellow", kind: "intro" });
                // La zona del Host pasa a DETAILED: parte de su masa se materializa en almas con
                // nombre (snapshot → entidades), coherentes con los agregados de la masa.
                this.materializeZone(worldState, agent.zoneId, 3);
                // El acta de zona es ficha, no feed. AFILIACIÓN ya nombra facción y territorio.
            } else {
                agent.faction = storyDict.factions[Math.floor(this.rng(worldState.seed, "fac") * storyDict.factions.length)];
                logs.push({ text: `[AFILIACIÓN] Ingresó ${this.aLa(agent.faction)}.`, color: "text-yellow", kind: "intro" });
            }
        }

        // LÓGICA DE ARQUETIPOS (MECÁNICAS)
        let dmgMult = 1;
        if (meta.plot.id === "PLOT_APOCALYPSE" && year > 0 && year % 10 === 0 && worldState.tick % 360 === 0) {
            logs.push({ text: `[CALAMIDAD] El Escenario de Destrucción ha comenzado. Constelaciones observan.`, color: "text-red", kind: "calamity" });
            dmgMult = 2;
        }
        if (meta.plot.id === "NMS_SENTINEL" && agent.deck.length >= 2 && worldState.tick % 180 === 0 && this.plotOpen(worldState, meta, 8, "C")) {
            logs.push({ text: `[ALERTA CENTINELA] Nivel de tecnología proscrita detectado. Interceptación inminente.`, color: "text-red", kind: "sentinel" });
            agent.hp -= 10;
        }

        const isNewYear = (worldState.tick > 0 && worldState.tick % 360 === 0);

        // VOLUNTAD: regenera +1 por año, tope en el techo innato (capa 1 pura, sin rng nuevo — D2).
        if (isNewYear && agent.hp > 0 && agent.willMax != null) {
            agent.will = Math.min(agent.willMax, (agent.will == null ? agent.willMax : agent.will) + 1);
        }

        // Mundo estático: no hay peldaños F→S que subir. El techo nació con la semilla.

        // C13 DIRECTOR — SEPARADOR DE ACTO: al entrar a una fase distinta del arco (o a un ciclo nuevo), el
        // Sistema anota el cambio de acto. Solo narración (kind:"act_break"); la capa 3 puede pintar un
        // separador. Determinista (la fase es f(semilla,plot,año)); no acumula en el timeline del Cronista
        // (los actos ya SON la estructura — ver siftLifeStory, que corta por esta misma curva).
        if (isNewYear && agent.hp > 0 && year >= 2) {
            const ph = this.storyPhase(worldState.seed, meta.plot.id, year);
            if (!(ph.phase === "intro" && ph.arcIndex === 0)) {
            const key = ph.arcIndex + ":" + ph.phase;
            if (agent.milestones.actKey !== key) {
                agent.milestones.actKey = key;
                agent.milestones.actAnnounced = true;
                const label = this.STORY_PHASE_LABEL[ph.phase] + (ph.arcIndex > 0 ? ` · Ciclo ${ph.arcIndex + 1}` : "");
                logs.push({ text: `[ACTO] ${label}: ${this.STORY_PHASE_FLAVOR[ph.phase]}.`, color: "text-purple", kind: "act_break" });
            }
            }
        }

        // C19 — PRESAGIOS (Parte 10.3, deuda cerrada): "Chéjov hacia adelante" — el mundo anuncia antes
        // de golpear. Se deriva de la MISMA curva del Director (C13): si el año que viene entra en
        // clímax y este todavía no, el Sistema lo anuncia hoy. Puro f(semilla,plot,año) — cero rng
        // nuevo, cero observación (no depende de nada que el espectador haya hecho).
        if (isNewYear && agent.hp > 0 && meta.plot && meta.plot.id != null) {
            const curPh = this.storyPhase(worldState.seed, meta.plot.id, year);
            const nextPh = this.storyPhase(worldState.seed, meta.plot.id, year + 1);
            if (curPh.phase !== "climax" && nextPh.phase === "climax") {
                logs.push({ text: `[PRESAGIO] Algo se acerca: ${this.STORY_PHASE_FLAVOR.climax}. El aire se siente distinto.`, color: "text-yellow", kind: "presagio" });
            }
        }

        // GRADO DE MUNDO por nodo (§6.4 fase 2b, "peso fuerte"): la derivación en vivo del Host —poder
        // enemigo, umbrales de eventos fijos, calidad del botín— se rige por el mult F→S de la ZONA donde
        // está, no por el rango global. Una Frontera de grado alto tiene enemigos brutales y suelta
        // reliquias superiores; un Corazón de grado bajo, lo contrario. `lootQuality` es el ratio respecto
        // al mundo global → =1 (botín idéntico al modelo previo) cuando el grado de la zona coincide con el
        // global (D7); >1 cuando la zona es de grado superior. Si el Host aún no tiene zona, cae al global.
        const zoneMult = this.hostZoneMult(worldState, meta);
        const decreeMods = worldState.decreeMods || { enemyMult: 1, lootMult: 1, essenceMult: 1 }; // D2: neutro si no hay decretos
        const lootQuality = (zoneMult / (meta.tierData.mult || 1)) * this.traitFx(meta).loot * (decreeMods.lootMult || 1);

        // MACRO-TICK DEL UNIVERSO: el mundo avanza un año, exista o no interacción del Host. Sus logs
        // de mundo se interleavan con la vida del Anfitrión — la narrativa deja de ser 100% sobre él.
        if (isNewYear && worldState.universe) {
            this.advanceUniverse(worldState).forEach(l => logs.push(l));
        }

        // ASCENSO: crecimiento innato del Anfitrión al cerrar cada año. Determinista (clase × rango),
        // sin rng. Es la palanca que le permite seguirle el ritmo al escalado garantizado del mundo;
        // el Rango denso forja más rápido (mult del tier), así los mundos hostiles dan más poder a
        // cambio de más peligro, en vez de ser muerte instantánea.
        if (isNewYear) {
            const g = this.classGrowth(agent.class);
            // La forja sigue el mismo ramp que el combate: el novato no nace hecho al techo S.
            const stMult = this.hostGrowthMult(worldState, meta);
            const tierFactor = (1 + stMult * 0.55) * this.traitFx(meta).growth;
            const asc = agent.ascensoMul || 1; // C4: talentos tipo Diligencia/Prodigio aceleran el Ascenso
            const dA = Math.floor(g.atk * tierFactor * asc);
            const dD = Math.floor(g.def * tierFactor * asc);
            const dH = Math.floor(g.hp * tierFactor * asc);
            agent.atk += dA;
            agent.def += dD;
            agent.maxHp += dH;
            agent.hp = Math.min(agent.maxHp, agent.hp + dH);
            // El texto varía por año y por régimen del mundo (§3b): el crecimiento se lee como parte de la
            // simulación viva, no como una frase fija. Fallback al régimen del Host o "conflicto" neutro.
            const ascRegime = (worldState.universe && worldState.universe.regime) || "conflicto";
            const ascPool = this.CFG_DICTIONARY["world_ascension_" + ascRegime] || this.CFG_DICTIONARY.world_ascension_conflicto;
            const ascTpl = this.pickTemplate(worldState.seed, "ascension:y" + year, ascPool);
            logs.push({ text: `[ASCENSO] ${this.fillVars(ascTpl, { name: agent.name, atk: dA, def: dD, hp: dH })}`, color: "text-green", kind: "ascension" });
            // C6: la esencia se acumula por año sobrevivido (más en mundos de rango denso). Es la moneda
            // con que la Cosecha "paga" las cartas al morir — determinista (sin rng), sink de la inflación.
            agent.essence = (agent.essence || 0) + Math.max(1, Math.round(2 * (meta.tierData.mult || 1) * (decreeMods.essenceMult || 1))); // D2: Decreto del Reloj/Legado engordan la Cosecha

            // FASE E — ASENTAMIENTO DECENAL (每十年结算): cada 10 años la vida se liquida en un dividendo
            // de esencia que crece con la década y el poder alcanzado — "cuanto más legendaria la vida,
            // más se extrae". Determinista (sin rng); solo alimenta la moneda de la Cosecha (C6), no toca
            // el combate ni el mundo → cero impacto en balance. Log kind:"settlement" (lo recoge el Cronista).
            if (year > 0 && year % this.SETTLEMENT_INTERVAL === 0) {
                const decade = year / this.SETTLEMENT_INTERVAL;
                const dividend = Math.max(2, Math.round(decade * (2 + agent.atk / 50) * (meta.tierData.mult || 1) * (decreeMods.essenceMult || 1)));
                agent.essence += dividend;
                logs.push({ text: `[ASENTAMIENTO] ${agent.name} liquidó su ${decade}ª década de vida: el Sistema condensó ${dividend} de esencia extraíble.`, color: "text-gold", kind: "settlement" });
            }
        }

        // ANHELO en la rama: el Host envejece (su edad viene del alma de origen, no de cero) y su
        // anhelo heredado se sigue saldando con el MISMO evaluador que usa la base — lectura pura del
        // estado del año, sin rng (D2). El cumplimiento entra a la crónica etiquetado con su alma:
        // la rama le devuelve historia a la biografía que leyó.
        if (isNewYear) {
            agent.age = (agent.age || 16) + 1;
            if (agent.desire && !agent.desire.fulfilled && worldState.universe) {
                const being = { desire: agent.desire, factionId: agent.factionId, power: agent.atk, age: agent.age };
                if (this.desireFulfilled(worldState.universe, being, year)) {
                    agent.desire.fulfilled = true;
                    agent.desire.year = year;
                    logs.push({ text: `[ANHELO CUMPLIDO] ${agent.desire.text} — el norte de ${agent.name} se hizo mundo.`, color: "text-yellow", kind: "desire" });
                    const entry = { year: year, kind: "anhelo", text: `${agent.name} cumplió el anhelo de su vida: ${agent.desire.text}.` };
                    if (agent.originSoulId) entry.soulId = agent.originSoulId;
                    worldState.universe.chronicle.push(entry);
                }
            }

            // MORTALIDAD NATURAL (mundo-primero, audit C15 de la rama hermana): sin esto el Host a
            // poder alto era INMORTAL (medido: 1666 años sin morir) y la historia jamás cerraba (F7).
            // La base mata a sus notables por edad; el Host es un alma más — pero OJO con copiar la
            // constante literal: en la base `chanceOf` alimenta un toll ESTADÍSTICO que ejecuta a
            // los más viejos primero (un alma joven casi nunca cae). Aplicada como roll individual
            // anual mataba "de viejo" a los 25 (medido). Ley individual calibrada: hazard 0 hasta la
            // madurez (30), rampa (edad-30)/260, tier suave (×0.0015) — calibrada para convivir con el criterio T-C13 (clímax ≥ 2× valle) del Director, peligro de zona cap 1.2.
            // Roll propio keyeado (D2). La longevidad (60 inviernos) queda como LOGRO, no default.
            if (agent.hp > 0 && worldState.universe) {
                const mZone = (worldState.universe.zones || []).find(z => z.id === agent.zoneId);
                const mDanger = mZone ? Math.min(mZone.danger, 1.2) : 1;
                // La muerte natural respeta la dramaturgia (C13): el ocaso llega en los RESPIROS de
                // la curva, no a mitad del clímax — el Director también coloca la muerte (mismo
                // principio del diseño: los eventos caen según la curva). f(semilla), D2 intacto.
                const mSi = (meta.plot && meta.plot.id != null) ? this.storyIntensity(worldState.seed, meta.plot.id, year) : 0.5;
                // C8 LONGEVIDAD (寿元): el techo de años del alma (derivado de la constitución 根骨, y
                // extensible por hitos) desplaza la curva. onset = ls·0.5, divisor = ls·(260/60): en
                // ls=60 (constitución 50) REPRODUCE exactamente la fórmula anterior (onset 30, div 260);
                // más constitución → ocaso más tarde y rampa más lenta; menos → vida más corta.
                const ls = agent.lifespan || 60;
                const mChance = Math.min(0.85, ((Math.max(0, agent.age - ls * 0.5) / (ls * (260 / 60))) + (meta.tierData.mult * 0.0015)) * mDanger * (1 - 0.6 * mSi));
                if (mChance > 0 && this.rng(worldState.seed, "host:mortality:y" + year) < mChance) {
                    agent.hp = 0;
                    logs.push({ text: `[OCASO] El cuerpo de ${agent.name} dijo basta a los ${agent.age} años de edad. Ni el poder compra más inviernos.`, color: "text-muted", kind: "death" });
                }
            }
        }

        // FASE A1 — TRAVERSÍA EN VIVO (cablea la Fase 8, antes motor muerto): si el Host trajo CAPACIDAD
        // de viaje en su MAZO EQUIPADO (una carta MONTURA/VEHÍCULO con `capabilities`) Y hay MOTIVO
        // (deriveMotivo lee el estado ya decidido del mundo/Host), una vez al año puede REUBICARSE de
        // verdad entre las ciudades del mundo — el caballo/nave por fin se usan. El destino lo dicta el
        // motivo: HUIR busca la zona más segura; BUSCAR/MISIÓN, la más próspera. Transición
        // DETAILED↔ABSTRACT real (dissolve/materialize), idéntica a la Bifurcación, y corre ANTES del
        // social/encuentros del año para que esos ocurran ya en la zona de destino (coherencia de escena).
        // Determinista: gate por rng keyeado por año (D2), destino por criterio puro.
        //
        // La capacidad se lee del MAZO EQUIPADO (`agent.deck`), NO de las cartas descubiertas al vuelo:
        // viajás con el vehículo que decidiste llevar. Esto mantiene byte-idénticas las corridas sin
        // montura equipada (el gate rng ni se consulta si no hay capacidad → cero corrimiento de stream,
        // cero impacto en balance/determinismo previos). Que un HALLAZGO de montura habilite mudarse es
        // refinamiento futuro (mismo criterio "motor/caso antes que alcance total" de la propia Fase 8).
        // El Admin (§0-bis) no pasa por acá — la Sala de Despliegue reubica sin este gate, a propósito.
        if (isNewYear && agent.hp > 0 && worldState.universe && (worldState.universe.zones || []).length > 1) {
            const canTravel = this.puedeViajar({ deck: agent.deck, discoveredCards: [] }, "CIUDAD");
            const motivo = canTravel ? this.deriveMotivo(worldState, meta) : null;
            if (canTravel && motivo && this.rng(worldState.seed, "travel:gate:y" + year) < 0.5) {
                const u = worldState.universe;
                const others = u.zones.filter(z => z.id !== agent.zoneId);
                const dest = (motivo.type === "huir")
                    ? others.slice().sort((a, b) => a.danger - b.danger)[0]
                    : others.slice().sort((a, b) => b.wealth - a.wealth)[0];
                if (dest && dest.id !== agent.zoneId) {
                    const fromName = this.zoneName(u, agent.zoneId);
                    this.dissolveZone(worldState, agent.zoneId);
                    agent.zoneId = dest.id;
                    this.materializeZone(worldState, dest.id, 3);
                    logs.push({ text: `[TRAVESÍA] Con montura y por ${motivo.reason}, ${agent.name} dejó ${fromName} y puso rumbo a ${dest.name}.`, color: "text-cyan", kind: "travel" });
                    const zoneLog = this.describeZone(worldState, dest.id);
                    if (zoneLog) logs.push(zoneLog);
                }
            }
        }

        // C12 NÉMESIS: si el Host ya tiene una némesis designada (`promoteNemesis`, por escalada real —
        // ver C11/vínculos), sus cruces se colocan en los PICOS del Director de tensión (C13), no al
        // azar parejo — investigado contra el Nemesis System (Shadow of Mordor/War, GDC 2018): la
        // némesis CRECE al enfrentar al Host y cada cruce cita el año en que emergió. Sustituye al
        // social fino genérico ese año (un solo evento social por año, mismo criterio que hilos/奇遇).
        // Sin némesis promovida (todo run hasta hoy), `agent.nemesisId` es undefined y este bloque no
        // consulta rng nuevo — D2/D3 intactos para cualquier corrida sin esta escalada.
        let nemesisFired = false;
        if (isNewYear && agent.hp > 0 && agent.nemesisId && worldState.universe) {
            const npc = worldState.universe.population.find(p => p.id === agent.nemesisId);
            const si = (meta.plot && meta.plot.id != null) ? this.storyIntensity(worldState.seed, meta.plot.id, year) : 0.5;
            if (npc && npc.alive && si >= 0.45 && this.rng(worldState.seed, "nemesis:cruce:y" + year) < 0.5) {
                nemesisFired = true;
                npc.power += Math.max(1, Math.floor(2 + si * 4));
                const duelRoll = 0.75 + this.rng(worldState.seed, "nemesis:duel:y" + year) * 0.5;
                if (agent.atk * duelRoll >= npc.power) {
                    if (npc.power <= 20) {
                        const bifurcYear = this.DECISION_YEARS[meta.plot.id] || this.DECISION_YEARS["DEFAULT"];
                        if (year !== bifurcYear || agent.milestones.decisionMade) {
                            worldState.waitingForDecision = true;
                            worldState.pendingDecision = {
                                type: "duel", npcId: npc.id,
                                options: [
                                    { id: "duel_execute", label: "Ejecutarlo", desc: "Termina con tu némesis para siempre: +3 ATK, y el ciclo se cierra por sangre." },
                                    { id: "duel_spare", label: "Perdonarlo", desc: "Le perdonás la vida a tu némesis: se vuelve tu aliado más leal (+10 de poder para tu facción)." }
                                ]
                            };
                            logs.push({ text: `[NÉMESIS] ${agent.name} redujo a ${npc.name} —su némesis desde el año ${agent.nemesisSince}— y lo tiene a su merced. El Sistema aguarda el juicio.`, color: "text-purple", kind: "social" });
                            flushStory();
                            return { logs: logs, stopped: true, waitingForDecision: true };
                        }
                        agent.atk += 3;
                        npc.power = Math.max(5, Math.floor(npc.power * 0.5));
                        logs.push({ text: `[NÉMESIS] ${agent.name} venció a ${npc.name}, que escapó jurando volver (+3 ATK).`, color: "text-cyan", kind: "social" });
                    } else {
                        agent.atk += 3;
                        npc.power = Math.max(1, npc.power - 20);
                        logs.push({ text: `[NÉMESIS] ${agent.name} humilló de nuevo a ${npc.name} en un cruce que ambos esperaban (+3 ATK).`, color: "text-cyan", kind: "social" });
                    }
                } else {
                    const dmg = Math.floor(Math.min(Math.max(8, npc.power * 0.5), agent.maxHp * 0.35));
                    agent.hp -= dmg;
                    this.recordBond(agent, npc, "duel_lost", -8, year);
                    logs.push({ text: `[NÉMESIS] ${npc.name} volvió a vencer a ${agent.name} (-${dmg} HP). El rencor entre ambos sigue creciendo.`, color: "text-red", kind: "social" });
                }
            }
        }

        // SOCIAL FINO (Parte 5 del doc maestro: solo en la zona DETAILED del Host). Una vez por año,
        // el Host puede cruzarse con un habitante REAL de su territorio: entrena con los de su
        // facción, se bate a duelo con la rival, o comparte camino con un neutral. El cast de zonas
        // ABSTRACT vive de fondo y NUNCA produce vínculos finos a distancia — la convivencia la
        // cuenta el simulador; el encuentro pasa en la escena. rng keyeado por año (Invariante D2).
        if (isNewYear && !nemesisFired && worldState.universe && agent.factionId && agent.zoneId && agent.hp > 0) {
            const univ = worldState.universe;
            const locals = this.zoneOthers({ universe: univ }, agent);
            if (locals.length > 0 && this.rng(worldState.seed, "social:y" + year) < 0.5) {
                const npc = locals[Math.floor(this.rng(worldState.seed, "social:pick:y" + year) * locals.length)];
                // Deuda de vida: un rival perdonado por el Admin trata al Host como aliado para siempre.
                if (npc.factionId === agent.factionId || npc.lifeDebt) {
                    const gain = Math.max(1, Math.floor(npc.power / 25));
                    agent.def += gain;
                    npc.power += 2;
                    const motivo = npc.lifeDebt ? `${npc.name}, que le debe la vida,` : `${npc.name}, de su misma facción.`;
                    this.recordBond(agent, npc, "training", gain, year);
                    logs.push({ text: `[VÍNCULO] ${agent.name} entrenó junto a ${motivo} Ambos salieron templados (+${gain} DEF).`, color: "text-green", kind: "social" });
                } else if (npc.factionId === agent.rivalFacId) {
                    // Vendetta acumulativa (grafo, no flag único): CADA ejecución de un campeón de esta
                    // facción cuenta — no solo la más reciente. El poder del retador pesa +25% si hay
                    // AL MENOS una vendetta viva contra su facción.
                    const effPower = npc.power * ((agent.vendettas && agent.vendettas[npc.factionId]) ? 1.25 : 1);
                    const duelRoll = 0.75 + this.rng(worldState.seed, "social:duel:y" + year) * 0.5;
                    if (agent.atk * duelRoll >= effPower) {
                        if (npc.power <= 15) {
                            // GOLPE LETAL → JUICIO DEL ADMINISTRADOR (capa 2): el auto-run pausa y
                            // el espectador decide el destino del vencido. Nada se tira al azar acá;
                            // la elección entra por applyAction y queda en choiceLog (D3). No se
                            // dispara en el año de la Bifurcación para no pisar esa pausa.
                            const bifurcYear = this.DECISION_YEARS[meta.plot.id] || this.DECISION_YEARS["DEFAULT"];
                            if (year !== bifurcYear || agent.milestones.decisionMade) {
                                worldState.waitingForDecision = true;
                                worldState.pendingDecision = {
                                    type: "duel",
                                    npcId: npc.id,
                                    options: [
                                        { id: "duel_execute", label: "Ejecutarlo", desc: "El trofeo y el miedo: +3 ATK, la facción rival pierde 15 de poder... y jura venganza (sus retadores futuros pegan +25%)." },
                                        { id: "duel_spare", label: "Perdonarlo", desc: "La deuda de vida: el vencido se vuelve aliado permanente del Anfitrión y el gesto honra a su facción (+10 de poder)." }
                                    ]
                                };
                                logs.push({ text: `[DUELO] ${agent.name} redujo a ${npc.name} y lo tiene a su merced. El Sistema aguarda el juicio del Administrador.`, color: "text-purple", kind: "social" });
                                flushStory();
                                return { logs: logs, stopped: true, waitingForDecision: true };
                            }
                            // Año de Bifurcación: victoria sin remate, el rival escapa malherido.
                            agent.atk += 2;
                            npc.power = 1;
                            this.recordBond(agent, npc, "duel_won", -5, year);
                            logs.push({ text: `[DUELO] ${agent.name} venció a ${npc.name}, que escapó arrastrándose (+2 ATK).`, color: "text-cyan", kind: "social" });
                        } else {
                            agent.atk += 2;
                            npc.power = Math.max(1, npc.power - 15);
                            this.recordBond(agent, npc, "duel_won", -5, year);
                            logs.push({ text: `[DUELO] ${agent.name} humilló a ${npc.name}, de la facción rival, y le arrebató su técnica (+2 ATK).`, color: "text-cyan", kind: "social" });
                        }
                    } else {
                        const dmg = Math.floor(Math.min(Math.max(5, effPower * 0.6), agent.maxHp * 0.3));
                        agent.hp -= dmg;
                        npc.power += 5;
                        const hasVendetta = agent.vendettas && agent.vendettas[npc.factionId];
                        const venganza = hasVendetta ? " La vendetta cobra su precio." : "";
                        const bond = this.recordBond(agent, npc, "duel_lost", -8, year);
                        logs.push({ text: `[DUELO] ${npc.name}, de la facción rival, acorraló a ${agent.name} y lo dejó malherido (-${dmg} HP).${venganza}`, color: "text-red", kind: "social" });
                        // C12: dos derrotas del Host a manos del MISMO rival es la escalada diegética que
                        // promueve a némesis (diseño: "duelo perdido dos veces contra el mismo").
                        if (bond.history.filter(h => h.kind === "duel_lost").length >= 2) {
                            const promo = this.promoteNemesis(agent, npc, year);
                            if (promo) logs.push(promo);
                        }
                    }
                } else {
                    const heal = Math.floor(agent.maxHp * 0.08);
                    agent.hp = Math.min(agent.maxHp, agent.hp + heal);
                    npc.power += 1;
                    this.recordBond(agent, npc, "encounter", 3, year);
                    logs.push({ text: `[ENCUENTRO] ${agent.name} compartió el camino con ${npc.name}. Historias y provisiones cambiaron de manos (+${heal} HP).`, color: "text-white", kind: "social" });
                }
            }
        }

        // C11 HILOS CAUSALES: antes de tirar un 奇遇 nuevo, se consultan los hilos abiertos (traiciones/
        // maestros con un alma real detrás) — si uno paga este año, ES el evento del año (no se tira 奇遇
        // encima, mismo criterio que "un solo suceso narrativo por año"). Capa 1, D2 (rng keyeado por
        // hilo+año, sin observación).
        if (isNewYear && agent.hp > 0) {
            const threadLog = this.checkThreadPayoffs(worldState, agent, year);
            if (threadLog) logs.push(threadLog);
        }

        // C3 奇遇 / ENCUENTROS (Parte 10.3): una tirada de evento de vida por año — hallazgo, maestro,
        // legado, tesoro, traición o plaga. Capa 1 determinista (rng por semilla+año), auto-resuelto. Si
        // una calamidad deja al Host en HP<=0, el chequeo de muerte al final de runTicks lo cierra.
        if (isNewYear && agent.hp > 0 && !logs.some(l => l.kind === "thread_payoff")) {
            const enc = this.applyLifeEncounter(worldState, agent, meta, year, zoneMult, lootQuality);
            if (enc) logs.push(enc);
        }

        // DOMINIO TERRITORIAL (política de zona → vida del Host): vivir bajo el estandarte propio
        // da orden y protección (cura anual); vivir en tierra regida por la facción rival es
        // hostigamiento constante. Tierra de nadie o regente neutral: sin efecto. Aritmética pura
        // sobre el estado político que mantiene advanceUniverse — sin rng.
        if (isNewYear && worldState.universe && agent.zoneId && agent.hp > 0) {
            const zone = (worldState.universe.zones || []).find(z => z.id === agent.zoneId);
            if (zone && zone.rulerFacId) {
                if (zone.rulerFacId === agent.factionId && agent.hp < agent.maxHp) {
                    const heal = Math.floor(agent.maxHp * 0.05);
                    agent.hp = Math.min(agent.maxHp, agent.hp + heal);
                    logs.push({ text: `[DOMINIO] ${this.zoneName(worldState.universe, agent.zoneId)} quedó bajo el estandarte de su facción: orden, refugio y sanadores (+${heal} HP).`, color: "text-green", kind: "politics" });
                } else if (zone.rulerFacId === agent.rivalFacId) {
                    const dmg = Math.floor(agent.maxHp * 0.05);
                    agent.hp -= dmg;
                    logs.push({ text: `[DOMINIO] La facción rival rige ${this.zoneName(worldState.universe, agent.zoneId)}: patrullas, recompensas por su cabeza, puertas cerradas (-${dmg} HP).`, color: "text-red", kind: "politics" });
                }
            }
        }

        // RADIO DE IMPACTO (Ladrillo 4, §1-bis): el alcance del Host crece con su poder. Cuando cambia de
        // escala se narra el ascenso; cuando alcanza el cosmos (leyenda), su gesta cruza el vacío y TOCA un
        // nodo hermano — un diff REAL del agente sobre el fondo lejano (impacto legítimo, no observación:
        // no viola D6). Modula la riqueza del nodo tocado y deja su nombre grabado allí. Cadencia de 2 años
        // para no saturar. Reproducible: la escala sale del poder del Host (f(semilla, choiceLog)).
        if (isNewYear && agent.hp > 0 && worldState.universe) {
            const reach = this.impactReach(worldState, meta);
            if (reach !== (agent.reach || 0)) {
                const scales = ["su territorio", "su continente", "su planeta", "el vacío entre los mundos"];
                if (reach > (agent.reach || 0)) logs.push({ text: `[ASCENSO] La influencia de ${agent.name} ahora alcanza ${scales[reach]}.`, color: "text-purple", kind: "world" });
                agent.reach = reach;
            }
            const cosmos = worldState.universe.cosmos;
            if (reach >= 3 && cosmos && worldState.tick % 720 === 0) {
                const sibs = [...(cosmos.otherPlanets || []), ...(cosmos.otherContinents || [])];
                if (sibs.length) {
                    const node = sibs[Math.floor(this.rng(worldState.seed, `reach:${worldState.tick}`) * sibs.length)];
                    node.wealth = Math.min(100, node.wealth + 3);
                    node.influencedBy = agent.name;
                    logs.push({ text: `[LEYENDA] La gesta de ${agent.name} cruzó el vacío: en ${node.name} ya se pronuncia su nombre.`, color: "text-cyan", kind: "world" });
                    worldState.universe.chronicle.push({ year: year, kind: "legend", text: `La leyenda de ${agent.name} alcanzó ${node.name}, ${node.grade || "un mundo lejano"}.` });

                    // FASE A2 — BRANCHING EN VIVO (cablea la Fase 9, antes derivación muerta): al abrir el
                    // Host un nodo lejano con su leyenda, se DERIVA en cuántos dominios se ramifica ese nodo
                    // — `deriveFanout(node, semilla, régimen, recursos)` (§10.2/D8), la misma cifra que usaría
                    // `splitNode` si se expandiera el árbol. Es una LECTURA derivada (no muta el cosmos plano
                    // que T19 verifica O(nodos)): narra la estructura latente del nodo, determinista por
                    // semilla+régimen+recursos. La expansión LOD real del árbol en vivo queda como trabajo
                    // futuro (pelea con el diseño plano del fondo cósmico, a propósito).
                    const kids = this.deriveFanout(node, worldState.seed, meta, { regime: worldState.universe.regime });
                    logs.push({ text: `[RAMIFICACIÓN] Bajo la sombra de ${agent.name}, ${node.name} se revela partido en ${kids} ${kids === 1 ? "dominio" : "dominios"} en pugna.`, color: "text-cyan", kind: "branch" });
                    worldState.universe.chronicle.push({ year: year, kind: "branch", text: `${node.name} se fracturó en ${kids} ${kids === 1 ? "dominio" : "dominios"} bajo la influencia de ${agent.name} (régimen: ${this.REGIMES[worldState.universe.regime] ? this.REGIMES[worldState.universe.regime].label : worldState.universe.regime}).` });
                }
            }
        }

        // MECÁNICAS DE TRAMA (identidad por arquetipo). Antes solo APOCALYPSE y SENTINEL alteraban el
        // tick; las otras corrían el director genérico sin diferencia. Cada una lleva su `kind`; son
        // ligeras y deterministas (la única fuente de azar es rng(seed,·) del portal de exploración).
        const tierMult = zoneMult;
        if (meta.plot.id === "PLOT_PLAYERS" && isNewYear && year >= 1) {
            const keys = Object.keys(this.WORLD_TIERS);
            const worldCanHost = keys.indexOf(meta.tierId) >= keys.indexOf("B");
            const forasteros = worldCanHost && this.plotOpen(worldState, meta, 8, "B");
            if (forasteros && agent.atk >= Math.floor(60 * tierMult)) {
                agent.atk += 3;
                logs.push({ text: `[INVASIÓN] ${agent.name} emboscó a un escuadrón de forasteros y saqueó su poder. +3 ATK.`, color: "text-cyan", kind: "invasion" });
            } else if (forasteros) {
                const dmg = Math.floor(Math.min(12 * tierMult, agent.maxHp * this.hostHitCap(year)));
                agent.hp -= dmg;
                logs.push({ text: `[INVASIÓN] Forasteros de otro hilo cayeron sobre la zona. ${agent.name} soportó el asalto (-${dmg} HP).`, color: "text-red", kind: "invasion" });
            } else {
                const dmg = Math.floor(Math.min(6, agent.maxHp * 0.12));
                agent.hp -= dmg;
                logs.push({ text: `[HOSTIGAMIENTO] ${this.lowRaidText(meta.era, agent.name)} (-${dmg} HP).`, color: "text-yellow", kind: "ambush" });
            }
        }
        if (meta.plot.id === "PLOT_REGRESSION" && isNewYear && year % 5 === 0) {
            agent.atk += 5; agent.def += 5;
            logs.push({ text: `[BUCLE] Memorias de una línea temporal colapsada se filtran. ${agent.name} recuerda cómo pelear: +5 ATK, +5 DEF.`, color: "text-purple", kind: "regression" });
        }
        if (meta.plot.id === "NMS_EXPLORATION" && year >= 1 && worldState.tick % 180 === 0) {
            const card = this.drawCard(worldState.seed, `portal:${worldState.tick}`, meta, worldState.tick, lootQuality, worldState.universe && worldState.universe.regime, agent);
            this.discoverCard(agent, card);
            logs.push({ text: `[PORTAL] Un portal fractal se abrió al Atlas Infinito. ${agent.name} recuperó una anomalía: ${card.name}.`, color: "text-cyan", kind: "portal" });
        }
        if (meta.plot.id === "NMS_ANOMALY" && isNewYear) {
            const stMul = (this.WORLD_TIERS[this.hostStratum(worldState, meta)] || {}).mult || 1;
            const drain = Math.floor(year * 1.5 * stMul);
            if (drain > 0) {
                agent.hp -= drain;
                logs.push({ text: `[VACÍO] La Desviación se ensancha. La realidad se deshilacha alrededor de ${agent.name} (-${drain} HP).`, color: "text-red", kind: "anomaly" });
            }
        }

        // PUNTO DE BIFURCACIÓN: una vez por corrida, año fijo por trama. Pausa el auto-run y espera
        // la elección del Admin (Engine.resolveDecision) — no avanza nada más este tick.
        const decisionYear = this.DECISION_YEARS[meta.plot.id] || this.DECISION_YEARS["DEFAULT"];
        if (isNewYear && year === decisionYear && !agent.milestones.decisionMade) {
            worldState.waitingForDecision = true;
            worldState.pendingDecision = { options: this.DECISION_OPTIONS };
            logs.push({ text: `[BIFURCACIÓN] El destino de ${agent.name} exige una decisión.`, color: "text-purple", kind: "decision" });
            flushStory();
            return { logs: logs, stopped: true, waitingForDecision: true };
        }

        // EVENTOS FIJOS / PUNTOS DE INFLEXIÓN: checks narrativos guionados en años exactos (10/20/30
        // según trama). Si el año trae uno, reemplaza al director procedimental de ese tick (no se
        // tiran ambos a la vez). Desde la fusión acotada del prototipo Grok (v1.45.0, ver
        // docs/handoff-fusion-voluntad-v1.45.0.md): en vez de resolverse solo, PAUSA el auto-run y
        // ofrece al Admin la chance de intervenir con Voluntad antes de que el check se resuelva —
        // mismo patrón que Bifurcación (pendingDecision/waitingForDecision), mismo D1/D3. La
        // resolución real vive en Engine.resolveInflexion.
        const plotEvents = this.FIXED_EVENTS[meta.plot.id] || this.FIXED_EVENTS["DEFAULT"];
        const fixedEvent = isNewYear ? plotEvents[year] : null;
        const inflexionKey = "inflexion_" + year;
        if (fixedEvent && !agent.milestones[inflexionKey]) {
            agent.milestones[inflexionKey] = true;
            const reqValue = Math.floor(fixedEvent.baseReq * zoneMult);
            worldState.waitingForDecision = true;
            worldState.pendingDecision = {
                type: "inflexion", year: year, stat: fixedEvent.stat,
                reqValue: reqValue, playerStat: agent[fixedEvent.stat],
                options: [
                    { id: "accept", label: "Aceptar el juicio" },
                    { id: "reject", label: "Rechazar (segunda oportunidad)", cost: this.INFLEXION_COST.reject },
                    { id: "force", label: "Forzar el destino (éxito asegurado)", cost: this.INFLEXION_COST.force }
                ]
            };
            logs.push({ text: `[PUNTO DE INFLEXIÓN] El destino de ${agent.name} pende de un juicio (${fixedEvent.stat.toUpperCase()}: ${agent[fixedEvent.stat]}/${reqValue}).`, color: "text-purple", kind: "decision" });
            flushStory();
            return { logs: logs, stopped: true, waitingForDecision: true };
        }
        // DIRECTOR NARRATIVO PROCEDIMENTAL
        // El `kind` semántico decide animaciones en la capa de UI (nunca el texto o el color,
        // que son presentación y pueden cambiar de plantilla sin aviso).
        else if (worldState.tick % 120 === 0 && year >= 1) {
            const eventRoll = this.rng(worldState.seed, `event_type:${worldState.tick}`);

            // C13 DIRECTOR: la intensidad del año inclina el reparto — el clímax empuja combate (la hora
            // peligrosa); el respiro/preludio empuja descanso. Umbrales deterministas (f(semilla,plot,año)),
            // el mismo `eventRoll` corre contra ventanas movidas (mismo principio que la Fortuna en el gate).
            const siDir = this.storyIntensity(worldState.seed, meta.plot.id, year);
            const regimeNow = worldState.universe && worldState.universe.regime;
            const peace = regimeNow === "pacifico" || regimeNow === "prosperidad" || regimeNow === "despertar";
            const dangerBias = Math.max(0, Math.min(0.22, (this.hostZoneMult(worldState, meta) - 1) * 0.04));
            const combatThresh = peace
                ? Math.min(0.22, Math.max(0.06, 0.12 + (siDir - 0.5) * 0.12))
                : Math.min(0.70, Math.max(0.24, 0.4 + (siDir - 0.5) * 0.3 + dangerBias));
            const exploreThresh = combatThresh + 0.3;

            if (eventRoll < combatThresh) {
                // Rival del mismo techo: crece ~al ritmo de un mercenario de esa zona.
                // win% ≈ 0.5 × ATK/enemigo. F pez gordo, D partida, S forja letal.
                let rawPower = (15 + (year * 10) + (year * year * 0.12)) * meta.planetLuck * dmgMult;
                let enemyPower = Math.floor(rawPower * this.hostCombatMult(worldState, meta) * (decreeMods.enemyMult || 1));

                const winChance = Math.min(0.9, Math.max(0.1, (agent.atk / (enemyPower || 1)) * 0.5));
                const winRoll = this.rng(worldState.seed, `win:${worldState.tick}`);

                if (winRoll < winChance) {
                    const foe = this.pickFoe(worldState, agent, "foe:" + worldState.tick);
                    const storyTextWin = worldState.universe
                        ? this.composeCombat(worldState, agent, { win: true, foe: foe, enemyPower: enemyPower })
                        : this.expandGrammar("story_combat_win", worldState.seed, worldState.tick, agent, meta);
                    logs.push({ text: `[ACCIÓN] ${storyTextWin}`, color: "text-green", kind: "combat_win" });

                    if(this.rng(worldState.seed, `drop:${worldState.tick}`) < 0.5) {
                        let card = this.drawCard(worldState.seed, `loot:${worldState.tick}`, meta, worldState.tick, lootQuality, worldState.universe && worldState.universe.regime, agent);
                        if (meta.plot.id === "PLOT_MADNESS" && card.rarity === "SSR") {
                            logs.push({ text: `[SUSURROS] El abismo desgarró su mente al asimilar [${card.name}].`, color: "text-red", kind: "corruption" });
                            agent.hp -= 20;
                        } else {
                            logs.push({ text: `[BOTÍN] El Sistema extrajo una anomalía del campo de batalla: ${card.name}.`, color: "text-cyan", kind: "loot" });
                        }
                        this.discoverCard(agent, card);
                    }
                } else {
                    // El golpe de derrota se topa al 55% del HP máximo: un combate perdido hiere de
                    // gravedad pero no borra al Host de un tiro (antes, en Rango alto, enemyPower·1.5
                    // era un one-shot en el año 0-1). Así la muerte por combate es desgaste sostenido
                    // —dos golpes seguidos sin curar sí matan— y la DEF acumulada por Ascenso pesa.
                    const rawDamage = Math.max(6, (enemyPower * 1.25) - (agent.def * 0.4));
                    const damageTaken = Math.floor(Math.min(rawDamage, agent.maxHp * this.hostHitCap(year)));
                    const foe = this.pickFoe(worldState, agent, "foe:" + worldState.tick);
                    const storyTextLose = worldState.universe
                        ? this.composeCombat(worldState, agent, { win: false, foe: foe, damage: damageTaken })
                        : this.expandGrammar("story_combat_lose", worldState.seed, worldState.tick, agent, meta);
                    logs.push({ text: `[PELIGRO] ${storyTextLose}`, color: "text-yellow", kind: "ambush" });
                    agent.hp -= damageTaken;
                }
            }
            else if (eventRoll < exploreThresh) {
                const storyTextExp = worldState.universe
                    ? this.composeExplore(worldState, agent, "exp:" + worldState.tick)
                    : this.expandGrammar("story_exploration", worldState.seed, worldState.tick, agent, meta);
                logs.push({ text: `[MUNDO] ${storyTextExp}`, color: "text-white", kind: "exploration" });
            }
            else {
                const zone = (worldState.universe && agent.zoneId) ? this.zoneName(worldState.universe, agent.zoneId) : "su territorio";
                const storyTextDown = worldState.universe
                    ? this.polishEs(agent.name + " pasó el año en " + zone + (agent.bond ? (", junto a " + agent.bond) : "") + ".")
                    : this.expandGrammar("story_downtime", worldState.seed, worldState.tick, agent, meta);
                logs.push({ text: `[TRAMA] ${storyTextDown}`, color: "text-muted", kind: "downtime" });
                // El regen exige hp > 0: un muerto no descansa — sin la guarda, el descanso REVIVÍA
                // al Host caído por mortalidad natural en el mismo año (audit C15, dos [OCASO]).
                if (agent.hp > 0 && agent.hp < agent.maxHp) agent.hp = Math.min(agent.maxHp, agent.hp + Math.floor(agent.maxHp * 0.1));
            }
        }

        if (agent.hp <= 0 && !worldState.waitingForChoice) {
            worldState.waitingForChoice = true;
            logs.push({ text: `[FIN] El hilo del destino se rompió. La historia de [${meta.hostRole}] termina aquí.`, color: "text-red", kind: "death" });

            // La muerte salda el anhelo heredado — el cierre recontextualiza la corrida (F7 del
            // diseño historia-completa): no es solo un corte, dice de qué trató esta vida.
            const anheloClause = agent.desire ? ` Murió con su anhelo ${agent.desire.fulfilled ? `cumplido (año ${agent.desire.year})` : "trunco"}: ${agent.desire.text}.` : "";
            if (agent.desire) {
                logs.push({ text: `[ANHELO]${anheloClause}`, color: agent.desire.fulfilled ? "text-green" : "text-muted", kind: "desire" });
            }

            // El mundo sobrevive al Host: su caída queda anotada en la crónica del universo (con su
            // alma etiquetada — la biografía que la rama leyó ahora tiene final), que sigue
            // existiendo aunque esta línea de vida termine.
            if (worldState.universe) {
                const entry = { year: year, kind: "host_death", text: `${agent.name}, de ${agent.faction || "ninguna facción"}, cayó tras ${year} años.${anheloClause} El universo prosigue sin él.` };
                if (agent.originSoulId) entry.soulId = agent.originSoulId;
                worldState.universe.chronicle.push(entry);
            }
        }

        flushStory();
        return { logs: logs, stopped: worldState.waitingForChoice };
    },

    // PRESCIENCIA / C7 (Parte 10.3 del doc maestro): "Vislumbre del Destino". Corre la vida ENTERA de
    // forma determinista sobre un clon DESECHABLE del mundo (NO toca el estado vivo ni su choiceLog) y
    // devuelve la línea temporal de hitos hasta la muerte. Es f(semilla, mazo, política): la vislumbre
    // NO miente — un run real que siga la misma política reproduce esta línea (D2/D3, verificado T30).
    // Política por defecto: la PRIMERA senda (`options[0]`) de cada Bifurcación/Juicio — determinista,
    // sin rng nuevo. Es una PROYECCIÓN de solo lectura (capa 1 derivada → la capa 3 la muestra):
    // observarla no cambia el mundo (Parte 0 / regla de fidelidad Parte 10.6). El jugador que luego
    // elija OTRA senda diverge del hilo previsto — la presciencia vale hasta el punto en que interviene.
    FORESIGHT_NOTABLE: ["intro", "calamity", "world", "death", "decision", "social", "encounter", "desire", "act_break", "thread_payoff", "presagio"],

    // C20-d — EL CREADOR CON PRESUPUESTO (Parte 10.3, deuda cerrada): point-buy sobre una base neutra.
    // Principio del Interruptor (`gaia.md` §0.3, "todo límite arranca OFF"): `CHARGEN_BUDGET_ON` en
    // false por defecto — el Admin diseña libre, sin costo. Se prende para juego balanceado (chargen
    // con costo real). `chargenCost` es pura, sin rng: solo aritmética sobre la diferencia a la base.
    CHARGEN_BUDGET_ON: false,
    CHARGEN_BASE: { power: 20, constitution: 50, insight: 50 },
    CHARGEN_STAT_COST: { power: 1, constitution: 2, insight: 2 },
    CHARGEN_BUDGET: 40,
    chargenCost: function(build) {
        let cost = 0;
        Object.keys(this.CHARGEN_STAT_COST).forEach(k => {
            const base = this.CHARGEN_BASE[k] || 0;
            const val = (build && build[k] != null) ? build[k] : base;
            cost += Math.max(0, val - base) * this.CHARGEN_STAT_COST[k];
        });
        return cost;
    },

    // FASE C — presupuesto de Vislumbre táctica por corrida (cierra F3). 2 cargas: en una Bifurcación de
    // 3 sendas alcanza para explorar 2 y obliga a elegir a ciegas la tercera (o a guardar la carga para el
    // Juicio de duelo). Ración deliberada — la información de futuro cuesta y hay que administrarla.
    FORESIGHT_BUDGET: 2,

    // Gasta una carga de Vislumbre táctica si queda alguna. Devuelve true si se pudo (y descuenta), false
    // si el Host se quedó sin presciencia (la rama queda en niebla). Pura salvo el descuento; sin pasar por
    // choiceLog porque NO cambia el mundo simulado (es una economía de información del espectador, no una
    // entrada que altere f(semilla, choiceLog)). Init en la acción `start` (FORESIGHT_BUDGET por corrida).
    spendForesight: function(worldState) {
        if (!worldState) return false;
        if ((worldState.foresightCharges || 0) <= 0) return false;
        worldState.foresightCharges -= 1;
        return true;
    },

    // FASE D1 — COMPENDIO DE FINALES (cierra F5): el catálogo de desenlaces que una vida puede alcanzar.
    // No es contenido nuevo del motor — es una LECTURA derivada del estado que ya existe al morir el Host
    // (reach, anhelo, vendetta/deuda, edad, abort). Coleccionar los que faltan es el motor de re-corrida
    // del género (Life Restart: los finales que no tenés te hacen volver a jugar). Cada final declara id,
    // nombre y descripción; la capa 3 persiste los vistos (localStorage) y pinta coleccionados vs faltantes.
    ENDINGS: [
        { id: "leyenda_cosmica", name: "Leyenda Cósmica",  desc: "Su nombre cruzó el vacío entre los mundos." },
        { id: "anhelo_cumplido", name: "Anhelo Cumplido",  desc: "Murió habiendo hecho mundo el deseo de su vida." },
        { id: "anhelo_trunco",   name: "Anhelo Trunco",    desc: "El norte de su vida quedó sin alcanzar." },
        { id: "vengador",        name: "El Vengador",       desc: "Cobró sangre: ejecutó al campeón de la facción rival." },
        { id: "piadoso",         name: "El Piadoso",        desc: "Perdonó a un vencido y se ganó su deuda de vida." },
        { id: "longevo",         name: "El Longevo",        desc: "Alcanzó una vejez que pocas almas llegan a ver." },
        { id: "caido_joven",     name: "Caído en la Flor",  desc: "Cayó joven, antes de que su tiempo madurara." },
        { id: "desligado",       name: "El Desligado",      desc: "El Admin cortó la conexión antes del final natural." }
    ],

    // FASE D2 — DECRETOS (cierra F4): meta-progresión de OPCIONES, no de stats (lección Hades/Slay the
    // Spire: la run 20 es distinta de la run 1 por lo que ELEGÍS, no solo por números más grandes). Cada
    // decreto es un modificador OPT-IN de la corrida, DESBLOQUEADO por finales coleccionados (`unlockAt`
    // = cuántos finales del Compendio hacen falta). El Admin los elige en la Sala; entran por `applyAction`
    // start → `choiceLog` (D3). Sin decretos elegidos, la corrida es BYTE-IDÉNTICA a la de siempre
    // (mods neutros) — cero regresión, como el gate de montura equipada de A1. `mods`: enemyMult (dureza),
    // lootMult (calidad de botín), lifespanMult (寿元), foresightDelta (cargas de Vislumbre), essenceMult
    // (Cosecha). Cada decreto es un TRADE-OFF (más riesgo ↔ más recompensa) — nada es gratis.
    DECREES: [
        { id: "decreto_hierro",  name: "Decreto de Hierro",   unlockAt: 1, desc: "Enemigos +30% más fuertes, pero el botín rinde +30%.",           mods: { enemyMult: 1.3, lootMult: 1.3 } },
        { id: "decreto_reloj",   name: "Decreto del Reloj",   unlockAt: 3, desc: "La vida es 30% más corta, pero cada año rinde +60% de esencia.",  mods: { lifespanMult: 0.7, essenceMult: 1.6 } },
        { id: "decreto_niebla",  name: "Decreto de la Niebla", unlockAt: 5, desc: "Sin Vislumbre táctica (eliges a ciegas), pero el botín rinde +25%.", mods: { foresightDelta: -99, lootMult: 1.25 } },
        { id: "decreto_legado",  name: "Decreto del Legado",  unlockAt: 7, desc: "Infierno: enemigos +50%, pero la Cosecha rinde el DOBLE de esencia.", mods: { enemyMult: 1.5, essenceMult: 2 } }
    ],

    // Agrega los mods de una lista de ids de decreto en un solo bloque (multiplicativos salvo el delta de
    // presciencia, que suma). Neutro = {enemyMult:1, lootMult:1, lifespanMult:1, foresightDelta:0,
    // essenceMult:1}. Pura, sin rng. Ids desconocidos se ignoran (fail-safe). El `start` la usa para
    // materializar `worldState.decreeMods`, que runTicks lee (con default neutro → sin regresión).
    aggregateDecrees: function(ids) {
        const m = { enemyMult: 1, lootMult: 1, lifespanMult: 1, foresightDelta: 0, essenceMult: 1 };
        (ids || []).forEach(id => {
            const d = this.DECREES.find(x => x.id === id);
            if (!d) return;
            const f = d.mods || {};
            if (f.enemyMult) m.enemyMult *= f.enemyMult;
            if (f.lootMult) m.lootMult *= f.lootMult;
            if (f.lifespanMult) m.lifespanMult *= f.lifespanMult;
            if (f.foresightDelta) m.foresightDelta += f.foresightDelta;
            if (f.essenceMult) m.essenceMult *= f.essenceMult;
        });
        return m;
    },

    // FASE E — COSECHA POR ASENTAMIENTO (每十年结算, canon del género): cada 10 años simulados la vida se
    // "liquida" en un dividendo de esencia (SETTLEMENT_INTERVAL), y al morir el TIER de lo extraíble sale
    // de cuán LEGENDARIA fue la vida (My Longevity Simulation: "cuanto más turbulenta y legendaria la vida
    // simulada, más alto el grado del talento reclamado"). No pausa el auto-run — el dividendo se acumula
    // en la esencia (C6), que es la moneda de la Cosecha; el tier multiplica el presupuesto final. Todo
    // determinista (sin rng): f(edad, finales, alcance, poder).
    SETTLEMENT_INTERVAL: 10,
    SETTLEMENT_TIERS: ["Mundana", "Notable", "Ilustre", "Legendaria"],

    // Grado (0..3) de cuán legendaria fue la vida que acaba de cerrar — combina décadas vividas, finales
    // alcanzados (classifyEnding) y el alcance máximo. La Cosecha lo usa para multiplicar la esencia
    // extraíble (§10.1: la extracción escala con la leyenda). Lectura pura del estado del Host muerto (D2/D3).
    settlementTier: function(worldState) {
        const agent = worldState && worldState.agents && worldState.agents[0];
        if (!agent) return 0;
        const endings = this.classifyEnding(worldState);
        const decades = Math.floor((agent.age || 0) / 10);
        let score = decades + endings.length + (agent.reach || 0) * 2;
        if (endings.indexOf("leyenda_cosmica") !== -1) score += 3;
        if (endings.indexOf("longevo") !== -1) score += 2;
        if (score >= 14) return 3;
        if (score >= 9) return 2;
        if (score >= 5) return 1;
        return 0;
    },

    // Crawl de apertura (Star Wars): tres párrafos, solo campos que el motor ya tiene.
    // Lectura pura (D2). La capa 3 lo pinta; no escribe World.
    openingCrawl: function(worldState) {
        const meta = worldState && worldState.meta;
        const agent = worldState && worldState.agents && worldState.agents[0];
        if (!meta || !agent) return null;
        const tipo = this.worldTypeOf(meta);
        const eraName = {
            CULTIVACION: "un reino de cultivo",
            FANTASIA: "un reino de leyenda",
            CYBERPUNK: "un arco de neón",
            "SCI-FI": "una órbita lejana",
            APOCALIPSIS: "un yermo",
            MODERNO: "una ciudad mundana"
        }[tipo] || "un universo";
        const epoch = this.WORLD_EPOCHS[this.epochOf(meta)];
        const epochTxt = epoch ? epoch.prose : "en su tiempo";
        const ceil = ((meta.tierData && meta.tierData.desc) ? meta.tierData.desc : "Mundo") + " (" + (meta.tierId || "F") + ")";
        const plot = meta.plot || {};
        const traits = (meta.traits || []).map(id => this.WORLD_TRAITS[id] && this.WORLD_TRAITS[id].name).filter(Boolean);
        const origin = (agent.originZoneId && worldState.universe) ? this.zoneName(worldState.universe, agent.originZoneId) : null;
        const regime = (worldState.universe && this.REGIMES[worldState.universe.regime])
            ? this.REGIMES[worldState.universe.regime].desc
            : "un tiempo incierto";
        const p1 = "Es " + regime + ", " + epochTxt + ". En " + eraName + " cuyo techo es " + ceil + ", la trama «" + (plot.title || "sin nombre") + "» aún duerme.";
        const p2 = traits.length
            ? ("Este cielo carga " + traits.join(" y ") + ". " + (plot.desc || ""))
            : (plot.desc || "El hilo espera.");
        const p3 = origin
            ? (agent.name + " no descendió del vacío: [ORIGEN] hasta hoy era un alma de " + origin + ". El Sistema lo señaló como " + (meta.hostRole || "un extraño") + ".")
            : (agent.name + " entra al hilo. El Sistema lo señaló como " + (meta.hostRole || "un extraño") + ".");
        return {
            farAway: "Hace mucho tiempo, en un universo ya simulado…",
            title: (plot.title || "NEXO").toUpperCase(),
            crawl: [p1, p2, p3]
        };
    },

    // Cosecha 三选一: las tres retenciones que ESTA vida ya produjo. Lectura pura (D2).
    // carta = inventario; innato = talento C4; saga = herederos C18. La UI elige UNA.
    harvestKeep: function(worldState) {
        const agent = worldState && worldState.agents && worldState.agents[0];
        if (!agent) return [];
        const seen = {};
        const inv = [];
        (agent.deck || []).concat(agent.discoveredCards || []).forEach(c => {
            if (c && c.id && !seen[c.id]) { seen[c.id] = true; inv.push(c); }
        });
        const t = (agent.innateTalents || [])[0] || null;
        const heirs = this.findHeirs(worldState, agent);
        return [
            {
                kind: "carta",
                title: "ARTE",
                desc: inv.length ? ("Retener un objeto o arte de esta vida (" + inv.length + ").") : "Esta vida no dejó arte extraíble.",
                ready: inv.length > 0
            },
            {
                kind: "innato",
                title: t ? t.name : "TALENTO",
                desc: t ? ("Llevar " + t.name + " a la próxima vida. " + (t.desc || "")) : "Sin talento innato.",
                ready: !!t,
                talentId: t ? t.id : null
            },
            {
                kind: "saga",
                title: "LINAJE",
                desc: heirs.length ? ("Continuar con un heredero. El mundo no se reinicia (" + heirs.length + ").") : "No hay herederos vivos.",
                ready: heirs.length > 0
            }
        ];
    },

    // Deriva los finales que ESTA vida alcanzó (array de ids del catálogo ENDINGS). Lectura pura del
    // estado del Host muerto + universo + choiceLog — sin rng, determinista (D2/D3): misma corrida →
    // mismos finales. Una vida puede tocar VARIOS (una leyenda que además cumplió su anhelo colecciona
    // los dos). El Admin (capa 3) une esto a lo persistido y muestra el Compendio.
    classifyEnding: function(worldState) {
        const agent = worldState && worldState.agents && worldState.agents[0];
        if (!agent) return [];
        const u = worldState.universe;
        const got = [];
        if ((agent.reach || 0) >= 3) got.push("leyenda_cosmica");
        if (agent.desire) got.push(agent.desire.fulfilled ? "anhelo_cumplido" : "anhelo_trunco");
        if (agent.vendettaFacId != null) got.push("vengador");
        if (u && (u.population || []).some(p => p.lifeDebt)) got.push("piadoso");
        const age = agent.age || 0, ls = agent.lifespan || 60;
        if (age >= Math.max(70, Math.floor(ls * 0.85))) got.push("longevo");
        else if (age > 0 && age < 40) got.push("caido_joven");
        if ((worldState.choiceLog || []).some(e => e.choice === "abort")) got.push("desligado");
        return got;
    },

    // Núcleo compartido de la presciencia: corre un CLON ya preparado hasta la muerte/horizonte,
    // auto-respondiendo cada Bifurcación/Juicio. `opts.firstOptionId` fuerza la PRIMERA decisión (para
    // proyectar una rama concreta); a partir de ahí la política es la primera senda (`options[0]`).
    // Determinista, sin rng nuevo. Devuelve la línea de hitos y el año de muerte.
    runForesightLine: function(sim, opts) {
        opts = opts || {};
        const maxYears = opts.maxYears || 200;
        const NOTABLE = new Set(this.FORESIGHT_NOTABLE);
        let firstOptionId = opts.firstOptionId || null;
        const timeline = [];
        let deathYear = null, guard = 0;
        const limit = maxYears * 13 + 50; // ~12 ticks/año + margen de decisiones
        while (guard++ < limit) {
            if (sim.waitingForChoice) { deathYear = Math.floor(sim.tick / 360); break; } // ya cayó
            if (sim.waitingForDecision) {
                const pd = sim.pendingDecision;
                let optId;
                if (firstOptionId) { optId = firstOptionId; firstOptionId = null; }
                else optId = (pd && pd.options && pd.options[0]) ? pd.options[0].id : null;
                if (optId == null) break;
                this.applyAction(sim, { type: "decision", optionId: optId });
                continue;
            }
            const agent = sim.agents && sim.agents[0];
            if (!agent || agent.hp <= 0) { deathYear = Math.floor(sim.tick / 360); break; }
            const res = this.runTicks(sim);
            const year = Math.floor(sim.tick / 360);
            (res.logs || []).forEach(l => { if (NOTABLE.has(l.kind)) timeline.push({ year: year, kind: l.kind, text: l.text }); });
            if (res.stopped && !res.waitingForDecision) { deathYear = year; break; }
            if (year >= maxYears) { deathYear = year; break; }
        }
        return { timeline: timeline, deathYear: deathYear, finalYear: Math.floor(sim.tick / 360) };
    },

    // PRESCIENCIA / C7 Pieza 1: "Vislumbre del Destino" desde la génesis (pre-partida). Clona la génesis
    // del mundo vivo, aplica `start` con el Host+Mazo sobre el CLON, y proyecta la vida entera bajo el
    // rumbo por defecto. No toca el estado vivo. Ver Parte 10.3 y el handoff de v1.12.0.
    foreseeDestiny: function(worldState, baseAgent, cards, opts) {
        const sim = {
            seed: worldState.seed, meta: worldState.meta,
            universe: JSON.parse(JSON.stringify(worldState.universe)),
            tick: 0, waitingForChoice: false
        };
        this.applyAction(sim, { type: "start", baseAgent: baseAgent, cards: cards || [] });
        const line = this.runForesightLine(sim, opts);
        line.hostName = baseAgent.name;
        return line;
    },

    // PRESCIENCIA / C7 Pieza 2: "Presciencia de Ramas". Proyecta desde un estado a MITAD de corrida
    // (clon completo del mundo vivo) el desenlace de tomar `opts.firstOptionId` AHORA y seguir el rumbo
    // por defecto después. Es lo que deja comparar cada senda de una Bifurcación/Juicio antes de elegir
    // (el núcleo de "optimizar viendo el futuro"). No toca el estado vivo. Determinista (D2/D3, T31).
    foreseeFrom: function(worldState, opts) {
        const sim = JSON.parse(JSON.stringify(worldState)); // clon completo, estado vivo intacto
        return this.runForesightLine(sim, opts);
    }
};
