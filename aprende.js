/* 176 · Aprende: cómo se forman las Cortes, en 8 lecciones.
   Se carga la primera vez que alguien pulsa «Aprende» (o abre #aprende). Usa data/mapa.js (resultados de 2023)
   y, cuando el escrutinio del 29-N es definitivo, data/escrutinio.js: hace falta "definitivo": true y, en cada
   provincia de "prov", "V" (votos válidos) y "v" (% de voto por partido). Con eso las lecciones 3 a 6 pasan solas al 29-N. */
(function(){
var CSS = ":root{--sen:#9C7440;--s1:#DCE6EF;--s2:#AFC6DA;--s3:#7FA3C3;--s4:#4C7CA6;--s5:#1F4E7A;--on-lo:#111B24;--on-hi:#FFFFFF;--pa:#1D84CE;--pb:#E30613;--pc:#8A949E}\n@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){--sen:#C9A577;--s1:#1E2B37;--s2:#2A4660;--s3:#3B6890;--s4:#5A8FC0;--s5:#9CC3E8;--on-lo:#E9EEF2;--on-hi:#0E141A;--pa:#2B8FD9;--pb:#EF3340;--pc:#7B8792}}\n:root[data-theme=\"dark\"]{--sen:#C9A577;--s1:#1E2B37;--s2:#2A4660;--s3:#3B6890;--s4:#5A8FC0;--s5:#9CC3E8;--on-lo:#E9EEF2;--on-hi:#0E141A;--pa:#2B8FD9;--pb:#EF3340;--pc:#7B8792}\n#aprende button,#aprende select,#aprende input{font:inherit;color:inherit}\n#aprende h1,#aprende h2,#aprende h3,#aprende h4{font-family:var(--f-d);margin:0;text-wrap:balance}\n#aprende p{margin:0}\n#aprende .card{display:flex;flex-direction:column;gap:12px;min-width:0}\n#aprende .btn{border:1.5px solid var(--ink);background:var(--ink);color:var(--card);border-radius:999px;padding:6px 14px;font-family:var(--f-d);font-weight:700;font-size:.86rem;cursor:pointer}\n#aprende .btn.ghost{background:transparent;color:var(--ink)}\n#aprende .btn:disabled{opacity:.4;cursor:default}\n#aprende .key{background:var(--paper);border-radius:8px;padding:10px 12px;color:var(--ink2);font-size:.92rem}\n#aprende .sepia .key{background:var(--card)}\n#aprende .key b{color:var(--ink)}\n#aprende .lhead{display:flex;gap:12px;align-items:flex-start}\n#aprende .lnum{flex:none;width:34px;height:34px;border-radius:50%;border:2px solid var(--ink);display:grid;place-items:center;font-family:var(--f-d);font-weight:900;font-stretch:70%;font-size:1.05rem}\n#aprende .sepia .lnum{border-color:var(--sen);color:var(--sen)}\n#aprende .lhead > div{min-width:0}\n#aprende .two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}\n@media (max-width:560px){#aprende .two{grid-template-columns:minmax(0,1fr)}}\n#aprende .cam{border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:6px;min-width:0}\n#aprende .cam.c{background:var(--paper)}\n#aprende .cam.s{background:var(--sepia);border:1px solid var(--sepia-line)}\n#aprende .cam h3{font-size:1rem}\n#aprende .cam svg{width:100%;height:auto;display:block}\n#aprende .cam ul{margin:0;padding-left:18px;font-size:.88rem;color:var(--ink2)}\n#aprende .hz .big{font-family:var(--f-d);font-stretch:66%;font-weight:900;font-size:30px;fill:var(--ink)}\n#aprende .hz .cap{font-family:var(--f-d);font-size:9px;font-weight:700;fill:var(--muted);letter-spacing:.05em;text-transform:uppercase}\n#aprende .lg{display:flex;gap:12px;flex-wrap:wrap;font-family:var(--f-d);font-size:.78rem;color:var(--ink2)}\n#aprende .lg span{display:inline-flex;align-items:center;gap:5px}\n#aprende .ring{width:10px;height:10px;border-radius:50%;display:inline-block;flex:none}\n#aprende .ballots{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:14px;align-items:start}\n@media (max-width:600px){#aprende .ballots{grid-template-columns:minmax(0,1fr)}}\n#aprende .ballot{border-radius:4px;padding:14px 14px 16px;box-shadow:0 1px 0 var(--line),0 6px 18px -10px rgba(17,27,36,.35);font-family:var(--f-d);min-width:0}\n#aprende .ballot.w{background:#FFFFFF;color:#111B24;border:1px solid #D3DAE0}\n#aprende .ballot.s{background:#EBDDC4;color:#2B2116;border:1px solid #CDB58C}\n#aprende .ballot .bt{font-size:.66rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:.7}\n#aprende .ballot .bp{font-size:1.05rem;font-weight:900;font-stretch:80%;margin:4px 0 8px}\n#aprende .ballot ol{margin:0;padding-left:20px;font-size:.84rem;line-height:1.6}\n#aprende .ballot .lock{margin-top:10px;font-size:.74rem;font-weight:700;display:flex;gap:6px;align-items:center}\n#aprende .sgroup{margin-top:8px}\n#aprende .sgroup .gp{font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.75;margin-bottom:2px}\n#aprende .cand{display:flex;align-items:center;gap:8px;padding:3px 0;font-size:.86rem;cursor:pointer}\n#aprende .cand input{appearance:none;-webkit-appearance:none;width:18px;height:18px;border:1.5px solid #2B2116;border-radius:2px;background:#F7EEDC;display:grid;place-items:center;flex:none;cursor:pointer;margin:0}\n#aprende .cand input:checked::after{content:\"✕\";font-size:13px;font-weight:900;line-height:1;color:#2B2116}\n#aprende .cand input:focus-visible{outline:3px solid #0B62D6;outline-offset:2px}\n#aprende .status{font-family:var(--f-d);font-size:.86rem;font-weight:700;padding:8px 12px;border-radius:8px}\n#aprende .mapw{position:relative}\n#aprende .map{width:100%;height:auto;display:block}\n#aprende .map path.pv{stroke:var(--card);stroke-width:.8;cursor:pointer;transition:opacity .15s}\n#aprende .map path.pv:hover{opacity:.8}\n#aprende .map path.pv.on{stroke:var(--ink);stroke-width:2}\n#aprende .map .bd{fill:none;stroke:var(--line);stroke-width:1}\n#aprende .map text{font-family:var(--f-d);font-weight:800;font-stretch:70%;font-size:12px;pointer-events:none;text-anchor:middle;dominant-baseline:central}\n#aprende .f1{fill:var(--s1)}\n#aprende .f2{fill:var(--s2)}\n#aprende .f3{fill:var(--s3)}\n#aprende .f4{fill:var(--s4)}\n#aprende .f5{fill:var(--s5)}\n#aprende .t1,#aprende .t2,#aprende .t3{fill:var(--on-lo)}\n#aprende .t4,#aprende .t5{fill:var(--on-hi)}\n#aprende .scale{display:flex;gap:2px;font-family:var(--f-d);font-size:.74rem;color:var(--muted);align-items:center;flex-wrap:wrap}\n#aprende .scale i{display:inline-block;width:26px;height:10px}\n#aprende .cost{display:flex;flex-direction:column;gap:8px;font-family:var(--f-d)}\n#aprende .cost .r{display:grid;grid-template-columns:96px minmax(0,1fr) 78px;gap:8px;align-items:center;font-size:.84rem}\n#aprende .cost .r b{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#aprende .cost .bar{height:14px;background:var(--line2);border-radius:3px;overflow:hidden}\n#aprende .cost .bar i{display:block;height:100%;background:var(--s4);border-radius:3px;transition:width .3s}\n#aprende .cost .r.me b{color:var(--ink)}\n#aprende .cost .r.me .bar i{background:var(--ink)}\n#aprende .cost .v{text-align:right;font-variant-numeric:tabular-nums;font-weight:700}\n#aprende .dh{width:100%;border-collapse:separate;border-spacing:3px;font-family:var(--f-d);font-variant-numeric:tabular-nums}\n#aprende .dh th{font-size:.68rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-align:right;padding:2px 6px;white-space:nowrap}\n#aprende .dh th:first-child{text-align:left}\n#aprende .dh td{font-size:.8rem;text-align:right;padding:5px 6px;border-radius:5px;white-space:nowrap;background:var(--paper);color:var(--muted)}\n#aprende .dh td.pn{background:none;text-align:left;color:var(--ink);font-weight:700;padding-left:0}\n#aprende .dh td.pn .pc{display:flex;align-items:center;gap:6px}\n#aprende .dh td.st{background:none;padding:0 2px}\n#aprende .dh td.win{color:#fff;font-weight:800;position:relative}\n#aprende .dh td.win sup{font-size:.6rem;opacity:.85;margin-left:3px;font-weight:700}\n#aprende .dh td.next{outline:2px dashed var(--ink2);outline-offset:-2px;color:var(--ink)}\n#aprende .dh td.out{opacity:.45}\n#aprende .dh tr.under td.pn{color:var(--muted);font-weight:500}\n#aprende .step{display:inline-flex;border:1.5px solid var(--line);border-radius:999px;overflow:hidden}\n#aprende .step button{border:0;background:var(--card);width:26px;height:24px;cursor:pointer;font-weight:800;font-family:var(--f-d);color:var(--ink)}\n#aprende .step button:hover{background:var(--line2)}\n#aprende .seats{display:flex;flex-wrap:wrap;gap:3px}\n#aprende .seats i{width:16px;height:16px;border-radius:3px;display:block}\n#aprende .seats i.e{background:none;border:1.5px dashed var(--line)}\n#aprende .callout{border-left:3px solid var(--ink);padding:2px 0 2px 12px;color:var(--ink2);font-size:.95rem}\n#aprende .bn{width:100%;border-collapse:collapse;font-family:var(--f-d);font-size:.86rem}\n#aprende .bn th{font-weight:800;text-align:center;padding:8px 4px;border-bottom:1px solid var(--line);font-size:.9rem}\n#aprende .bn th:first-child{text-align:left}\n#aprende .bn td{padding:9px 4px;border-bottom:1px solid var(--line2);text-align:center}\n#aprende .bn td:first-child{text-align:left;color:var(--ink2);font-family:var(--f-b);font-size:.9rem}\n#aprende .mini{display:block;margin:0 auto 4px;width:30px;height:38px}\n#aprende .myth{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 10px;align-items:baseline;font-size:.92rem}\n#aprende .db{display:flex;flex-direction:column;gap:2px;font-family:var(--f-d)}\n#aprende .db .r{display:grid;grid-template-columns:70px minmax(0,1fr) 118px;gap:10px;align-items:center;font-size:.82rem;padding:3px 0}\n#aprende .db .r b{font-weight:700}\n#aprende .db .tr{position:relative;height:18px}\n#aprende .db .tr::before{content:\"\";position:absolute;left:0;right:0;top:50%;border-top:1px solid var(--line2)}\n#aprende .db .ln{position:absolute;top:50%;height:3px;margin-top:-1.5px;border-radius:2px;opacity:.5}\n#aprende .db .o,#aprende .db .f{position:absolute;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%}\n#aprende .db .o{background:var(--card);border:2px solid}\n#aprende .db .val{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink2);white-space:nowrap}\n#aprende .db .val b{color:var(--ink)}\n#aprende .db .ax{display:grid;grid-template-columns:70px minmax(0,1fr) 118px;gap:10px;font-size:.7rem;color:var(--muted)}\n#aprende .db .ax div{position:relative;height:14px}\n#aprende .db .ax div span{position:absolute;transform:translateX(-50%);white-space:nowrap}\n#aprende .up{color:var(--ok)}\n#aprende .dn{color:var(--bad)}\n#aprende .sb{display:flex;flex-direction:column;gap:4px;font-family:var(--f-d)}\n#aprende .sb .r{display:grid;grid-template-columns:110px minmax(0,1fr) 64px;gap:8px;align-items:center;font-size:.82rem}\n#aprende .sb .bar{height:16px;border-radius:3px;background:var(--card)}\n#aprende .sb .bar i{display:block;height:100%;border-radius:3px;transition:width .3s}\n#aprende .sb .r.lose{opacity:.45}\n#aprende .sb .cut{border-top:2px dashed var(--sen);margin:4px 0;position:relative}\n#aprende .sb .cut span{position:absolute;right:0;top:-10px;background:var(--sepia);padding:0 6px;font-size:.7rem;font-weight:800;color:var(--sen);letter-spacing:.06em;text-transform:uppercase}\n#aprende input[type=range]{width:100%;accent-color:var(--ink)}\n#aprende .sepia input[type=range]{accent-color:var(--sen)}\n#aprende .tl{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}\n#aprende .tl li{display:grid;grid-template-columns:86px 18px minmax(0,1fr);gap:10px;min-height:52px}\n#aprende .tl .d{font-family:var(--f-d);font-weight:800;font-stretch:76%;font-size:.95rem;text-align:right;padding-top:1px}\n#aprende .tl .k{position:relative;display:flex;justify-content:center}\n#aprende .tl .k::before{content:\"\";position:absolute;top:0;bottom:0;width:2px;background:var(--line)}\n#aprende .tl li:first-child .k::before{top:8px}\n#aprende .tl li:last-child .k::before{bottom:auto;height:8px}\n#aprende .tl .k i{position:relative;width:14px;height:14px;border-radius:50%;background:var(--card);border:2.5px solid var(--ink);margin-top:3px}\n#aprende .tl li.hot .k i{background:var(--ink)}\n#aprende .tl .t{padding-bottom:14px;font-size:.92rem;color:var(--ink2)}\n#aprende .tl .t b{color:var(--ink);font-family:var(--f-d)}\n#aprende .maj{position:relative;margin:50px 0 4px}\n#aprende .maj .mtrack{display:flex;height:22px;border-radius:4px;overflow:hidden;background:var(--line2)}\n#aprende .maj .mk{position:absolute;top:-46px;bottom:-6px;border-left:2px solid var(--ink)}\n#aprende .maj .mk span{position:absolute;top:0;left:4px;font-family:var(--f-d);font-weight:900;font-stretch:70%;font-size:1rem;white-space:nowrap}\n#aprende .majl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\n@media (max-width:560px){#aprende .majl{grid-template-columns:minmax(0,1fr)}}\n#aprende .majl div{background:var(--paper);border-radius:8px;padding:10px 12px;font-size:.88rem;color:var(--ink2)}\n#aprende .majl h4{font-size:.92rem;margin-bottom:2px;color:var(--ink)}\n#aprende .majl h4 .num{font-size:1.1rem;margin-right:6px}\n#aprende .abar{position:sticky;top:env(safe-area-inset-top, 0px);z-index:20;background:var(--card);border-bottom:1px solid var(--line)}\n#aprende .abar .wrap{display:flex;flex-direction:column;gap:6px;padding-block:10px 8px}\n#aprende .abar-top{display:flex;align-items:center;gap:10px;justify-content:space-between}\n#aprende .abar-top > div{display:flex;align-items:baseline;gap:8px;min-width:0;font-family:var(--f-d)}\n#aprende .abar-top b{font-weight:900;font-stretch:80%;font-size:1.1rem}\n#aprende .abar-top span{color:var(--muted);font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#aprende .btn.sm{padding:4px 12px;font-size:.8rem}\n#aprende .achips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 -4px;padding:0 4px 2px}\n#aprende .achips::-webkit-scrollbar{display:none}\n#aprende .achips a{flex:none;display:inline-flex;align-items:center;gap:5px;border:1.5px solid var(--line);border-radius:999px;padding:4px 10px;font-family:var(--f-d);font-size:.8rem;font-weight:700;color:var(--ink2);text-decoration:none;background:var(--card)}\n#aprende .achips a b{font-stretch:70%;font-weight:900;color:var(--muted)}\n#aprende .achips a.on{background:var(--ink);border-color:var(--ink);color:var(--card)}\n#aprende .achips a.on b{color:var(--card);opacity:.7}\n#aprende article.card{scroll-margin-top:100px}\n#aprende .seg{display:inline-flex;border:1.5px solid var(--ink);border-radius:999px;overflow:hidden;font-family:var(--f-d);max-width:100%}\n#aprende .seg button{border:0;background:transparent;padding:6px 13px;font-weight:700;font-size:.84rem;cursor:pointer;color:var(--ink)}\n#aprende .seg button[aria-pressed=\"true\"]{background:var(--ink);color:var(--card)}\n#aprende .seg button:disabled{cursor:default;color:var(--muted)}\n#aprende .dtag{display:inline-block;margin-left:6px;font-family:var(--f-d);font-size:.66rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:1px 7px;vertical-align:3px}\n@media (max-width:480px){#aprende .card{display:flex;flex-direction:column;gap:12px;min-width:0}\n#aprende .lhead{gap:10px}\n#aprende .lnum{width:28px;height:28px;font-size:.95rem}\n#aprende .db .r,#aprende .db .ax{grid-template-columns:58px minmax(0,1fr) 104px;gap:8px}\n#aprende .db .r{font-size:.78rem}\n#aprende .cost .r{grid-template-columns:78px minmax(0,1fr) 62px}\n#aprende .sb .r{grid-template-columns:92px minmax(0,1fr) 44px}\n#aprende .tl li{grid-template-columns:70px 18px minmax(0,1fr);gap:8px}\n#aprende .tl .d{font-size:.86rem}\n#aprende .maj .mk span{font-size:.9rem}}\n@media (min-width:700px){#aprende .achips{flex-wrap:wrap;overflow:visible}}\n#aprende{position:fixed;inset:0;z-index:40;background:var(--paper);overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding-bottom:env(safe-area-inset-bottom,0px)}\n#aprende[hidden]{display:none}\n#aprende .abar{top:0;padding-top:env(safe-area-inset-top,0px)}\n#aprende .wrap{padding-left:max(16px, env(safe-area-inset-left, 0px));padding-right:max(16px, env(safe-area-inset-right, 0px))}\n#aprende main{padding:16px 0 40px}\n#aprende .card{scroll-margin-top:100px}\nbody.ap-open{overflow:hidden}\n";
var HTML = "<div class=\"abar\"><div class=\"wrap\">\n<div class=\"abar-top\">\n<div><b>Aprende</b><span>Cómo se forman las Cortes</span></div>\n<button class=\"btn ghost sm\" id=\"ap-btnCerrar\" type=\"button\">Cerrar</button>\n</div>\n<nav class=\"achips\" id=\"ap-achips\" aria-label=\"Lecciones\">\n<a href=\"#aprende-l1\"><b>1</b>Cortes</a><a href=\"#aprende-l2\"><b>2</b>Papeletas</a><a href=\"#aprende-l3\"><b>3</b>Provincias</a><a href=\"#aprende-l4\"><b>4</b>D'Hondt</a><a href=\"#aprende-l5\"><b>5</b>Blanco y nulo</a><a href=\"#aprende-l6\"><b>6</b>Votos y escaños</a><a href=\"#aprende-l7\"><b>7</b>Senado</a><a href=\"#aprende-l8\"><b>8</b>Investidura</a>\n</nav>\n</div></div>\n<main><div class=\"wrap stack\">\n<div class=\"card\">\n<div>\n<h2>Del voto al Gobierno, paso a paso</h2>\n<p class=\"lead\">El 29-N cada votante mete dos papeletas en dos urnas. Aquí se explica qué pasa con ellas hasta que hay presidente del Gobierno. Unos 2 minutos por lección.</p>\n</div>\n<div class=\"row\">\n<span class=\"ui small\" style=\"font-weight:700;color:var(--muted)\">Ejemplos con</span>\n<div class=\"seg\" role=\"group\" aria-label=\"Datos de los ejemplos\"><button type=\"button\" id=\"ap-ds23\" aria-pressed=\"true\">Elecciones 2023</button><button type=\"button\" id=\"ap-ds26\" aria-pressed=\"false\" disabled>29-N</button></div>\n<span class=\"src\" id=\"ap-dsNote\">El 29-N se activa al acabar el escrutinio.</span>\n</div>\n</div>\n<!-- 1 -->\n<article class=\"card\" id=\"ap-l1\">\n<div class=\"lhead\"><span class=\"lnum\">1</span><div>\n<h2>Las Cortes Generales son dos cámaras</h2>\n<p class=\"lead\">El Congreso y el Senado hacen las leyes y aprueban los Presupuestos. Pero solo el Congreso elige al presidente del Gobierno y puede echarlo. Por eso todo gira alrededor de un número: 176.</p>\n</div></div>\n<div class=\"two\">\n<div class=\"cam c\">\n<h3>Congreso de los Diputados</h3>\n<svg id=\"ap-hzC\" class=\"hz\" viewBox=\"-108 -108 216 120\" role=\"img\" aria-label=\"Hemiciclo de 350 escaños; 176 marcados como mayoría absoluta\"></svg>\n<div class=\"lg\"><span><i class=\"ring\" style=\"background:var(--ink)\"></i>176 = mayoría absoluta</span><span><i class=\"ring\" style=\"background:var(--line)\"></i>resto</span></div>\n<ul><li><b>350</b> diputados, todos elegidos el 29-N</li><li>Elige y puede censurar al presidente</li><li>Tiene la última palabra en las leyes</li></ul>\n</div>\n<div class=\"cam s\">\n<h3>Senado</h3>\n<svg id=\"ap-hzS\" class=\"hz\" viewBox=\"-108 -108 216 120\" role=\"img\" aria-label=\"Hemiciclo de 267 escaños: 209 elegidos en las urnas y 58 designados\"></svg>\n<div class=\"lg\"><span><i class=\"ring\" style=\"background:var(--sen)\"></i>209 en las urnas</span><span><i class=\"ring\" style=\"border:2px solid var(--sen)\"></i>58 designados</span></div>\n<ul><li><b>267</b> senadores tras el 29-N</li><li>58 los designan los parlamentos autonómicos, no las urnas</li><li>Puede vetar o enmendar leyes, pero el Congreso decide</li></ul>\n</div>\n</div>\n<p class=\"key\"><b>Si el Senado veta una ley</b>, el Congreso puede levantar el veto con mayoría absoluta (176) enseguida, o con más síes que noes pasados dos meses (artículo 90 de la Constitución).</p>\n</article>\n<!-- 2 -->\n<article class=\"card\" id=\"ap-l2\">\n<div class=\"lhead\"><span class=\"lnum\">2</span><div>\n<h2>Votas con dos papeletas distintas</h2>\n<p class=\"lead\">La blanca es para el Congreso y la sepia para el Senado. No funcionan igual: en una eliges un partido, en la otra eliges personas.</p>\n</div></div>\n<div class=\"ballots\">\n<div class=\"ballot w\" aria-label=\"Papeleta del Congreso de ejemplo\">\n<div class=\"bt\">Congreso · Papeleta blanca</div>\n<div class=\"bp\">PARTIDO A</div>\n<ol><li>Candidata 1</li><li>Candidato 2</li><li>Candidata 3</li><li>Candidato 4</li><li>…</li></ol>\n<div class=\"lock\">Lista cerrada y bloqueada: no se puede tachar ni reordenar</div>\n</div>\n<div class=\"ballot s\" aria-label=\"Papeleta del Senado de ejemplo: marca hasta 3\">\n<div class=\"bt\">Senado · Papeleta sepia · Marca hasta 3</div>\n<div id=\"ap-senBallot\"></div>\n</div>\n</div>\n<div id=\"ap-senStatus\" class=\"status\" role=\"status\" aria-live=\"polite\"></div>\n<p class=\"key\"><b>Congreso:</b> metes la papeleta de un partido y votas a toda su lista, en su orden; si tachas o cambias algo, el voto es nulo. <b>Senado:</b> marcas con una cruz hasta 3 nombres (2 en Gran Canaria, Mallorca y Tenerife; 1 en Ceuta, Melilla y el resto de islas), del partido que quieras o de varios. Más cruces de la cuenta anulan el voto; ninguna cruz es voto en blanco.</p>\n</article>\n<!-- 3 -->\n<article class=\"card\" id=\"ap-l3\">\n<div class=\"lhead\"><span class=\"lnum\">3</span><div>\n<h2>No hay una sola elección: hay 52 <span class=\"dtag\">Datos 2023</span></h2>\n<p class=\"lead\">Cada provincia (más Ceuta y Melilla) reparte sus propios escaños con sus propios votos. Todas tienen 2 asegurados (Ceuta y Melilla, 1) y los otros 248 se reparten según la población.</p>\n</div></div>\n<div class=\"mapw\"><svg id=\"ap-map\" class=\"map\" role=\"img\" aria-label=\"Mapa de escaños por provincia en 2026\"></svg></div>\n<div class=\"row\" style=\"justify-content:space-between\">\n<div class=\"scale\" aria-hidden=\"true\"><span style=\"margin-right:4px\">Escaños</span><i class=\"f1\" style=\"background:var(--s1)\"></i>1–2<i style=\"background:var(--s2)\"></i>3–4<i style=\"background:var(--s3)\"></i>5–7<i style=\"background:var(--s4)\"></i>8–12<i style=\"background:var(--s5)\"></i>16+</div>\n<span class=\"src\">Toca una provincia</span>\n</div>\n<div>\n<h3 id=\"ap-costT\">¿Cuántos votos costó un escaño en 2023?</h3>\n<div id=\"ap-cost\" class=\"cost\" style=\"margin-top:8px\"></div>\n</div>\n<p class=\"key\"><b>La consecuencia:</b> un voto en Soria o Teruel pesa casi cuatro veces más que uno en Madrid. Y en una provincia de 3 o 4 escaños, a un partido con el 10 % no le suele llegar para ninguno. Para el 29-N, Madrid gana un escaño (38) y Cádiz pierde uno (8) por los cambios de población.</p>\n</article>\n<!-- 4 -->\n<article class=\"card\" id=\"ap-l4\">\n<div class=\"lhead\"><span class=\"lnum\">4</span><div>\n<h2>De votos a escaños: la regla D'Hondt <span class=\"dtag\">Datos 2023</span></h2>\n<p class=\"lead\">Se dividen los votos de cada partido entre 1, 2, 3… hasta el número de escaños. Los cocientes más altos se llevan los escaños. Antes, se apartan los partidos que no llegan al 3 % de los votos válidos de la provincia.</p>\n</div></div>\n<div class=\"row\">\n<label class=\"ui small\" for=\"ap-dhProv\" style=\"font-weight:700;color:var(--muted)\">Provincia</label>\n<select id=\"ap-dhProv\" class=\"sel\"></select>\n<button class=\"btn ghost\" id=\"ap-dhStep\" type=\"button\">Paso a paso</button>\n<button class=\"btn\" id=\"ap-dhNext\" type=\"button\" hidden>Siguiente escaño</button>\n<button class=\"btn ghost\" id=\"ap-dhReset\" type=\"button\" hidden>Volver a 2023</button>\n</div>\n<div class=\"seats\" id=\"ap-dhSeats\" aria-label=\"Escaños repartidos\"></div>\n<div class=\"tscroll\"><table class=\"dh\" id=\"ap-dhT\"></table></div>\n<p class=\"callout\" id=\"ap-dhNote\" aria-live=\"polite\"></p>\n<p class=\"src\">Usa − y + para mover un punto de voto y ver qué cambia. <span id=\"ap-dhSrc\"></span></p>\n</article>\n<!-- 5 -->\n<article class=\"card\" id=\"ap-l5\">\n<div class=\"lhead\"><span class=\"lnum\">5</span><div>\n<h2>Blanco, nulo o abstención</h2>\n<p class=\"lead\">Los tres son formas de no votar a nadie, pero la ley los cuenta de forma distinta. Ninguno da escaños a ningún partido.</p>\n</div></div>\n<div class=\"tscroll\"><table class=\"bn\">\n<thead><tr><th></th>\n<th><svg class=\"mini\" viewBox=\"0 0 30 38\" aria-hidden=\"true\"><rect x=\"2\" y=\"2\" width=\"26\" height=\"34\" rx=\"2\" fill=\"var(--card)\" stroke=\"var(--ink)\" stroke-width=\"2\"/></svg>Blanco</th>\n<th><svg class=\"mini\" viewBox=\"0 0 30 38\" aria-hidden=\"true\"><rect x=\"2\" y=\"2\" width=\"26\" height=\"34\" rx=\"2\" fill=\"var(--card)\" stroke=\"var(--ink)\" stroke-width=\"2\"/><path d=\"M7 9l16 20M23 9L7 29\" stroke=\"var(--bad)\" stroke-width=\"2.5\"/></svg>Nulo</th>\n<th><svg class=\"mini\" viewBox=\"0 0 30 38\" aria-hidden=\"true\"><rect x=\"2\" y=\"2\" width=\"26\" height=\"34\" rx=\"2\" fill=\"none\" stroke=\"var(--muted)\" stroke-width=\"2\" stroke-dasharray=\"4 3\"/></svg>No votar</th></tr></thead>\n<tbody>\n<tr><td>Cuenta en la participación</td><td><span class=\"pill ok\">Sí</span></td><td><span class=\"pill ok\">Sí</span></td><td><span class=\"pill neu\">No</span></td></tr>\n<tr><td>Es un voto válido</td><td><span class=\"pill ok\">Sí</span></td><td><span class=\"pill neu\">No</span></td><td><span class=\"pill neu\">No</span></td></tr>\n<tr><td>Sube la barrera del 3 %</td><td><span class=\"pill warn\">Un poco</span></td><td><span class=\"pill neu\">No</span></td><td><span class=\"pill neu\">No</span></td></tr>\n<tr><td>Da escaños a alguien</td><td><span class=\"pill neu\">No</span></td><td><span class=\"pill neu\">No</span></td><td><span class=\"pill neu\">No</span></td></tr>\n</tbody>\n</table></div>\n<div class=\"myth\">\n<span class=\"pill bad\">Bulo</span><span>«El voto en blanco va al partido más votado.» No va a nadie. Solo hace un poco más alto el 3 % que hay que superar.</span>\n<span class=\"pill ok\">Dato</span><span id=\"ap-bnDato\">En Madrid, el 3 % de los votos válidos de 2023 eran unos 108.000 votos.</span>\n<span class=\"pill neu\">Ojo</span><span>Un sobre vacío es voto en blanco. Dos papeletas iguales en el sobre cuentan como un voto; dos de partidos distintos lo anulan.</span>\n</div>\n</article>\n<!-- 6 -->\n<article class=\"card\" id=\"ap-l6\">\n<div class=\"lhead\"><span class=\"lnum\">6</span><div>\n<h2>Por qué el % de votos no es el % de escaños <span class=\"dtag\">Datos 2023</span></h2>\n<p class=\"lead\">Con 52 repartos pequeños, el partido que gana en muchas provincias se lleva un plus. El que saca votos repartidos por todo el país pierde escaños por el camino. Y el que concentra sus votos en pocas provincias apenas pierde.</p>\n</div></div>\n<div class=\"db\" id=\"ap-db\"></div>\n<div class=\"lg\"><span><i class=\"ring\" style=\"border:2px solid var(--ink)\"></i>% de votos</span><span><i class=\"ring\" style=\"background:var(--ink)\"></i>% de escaños</span></div>\n<p class=\"key\" id=\"ap-dbKey\"></p>\n</article>\n<!-- 7 -->\n<article class=\"card sepia\" id=\"ap-l7\">\n<div class=\"lhead\"><span class=\"lnum\">7</span><div>\n<h2>El Senado: gana quien más cruces tiene</h2>\n<p class=\"lead\">En una provincia se eligen 4 senadores, pero cada votante solo marca 3. Los 4 candidatos con más cruces ganan. Como los partidos grandes presentan 3, lo normal es que el primero se lleve 3 y el segundo, 1.</p>\n</div></div>\n<div>\n<label for=\"ap-senR\" class=\"ui small\" style=\"font-weight:700;color:var(--ink2)\">Cuánto gana el Partido A al Partido B: <span id=\"ap-senRv\" class=\"num\" style=\"font-size:1rem\"></span></label>\n<input type=\"range\" id=\"ap-senR\" min=\"-8\" max=\"8\" step=\"0.5\" value=\"4\">\n</div>\n<div class=\"sb\" id=\"ap-sb\"></div>\n<p class=\"key\"><b>Por eso el Senado premia mucho al más votado.</b> Ganar una provincia por un voto puede dar 3 senadores a 1. Si el resultado está muy igualado, puede salir 2-2, porque no todos los votantes marcan a los tres candidatos de su partido. Las islas y Ceuta y Melilla eligen menos senadores, con menos cruces (lección 2).</p>\n</article>\n<!-- 8 -->\n<article class=\"card\" id=\"ap-l8\">\n<div class=\"lhead\"><span class=\"lnum\">8</span><div>\n<h2>Del 29-N al Gobierno</h2>\n<p class=\"lead\">Las elecciones eligen el Congreso, no al presidente. El presidente sale de una votación en el Congreso, la investidura.</p>\n</div></div>\n<ol class=\"tl\">\n<li class=\"hot\"><span class=\"d\">29-N</span><span class=\"k\"><i></i></span><div class=\"t\"><b>Elecciones.</b> Esa noche se cuentan los votos emitidos en España.</div></li>\n<li><span class=\"d\">Desde 2-D</span><span class=\"k\"><i></i></span><div class=\"t\"><b>Escrutinio general.</b> Las juntas electorales suman el voto de los españoles en el extranjero. Puede mover algún escaño ajustado.</div></li>\n<li class=\"hot\"><span class=\"d\">23-D</span><span class=\"k\"><i></i></span><div class=\"t\"><b>Se constituyen las Cortes.</b> Diputados y senadores eligen las Mesas de cada cámara. Hasta ahora, el Gobierno sigue en funciones.</div></li>\n<li><span class=\"d\">Después</span><span class=\"k\"><i></i></span><div class=\"t\"><b>El Rey consulta</b> a los grupos y propone un candidato a presidente.</div></li>\n<li class=\"hot\"><span class=\"d\">Investidura</span><span class=\"k\"><i></i></span><div class=\"t\"><b>1.ª votación: hace falta 176</b> (mayoría absoluta). Si no sale, <b>48 horas después basta con más síes que noes</b>.</div></li>\n<li><span class=\"d\">2 meses</span><span class=\"k\"><i></i></span><div class=\"t\"><b>Si nadie es investido</b> en dos meses desde la primera votación, las Cortes se disuelven y hay nuevas elecciones.</div></li>\n</ol>\n<div>\n<h3>Las mayorías que hay que conocer</h3>\n<div class=\"maj\" aria-label=\"Barra de 350 escaños con marcas en 176, 210 y 234\">\n<div class=\"mtrack\"><i style=\"width:50.3%;background:var(--ink)\"></i><i style=\"width:9.7%;background:var(--ink2)\"></i><i style=\"width:6.9%;background:var(--muted)\"></i></div>\n<div class=\"mk\" style=\"left:50.29%\"><span style=\"left:auto;right:5px;top:22px\">176</span></div>\n<div class=\"mk\" style=\"left:60%\"><span style=\"left:auto;right:5px;top:0\">210</span></div>\n<div class=\"mk\" style=\"left:66.86%\"><span style=\"top:22px\">234</span></div>\n</div>\n<p class=\"src\" style=\"text-align:right;margin-top:6px\">de 350 escaños</p>\n</div>\n<div class=\"majl\">\n<div><h4><span class=\"num\">+ sí que no</span>Mayoría simple</h4>Leyes ordinarias y 2.ª votación de investidura. Las abstenciones no cuentan.</div>\n<div><h4><span class=\"num\">176</span>Mayoría absoluta</h4>1.ª votación de investidura, moción de censura y leyes orgánicas. Las abstenciones cuentan como no.</div>\n<div><h4><span class=\"num\">210</span>Tres quintos</h4>Reformar la Constitución por la vía ordinaria (artículo 167).</div>\n<div><h4><span class=\"num\">234</span>Dos tercios</h4>Reformar la parte más protegida de la Constitución (artículo 168), con referéndum.</div>\n</div>\n</article>\n</div></main>";
var ROOT, revisaEsc;

function init(){
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  ROOT = document.createElement('div'); ROOT.id = 'aprende'; ROOT.hidden = true;
  ROOT.setAttribute('role', 'dialog'); ROOT.setAttribute('aria-modal', 'true'); ROOT.setAttribute('aria-label', 'Aprende: cómo se forman las Cortes');
  ROOT.innerHTML = HTML; document.body.appendChild(ROOT);

var NS = 'http://www.w3.org/2000/svg';
var nf = {format: function(x){ return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }};
function f1(x){ return x.toLocaleString('es-ES', {minimumFractionDigits:1, maximumFractionDigits:1}); }
function $(s){ return ROOT.querySelector(s); }
function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for(var k in attrs) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; }
var NOM = {PP:'PP',PSOE:'PSOE',VOX:'Vox',SUMAR:'Sumar',ERC:'ERC',JUNTS:'Junts',BILDU:'EH Bildu',PNV:'PNV',BNG:'BNG',CC:'CC',UPN:'UPN',PACMA:'PACMA',CUP:'CUP',TE:'Teruel Existe',UPL:'UPL',NC:'NC'};
var COL = {PP:1,PSOE:1,VOX:1,SUMAR:1,ERC:1,JUNTS:1,BILDU:1,PNV:1,BNG:1,CC:1,UPN:1};
function col(k){ return 'var(--p-' + (COL[k] ? k : 'OTROS') + ')'; }
function nom(k){ return NOM[k] || k; }

/* ---------- 1. Hemiciclos ---------- */
function hemi(svg, n, rows, paint, label, cap){
  var r0 = 42, r1 = 100, radii = [], tot = 0, i, j;
  for(i = 0; i < rows; i++){ radii.push(r0 + (r1 - r0) * i / (rows - 1)); }
  tot = radii.reduce(function(a,b){ return a + b; }, 0);
  var counts = radii.map(function(r){ return Math.round(n * r / tot); });
  var diff = n - counts.reduce(function(a,b){ return a + b; }, 0); counts[rows - 1] += diff;
  var pts = [];
  for(i = 0; i < rows; i++){ var k = counts[i]; for(j = 0; j < k; j++){ var a = Math.PI - Math.PI * j / (k - 1); pts.push({x: radii[i] * Math.cos(a), y: -radii[i] * Math.sin(a), a: a}); } }
  pts.sort(function(p, q){ return q.a - p.a || (p.x*p.x+p.y*p.y) - (q.x*q.x+q.y*q.y); });
  var rad = 0.36 * (r1 - r0) / (rows - 1);
  pts.forEach(function(p, idx){ var s = paint(idx); var c = el('circle', {cx: p.x.toFixed(2), cy: p.y.toFixed(2), r: rad.toFixed(2)}, svg); c.setAttribute('style', s); });
  var t = el('text', {x:0, y:-3, 'text-anchor':'middle', class:'big'}, svg); t.textContent = label;
  var c2 = el('text', {x:0, y:9, 'text-anchor':'middle', class:'cap'}, svg); c2.textContent = cap;
}
hemi($('#ap-hzC'), 350, 10, function(i){ return 'fill:' + (i < 176 ? 'var(--ink)' : 'var(--line)'); }, '350', 'diputados');
hemi($('#ap-hzS'), 267, 9, function(i){ return i < 209 ? 'fill:var(--sen)' : 'fill:var(--sepia);stroke:var(--sen);stroke-width:1.1'; }, '267', 'senadores');

/* ---------- 2. Papeleta del Senado ---------- */
var CANDS = [['Partido A', ['Candidata A1','Candidato A2','Candidata A3']], ['Partido B', ['Candidato B1','Candidata B2','Candidato B3']], ['Partido C', ['Candidata C1','Candidato C2']]];
var sb = $('#ap-senBallot');
CANDS.forEach(function(g, gi){
  var d = document.createElement('div'); d.className = 'sgroup';
  d.innerHTML = '<div class="gp">' + g[0] + '</div>' + g[1].map(function(c, ci){ var id = 'ap-sc' + gi + ci; return '<label class="cand" for="' + id + '"><input type="checkbox" id="' + id + '"> ' + c + '</label>'; }).join('');
  sb.appendChild(d);
});
function senStatus(){
  var n = sb.querySelectorAll('input:checked').length, s = $('#ap-senStatus');
  if(n === 0){ s.textContent = 'Sin cruces: es un voto en blanco al Senado.'; s.style.background = 'var(--neu-bg)'; s.style.color = 'var(--ink2)'; }
  else if(n <= 3){ s.textContent = n + (n === 1 ? ' cruz' : ' cruces') + ': voto válido. ' + (n < 3 ? 'Puedes marcar ' + (3 - n) + ' más, o dejarlo así.' : 'Has usado todas.'); s.style.background = 'var(--ok-bg)'; s.style.color = 'var(--ok)'; }
  else { s.textContent = n + ' cruces: voto nulo. En una provincia se pueden marcar como máximo 3.'; s.style.background = 'var(--bad-bg)'; s.style.color = 'var(--bad)'; }
}
sb.addEventListener('change', senStatus);
['sc00','sc01','sc10'].forEach(function(id){ ROOT.querySelector('#ap-' + id).checked = true; });
senStatus();

/* ---------- Datos: 2023 o 29-N ---------- */
var M = window.PE.mapa, PR = window.PE.prov, P = {}, codes = Object.keys(M.prov);
codes.forEach(function(c){ var g = M.prov[c], p = PR[c]; P[c] = {n: g.n, d: g.d, c: g.c, V: p.V, e23: p.e23, e26: p.e26, v: p.v, s: p.s}; });
var D = {vb: M.vb, border: M.border};
// 29-N: data/escrutinio.js con definitivo:true y, en cada provincia, V (votos válidos) y v (% por partido).
function escOk(){ var e = window.PE.escrutinio; if(!e || !e.definitivo || !e.prov) return null; for(var i = 0; i < codes.length; i++){ var q = e.prov[codes[i]]; if(!q || !q.V || !q.v) return null; } return e; }
var ESC = escOk();
var DS = ESC ? '29N' : '2023';
function pd(c){ var p = P[c]; if(DS === '2023') return {V: p.V, e: p.e23, v: p.v, s: p.s}; var q = ESC.prov[c]; return {V: q.V, e: p.e26, v: q.v, s: q.s}; }
function lbl(){ return DS === '2023' ? '2023' : 'el 29-N'; }
function totV(){ var t = 0; codes.forEach(function(c){ t += pd(c).V; }); return t; }

/* ---------- 3. Mapa de escaños ---------- */
var map = $('#ap-map'); map.setAttribute('viewBox', D.vb.join(' '));
function bucket(e){ return e <= 2 ? 1 : e <= 4 ? 2 : e <= 7 ? 3 : e <= 12 ? 4 : 5; }
var selProv = '42';
var paths = {};
codes.forEach(function(c){
  var p = P[c], b = bucket(p.e26);
  var pa = el('path', {d: p.d, class: 'pv f' + b, tabindex: 0, role: 'button'}, map);
  pa.setAttribute('aria-label', p.n + ': ' + p.e26 + ' escaños');
  var tt = el('title', {}, pa); tt.textContent = p.n + ' · ' + p.e26 + ' escaños';
  pa.addEventListener('click', function(){ pick(c); });
  pa.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); pick(c); } });
  paths[c] = pa;
});
el('path', {d: D.border, class: 'bd'}, map);
codes.forEach(function(c){ var p = P[c]; if(!p.c) return; var t = el('text', {x: p.c[0], y: p.c[1], class: 't' + bucket(p.e26)}, map); t.textContent = p.e26; });
function pick(c){
  selProv = c;
  for(var k in paths) paths[k].classList.toggle('on', k === c);
  var p = P[c];
  var rows = [[c, p.n], ['28', 'Madrid'], ['42', 'Soria'], ['all', 'Media']];
  var seen = {}; rows = rows.filter(function(r){ if(seen[r[0]]) return false; seen[r[0]] = 1; return true; });
  var vals = rows.map(function(r){ if(r[0] === 'all') return totV() / 350; var x = pd(r[0]); return x.V / x.e; });
  var mx = Math.max.apply(null, vals);
  $('#ap-cost').innerHTML = rows.map(function(r, i){
    return '<div class="r' + (r[0] === c ? ' me' : '') + '"><b>' + r[1] + '</b><div class="bar"><i style="width:' + (vals[i] / mx * 100).toFixed(1) + '%"></i></div><span class="v">' + nf.format(Math.round(vals[i] / 100) * 100) + '</span></div>';
  }).join('');
  $('#ap-costT').textContent = p.n + ': ' + p.e26 + ' escaños en 2026' + (p.e26 !== p.e23 ? ' (' + p.e23 + ' en 2023)' : '') + '. Votos válidos por escaño en ' + lbl() + ':';
}
pick('42');

