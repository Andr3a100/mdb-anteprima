/* Il disegno d'apertura: un filo aggrovigliato che, tirato, diventa una casa (è il disegno di copertina del libro).
   Il groviglio e la casa sono la stessa linea, con gli stessi punti: il cursore decide quanto è «tirata».
   Con «Riduci movimento» non parte niente da solo: resta la casa, e il cursore funziona lo stesso. */
(function () {
  "use strict";
  var scatola = document.querySelector("[data-groviglio]");
  if (!scatola) { return; }
  var filo = scatola.querySelector("[data-filo]");
  var porta = scatola.querySelector("[data-porta]");
  var telaio = scatola.querySelector("[data-telaio]");
  var guide = scatola.querySelector("[data-guide]");
  var cursore = scatola.querySelector("[data-cursore]");
  var detto = scatola.querySelector("[data-detto]");
  var pocoMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var N = 700;       // punti della linea
  var SFASO = 1.15;  // quanto il capo sinistro del filo si scioglie prima del destro

  /* la casa in una sola linea: terreno, muro, gronda, colmo, gronda, muro, terreno */
  var CASA = [[20, 400], [190, 400], [190, 250], [172, 268], [300, 140], [428, 268], [410, 250], [410, 400], [580, 400]];

  function lungoLaLinea(vertici, quanti) {
    var tratti = [], totale = 0, punti = [], i, dx, dy;
    for (i = 1; i < vertici.length; i++) {
      dx = vertici[i][0] - vertici[i - 1][0];
      dy = vertici[i][1] - vertici[i - 1][1];
      tratti.push(Math.sqrt(dx * dx + dy * dy));
      totale += tratti[i - 1];
    }
    for (i = 0; i < quanti; i++) {
      var d = totale * i / (quanti - 1), k = 0;
      while (k < tratti.length - 1 && d > tratti[k]) { d -= tratti[k]; k++; }
      var f = tratti[k] ? Math.min(1, d / tratti[k]) : 0;
      punti.push([vertici[k][0] + (vertici[k + 1][0] - vertici[k][0]) * f, vertici[k][1] + (vertici[k + 1][1] - vertici[k][1]) * f]);
    }
    return punti;
  }

  /* numeri «a caso» ma sempre uguali: il groviglio è lo stesso a ogni visita */
  function dado(seme) {
    return function () {
      seme = (seme + 0x6D2B79F5) | 0;
      var t = Math.imul(seme ^ (seme >>> 15), 1 | seme);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function liscio(v) { v = v < 0 ? 0 : v > 1 ? 1 : v; return v * v * (3 - 2 * v); }

  var casa = lungoLaLinea(CASA, N);
  var tira = dado(20261114), fasi = [], gomitolo = [], i;
  for (i = 0; i < 8; i++) { fasi.push(tira() * Math.PI * 2); }
  for (i = 0; i < N; i++) {
    var u = i / (N - 1), a = u * Math.PI * 2 * 21;
    var respiro = 0.6 + 0.4 * Math.sin(a * 0.071 + fasi[0]);
    var x = 300 + 168 * respiro * (0.62 * Math.sin(a + fasi[1]) + 0.26 * Math.sin(a * 0.413 + fasi[2]) + 0.16 * Math.sin(a * 2.31 + fasi[3]));
    var y = 262 + 122 * respiro * (0.62 * Math.cos(a * 0.93 + fasi[4]) + 0.26 * Math.cos(a * 0.557 + fasi[5]) + 0.16 * Math.sin(a * 1.73 + fasi[6]));
    var capo = liscio(Math.min(u / 0.07, (1 - u) / 0.07));  // i due capi del filo restano fuori dal gomitolo
    gomitolo.push([casa[i][0] + (x - casa[i][0]) * capo, casa[i][1] + (y - casa[i][1]) * capo]);
  }

  var FRASI = [
    [0.12, "Il groviglio: idee, misure, preventivi e «già che ci siamo»."],
    [0.5, "Si tira un filo alla volta. Prima la carta."],
    [0.93, "Poi la polvere. Ci siamo quasi."],
    [2, "Ecco: una casa. E la porta è rossa."]
  ];
  var fraseOra = "";

  function disegna(t) {
    var punti = new Array(N), q, k;
    for (k = 0; k < N; k++) {
      q = liscio(t * (1 + SFASO) - (k / (N - 1)) * SFASO);
      punti[k] = [gomitolo[k][0] + (casa[k][0] - gomitolo[k][0]) * q, gomitolo[k][1] + (casa[k][1] - gomitolo[k][1]) * q];
    }
    var d = "M" + punti[0][0].toFixed(1) + " " + punti[0][1].toFixed(1);
    for (k = 1; k < N - 1; k++) {
      d += "Q" + punti[k][0].toFixed(1) + " " + punti[k][1].toFixed(1) + " " +
        ((punti[k][0] + punti[k + 1][0]) / 2).toFixed(1) + " " + ((punti[k][1] + punti[k + 1][1]) / 2).toFixed(1);
    }
    d += "L" + punti[N - 1][0].toFixed(1) + " " + punti[N - 1][1].toFixed(1);
    filo.setAttribute("d", d);
    var fine = liscio((t - 0.86) / 0.14);
    porta.style.opacity = fine;
    telaio.style.opacity = fine;
    guide.style.opacity = liscio((t - 0.55) / 0.45) * 0.6;
    for (k = 0; k < FRASI.length; k++) {
      if (t <= FRASI[k][0]) {
        if (FRASI[k][1] !== fraseOra) { fraseOra = FRASI[k][1]; detto.textContent = fraseOra; }
        break;
      }
    }
    cursore.setAttribute("aria-valuetext", t < 0.12 ? "groviglio" : t < 0.93 ? "il filo si scioglie" : "casa");
  }

  var animazione = 0;
  function ferma() { if (animazione) { window.cancelAnimationFrame(animazione); animazione = 0; } }
  cursore.addEventListener("input", function () { ferma(); disegna(cursore.value / 100); });
  cursore.addEventListener("pointerdown", ferma);
  cursore.addEventListener("keydown", ferma);

  if (pocoMovimento) {
    disegna(1);
    return;
  }
  /* la prima volta il filo si scioglie da solo, una volta, e poi il cursore è di chi guarda */
  disegna(0);
  cursore.value = 0;
  var inizio = 0, DURATA = 3600, ATTESA = 700;
  function passo(ora) {
    if (!inizio) { inizio = ora + ATTESA; }
    var p = (ora - inizio) / DURATA;
    if (p < 0) { animazione = window.requestAnimationFrame(passo); return; }
    if (p > 1) { p = 1; }
    var t = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    cursore.value = Math.round(t * 100);
    disegna(t);
    animazione = p < 1 ? window.requestAnimationFrame(passo) : 0;
  }
  animazione = window.requestAnimationFrame(passo);
})();
