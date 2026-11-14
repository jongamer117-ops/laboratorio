/**
 * D2/D3: misma semilla + mismo choiceLog → mismo World.
 * Corre con: node webapp/determinism.test.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const context = {
  console,
  Math: Object.create(Math),
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Date,
  RegExp,
  Set,
  Map,
  parseInt,
  parseFloat,
  isNaN,
  isFinite,
  Error,
  RangeError,
  TypeError,
  Infinity,
  NaN,
  undefined
};
context.Math.random = function () {
  throw new Error('Math.random está prohibido (D2)');
};
context.globalThis = context;
context.global = context;
vm.createContext(context);

function load(file, names) {
  let src = fs.readFileSync(path.join(root, file), 'utf8');
  if (names && names.length) {
    src += '\n' + names.map(n => 'globalThis.' + n + ' = ' + n + ';').join('\n');
  }
  vm.runInContext(src, context, { filename: file });
}

load('tech_db.js', ['TechDB']);
load('cards_db.js', ['CardsDB']);
load('engine.js', ['Engine', 'SpriteEngine']);
load('spatial.js');

const Engine = context.Engine;
const CardsDB = context.CardsDB;

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.error('FALLO: ' + msg);
  }
}

function stable(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
}

function hasKey(v, key) {
  if (!v || typeof v !== 'object') return false;
  if (Array.isArray(v)) return v.some(x => hasKey(x, key));
  if (Object.prototype.hasOwnProperty.call(v, key)) return true;
  return Object.keys(v).some(k => hasKey(v[k], key));
}

function mountCard() {
  for (const cat in CardsDB) {
    const found = (CardsDB[cat] || []).find(c => c.id === 'mount_caballo_de_guerra');
    if (found) return found;
  }
  throw new Error('no está la montura');
}

function play(seed, withMount) {
  const world = Engine.boot(seed);
  const host = Engine.generateHost(seed, world.meta.era, world.universe);
  const cards = withMount ? [mountCard()] : [];
  Engine.applyAction(world, { type: 'start', baseAgent: host, cards: cards });
  Engine.openLife(world);
  Engine.applyAction(world, { type: 'free_text', text: 'Medito junto al fuego de la aldea' });
  const spatial = Engine.query(world, 'spatial');
  const poi = spatial.pois && spatial.pois[0];
  if (poi) {
    Engine.applyAction(world, {
      type: 'enter_poi',
      text: 'entrar en ' + poi.name,
      poiId: poi.id,
      poiType: poi.type,
      poiName: poi.name
    });
  }
  const origin = world.agents[0].zoneId;
  const dest = (world.universe.zones || []).find(z => z.id !== origin);
  let travel = null;
  let crowdBefore = 0;
  let crowdAfter = 0;
  let zoneAfter = origin;
  if (dest) {
    crowdBefore = (world.universe.population || []).filter(p => p.fromCrowd && p.zoneId === origin).length;
    travel = Engine.applyAction(world, {
      type: 'travel',
      zoneId: dest.id,
      dir: 'este',
      text: 'viajar al este'
    });
    crowdAfter = (world.universe.population || []).filter(p => p.fromCrowd && p.zoneId === origin).length;
    zoneAfter = world.agents[0].zoneId;
  }
  let guard = 0;
  while (guard++ < 8 && !world.waitingForChoice) {
    if (world.waitingForDecision && world.pendingDecision && world.pendingDecision.options) {
      Engine.applyAction(world, { type: 'decision', optionId: world.pendingDecision.options[0].id });
      continue;
    }
    const res = Engine.applyAction(world, { type: 'advance_year' });
    if (res.refused) break;
  }
  return { world: world, travel: travel, origin: origin, dest: dest, crowdBefore: crowdBefore, crowdAfter: crowdAfter, zoneAfter: zoneAfter };
}

const seed = 'det-semilla-fija';
const a = play(seed, true);
const b = Engine.replay(seed, a.world.choiceLog);
assert(stable(a.world) === stable(b), 'replay(semilla, choiceLog) difiere del World jugado');
if (stable(a.world) !== stable(b)) {
  const sa = stable(a.world);
  const sb = stable(b);
  let i = 0;
  while (i < sa.length && i < sb.length && sa[i] === sb[i]) i++;
  console.error('diverge @' + i + '\nA: ' + sa.slice(Math.max(0, i - 80), i + 80) + '\nB: ' + sb.slice(Math.max(0, i - 80), i + 80));
}

const c = Engine.replay(seed, a.world.choiceLog);
assert(stable(b) === stable(c), 'dos replays de la misma semilla no coinciden');

const d2a = play('otra-semilla', false);
const d2b = play('otra-semilla', false);
assert(stable(d2a.world) === stable(d2b.world), 'D2: misma semilla, dos partidas distintas');
assert(stable(d2a.world) !== stable(a.world), 'semillas distintas produjeron el mismo World');

assert(!hasKey(a.world, 'llm'), 'el choiceLog guardó narración llm');
assert(!hasKey(a.world, 'narrative'), 'el World guardó narrative');
const free = (a.world.choiceLog || []).filter(e => e.choice === 'free_text');
assert(free.length === 1 && free[0].text === 'Medito junto al fuego de la aldea', 'free_text no quedó en choiceLog vía el motor');
assert(free[0].action == null && free[0].validated == null, 'free_text arrastra campos que no son estado');

assert(a.travel && !a.travel.refused, 'con montura la travesía debería aceptarse');
const travelEntry = (a.world.choiceLog || []).find(e => e.choice === 'travel');
assert(!!travelEntry, 'la travesía no se anotó en choiceLog');
assert(a.zoneAfter === a.dest.id, 'la travesía no cambió la zona del host');
assert(a.crowdBefore > 0, 'la zona de origen no tenía residentes de la masa');
assert(a.crowdAfter === 0, 'la zona de origen conservó residentes de la masa (no se disolvió)');
assert(b.choiceLog.some(e => e.choice === 'travel' && e.to === travelEntry.to), 'el replay perdió la travesía');

const bare = play('sin-montura', false);
const bareTravel = (bare.world.choiceLog || []).find(e => e.choice === 'travel');
assert(!bareTravel, 'sin montura no debe anotarse un viaje');
assert(bare.travel && bare.travel.refused && bare.travel.reason === 'capacidad', 'sin montura el motor debe rechazar por capacidad');
assert(bare.world.agents[0].zoneId === bare.origin || bare.travel.reason === 'capacidad', 'sin montura la zona no cambia por el rechazo');
if (bare.travel && bare.travel.refused) {
  assert(bare.world.agents[0].zoneId === bare.origin, 'el rechazo de viaje movió al host');
}

const probe = Engine.boot('dir-probe');
const host = Engine.generateHost('dir-probe', probe.meta.era, probe.universe);
Engine.applyAction(probe, { type: 'start', baseAgent: host, cards: [] });
Engine.openLife(probe);
assert(Engine.resolveSpatialIntent(probe, 'quiero este cuchillo') === null, '"este" suelto no es este');
assert(Engine.resolveSpatialIntent(probe, 'atrás') === null, '"atrás" solo no es sur');
assert(Engine.resolveSpatialIntent(probe, 'arriba') === null, '"arriba" solo no es norte');
assert(Engine.resolveSpatialIntent(probe, 'adelante') === null, '"adelante" solo no es norte');
assert(Engine.resolveSpatialIntent(probe, 'Seguir adelante') === null, 'la opción "Seguir adelante" no es un viaje');
const east = Engine.resolveSpatialIntent(probe, 'viajar al este');
assert(east && (east.kind === 'travel' || east.kind === 'dir' || east.kind === 'poi'), 'viajar al este no se reconoció como movimiento');
if (east && east.kind === 'travel') assert(east.dir === 'este', 'la dirección resuelta no es este');
const north = Engine.resolveSpatialIntent(probe, 'camina hacia el norte');
assert(north && north.kind !== undefined, 'camina hacia el norte no es una intención');

assert(Engine.stripLeadingArticle('el Mercado de la Esquina') === 'Mercado de la Esquina', 'el artículo interior se comió');
assert(Engine.stripLeadingArticle('la Taberna del Jabalí') === 'Taberna del Jabalí', 'el artículo inicial no se quitó');
assert(Engine.stripLeadingArticle('los Campos') === 'Campos', 'los no se quitó');

const appSrc = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const spatialSrc = fs.readFileSync(path.join(root, 'spatial.js'), 'utf8');
assert(!/\.choiceLog\s*(?:=|\.push)/.test(appSrc), 'app.js escribe choiceLog por su cuenta');
assert(!/\.choiceLog\s*(?:=|\.push)/.test(spatialSrc), 'spatial.js escribe choiceLog por su cuenta');
assert(!/labels === null/.test(appSrc), 'sigue el chequeo muerto labels === null');
assert(/choice: "free_text"/.test(fs.readFileSync(path.join(root, 'engine.js'), 'utf8')), 'el motor no tiene free_text');
assert(/AbortController/.test(fs.readFileSync(path.join(root, 'ollama.js'), 'utf8')), 'ollama.js no corta el fetch');
assert(/poiLines/.test(fs.readFileSync(path.join(root, 'ollama.js'), 'utf8')), 'proposeBranch no recibe los POIs');

const direct = Engine.boot('directo');
const h2 = Engine.generateHost('directo', direct.meta.era, direct.universe);
Engine.applyAction(direct, { type: 'start', baseAgent: h2, cards: [] });
const before = direct.choiceLog.length;
direct.choiceLog.push({ tick: 0, choice: 'free_text', text: 'trampa', llm: 'no' });
const replayIgnoresHand = Engine.replay('directo', direct.choiceLog.filter(e => e.choice === 'start'));
assert(!replayIgnoresHand.choiceLog.some(e => e.llm), 'un replay no debe conservar llm');
assert(before === 1, 'start no anotó choiceLog por la puerta');

if (failed) {
  console.error(failed + ' fallo(s)');
  process.exit(1);
}
console.log('ok: misma semilla + mismo choiceLog → mismo World');
console.log('  ticks', a.world.tick, 'log', a.world.choiceLog.map(e => e.choice).join(','));