/* ---------- 4. D'Hondt ---------- */
var dsel = $('#ap-dhProv');
codes.slice().sort(function(a,b){ return P[a].n.localeCompare(P[b].n, 'es'); }).forEach(function(c){
  var o = document.createElement('option'); o.value = c; dsel.appendChild(o);
});
var DH = {c: '47', votes: {}, V: 0, V0: 0, shown: null};
function optLabels(){ Array.prototype.forEach.call(dsel.options, function(o){ o.textContent = P[o.value].n + ' · ' + pd(o.value).e + ' escaños'; }); }
function loadProv(c){
  var x = pd(c); DH.c = c; DH.V = DH.V0 = x.V; DH.votes = {}; DH.shown = null;
  for(var k in x.v) DH.votes[k] = Math.round(x.V * x.v[k] / 100);
  dsel.value = c; $('#ap-dhReset').hidden = true; renderDH();
}
function compute(){
  var n = pd(DH.c).e, thr = DH.V * 0.03, q = [], seats = {}, k, d;
  for(k in DH.votes){ seats[k] = 0; if(DH.votes[k] < thr) continue; for(d = 1; d <= n + 1; d++) q.push({k: k, d: d, v: DH.votes[k] / d}); }
  q.sort(function(a, b){ return b.v - a.v || DH.votes[b.k] - DH.votes[a.k]; });
  var rank = {}; q.forEach(function(x, i){ rank[x.k + '/' + x.d] = i; });
  for(var i = 0; i < n; i++) seats[q[i].k]++;
  return {n: n, thr: thr, q: q, rank: rank, seats: seats};
}
function renderDH(){
  var R = compute(), n = R.n, shown = DH.shown === null ? n : DH.shown;
  var parties = Object.keys(DH.votes).sort(function(a, b){ return DH.votes[b] - DH.votes[a]; });
  var maxS = 1; parties.forEach(function(k){ maxS = Math.max(maxS, R.seats[k]); });
  var cols = Math.min(n, maxS + 1);
  var h = '<thead><tr><th>Partido</th><th></th>';
  for(var d = 1; d <= cols; d++) h += '<th>÷' + d + '</th>';
  h += '</tr></thead><tbody>';
  parties.forEach(function(k){
    var v = DH.votes[k], under = v < R.thr;
    h += '<tr' + (under ? ' class="under"' : '') + '><td class="pn"><div class="pc"><i class="dot" style="background:' + col(k) + '"></i>' + nom(k) + ' <span class="muted" style="font-weight:500">' + f1(v / DH.V * 100) + ' %</span></div></td>';
    h += '<td class="st"><span class="step"><button type="button" data-k="' + k + '" data-s="-1" aria-label="Quitar un punto a ' + nom(k) + '">−</button><button type="button" data-k="' + k + '" data-s="1" aria-label="Sumar un punto a ' + nom(k) + '">+</button></span></td>';
    for(var d = 1; d <= cols; d++){
      if(under){ h += d === 1 ? '<td colspan="' + cols + '" style="text-align:left"><span class="pill neu">No llega al 3 %</span></td>' : ''; continue; }
      var r = R.rank[k + '/' + d], val = nf.format(Math.round(v / d));
      if(r < shown) h += '<td class="win" style="background:' + col(k) + '">' + val + '<sup>' + (r + 1) + '.º</sup></td>';
      else if(r === shown && shown < n) h += '<td class="next">' + val + '</td>';
      else h += '<td' + (r >= n ? ' class="out"' : '') + '>' + val + '</td>';
    }
    h += '</tr>';
  });
  $('#ap-dhT').innerHTML = h + '</tbody>';
  // escaños
  var order = R.q.slice(0, n), sh = '';
  order.forEach(function(x, i){ sh += i < shown ? '<i style="background:' + col(x.k) + '" title="' + (i + 1) + '.º escaño: ' + nom(x.k) + '"></i>' : '<i class="e"></i>'; });
  $('#ap-dhSeats').innerHTML = sh;
  // nota
  var note;
  if(shown < n){
    var nx = R.q[shown];
    note = shown === 0 ? 'Empieza el reparto: el cociente más alto es ' + nom(nx.k) + ' ÷1, con ' + nf.format(Math.round(nx.v)) + ' votos. Ese es el primer escaño.' :
      'Llevamos ' + shown + ' de ' + n + '. El siguiente cociente más alto es ' + nom(nx.k) + ' ÷' + nx.d + ' (' + nf.format(Math.round(nx.v)) + '): el escaño ' + (shown + 1) + '.º es suyo.';
  } else {
    var last = R.q[n - 1], first = R.q[n], extra = '';
    if(first){
      var need = Math.floor(last.v * first.d - DH.votes[first.k]) + 1;
      extra = ' Al ' + nom(first.k) + ' le faltaron unos ' + nf.format(need) + ' votos para quitárselo.';
    }
    var res = parties.filter(function(k){ return R.seats[k]; }).map(function(k){ return nom(k) + ' ' + R.seats[k]; }).join(', ');
    note = 'Reparto: ' + res + '. El último escaño (' + n + '.º) fue para ' + nom(last.k) + ' con un cociente de ' + nf.format(Math.round(last.v)) + ' votos.' + extra + ' La barrera del 3 % en ' + P[DH.c].n + ' es de ' + nf.format(Math.ceil(R.thr)) + ' votos.';
  }
  $('#ap-dhNote').textContent = note;
  $('#ap-dhSrc').textContent = 'Datos: ' + (DS === '2023' ? 'elecciones de 2023, con los escaños de 2023' : 'escrutinio definitivo del 29-N, con los escaños de 2026') + ' (Ministerio del Interior).';
  $('#ap-dhNext').hidden = !(shown < n);
  $('#ap-dhStep').textContent = shown < n ? 'Ver todo' : 'Paso a paso';
}
$('#ap-dhT').addEventListener('click', function(ev){
  var b = ev.target.closest('button[data-k]'); if(!b) return;
  var k = b.getAttribute('data-k'), step = Math.round(DH.V0 / 100) * +b.getAttribute('data-s');
  var nv = Math.max(0, DH.votes[k] + step); DH.V += nv - DH.votes[k]; DH.votes[k] = nv;
  $('#ap-dhReset').hidden = false; renderDH();
});
dsel.addEventListener('change', function(){ loadProv(dsel.value); });
$('#ap-dhStep').addEventListener('click', function(){ var n = pd(DH.c).e; DH.shown = (DH.shown === null || DH.shown >= n) ? 0 : null; renderDH(); });
$('#ap-dhNext').addEventListener('click', function(){ DH.shown++; if(DH.shown >= pd(DH.c).e) DH.shown = null; renderDH(); });
$('#ap-dhReset').addEventListener('click', function(){ loadProv(DH.c); });
optLabels(); loadProv('47');

