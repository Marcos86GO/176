window.PE=window.PE||{};window.PE.transferencia=
{
 "actualizado": "2026-11-19",
 "nota": "Transferencia de voto entre la media ponderada de antes del 23-J de 2023 y la media de hoy. Categorías: PP, PSOE, VOX, SUMAR (2023), FA, PODEMOS, ADELANTE, SALF, NAC (ERC, Junts, EH Bildu, PNV, BNG y CC), OTROS (resto de partidos y voto en blanco) y ABS (no vota o vota nulo; en 2023 incluye a quien aún no tenía derecho a voto).",
 "antes": {
  "f": "2023-07-17",
  "participacion": 66.6,
  "voto": { "PP": 34.1, "PSOE": 28.3, "SUMAR": 13.4, "VOX": 13.0, "ERC": 2.2, "JUNTS": 2.0, "BILDU": 1.2, "PNV": 1.1, "BNG": 0.8, "CUP": 0.5, "CC": 0.4, "UPN": 0.1, "EV": 0.1 },
  "metodo": "Media ponderada de la web aplicada a las encuestas publicadas antes de la veda de 2023: la última de cada encuestadora con fin del trabajo de campo entre el 26 de junio y el 17 de julio de 2023, sin el CIS ni las encuestas sin muestra, con peso = entrevistas × ½^(días/3). La participación es la real del 23-J.",
  "encuestas": [
   [ "Data10/Okdiario", "2023-07-17", 1500 ],
   [ "EM-Analytics/Electomanía", "2023-07-17", 1873 ],
   [ "AtlasIntel", "2023-07-17", 2974 ],
   [ "GESOP/The Adelaide Review", "2023-07-17", 1200 ],
   [ "Sigma Dos/El Mundo", "2023-07-17", 8183 ],
   [ "YouGov", "2023-07-17", 10807 ],
   [ "GAD3/ABC", "2023-07-17", 8001 ],
   [ "NC Report/La Razón", "2023-07-16", 1000 ],
   [ "Sondaxe/La Voz de Galicia", "2023-07-16", 1000 ],
   [ "40dB/Prisa", "2023-07-16", 2000 ],
   [ "Simple Lógica/elDiario.es", "2023-07-16", 1600 ],
   [ "SocioMétrica/El Español", "2023-07-16", 1500 ],
   [ "IMOP/El Confidencial", "2023-07-14", 1843 ],
   [ "DYM/Henneo", "2023-07-13", 1021 ],
   [ "Hamalgama Métrica/Vozpópuli", "2023-07-13", 1000 ],
   [ "Celeste-Tel/Onda Cero", "2023-07-12", 1100 ],
   [ "Ipsos/La Vanguardia", "2023-07-06", 2001 ],
   [ "Top Position", "2023-07-06", 3200 ],
   [ "Opinòmetre/Ara", "2023-07-04", 1521 ]
  ],
  "fuente": { "t": "Wikipedia: Opinion polling for the 2023 Spanish general election", "u": "https://en.wikipedia.org/wiki/Opinion_polling_for_the_2023_Spanish_general_election" }
 },
 "matrices": [
  {
   "i": "40dB",
   "m": "El País y Cadena SER",
   "f": "2026-11-18",
   "n": 2000,
   "fu": { "t": "40dB: encuesta preelectoral de noviembre de 2026 (pág. 10, «Transferencias de voto»)", "u": "https://ep00.epimg.net/infografias/encuestas40db/2026/11-preelectoral/2026_11_preelectoral_informe.pdf" },
   "nota": "Medido sobre las barras del gráfico (no rotula los valores menores del 2 %). Sin filas para nacionalistas ni otros. «Otros, blanco y nulo» se reparte entre ADELANTE, NAC y OTROS como en la misma fila del CIS; los indecisos se excluyen.",
   "filas": {
    "PP": { "PP": 78.7, "PSOE": 0.8, "VOX": 15.8, "FA": 0.5, "PODEMOS": 0.0, "ADELANTE": 0.1, "SALF": 0.3, "NAC": 0.1, "OTROS": 2.1, "ABS": 1.5 },
    "PSOE": { "PP": 6.9, "PSOE": 78.7, "VOX": 4.7, "FA": 3.3, "PODEMOS": 0.0, "ADELANTE": 0.1, "SALF": 1.3, "NAC": 0.2, "OTROS": 0.5, "ABS": 4.3 },
    "VOX": { "PP": 3.1, "PSOE": 1.7, "VOX": 88.5, "FA": 0.0, "PODEMOS": 0.0, "ADELANTE": 0.0, "SALF": 0.0, "NAC": 0.0, "OTROS": 4.3, "ABS": 2.4 },
    "SUMAR": { "PP": 2.2, "PSOE": 23.7, "VOX": 1.3, "FA": 40.4, "PODEMOS": 8.5, "ADELANTE": 0.8, "SALF": 0.0, "NAC": 0.9, "OTROS": 1.4, "ABS": 20.8 },
    "ABS": { "PP": 15.9, "PSOE": 10.5, "VOX": 17.7, "FA": 1.6, "PODEMOS": 0.0, "ADELANTE": 0.4, "SALF": 0.0, "NAC": 1.3, "OTROS": 2.4, "ABS": 50.2 }
   }
  },
  {
   "i": "CIS",
   "m": "Estudio 3584",
   "f": "2026-10-30",
   "n": 45074,
   "fu": { "t": "CIS: estudio 3584, tabulación por recuerdo de voto (pregunta 5a, voto + simpatía)", "u": "https://www.cis.es/documents/d/guest/es3584vp_A-pdf" },
   "nota": "Voto + simpatía según participación y recuerdo de voto en 2023. Frente Amplio incluye Compromís y Ara Més; PP incluye UPN-PP; «Ninguno» y voto nulo cuentan como ABS; «No sabe» y «No contesta» se excluyen.",
   "filas": {
    "PP": { "PP": 70.2, "PSOE": 1.4, "VOX": 21.7, "FA": 0.1, "PODEMOS": 0.0, "ADELANTE": 0.1, "SALF": 1.0, "NAC": 0.1, "OTROS": 2.1, "ABS": 3.3 },
    "PSOE": { "PP": 5.8, "PSOE": 74.0, "VOX": 3.7, "FA": 3.7, "PODEMOS": 0.4, "ADELANTE": 1.1, "SALF": 0.4, "NAC": 2.3, "OTROS": 4.5, "ABS": 4.1 },
    "VOX": { "PP": 9.5, "PSOE": 0.8, "VOX": 79.1, "FA": 0.1, "PODEMOS": 0.0, "ADELANTE": 0.0, "SALF": 5.6, "NAC": 0.0, "OTROS": 3.1, "ABS": 1.7 },
    "SUMAR": { "PP": 1.1, "PSOE": 24.5, "VOX": 1.8, "FA": 38.5, "PODEMOS": 8.5, "ADELANTE": 5.6, "SALF": 0.2, "NAC": 6.5, "OTROS": 10.3, "ABS": 3.0 },
    "NAC": { "PP": 2.3, "PSOE": 10.7, "VOX": 2.2, "FA": 1.5, "PODEMOS": 0.3, "ADELANTE": 0.0, "SALF": 0.2, "NAC": 72.9, "OTROS": 5.7, "ABS": 4.2 },
    "OTROS": { "PP": 16.1, "PSOE": 11.3, "VOX": 10.0, "FA": 5.7, "PODEMOS": 0.6, "ADELANTE": 2.7, "SALF": 4.3, "NAC": 5.3, "OTROS": 30.1, "ABS": 13.9 },
    "ABS": { "PP": 15.4, "PSOE": 22.8, "VOX": 21.1, "FA": 4.6, "PODEMOS": 0.8, "ADELANTE": 1.4, "SALF": 2.4, "NAC": 5.3, "OTROS": 9.5, "ABS": 16.7 }
   }
  }
 ]
};
