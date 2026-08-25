// TECH_DB — Fase 7 macro-escala (docs/diseno-macro-escala-jerarquia-v1.0.md §7-bis.2 / §7-bis.2-bis).
//
// Este archivo es SOLO contenido estático (vocabulario), igual que cards_db.js/PROCEDURAL_DICT: el
// nombre de cada tecnología/recurso por era. La FORMA del árbol tecnológico (qué depende de qué) y el
// CALENDARIO (en qué año se desbloquea cada nodo) NO viven acá — se derivan de la semilla en
// Engine.techTree (engine.js), así que dos mundos de la MISMA era tienen árboles con distinta forma y
// timing aunque compartan este vocabulario (decisión de Taco: "el árbol de tech depende de la
// semilla... la era solo tiñe el sabor").
//
// `VOCAB[era][i]` es el NOMBRE de la tecnología en la posición de contenido `i`. Esa posición es la
// identidad estable que usan las cartas para referenciarla (`requires: ["tech:<era>#<i>"]"`) — el
// CONTENIDO (nombre) no cambia entre semillas; su lugar en el árbol y su año de desbloqueo sí.
//
// `RESOURCES[era]` son las claves de recursos que puede tener un nodo de esa era (abundancia/escasez,
// Engine.nodeResources/tieneRecurso). "UNIVERSAL" no es una era jugable (Engine.ERAS no la incluye) —
// MODERNO es el fallback defensivo si alguna vez se consulta con una era desconocida.
const TechDB = {
    VOCAB: {
        FANTASIA:    ["Herrería de Runas", "Alquimia Arcana", "Encantamiento Élfico", "Nigromancia Prohibida", "Forja Enana", "Adivinación Celestial", "Domesticación de Bestias", "Arquitectura Sagrada"],
        CYBERPUNK:   ["Neuro-Interfaz", "Nanotecnología de Combate", "Hackeo Cuántico", "Bio-Ingeniería Corporativa", "IA de Enjambre", "Blindaje Reactivo", "Redes Neuronales Piratas", "Fusión Fría"],
        CULTIVACION: ["Formación de Qi", "Alquimia de Píldoras", "Forja de Talismanes", "Arte de la Espada Inmortal", "Cultivo de Bestias Espirituales", "Formación de Arrays", "Refinamiento Corporal", "Trascendencia de Tribulación"],
        "SCI-FI":    ["Motor de Salto FTL", "Terraformación", "Robótica Autónoma", "Armamento de Plasma", "Escudos Deflectores", "Xenobiología", "Computación Cuántica", "Fusión Estelar"],
        APOCALIPSIS: ["Reciclaje de Chatarra", "Purificación de Agua", "Blindaje Improvisado", "Bioingeniería Mutante", "Comunicación por Radio", "Agricultura de Búnker", "Armamento Artesanal", "Medicina de Emergencia"],
        MODERNO:     ["Vigilancia Digital", "Criptografía Aplicada", "Ingeniería Balística", "Medicina Forense", "Redes Encubiertas", "Drones Civiles", "Biometría Avanzada", "Ciberseguridad"]
    },
    RESOURCES: {
        FANTASIA:    ["mineral_encantado", "hierbas_mana", "piedra_runica", "madera_ancestral"],
        CYBERPUNK:   ["chip_neural", "aleacion_ligera", "datos_robados", "energia_fusion"],
        CULTIVACION: ["mineral_espiritual", "hierba_pildora", "jade_espiritual", "esencia_qi"],
        "SCI-FI":    ["combustible_helio3", "mineral_raro", "nanomateriales", "agua_helada"],
        APOCALIPSIS: ["chatarra", "agua_potable", "combustible_crudo", "semillas_mutadas"],
        MODERNO:     ["petroleo", "litio", "datos_geotermicos", "acero"]
    }
};
