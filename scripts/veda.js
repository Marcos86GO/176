#!/usr/bin/env node
// Veda electoral (LOREG, art. 69.7): vacía de data/sondeos.js todo lo que sale de encuestas y lo restaura después.
//   node scripts/veda.js vaciar     guarda las cifras en la etiqueta git TAG y las quita del archivo
//   node scripts/veda.js estado     escribe «con-datos» o «vacio»
//   node scripts/veda.js restaurar  vuelve a poner las cifras guardadas en TAG, sin tocar lo demás (p. ej. «resultado»)
// Solo modifica el archivo: el commit y el push los hace quien lo llama (el workflow .github/workflows/veda.yml).
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process');
var FILE = path.join(__dirname, '..', 'data', 'sondeos.js'), REL = 'data/sondeos.js';
var PRE = 'window.PE=window.PE||{};window.PE.sondeos=\n', TAG = 'sondeos-antes-veda';
// Claves con cifras de encuestas. [ruta, valor durante la veda]
var CLAVES = [[['resumen'], ''], [['media'], null], [['historia'], []], [['historiaAnual'], []], [['lista'], []],
  [['senado', 'lista'], []], [['senado', 'escanos'], null], [['senado', 'nota'], ''], [['senado', 'fuente'], null], [['senado', 'fuenteLista'], null]];

function leer(txt){ if(txt.indexOf(PRE) !== 0) throw new Error(REL + ' no empieza por la cabecera esperada'); return JSON.parse(txt.slice(PRE.length).replace(/\s*;\s*$/, '')); }
function escribir(o){ fs.writeFileSync(FILE, PRE + JSON.stringify(o, null, 1) + '\n;\n'); }
function get(o, r){ return r.reduce(function(a, k){ return a == null ? undefined : a[k]; }, o); }
function set(o, r, v){ var a = o; for(var i = 0; i < r.length - 1; i++){ if(a[r[i]] == null) a[r[i]] = {}; a = a[r[i]]; } a[r[r.length - 1]] = v; }
function git(args){ return cp.execFileSync('git', args, { encoding: 'utf8', cwd: path.join(__dirname, '..') }); }
function tieneDatos(o){ return !!(o.lista && o.lista.length) || !!(o.media && o.media.voto); }

var accion = process.argv[2], S = leer(fs.readFileSync(FILE, 'utf8'));
if(accion === 'vaciar'){
  if(!tieneDatos(S)){ console.log('Ya estaba vacío: no se hace nada.'); process.exit(0); }
  CLAVES.forEach(function(c){ set(S, c[0], c[1]); });
  S.vedaVaciado = true;
  escribir(S); console.log('Cifras de encuestas quitadas de ' + REL + '. Para recuperarlas: node scripts/veda.js restaurar');
} else if(accion === 'restaurar'){
  if(tieneDatos(S)){ console.log('Ya tiene datos de encuestas: no se hace nada.'); process.exit(0); }
  var G = leer(git(['show', TAG + ':' + REL]));
  if(!tieneDatos(G)) throw new Error('La etiqueta ' + TAG + ' no tiene datos de encuestas');
  CLAVES.forEach(function(c){ set(S, c[0], get(G, c[0])); });
  delete S.vedaVaciado;
  escribir(S); console.log('Cifras de encuestas restauradas desde la etiqueta ' + TAG + '.');
} else if(accion === 'estado'){
  console.log(tieneDatos(S) ? 'con-datos' : 'vacio');
} else {
  console.error('Uso: node scripts/veda.js vaciar|restaurar|estado'); process.exit(2);
}
