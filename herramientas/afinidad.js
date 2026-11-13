#!/usr/bin/env node
/* Agrega las respuestas anónimas del test de afinidad y escribe data/afinidad.js.

   La web, si la persona acepta al terminar el test, envía a GoatCounter un evento con la ruta
   «afinidad/v<versión>/<respuestas>»: una letra por pregunta (a = a favor, c = en contra, n = no lo sé).
   GoatCounter no guarda la IP; en su exportación cada evento lleva la ubicación aproximada («ES-MD»).

   Uso:
     node herramientas/afinidad.js export.csv        # CSV (o .csv.gz) exportado de GoatCounter
     node herramientas/afinidad.js --vacio           # deja data/afinidad.js sin respuestas

   Para cada respuesta calcula la afinidad con cada partido igual que la página (index.html, tCalc):
   1 si coincide, 0,5 si el partido está en medio, 0 si es lo contrario; «no lo sé» no cuenta.
   Ignora los eventos de bots y los de los dispositivos del autor (rutas que empiezan por «yo-»). */
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const RAIZ = path.join(__dirname, '..'), SALIDA = path.join(RAIZ, 'data', 'afinidad.js');
const MINIMO = 500, MIN_REGION = 100;
// ISO 3166-2 de las comunidades autónomas → código INE de comunidad que usa la web (data/mapa.js, PE.ccaa)
const CCAA = { AN:'01', AR:'02', AS:'03', IB:'04', CN:'05', CB:'06', CM:'07', CL:'08', CT:'09', EX:'10', GA:'11', MD:'12', NC:'13', PV:'14', MC:'15', RI:'16', VC:'17', CE:'18', ML:'19' };

function leerDatos(f, clave){ const t = fs.readFileSync(path.join(RAIZ, 'data', f), 'utf8'); return JSON.parse(t.slice(t.indexOf('\n{')).trim().replace(/;$/, '')); }
const C = leerDatos('contenido.js');
const E = C.encuesta, Q = E.preguntas, PART = E.partidos, VER = E.v || 1;

function voto(l, id){ const v = l.v || {}; return (v.si || []).includes(id) ? 1 : (v.no || []).includes(id) ? -1 : (v.abs || []).includes(id) ? 0 : null; }
function pos(q, id){
  if(q.tipo === 'voto'){ const l = C.votaciones.find(x => x.id === q.id); return l ? voto(l, id === 'FA' ? 'SUMAR' : id) : null; }
  const x = q.pos ? q.pos[id] : null; return x == null ? null : x;
}
const POS = Q.map(q => Object.fromEntries(PART.map(id => [id, pos(q, id)])));
function afinidad(resp){ // resp: array de 1, -1 o 0
  const out = {};
  PART.forEach(id => { let n = 0, a = 0; resp.forEach((u, k) => { const p = POS[k][id]; if((u !== 1 && u !== -1) || p == null) return; n++; a += 1 - Math.abs(u - p) / 2; }); out[id] = n ? a / n : null; });
  return out;
}

// CSV con comillas (el user agent lleva comas)
function csv(texto){
  const filas = [], f = []; let campo = '', q = false;
  for(let i = 0; i < texto.length; i++){
    const c = texto[i];
    if(q){ if(c === '"'){ if(texto[i + 1] === '"'){ campo += '"'; i++; } else q = false; } else campo += c; }
    else if(c === '"') q = true;
    else if(c === ','){ f.push(campo); campo = ''; }
    else if(c === '\n' || c === '\r'){ if(c === '\r' && texto[i + 1] === '\n') i++; f.push(campo); filas.push(f.splice(0)); campo = ''; }
    else campo += c;
  }
  if(campo || f.length){ f.push(campo); filas.push(f.splice(0)); }
  return filas.filter(r => r.length > 1);
}

function vacio(){ return { n: 0, minimo: MINIMO, minRegion: MIN_REGION, version: VER, actualizado: null, global: null, regiones: {}, sinRegion: 0, fuera: 0 }; }
function acumulador(){ return { n: 0, suma: Object.fromEntries(PART.map(id => [id, 0])), cuenta: Object.fromEntries(PART.map(id => [id, 0])), top: Object.fromEntries(PART.map(id => [id, 0])) }; }
function sumar(A, af){
  A.n++;
  const val = PART.filter(id => af[id] != null), mx = Math.max(...val.map(id => af[id])), tops = val.filter(id => af[id] === mx);
  val.forEach(id => { A.suma[id] += af[id]; A.cuenta[id]++; });
  tops.forEach(id => { A.top[id] += 1 / tops.length; }); // empate: se reparte
}
function cerrar(A){
  const r = x => Math.round(x * 10) / 10;
  return { n: A.n, afin: Object.fromEntries(PART.map(id => [id, A.cuenta[id] ? r(100 * A.suma[id] / A.cuenta[id]) : null])), top: Object.fromEntries(PART.map(id => [id, A.n ? r(100 * A.top[id] / A.n) : 0])) };
}

function escribir(D){ fs.writeFileSync(SALIDA, 'window.PE=window.PE||{};window.PE.afinidad=\n' + JSON.stringify(D, null, 1) + ';\n'); }

const arg = process.argv[2];
if(!arg || arg === '--vacio'){ escribir(vacio()); console.log('data/afinidad.js sin respuestas'); process.exit(0); }
let texto = fs.readFileSync(arg); if(arg.endsWith('.gz')) texto = zlib.gunzipSync(texto); texto = texto.toString('utf8');
const filas = csv(texto), cab = filas.shift().map(s => s.trim()), ix = n => cab.findIndex(h => h.toLowerCase() === n.toLowerCase());
const iP = ix('Path'), iB = ix('Bot'), iL = ix('Location');
if(iP < 0) throw new Error('El CSV no tiene columna Path: ' + cab.join(','));
const RE = new RegExp('^/?afinidad/v' + VER + '/([acn]{' + Q.length + '})$');
const G = acumulador(), REG = {}; let sinRegion = 0, fuera = 0, otras = 0;
filas.forEach(r => {
  const m = (r[iP] || '').trim().match(RE); if(!m){ if(/afinidad\/v\d/.test(r[iP] || '') && !/yo-/.test(r[iP])) otras++; return; }
  if(iB >= 0 && r[iB] && r[iB] !== '0' && r[iB].toLowerCase() !== 'false') return;
  const resp = m[1].split('').map(c => c === 'a' ? 1 : c === 'c' ? -1 : 0);
  if(resp.filter(u => u).length < 3) return; // como en la página: hacen falta tres respuestas
  const af = afinidad(resp), loc = iL >= 0 ? (r[iL] || '').trim().toUpperCase() : '';
  if(loc && !loc.startsWith('ES')){ fuera++; return; } // solo respuestas desde España
  sumar(G, af);
  const ca = CCAA[(loc.split('-')[1] || '')];
  if(ca){ REG[ca] = REG[ca] || acumulador(); sumar(REG[ca], af); } else sinRegion++;
});
const D = vacio();
D.actualizado = new Date().toISOString(); D.n = G.n; D.global = G.n ? cerrar(G) : null; D.sinRegion = sinRegion; D.fuera = fuera;
Object.keys(REG).sort().forEach(ca => { D.regiones[ca] = cerrar(REG[ca]); });
escribir(D);
console.log('respuestas: ' + G.n + ' · por comunidad: ' + Object.keys(REG).map(ca => ca + '=' + REG[ca].n).join(' ') + ' · sin comunidad: ' + sinRegion + ' · fuera de España: ' + fuera + (otras ? ' · de otra versión del test: ' + otras : ''));
