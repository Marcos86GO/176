#!/usr/bin/env node
/* Archivo de encuestas de la XV Legislatura y evolución de la media ponderada propia.

   Uso:
     node herramientas/encuestas.js [wikitext.txt]

   - Con un archivo, lo lee como el texto fuente («action=raw») de la página de Wikipedia
     «Opinion polling for the 2026 Spanish general election» y añade sus encuestas a data/encuestas.json.
   - Siempre añade las de `lista` de data/sondeos.js (las que usa la web; mandan sobre las de Wikipedia
     de la misma encuestadora con la misma fecha, ±4 días).
   - Recalcula `serie` en data/serie.js: la media ponderada de PP, PSOE, Vox y Frente Amplio (Sumar hasta
     2026) cada 7 días desde el 17-A-2023 (constitución de las Cortes) hasta la última encuesta, con el mismo
     método que la media de la web (mediaPropia en index.html): última encuesta de cada encuestadora, sin el
     CIS y sin las que no publican muestra; peso = entrevistas × ½^(días de antigüedad / 3).

   data/encuestas.json: { actualizado, fuente, lista: [[encuestadora, fecha fin de campo, entrevistas, PP, PSOE, VOX, FA], …] }
   (null si la encuesta no da ese partido). La web no lo carga: solo data/serie.js. */
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..'), ARCH = path.join(RAIZ, 'data/encuestas.json'), SERIE = path.join(RAIZ, 'data/serie.js');
const K4 = ['PP', 'PSOE', 'VOX', 'FA'], VIDA = 3, DESDE = '2023-08-17';
const FUENTE = { t: 'Wikipedia: Opinion polling for the 2026 Spanish general election', u: 'https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Spanish_general_election' };
// Medias de encuestas (no son encuestas) y el CIS (va aparte en la web)
const FUERA = /^(keydata|cis\b|electocracia)/i;

// misma encuestadora aunque cambie un poco el nombre («IMOP» e «IMOP Insights», «EM-Analytics» y «EM-Analytics/Electomanía»)
function clave(i){ return String(i).split('/')[0].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4); }