/* ---------- 5. dato del 3 % ---------- */
function dato(){ $('#ap-bnDato').textContent = 'En Madrid, el 3 % de los votos válidos de ' + lbl() + ' eran ' + nf.format(Math.ceil(pd('28').V * 0.03)) + ' votos; en Soria, ' + nf.format(Math.ceil(pd('42').V * 0.03)) + '.'; }
dato();

/* ---------- 6. Votos vs escaños ---------- */
function drawDB(){
  var vot = {}, sea = {}, T = 0;
  codes.forEach(function(c){ var p = pd(c); T += p.V; for(var k in p.v) vot[k] = (vot[k] || 0) + p.V * p.v[k] / 100; for(var s in p.s) sea[s] = (sea[s] || 0) + p.s[s]; });
  var list = Object.keys(sea).sort(function(a, b){ return sea[b] - sea[a] || vot[b] - vot[a]; });
  var X = 42, h = '';
  list.forEach(function(k){
    var a = vot[k] / T * 100, b = sea[k] / 350 * 100, lo = Math.min(a, b), hi = Math.max(a, b), up = b >= a;
    h += '<div class="r"><b>' + nom(k) + '</b><div class="tr">' +
      '<span class="ln" style="left:' + (lo / X * 100) + '%;width:' + ((hi - lo) / X * 100) + '%;background:' + col(k) + '"></span>' +
      '<span class="o" style="left:' + (a / X * 100) + '%;border-color:' + col(k) + '"></span>' +
      '<span class="f" style="left:' + (b / X * 100) + '%;background:' + col(k) + '"></span></div>' +
      '<span class="val">' + f1(a) + ' → <b class="' + (up ? 'up' : 'dn') + '">' + f1(b) + ' %</b> · ' + sea[k] + '</span></div>';
  });
  h += '<div class="ax"><i></i><div>' + [0, 10, 20, 30, 40].map(function(t){ return '<span style="left:' + (t / X * 100) + '%">' + t + ' %</span>'; }).join('') + '</div><i style="text-align:right;font-style:normal">votos → escaños</i></div>';
  $('#ap-db').innerHTML = h;
  var a = list[0], b = list.filter(function(k){ return sea[k] / 350 < vot[k] / T; });
  var key = '<b>' + (DS === '2023' ? 'En 2023' : 'El 29-N') + '</b>, ' + nom(a) + ' sacó el ' + f1(vot[a] / T * 100) + ' % de los votos y el ' + f1(sea[a] / 350 * 100) + ' % de los escaños.';
  if(b.length) key += ' Perdieron peso ' + b.map(function(k){ return nom(k) + ' (' + f1(vot[k] / T * 100) + ' % → ' + f1(sea[k] / 350 * 100) + ' %)'; }).join(', ') + '.';
  $('#ap-dbKey').innerHTML = key;
}
drawDB();

