#!/usr/bin/env node
/* Banco de preguntas del test de afinidad (C.encuesta en data/contenido.js, versión 2).

   100 preguntas en 10 temas: en cada tema, 5 votaciones reales del Congreso (con el voto de cada grupo) y 5 propuestas
   con la posición documentada de PP, PSOE, Vox y Frente Amplio. Cada test toma una pregunta de cada tema: 5 temas
   con votación y 5 con propuesta, al azar.

   Uso: node herramientas/banco-test.js   (reescribe C.encuesta; no toca nada más de data/contenido.js)

   Reglas para editar:
   - El código «c» de cada pregunta (dos cifras) es fijo: va en las respuestas que se envían a GoatCounter y lo usa
     herramientas/afinidad.js. No cambies ni reutilices un código; las preguntas nuevas, con el siguiente libre.
   - Votación: «ref» = id de una votación de C.votaciones, o los datos propios (f, t, marcador, estado, eTxt, v, nv, fu).
     Frente Amplio se compara con el voto del grupo Sumar.
   - Propuesta: «pos» 1 a favor, -1 en contra, 0 intermedio, null si no hay posición documentada (no cuenta);
     «porque» y «fu» por partido. Mismo criterio para todos los partidos. */
const fs = require('fs'), path = require('path');
const ARCH = path.join(__dirname, '..', 'data', 'contenido.js');
const txt = fs.readFileSync(ARCH, 'utf8'), cab = txt.slice(0, txt.indexOf('\n{') + 1);
const C = JSON.parse(txt.slice(txt.indexOf('\n{')).trim().replace(/;$/, ''));
const VOT = id => { const v = C.votaciones.find(x => x.id === id); if(!v) throw new Error('No existe la votación ' + id); return v; };

