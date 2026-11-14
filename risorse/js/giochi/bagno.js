/* «Il bagno in 4 metri quadri»: la pianta, il trascinamento e l'elenco dei controlli.
   Le regole stanno in bagno-logica.js (provate a parte); qui c'è solo ciò che si vede e si tocca. */
(function () {
  "use strict";
  var scatola = document.querySelector("[data-bagno]");
  var B = window.MDB && window.MDB.bagno;
  if (!scatola || !B) { return; }
  var NS = "http://www.w3.org/2000/svg";
  var pianta = scatola.querySelector("[data-pianta]");
  var verdetto = scatola.querySelector("[data-verdetto]"), verdettoIcona = scatola.querySelector("[data-verdetto-icona]");
  var verdettoCosa = scatola.querySelector("[data-verdetto-cosa]"), verdettoCome = scatola.querySelector("[data-verdetto-come]");
  var annuncio = scatola.querySelector("[data-annuncio]"), sotto = scatola.querySelector("[data-livello-sotto]");
  var sceltoNome = scatola.querySelector("[data-scelto-nome]"), prossimo = scatola.querySelector("[data-prossimo]");
  var elenchi = { "ci-sta": scatola.querySelector('[data-controlli="ci-sta"]'), "funziona": scatola.querySelector('[data-controlli="funziona"]') };
  var livello = 0, stanza = null, pezzi = [], gruppi = {}, strato = null, scelto = "wc", presa = null;

  function icona(nome) { return document.querySelector('template[data-icona="' + nome + '"]').content.firstElementChild.cloneNode(true); }
  function svg(nome, attributi) {
    var e = document.createElementNS(NS, nome), k;
    for (k in attributi) { if (Object.prototype.hasOwnProperty.call(attributi, k)) { e.setAttribute(k, attributi[k]); } }
    return e;
  }
  function trova(tipo) { return pezzi.filter(function (p) { return p.tipo === tipo; })[0]; }

  /* disegna la stanza vuota: pavimento, quadretti da 50 cm, muri, porta */
  function disegnaStanza() {
    pianta.replaceChildren();
    pianta.setAttribute("viewBox", "-20 -20 " + (stanza.w + 40) + " " + (stanza.h + 40));
    var ritaglio = svg("clipPath", { id: "bagno-dentro" });
    ritaglio.appendChild(svg("rect", { x: 0, y: 0, width: stanza.w, height: stanza.h }));
    pianta.appendChild(ritaglio);
    pianta.appendChild(svg("rect", { "class": "pavimento", x: 0, y: 0, width: stanza.w, height: stanza.h }));
    var i;
    for (i = 50; i < stanza.w; i += 50) { pianta.appendChild(svg("line", { "class": "quadretti", x1: i, y1: 0, x2: i, y2: stanza.h })); }
    for (i = 50; i < stanza.h; i += 50) { pianta.appendChild(svg("line", { "class": "quadretti", x1: 0, y1: i, x2: stanza.w, y2: i })); }
    strato = svg("g", { "clip-path": "url(#bagno-dentro)" });
    pianta.appendChild(strato);
    pianta.appendChild(svg("rect", { "class": "muro", x: -3.5, y: -3.5, width: stanza.w + 7, height: stanza.h + 7 }));
    var p = stanza.porta;   // la porta è sempre sulla parete in basso e si apre verso l'interno
    pianta.appendChild(svg("line", { "class": "varco", x1: p.pos, y1: stanza.h + 3.5, x2: p.pos + p.larghezza, y2: stanza.h + 3.5 }));
    pianta.appendChild(svg("line", { "class": "anta", x1: p.pos, y1: stanza.h, x2: p.pos, y2: stanza.h - p.larghezza }));
    pianta.appendChild(svg("path", { "class": "anta-arco", d: "M" + p.pos + " " + (stanza.h - p.larghezza) + "A" + p.larghezza + " " + p.larghezza + " 0 0 1 " + (p.pos + p.larghezza) + " " + stanza.h }));
    var testoPorta = svg("text", { "class": "misura", x: p.pos + p.larghezza / 2, y: stanza.h + 16 });
    testoPorta.textContent = "porta";
    pianta.appendChild(testoPorta);
    var larga = svg("text", { "class": "misura", x: stanza.w / 2, y: -11 });
    larga.textContent = (stanza.w / 100).toFixed(2).replace(".", ",") + " m";
    pianta.appendChild(larga);
    var alta = svg("text", { "class": "misura", x: -11, y: stanza.h / 2, transform: "rotate(-90 -11 " + (stanza.h / 2) + ")" });
    alta.textContent = (stanza.h / 100).toFixed(2).replace(".", ",") + " m";
    pianta.appendChild(alta);

    gruppi = {};
    pezzi.forEach(function (pz) {
      var g = svg("g", { "class": "pezzo pezzo-" + pz.tipo, tabindex: "0", role: "button", "data-pezzo": pz.tipo });
      g.appendChild(svg("rect", { "class": "alone" }));
      g.appendChild(svg("rect", { "class": "forma" }));
      g.appendChild(svg("path", { "class": "dettaglio" }));
      var nome = svg("text", { "class": "nome" });
      nome.textContent = B.MISURE[pz.tipo].nome;
      g.appendChild(nome);
      pianta.appendChild(g);
      gruppi[pz.tipo] = g;
    });
  }

  /* il disegno dentro ogni pezzo, sempre centrato: così vale per tutte le pareti */
  function dettaglio(tipo, w, h) {
    var cx = w / 2, cy = h / 2, rx = w * 0.3, ry = h * 0.3;
    if (tipo === "doccia") { return "M4 4L" + (w - 4) + " " + (h - 4) + "M" + (w - 4) + " 4L4 " + (h - 4); }
    var ovale = "M" + (cx - rx) + " " + cy + "a" + rx + " " + ry + " 0 1 0 " + (2 * rx) + " 0a" + rx + " " + ry + " 0 1 0 " + (-2 * rx) + " 0";
    return ovale;
  }

  function aggiorna(annuncia) {
    var esito = B.valuta(stanza, pezzi);
    strato.replaceChildren();
    esito.zone.forEach(function (z) {
      strato.appendChild(svg("rect", { "class": "zona" + (z.ok ? "" : " stretta"), x: z.r.x, y: z.r.y, width: z.r.w, height: z.r.h }));
    });
    var colpevoli = {};
    esito.voci.forEach(function (v) { if (!v.ok) { v.pezzi.forEach(function (t) { colpevoli[t] = true; }); } });
    pezzi.forEach(function (pz) {
      var r = esito.rettangoli[pz.tipo], g = gruppi[pz.tipo];
      g.setAttribute("transform", "translate(" + r.x + " " + r.y + ")");
      g.classList.toggle("errore", !!colpevoli[pz.tipo]);
      g.classList.toggle("scelto", pz.tipo === scelto);
      var forma = g.querySelector(".forma"), alone = g.querySelector(".alone"), nome = g.querySelector(".nome");
      forma.setAttribute("width", r.w); forma.setAttribute("height", r.h);
      forma.setAttribute("rx", pz.tipo === "doccia" ? 2 : pz.tipo === "lavabo" ? 6 : 12);
      alone.setAttribute("x", -3); alone.setAttribute("y", -3); alone.setAttribute("width", r.w + 6); alone.setAttribute("height", r.h + 6); alone.setAttribute("rx", 6);
      g.querySelector(".dettaglio").setAttribute("d", dettaglio(pz.tipo, r.w, r.h));
      nome.setAttribute("x", r.w / 2); nome.setAttribute("y", r.h / 2);
      g.setAttribute("aria-label", B.MISURE[pz.tipo].nome + ": parete " + B.NOMI_PARETI[pz.parete] + ", a " + pz.pos + " centimetri dall'angolo" +
        (colpevoli[pz.tipo] ? ". Da sistemare" : "") + ". Frecce per spostare, Spazio per cambiare parete.");
    });

    Object.keys(elenchi).forEach(function (gruppo) {
      elenchi[gruppo].replaceChildren.apply(elenchi[gruppo], esito.voci.filter(function (v) { return v.gruppo === gruppo; }).map(function (v) {
        var li = document.createElement("li"), testo = document.createElement("span"), quanto = document.createElement("span");
        li.className = v.ok ? "si" : "no";
        testo.textContent = v.testo + (v.serve ? ": almeno " + v.serve + " cm" : "");
        quanto.className = "quanto";
        quanto.textContent = v.serve ? "ora " + v.misura + " cm" : (v.ok ? "sì" : "no");
        var segno = icona(v.ok ? "spunta" : "chiudi");
        segno.setAttribute("aria-label", v.ok ? "A posto" : "Da sistemare");
        segno.removeAttribute("aria-hidden");
        segno.setAttribute("role", "img");
        li.appendChild(segno); li.appendChild(testo); li.appendChild(quanto);
        return li;
      }));
    });

    var daSistemare = esito.voci.filter(function (v) { return v.gruppo === "funziona" && !v.ok; }).length;
    var stato = !esito.ciSta ? "rosso" : esito.funziona ? "verde" : "ambra";
    verdetto.className = "verdetto " + stato;
    verdettoIcona.replaceChildren(icona(stato === "verde" ? "spunta" : stato === "rosso" ? "chiudi" : "attenzione"));
    verdettoCosa.textContent = stato === "rosso" ? "Non ci sta." : stato === "verde" ? "Ci sta. E funziona!" : "Ci sta. Ma non funziona.";
    verdettoCome.textContent = stato === "rosso" ? "Qualcosa si sovrappone o blocca la porta." :
      stato === "verde" ? "«Ci sta» non basta. «Ci sto» è meglio: qui ci si muove senza acrobazie." :
      (daSistemare === 1 ? "Manca una misura sola." : "Mancano " + daSistemare + " misure.") + " In rosso i pezzi da spostare.";
    prossimo.hidden = !(esito.funziona && livello < B.LIVELLI.length - 1);
    sceltoNome.textContent = "Pezzo scelto: " + B.MISURE[scelto].nome + ".";
    if (annuncia) { annuncio.textContent = verdettoCosa.textContent + " " + verdettoCome.textContent; }
  }

  function carica(n, disposizione) {
    livello = n;
    stanza = B.LIVELLI[n].stanza;
    pezzi = (disposizione || B.LIVELLI[n].pezzi).map(function (p) { return { tipo: p.tipo, parete: p.parete, pos: p.pos }; });
    sotto.textContent = B.LIVELLI[n].sotto + ".";
    Array.prototype.forEach.call(scatola.querySelectorAll("[data-livello]"), function (b) {
      b.setAttribute("aria-pressed", Number(b.getAttribute("data-livello")) === n ? "true" : "false");
    });
    disegnaStanza();
    aggiorna(false);
  }

  function sposta(tipo, parete, pos) {
    var nuovo = B.limita(stanza, { tipo: tipo, parete: parete, pos: pos }), p = trova(tipo);
    p.parete = nuovo.parete; p.pos = nuovo.pos;
  }
  function gira(tipo) {
    var p = trova(tipo);
    sposta(tipo, B.PARETI[(B.PARETI.indexOf(p.parete) + 1) % 4], p.pos);
  }

  /* dove si trova il puntatore, in centimetri della stanza */
  function punto(evento) {
    var p = pianta.createSVGPoint();
    p.x = evento.clientX; p.y = evento.clientY;
    return p.matrixTransform(pianta.getScreenCTM().inverse());
  }
  pianta.addEventListener("pointerdown", function (evento) {
    var g = evento.target.closest("[data-pezzo]");
    if (!g || evento.button) { return; }
    scelto = g.getAttribute("data-pezzo");
    presa = scelto;
    g.classList.add("presa");
    g.setPointerCapture(evento.pointerId);
    g.focus({ preventScroll: true });
    aggiorna(false);
    evento.preventDefault();
  });
  pianta.addEventListener("pointermove", function (evento) {
    if (!presa) { return; }
    var p = punto(evento), pz = trova(presa);
    var distanze = { N: p.y, S: stanza.h - p.y, O: p.x, E: stanza.w - p.x };
    var parete = pz.parete;
    B.PARETI.forEach(function (k) { if (distanze[k] < distanze[parete] - 12) { parete = k; } });   // un po' di attrito: la parete non cambia per un tremolio
    var lungo = parete === "N" || parete === "S" ? p.x : p.y;
    sposta(presa, parete, lungo - B.MISURE[presa].larghezza / 2);
    aggiorna(false);
  });
  function lascia() {
    if (!presa) { return; }
    gruppi[presa].classList.remove("presa");
    presa = null;
    aggiorna(true);
  }
  pianta.addEventListener("pointerup", lascia);
  pianta.addEventListener("pointercancel", lascia);

  pianta.addEventListener("focusin", function (evento) {
    var g = evento.target.closest("[data-pezzo]");
    if (g && g.getAttribute("data-pezzo") !== scelto) { scelto = g.getAttribute("data-pezzo"); aggiorna(false); }
  });
  pianta.addEventListener("keydown", function (evento) {
    var g = evento.target.closest("[data-pezzo]");
    if (!g) { return; }
    var tipo = g.getAttribute("data-pezzo"), p = trova(tipo), passo = evento.shiftKey ? 20 : 5;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") { sposta(tipo, p.parete, p.pos - passo); }
    else if (evento.key === "ArrowRight" || evento.key === "ArrowDown") { sposta(tipo, p.parete, p.pos + passo); }
    else if (evento.key === " " || evento.key === "Enter") { gira(tipo); }
    else { return; }
    evento.preventDefault();
    aggiorna(true);
  });

  scatola.addEventListener("click", function (evento) {
    var b = evento.target.closest("button");
    if (!b) { return; }
    if (b.hasAttribute("data-livello")) { carica(Number(b.getAttribute("data-livello"))); }
    else if (b.hasAttribute("data-muovi")) { var p = trova(scelto); sposta(scelto, p.parete, p.pos + 5 * Number(b.getAttribute("data-muovi"))); aggiorna(true); }
    else if (b.hasAttribute("data-gira")) { gira(scelto); aggiorna(true); }
    else if (b.hasAttribute("data-ricomincia")) { carica(livello); annuncio.textContent = "Livello ricominciato."; }
    else if (b.hasAttribute("data-soluzione")) { carica(livello, B.LIVELLI[livello].soluzione); annuncio.textContent = "Ecco una disposizione che funziona."; }
    else if (b.hasAttribute("data-prossimo")) { carica(livello + 1); scatola.scrollIntoView({ block: "start" }); }
  });

  carica(0);
})();