/* ---------- selector de datos ---------- */
function setDS(d){
  if(d === '29N' && !ESC) return; DS = d;
  $('#ap-ds23').setAttribute('aria-pressed', d === '2023'); $('#ap-ds26').setAttribute('aria-pressed', d === '29N');
  ROOT.querySelectorAll('.dtag').forEach(function(t){ t.textContent = d === '2023' ? 'Datos 2023' : 'Datos 29-N'; });
  pick(selProv); optLabels(); loadProv(DH.c); dato(); drawDB();
}
$('#ap-ds23').onclick = function(){ setDS('2023'); }; $('#ap-ds26').onclick = function(){ setDS('29N'); };
function revisaEsc(){ var e = escOk(); if(e && e !== ESC){ ESC = e; $('#ap-ds26').disabled = false; $('#ap-dsNote').textContent = 'Resultados definitivos del 29-N. Pulsa 2023 para comparar.'; setDS('29N'); } }
revisaEsc();
/* ---------- 7. Senado ---------- */
(function(){
  var r = $('#ap-senR');
  function draw(){
    var m = +r.value, base = 34;
    var A = base + m / 2, B = base - m / 2, C = 14;
    var cands = [];
    [['A', A, 'var(--pa)'], ['B', B, 'var(--pb)'], ['C', C, 'var(--pc)']].forEach(function(p){
      var decay = p[0] === 'C' ? [1, .9] : [1, .975, .955];
      decay.forEach(function(f, i){ cands.push({n: 'Candidat' + (i % 2 ? 'o ' : 'a ') + p[0] + (i + 1), v: p[1] * f, c: p[2], p: p[0]}); });
    });
    cands.sort(function(x, y){ return y.v - x.v; });
    var mx = cands[0].v, won = {A: 0, B: 0, C: 0}, h = '';
    cands.forEach(function(x, i){
      if(i < 4) won[x.p]++;
      if(i === 4) h += '<div class="cut"><span>4 escaños</span></div>';
      h += '<div class="r' + (i >= 4 ? ' lose' : '') + '"><b>' + x.n + '</b><div class="bar"><i style="width:' + (x.v / mx * 100).toFixed(1) + '%;background:' + x.c + '"></i></div><span class="num" style="text-align:right">' + (i < 4 ? 'Electo' : '') + '</span></div>';
    });
    $('#ap-sb').innerHTML = h;
    var res = 'A ' + won.A + ' · B ' + won.B + (won.C ? ' · C ' + won.C : '');
    $('#ap-senRv').textContent = (m === 0 ? 'empate' : (m > 0 ? '+' : '') + f1(m) + ' puntos') + ' → ' + res;
  }
  r.addEventListener('input', draw); draw();
})();
  // lección activa en la barra
  var chips = Array.prototype.slice.call(ROOT.querySelectorAll('#ap-achips a')), bar = $('#ap-achips');
  function mark(id){
    chips.forEach(function(a){ var on = a.getAttribute('href') === '#aprende-' + id.replace('ap-', ''); a.classList.toggle('on', on);
      if(on){ var l = a.offsetLeft - bar.offsetLeft, r = l + a.offsetWidth; if(l < bar.scrollLeft || r > bar.scrollLeft + bar.clientWidth) bar.scrollLeft = l - 16; } });
  }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) mark(e.target.id); }); }, {root: ROOT, rootMargin: '-120px 0px -60% 0px'});
    ROOT.querySelectorAll('article.card').forEach(function(a){ io.observe(a); });
  }
  mark('ap-l1');
  $('#ap-btnCerrar').onclick = function(){ window.PE_APRENDE.cerrar(); };
  ROOT.addEventListener('keydown', function(e){ if(e.key === 'Escape') window.PE_APRENDE.cerrar(); });
  return revisaEsc;
}

window.PE_APRENDE = {
  abrir: function(leccion){
    if(!ROOT) revisaEsc = init(); else revisaEsc();
    ROOT.hidden = false; document.body.classList.add('ap-open');
    var t = leccion && ROOT.querySelector('#ap-' + leccion);
    if(t) t.scrollIntoView(); else if(leccion === '') ROOT.scrollTop = 0;
    var b = document.getElementById('ap-btnCerrar'); if(b && !t) b.focus({preventScroll: true});
  },
  cerrar: function(){
    if(!ROOT || ROOT.hidden) return;
    ROOT.hidden = true; document.body.classList.remove('ap-open');
    if(window.PE_APRENDE.alCerrar) window.PE_APRENDE.alCerrar();
  },
  abierto: function(){ return !!ROOT && !ROOT.hidden; }
};
})();
