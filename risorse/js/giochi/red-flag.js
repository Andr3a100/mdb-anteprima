/* «Red flag o tutto ok?»: otto frasi dal libro, due risposte possibili. Si gioca con i pulsanti, con la tastiera o
   trascinando la carta (a sinistra red flag, a destra tutto ok). */
(function () {
  "use strict";
  var scatola = document.querySelector("[data-quiz]");
  var dati = document.getElementById("dati-quiz");
  if (!scatola || !dati) { return; }
  var tutte = JSON.parse(dati.textContent);
  var QUANTE = 8, ROSSE = 5;
  function el(nome) { return scatola.querySelector("[data-" + nome + "]"); }
  var partita = el("partita"), passo = el("passo"), barra = el("barra"), punti = el("punti"), carta = el("carta"), frase = el("frase"),
    scelte = el("scelte"), esito = el("esito"), verdetto = el("verdetto"), perche = el("perche"), fonte = el("fonte"), avanti = el("avanti"),
    fine = el("fine"), voto = el("voto"), titoloFine = el("titolo-fine"), testoFine = el("testo-fine"), riepilogo = el("riepilogo"),
    record = el("record"), ancora = el("ancora"), suggerimento = el("suggerimento"), timbroRosso = el("timbro-rosso"), timbroVerde = el("timbro-verde");
  var pocoMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mazzo = [], indice = 0, giuste = 0, risposte = [], risposto = false;

  function icona(nome) { return document.querySelector('template[data-icona="' + nome + '"]').content.firstElementChild.cloneNode(true); }
  function mescola(lista) {
    var a = lista.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function nuovoMazzo() {
    var rosse = mescola(tutte.filter(function (f) { return f.flag; })).slice(0, ROSSE);
    var verdi = mescola(tutte.filter(function (f) { return !f.flag; })).slice(0, QUANTE - ROSSE);
    return mescola(rosse.concat(verdi));
  }

  function mostra() {
    risposto = false;
    var f = mazzo[indice];
    passo.textContent = "Frase " + (indice + 1) + " di " + QUANTE;
    barra.style.transform = "scaleX(" + (indice / QUANTE) + ")";
    punti.textContent = giuste;
    frase.textContent = "«" + f.frase + "»";
    carta.classList.remove("risposta-data");
    carta.style.transform = "";
    timbroRosso.style.opacity = 0;
    timbroVerde.style.opacity = 0;
    esito.hidden = true;
    scelte.hidden = false;
    suggerimento.hidden = indice > 0;
  }

  function rispondi(dettoFlag) {
    if (risposto) { return; }
    risposto = true;
    var f = mazzo[indice], giusta = dettoFlag === f.flag;
    giuste += giusta ? 1 : 0;
    risposte.push(giusta);
    punti.textContent = giuste;
    barra.style.transform = "scaleX(" + ((indice + 1) / QUANTE) + ")";
    carta.classList.add("risposta-data");
    carta.style.transform = "";
    timbroRosso.style.opacity = f.flag ? 1 : 0;
    timbroVerde.style.opacity = f.flag ? 0 : 1;
    verdetto.className = "stato " + (giusta ? "stato-verde" : "stato-rosso");
    verdetto.replaceChildren(icona(giusta ? "spunta" : "chiudi"), document.createTextNode((giusta ? "Giusto: " : "Sbagliato: ") + (f.flag ? "è un red flag" : "è tutto ok")));
    perche.textContent = f.perche;
    fonte.textContent = "Dal libro, " + (f.dove || "p. " + f.p);
    avanti.firstChild.textContent = indice + 1 < QUANTE ? "Prossima frase " : "Guarda com'è andata ";
    scelte.hidden = true;
    suggerimento.hidden = true;
    esito.hidden = false;
    avanti.focus();
  }

  function finisci() {
    var testi = [
      [8, "Capocantiere onorario", "Otto su otto. Puoi presentarti in cantiere con il caschetto: nessuno ti venderà un «già che ci siamo»."],
      [6, "Occhio da progettista", "Quasi tutto giusto. Qualche frase ti ha fregato: succede, sono fatte apposta per sembrare ragionevoli."],
      [4, "Apprendista con il caschetto", "Metà e metà. Il fiuto c'è, manca l'allenamento: rigioca, le frasi cambiano a ogni partita."],
      [0, "Bersaglio preferito del «già che ci siamo»", "Niente paura: è esattamente per questo che esistono i progettisti."]
    ];
    var scelto = testi.filter(function (t) { return giuste >= t[0]; })[0];
    voto.textContent = giuste + "/" + QUANTE;
    titoloFine.textContent = scelto[1];
    testoFine.textContent = scelto[2];
    riepilogo.replaceChildren.apply(riepilogo, risposte.map(function (giusta, i) {
      var li = document.createElement("li");
      li.className = giusta ? "giusta" : "sbagliata";
      li.setAttribute("aria-label", "Frase " + (i + 1) + ": " + (giusta ? "giusta" : "sbagliata"));
      li.appendChild(icona(giusta ? "spunta" : "chiudi"));
      return li;
    }));
    var migliore = 0;
    try { migliore = Number(window.localStorage.getItem("mdb-red-flag")) || 0; } catch (errore) { /* memoria non disponibile */ }
    if (giuste > migliore) {
      record.textContent = migliore ? "Nuovo record: prima eri a " + migliore + " su " + QUANTE + "." : "";
      try { window.localStorage.setItem("mdb-red-flag", String(giuste)); } catch (errore) { /* pazienza */ }
    } else {
      record.textContent = "Il tuo record resta " + migliore + " su " + QUANTE + ".";
    }
    partita.hidden = true;
    fine.hidden = false;
    titoloFine.focus();
  }

  function comincia() {
    mazzo = nuovoMazzo();
    indice = 0; giuste = 0; risposte = [];
    fine.hidden = true;
    partita.hidden = false;
    mostra();
  }

  scelte.addEventListener("click", function (evento) {
    var b = evento.target.closest("[data-risposta]");
    if (b) { rispondi(b.getAttribute("data-risposta") === "flag"); }
  });
  avanti.addEventListener("click", function () {
    indice += 1;
    if (indice >= QUANTE) { finisci(); return; }
    mostra();
    frase.focus();
  });
  ancora.addEventListener("click", function () { comincia(); frase.focus(); });

  /* trascinare la carta: solo spostamento e rotazione, e la carta torna al suo posto da sola */
  var partenza = null;
  carta.addEventListener("pointerdown", function (evento) {
    if (risposto || evento.button) { return; }
    partenza = evento.clientX;
    carta.classList.add("presa");
    carta.setPointerCapture(evento.pointerId);
  });
  carta.addEventListener("pointermove", function (evento) {
    if (partenza === null) { return; }
    var dx = evento.clientX - partenza;
    carta.style.transform = "translateX(" + dx + "px) rotate(" + (pocoMovimento ? 0 : dx / 22) + "deg)";
    timbroRosso.style.opacity = Math.max(0, Math.min(1, -dx / 90));
    timbroVerde.style.opacity = Math.max(0, Math.min(1, dx / 90));
  });
  function lascia(evento) {
    if (partenza === null) { return; }
    var dx = evento.clientX - partenza;
    partenza = null;
    carta.classList.remove("presa");
    if (Math.abs(dx) > 90) { rispondi(dx < 0); return; }
    carta.style.transform = "";
    timbroRosso.style.opacity = 0;
    timbroVerde.style.opacity = 0;
  }
  carta.addEventListener("pointerup", lascia);
  carta.addEventListener("pointercancel", lascia);

  comincia();
})();
