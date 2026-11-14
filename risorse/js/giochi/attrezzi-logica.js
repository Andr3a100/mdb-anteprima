/* I cinque conti della «cassetta degli attrezzi», senza la pagina intorno: si provano da soli (prove/attrezzi.test.js).
   Ogni formula viene dal libro di Melania, con la pagina accanto. Sono prime stime, non un progetto. */
(function (radice) {
  "use strict";

  /* p. 38: «Meglio prevedere un 10-15% per gli imprevisti». Con un budget fisso, il progetto si ferma prima. */
  function cuscinetto(budget) {
    var alto = budget / 1.10, basso = budget / 1.15;
    return { progettoDa: basso, progettoA: alto, margineDa: budget - alto, margineA: budget - basso };
  }

  /* p. 28 e 52: circa 1 cm di pendenza per ogni metro di percorso, più lo spessore del tubo. */
  function pendenza(metri, tubo) {
    return { dislivello: metri * 1, totale: metri * 1 + (tubo || 0) };
  }

  /* p. 21: in linea generale la superficie finestrata è almeno 1/8 di quella del pavimento. */
  function luceNaturale(pavimento, finestra) {
    var serve = pavimento / 8;
    return { serve: serve, rapporto: pavimento > 0 ? finestra / pavimento : 0, basta: finestra + 1e-9 >= serve, manca: Math.max(0, serve - finestra) };
  }

  /* p. 67: lumen = metri quadri × lux consigliati; +30-40% con pareti e mobili scuri, +15-20% sopra i 2,7 m. */
  var LUX = {
    camera: { nome: "Camera da letto", da: 100, a: 150 },
    soggiorno: { nome: "Soggiorno", da: 200, a: 300 },
    cucina: { nome: "Cucina", da: 300, a: 500 },
    bagno: { nome: "Bagno", da: 300, a: 500 },
    studio: { nome: "Studio", da: 400, a: 500 }
  };
  function lumen(stanza, metriQuadri, scuro, alto) {
    var l = LUX[stanza], da = metriQuadri * l.da, a = metriQuadri * l.a;
    if (scuro) { da *= 1.30; a *= 1.40; }
    if (alto) { da *= 1.15; a *= 1.20; }
    return { da: da, a: a };
  }

  /* p. 148: il piano di lavoro sta indicativamente 10-15 cm sotto il gomito. */
  function pianoCucina(gomito) {
    return { da: gomito - 15, a: gomito - 10 };
  }

  /* scrive i numeri all'italiana: 43.500 · 1,8 */
  function numero(valore, decimali) {
    var fisso = Number(valore).toFixed(decimali || 0).split(".");
    fisso[0] = fisso[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return fisso.join(",");
  }
  /* legge un numero scritto all'italiana («1.250,5») o con il punto decimale («1250.5») */
  function leggi(testo) {
    var pulito = String(testo == null ? "" : testo).trim().replace(/\s/g, "");
    if (!pulito) { return NaN; }
    if (pulito.indexOf(",") >= 0) { pulito = pulito.replace(/\./g, "").replace(",", "."); }
    else if (/^\d{1,3}(\.\d{3})+$/.test(pulito)) { pulito = pulito.replace(/\./g, ""); }
    return /^\d+(\.\d+)?$/.test(pulito) ? Number(pulito) : NaN;
  }

  var api = { cuscinetto: cuscinetto, pendenza: pendenza, luceNaturale: luceNaturale, lumen: lumen, pianoCucina: pianoCucina, LUX: LUX, numero: numero, leggi: leggi };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  radice.MDB = radice.MDB || {};
  radice.MDB.attrezzi = api;
})(typeof window !== "undefined" ? window : globalThis);
