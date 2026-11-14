/* «Cassetta degli attrezzi»: legge i numeri, fa i conti (attrezzi-logica.js) e scrive il risultato in parole. */
(function () {
  "use strict";
  var A = window.MDB && window.MDB.attrezzi;
  var cassetta = document.querySelector("[data-attrezzi]");
  if (!A || !cassetta) { return; }
  var n = A.numero;

  function icona(nome) { return document.querySelector('template[data-icona="' + nome + '"]').content.firstElementChild.cloneNode(true); }
  function campo(scatola, nome) { return scatola.querySelector('[data-campo="' + nome + '"]'); }
  function valore(scatola, nome) { return A.leggi(campo(scatola, nome).value); }
  function scrivi(scatola, numero, spiega, stato, verdetto) {
    var conto = scatola.querySelector("[data-conto]"), riga = scatola.querySelector("[data-verdetto]");
    conto.className = "conto" + (stato ? " " + stato : "");
    scatola.querySelector("[data-numero]").textContent = numero;
    scatola.querySelector("[data-spiega]").textContent = spiega;
    if (riga) {
      riga.replaceChildren();
      if (verdetto) { riga.appendChild(icona(stato === "bene" ? "spunta" : "chiudi")); riga.appendChild(document.createTextNode(verdetto)); }
    }
  }
  function manca(scatola) { scrivi(scatola, "…", "Scrivi un numero e faccio il conto.", "", ""); }
  function centinaia(v) { return n(Math.round(v / 100) * 100); }

  var CONTI = {
    cuscinetto: function (s) {
      var b = valore(s, "budget");
      if (!(b > 0)) { return manca(s); }
      var c = A.cuscinetto(b);
      scrivi(s, "Da " + centinaia(c.progettoDa) + " a " + centinaia(c.progettoA) + " €",
        "È quanto può costare il progetto. Il resto, tra " + centinaia(c.margineDa) + " e " + centinaia(c.margineA) +
        " €, è il cuscinetto: se servirà sarai attrezzato, se non servirà avrai un finale migliore del previsto.");
    },
    pendenza: function (s) {
      var m = valore(s, "metri"), t = valore(s, "tubo");
      if (!(m > 0)) { return manca(s); }
      var p = A.pendenza(m, t > 0 ? t : 0);
      if (t > 0) {
        scrivi(s, "Circa " + n(p.totale, p.totale % 1 ? 1 : 0) + " cm", "Sotto il pavimento servono " + n(p.dislivello, p.dislivello % 1 ? 1 : 0) +
          " cm di pendenza più " + n(t, t % 1 ? 1 : 0) + " cm di tubo, oltre allo spessore del pavimento. Se per farcela servono gradini improbabili, non stai rinunciando a un'idea: stai evitando un incubo a occhi aperti.");
      } else {
        scrivi(s, "Circa " + n(p.dislivello, p.dislivello % 1 ? 1 : 0) + " cm", "Di sola pendenza. A questi va sempre sommato lo spessore del tubo, più quello del pavimento.");
      }
    },
    luce: function (s) {
      var pav = valore(s, "pavimento"), l = valore(s, "larga"), h = valore(s, "alta");
      if (!(pav > 0) || !(l > 0) || !(h > 0)) { return manca(s); }
      var r = A.luceNaturale(pav, l * h);
      if (r.basta) {
        scrivi(s, n(l * h, 2) + " m² di finestra", "Ne servono almeno " + n(r.serve, 2) + " (un ottavo di " + n(pav, pav % 1 ? 1 : 0) + " m²).", "bene", "Ci siamo");
      } else {
        scrivi(s, "Mancano " + n(r.manca, 2) + " m²", "La finestra è di " + n(l * h, 2) + " m², ne servono almeno " + n(r.serve, 2) +
          ". Non tutti gli spazi possono diventare tutto: qui si infrangono molti sogni, con largo anticipo.", "male", "Non basta");
      }
    },
    lumen: function (s) {
      var mq = valore(s, "mq"), tipo = campo(s, "tipo").value;
      if (!(mq > 0)) { return manca(s); }
      var r = A.lumen(tipo, mq, campo(s, "scuro").checked, campo(s, "alto").checked);
      var calda = tipo === "camera" || tipo === "soggiorno";
      scrivi(s, "Da " + centinaia(r.da) + " a " + centinaia(r.a) + " lumen",
        A.LUX[tipo].nome + ": " + A.LUX[tipo].da + "-" + A.LUX[tipo].a + " lux consigliati. " +
        (calda ? "Qui si scelgono spesso luci calde o medio-calde, tra 2.700 e 3.500 K." : "Qui può essere utile una luce più neutra, intorno ai 4.000 K."));
    },
    piano: function (s) {
      var g = valore(s, "gomito");
      if (!(g > 40)) { return manca(s); }
      var r = A.pianoCucina(g);
      scrivi(s, "Tra " + n(r.da) + " e " + n(r.a) + " cm", "È l'altezza indicativa del piano di lavoro finito: zoccolo, base e top compresi.");
    }
  };

  Array.prototype.forEach.call(cassetta.querySelectorAll("[data-attrezzo]"), function (scatola) {
    var conto = CONTI[scatola.getAttribute("data-attrezzo")];
    function fai() { conto(scatola); }
    scatola.addEventListener("input", fai);
    scatola.addEventListener("change", fai);
    fai();
  });
})();
