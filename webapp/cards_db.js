// REGLA MECÁNICA: los bonus de stats se escriben en `desc` como "+N ATK/DEF/HP" (los parsea
// assembleAgentForSim respetando el número). Un efecto que no siga ese formato es solo sabor.
//
// ESQUEMA EXTENDIDO (Fase 6 macro-escala, docs/diseno-macro-escala-jerarquia-v1.0.md §7-bis.1): toda
// carta admite opcionalmente `requires` (prerrequisitos: "power>=N", "card:<id>", y desde Fase 7
// "tech:<era>#<i>" / "recurso:<key>", ver tech_db.js + Engine.techTree/nodeResources) y `contextTags`
// (dónde puede existir: "era:X", "regime:Y"). Ambos son OPCIONALES — sin ellos la carta se desbloquea
// siempre (Engine.puedeDesbloquear, D5), así el CardsDB viejo queda byte-idéntico en su disponibilidad.
// Desde Fase 8 (§7-bis.4), una carta también puede llevar `capabilities`: qué HABILITA al poseerla —
// hoy, saltos de traversía ("travel:overland"/"travel:sea"/"travel:air"/"travel:orbital"/
// "travel:interstellar", ver Engine.TRAVEL_REQUIREMENTS/puedeViajar). También opcional; sin ella la
// carta no otorga ninguna capacidad (comportamiento de siempre).
const CardsDB = {
    // Recompensa de "Asimilación de Jefe": el Evento Fijo grave (fatal) entrega esta carta temática
    // en vez de una SSR forjada genérica (Engine.FIXED_EVENTS.*.bossDrop referencia estos ids).
    MUTACIONES: [
        { id: "boss_apo_10", type: "MUTACIÓN", rarity: "SR", name: "Fragmento de la Primera Calamidad", era: "APOCALIPSIS", desc: "[ASIMILACIÓN] Absorbe una esquirla del desastre cósmico. +100 DEF." },
        { id: "boss_apo_30", type: "MUTACIÓN", rarity: "SSR", name: "Forma: Avatar del Fin", era: "APOCALIPSIS", desc: "[ASIMILACIÓN] Te conviertes en la calamidad. +300 ATK, +300 DEF." },
        { id: "boss_pla_20", type: "MUTACIÓN", rarity: "SSR", name: "Invocación: Raid de Inmortales", era: "MODERNO", desc: "[ASIMILACIÓN] Esclaviza almas caídas. +500 HP." },
        { id: "boss_mad_10", type: "MUTACIÓN", rarity: "SR", name: "Ojo Exterior Implantado", era: "UNIVERSAL", desc: "[ASIMILACIÓN] Inmunidad a la locura. +150 DEF." },
        { id: "boss_reg_15", type: "MUTACIÓN", rarity: "SSR", name: "Núcleo del Bucle Quebrado", era: "UNIVERSAL", desc: "[ASIMILACIÓN] El tiempo roto cede su poder. +120 ATK, +60 DEF." },
        // — B2 (densidad) —
        { id: "boss_cul_25", type: "MUTACIÓN", rarity: "SSR", name: "Vena del Dragón Ancestral", era: "CULTIVACION", desc: "[ASIMILACIÓN] Injerta la raíz de un dragón muerto. +150 ATK, +150 HP." },
        { id: "boss_cyb_18", type: "MUTACIÓN", rarity: "SR", name: "Córtex Sináptico Negro", era: "CYBERPUNK", desc: "[ASIMILACIÓN] Overclock neuronal permanente. +90 ATK, +40 DEF." }
    ],
    COMPANEROS: [
        { id: "char_2b", type: "COMPAÑERO", rarity: "SSR", name: "2B (YoRHa)", era: "UNIVERSAL", desc: "Unidad táctica letal. +50 ATK, +50 DEF." },
        { id: "char_albedo", type: "COMPAÑERO", rarity: "SSR", name: "Albedo (Supervisora)", era: "FANTASIA", desc: "Defensa absoluta. +100 DEF." },
        { id: "char_cortana", type: "COMPAÑERO", rarity: "SR", name: "IA: Cortana", era: "SCI-FI", desc: "Anula barreras tecnológicas. +20 ATK." },
        { id: "char_ultramarine", type: "COMPAÑERO", rarity: "SSR", name: "Veterano Ultramarine", era: "SCI-FI", desc: "El Ángel de la Muerte. +80 ATK, +80 DEF." },
        { id: "char_igris", type: "COMPAÑERO", rarity: "SR", name: "Sombra: Igris", era: "UNIVERSAL", desc: "Caballero leal extraído de la muerte. +60 ATK." },
        // — B2 (densidad): compañeros de efecto distinto por era —
        { id: "char_sanadora", type: "COMPAÑERO", rarity: "R", name: "Sanadora de Campo", era: "FANTASIA", desc: "Mantiene al Anfitrión en pie. +80 HP." },
        { id: "char_tanque", type: "COMPAÑERO", rarity: "SR", name: "Guardián de Escudo", era: "FANTASIA", desc: "Se planta al frente y aguanta. +70 DEF, +40 HP." },
        { id: "char_hacker", type: "COMPAÑERO", rarity: "R", name: "Runner: Fantasma de Red", era: "CYBERPUNK", desc: "Abre cerraduras y cuentas por igual. +25 ATK." },
        { id: "char_androide", type: "COMPAÑERO", rarity: "SR", name: "Androide de Combate S-9", era: "SCI-FI", desc: "Plataforma de fuego autónoma. +55 ATK, +25 DEF." },
        { id: "char_espadachin", type: "COMPAÑERO", rarity: "SSR", name: "Espadachín Errante", era: "CULTIVACION", desc: "Un tajo, mil enemigos. +110 ATK." },
        { id: "char_superviviente", type: "COMPAÑERO", rarity: "R", name: "Superviviente Curtido", era: "APOCALIPSIS", desc: "Sabe dónde no pisar. +30 DEF, +30 HP." },
        { id: "char_francotirador", type: "COMPAÑERO", rarity: "SR", name: "Francotiradora", era: "MODERNO", desc: "Elimina antes de ser vista. +65 ATK." }
    ],
    MASCOTAS: [
        { id: "pet_slime", type: "MASCOTA", rarity: "SSR", name: "Slime Devorador", era: "UNIVERSAL", desc: "Asimila estadísticas de bestias caídas. +30 ATK, +30 DEF." },
        { id: "pet_kurama", type: "MASCOTA", rarity: "SSR", name: "Zorro 9 Colas", era: "CULTIVACION", desc: "Reserva de chakra. +1000 HP." },
        // — B2 (densidad): bestias de rol distinto —
        { id: "pet_grifo", type: "MASCOTA", rarity: "SR", name: "Grifo de Guerra", era: "FANTASIA", desc: "Garras que parten escudos. +60 ATK, +200 HP." },
        { id: "pet_dron", type: "MASCOTA", rarity: "R", name: "Dron de Escolta", era: "CYBERPUNK", desc: "Intercepta proyectiles. +50 DEF." },
        { id: "pet_lobo", type: "MASCOTA", rarity: "R", name: "Lobo de las Ruinas", era: "APOCALIPSIS", desc: "Caza en manada contigo. +40 ATK, +100 HP." },
        { id: "pet_tortuga", type: "MASCOTA", rarity: "SR", name: "Tortuga Abismal", era: "CULTIVACION", desc: "Caparazón que resiste eras. +120 DEF, +300 HP." }
    ],
    OBJETOS: [
        { id: "obj_ironman", type: "OBJETO", rarity: "SSR", name: "Armadura Mark L", era: "MODERNO", desc: "+80 DEF. Nanotecnología adaptable." },
        { id: "obj_infinity", type: "NAVE", rarity: "SSR", name: "UNSC Infinity", era: "SCI-FI", desc: "Bombardeo orbital MAC. +500 ATK." },
        { id: "obj_stardestroyer", type: "NAVE", rarity: "SSR", name: "Destructor Estelar", era: "SCI-FI", desc: "Proyección de terror galáctico. +200 ATK." },
        { id: "obj_senzu", type: "OBJETO", rarity: "R", name: "Semilla del Ermitaño", era: "UNIVERSAL", desc: "Reserva de vitalidad concentrada. +40 HP." },
        { id: "obj_deathnote", type: "OBJETO", rarity: "SR", name: "Cuaderno de Muerte", era: "MODERNO", desc: "Asesinato conceptual inmediato. +20 ATK." },
        { id: "obj_warlords_seal", type: "OBJETO", rarity: "SR", name: "Sello del Señor de la Guerra", era: "UNIVERSAL", desc: "Solo se forja donde el conflicto templa el acero. +35 ATK.", requires: ["power>=80"], contextTags: ["regime:conflicto"] },
        { id: "obj_reliquia_precursora", type: "OBJETO", rarity: "SR", name: "Reliquia del Precursor", era: "UNIVERSAL", desc: "Solo se forja donde el Motor de Salto FTL ya despertó y el mineral raro abunda. +45 ATK.", requires: ["tech:SCI-FI#0", "recurso:mineral_raro"], contextTags: ["era:SCI-FI"] },
        { id: "mount_caballo_de_guerra", type: "MONTURA", rarity: "N", name: "Corcel de Guerra", era: "UNIVERSAL", desc: "+8 ATK. Cruza caminos entre ciudades sin depender de nadie.", capabilities: ["travel:overland"] },
        { id: "veh_nave_precursora", type: "VEHÍCULO", rarity: "SSR", name: "Nave Precursora", era: "SCI-FI", desc: "+60 ATK. El Motor de Salto ya despertó: cruza el vacío entre planetas.", requires: ["tech:SCI-FI#0"], contextTags: ["era:SCI-FI"], capabilities: ["travel:orbital", "travel:interstellar"] },
        // — B2 (densidad): objetos de efecto distinto + monturas overland (variedad para la traversía A1) —
        { id: "obj_escudo_torre", type: "OBJETO", rarity: "R", name: "Escudo Torre", era: "FANTASIA", desc: "Una pared de acero portátil. +30 DEF." },
        { id: "obj_amuleto_vida", type: "OBJETO", rarity: "SR", name: "Amuleto de Sangre Vital", era: "CULTIVACION", desc: "Late con vida prestada. +250 HP." },
        { id: "obj_exoesqueleto", type: "OBJETO", rarity: "SR", name: "Exoesqueleto de Asalto", era: "CYBERPUNK", desc: "Servos que multiplican la fuerza. +60 ATK, +30 DEF." },
        { id: "obj_nucleo_reactor", type: "OBJETO", rarity: "SSR", name: "Núcleo de Reactor Frío", era: "SCI-FI", desc: "Energía sin fin para el cuerpo aumentado. +120 ATK, +120 HP." },
        { id: "obj_pocion_titan", type: "OBJETO", rarity: "SSR", name: "Poción del Titán", era: "FANTASIA", desc: "El cuerpo crece más allá de lo humano. +600 HP." },
        { id: "obj_hacha_runica", type: "OBJETO", rarity: "SR", name: "Hacha Rúnica", era: "FANTASIA", desc: "Cada golpe graba una runa. +50 ATK." },
        { id: "mount_lobo_gigante", type: "MONTURA", rarity: "R", name: "Lobo de Monta", era: "FANTASIA", desc: "+12 ATK. Corre entre asentamientos sin cansarse.", capabilities: ["travel:overland"] },
        { id: "mount_motocicleta", type: "MONTURA", rarity: "R", name: "Motocicleta Blindada", era: "MODERNO", desc: "+10 ATK. Cruza rutas entre ciudades a toda marcha.", capabilities: ["travel:overland"] },
        { id: "veh_barco", type: "VEHÍCULO", rarity: "SR", name: "Navío de Vela Reforzado", era: "UNIVERSAL", desc: "+20 ATK. Surca el mar entre continentes.", capabilities: ["travel:sea"] },
        { id: "veh_aeronave", type: "VEHÍCULO", rarity: "SR", name: "Aeronave Ligera", era: "MODERNO", desc: "+25 ATK. Vuela sobre mares y montañas entre continentes.", capabilities: ["travel:air"] }
    ],
    HABILIDADES: [
        { id: "skill_arise", type: "HABILIDAD", rarity: "SSR", name: "[Extracción de Sombras]", era: "UNIVERSAL", desc: "Levanta a los muertos como ejército. +40 ATK." },
        { id: "skill_za_warudo", type: "HABILIDAD", rarity: "SSR", name: "[Detener el Tiempo]", era: "MODERNO", desc: "Congela la realidad 9 segundos. +40 DEF." },
        // — B2 (densidad): artes de efecto distinto por era —
        { id: "skill_puno_acero", type: "HABILIDAD", rarity: "R", name: "[Puño de Acero]", era: "CULTIVACION", desc: "El cuerpo se vuelve arma. +20 ATK, +10 DEF." },
        { id: "skill_piel_diamante", type: "HABILIDAD", rarity: "SR", name: "[Piel de Diamante]", era: "CULTIVACION", desc: "La carne rechaza el filo. +80 DEF." },
        { id: "skill_regeneracion", type: "HABILIDAD", rarity: "SR", name: "[Regeneración Celular]", era: "SCI-FI", desc: "Las heridas se cierran solas. +300 HP." },
        { id: "skill_sobrecarga", type: "HABILIDAD", rarity: "SSR", name: "[Sobrecarga Total]", era: "CYBERPUNK", desc: "Todo al ataque, sin frenos. +100 ATK." },
        { id: "skill_meditacion", type: "HABILIDAD", rarity: "R", name: "[Meditación de Núcleo]", era: "CULTIVACION", desc: "El Qi asienta la base. +60 HP, +10 DEF." },
        { id: "skill_bola_fuego", type: "HABILIDAD", rarity: "R", name: "[Bola de Fuego]", era: "FANTASIA", desc: "El primer hechizo de todo mago. +25 ATK." }
    ],
    TALENTOS: [
        { id: "t_halo", type: "TALENTO", rarity: "SSR", name: "Halo del Protagonista", era: "UNIVERSAL", desc: "Altera la suerte del mundo a tu favor. +30 ATK, +30 DEF." },
        { id: "t_returner", type: "TALENTO", rarity: "SSR", name: "Regreso por Muerte", era: "FANTASIA", desc: "Distorsiona el tiempo al recibir daño letal. +50 HP." },
        { id: "t_n1", type: "TALENTO", rarity: "N", name: "Cuerpo Resistente", era: "UNIVERSAL", desc: "Leve aumento de vitalidad (+10 HP)." },
        { id: "t_r1", type: "TALENTO", rarity: "R", name: "Instinto Asesino", era: "UNIVERSAL", desc: "+15 ATK en emboscadas." },
        { id: "t_path_loyalist", type: "TALENTO", rarity: "R", name: "Camino: Lealtad Inquebrantable", era: "UNIVERSAL", desc: "Forjado en la Bifurcación. Defensa que no cede. +20 DEF." },
        { id: "t_path_lonewolf", type: "TALENTO", rarity: "R", name: "Camino: Lobo Solitario", era: "UNIVERSAL", desc: "Forjado en la Bifurcación. Poder crudo sin ataduras. +20 ATK." },
        { id: "t_path_opportunist", type: "TALENTO", rarity: "R", name: "Camino: Doble Juego", era: "UNIVERSAL", desc: "Forjado en la Bifurcación. Versatilidad calculada. +10 ATK, +10 DEF." },
        // — B2 (densidad): dones de nacimiento con perfil distinto —
        { id: "t_genio_marcial", type: "TALENTO", rarity: "SR", name: "Genio Marcial", era: "UNIVERSAL", desc: "El cuerpo aprende cada arte al vuelo. +40 ATK." },
        { id: "t_carne_ferrea", type: "TALENTO", rarity: "SR", name: "Carne Férrea", era: "UNIVERSAL", desc: "Nació con la piel de un veterano. +40 DEF." },
        { id: "t_pulmon_dragon", type: "TALENTO", rarity: "SSR", name: "Pulmón de Dragón", era: "CULTIVACION", desc: "Vitalidad que desborda el molde mortal. +200 HP." },
        { id: "t_sangre_fria", type: "TALENTO", rarity: "R", name: "Sangre Fría", era: "UNIVERSAL", desc: "No tiembla ante nada. +12 ATK, +12 DEF." },
        { id: "t_hijo_fortuna", type: "TALENTO", rarity: "SSR", name: "Hijo de la Fortuna", era: "UNIVERSAL", desc: "El azar siempre lo roza de lado. +25 ATK, +25 DEF, +100 HP." }
    ]
};
