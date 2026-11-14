/* Le regole del gioco del bagno, senza disegni: così si possono provare da sole (prove/bagno.test.js).
   Misure in centimetri. Le distanze minime sono quelle della tabella del libro di Melania (p. 126) e dell'elenco di
   p. 125; WC e bidet filo muro (36 × 52) e doccia 80 × 80 vengono dalle pagine 126 e 129. Il lavabo 60 × 45 è una
   misura d'esempio. */
(function (radice) {
  "use strict";
  var MISURE = {
    lavabo: { nome: "Lavabo", larghezza: 60, profondita: 45 },
    wc: { nome: "WC", larghezza: 36, profondita: 52 },
    bidet: { nome: "Bidet", larghezza: 36, profondita: 52 },
    doccia: { nome: "Doccia", larghezza: 80, profondita: 80 }
  };
  var DISTANZE = { wcBidet: 20, wcParete: 15, bidetParete: 20, lavaboSanitari: 15, sanitariDoccia: 10,
    davantiSanitari: 60, davantiLavabo: 70, accessoDoccia: 60 };
  var PARETI = ["N", "E", "S", "O"];
  var NOMI_PARETI = { N: "in alto", E: "a destra", S: "in basso", O: "a sinistra" };
  var TOLLERANZA = 0.01;

  function lunghezzaParete(stanza, parete) { return parete === "N" || parete === "S" ? stanza.w : stanza.h; }

  /* tiene il pezzo dentro la sua parete e sulla griglia di 5 cm */
  function limita(stanza, pezzo) {
    var massimo = lunghezzaParete(stanza, pezzo.parete) - MISURE[pezzo.tipo].larghezza;
    var pos = Math.round(pezzo.pos / 5) * 5;
    return { tipo: pezzo.tipo, parete: pezzo.parete, pos: Math.max(0, Math.min(massimo, pos)) };
  }

  function rettangolo(stanza, pezzo) {
    var L = MISURE[pezzo.tipo].larghezza, P = MISURE[pezzo.tipo].profondita;
    if (pezzo.parete === "N") { return { x: pezzo.pos, y: 0, w: L, h: P }; }
    if (pezzo.parete === "S") { return { x: pezzo.pos, y: stanza.h - P, w: L, h: P }; }
    if (pezzo.parete === "O") { return { x: 0, y: pezzo.pos, w: P, h: L }; }
    return { x: stanza.w - P, y: pezzo.pos, w: P, h: L };
  }

  /* la striscia libera che serve davanti a un pezzo, profonda «quanto» */
  function davanti(stanza, pezzo, quanto) {
    var r = rettangolo(stanza, pezzo);
    if (pezzo.parete === "N") { return { x: r.x, y: r.y + r.h, w: r.w, h: quanto }; }
    if (pezzo.parete === "S") { return { x: r.x, y: r.y - quanto, w: r.w, h: quanto }; }
    if (pezzo.parete === "O") { return { x: r.x + r.w, y: r.y, w: quanto, h: r.h }; }
    return { x: r.x - quanto, y: r.y, w: quanto, h: r.h };
  }

  function sovrapposti(a, b) {
    return a.x < b.x + b.w - TOLLERANZA && b.x < a.x + a.w - TOLLERANZA && a.y < b.y + b.h - TOLLERANZA && b.y < a.y + a.h - TOLLERANZA;
  }
  function dentro(stanza, r) {
    return r.x >= -TOLLERANZA && r.y >= -TOLLERANZA && r.x + r.w <= stanza.w + TOLLERANZA && r.y + r.h <= stanza.h + TOLLERANZA;
  }
  function distanza(a, b) {
    var dx = Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w));
    var dy = Math.max(0, a.y - (b.y + b.h), b.y - (a.y + a.h));
    return Math.sqrt(dx * dx + dy * dy);
  }
  function zonaPorta(stanza) {
    var p = stanza.porta, l = p.larghezza;
    if (p.parete === "N") { return { x: p.pos, y: 0, w: l, h: l }; }
    if (p.parete === "S") { return { x: p.pos, y: stanza.h - l, w: l, h: l }; }
    if (p.parete === "O") { return { x: 0, y: p.pos, w: l, h: l }; }
    return { x: stanza.w - l, y: p.pos, w: l, h: l };
  }

  /* quanti centimetri sono davvero liberi davanti a un pezzo (fino al primo ostacolo o alla parete di fronte) */
  function liberoDavanti(stanza, pezzo, altri) {
    var fino = pezzo.parete === "N" || pezzo.parete === "S" ? stanza.h : stanza.w;
    var prof = MISURE[pezzo.tipo].profondita, libero = fino - prof, passo;
    for (passo = 5; passo <= fino - prof; passo += 5) {
      var striscia = davanti(stanza, pezzo, passo);
      if (altri.some(function (r) { return sovrapposti(striscia, r); })) { libero = passo - 5; break; }
    }
    return libero;
  }

  /* la doccia si usa se almeno un lato non contro il muro ha 60 cm liberi: restituisce il lato migliore */
  function accessoDoccia(stanza, r, altri) {
    var lati = [
      { contro: r.y <= TOLLERANZA, zona: function (q) { return { x: r.x, y: r.y - q, w: r.w, h: q }; } },
      { contro: r.y + r.h >= stanza.h - TOLLERANZA, zona: function (q) { return { x: r.x, y: r.y + r.h, w: r.w, h: q }; } },
      { contro: r.x <= TOLLERANZA, zona: function (q) { return { x: r.x - q, y: r.y, w: q, h: r.h }; } },
      { contro: r.x + r.w >= stanza.w - TOLLERANZA, zona: function (q) { return { x: r.x + r.w, y: r.y, w: q, h: r.h }; } }
    ];
    var migliore = { libero: 0, zona: null };
    lati.forEach(function (lato) {
      if (lato.contro) { return; }
      var libero = 0, q;
      for (q = 5; q <= 200; q += 5) {
        var z = lato.zona(q);
        if (!dentro(stanza, z) || altri.some(function (o) { return sovrapposti(z, o); })) { break; }
        libero = q;
      }
      if (libero > migliore.libero) { migliore = { libero: libero, zona: lato.zona(Math.min(libero, DISTANZE.accessoDoccia)) }; }
    });
    return migliore;
  }

  /* il giudizio: «ci sta» (niente si sovrappone, la porta si apre) e «funziona» (le distanze del libro) */
  function valuta(stanza, pezzi) {
    var r = {}, voci = [], zone = [], tipi = pezzi.map(function (p) { return p.tipo; });
    pezzi.forEach(function (p) { r[p.tipo] = rettangolo(stanza, p); });
    function pezzo(tipo) { return pezzi[tipi.indexOf(tipo)]; }
    function altriDi(tipo) { return tipi.filter(function (t) { return t !== tipo; }).map(function (t) { return r[t]; }); }
    function voce(id, gruppo, testo, ok, misura, serve, coinvolti, pagina) {
      voci.push({ id: id, gruppo: gruppo, testo: testo, ok: ok, misura: misura, serve: serve, pezzi: coinvolti, pagina: pagina });
    }

    var urti = [];
    tipi.forEach(function (a, i) {
      tipi.slice(i + 1).forEach(function (b) { if (sovrapposti(r[a], r[b])) { urti.push([a, b]); } });
    });
    voce("sovrapposti", "ci-sta", urti.length ? MISURE[urti[0][0]].nome + " e " + MISURE[urti[0][1]].nome.toLowerCase() + " si sovrappongono" : "Niente si sovrappone",
      !urti.length, null, null, urti.length ? urti[0] : [], null);
    var porta = zonaPorta(stanza);
    var dietro = tipi.filter(function (t) { return sovrapposti(r[t], porta); });
    voce("porta", "ci-sta", dietro.length ? MISURE[dietro[0]].nome + " blocca la porta" : "La porta si apre", !dietro.length, null, null, dietro, null);

    /* p. 127: WC e bidet hanno due modi sensati di stare al mondo, affiancati sulla stessa parete o uno di fronte all'altro */
    var pw = pezzo("wc"), pb = pezzo("bidet"), opposte = { N: "S", S: "N", E: "O", O: "E" };
    var affiancati = pw.parete === pb.parete;
    var diFronte = opposte[pw.parete] === pb.parete && pw.pos < pb.pos + MISURE.bidet.larghezza && pb.pos < pw.pos + MISURE.wc.larghezza;
    voce("coppia", "funziona", "WC e bidet affiancati o uno di fronte all'altro", affiancati || diFronte, null, null, affiancati || diFronte ? [] : ["wc", "bidet"], 127);
    var d = Math.round(distanza(r.wc, r.bidet));
    voce("wc-bidet", "funziona", "Tra WC e bidet", d >= DISTANZE.wcBidet, d, DISTANZE.wcBidet, ["wc", "bidet"], 126);
    function daParete(tipo) {
      var p = pezzo(tipo);
      return Math.round(Math.min(p.pos, lunghezzaParete(stanza, p.parete) - p.pos - MISURE[tipo].larghezza));
    }
    d = daParete("wc");
    voce("wc-parete", "funziona", "WC dalla parete laterale", d >= DISTANZE.wcParete, d, DISTANZE.wcParete, ["wc"], 126);
    d = daParete("bidet");
    voce("bidet-parete", "funziona", "Bidet dalla parete laterale", d >= DISTANZE.bidetParete, d, DISTANZE.bidetParete, ["bidet"], 126);
    d = Math.round(Math.min(distanza(r.lavabo, r.wc), distanza(r.lavabo, r.bidet)));
    voce("lavabo-sanitari", "funziona", "Lavabo dai sanitari vicini", d >= DISTANZE.lavaboSanitari, d, DISTANZE.lavaboSanitari, ["lavabo"], 126);
    d = Math.round(Math.min(distanza(r.doccia, r.wc), distanza(r.doccia, r.bidet)));
    voce("sanitari-doccia", "funziona", "WC e bidet dalla doccia", d >= DISTANZE.sanitariDoccia, d, DISTANZE.sanitariDoccia, ["doccia"], 125);

    var liberoWc = liberoDavanti(stanza, pezzo("wc"), altriDi("wc")), liberoBidet = liberoDavanti(stanza, pezzo("bidet"), altriDi("bidet"));
    d = Math.min(liberoWc, liberoBidet);
    var stretti = [];
    if (liberoWc < DISTANZE.davantiSanitari) { stretti.push("wc"); }
    if (liberoBidet < DISTANZE.davantiSanitari) { stretti.push("bidet"); }
    voce("davanti-sanitari", "funziona", "Davanti a WC e bidet", d >= DISTANZE.davantiSanitari, d, DISTANZE.davantiSanitari, stretti, 126);
    zone.push({ tipo: "wc", ok: liberoWc >= DISTANZE.davantiSanitari, r: davanti(stanza, pezzo("wc"), DISTANZE.davantiSanitari) });
    zone.push({ tipo: "bidet", ok: liberoBidet >= DISTANZE.davantiSanitari, r: davanti(stanza, pezzo("bidet"), DISTANZE.davantiSanitari) });
    d = liberoDavanti(stanza, pezzo("lavabo"), altriDi("lavabo"));
    voce("davanti-lavabo", "funziona", "Davanti al lavabo", d >= DISTANZE.davantiLavabo, d, DISTANZE.davantiLavabo, d >= DISTANZE.davantiLavabo ? [] : ["lavabo"], 126);
    zone.push({ tipo: "lavabo", ok: d >= DISTANZE.davantiLavabo, r: davanti(stanza, pezzo("lavabo"), DISTANZE.davantiLavabo) });
    var accesso = accessoDoccia(stanza, r.doccia, altriDi("doccia"));
    voce("accesso-doccia", "funziona", "Accesso alla doccia", accesso.libero >= DISTANZE.accessoDoccia, accesso.libero, DISTANZE.accessoDoccia,
      accesso.libero >= DISTANZE.accessoDoccia ? [] : ["doccia"], 126);
    if (accesso.zona) { zone.push({ tipo: "doccia", ok: accesso.libero >= DISTANZE.accessoDoccia, r: accesso.zona }); }

    var ciSta = voci.filter(function (v) { return v.gruppo === "ci-sta"; }).every(function (v) { return v.ok; });
    var funziona = ciSta && voci.every(function (v) { return v.ok; });
    return { ciSta: ciSta, funziona: funziona, voci: voci, zone: zone, rettangoli: r, porta: porta };
  }

  var LIVELLI = [
    { nome: "Riscaldamento", sotto: "5 metri quadri: qui c'è spazio per sbagliare", stanza: { w: 250, h: 200, porta: { parete: "S", pos: 20, larghezza: 70 } },
      pezzi: [{ tipo: "wc", parete: "N", pos: 0 }, { tipo: "bidet", parete: "N", pos: 40 }, { tipo: "lavabo", parete: "N", pos: 80 }, { tipo: "doccia", parete: "E", pos: 120 }],
      soluzione: [{ tipo: "doccia", parete: "E", pos: 90 }, { tipo: "lavabo", parete: "S", pos: 90 }, { tipo: "wc", parete: "N", pos: 40 }, { tipo: "bidet", parete: "N", pos: 125 }] },
    { nome: "I 4 metri quadri del libro", sotto: "2 metri per 2: ogni centimetro è una trattativa", stanza: { w: 200, h: 200, porta: { parete: "S", pos: 10, larghezza: 70 } },
      pezzi: [{ tipo: "wc", parete: "N", pos: 0 }, { tipo: "bidet", parete: "N", pos: 40 }, { tipo: "lavabo", parete: "N", pos: 80 }, { tipo: "doccia", parete: "E", pos: 120 }],
      soluzione: [{ tipo: "doccia", parete: "N", pos: 0 }, { tipo: "lavabo", parete: "N", pos: 80 }, { tipo: "wc", parete: "S", pos: 140 }, { tipo: "bidet", parete: "S", pos: 80 }] },
    { nome: "Stretto e lungo", sotto: "1,60 per 2,50: il bagno corridoio", stanza: { w: 160, h: 250, porta: { parete: "S", pos: 45, larghezza: 70 } },
      pezzi: [{ tipo: "wc", parete: "O", pos: 0 }, { tipo: "bidet", parete: "O", pos: 40 }, { tipo: "lavabo", parete: "O", pos: 80 }, { tipo: "doccia", parete: "E", pos: 0 }],
      soluzione: [{ tipo: "doccia", parete: "N", pos: 0 }, { tipo: "lavabo", parete: "O", pos: 180 }, { tipo: "wc", parete: "E", pos: 80 }, { tipo: "bidet", parete: "E", pos: 140 }] }
  ];

  var api = { MISURE: MISURE, DISTANZE: DISTANZE, PARETI: PARETI, NOMI_PARETI: NOMI_PARETI, LIVELLI: LIVELLI, limita: limita,
    rettangolo: rettangolo, davanti: davanti, sovrapposti: sovrapposti, distanza: distanza, zonaPorta: zonaPorta,
    lunghezzaParete: lunghezzaParete, valuta: valuta };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  radice.MDB = radice.MDB || {};
  radice.MDB.bagno = api;
})(typeof window !== "undefined" ? window : globalThis);