// fuentes que se repiten
const F = {
  pp: { t: 'Programa electoral del PP «La Reconstrucción Nacional» (2026)', u: 'https://www.elindependiente.com/wp-content/uploads/2026/11/LA-RECONSTRUCCION-NACIONAL.pdf' },
  vox: { t: 'Programa electoral de Vox para el 29-N (Infobae)', u: 'https://www.infobae.com/espana/2026/11/12/vox-lleva-al-29-n-un-programa-electoral-con-repatriaciones-y-deportaciones-de-migrantes-prioridad-nacional-y-derogacion-de-leyes-de-genero/' },
  vox18: { t: 'Las 100 medidas de Vox (2018)', u: 'https://www.65ymas.com/uploads/s1/34/59/2/programa-electoral-vox.pdf' },
  voxDes: { t: 'Plan de desregulación de Vox (El Independiente)', u: 'https://www.elindependiente.com/espana/2026/06/27/plan-desregularizacion-vox-milei-elecciones-2027/' },
  psoe: { t: 'Resolución política del 41 Congreso Federal del PSOE (2024)', u: 'https://psc-psoe.es/wp-content/uploads/2024/12/RESOLUCION-41C_1.pdf' },
  sumar: { t: 'Programa de Sumar para las generales de 2023 («Un programa para ti»)', u: 'https://verdesequo.es/wp-content/uploads/2023/07/Un-programa-para-ti.pdf' },
  colau: { t: 'Propuestas de Colau para el 29-N (Demócrata)', u: 'https://www.democrata.es/actualidad/frente-amplio-promete-expropiar-viviendas-fondos-buitre-elevar-impuestos-grandes-fortunas/' },
  junts: { t: 'Moción de Junts para bajar impuestos, aprobada el 26-6-2025 (esdiario)', u: 'https://www.esdiario.com/economia/250626/161960/congreso-pide-gobierno-bajada-general-impuestos-voto-favorable-pp-vox-junts.html' },
  energ: { t: 'Votación del gravamen a las energéticas, 22-1-2025 (Bolsamanía)', u: 'https://www.bolsamania.com/noticias/politica/congreso-rechaza-decreto-gravamen-empresas-energeticas--18614236.html' },
  fondos: { t: 'Votación de la ley contra la compra de vivienda por fondos, 15-9-2026 (Qué!)', u: 'https://www.que.es/2026/09/16/ley-vivienda-fondos-congreso/' },
  leyPP: { t: 'Votación de la ley de vivienda del PP, 21-4-2026 (Valencia Plaza)', u: 'https://valenciaplaza.com/valenciaplaza/nacional/el-congreso-admite-a-tramite-la-ley-de-vivienda-del-pp-con-junts-a-favor-y-el-gobierno-en-contra' },
  burka: { t: 'Votación de la ley de Vox contra el burka, 17-2-2026 (Noticias de Navarra)', u: 'https://www.noticiasdenavarra.com/politica/2026/02/17/debate-prohibicion-burka-aterriza-hoy-congreso-10709718.amp.html' },
  ppr: { t: 'Votación sobre la prisión permanente revisable, 17-3-2026 (Newtral)', u: 'https://www.newtral.es/prision-permanente-revisable-pp/20260317/' },
  sahara: { t: 'Votación de la moción sobre el Sáhara, 20-6-2024 (El Independiente)', u: 'https://www.elindependiente.com/espana/2024/06/20/el-psoe-rechaza-rectificar-su-giro-con-el-sahara-y-marruecos-y-vuelve-a-quedarse-solo-en-el-congreso/amp/' },
  otan: { t: 'Votación del referéndum sobre la OTAN, 22-4-2026 (Orain)', u: 'https://orain.eus/es/politica/2026/04/22/el-congreso-rechaza-el-referendum-salir-la-otan-pide-podemos/' },
  defensa: { t: 'Votación del gasto en defensa del 2 %, mayo de 2024 (The Objective)', u: 'https://theobjective.com/espana/politica/2024-05-22/psoe-pp-vox-pnv-defensa-congreso/' },
  palestina: { t: 'Albares: todos salvo PP y Vox apoyan reconocer a Palestina (Moncloa.com)', u: 'https://www.moncloa.com/2024/05/22/albares-celebra-inmensa-mayoria-2619489/' },
  zbe: { t: 'Votación de la propuesta de Vox contra las zonas de bajas emisiones (Motor16)', u: 'https://www.motor16.com/las-ultimas-noticias/congreso-vota-eliminacion-zonas-bajas-emisiones/' },
  muface: { t: 'El PP reclama un modelo de futuro para Muface (Redacción Médica)', u: 'https://www.redaccionmedica.com/politica/20241214/el-pp-reclama-un-modelo-futuro-para-muface-sostenible-solvente/236954_0.html' },
  sns: { t: 'Ley de gestión pública e integridad del SNS (El Salto)', u: 'https://www.elsaltodiario.com/sanidad-publica/gobierno-aprueba-segunda-ronda-ley-acota-privatizacion-sanitaria' },
  lomloe: { t: 'Ley Orgánica 3/2020 (LOMLOE), BOE', u: 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-17264' },
  trans: { t: 'Ley 4/2023, para la igualdad real y efectiva de las personas trans, BOE', u: 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-5366' },
  sedicion: { t: 'Ley Orgánica 14/2022 (supresión de la sedición), BOE', u: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-21800' },
  abortoPSOE: { t: 'Sánchez anuncia que blindará el aborto en la Constitución (Diari de Tarragona)', u: 'https://www.diaridetarragona.com/espana/273908/sanchez-anuncia-sigue-moncloa-blindara-derecho-aborto-constitucion.html' },
  abortoSumar: { t: 'Sumar propone blindar el aborto en la Constitución (El Observador)', u: 'https://www.elobservador.com.uy/espana/actualidad/sumar-propone-blindar-la-constitucion-el-derecho-al-aborto-como-hizo-francia-los-detalles-del-proyecto-el-congreso-n5987132' },
  vivPSOE: { t: 'Comparativa de vivienda (Brainsre)', u: 'https://brainsre.news/?p=316467' }
};
const fuVot = id => (VOT(id).fu || [])[0];

const TEMAS = [
  ['eco', 'Economía e impuestos'], ['tra', 'Trabajo y pensiones'], ['viv', 'Vivienda'], ['inm', 'Inmigración'],
  ['seg', 'Seguridad y justicia'], ['ins', 'Instituciones y territorio'], ['ser', 'Sanidad, educación y cuidados'],
  ['ene', 'Energía y medio ambiente'], ['der', 'Igualdad y derechos'], ['ext', 'Política exterior y defensa']
];

// ---------- votaciones ----------
// [tema, código, ref o datos, pregunta]
const V = [
  ['eco', '00', 'fiscal', '¿Que las grandes empresas y multinacionales paguen al menos un 15 % de sus beneficios en el impuesto de sociedades?'],
  ['eco', '01', 'senda', '¿Aprobar la senda de déficit del Gobierno, primer paso para tener Presupuestos en 2027?'],
  ['eco', '02', 'anticrisis', '¿Aprobar el decreto de rebajas de impuestos y ayudas por la subida de precios que provocó la guerra de Irán?'],
  ['eco', '03', { id: 'v-impjunts', f: '2025-06-26', t: 'Moción de Junts para bajar impuestos', marcador: '176 a favor', estado: 'aprobada', v: { si: ['PP', 'VOX', 'JUNTS', 'UPN'], no: ['PSOE', 'SUMAR', 'ERC'], abs: ['PNV', 'CC'] }, fu: [F.junts] },
    '¿Pedir al Gobierno que ajuste el IRPF a la inflación y baje impuestos como el de sucesiones entre padres e hijos o el IVA de las residencias?'],
  ['eco', '04', { id: 'v-condona', f: '2026-07-23', t: 'Condonación de deuda a las comunidades autónomas (debate de totalidad)', estado: 'aprobada', eTxt: '✓ Siguió adelante', v: { si: ['PSOE', 'SUMAR', 'ERC'], no: ['PP', 'VOX'] }, nv: 'Se votaron las enmiendas de PP y Vox para devolver la ley al Gobierno: aquí, «a favor» es rechazarlas para que la ley siga. Junts facilitó que siguiera. La ley decayó con la disolución de las Cortes.', fu: [{ t: 'El bloque de investidura salva la condonación del veto de PP y Vox (Qué!)', u: 'https://www.que.es/2026/07/24/condonacion-deuda-autonomica/' }] },
    '¿Que el Estado asuma unos 83.000 millones de euros de la deuda de las comunidades autónomas?'],

  ['tra', '05', 'jornada', '¿Reducir por ley la jornada laboral máxima de 40 a 37,5 horas semanales, sin bajar el sueldo?'],
  ['tra', '06', 'omnibus', '¿Aprobar un decreto que subía las pensiones y mantenía las ayudas al transporte público, junto con otras medidas?'],
  ['tra', '07', { id: 'v-subsidio', f: '2024-01-10', t: 'Reforma del subsidio por desempleo (decreto)', marcador: '167-176', estado: 'rechazada', v: { si: ['PSOE', 'SUMAR', 'ERC', 'PNV', 'BILDU', 'BNG', 'CC'], no: ['PP', 'VOX', 'PODEMOS', 'UPN'] }, nv: 'Podemos votó en contra por un recorte para los mayores de 52 años. La reforma se aprobó de nuevo en junio de 2024, con la abstención de PP y Vox.', fu: [{ t: 'Podemos tumba el decreto del subsidio (The Objective)', u: 'https://theobjective.com/espana/politica/2024-01-10/podemos-tumba-decreto-diaz-subsidio/' }] },
    '¿Reformar el subsidio por desempleo para que lo cobren más personas, suba su cuantía y se pueda compatibilizar con un empleo?'],
  ['tra', '08', { id: 'v-smiirpf', f: '2025-07-22', t: 'Salario mínimo exento de IRPF (ley)', estado: 'aprobada', v: { si: ['PSOE', 'SUMAR', 'ERC', 'BILDU', 'PNV', 'BNG'], no: ['VOX'], abs: ['PP'] }, nv: 'La exención iba en una enmienda de PSOE, Sumar y BNG a una ley de seguros.', fu: [{ t: 'El Congreso deshace el lío: el salario mínimo no pagará IRPF (Ara)', u: 'https://es.ara.cat/economia/cuentas-publicas/congreso-deshace-lio-salario-minimo-no-pagara-irpf_1_5407256.html' }] },
    '¿Que quien cobra el salario mínimo no pague IRPF?'],
  ['tra', '09', { id: 'v-aranceles', f: '2025-05-08', t: 'Decreto contra los aranceles de Estados Unidos', marcador: '176-169', estado: 'aprobada', v: { si: ['PSOE', 'SUMAR', 'JUNTS', 'PNV', 'ERC', 'BILDU', 'CC', 'UPN'], no: ['PP', 'VOX'], abs: ['PODEMOS'] }, fu: [{ t: 'El Congreso convalida el decreto antiaranceles (El Independiente)', u: 'https://www.elindependiente.com/espana/2025/05/08/el-congreso-convalida-el-decreto-antiaranceles-del-gobierno-con-la-oposicion-de-pp-vox/' }] },
    '¿Aprobar 14.100 millones en avales y ayudas para las empresas afectadas por los aranceles de Estados Unidos, con un mecanismo para no despedir a sus trabajadores?'],

  ['viv', '10', 'vivienda', '¿Prorrogar por decreto los contratos de alquiler, limitar su subida al 2 % y frenar los desahucios de personas vulnerables?'],
  ['viv', '11', 'escudo', '¿Mantener la suspensión de los desahucios de familias vulnerables sin alternativa de vivienda?'],
  ['viv', '12', { id: 'v-leypp', f: '2026-04-21', t: 'Ley de vivienda del PP (toma en consideración)', estado: 'aprobada', v: { si: ['PP', 'VOX', 'JUNTS', 'UPN'], no: ['PSOE', 'SUMAR', 'ERC', 'BILDU', 'PODEMOS'], abs: ['PNV', 'CC'] }, nv: 'Decayó con la disolución de las Cortes.', fu: [F.leyPP] },
    '¿Tramitar una ley que acaba con las zonas de alquiler limitado, agiliza el desalojo de viviendas ocupadas y reduce quién cuenta como vulnerable ante un desahucio?'],
  ['viv', '13', { id: 'v-temporada', f: '2024-09-17', t: 'Ley de alquileres de temporada (toma en consideración)', marcador: '172-178', estado: 'rechazada', v: { si: ['PSOE', 'SUMAR', 'ERC', 'BILDU', 'BNG', 'PODEMOS', 'PNV', 'CC'], no: ['PP', 'VOX', 'UPN', 'JUNTS'] }, fu: [{ t: 'Junts hace caer la ley para limitar el alquiler temporal (Orain)', u: 'https://orain.eus/es/politica/2024/09/18/junts-se-vuelve-a-descolgar-del-bloque-de-investidura-y-hace-caer-ley-para-limitar-alquiler-temporal/' }] },
    '¿Dar a los alquileres de temporada y por habitaciones las mismas protecciones que al alquiler de vivienda habitual?'],
  ['viv', '14', { id: 'v-fondos', f: '2026-09-15', t: 'Ley de Sumar contra la compra de vivienda por empresas y fondos (toma en consideración)', estado: 'rechazada', v: { si: ['SUMAR'], no: ['PP', 'VOX', 'JUNTS'], abs: ['PSOE', 'PNV'] }, nv: 'El PSOE pasó del sí a la abstención horas antes de votar.', fu: [F.fondos] },
    '¿Prohibir que empresas y fondos de inversión compren viviendas?'],

  ['inm', '15', 'menores', '¿Repartir entre todas las comunidades a los menores migrantes que llegan solos a Canarias, Ceuta y Melilla?'],
  ['inm', '16', 'inmigracat', '¿Traspasar a Cataluña competencias de inmigración?'],
  ['inm', '17', { id: 'v-ilp', f: '2024-04-09', t: 'Iniciativa popular para regularizar a 500.000 inmigrantes (toma en consideración)', marcador: '310-33', estado: 'aprobada', v: { si: ['PSOE', 'PP', 'SUMAR', 'ERC', 'JUNTS', 'BILDU', 'PNV', 'PODEMOS', 'BNG', 'CC', 'UPN'], no: ['VOX'] }, nv: 'Fue solo el primer paso: la ley se quedó en el Congreso sin votación final.', fu: [{ t: 'Todo el Congreso, menos Vox, apoya tramitar la regularización (RTVC)', u: 'https://rtvc.es/todo-el-congreso-menos-vox-apoya-tramitar-la-regularizacion-de-extranjeros/' }] },
    '¿Empezar a tramitar la iniciativa popular para regularizar a unos 500.000 inmigrantes que ya viven en España?'],
  ['inm', '18', { id: 'v-prioridad', f: '2026-04-22', t: 'Moción de Vox sobre «prioridad nacional»', estado: 'rechazada', v: { si: ['VOX'], no: ['PP', 'PSOE', 'SUMAR', 'PNV'] }, nv: 'Pedía repatriar a todos los inmigrantes en situación irregular, la «prioridad nacional» en ayudas y vivienda, quitar la sanidad no urgente a los irregulares y derogar la regularización de 2026. El PP propuso otro texto y Vox no lo aceptó.', fu: [{ t: 'El Gobierno vota con el PP para tumbar la prioridad nacional de Vox (Menorca.info)', u: 'https://www.menorca.info/actualidad/nacional/2026/04/22/2614723/vota-gobierno-para-tumbar-congreso-prioridad-nacional-vox-tras-pactarla-extremadura.html' }] },
    '¿Dar prioridad a los españoles en las ayudas sociales y la vivienda pública y repatriar a todos los inmigrantes en situación irregular?'],
  ['inm', '19', { id: 'v-burka', f: '2026-02-17', t: 'Ley de Vox para prohibir el burka (toma en consideración)', marcador: '170-177', estado: 'rechazada', v: { si: ['VOX', 'PP', 'UPN'], no: ['PSOE', 'SUMAR', 'JUNTS', 'ERC', 'BILDU', 'PNV', 'PODEMOS', 'BNG'], abs: ['CC'] }, fu: [F.burka] },
    '¿Prohibir el burka y el niqab en los espacios públicos?'],

  ['seg', '20', 'multi', '¿Endurecer las penas a quienes cometen muchos delitos leves seguidos, como hurtos repetidos?'],
  ['seg', '21', 'amnistia', '¿Amnistiar a los implicados en el proceso independentista catalán?'],
  ['seg', '22', { id: 'v-cgpj', f: '2024-07-04', t: 'Reforma del Poder Judicial pactada por PSOE y PP (toma en consideración)', marcador: '258-43', estado: 'aprobada', v: { si: ['PSOE', 'PP'], no: ['VOX', 'JUNTS', 'PODEMOS'], abs: ['SUMAR', 'PNV'] }, nv: 'Con ella se renovó el Consejo General del Poder Judicial, bloqueado desde 2018.', fu: [{ t: 'El Congreso da luz verde al pacto de PSOE y PP sobre los órganos judiciales (El Independiente)', u: 'https://www.elindependiente.com/espana/2024/07/04/el-congreso-da-luz-verde-a-la-tramitacion-del-pacto-de-psoe-y-pp-para-despolitizar-los-organos-judiciales/amp/' }] },
    '¿Reformar la ley del Poder Judicial según el pacto de PSOE y PP para renovar el CGPJ, que llevaba años bloqueado?'],
  ['seg', '23', { id: 'v-eficiencia', f: '2024-12-19', t: 'Ley de eficiencia de la Justicia', marcador: '177-171', estado: 'aprobada', v: { si: ['PSOE', 'SUMAR', 'PODEMOS'], no: ['PP', 'VOX'] }, fu: [{ t: 'El Congreso aprueba definitivamente la modernización de la justicia (Legal Today)', u: 'https://www.legaltoday.com/actualidad-juridica/noticias-de-derecho/el-congreso-aprueba-definitivamente-la-modernizacion-de-la-justicia-2024-12-19/' }] },
    '¿Reorganizar los juzgados en tribunales de instancia y obligar a intentar un acuerdo antes de llevar un pleito civil a juicio?'],
  ['seg', '24', { id: 'v-ppr', f: '2026-03-17', t: 'Ley del PP para ampliar la prisión permanente revisable (toma en consideración)', marcador: '172-174', estado: 'rechazada', v: { si: ['PP', 'VOX', 'UPN', 'CC'], no: ['PSOE', 'SUMAR', 'PNV'] }, fu: [F.ppr] },
    '¿Aplicar la prisión permanente revisable a los asesinos que ocultan el cadáver de la víctima y a los reincidentes?'],

  ['ins', '25', 'formentera', '¿Reformar la Constitución para que Formentera tenga un senador propio?'],
  ['ins', '26', 'inv-sanchez', '¿Investir a Pedro Sánchez presidente del Gobierno en noviembre de 2023?'],
  ['ins', '27', 'inv-feijoo', '¿Investir a Alberto Núñez Feijóo presidente del Gobierno en septiembre de 2023?'],
  ['ins', '28', { id: 'v-lenguas', f: '2023-09-21', t: 'Lenguas cooficiales en el Congreso (reforma del Reglamento)', marcador: '180-170', estado: 'aprobada', v: { si: ['PSOE', 'SUMAR', 'ERC', 'JUNTS', 'PNV', 'BILDU', 'BNG', 'CC'], no: ['PP', 'VOX', 'UPN'] }, fu: [{ t: 'El Congreso da vía libre a las lenguas cooficiales con 180 votos (Moncloa.com)', u: 'https://www.moncloa.com/2023/09/21/congreso-da-via-libre-uso-lenguas-cooficiales-180-votos-encima-mayoria-absoluta-2193657/' }] },
    '¿Permitir que los diputados hablen en catalán, euskera y gallego en el Congreso?'],
  ['ins', '29', { id: 'v-confianza', f: '2026-06-25', t: 'Moción del PP: cuestión de confianza', marcador: '178-171', estado: 'aprobada', v: { si: ['PP', 'VOX', 'JUNTS', 'UPN', 'CC'], no: ['PSOE', 'SUMAR', 'ERC', 'BILDU', 'PNV', 'PODEMOS', 'BNG'] }, nv: 'No era vinculante: someterse a una cuestión de confianza solo lo decide el presidente.', fu: [{ t: 'El Congreso aprueba que Sánchez se someta a una cuestión de confianza (Ara)', u: 'https://es.ara.cat/politica/congreso-aprueba-votos-pp-junts-sanchez-someta-cuestion-confianza_1_5779793.html' }] },
    '¿Pedir a Pedro Sánchez que se someta a una cuestión de confianza en el Congreso?'],

  ['ser', '30', 'ela', '¿Aprobar una ley que garantice cuidados y ayudas a las personas con ELA?'],
  ['ser', '31', { id: 'v-aesap', f: '2025-03-20', t: 'Agencia Estatal de Salud Pública', marcador: '167-176', estado: 'rechazada', v: { si: ['PSOE', 'SUMAR'], no: ['PP', 'VOX', 'JUNTS'] }, nv: 'El Gobierno la volvió a presentar y se aprobó en julio de 2025.', fu: [{ t: 'El Congreso tumba la Agencia Estatal de Salud Pública (El Debate)', u: 'https://www.eldebate.com/espana/20250320/congreso-tumba-agencia-estatal-salud-publica-gobierno-votos-contra-pp-vox-junts_280717.html' }] },
    '¿Crear una Agencia Estatal de Salud Pública para coordinar la vigilancia de epidemias y las alertas sanitarias?'],
  ['ser', '32', { id: 'v-ratios', f: '2026-06-18', t: 'Ley de ratios y horas lectivas (debate de totalidad)', estado: 'aprobada', eTxt: '✓ Siguió adelante', v: { si: ['PSOE', 'SUMAR', 'ERC', 'BILDU', 'PP', 'VOX'], no: ['PNV', 'JUNTS'] }, nv: 'Se votaron las enmiendas de PNV y Junts para devolver la ley: aquí, «a favor» es rechazarlas para que siga. Decayó con la disolución de las Cortes.', fu: [{ t: 'La ley que reduce las ratios supera las enmiendas (Qué!)', u: 'https://www.que.es/2026/06/19/reduccion-ratios-aulas-ley/' }] },
    '¿Limitar por ley los alumnos por aula (22 en Primaria y 25 en Secundaria) y reducir las horas de clase del profesorado?'],
  ['ser', '33', { id: 'v-dependencia', f: '2026-07-14', t: 'Decreto de financiación de la dependencia', estado: 'aprobada', v: { si: ['PSOE', 'SUMAR', 'PP', 'JUNTS', 'ERC', 'BILDU', 'PNV'], no: ['VOX'] }, nv: 'Sube la ayuda mínima al gran dependiente de 290 a 660 euros al mes.', fu: [{ t: 'Giro histórico en la dependencia (El Independiente)', u: 'https://www.elindependiente.com/espana/2026/07/14/congreso-giro-historico-dependencia-financiacion-desburocratizacion-bustinduy/' }] },
    '¿Aumentar la financiación de la ley de dependencia y subir las ayudas a quienes necesitan más cuidados?'],
  ['ser', '34', { id: 'v-permisos', f: '2025-09-09', t: 'Ampliación de los permisos por nacimiento y cuidado', marcador: '313 a favor', estado: 'aprobada', v: { si: ['PSOE', 'PP', 'SUMAR', 'ERC', 'JUNTS', 'BILDU', 'PNV', 'PODEMOS', 'BNG', 'CC'], abs: ['VOX'] }, fu: [{ t: 'El Congreso aprueba la ampliación de los permisos por nacimiento (La Moncloa)', u: 'https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/trabajo14/paginas/2025/090925-real-decreto-ley-permisos-nacimientos.aspx' }] },
    '¿Ampliar el permiso por nacimiento a 17 semanas por progenitor, más dos semanas pagadas para cuidar hasta los 8 años?'],

  ['ene', '35', 'apagon', '¿Aprobar el decreto «antiapagones» para reforzar el sistema eléctrico tras el apagón de 2025?'],
  ['ene', '36', { id: 'v-nucleares', f: '2025-02-12', t: 'Proposición del PP para prorrogar las nucleares', estado: 'aprobada', v: { si: ['PP', 'VOX', 'UPN'], no: ['PSOE', 'SUMAR'], abs: ['ERC', 'JUNTS'] }, fu: [{ t: 'El Congreso pide prolongar las nucleares (The Objective)', u: 'https://theobjective.com/espana/politica/2025-02-12/congreso-prolongar-erc-junts/' }] },
    '¿Pedir al Gobierno que alargue la vida de las centrales nucleares?'],
  ['ene', '37', { id: 'v-almaraz', f: '2025-11-13', t: 'Enmienda del PP contra las fechas de cierre nuclear', marcador: '171-172', estado: 'rechazada', v: { si: ['PP', 'VOX', 'UPN'], no: ['PSOE', 'SUMAR', 'ERC', 'PNV'], abs: ['JUNTS'] }, fu: [{ t: 'Junts se abstiene en la prórroga de las nucleares del PP (Ara)', u: 'https://es.ara.cat/economia/abstiene-prorroga-pp-nucleares-evita-quebradero-cabeza-sanchez_1_5560420.html' }] },
    '¿Suprimir por ley las fechas de cierre de las centrales de Almaraz, Ascó y Cofrentes?'],
  ['ene', '38', { id: 'v-movilidad', f: '2025-10-08', t: 'Ley de Movilidad Sostenible', estado: 'aprobada', v: { si: ['PSOE', 'SUMAR', 'JUNTS'], no: ['PP', 'VOX'], abs: ['PODEMOS'] }, fu: [{ t: 'El Congreso da luz verde a la Ley de Movilidad Sostenible (La Moncloa)', u: 'https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/transportes-movilidad-sostenible/Paginas/2025/081025-proyecto-ley-movilidad-sostenible.aspx' }] },
    '¿Aprobar la ley de movilidad sostenible, que impulsa el tren y el transporte público y limita los vuelos cortos con alternativa en tren?'],
  ['ene', '39', { id: 'v-energeticas', f: '2025-01-22', t: 'Decreto del gravamen a las energéticas', marcador: '165-183', estado: 'rechazada', v: { si: ['PSOE', 'SUMAR', 'ERC', 'BILDU', 'PODEMOS', 'BNG'], no: ['PP', 'VOX', 'JUNTS', 'PNV', 'UPN'], abs: ['CC'] }, fu: [F.energ] },
    '¿Mantener en 2025 el impuesto extraordinario a las grandes empresas energéticas?'],

  ['der', '40', 'art49', '¿Reformar la Constitución para hablar de «personas con discapacidad» en vez de «disminuidos»?'],
  ['der', '41', { id: 'v-paridad', f: '2024-07-23', t: 'Ley de Paridad', estado: 'aprobada', v: { si: ['PSOE', 'SUMAR', 'ERC', 'JUNTS', 'BILDU', 'PNV', 'PODEMOS', 'BNG', 'CC'], no: ['PP', 'VOX', 'UPN'] }, fu: [{ t: 'Aprobada la Ley de Paridad (Moncloa.com)', u: 'https://www.moncloa.com/2024/07/23/aprobada-ley-paridad-2789766/' }] },
    '¿Exigir al menos un 40 % de mujeres en listas electorales, consejos de ministros y consejos de las grandes empresas?'],
  ['der', '42', { id: 'v-aborto', f: '2026-04-30', t: 'Reforma constitucional del aborto (debate de totalidad)', marcador: '177-171', estado: 'aprobada', eTxt: '✓ Siguió adelante', v: { si: ['PSOE', 'SUMAR'], no: ['PP', 'VOX'] }, nv: 'Se votaron las enmiendas de PP y Vox para devolver la reforma: aquí, «a favor» es rechazarlas para que siga. Decayó con la disolución de las Cortes.', fu: [{ t: 'El Congreso rechaza las enmiendas de PP y Vox a incluir el aborto en la Constitución (El Salto)', u: 'https://www.elsaltodiario.com/derechos-reproductivos/congreso-rechaza-enmiendas-totalidad-pp-vox-incluir-aborto-constitucion' }] },
    '¿Incluir el derecho al aborto en la Constitución?'],
  ['der', '43', { id: 'v-saharauis', f: '2025-02-25', t: 'Nacionalidad para los saharauis (toma en consideración)', marcador: '195-116', estado: 'aprobada', v: { si: ['PP', 'SUMAR'], no: ['PSOE'], abs: ['VOX'] }, fu: [{ t: 'El Congreso acepta tramitar la ley de Sumar pese al no del PSOE (Noticias de Navarra)', u: 'https://www.noticiasdenavarra.com/politica/2025/02/25/congreso-acepta-tramitar-ley-sumar-9323266.html' }] },
    '¿Facilitar la nacionalidad española a los saharauis nacidos cuando el Sáhara era territorio español?'],
  ['der', '44', { id: 'v-pactovg', f: '2025-02-26', t: 'Renovación del Pacto de Estado contra la Violencia de Género', estado: 'aprobada', v: { si: ['PP', 'PSOE', 'SUMAR', 'ERC', 'JUNTS', 'BILDU', 'PNV', 'PODEMOS', 'BNG', 'CC'], no: ['VOX'] }, fu: [{ t: 'El nuevo pacto contra las violencias machistas une a todos menos a Vox (La Marea)', u: 'https://lamarea.com/2025/02/26/el-nuevo-pacto-contra-las-violencias-machistas-une-a-todos-los-partidos-menos-a-vox' }] },
    '¿Renovar el Pacto de Estado contra la Violencia de Género, con 462 medidas y al menos 1.500 millones de euros?'],

  ['ext', '45', 'embargo', '¿Prohibir por ley la compraventa de armas con Israel por la guerra de Gaza?'],
  ['ext', '46', 'venezuela', '¿Pedir al Gobierno que reconozca a Edmundo González como presidente electo de Venezuela?'],
  ['ext', '47', { id: 'v-defensa', f: '2024-05-22', t: 'Gasto en defensa del 2 % del PIB', estado: 'aprobada', v: { si: ['PP', 'PSOE', 'VOX', 'PNV'], no: ['SUMAR', 'ERC', 'BILDU', 'PODEMOS', 'BNG'] }, fu: [F.defensa] },
    '¿Comprometerse a gastar en defensa el 2 % del PIB, como pide la OTAN?'],
  ['ext', '48', { id: 'v-sahara', f: '2024-06-20', t: 'Moción del PP sobre el Sáhara Occidental', estado: 'aprobada', v: { si: ['PP', 'VOX', 'SUMAR', 'JUNTS', 'ERC', 'PNV'], no: ['PSOE'] }, nv: 'Votación del punto que pedía recuperar la neutralidad.', fu: [F.sahara] },
    '¿Pedir al Gobierno que recupere la neutralidad en el Sáhara Occidental y deje de apoyar el plan de autonomía de Marruecos?'],
  ['ext', '49', { id: 'v-otan', f: '2026-04-22', t: 'Moción de Podemos: referéndum sobre la OTAN', estado: 'rechazada', v: { si: ['ERC', 'BILDU', 'BNG', 'PODEMOS'], no: ['PP', 'PSOE', 'VOX', 'PNV', 'JUNTS', 'UPN'], abs: ['SUMAR', 'CC'] }, fu: [F.otan] },
    '¿Convocar un referéndum sobre la salida de España de la OTAN?']
];

// ---------- propuestas ----------
// [tema, código, id, pregunta, {PP:[pos, porque, fu], PSOE:[…], VOX:[…], FA:[…]}, opciones]
const P = [
  ['eco', '50', 'impuestos', null], // ya existía: se conserva tal cual
  ['eco', '51', 'sucesiones', '¿Fijar un impuesto de sucesiones mínimo en toda España, que las comunidades no puedan rebajar?', {
    PP: [-1, 'Su programa (medida 185): ningún Gobierno obligará a una comunidad a subir impuestos y podrán bajarlos cuanto quieran.', F.pp],
    PSOE: [null, 'Su resolución de 2024 no fija una posición: no se cuenta esta pregunta para el PSOE.', F.psoe],
    VOX: [-1, 'Propone suprimir los impuestos de sucesiones y patrimonio.', F.voxDes],
    FA: [1, 'Sumar, del que procede, proponía un mínimo estatal en sucesiones que las comunidades no pudieran rebajar.', F.sumar] }],
  ['eco', '52', 'deflactar', '¿Ajustar cada año el IRPF a la inflación, para que la subida de precios no se convierta en una subida de impuestos?', {
    PP: [1, 'Su programa (medida 178): deflactar la tarifa y actualizar el impuesto con la inflación.', F.pp],
    PSOE: [-1, 'Votó en contra de la moción de Junts que lo pedía (26-6-2025).', F.junts],
    VOX: [1, 'Votó a favor de la moción de Junts que lo pedía (26-6-2025).', F.junts],
    FA: [-1, 'Sumar, del que procede, votó en contra de esa moción.', F.junts] }],
  ['eco', '53', 'gravamenes', '¿Mantener impuestos extraordinarios a la banca y a las grandes energéticas?', {
    PP: [-1, 'Votó en contra de prorrogar el gravamen energético (22-1-2025); su programa elimina «los impuestos que frenan la inversión» (medida 183).', F.energ],
    PSOE: [1, 'Su Gobierno los creó en 2022 y votó a favor de prorrogar el energético.', F.energ],
    VOX: [-1, 'Votó en contra de prorrogar el gravamen energético.', F.energ],
    FA: [1, 'Colau propone más impuestos a la banca y a las grandes empresas; Sumar pedía mantener los gravámenes extraordinarios.', F.colau] }],
  ['eco', '54', 'sociedades', '¿Bajar el impuesto de sociedades que pagan las empresas?', {
    PP: [1, 'Su programa (medida 181): pagarán menos sociedades las empresas que inviertan.', F.pp],
    PSOE: [-1, 'Su Gobierno fijó en 2024 un mínimo del 15 % para grandes empresas y multinacionales.', fuVot('fiscal')],
    VOX: [1, 'Su programa baja el IRPF, el IVA y el impuesto de sociedades.', F.vox],
    FA: [-1, 'Propone más carga fiscal para la banca y las grandes empresas.', F.colau] }],

  ['tra', '55', 'pensiones', null],
  ['tra', '56', 'jornada36', '¿Seguir bajando por ley la jornada laboral, hasta unas 36 horas semanales o menos, sin bajar el sueldo?', {
    PP: [-1, 'Votó en contra de reducir la jornada a 37,5 horas (10-9-2025).', fuVot('jornada')],
    PSOE: [1, 'Su resolución de 2024: que no se trabaje más de 36 horas de media en 2030, sin bajar el sueldo.', F.psoe],
    VOX: [-1, 'Votó en contra de reducir la jornada a 37,5 horas.', fuVot('jornada')],
    FA: [1, 'Sumar, del que procede, proponía 37,5 horas por ley y seguir bajando hasta 32.', F.sumar] }],
  ['tra', '57', 'permisos', '¿Ampliar más los permisos pagados por nacimiento y para cuidar a los hijos?', {
    PP: [1, 'Su programa (medida 160): ampliaremos los permisos por nacimiento.', F.pp],
    PSOE: [1, 'Su Gobierno los amplió en 2025 a 19 semanas por progenitor.', { t: 'Ampliación de los permisos por nacimiento (La Moncloa)', u: 'https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/trabajo14/paginas/2025/090925-real-decreto-ley-permisos-nacimientos.aspx' }],
    VOX: [0, 'Se abstuvo en la ampliación de 2025, por dudas sobre su coste.', { t: 'Apoyo unánime a los permisos parentales, salvo Vox (Diario de León)', u: 'https://www.diariodeleon.es/sociedad/250909/2059289/apoyo-unanime-permisos-parentales-salvo-vox-abstiene.html' }],
    FA: [1, 'Sumar, del que procede, proponía ampliar y pagar el permiso parental.', F.sumar] }],
  ['tra', '58', 'sindicatos', '¿Retirar las subvenciones públicas a sindicatos y organizaciones empresariales?', {
    PP: [null, 'Su programa no lo plantea: no se cuenta esta pregunta para el PP.', F.pp],
    PSOE: [-1, 'Su resolución de 2024 propone dar nuevos recursos y más representación a los sindicatos.', F.psoe],
    VOX: [1, 'Su programa: fin progresivo de las subvenciones a partidos, sindicatos, patronales y ONG.', F.vox],
    FA: [-1, 'Sumar, del que procede, quería reforzar el papel de los sindicatos.', F.sumar] }],
  ['tra', '59', 'autonomos', '¿Que los autónomos que ganan menos del salario mínimo no paguen cuota a la Seguridad Social?', {
    PP: [0, 'Su programa (medida 170) lo limita a los nuevos autónomos: sin cuota el primer año, y el segundo si no llegan al salario mínimo.', F.pp],
    PSOE: [null, 'No hay una posición documentada: no se cuenta esta pregunta para el PSOE.', F.psoe],
    VOX: [1, 'Su programa: cuota de cero euros para los autónomos que ingresen menos del salario mínimo.', F.vox],
    FA: [0, 'Sumar, del que procede, proponía una cuota fija bonificada, no gratuita, para los autónomos con ingresos bajos.', F.sumar] }],

  ['viv', '60', 'alquiler', null],
  ['viv', '61', 'okupas', '¿Una ley para desalojar a los okupas en 24 o 48 horas?', {
    PP: [1, 'Su programa (medida 157): el propietario recuperará su vivienda en 48 horas por orden judicial.', F.pp],
    PSOE: [-1, 'Votó en contra de la ley del PP que agilizaba los desalojos (21-4-2026).', F.leyPP],
    VOX: [1, 'Su programa: desalojo en menos de 24 horas.', F.vox],
    FA: [-1, 'Sumar, del que procede, votó en contra de esa ley del PP.', F.leyPP] }],
  ['viv', '62', 'fondosviv', '¿Prohibir que empresas y fondos de inversión compren viviendas?', {
    PP: [-1, 'Votó en contra de la ley de Sumar que lo proponía (15-9-2026).', F.fondos],
    PSOE: [0, 'Se abstuvo en esa ley; su resolución de 2024 dice que la vivienda no debe ser un activo para especular.', F.fondos],
    VOX: [-1, 'Votó en contra de esa ley.', F.fondos],
    FA: [1, 'Colau propone prohibir la compra por fondos y expropiar viviendas a los grandes fondos.', F.colau] }],
  ['viv', '63', 'parquepublico', '¿Que el Estado construya y gestione directamente vivienda pública de alquiler?', {
    PP: [0, 'Su programa (medida 144) cede suelo público a promotores y cooperativas para un millón de viviendas, sin gestión pública directa.', F.pp],
    PSOE: [1, 'Propone la empresa pública Casa 47 como promotora de alquiler asequible.', F.vivPSOE],
    VOX: [null, 'Su programa no lo plantea: no se cuenta esta pregunta para Vox.', F.vox],
    FA: [1, 'Propone invertir el 1 % del PIB en vivienda pública.', F.vivPSOE] }],
  ['viv', '64', 'desahucios', '¿Prohibir los desahucios de familias vulnerables mientras no tengan otra vivienda?', {
    PP: [-1, 'Votó en contra de mantener la suspensión de desahucios (2026).', fuVot('escudo')],
    PSOE: [1, 'Propone recuperar el freno a los desahucios de personas vulnerables.', F.vivPSOE],
    VOX: [-1, 'Votó en contra de mantener la suspensión de desahucios.', fuVot('escudo')],
    FA: [1, 'Sumar, del que procede, votó a favor de la suspensión.', fuVot('escudo')] }],

  ['inm', '65', 'regularizacion', null],
  ['inm', '66', 'sanidadirreg', '¿Que la sanidad pública ordinaria sea solo para quien reside legalmente en España, salvo urgencias?', {
    PP: [null, 'Su programa no lo plantea: no se cuenta esta pregunta para el PP.', F.pp],
    PSOE: [-1, 'Su resolución de 2024 defiende la sanidad pública universal y gratuita como derecho.', F.psoe],
    VOX: [1, 'Su programa: fuera de la atención ordinaria los extranjeros sin residencia legal, salvo urgencia grave.', F.vox],
    FA: [-1, 'Sumar, del que procede, votó en contra de la moción de Vox que lo pedía (22-4-2026).', { t: 'El Gobierno vota con el PP para tumbar la prioridad nacional de Vox (Menorca.info)', u: 'https://www.menorca.info/actualidad/nacional/2026/04/22/2614723/vota-gobierno-para-tumbar-congreso-prioridad-nacional-vox-tras-pactarla-extremadura.html' }] }],
  ['inm', '67', 'menoresretorno', '¿Devolver a los menores migrantes que llegan solos con sus familias o a centros de su país?', {
    PP: [1, 'Su programa (medida 46): el regreso con sus familias será el objetivo prioritario.', F.pp],
    PSOE: [-1, 'Su Gobierno aprobó repartirlos entre las comunidades autónomas.', fuVot('menores')],
    VOX: [1, 'Su programa: devolverlos a sus familias o a instituciones de su país.', F.vox],
    FA: [-1, 'Sumar, del que procede, votó a favor del reparto entre comunidades.', fuVot('menores')] }],
  ['inm', '68', 'burkaprop', '¿Prohibir el burka y el niqab en los espacios públicos?', {
    PP: [1, 'Su programa (medida 43) lo prohíbe.', F.pp],
    PSOE: [-1, 'Votó en contra de la ley de Vox que lo prohibía (17-2-2026).', F.burka],
    VOX: [1, 'Su programa lo prohíbe.', F.vox],
    FA: [-1, 'Sumar, del que procede, votó en contra de esa ley.', F.burka] }],
  ['inm', '69', 'inmlaboral', '¿Facilitar que vengan trabajadores extranjeros a los sectores donde faltan, con visados y contratos en origen?', {
    PP: [1, 'Su programa (medidas 40 y 41): visados por puntos, contrato en origen y cupos anuales por sectores.', F.pp],
    PSOE: [1, 'Su resolución de 2024: facilitar la inmigración laboral y la atracción de talento.', F.psoe],
    VOX: [-1, 'Su programa se opone a la «inmigración masiva» y propone la «remigración».', F.vox],
    FA: [null, 'No hay una posición documentada sobre este punto: no se cuenta esta pregunta para Frente Amplio.', F.colau] }],

  ['seg', '70', 'pprprop', '¿Mantener y ampliar la prisión permanente revisable?', {
    PP: [1, 'Propuso ampliarla a quien oculta el cadáver y a los reincidentes (2026).', F.ppr],
    PSOE: [-1, 'Votó en contra de ampliarla (17-3-2026).', F.ppr],
    VOX: [1, 'Su programa: ampliar la prisión permanente revisable.', F.vox],
    FA: [-1, 'Sumar, del que procede, proponía eliminarla.', F.sumar] }],
  ['seg', '71', 'desordenes', '¿Endurecer las penas por disturbios y desórdenes públicos y dar más cobertura legal a la actuación policial?', {
    PP: [1, 'Su programa (medidas 21 a 24): más penas por disturbios violentos, agravante por ocultar el rostro y más cobertura a la policía.', F.pp],
    PSOE: [null, 'No hay una posición documentada: no se cuenta esta pregunta para el PSOE.', F.psoe],
    VOX: [1, 'Su programa: endurecer el Código Penal y reforzar Policía y Guardia Civil.', F.vox],
    FA: [-1, 'Sumar, del que procede, proponía derogar en parte la «ley mordaza» y revisar los delitos de opinión.', F.sumar] }],
  ['seg', '72', 'multiprop', '¿Endurecer las penas a los multirreincidentes, como quien comete hurtos una y otra vez?', {
    PP: [1, 'Votó a favor de la ley contra la multirreincidencia (26-3-2026).', fuVot('multi')],
    PSOE: [1, 'Votó a favor de esa ley.', fuVot('multi')],
    VOX: [-1, 'Votó en contra de esa ley.', fuVot('multi')],
    FA: [-1, 'Sumar, del que procede, votó en contra de esa ley.', fuVot('multi')] }],
  ['seg', '73', 'sedicion', '¿Recuperar el delito de sedición en el Código Penal?', {
    PP: [1, 'Su programa (medida 17): recuperar la sedición y el delito de convocar un referéndum ilegal.', F.pp],
    PSOE: [-1, 'Su Gobierno suprimió el delito de sedición en 2022.', F.sedicion],
    VOX: [null, 'Su programa no lo menciona: no se cuenta esta pregunta para Vox.', F.vox],
    FA: [null, 'No hay una posición documentada: no se cuenta esta pregunta para Frente Amplio.', F.colau] }],
  ['seg', '74', 'cgpjjueces', '¿Que los propios jueces elijan a los vocales judiciales del Consejo General del Poder Judicial, en vez del Parlamento?', {
    PP: [1, 'Su programa (medida 72): los jueces elegirán a los doce vocales judiciales.', F.pp],
    PSOE: [null, 'Su resolución de 2024 solo pide evitar nuevos bloqueos: no se cuenta esta pregunta para el PSOE.', F.psoe],
    VOX: [1, 'Propone que los miembros del CGPJ sean elegidos por y entre jueces.', F.vox18],
    FA: [null, 'No hay una posición documentada: no se cuenta esta pregunta para Frente Amplio.', F.colau] }],

  ['ins', '75', 'amnistiaderog', '¿Derogar la ley de amnistía?', {
    PP: [1, 'Su programa (medida 60): derogar la ley de amnistía.', F.pp],
    PSOE: [-1, 'La aprobó en 2024.', fuVot('amnistia')],
    VOX: [1, 'Votó en contra de la ley y se opone a ella.', fuVot('amnistia')],
    FA: [-1, 'Sumar, del que procede, votó a favor de la ley.', fuVot('amnistia')] }],
  ['ins', '76', 'lenguascong', '¿Que en el Congreso se pueda hablar en catalán, euskera y gallego?', {
    PP: [-1, 'Su programa (medida 127): el castellano volverá a ser la lengua de trabajo en el Congreso.', F.pp],
    PSOE: [1, 'Votó a favor de permitirlo (2023).', { t: 'El Congreso da vía libre a las lenguas cooficiales (Moncloa.com)', u: 'https://www.moncloa.com/2023/09/21/congreso-da-via-libre-uso-lenguas-cooficiales-180-votos-encima-mayoria-absoluta-2193657/' }],
    VOX: [-1, 'Votó en contra.', { t: 'El Congreso da vía libre a las lenguas cooficiales (Moncloa.com)', u: 'https://www.moncloa.com/2023/09/21/congreso-da-via-libre-uso-lenguas-cooficiales-180-votos-encima-mayoria-absoluta-2193657/' }],
    FA: [1, 'Sumar, del que procede, votó a favor.', { t: 'El Congreso da vía libre a las lenguas cooficiales (Moncloa.com)', u: 'https://www.moncloa.com/2023/09/21/congreso-da-via-libre-uso-lenguas-cooficiales-180-votos-encima-mayoria-absoluta-2193657/' }] }],
  ['ins', '77', 'recentralizar', '¿Devolver al Estado las competencias de educación y sanidad que hoy gestionan las comunidades autónomas?', {
    PP: [-1, 'Su programa mantiene esas competencias en las comunidades y propone estándares comunes.', F.pp],
    PSOE: [-1, 'Su resolución de 2024 defiende un Estado autonómico reforzado y avanzar en la federalización.', F.psoe],
    VOX: [1, 'Propone devolver al Estado educación, sanidad, seguridad y justicia.', F.vox18],
    FA: [-1, 'Sumar, del que procede, define España como plurinacional y defiende un pacto territorial.', F.sumar] }],
  ['ins', '78', 'financiacion', '¿Reformar la financiación autonómica reconociendo las «singularidades» de cada comunidad, como pide Cataluña?', {
    PP: [-1, 'Su programa (medidas 100 y 101): mismas reglas para todas y ninguna comunidad fuera del sistema común.', F.pp],
    PSOE: [1, 'Su resolución de 2024: más recursos para todas, compatibilizando la solidaridad con el reconocimiento de las singularidades.', F.psoe],
    VOX: [-1, 'Defiende un solo Gobierno y un solo Parlamento para toda España, sin privilegios territoriales.', F.vox18],
    FA: [null, 'No hay una posición documentada: no se cuenta esta pregunta para Frente Amplio.', F.colau] }],
  ['ins', '79', 'voto16', '¿Rebajar a 16 años la edad para votar?', {
    PP: [null, 'Su programa no lo plantea: no se cuenta esta pregunta para el PP.', F.pp],
    PSOE: [1, 'Su resolución de 2024: reformar la ley electoral para que voten los mayores de 16 años.', F.psoe],
    VOX: [null, 'Su programa no lo plantea: no se cuenta esta pregunta para Vox.', F.vox],
    FA: [1, 'Sumar, del que procede, proponía el voto a partir de los 16 años.', F.sumar] }],

  ['ser', '80', 'conciertos', '¿Mantener los conciertos educativos y que los padres puedan elegir colegio, también concertado?', {
    PP: [1, 'Su programa (medida 212): libre elección de centro y ningún concierto se eliminará donde haya demanda.', F.pp],
    PSOE: [-1, 'Su resolución de 2024 prioriza la escuela pública y pide frenar la «ola de privatizaciones».', F.psoe],
    VOX: [1, 'Su programa: libre elección de centro.', F.vox],
    FA: [-1, 'Sumar, del que procede, apostaba por reforzar la pública y la regulación pública de la concertada.', F.sumar] }],
  ['ser', '81', 'lomloe', '¿Derogar la ley educativa actual (LOMLOE)?', {
    PP: [1, 'Su programa propone una nueva ley que sustituya a la LOMLOE.', F.pp],
    PSOE: [-1, 'La aprobó su Gobierno en 2020.', F.lomloe],
    VOX: [1, 'Su programa: derogar la LOMLOE.', F.vox],
    FA: [-1, 'Sumar, del que procede, proponía desarrollarla, no derogarla.', F.sumar] }],
  ['ser', '82', 'gratis03', '¿Escuela infantil de 0 a 3 años gratuita para todos los niños?', {
    PP: [1, 'Su programa (medida 163): gratuita al terminar la legislatura, pública o concertada.', F.pp],
    PSOE: [1, 'Su resolución de 2024: universalizar la educación pública y gratuita de 0 a 3 años.', F.psoe],
    VOX: [null, 'Su programa no lo plantea: no se cuenta esta pregunta para Vox.', F.vox],
    FA: [1, 'Sumar, del que procede, proponía escuelas infantiles universales y gratuitas.', F.sumar] }],
  ['ser', '83', 'sanidadprivada', '¿Reducir la gestión privada en la sanidad pública, incluido que los funcionarios de Muface pasen a la pública?', {
    PP: [-1, 'Defiende mantener Muface, con aseguradoras privadas, con un modelo sostenible.', F.muface],
    PSOE: [1, 'Su Gobierno aprobó en 2026 el proyecto de ley que limita la gestión privada en la sanidad pública.', F.sns],
    VOX: [null, 'Su programa no lo plantea: no se cuenta esta pregunta para Vox.', F.vox],
    FA: [1, 'Sumar, del que procede, proponía integrar a los mutualistas de Muface en la sanidad pública.', F.sumar] }],
  ['ser', '84', 'castellano', '¿Garantizar por ley poder estudiar en castellano en toda España, también donde hay otra lengua oficial?', {
    PP: [1, 'Su programa (medida 96): derecho a recibir enseñanza en castellano en todas las etapas y en toda España.', F.pp],
    PSOE: [-1, 'Su ley educativa (LOMLOE, 2020) dejó de fijar el castellano como lengua vehicular.', F.lomloe],
    VOX: [1, 'Su programa: educación en español en todo el territorio.', F.vox],
    FA: [null, 'No hay una posición documentada: no se cuenta esta pregunta para Frente Amplio.', F.colau] }],

  ['ene', '85', 'nucleares', null],
  ['ene', '86', 'combustion', '¿Mantener que desde 2035 no se puedan vender coches nuevos de gasolina o diésel?', {
    PP: [0, 'Su programa (medida 232) mantiene la descarbonización, pero pide revisar los ritmos y frenar «calendarios imposibles».', F.pp],
    PSOE: [1, 'Su resolución de 2024 impulsa el coche eléctrico, con un plan de alquiler con opción a compra.', F.psoe],
    VOX: [-1, 'Su programa: revertir las restricciones a los motores de combustión.', F.vox],
    FA: [1, 'Sumar, del que procede, quería que en 2040 no circulara ningún coche de combustión.', F.sumar] }],
  ['ene', '87', 'zbe', '¿Mantener las zonas de bajas emisiones en las ciudades?', {
    PP: [1, 'Votó en contra de la propuesta de Vox para eliminarlas.', F.zbe],
    PSOE: [1, 'Votó en contra de la propuesta de Vox para eliminarlas.', F.zbe],
    VOX: [-1, 'Su programa: acabar con las zonas de bajas emisiones.', F.vox],
    FA: [1, 'Sumar, del que procede, quería reducir el coche de combustión en las ciudades.', F.sumar] }],
  ['ene', '88', 'renovables', '¿Acelerar la transición a las renovables, con el objetivo de una electricidad 100 % renovable hacia 2035?', {
    PP: [0, 'Su programa defiende la descarbonización, con nucleares y revisando los ritmos de cada sector.', F.pp],
    PSOE: [1, 'Su resolución de 2024: más del 80 % de electricidad renovable en 2030 y el 100 % en 2035.', F.psoe],
    VOX: [-1, 'Su programa rechaza el Pacto Verde Europeo y la Agenda 2030.', F.vox],
    FA: [1, 'Sumar, del que procede, proponía un plan nacional de transición energética.', F.sumar] }],
  ['ene', '89', 'impluz', '¿Suprimir el impuesto del 7 % a la producción de electricidad para abaratar la luz?', {
    PP: [1, 'Su programa (medida 229): eliminarlo de inmediato.', F.pp],
    PSOE: [-1, 'Votó en contra de la moción de Junts que pedía dejarlo a cero (26-6-2025).', F.junts],
    VOX: [1, 'Votó a favor de esa moción.', F.junts],
    FA: [-1, 'Sumar, del que procede, votó en contra de esa moción.', F.junts] }],

  ['der', '90', 'abortoconst', '¿Incluir el derecho al aborto en la Constitución?', {
    PP: [-1, 'Votó para devolver la reforma al Gobierno (30-4-2026).', { t: 'El Congreso rechaza las enmiendas de PP y Vox (El Salto)', u: 'https://www.elsaltodiario.com/derechos-reproductivos/congreso-rechaza-enmiendas-totalidad-pp-vox-incluir-aborto-constitucion' }],
    PSOE: [1, 'Sánchez propone blindarlo en la Constitución.', F.abortoPSOE],
    VOX: [-1, 'Votó para devolver la reforma; defiende la vida «desde la concepción».', F.vox],
    FA: [1, 'Sumar, del que procede, propuso blindarlo en la Constitución.', F.abortoSumar] }],
  ['der', '91', 'eutanasia', '¿Mantener la ley de eutanasia?', {
    PP: [0, 'Su programa (medida 226) propone una ley de cuidados paliativos para que nadie se vea «empujado» a adelantar su muerte; no plantea derogarla.', F.pp],
    PSOE: [1, 'Su resolución de 2024 presenta el derecho a una muerte digna como un logro propio.', F.psoe],
    VOX: [-1, 'Su programa defiende la vida «hasta la muerte natural».', F.vox],
    FA: [1, 'Sumar, del que procede, defendía la muerte digna según la ley de eutanasia.', F.sumar] }],
  ['der', '92', 'memoria', '¿Derogar la ley de memoria democrática?', {
    PP: [1, 'Su programa (medida 129): derogarla y aprobar una ley de concordia.', F.pp],
    PSOE: [-1, 'La aprobó su Gobierno en 2022 y la defiende.', F.psoe],
    VOX: [1, 'Su programa: derogarla.', F.vox],
    FA: [-1, 'Sumar, del que procede, la consideraba un avance que había que ampliar.', F.sumar] }],
  ['der', '93', 'leytrans', '¿Mantener que cualquier persona pueda cambiar su sexo en el Registro Civil sin informes médicos?', {
    PP: [-1, 'Su programa (medida 115): eliminar la libre autodeterminación registral del sexo.', F.pp],
    PSOE: [1, 'Lo estableció su Gobierno con la ley trans de 2023.', F.trans],
    VOX: [-1, 'Rechaza las leyes de género y que la sanidad pública cubra los cambios de sexo.', F.vox18],
    FA: [1, 'Sumar, del que procede, defendía los derechos de las personas trans.', F.sumar] }],
  ['der', '94', 'violenciagenero', '¿Mantener una ley específica contra la violencia de género, que protege a las mujeres?', {
    PP: [1, 'Su programa refuerza los medios contra la violencia de género y votó el Pacto de Estado de 2025.', F.pp],
    PSOE: [1, 'La aprobó en 2004 y la defiende.', F.psoe],
    VOX: [-1, 'Su programa: derogar las leyes de género.', F.vox],
    FA: [1, 'Sumar, del que procede, votó el Pacto de Estado de 2025.', { t: 'El nuevo pacto contra las violencias machistas une a todos menos a Vox (La Marea)', u: 'https://lamarea.com/2025/02/26/el-nuevo-pacto-contra-las-violencias-machistas-une-a-todos-los-partidos-menos-a-vox' }] }],

  ['ext', '95', 'defensa2', '¿Subir el gasto en defensa al menos hasta el 2 % del PIB?', {
    PP: [1, 'Votó a favor del 2 % (2024); su programa (medida 52) propone una ley de financiación de la defensa.', F.defensa],
    PSOE: [1, 'Su resolución de 2024: reforzar el compromiso de gastar el 2 % del PIB en defensa.', F.psoe],
    VOX: [1, 'Votó a favor del 2 % y propone aumentar el presupuesto de Defensa.', F.defensa],
    FA: [-1, 'Sumar, del que procede, votó en contra.', F.defensa] }],
  ['ext', '96', 'saharaprop', '¿Apoyar el plan de autonomía de Marruecos para el Sáhara Occidental?', {
    PP: [-1, 'Votó por recuperar la neutralidad (2024); su programa (medida 239) apoya una solución acordada en la ONU.', F.sahara],
    PSOE: [1, 'Su Gobierno apoya ese plan desde 2022 y votó en contra de rectificar.', F.sahara],
    VOX: [-1, 'Votó por recuperar la neutralidad y propone revisar las relaciones con Marruecos.', F.sahara],
    FA: [-1, 'Sumar, del que procede, quería dar marcha atrás al giro de 2022.', F.sumar] }],
  ['ext', '97', 'otanprop', '¿Plantear la salida de España de la OTAN?', {
    PP: [-1, 'Votó en contra del referéndum que proponía Podemos (22-4-2026).', F.otan],
    PSOE: [-1, 'Votó en contra: salir haría a España «más vulnerable».', F.otan],
    VOX: [-1, 'Votó en contra.', F.otan],
    FA: [0, 'Sumar, del que procede, se abstuvo: apoya la idea pero vio «extemporáneo» el referéndum.', F.otan] }],
  ['ext', '98', 'israel', '¿Prohibir el comercio de armas con Israel por la guerra de Gaza?', {
    PP: [-1, 'Votó en contra del embargo (8-10-2025).', fuVot('embargo')],
    PSOE: [1, 'Lo aprobó su Gobierno.', fuVot('embargo')],
    VOX: [-1, 'Votó en contra del embargo.', fuVot('embargo')],
    FA: [1, 'Sumar, del que procede, votó a favor.', fuVot('embargo')] }],
  ['ext', '99', 'palestina', '¿Reconocer a Palestina como Estado, como hizo España en 2024?', {
    PP: [-1, 'No apoyó el reconocimiento de 2024, según el Gobierno; su programa pide proteger a la población de Gaza.', F.palestina],
    PSOE: [1, 'Su Gobierno lo reconoció en 2024.', F.psoe],
    VOX: [-1, 'No apoyó el reconocimiento.', F.palestina],
    FA: [1, 'Sumar, del que procede, apoyó el reconocimiento.', F.palestina] }]
];

// ---------- construcción ----------
const viejas = Object.fromEntries((C.encuesta.preguntas || []).map(q => [q.id, q]));
const temaDe = Object.fromEntries(TEMAS);
const preguntas = [];
V.forEach(([tema, c, ref, q]) => {
  if(typeof ref === 'string'){ VOT(ref); preguntas.push({ c, id: ref, tipo: 'voto', tema, q }); }
  else preguntas.push(Object.assign({ c, tipo: 'voto', tema, q, cam: 'congreso' }, ref));
});
P.forEach(([tema, c, id, q, pos, extra]) => {
  if(q === null){ const o = viejas[id]; if(!o) throw new Error('Falta la pregunta antigua ' + id); preguntas.push(Object.assign({ c }, o, { tema })); return; }
  const o = { c, id, tipo: 'prop', tema, q, pos: {}, porque: {}, fu: {} };
  ['PP', 'PSOE', 'VOX', 'FA'].forEach(k => { const x = pos[k]; o.pos[k] = x[0]; o.porque[k] = x[1]; o.fu[k] = x[2]; if(!x[2] || !x[2].u) throw new Error('Sin fuente: ' + id + ' ' + k); });
  Object.assign(o, extra || {});
  preguntas.push(o);
});
// comprobaciones: 100 preguntas, códigos únicos, 5 + 5 por tema
const cods = new Set(preguntas.map(q => q.c)), ids = new Set(preguntas.map(q => q.id));
if(preguntas.length !== 100 || cods.size !== 100 || ids.size !== 100) throw new Error('Debe haber 100 preguntas con códigos e ids únicos: ' + preguntas.length + ' / ' + cods.size + ' / ' + ids.size);
TEMAS.forEach(([t]) => { ['voto', 'prop'].forEach(tp => { const n = preguntas.filter(q => q.tema === t && q.tipo === tp).length; if(n !== 5) throw new Error(t + ' ' + tp + ': ' + n); }); });
preguntas.forEach(q => { if(q.tipo === 'voto'){ const l = q.v ? q : VOT(q.id); ['PP', 'PSOE', 'VOX', 'SUMAR'].forEach(k => { const v = l.v || {}; if(![v.si, v.no, v.abs].some(a => a && a.includes(k))) console.warn('Aviso: sin voto de ' + k + ' en ' + q.id); }); } });

C.encuesta = {
  v: 2,
  partidos: ['PP', 'PSOE', 'VOX', 'FA'],
  temas: TEMAS.map(([id, n]) => ({ id, n })),
  // orden de las preguntas de la versión 1 (fija), para leer las respuestas enviadas antes del cambio
  v1: ['jornada', 'omnibus', 'multi', 'amnistia', 'menores', 'alquiler', 'impuestos', 'regularizacion', 'nucleares', 'pensiones'],
  nota: 'Test orientativo. Cada vez salen diez preguntas al azar de un banco de cien, una por tema: en cinco temas, una votación real del Congreso, en la que tu respuesta se compara con lo que votó cada grupo (Frente Amplio, con el grupo Sumar, del que procede); en los otros cinco, una propuesta, con la posición de cada partido según su programa para el 29-N o, si no la fija, lo que ha votado o defendido. Si un partido no tiene posición documentada en una pregunta, esa pregunta no cuenta para él. No es una recomendación de voto.',
  preguntas
};
fs.writeFileSync(ARCH, cab + JSON.stringify(C, null, 1) + ';\n');
console.log('Banco: ' + preguntas.length + ' preguntas en ' + TEMAS.length + ' temas (' + preguntas.filter(q => q.tipo === 'voto').length + ' votaciones y ' + preguntas.filter(q => q.tipo === 'prop').length + ' propuestas).');
