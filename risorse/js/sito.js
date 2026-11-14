/* Comportamenti comuni a tutte le pagine. Tutto è un miglioramento: senza JavaScript il sito si legge lo stesso. */
(function () {
  "use strict";
  var radice = document.documentElement;
  var pocoMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Aperto con un doppio clic (file://) il browser non sa che «portfolio/» vuol dire «portfolio/index.html». */
  if (window.location.protocol === "file:") {
    Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (a) {
      var h = a.getAttribute("href");
      if (/^(https?:|mailto:|tel:|#)/.test(h)) { return; }
      var pezzi = h.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
      if (pezzi && (pezzi[1] === "" || /\/$/.test(pezzi[1]) || pezzi[1] === "." || pezzi[1] === "..")) {
        a.setAttribute("href", pezzi[1].replace(/\/?$/, "/") + "index.html" + (pezzi[2] || "") + (pezzi[3] || ""));
      }
    });
  }

  /* Tema chiaro e scuro */
  var tasto = document.querySelector("[data-tema]");
  function aggiornaTasto() {
    if (tasto) { tasto.setAttribute("aria-pressed", radice.getAttribute("data-theme") === "dark" ? "true" : "false"); }
  }
  if (tasto) {
    aggiornaTasto();
    tasto.addEventListener("click", function () {
      var scuro = radice.getAttribute("data-theme") !== "dark";
      radice.setAttribute("data-theme", scuro ? "dark" : "light");
      try { window.localStorage.setItem("mdb-tema", scuro ? "scuro" : "chiaro"); } catch (errore) { /* pazienza */ }
      aggiornaTasto();
      document.dispatchEvent(new CustomEvent("mdb:tema"));
    });
  }

  /* Comparse allo scorrimento: solo opacità e spostamento, e solo se il movimento è gradito */
  var daMostrare = document.querySelectorAll(".entra");
  if (pocoMovimento || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(daMostrare, function (el) { el.classList.add("visto"); });
  } else {
    var osservatore = new IntersectionObserver(function (voci) {
      var ordine = 0;
      voci.forEach(function (voce) {
        if (!voce.isIntersecting) { return; }
        voce.target.style.setProperty("--ritardo", (ordine * 0.08) + "s");
        voce.target.classList.add("visto");
        osservatore.unobserve(voce.target);
        ordine += 1;
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(daMostrare, function (el) { osservatore.observe(el); });
  }

  /* «Un'altra regola»: le regole del cantiere, una alla volta, mai due volte di fila la stessa */
  var scatola = document.querySelector("[data-regola]");
  var dati = document.getElementById("dati-regole");
  if (scatola && dati) {
    var regole = JSON.parse(dati.textContent);
    var testo = scatola.querySelector("[data-regola-testo]");
    var fonte = scatola.querySelector("[data-regola-fonte]");
    var indice = 0;
    scatola.querySelector("[data-regola-altra]").addEventListener("click", function () {
      var nuovo = indice;
      while (nuovo === indice) { nuovo = Math.floor(Math.random() * regole.length); }
      indice = nuovo;
      testo.textContent = "«" + regole[indice].t + "»";
      fonte.textContent = "Dal libro, " + (regole[indice].dove || "p. " + regole[indice].p);
    });
    testo.setAttribute("aria-live", "polite");
  }
})();