const MESES = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function fechaFin(txt, anio){
  // «10–12 Nov», «26 Oct–12 Nov», «28 Dec 2025–3 Jan», «31 Dec»
  const t = txt.replace(/<[^>]*>|\{\{[^}]*\}\}|\[\[|\]\]|'''/g, '').replace(/&nbsp;/g, ' ').trim();
  const fin = t.split(/[–-]/).pop().trim(), m = fin.match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*(?:\s+(\d{4}))?/);
  if(!m || !MESES[m[2].toLowerCase()]) return null;
  const a = m[3] ? +m[3] : anio, mes = MESES[m[2].toLowerCase()];
  return a + '-' + String(mes).padStart(2, '0') + '-' + String(+m[1]).padStart(2, '0');
}
function etiqueta(h){
  const m = h.match(/\|([^|\]]+)\]\]\s*$/), l = m ? m[1].trim() : '';
  if(/^PP$/.test(l)) return 'PP'; if(/^PSOE$/.test(l)) return 'PSOE'; if(/^Vox$/i.test(l)) return 'VOX';
  if(/^(FA|Sumar)$/.test(l)) return 'FA';
  return 'X:' + l;
}
// valor de una celda: «{{Party shading/PP}}| '''31.5'''<br/>…», «colspan="2"| 7.3<br/>…», «?<br/>…», «–»
function celda(linea){
  let s = linea.replace(/^\|/, ''), span = 1;
  const at = s.match(/^\s*((?:\{\{Party shading\/[^}]*\}\}|[a-z]+="[^"]*"\s*)+)\|/i);
  if(at){ const c = at[1].match(/colspan="(\d+)"/); if(c) span = +c[1]; s = s.slice(at[0].length); }
  const v = s.split(/<br|<ref|\{\{efn/)[0].replace(/'''|''/g, '').trim(), x = parseFloat(v.replace(',', '.'));
  return { v: /^\d+(\.\d+)?$/.test(v) ? x : null, span };
}
function leerWiki(txt){
  const out = [], L = txt.split('\n');
  let anio = null, cols = null, enTabla = false, fila = null, cabecera = [];
  const cerrar = () => {
    if(!fila || !cols || fila.length < 4 + cols.length) { fila = null; return; }
    const firma = fila[0].replace(/^\|\s*/, '').replace(/^\s*(?:[a-z]+="[^"]*"\s*)+\|\s*/i, '').split(/<ref|\{\{efn/)[0].replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').trim();
    if(!firma || /election|EP election|general election/i.test(firma) || FUERA.test(firma)) { fila = null; return; }
    const f = fechaFin(fila[1].replace(/^\|/, ''), anio), nTxt = fila[2].replace(/^\|/, '').split('<')[0].replace(/[,\s]/g, ''), n = /^\d+$/.test(nTxt) ? +nTxt : null;
    const v = {}; let k = 0;
    for(let j = 4; j < fila.length && k < cols.length; j++){ const c = celda(fila[j]); if(K4.includes(cols[k]) && c.v != null) v[cols[k]] = c.v; k += c.span; }
    if(f && f >= DESDE && v.PP != null && v.PSOE != null) out.push({ i: firma, f, n, v });
    fila = null;
  };
  for(let li = 0; li < L.length; li++){
    const l = L[li];
    if(/^====[^=]/.test(l) && !/Voting intention estimates/.test(l) && anio) { cerrar(); break; } // fin del apartado de intención de voto
    const sec = l.match(/^=====\s*(\d{4})/); if(sec){ cerrar(); anio = +sec[1]; cols = null; enTabla = false; continue; }
    if(!anio) continue;
    if(/^\{\|/.test(l)){ enTabla = true; cabecera = []; cols = null; continue; }
    if(!enTabla) continue;
    if(/^\|\}/.test(l)){ cerrar(); enTabla = false; continue; }
    if(/^!/.test(l)){ if(!/rowspan/.test(l) && /\[\[/.test(l)) cabecera.push(etiqueta(l)); continue; }
    if(/^\|-/.test(l)){ cerrar(); if(cabecera.length && !cols) cols = cabecera; fila = []; continue; }
    if(fila && /^\|/.test(l)) fila.push(l);
  }
  return out;
}

function cargarJS(f){ const t = fs.readFileSync(f, 'utf8'); return JSON.parse(t.slice(t.indexOf('\n{')).trim().replace(/;$/, '')); }
const fila = p => [p.i, p.f, p.n, ...K4.map(k => p.v[k] == null ? null : p.v[k])];
const deFila = r => ({ i: r[0], f: r[1], n: r[2], v: Object.fromEntries(K4.map((k, j) => [k, r[3 + j]]).filter(x => x[1] != null)) });
const dias = (a, b) => Math.abs(Date.parse(a) - Date.parse(b)) / 864e5;

const arch = fs.existsSync(ARCH) ? JSON.parse(fs.readFileSync(ARCH, 'utf8')) : { lista: [] };
let polls = arch.lista.map(deFila), nuevasWiki = 0;
const repe = (p, q) => clave(p.i) === clave(q.i) && p.f === q.f;
if(process.argv[2]){
  const w = leerWiki(fs.readFileSync(process.argv[2], 'utf8'));
  if(w.length < 50) { console.error('Solo ' + w.length + ' encuestas en el texto de Wikipedia: ¿ha cambiado el formato de la página?'); process.exit(1); }
  w.forEach(p => { if(!polls.some(q => repe(p, q))) { polls.push(p); nuevasWiki++; } });
}
// las de la web mandan
const S = cargarJS(path.join(RAIZ, 'data/sondeos.js'));
let deLista = 0;
(S.lista || []).filter(p => !p.cis && p.n > 0 && p.v).forEach(p => {
  const q = { i: p.i, f: p.f, n: p.n, v: {} }; K4.forEach(k => { if(p.v[k] != null) q.v[k] = p.v[k]; });
  // la misma encuesta en Wikipedia (fin del campo) y en la web (publicación): la más cercana de esa encuestadora, ±4 días
  let mejor = -1; polls.forEach((x, j) => { if(clave(x.i) === clave(q.i) && dias(x.f, q.f) <= 4 && (mejor < 0 || dias(x.f, q.f) < dias(polls[mejor].f, q.f))) mejor = j; });
  if(mejor >= 0) polls.splice(mejor, 1);
  polls.push(q); deLista++;
});
polls = polls.filter(p => !FUERA.test(p.i));
polls.sort((a, b) => a.f.localeCompare(b.f) || a.i.localeCompare(b.i));
fs.writeFileSync(ARCH, JSON.stringify({ actualizado: new Date().toISOString().slice(0, 10), fuente: FUENTE, nota: 'Encuestas de intención de voto desde la constitución de las Cortes (17-A-2023), sin el CIS ni medias de encuestas. Columnas: encuestadora, fin del trabajo de campo, entrevistas (null si no la publica), PP, PSOE, VOX, FA (Sumar hasta 2026).', lista: polls.map(fila) }).replace(/\],\[/g, '],\n[') + '\n');

// serie: cada 7 días desde DESDE y la fecha de la última encuesta
const con = polls.filter(p => p.n > 0), ult = con[con.length - 1].f, fechas = [];
for(let t = Date.parse(DESDE); t < Date.parse(ult); t += 7 * 864e5) fechas.push(new Date(t).toISOString().slice(0, 10));
fechas.push(ult);
const serie = [];
fechas.forEach(d => {
  const ultima = {}; con.forEach(p => { if(p.f <= d){ const c = clave(p.i); if(!ultima[c] || ultima[c].f <= p.f) ultima[c] = p; } });
  const ps = Object.values(ultima); if(ps.length < 3) return;
  const ref = ps.reduce((a, p) => p.f > a ? p.f : a, ''), pt = { f: d };
  K4.forEach(k => { let W = 0, m = 0; ps.forEach(p => { if(p.v[k] == null) return; const w = p.n * Math.pow(0.5, (Date.parse(ref) - Date.parse(p.f)) / 864e5 / VIDA); W += w; m += w * p.v[k]; }); if(W) pt[k] = Math.round(m / W * 10) / 10; });
  serie.push(pt);
});
const out = { actualizado: arch.actualizado = new Date().toISOString().slice(0, 10), desde: DESDE, encuestas: con.length, fuente: FUENTE, serie };
fs.writeFileSync(SERIE, 'window.PE=window.PE||{};window.PE.serie=\n' + JSON.stringify(out, null, 1) + ';\n');
console.log('Encuestas: ' + polls.length + ' (' + con.length + ' con muestra; ' + nuevasWiki + ' nuevas de Wikipedia, ' + deLista + ' de la web) · serie: ' + serie.length + ' puntos, ' + serie[0].f + ' a ' + serie[serie.length - 1].f);
