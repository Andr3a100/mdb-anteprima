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

  /* La testata parte alta e si stringe appena si scorre: lo dice una «vedetta» in cima alla pagina */
  var testata = document.querySelector("[data-testata]"), vedetta = document.querySelector("[data-vedetta]");
  if (testata && vedetta && "IntersectionObserver" in window) {
    new IntersectionObserver(function (voci) { testata.classList.toggle("stretta", !voci[0].isIntersecting); }).observe(vedetta);
  }

  /* Il menu sul telefono: un pannello che si apre dal pulsante, si chiude con Esc, con un tocco su una voce o tornando
     a uno schermo largo; mentre è aperto la pagina sotto non scorre */
  var apriMenu = document.querySelector("[data-menu-apri]"), parolaMenu = document.querySelector("[data-menu-parola]");
  function menu(aperto) {
    radice.classList.toggle("menu-aperto", aperto);
    apriMenu.setAttribute("aria-expanded", aperto ? "true" : "false");
    if (parolaMenu) { parolaMenu.textContent = aperto ? "Chiudi il menu" : "Apri il menu"; }
  }
  if (apriMenu) {
    apriMenu.addEventListener("click", function () { menu(!radice.classList.contains("menu-aperto")); });
    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && radice.classList.contains("menu-aperto")) { menu(false); apriMenu.focus(); }
    });
    var pannello = document.getElementById("menu");
    if (pannello) { pannello.addEventListener("click", function (evento) { if (evento.target.closest && evento.target.closest("a")) { menu(false); } }); }
    if (window.matchMedia) {
      var largo = window.matchMedia("(min-width: 821px)");
      var seLargo = function () { if (largo.matches) { menu(false); } };
      if (largo.addEventListener) { largo.addEventListener("change", seLargo); } else if (largo.addListener) { largo.addListener(seLargo); }
    }
  }

  /* Le fotografie dell'apertura si possono fermare */
  var scena = document.querySelector("[data-scena]"), fermaScena = document.querySelector("[data-scena-ferma]");
  if (scena && fermaScena) {
    fermaScena.addEventListener("click", function () {
      var fermata = !scena.classList.contains("ferma");
      scena.classList.toggle("ferma", fermata);
      fermaScena.setAttribute("aria-pressed", fermata ? "true" : "false");
      fermaScena.setAttribute("aria-label", fermata ? "Fai ripartire le fotografie" : "Ferma le fotografie che scorrono");
    });
  }
})();
